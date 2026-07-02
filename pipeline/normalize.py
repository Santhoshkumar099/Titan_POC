"""
Stage 1 — Data normalization (notebook cells 0-11).

Reads the Excel metadata + scattered .png images, matches each row to a
file (4-level fallback), resizes/center-crops to 384x384, and writes a
clean dataset to `normalized_output/`.

Run:  python -m pipeline.normalize
"""
import csv
import json
import re
import shutil
from pathlib import Path
from typing import Optional

import pandas as pd
from PIL import Image, ImageOps

# ── Paths (relative to project root) ─────────────────────────────────
ROOT          = Path(__file__).resolve().parent.parent
METADATA_PATH = ROOT / "Tanishq Jewels Metadata.xlsx"
IMAGE_ROOT    = ROOT / "Tanishq Jewells"
OUTPUT_DIR    = ROOT / "normalized_output"

# ── Options ──────────────────────────────────────────────────────────
COPY_IMAGES = True
RESIZE      = 384
FORMAT      = "jpg"

COLUMN_MAP = {
    "Product": "product", "Category": "category", "Product Name": "product_name",
    "Image url": "image_url", "Image Path": "image_path",
    "Material colour": "material_colour", "Metal Type": "metal_type",
    "Jewellery Type": "jewellery_type", "Product Type": "product_type",
    "Brand": "brand", "Collection": "collection", "Gender": "gender",
    "Occasion": "occasion",
    "MRP (₹)": "mrp",
    "Avg Selling Price (₹)": "avg_selling_price",
    "Last 3 Month Sales (Units)": "sales_3m",
    "Last 6 Month Sales (Units)": "sales_6m",
    "Last 1 Year Sales (Units)": "sales_1y",
    "Sales Peak Month": "sales_peak_month",
    "Sales Peak Region": "sales_peak_region",
    "Avg Rating (1-5)": "avg_rating",
    "Total Reviews": "total_reviews",
    "Current Stock (Units)": "current_stock",
    "Restock Lead Time (Days)": "restock_lead_time",
    "Launched Date": "launched_date",
    "Seasonal Demand Tags": "seasonal_demand_tags",
}


def slugify(value: str) -> str:
    value = str(value or "").strip().lower()
    value = re.sub(r"[^\w\s-]", "", value)
    value = re.sub(r"[\s_-]+", "-", value)
    return value.strip("-")


def normalize_string(value):
    if pd.isna(value):
        return None
    text = str(value).strip()
    return re.sub(r"\s+", " ", text) if text else None


def preprocess_image(image: Image.Image, size: Optional[int]) -> Image.Image:
    if size is None:
        return image
    return ImageOps.fit(image, (size, size), method=Image.LANCZOS, centering=(0.5, 0.5))


def find_image_file(image_root, image_folder, product_name, image_files):
    """4-level match: exact path -> exact name -> slug -> keywords."""
    if not product_name:
        return None
    expected = f"{product_name}.png"
    expected_lower = expected.lower()

    if image_folder:
        candidate = image_root / Path(image_folder) / expected
        if candidate.exists():
            return candidate
    if expected_lower in image_files:
        return image_files[expected_lower]

    slug_name = slugify(product_name)
    for fp in image_files.values():
        if slugify(fp.stem) == slug_name:
            return fp

    words = [w for w in re.split(r"[^a-z0-9]+", product_name.lower()) if len(w) >= 3]
    if words:
        for fp in image_files.values():
            if all(w in fp.stem.lower() for w in words[:3]):
                return fp
    return None


