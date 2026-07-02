"""
AI Recommendation Engine — generates natural language shop-owner recommendations
based on the query product and top-5 visually similar products' sales data.

Uses the same Domo-hosted Gemini 2.5 Pro model as the vision classifier,
but calls the text-only endpoint (no image payload needed).
"""
from __future__ import annotations

import asyncio
from concurrent.futures import ThreadPoolExecutor

import requests

from app import config

_executor = ThreadPoolExecutor(max_workers=2, thread_name_prefix="domo-recommend")

_ENDPOINT = "{base}/ai/v1/text/generation"

_SYSTEM = (
    "You are a senior retail analytics advisor for Tanishq, India's leading jewellery brand. "
    "You respond ONLY in the exact labeled-line format given. "
    "No markdown, no asterisks, no bold, no bullet symbols, no dashes before labels. "
    "Each line starts with the label word followed by a colon, then a space, then the insight. "
    "Be direct, specific, and grounded in the numbers. No filler."
)

# Only these columns are sent to the model — keeps the prompt short
_COLS = [
    "product_name", "category", "occasion", "gender",
    "sales_peak_region", "sales_peak_month",
    "sales_3m", "sales_6m", "sales_1y",
    "avg_rating", "total_reviews",
    "current_stock", "restock_lead_time",
    "mrp", "seasonal_demand_tags", "launched_date",
]


def _v(product: dict, key: str) -> str:
    val = product.get(key)
    if val in (None, "", "nan", "None", float("nan")):
        return "—"
    return str(val).strip()


def _fmt_similar(product: dict, rank: int) -> str:
    return (
        f"{rank}. {_v(product,'product_name')} | "
        f"Sales 3M:{_v(product,'sales_3m')} 6M:{_v(product,'sales_6m')} 1Y:{_v(product,'sales_1y')} | "
        f"Peak: {_v(product,'sales_peak_month')}, {_v(product,'sales_peak_region')} | "
        f"Rating: {_v(product,'avg_rating')} ({_v(product,'total_reviews')} reviews) | "
        f"Stock: {_v(product,'current_stock')} units | "
        f"Lead time: {_v(product,'restock_lead_time')} days | "
        f"MRP: ₹{_v(product,'mrp')} | "
        f"Tags: {_v(product,'seasonal_demand_tags')}"
    )


def _build_prompt(query: dict, similar: list[dict]) -> str:
    lines = [
        f"Query Product: {_v(query,'product_name')}, {_v(query,'category')}, "
        f"{_v(query,'occasion')}, {_v(query,'gender')}, MRP ₹{_v(query,'mrp')}",
        "",
        "Similar Products (top 5 by visual similarity):",
    ]
    for i, p in enumerate(similar[:5], start=1):
        lines.append(_fmt_similar(p, i))

    lines += [
        "",
        "Respond using EXACTLY this format — 5 lines, one per area, no extra lines:",
        "Region: <which region to prioritise and why — cite the peak region from data>",
        "Month: <best month to launch and why — cite peak month from data>",
        "Sales: <expected 3-month sales range in units — use the 3M/6M/1Y numbers to justify>",
        "Opportunity: <one specific risk or opportunity backed by the numbers>",
        "Strategy: <one concrete, actionable next step the shop owner should take this week to sell "
        "this piece — who to target (using gender/occasion) and how to pitch it (using rating, "
        "reviews, or tags as the selling point), stated as a specific action, not generic advice>",
        "",
        "Rules: no markdown, no asterisks, no bold, no bullet symbols. Plain text labels only.",
        "Every line must contain actual numbers from the data above.",
    ]
    return "\n".join(lines)


def _extract_text(data: dict) -> str:
    # /ai/v1/text/generation returns choices[0].output
    if "choices" in data and data["choices"]:
        choice = data["choices"][0]
        if isinstance(choice, dict):
            for key in ("output", "text", "content"):
                if choice.get(key):
                    return str(choice[key]).strip()
    # fallback: top-level fields
    for key in ("output", "content", "text", "result", "response"):
        if key in data and data[key]:
            return str(data[key]).strip()
    return ""


def _call_sync(query: dict, similar: list[dict]) -> str:
    if not config.DOMO_API_KEY:
        return "Recommendation unavailable: DOMO_API_KEY not set in .env"

    # Trim each product to the required columns only
    def trim(p: dict) -> dict:
        return {k: p.get(k) for k in _COLS}

    prompt = _build_prompt(trim(query), [trim(p) for p in similar])

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

    print(f"[Recommender] calling Domo text endpoint for '{query.get('product_name','?')}'")
    try:
        resp = requests.post(url, headers=headers, json=payload, timeout=60)
        resp.raise_for_status()
        data = resp.json()
    except requests.exceptions.HTTPError as exc:
        print(f"[Recommender] HTTP {exc.response.status_code}: {exc.response.text[:400]}")
        return "Recommendation temporarily unavailable (API error)."
    except Exception as exc:
        print(f"[Recommender] request failed: {type(exc).__name__}: {exc}")
        return "Recommendation temporarily unavailable."

    text = _extract_text(data)
    if not text:
        print(f"[Recommender] empty response body: {data}")
        return "Recommendation could not be generated."

    print(f"[Recommender] generated {len(text)} chars")
    return text


async def generate_ai_recommendation(query_product: dict, similar_products: list[dict]) -> str:
    """
    Non-blocking entry point called from the search pipeline.

    query_product  — dict with Excel columns for the best-matched catalog product.
    similar_products — list of up to 5 result dicts (same shape).
    Returns a plain-text recommendation string.
    """
    loop = asyncio.get_running_loop()
    try:
        return await loop.run_in_executor(
            _executor, _call_sync, query_product, similar_products
        )
    except Exception as exc:
        print(f"[Recommender] unexpected error: {exc}")
        return "Recommendation temporarily unavailable."
