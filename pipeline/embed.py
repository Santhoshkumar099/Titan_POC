"""
Stage 2 — Visual embeddings with DINOv2 (notebook cells 13-18).

Reads `normalized_output/normalized_metadata.csv`, embeds every image
into a 768-dim vector, and saves the aligned matrix + metadata to
`embeddings/`.

Run:  python -m pipeline.embed
"""
from pathlib import Path

import numpy as np
import pandas as pd
import torch
from PIL import Image
from transformers import AutoImageProcessor, AutoModel

ROOT           = Path(__file__).resolve().parent.parent
NORMALIZED_CSV = ROOT / "normalized_output" / "normalized_metadata.csv"
IMAGES_DIR     = ROOT / "normalized_output"   # normalized_image_path is relative to here
EMBED_DIR      = ROOT / "embeddings"
MODEL_NAME     = "facebook/dinov2-base"


def main():
    device = "cuda" if torch.cuda.is_available() else "cpu"
    df = pd.read_csv(NORMALIZED_CSV)
    print(f"Loaded {len(df)} rows | device={device}")

    processor = AutoImageProcessor.from_pretrained(MODEL_NAME)
    model = AutoModel.from_pretrained(MODEL_NAME).to(device).eval()

    def embed(path: Path) -> np.ndarray:
        image = Image.open(path).convert("RGB")
        inputs = processor(images=image, return_tensors="pt")
        inputs = {k: v.to(device) for k, v in inputs.items()}
        with torch.no_grad():
            out = model(**inputs)
        return out.last_hidden_state[:, 0, :].squeeze().cpu().numpy()

    embeddings, failed = [], []
    for idx, row in df.iterrows():
        try:
            embeddings.append(embed(IMAGES_DIR / row["normalized_image_path"]))
        except Exception as e:  # noqa: BLE001
            print(f"  FAILED [{idx}] {row.get('product_name')}: {e}")
            embeddings.append(np.zeros(768))
            failed.append(idx)

    matrix = np.array(embeddings, dtype="float32")

    EMBED_DIR.mkdir(exist_ok=True)
    np.save(EMBED_DIR / "embeddings.npy", matrix)
    df.to_csv(EMBED_DIR / "embedding_metadata.csv", index=False)

    print(f"Done — matrix {matrix.shape}, failed {len(failed)}")
    print(f"Output: {EMBED_DIR}")


if __name__ == "__main__":
    main()
