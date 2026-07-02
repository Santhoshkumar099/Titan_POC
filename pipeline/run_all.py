"""
Run the full ingestion pipeline end to end: Stage 1 -> 2 -> 3.

Run:  python -m pipeline.run_all
"""
from pipeline import normalize, embed, build_index


def main():
    print("\n=== STAGE 1: Normalize ===")
    normalize.main()
    print("\n=== STAGE 2: Embed (DINOv2) ===")
    embed.main()
    print("\n=== STAGE 3: Build FAISS index ===")
    build_index.main()
    print("\nPipeline complete. Start the API with:  python run_api.py")


if __name__ == "__main__":
    main()
