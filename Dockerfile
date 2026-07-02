##############################################################
# Stage 1 — Build the React dashboard
##############################################################
FROM node:20-slim AS dashboard-builder

WORKDIR /build

COPY react-dashboard/package.json ./
RUN npm install

COPY react-dashboard/ ./
RUN npx vite build


##############################################################
# Stage 2 — Python / FastAPI runtime
##############################################################
FROM python:3.12-slim

WORKDIR /app

# System libs required by Pillow, faiss, and OpenMP (torch)
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc libglib2.0-0 libgomp1 \
    && rm -rf /var/lib/apt/lists/*

# ── PyTorch CPU-only (avoids pulling the 2 GB CUDA build) ──────────────
RUN pip install --no-cache-dir \
    torch==2.5.1+cpu torchvision==0.20.1+cpu \
    --index-url https://download.pytorch.org/whl/cpu

# ── All other Python dependencies ───────────────────────────────────────
RUN pip install --no-cache-dir \
    "fastapi>=0.110" \
    "uvicorn[standard]>=0.27" \
    "python-multipart>=0.0.9" \
    "transformers>=4.38" \
    "faiss-cpu>=1.7" \
    "pillow>=10.0" \
    "numpy>=1.24" \
    "pandas>=2.0" \
    "openpyxl>=3.1" \
    "requests>=2.31" \
    "python-dotenv>=1.0"

# ── Pre-download DINOv2 so the container starts instantly ───────────────
RUN python -c "\
from transformers import AutoImageProcessor, AutoModel; \
AutoImageProcessor.from_pretrained('facebook/dinov2-base'); \
AutoModel.from_pretrained('facebook/dinov2-base'); \
print('DINOv2 cached.')"

# ── Application code and prebuilt artifacts ─────────────────────────────
COPY app/               ./app/
COPY faiss_index/       ./faiss_index/
COPY embeddings/        ./embeddings/
COPY normalized_output/ ./normalized_output/

# ── Copy React dashboard build from Stage 1 ─────────────────────────────
COPY --from=dashboard-builder /build/dist ./app/static/dashboard/

ENV DOMO_BASE_URL=https://gwcteq-partner.domo.com/api
ENV DOMO_MODEL=domo.google.gemini-2.5-pro
ENV DOMO_API_KEY=DDCI428ac26020164d2905ea50a0bb4fcf67e7160fcb45e6694f

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
