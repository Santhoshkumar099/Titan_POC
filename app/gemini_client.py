"""
Vision client — predicts jewelry attributes via the Domo-hosted Gemini model.

POST {DOMO_BASE_URL}/ai/v1/image/text
Auth: X-DOMO-Developer-Token

Runs concurrently with DINOv2 embedding inside SearchEngine.search().
Returns {} on any failure so the pipeline falls back to visual-only search.
"""
from __future__ import annotations

import asyncio
import base64
import io
import json
import re
from concurrent.futures import ThreadPoolExecutor

import PIL.Image
import requests

from app import config

_executor = ThreadPoolExecutor(max_workers=4, thread_name_prefix="domo-vision")

_ENDPOINT = "{base}/ai/v1/image/text"

_SYSTEM = (
    "You are an expert jewellery catalog classifier for Tanishq products. "
    "Return ONLY valid JSON — no markdown, no explanation."
)

_PROMPT = """\
Analyze the jewellery in this image and classify it using ONLY the values listed below.

RULES:
1. Return ONLY a valid JSON object.
2. Do NOT add markdown fences or explanation.
3. Use null if an attribute cannot be determined confidently.
4. Choose exactly ONE value per attribute from the allowed list.

Allowed values:

category        : Daily Wear Jewellery | Daily Wear Rings | Drop & Danglers |
                  Gemstone Earrings | Gemstone Rings | Gold Bangles | Gold Chain | Jhumkas

material_colour : Rose | Yellow

gender          : Kids | Women

occasion        : Modern | Casual | Bestsellers

jewellery_type  : Gold Jewellery | Jewellery with Gemstones

Output format:
{
  "category": "...",
  "material_colour": "...",
  "gender": "...",
  "occasion": "...",
  "jewellery_type": "..."
}
"""


def _pil_to_base64(pil_img: PIL.Image.Image) -> tuple[str, str]:
    """Return (base64_string, media_type) from a PIL image."""
    buf = io.BytesIO()
    pil_img.save(buf, format="JPEG")
    return base64.b64encode(buf.getvalue()).decode(), "image/jpeg"


def _extract_text(data: dict) -> str:
    """Pull the text/content field from various Domo response shapes."""
    for key in ("output", "content", "text", "result", "response"):
        if key in data and data[key]:
            return str(data[key])
    # OpenAI-style choices array
    if "choices" in data and data["choices"]:
        choice = data["choices"][0]
        if isinstance(choice, dict):
            if "message" in choice:
                return str(choice["message"].get("content", ""))
            if "text" in choice:
                return str(choice["text"])
    # Last resort: dump full JSON so the debug log shows something
    return json.dumps(data)


def _call_sync(image_bytes: bytes, valid_options: dict) -> dict:
    """Blocking Domo Vision API call; always run inside a thread pool executor."""
    if not config.DOMO_API_KEY:
        print("[DomoVision] DOMO_API_KEY is empty — add it to .env")
        return {}

    pil_img = PIL.Image.open(io.BytesIO(image_bytes)).convert("RGB")
    img_b64, media_type = _pil_to_base64(pil_img)

    url = _ENDPOINT.format(base=config.DOMO_BASE_URL.rstrip("/"))
    headers = {
        "X-DOMO-Developer-Token": config.DOMO_API_KEY,
        "Content-Type": "application/json",
        "Accept": "application/json",
    }
    payload = {
        "input":  _PROMPT,
        "image":  {"data": img_b64, "type": "base64", "mediaType": media_type},
        "model":  config.DOMO_MODEL,
        "system": _SYSTEM,
    }

    try:
        resp = requests.post(url, headers=headers, json=payload, timeout=30)
        resp.raise_for_status()
        data = resp.json()
    except requests.exceptions.HTTPError as exc:
        print(f"[DomoVision] HTTP {exc.response.status_code}: {exc.response.text[:300]}")
        return {}
    except Exception as exc:
        print(f"[DomoVision] API call failed: {type(exc).__name__}: {exc}")
        return {}

    text = _extract_text(data).strip()
    print(f"[DomoVision] raw response: {text!r}")

    # Strip markdown fences if the model ignores the instruction
    text = re.sub(r"^```(?:json)?\s*\n?", "", text)
    text = re.sub(r"\n?```\s*$", "", text).strip()

    try:
        raw = json.loads(text)
    except json.JSONDecodeError as exc:
        print(f"[DomoVision] JSON parse failed ({exc}) — raw: {text!r}")
        return {}

    # Case-insensitive match against index vocabulary
    matched = {}
    for field, val in raw.items():
        if not val or field not in valid_options:
            continue
        val_str = str(val).strip()
        vocab = valid_options[field]
        if val_str in vocab:
            matched[field] = val_str
        else:
            val_lower = val_str.lower()
            for v in vocab:
                if v.lower() == val_lower:
                    matched[field] = v
                    break
            else:
                print(f"[DomoVision] '{val_str}' not in vocab for '{field}': {vocab}")

    print(f"[DomoVision] final attrs: {matched}")
    return matched


async def predict_attributes(image_bytes: bytes, valid_options: dict) -> dict:
    """Non-blocking wrapper — runs the Domo call in a thread pool."""
    loop = asyncio.get_running_loop()
    try:
        return await loop.run_in_executor(_executor, _call_sync, image_bytes, valid_options)
    except Exception as exc:
        print(f"[DomoVision] unexpected error: {exc}")
        return {}
