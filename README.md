# Jewelara Vision — Tanishq AI Visual Search Platform

An AI-powered jewellery visual search and intelligence platform built for Tanishq. Upload any jewellery photo and the system instantly retrieves the most visually similar pieces from the product catalogue, identifies their attributes using Google Gemini, and generates AI-powered business recommendations.

---

## What It Does

| Capability | Description |
|---|---|
| **Visual Search** | Upload a jewellery image → get the 5 most similar products from the catalogue |
| **Attribute Detection** | Google Gemini analyses the query image and identifies category, metal type, colour, gender, occasion, and jewellery type |
| **Hybrid Re-ranking** | Results are ranked by a weighted combination of visual similarity (80 %) and attribute match (20 %) |
| **Business Insights** | AI generates region, month, sales, stock, and opportunity recommendations for the top result |
| **Analytics Dashboard** | React dashboard showing pipeline health, sales charts, product metadata, and top performers |

---

## Technology Stack

| Layer | Technology |
|---|---|
| Visual Embeddings | Facebook DINOv2 (768-dim CLS token) via HuggingFace Transformers |
| Vector Search | FAISS `IndexFlatIP` (exact cosine similarity) |
| Attribute Detection | Google Gemini 2.5 Pro via Domo AI API |
| AI Recommendations | Google Gemini 2.5 Pro (text generation) via Domo AI API |
| Backend API | Python FastAPI + Uvicorn |
| Visual Search UI | Vanilla HTML / CSS / JavaScript |
| Analytics Dashboard | React 18 + TypeScript + Tailwind CSS + Framer Motion + Recharts |
| Image Preprocessing | Pillow (center-crop 384 × 384, LANCZOS) |

---

## Project Structure

```
full code/
├── app/                        # FastAPI backend
│   ├── main.py                 # API routes: POST /api/search, GET /api/options
│   ├── config.py               # All paths, model names, weights, category families
│   ├── search_engine.py        # Core query pipeline (embed → FAISS → re-rank)
│   ├── gemini_client.py        # Gemini Vision API client (attribute prediction)
│   ├── recommender.py          # Gemini Text API client (business recommendations)
│   └── static/
│       ├── index.html          # Jewelara Vision visual search page
│       └── tanishq_logo.png    # Tanishq logo
│
├── pipeline/                   # Offline data ingestion pipeline
│   ├── normalize.py            # Stage 1 — read Excel, match images, clean metadata
│   ├── embed.py                # Stage 2 — DINOv2 embedding for all catalogue images
│   ├── build_index.py          # Stage 3 — build FAISS composite index
│   └── run_all.py              # Run all 3 stages in sequence
│
├── react-dashboard/            # React analytics dashboard
│   ├── src/
│   │   ├── components/
│   │   │   ├── Header.tsx      # Top navigation bar with Tanishq branding
│   │   │   ├── PipelineStatus.tsx  # AI pipeline health card
│   │   │   └── ...             # Charts, tables, metric cards
│   │   └── App.tsx
│   └── public/
│       └── tanishq_logo.png
│
├── embeddings/                 # Stage 2 output (git-ignored, generated)
│   ├── embeddings.npy          # (100, 768) float32 visual embedding matrix
│   └── embedding_metadata.csv  # Row-aligned metadata for each embedding
│
├── faiss_index/                # Stage 3 output (git-ignored, generated)
│   ├── jewelry.index           # FAISS binary index file
│   ├── metadata.csv            # Row-aligned product metadata (100 products)
│   └── config.json             # Index config: dims, weights, attribute maps
│
├── normalized_output/          # Stage 1 output — centre-cropped product images
├── Tanishq_Product_Data.xlsx   # Source catalogue (100 products, ~30 columns)
├── run_api.py                  # Start the FastAPI server (port 8000)
└── .env                        # DOMO_BASE_URL, DOMO_API_KEY, DOMO_MODEL
```

---

## How It Works — Step by Step

### Part 1 — Offline Pipeline (run once, or when catalogue changes)

```
python -m pipeline.run_all
```

#### Stage 1 · Normalize (`pipeline/normalize.py`)
1. Reads `Tanishq_Product_Data.xlsx` — 100 product rows with metadata columns (MRP, ratings, sales, stock, etc.)
2. For each product, locates the matching product image from the `images/` folder tree
3. Centre-crops every image to 384 × 384 pixels (LANCZOS interpolation)
4. Saves cropped images to `normalized_output/`
5. Writes `normalized_output/normalized_metadata.csv` with cleaned column names

#### Stage 2 · Embed (`pipeline/embed.py`)
1. Loads the DINOv2 model (`facebook/dinov2-base`) — 86 M parameters
2. For each cropped image: runs a forward pass, extracts the 768-dim CLS token embedding
3. Saves the full embedding matrix to `embeddings/embeddings.npy` — shape (100, 768)
4. Writes `embeddings/embedding_metadata.csv` — one row per product with all metadata columns

