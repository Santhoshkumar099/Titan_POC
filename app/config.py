"""
Central configuration for the Jewelry Visual Search API.

All paths are derived from the project root (the folder that contains
both this `app/` package and the prebuilt `faiss_index/` artifacts).
"""
import os
from pathlib import Path

from dotenv import load_dotenv
load_dotenv()

# Project root = parent of the `app/` package
BASE_DIR = Path(__file__).resolve().parent.parent

# ── Prebuilt artifacts (produced by the ingestion pipeline) ──────────
EMBED_DIR     = BASE_DIR / "embeddings"
VISUAL_EMBEDDINGS_PATH = EMBED_DIR / "embeddings.npy"

FAISS_DIR     = BASE_DIR / "faiss_index"
INDEX_PATH    = FAISS_DIR / "jewelry.index"
METADATA_PATH = FAISS_DIR / "metadata.csv"
CONFIG_PATH   = FAISS_DIR / "config.json"

# Normalized images live here; `normalized_image_path` in the metadata
# is relative to this folder, so we mount it as the /images static root.
NORMALIZED_DIR = BASE_DIR / "normalized_output"
IMAGES_MOUNT   = NORMALIZED_DIR

# ── Model ────────────────────────────────────────────────────────────
MODEL_NAME = "facebook/dinov2-base"   # 768-dim CLS embedding
IMAGE_SIZE = 384                       # center-crop square size

# ── Query-pipeline defaults (match the notebook) ─────────────────────
TOP_CANDIDATES  = 30    # ANN candidates pulled from FAISS
TOP_FINAL       = 5    # results returned after hybrid re-rank
DEFAULT_WEIGHTS = {"visual": 0.8, "attribute": 0.2}

# Per-field contribution to attr_match score (must sum to 1.0).
# category carries 50 % so a jewellery-type mismatch is a decisive penalty.
ATTR_FIELD_WEIGHTS = {
    "category":        0.50,
    "metal_type":      0.12,
    "material_colour": 0.12,
    "gender":          0.10,
    "occasion":        0.08,
    "jewellery_type":  0.08,
}

# Jewelry category families — used to soft-filter candidates to the right type.
# If Gemini predicts any category in a family, only results from that family
# are considered (fallback to all candidates if fewer than TOP_FINAL match).
CATEGORY_FAMILIES: dict[str, set[str]] = {
    "earrings": {"Drop & Danglers", "Jhumkas", "Gemstone Earrings"},
    "rings":    {"Daily Wear Rings", "Gemstone Rings"},
    "bangles":  {"Gold Bangles"},
    "chains":   {"Gold Chain"},
    "general":  {"Daily Wear Jewellery"},
}

def get_category_family(category: str) -> str:
    for family, cats in CATEGORY_FAMILIES.items():
        if category in cats:
            return family
    return "unknown"

# Categorical attribute fields, in the same order used at index time.
ATTR_FIELDS = [
    "category", "metal_type", "material_colour",
    "gender", "occasion", "jewellery_type",
]

# ── Domo Vision AI (Gemini hosted on Domo) ───────────────────────────
DOMO_BASE_URL = os.getenv("DOMO_BASE_URL", "https://gwcteq-partner.domo.com/api")
DOMO_API_KEY  = os.getenv("DOMO_API_KEY",  "")
DOMO_MODEL    = os.getenv("DOMO_MODEL",    "domo.google.gemini-2.5-pro")
