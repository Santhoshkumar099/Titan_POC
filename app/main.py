"""
FastAPI service for the Jewelry Visual Search engine.

Endpoints
  GET  /              → web UI
  GET  /api/options   → attribute values (reference / debug)
  POST /api/search    → upload an image → top-5 matches + Gemini-detected attrs
  /images/...         → static normalized product images
"""
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

from app import chatbot, config
from app.search_engine import SearchEngine

STATIC_DIR = Path(__file__).parent / "static"

engine: SearchEngine | None = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Load the model + FAISS index once when the server starts."""
    global engine
    print("Loading DINOv2 + FAISS index ...")
    engine = SearchEngine()
    print(f"Ready — {engine.index.ntotal} items indexed on {engine.device}")
    yield
    engine = None


app = FastAPI(title="Jewelry Visual Search", version="2.0.0", lifespan=lifespan)

app.mount("/images", StaticFiles(directory=str(config.IMAGES_MOUNT)), name="images")
app.mount("/static", StaticFiles(directory=str(STATIC_DIR)),          name="static")

_dashboard_dir = STATIC_DIR / "dashboard"
if _dashboard_dir.exists():
    app.mount("/dashboard", StaticFiles(directory=str(_dashboard_dir), html=True), name="dashboard")


@app.get("/", response_class=HTMLResponse)
def home():
    return HTMLResponse((STATIC_DIR / "index.html").read_text(encoding="utf-8"))



@app.get("/api/options")
def api_options():
    if engine is None:
        raise HTTPException(503, "Engine not ready")
    return engine.options()


@app.post("/api/search")
async def api_search(
    file: UploadFile = File(...),
    visual_weight: float = Form(0.7),
    attribute_weight: float = Form(0.3),
    top_candidates: int = Form(config.TOP_CANDIDATES),
    top_final: int = Form(config.TOP_FINAL),
):
    if engine is None:
        raise HTTPException(503, "Engine not ready")

    data = await file.read()
    if not data:
        raise HTTPException(400, "Empty file")

    try:
        results, gemini_attrs = await engine.search(
            image_bytes=data,
            top_candidates=top_candidates,
            top_final=top_final,
            weights={"visual": visual_weight, "attribute": attribute_weight},
        )
    except Exception as e:
        raise HTTPException(400, f"Search failed: {e}")

    return {
        "count": len(results),
        "gemini_attrs": gemini_attrs,
        "results": results,
    }


class ChatMessage(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    message: str
    history: list[ChatMessage] = []
    query_attrs: dict = {}
    products: list[dict] = []


@app.post("/api/chat")
async def api_chat(req: ChatRequest):
    if not req.message.strip():
        raise HTTPException(400, "Empty message")

    reply = await chatbot.generate_chat_reply(
        query_attrs=req.query_attrs,
        products=req.products,
        history=[m.model_dump() for m in req.history],
        message=req.message,
    )
    return {"reply": reply}