def main():
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    (OUTPUT_DIR / "normalized_images").mkdir(parents=True, exist_ok=True)

    df = pd.read_excel(METADATA_PATH).rename(columns=COLUMN_MAP)
    image_files = {p.name.lower(): p for p in IMAGE_ROOT.rglob("*.png")}
    print(f"Loaded {len(df)} rows, indexed {len(image_files)} images")

    normalized_rows, missing, matched = [], [], set()

    for index, row in df.iterrows():
        product_name = normalize_string(row.get("product_name") or row.get("product"))

        folder_raw = normalize_string(row.get("image_path"))
        image_folder = None
        if folder_raw:
            image_folder = (folder_raw.replace("Tanishq Jewells\\", "")
                            .replace("Tanishq Jewells/", "")
                            .replace("\\", "/").strip("/"))

        image_path = find_image_file(IMAGE_ROOT, image_folder, product_name, image_files)
        if not image_path:
            missing.append({"row_index": index, "product_name": product_name,
                            "image_folder": image_folder})
            continue

        normalized_id = slugify(product_name)
        ext = FORMAT or image_path.suffix.lstrip(".")
        filename = f"{normalized_id}.{ext}"
        subfolder = image_folder or "uncategorized"
        rel = Path("normalized_images") / subfolder / filename
        absolute = OUTPUT_DIR / "normalized_images" / subfolder / filename

        matched.add(str(image_path.relative_to(IMAGE_ROOT)).replace("\\", "/").lower())

        if COPY_IMAGES:
            absolute.parent.mkdir(parents=True, exist_ok=True)
            img = Image.open(image_path).convert("RGB")
            img = preprocess_image(img, RESIZE)
            img.save(absolute, quality=95)

        normalized_rows.append({
            "id": normalized_id, "product_name": product_name,
            "category": normalize_string(row.get("category")),
            "jewellery_type": normalize_string(row.get("jewellery_type")),
            "product_type": normalize_string(row.get("product_type")),
            "brand": normalize_string(row.get("brand")),
            "collection": normalize_string(row.get("collection")),
            "gender": normalize_string(row.get("gender")),
            "occasion": normalize_string(row.get("occasion")),
            "metal_type": normalize_string(row.get("metal_type")),
            "material_colour": normalize_string(row.get("material_colour")),
            "image_url": normalize_string(row.get("image_url")),
            "image_folder": image_folder,
            "source_image_path": str(image_path.relative_to(IMAGE_ROOT)).replace("\\", "/"),
            "normalized_image_path": str(rel),
            "mrp": normalize_string(row.get("mrp")),
            "avg_selling_price": normalize_string(row.get("avg_selling_price")),
            "sales_3m": normalize_string(row.get("sales_3m")),
            "sales_6m": normalize_string(row.get("sales_6m")),
            "sales_1y": normalize_string(row.get("sales_1y")),
            "sales_peak_month": normalize_string(row.get("sales_peak_month")),
            "sales_peak_region": normalize_string(row.get("sales_peak_region")),
            "avg_rating": normalize_string(row.get("avg_rating")),
            "total_reviews": normalize_string(row.get("total_reviews")),
            "current_stock": normalize_string(row.get("current_stock")),
            "restock_lead_time": normalize_string(row.get("restock_lead_time")),
            "launched_date": normalize_string(row.get("launched_date")),
            "seasonal_demand_tags": normalize_string(row.get("seasonal_demand_tags")),
        })

    # ── Write outputs ────────────────────────────────────────────────
    if normalized_rows:
        csv_path = OUTPUT_DIR / "normalized_metadata.csv"
        with csv_path.open("w", newline="", encoding="utf-8") as f:
            w = csv.DictWriter(f, fieldnames=list(normalized_rows[0].keys()))
            w.writeheader(); w.writerows(normalized_rows)

        jsonl_path = OUTPUT_DIR / "normalized_metadata.jsonl"
        with jsonl_path.open("w", encoding="utf-8") as f:
            for r in normalized_rows:
                f.write(json.dumps(r, ensure_ascii=False) + "\n")

    if missing:
        with (OUTPUT_DIR / "missing_images.csv").open("w", newline="", encoding="utf-8") as f:
            w = csv.DictWriter(f, fieldnames=["row_index", "product_name", "image_folder"])
            w.writeheader(); w.writerows(missing)

    print(f"Done — matched {len(normalized_rows)}, missing {len(missing)}")
    print(f"Output: {OUTPUT_DIR}")


if __name__ == "__main__":
    main()
