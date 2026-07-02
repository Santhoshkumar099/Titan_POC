"""
SearchEngine — the live query pipeline.

    query image ──┬── DINOv2 embed (thread pool)   ─┐
                  └── Gemini attr predict (async)  ─┴─► build query vector
                                                         ► FAISS search (top N)
                                                         ► attr match (Gemini vs catalog)
                                                         ► hybrid re-rank → top 5
"""
from __future__ import annotations

import asyncio
import io
import json
from concurrent.futures import ThreadPoolExecutor

import faiss
import numpy as np
import pandas as pd
import torch
from PIL import Image, ImageOps
from transformers import AutoImageProcessor, AutoModel

from app import config
from app import gemini_client

# Single-worker pool keeps concurrent torch inference safe on one device.
_dino_executor = ThreadPoolExecutor(max_workers=1, thread_name_prefix="dinov2")


def _clean(value):
    """Convert pandas NaN / numpy types into JSON-safe Python values."""
    try:
        if value is None or pd.isna(value):
            return None
    except (TypeError, ValueError):
        pass
    if isinstance(value, (np.floating,)):
        return float(value)
    if isinstance(value, (np.integer,)):
        return int(value)
    return value


class SearchEngine:
    def __init__(self):
        self.device = "cuda" if torch.cuda.is_available() else "cpu"

        # DINOv2 — same model used during ingestion
        self.processor = AutoImageProcessor.from_pretrained(config.MODEL_NAME)
        self.model = AutoModel.from_pretrained(config.MODEL_NAME).to(self.device).eval()

        # FAISS index + aligned metadata + index config
        self.index = faiss.read_index(str(config.INDEX_PATH))
        self.df = pd.read_csv(config.METADATA_PATH)
        with open(config.CONFIG_PATH, encoding="utf-8") as f:
            self.cfg = json.load(f)

        assert len(self.df) == self.index.ntotal, "metadata / index size mismatch"

        # Raw 768-dim visual embeddings — used to compute pure visual cosine sim
        self.visual_embeddings = np.load(str(config.VISUAL_EMBEDDINGS_PATH))

    # ── helpers ──────────────────────────────────────────────────────────
    @staticmethod
    def _safe_norm(v: np.ndarray) -> np.ndarray:
        n = np.linalg.norm(v)
        return v / n if n > 0 else v

    def normalize_image(self, pil_img: Image.Image) -> Image.Image:
        """Resize + center-crop to a square — identical to ingestion."""
        img = pil_img.convert("RGB")
        return ImageOps.fit(
            img, (config.IMAGE_SIZE, config.IMAGE_SIZE),
            method=Image.LANCZOS, centering=(0.5, 0.5),
        )

    def embed(self, pil_img: Image.Image) -> np.ndarray:
        """DINOv2 768-dim CLS embedding."""
        inputs = self.processor(images=pil_img, return_tensors="pt")
        inputs = {k: v.to(self.device) for k, v in inputs.items()}
        with torch.no_grad():
            out = self.model(**inputs)
        return out.last_hidden_state[:, 0, :].squeeze().cpu().numpy()

    def _embed_from_bytes(self, image_bytes: bytes) -> np.ndarray:
        """Open → normalize → embed in one call (safe to run in executor)."""
        pil = Image.open(io.BytesIO(image_bytes))
        return self.embed(self.normalize_image(pil))

    def build_query_vector(self, visual_emb: np.ndarray, query_attrs: dict | None = None) -> np.ndarray:
        """Compose [visual | attribute] vector matching the index format."""
        vis = self._safe_norm(visual_emb) * self.cfg["w_visual"]

        attr = np.zeros(self.cfg["attr_dim"])
        if query_attrs:
            offset = 0
            for field in config.ATTR_FIELDS:
                mapping = self.cfg["maps"][field]
                val = query_attrs.get(field)
                if val and val in mapping:
                    attr[offset + mapping[val]] = 1.0
                offset += len(mapping)
            attr = self._safe_norm(attr) * self.cfg["w_attr"]

        qvec = np.concatenate([vis, attr]).astype("float32").reshape(1, -1)
        faiss.normalize_L2(qvec)
        return qvec

    def options(self) -> dict:
        """Available attribute values (used by Gemini prompt + /api/options)."""
        return {f: list(self.cfg["maps"][f].keys()) for f in config.ATTR_FIELDS}

    # ── public API ───────────────────────────────────────────────────────
    async def search(
        self,
        image_bytes: bytes,
        top_candidates: int | None = None,
        top_final: int | None = None,
        weights: dict | None = None,
    ) -> tuple[list[dict], dict]:
        """
        Full async pipeline:
          1. DINOv2 (thread pool) + Gemini Vision (async) run in parallel.
          2. Build composite query vector  [visual | Gemini-attr encoding].
          3. FAISS ANN search → top_candidates.
          4. Attribute match score: Gemini predictions vs candidate metadata.
          5. Hybrid re-rank: α·visual_norm + β·attr_match → top_final.

        Returns (results, gemini_predicted_attrs).
        """
        top_candidates = top_candidates or config.TOP_CANDIDATES
        top_final = top_final or config.TOP_FINAL
        weights = weights or config.DEFAULT_WEIGHTS

        loop = asyncio.get_running_loop()
        valid_opts = self.options()

        # ── 1. DINOv2 + Gemini run concurrently ──────────────────────────
        visual_emb, predicted_attrs = await asyncio.gather(
            loop.run_in_executor(_dino_executor, self._embed_from_bytes, image_bytes),
            gemini_client.predict_attributes(image_bytes, valid_opts),
        )

        # ── 2. Build composite query vector ──────────────────────────────
        qvec = self.build_query_vector(visual_emb, predicted_attrs)

        # ── 3. FAISS ANN search ───────────────────────────────────────────
        k = min(top_candidates, self.index.ntotal)
        scores, indices = self.index.search(qvec, k)

        # ── 4. Attribute match score (Gemini output vs candidate metadata) ─
        query_vis_norm = self._safe_norm(visual_emb)
        rows = []
        for score, idx in zip(scores[0], indices[0]):
            row = self.df.iloc[int(idx)].to_dict()
            row["faiss_score"] = float(score)

            # Pure visual cosine similarity — 1.0 for exact same image
            cat_vis = self._safe_norm(self.visual_embeddings[int(idx)])
            row["visual_sim"] = float(np.dot(query_vis_norm, cat_vis))

            match = 0.0
            if predicted_attrs:
                match = sum(
                    config.ATTR_FIELD_WEIGHTS.get(f, 1 / len(config.ATTR_FIELDS))
                    for f in config.ATTR_FIELDS
                    if predicted_attrs.get(f) and str(row.get(f)) == predicted_attrs[f]
                )
            row["attr_match"] = match
            rows.append(row)

        cand = pd.DataFrame(rows)

        # ── 5a. Category family soft-filter ──────────────────────────────
        # Keep only candidates whose jewellery category belongs to the same
        # family as the Gemini-predicted category (earrings/rings/bangles…).
        # Falls back to the full candidate pool when fewer than top_final items
        # survive, so we never return an empty result set.
        predicted_cat = (predicted_attrs or {}).get("category")
        if predicted_cat:
            pred_family = config.get_category_family(predicted_cat)
            if pred_family not in ("unknown", "general"):
                family_cats = config.CATEGORY_FAMILIES[pred_family]
                filtered = cand[cand["category"].isin(family_cats)]
                if len(filtered) >= top_final:
                    cand = filtered.reset_index(drop=True)

        # ── 5b. Hybrid re-rank using absolute visual similarity ───────────
        # visual_sim is raw cosine (query vs catalog visual embedding) in
        # [0,1].  Unlike relative visual_norm it gives all ranks their true
        # absolute score so ranks 2-5 are not artificially compressed.
        cand["final_score"] = (
            weights["visual"] * cand["visual_sim"]
            + weights["attribute"] * cand["attr_match"]
        )
        top = (cand.sort_values("final_score", ascending=False)
                   .head(top_final).reset_index(drop=True))

        # ── 6. Shape JSON-safe results ────────────────────────────────────
        results = []
        for i, row in top.iterrows():
            img_rel = str(row["normalized_image_path"]).replace("\\", "/")
            results.append({
                "rank":                 int(i) + 1,
                "product_name":         _clean(row.get("product_name")),
                "category":             _clean(row.get("category")),
                "jewellery_type":       _clean(row.get("jewellery_type")),
                "metal_type":           _clean(row.get("metal_type")),
                "material_colour":      _clean(row.get("material_colour")),
                "gender":               _clean(row.get("gender")),
                "occasion":             _clean(row.get("occasion")),
                "collection":           _clean(row.get("collection")),
                "brand":                _clean(row.get("brand")),
                "image_url":            _clean(row.get("image_url")),
                "mrp":                  _clean(row.get("mrp")),
                "avg_selling_price":    _clean(row.get("avg_selling_price")),
                "sales_3m":             _clean(row.get("sales_3m")),
                "sales_peak_month":     _clean(row.get("sales_peak_month")),
                "sales_peak_region":    _clean(row.get("sales_peak_region")),
                "avg_rating":           _clean(row.get("avg_rating")),
                "total_reviews":        _clean(row.get("total_reviews")),
                "current_stock":        _clean(row.get("current_stock")),
                "launched_date":        _clean(row.get("launched_date")),
                "seasonal_demand_tags": _clean(row.get("seasonal_demand_tags")),
                "visual_sim":           round(float(row.get("visual_sim", 0.0)), 4),
                "faiss_score":          round(float(row["faiss_score"]), 4),
                "attr_match":           round(float(row["attr_match"]), 4),
                "final_score":          round(float(row["final_score"]), 4),
                "image":                "/images/" + img_rel,
            })

        return results, predicted_attrs
