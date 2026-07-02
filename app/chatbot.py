"""
Product Q&A Chatbot — answers shop-owner questions grounded in the query
image's detected attributes and the top-5 visually similar products' data.

Same Domo-hosted Gemini text endpoint used elsewhere in the app, but
conversational: keeps a short message history instead of producing one
fixed-format report.
"""
from __future__ import annotations

import asyncio
from concurrent.futures import ThreadPoolExecutor

import requests

from app import config

_executor = ThreadPoolExecutor(max_workers=4, thread_name_prefix="domo-chat")

_ENDPOINT = "{base}/ai/v1/text/generation"

_SYSTEM = (
    "You are a senior retail analytics advisor for Tanishq, India's leading jewellery brand, "
    "chatting with a shop owner who just ran a visual search on a jewellery photo. "
    "Answer ONLY using the query image details, the 5 visually similar products' data, and the "
    "AI Recommendation summary given in the conversation context below — regions, peak months, "
    "sales figures, ratings, stock, price, and tags. Ground every claim in those numbers when possible. "
    "If the shop owner asks how you arrived at a claim in the AI Recommendation (e.g. 'how can you say "
    "this', 'what evidence', 'why'), point to the specific numbers behind it — the peak region/month, "
    "the sales_3m/6m/1y figures, ratings, or stock/lead-time values from the data — don't just repeat "
    "the claim. "
    "If something truly cannot be inferred from the given data, say so plainly, then still offer "
    "a reasoned, practical suggestion based on general retail experience. "
    "Answer conversationally in plain sentences — no markdown, no asterisks, no bullet symbols, "
    "no headers. Keep answers tight: 2-5 sentences unless the user explicitly asks for more detail."
)

# Trimmed column set — keeps the prompt short
_COLS = [
    "product_name", "category", "occasion",
    "sales_peak_region", "sales_peak_month",
    "sales_3m", "sales_6m", "sales_1y",
    "avg_rating", "total_reviews",
    "current_stock", "restock_lead_time",
    "mrp", "seasonal_demand_tags", "launched_date",
]

_MAX_HISTORY_TURNS = 8  # keep prompt bounded on long conversations


def _v(product: dict, key: str) -> str:
    val = product.get(key)
    if val in (None, "", "nan", "None", float("nan")):
        return "—"
    return str(val).strip()


def _fmt_product(product: dict, rank: int) -> str:
    return (
        f"{rank}. {_v(product,'product_name')} | Category: {_v(product,'category')} | "
        f"Occasion: {_v(product,'occasion')} | "
        f"Sales 3M:{_v(product,'sales_3m')} 6M:{_v(product,'sales_6m')} 1Y:{_v(product,'sales_1y')} | "
        f"Peak: {_v(product,'sales_peak_month')}, {_v(product,'sales_peak_region')} | "
        f"Rating: {_v(product,'avg_rating')} ({_v(product,'total_reviews')} reviews) | "
        f"Stock: {_v(product,'current_stock')} units | "
        f"Lead time: {_v(product,'restock_lead_time')} days | "
        f"MRP: ₹{_v(product,'mrp')} | "
        f"Tags: {_v(product,'seasonal_demand_tags')} | "
        f"Launched: {_v(product,'launched_date')}"
    )


def _build_prompt(
    query_attrs: dict,
    products: list[dict],
    recommendation: str,
    history: list[dict],
    message: str,
) -> str:
    def trim(p: dict) -> dict:
        return {k: p.get(k) for k in _COLS}

    lines = ["Query image — detected attributes:"]
    if query_attrs:
        for k, v in query_attrs.items():
            if v:
                lines.append(f"  {k.replace('_',' ')}: {v}")
    else:
        lines.append("  (no attributes detected)")

    lines += ["", "Top 5 visually similar products (rank 1 is the closest match):"]
    for i, p in enumerate(products[:5], start=1):
        lines.append(_fmt_product(trim(p), i))

    if recommendation and recommendation.strip():
        lines += ["", "AI Recommendation already shown to the shop owner:", recommendation.strip()]

    if history:
        lines += ["", "Conversation so far:"]
        for turn in history[-_MAX_HISTORY_TURNS:]:
            role = "User" if turn.get("role") == "user" else "Advisor"
            content = str(turn.get("content", "")).strip()
            if content:
                lines.append(f"{role}: {content}")

    lines += ["", f"User: {message}", "", "Advisor:"]
    return "\n".join(lines)


def _extract_text(data: dict) -> str:
    if "choices" in data and data["choices"]:
        choice = data["choices"][0]
        if isinstance(choice, dict):
            for key in ("output", "text", "content"):
                if choice.get(key):
                    return str(choice[key]).strip()
    for key in ("output", "content", "text", "result", "response"):
        if key in data and data[key]:
            return str(data[key]).strip()
    return ""


def _call_sync(
    query_attrs: dict,
    products: list[dict],
    recommendation: str,
    history: list[dict],
    message: str,
) -> str:
    if not config.DOMO_API_KEY:
        return "Chat unavailable: DOMO_API_KEY not set in .env"

    prompt = _build_prompt(query_attrs or {}, products or [], recommendation or "", history or [], message)

    url = _ENDPOINT.format(base=config.DOMO_BASE_URL.rstrip("/"))
    headers = {
        "X-DOMO-Developer-Token": config.DOMO_API_KEY,
        "Content-Type": "application/json",
        "Accept": "application/json",
    }
    payload = {
        "input":  prompt,
        "model":  config.DOMO_MODEL,
        "system": _SYSTEM,
    }

    print(f"[Chatbot] calling Domo text endpoint for message: {message[:80]!r}")
    try:
        resp = requests.post(url, headers=headers, json=payload, timeout=60)
        resp.raise_for_status()
        data = resp.json()
    except requests.exceptions.HTTPError as exc:
        print(f"[Chatbot] HTTP {exc.response.status_code}: {exc.response.text[:400]}")
        return "Sorry, I couldn't process that right now (API error)."
    except Exception as exc:
        print(f"[Chatbot] request failed: {type(exc).__name__}: {exc}")
        return "Sorry, I couldn't process that right now."

    text = _extract_text(data)
    if not text:
        print(f"[Chatbot] empty response body: {data}")
        return "I couldn't come up with an answer for that — could you rephrase?"

    print(f"[Chatbot] generated {len(text)} chars")
    return text


async def generate_chat_reply(
    query_attrs: dict,
    products: list[dict],
    recommendation: str,
    history: list[dict],
    message: str,
) -> str:
    """Non-blocking entry point called from /api/chat."""
    loop = asyncio.get_running_loop()
    try:
        return await loop.run_in_executor(
            _executor, _call_sync, query_attrs, products, recommendation, history, message
        )
    except Exception as exc:
        print(f"[Chatbot] unexpected error: {exc}")
        return "Sorry, something went wrong answering that."
