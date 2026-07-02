"""
Stage 3 — Build the FAISS index (notebook cells 24-28).

Combines each image's 768-dim visual embedding with one-hot encoded
attributes into a composite vector, then builds an exact-cosine FAISS
index and writes everything the query pipeline needs to `faiss_index/`.

Run:  python -m pipeline.build_index
"""
import json
from pathlib import Path

import faiss
import numpy as np
import pandas as pd

ROOT      = Path(__file__).resolve().parent.parent
EMBED_DIR = ROOT / "embeddings"
FAISS_DIR = ROOT / "faiss_index"

ATTR_FIELDS = ["category", "metal_type", "material_colour",
               "gender", "occasion", "jewellery_type"]

W_VISUAL = 1.0
W_ATTR   = 0.75   # raised from 0.5 → attributes have stronger FAISS influence


def build_map(series):
    return {val: i for i, val in enumerate(sorted(series.dropna().unique()))}


def safe_normalize(v):
    n = np.linalg.norm(v)
    return v / n if n > 0 else v


def main():
    embeddings = np.load(EMBED_DIR / "embeddings.npy")
    df = pd.read_csv(EMBED_DIR / "embedding_metadata.csv")
    assert len(df) == embeddings.shape[0], "embeddings / metadata mismatch"

    maps = {f: build_map(df[f]) for f in ATTR_FIELDS}
    attr_dim = sum(len(m) for m in maps.values())

    def encode_attributes(row):
        parts = []
        for f in ATTR_FIELDS:
            vec = np.zeros(len(maps[f]))
            val = row[f]
            if pd.notna(val) and val in maps[f]:
                vec[maps[f][val]] = 1.0
            parts.append(vec)
        return np.concatenate(parts)

    composite = []
    for idx, row in df.iterrows():
        vis = safe_normalize(embeddings[idx]) * W_VISUAL
        attr = safe_normalize(encode_attributes(row)) * W_ATTR
        composite.append(np.concatenate([vis, attr]))
    matrix = np.array(composite, dtype="float32")

    FAISS_DIR.mkdir(exist_ok=True)
    faiss.normalize_L2(matrix)
    index = faiss.IndexFlatIP(matrix.shape[1])
    index.add(matrix)
    faiss.write_index(index, str(FAISS_DIR / "jewelry.index"))

    config = {
        "visual_dim": 768, "attr_dim": attr_dim,
        "w_visual": W_VISUAL, "w_attr": W_ATTR, "maps": maps,
    }
    with open(FAISS_DIR / "config.json", "w", encoding="utf-8") as f:
        json.dump(config, f, indent=2)
    df.to_csv(FAISS_DIR / "metadata.csv", index=False)

    print(f"Done — {index.ntotal} vectors, dim {matrix.shape[1]} "
          f"(768 visual + {attr_dim} attr)")
    print(f"Output: {FAISS_DIR}")


if __name__ == "__main__":
    main()