#### Stage 3 · Build Index (`pipeline/build_index.py`)
1. For each product, creates a composite vector:
   - Visual part: L2-normalised 768-dim embedding × 1.0
   - Attribute part: one-hot encoded 25-dim vector (category, metal, colour, gender, occasion, jewellery type) × 0.75
   - Concatenated → 793-dim vector, then L2-normalised
2. Adds all 100 vectors to a FAISS `IndexFlatIP` (exact inner-product / cosine search)
3. Saves `faiss_index/jewelry.index`, `faiss_index/metadata.csv`, `faiss_index/config.json`

---

### Part 2 — Live Query Pipeline (every search request)

```
POST /api/search   ← multipart file upload
```

```
Query image
    │
    ├── DINOv2 embed (thread pool) ──────────────────────────┐
    │                                                         │
    └── Gemini Vision (async) → predicted attributes ────────┤
                                                             ▼
                                              Build composite query vector
                                              [visual×1.0 | attr×0.75] → L2-norm
                                                             │
                                              FAISS search → top 30 candidates
                                                             │
                                              Category family soft-filter
                                              (keep only earrings/rings/etc.)
                                                             │
                                              Hybrid re-rank
                                              score = 0.8 × visual_sim
                                                    + 0.2 × attr_match
                                              (category field = 50% of attr_match)
                                                             │
                                              Top 5 results
                                                             │
                                              Gemini Text → AI recommendation
                                                             │
                                              JSON response to browser
```

**Attribute match weighting** — not all fields are equal:

| Field | Weight | Why |
|---|---|---|
| category | 50 % | Earring vs ring is decisive |
| metal_type | 12 % | Gold vs diamond matters |
| material_colour | 12 % | Rose vs yellow gold |
| gender | 10 % | Men vs women vs kids |
| occasion | 8 % | Casual vs traditional |
| jewellery_type | 8 % | Gold vs gemstone vs diamond |

---

## Setup & Running

### Prerequisites
- Python 3.10+
- Node.js 18+
- Domo API credentials (for Gemini attribute detection + recommendations)

### 1. Install Python dependencies
```bash
python -m venv myenv
myenv\Scripts\activate        # Windows
pip install -r requirements.txt
```

### 2. Configure environment
Create `.env` in the project root:
```
DOMO_BASE_URL=https://your-tenant.domo.com/api
DOMO_API_KEY=your_api_key_here
DOMO_MODEL=domo.google.gemini-2.5-pro
```

### 3. Run the ingestion pipeline (first time or when catalogue changes)
```bash
python -m pipeline.run_all
```
Expected output:
```
=== STAGE 1: Normalize === → matched 100, missing 0
=== STAGE 2: Embed      === → matrix (100, 768), failed 0
=== STAGE 3: Build FAISS=== → 100 vectors, dim 793
```

### 4. Start the API server
```bash
python run_api.py
```
API runs at **http://localhost:8000**
- `GET  /`                → Jewelara Vision visual search page
- `POST /api/search`      → multipart image upload → returns search results + AI recommendation
- `GET  /api/options`     → available attribute values for the Gemini prompt

### 5. Start the React dashboard (optional)
```bash
cd react-dashboard
npm install
npm run dev
```
Dashboard runs at **http://localhost:5173**

---

## Key Features

- **State persistence** — search results survive navigation to the dashboard and back (stored in `sessionStorage`)
- **Category-aware filtering** — earring queries only return earrings; ring queries only return rings
- **Hover product cards** — mouse-over shows real Excel data: launch year, 3-month sales, MRP, rating, and stock level
- **AI recommendation panel** — Gemini generates Region / Month / Sales / Stock / Opportunity insights for the top result
- **Absolute similarity scores** — scores reflect true cosine similarity (0.82–0.92 range for similar jewellery), not artificially inflated relative rankings
- **Opens product pages in new tab** — "View product →" never reloads the search page

---

## Architecture Decisions

**Why DINOv2?**  
DINOv2 (Vision Transformer, self-supervised) produces high-quality visual features without fine-tuning. Its CLS token captures both shape and texture — critical for distinguishing jewellery styles.

**Why FAISS IndexFlatIP?**  
With only 100 catalogue items, exact search is instant. No approximation errors.

**Why visual_sim (not visual_norm) for scoring?**  
`visual_norm` (relative normalisation) artificially compresses ranks 2–5 to 0.4–0.7 even when all results are highly relevant. `visual_sim` (raw cosine similarity) gives each result its true absolute score.

**Why weighted attribute matching?**  
Uniform field weights mean a category mismatch (earring vs ring) only penalises 1/6 of the attribute score — not enough to overcome a strong visual similarity. Category now carries 50% so jewellery-type mismatches are decisive.
