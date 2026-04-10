# ============================================================
# content_generator3.py (UPDATED FULL VERSION)
# ============================================================

import os
import logging
from typing import List, Dict, Optional
from dotenv import load_dotenv
from datetime import datetime
import re
from concurrent.futures import ThreadPoolExecutor, as_completed

load_dotenv()

# LLM Clients
try:
    from groq import Groq
    GROQ_AVAILABLE = True
except Exception:
    GROQ_AVAILABLE = False

try:
    import genai
    GEMINI_AVAILABLE = True
except Exception:
    genai = None
    GEMINI_AVAILABLE = False

# Dynamic prompt builder
from .dynamic_prompt2 import generate_engaging_prompt

# Trend optimizer (real-time trends) — optional, may not be available on serverless
try:
    from app.integrations.trend_fetcher import TrendFetcher
except ImportError:
    TrendFetcher = None

try:
    from app.content_engine.trend_based_optimizer3 import TrendBasedOptimizer
except ImportError:
    TrendBasedOptimizer = None

# Sheets logging — optional
try:
    from app.integrations.sheets_connector import append_row
except ImportError:
    append_row = None

# Optional tools
try:
    import textstat
    TEXTSTAT_AVAILABLE = True
except Exception:
    TEXTSTAT_AVAILABLE = False

try:
    import language_tool_python
    LT_AVAILABLE = True
except Exception:
    LT_AVAILABLE = False


logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)
if not logger.handlers:
    ch = logging.StreamHandler()
    ch.setLevel(logging.INFO)
    logger.addHandler(ch)

FAST_GENERATION = os.getenv("FAST_GENERATION", "true").lower() == "true"
ENABLE_TRENDING = os.getenv("ENABLE_TRENDING", "false").lower() == "true"
ENABLE_GRAMMAR_CHECK = os.getenv("ENABLE_GRAMMAR_CHECK", "false").lower() == "true"
MAX_PARALLEL_VARIANTS = max(1, int(os.getenv("MAX_PARALLEL_VARIANTS", "4")))
VARIANT_ANGLES = [
    "pain-point hook",
    "step-by-step tip",
    "myth vs reality",
    "quick checklist",
    "common mistake to avoid",
    "mini case-study tone",
]


# ============================================================
# Local fallback
# ============================================================

def _local_generate(prompt: str, n: int = 3) -> List[str]:
    def _extract(field: str, default: str = "") -> str:
        m = re.search(rf"^{field}:\s*(.+)$", prompt, flags=re.IGNORECASE | re.MULTILINE)
        return m.group(1).strip() if m else default

    topic = _extract("Topic", "your topic")
    platform = _extract("Platform", "Social")
    audience = _extract("Target Audience", "your audience")
    tone = _extract("Tone Style", "positive")
    hashtags_raw = _extract("Keywords / Hashtags to include", "")

    tags = [t.strip() for t in hashtags_raw.split(",") if t.strip().startswith("#")]
    if not tags:
        topic_tag = "#" + re.sub(r"[^a-zA-Z0-9]+", "", topic.title().replace(" ", ""))
        tags = [topic_tag, "#Marketing"]
    elif len(tags) == 1:
        tags.append("#Marketing")

    templates = [
        f"{topic} matters for {audience}. Start with one clear takeaway, explain why it matters now, and end with one action people can apply today on {platform}. Keep it {tone}. {tags[0]} {tags[1]}",
        f"Quick take on {topic}: break it into 3 simple points, share one real example, and ask {audience} to comment with their experience. Keep the tone {tone}. {tags[0]} {tags[1]}",
        f"If you're posting about {topic}, use a strong hook, practical value, and one CTA. This format works well for {platform} and resonates with {audience}. {tags[0]} {tags[1]}",
        f"Checklist for {topic}: (1) define the goal, (2) choose one tactic, (3) measure one metric. Keep it simple for {audience} and deliver in a {tone} voice. {tags[0]} {tags[1]}",
        f"Common mistake in {topic}: posting without audience intent. Reframe the message for {audience}, add one useful example, and close with a clear next step on {platform}. {tags[0]} {tags[1]}",
        f"Mini case: a team improved results by applying {topic} with consistency and weekly review. Share one takeaway and one action {audience} can do today. {tags[0]} {tags[1]}",
    ]
    return [templates[i % len(templates)] for i in range(max(1, n))]


# ============================================================
# LLM Call Helpers
# ============================================================

def _call_groq(prompt: str, model: str = None) -> str:
    client = Groq(api_key=os.getenv("GROQ_API_KEY"))
    model = model or os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile")

    resp = client.chat.completions.create(
        messages=[{"role": "user", "content": prompt}],
        model=model,
        temperature=float(os.getenv("GROQ_TEMPERATURE", "0.7"))
    )
    return resp.choices[0].message.content


def _call_gemini(prompt: str, model: str = None) -> str:
    genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
    model = model or os.getenv("GEMINI_MODEL", "gemini-1.5-flash")

    gmodel = genai.GenerativeModel(model)
    response = gmodel.generate_content(prompt)

    return response.text if hasattr(response, "text") else str(response)


# ============================================================
# Main LLM generation function
# ============================================================

def _enforce_length(text: str, target_words: int) -> str:
    words = text.split()
    if not words:
        return text
    max_words = max(15, int(target_words * 1.15))
    if len(words) > max_words:
        return " ".join(words[:max_words]).rstrip(" ,;:-") + "."
    # Do not auto-pad short outputs with repetitive filler text.
    # Keeping original output avoids repeated endings across variants.
    return text


def _ensure_topic_and_keywords(text: str, topic: str, keywords: List[str]) -> str:
    out = (text or "").strip()
    if topic and topic.lower() not in out.lower():
        out = f"{topic}: {out}"

    existing_lower = out.lower()
    for kw in keywords[:2]:
        if not kw:
            continue
        if kw.lower() not in existing_lower:
            out = f"{out} {kw}".strip()
            existing_lower = out.lower()
    return out


def _remove_banned_filler(text: str) -> str:
    if not text:
        return text
    cleaned = re.sub(
        r"(?:\bthis is actionable,\s*practical,\s*and easy to apply\.?\s*)+",
        "",
        text,
        flags=re.IGNORECASE,
    )
    cleaned = re.sub(r"\s{2,}", " ", cleaned).strip()
    return cleaned


def _dedupe_variants(items: List[str]) -> List[str]:
    seen = set()
    unique = []
    for text in items:
        key = " ".join((text or "").lower().split())
        if key in seen:
            continue
        seen.add(key)
        unique.append(text)
    return unique


def _compute_fast_trend_score(text: str, keywords: List[str], platform: str) -> int:
    body = (text or "").lower()
    score = 20

    # Keyword/hashtag coverage
    keyword_hits = 0
    for kw in (keywords or [])[:5]:
        k = (kw or "").strip().lower()
        if k and k in body:
            keyword_hits += 1
    score += keyword_hits * 12

    # Lightweight engagement heuristics
    if "?" in body:
        score += 8
    if body.count("#") >= 1:
        score += 8
    if platform.lower() == "twitter" and len(body.split()) <= 45:
        score += 8
    if platform.lower() == "linkedin" and len(body.split()) >= 45:
        score += 8

    return max(1, min(100, int(score)))


def generate_variations(
    topic: str,
    platform: str,
    keywords: List[str],
    audience: str,
    tone: str,
    word_count: int,
    n: int = 2
) -> List[str]:
    """
    Generate n variations using the strongest available LLM:
      1. Groq → LLaMA 3.3
      2. Gemini → 1.5 Flash
      3. Local fallback
    """
    prompts = [
        generate_engaging_prompt(
            topic=topic,
            platform=platform,
            keywords=keywords,
            audience=audience,
            tone=tone,
            word_count=word_count,
            trends=[],
            variant_index=i + 1
        ) + f"\n\nVariant angle: {VARIANT_ANGLES[i % len(VARIANT_ANGLES)]}. Ensure this variant is clearly different from other variants."
        for i in range(max(1, n))
    ]

    if GROQ_AVAILABLE and os.getenv("GROQ_API_KEY"):
        try:
            logger.info("Using Groq for content generation...")
            variants = []
            workers = min(len(prompts), MAX_PARALLEL_VARIANTS)
            with ThreadPoolExecutor(max_workers=workers) as executor:
                futures = {executor.submit(_call_groq, p): idx for idx, p in enumerate(prompts)}
                ordered = [None] * len(prompts)
                for fut in as_completed(futures):
                    idx = futures[fut]
                    ordered[idx] = fut.result()
                variants = [v for v in ordered if v]
            variants = [_ensure_topic_and_keywords(v, topic, keywords) for v in variants]
            variants = [_remove_banned_filler(v) for v in variants]
            variants = [_enforce_length(v, word_count) for v in variants]
            unique = _dedupe_variants(variants)
            if len(unique) >= n:
                return unique[:n]
        except Exception:
            logger.exception("Groq failed → trying Gemini...")

    if GEMINI_AVAILABLE and os.getenv("GEMINI_API_KEY"):
        try:
            logger.info("Using Gemini fallback...")
            workers = min(len(prompts), MAX_PARALLEL_VARIANTS)
            with ThreadPoolExecutor(max_workers=workers) as executor:
                futures = {executor.submit(_call_gemini, p): idx for idx, p in enumerate(prompts)}
                ordered = [None] * len(prompts)
                for fut in as_completed(futures):
                    idx = futures[fut]
                    ordered[idx] = fut.result()
                variants = [v for v in ordered if v]
            variants = [_ensure_topic_and_keywords(v, topic, keywords) for v in variants]
            variants = [_remove_banned_filler(v) for v in variants]
            variants = [_enforce_length(v, word_count) for v in variants]
            unique = _dedupe_variants(variants)
            if len(unique) >= n:
                return unique[:n]
        except Exception:
            logger.exception("Gemini failed → using local fallback...")

    logger.warning("Using LOCAL fallback generator.")
    local = _local_generate(prompts[0], max(n, 3))
    local = [_ensure_topic_and_keywords(v, topic, keywords) for v in local]
    local = [_remove_banned_filler(v) for v in local]
    local = [_enforce_length(v, word_count) for v in local]
    unique = _dedupe_variants(local)
    return unique[:n]


# ============================================================
# Quality scoring (readability + grammar)
# ============================================================

def score_quality(text: str) -> Dict:
    readability_score = None
    grammar_issues = None

    if TEXTSTAT_AVAILABLE:
        try:
            readability_score = textstat.flesch_reading_ease(text)
        except:
            readability_score = None

    # language_tool_python is expensive (spawns/uses local server). Keep disabled by default.
    if LT_AVAILABLE and ENABLE_GRAMMAR_CHECK and not FAST_GENERATION:
        try:
            tool = language_tool_python.LanguageTool('en-US')
            matches = tool.check(text)
            grammar_issues = len(matches)
        except:
            grammar_issues = None

    return {
        "readability_score": readability_score,
        "grammar_issues": grammar_issues
    }


# ============================================================
# Hashtag Cleaning Utilities
# ============================================================

def clean_punctuation_hashtags(text: str) -> str:
    words = text.split()
    cleaned = []
    for w in words:
        if w.startswith("#"):
            w = w.rstrip(",.?!;:")
        cleaned.append(w)
    return " ".join(cleaned)


def dedupe_hashtags(text: str):
    seen = set()
    out = []
    for w in text.split():
        if w.startswith("#"):
            if w.lower() not in seen:
                seen.add(w.lower())
                out.append(w)
        else:
            out.append(w)
    return " ".join(out)


def move_hashtags_to_end(text: str):
    words = text.split()
    tags = [w for w in words if w.startswith("#")]
    others = [w for w in words if not w.startswith("#")]
    return " ".join(others + tags)


def clean_and_order_hashtags(text: str):
    text = clean_punctuation_hashtags(text)
    text = dedupe_hashtags(text)
    text = move_hashtags_to_end(text)
    return text


# ============================================================
# Engagement-Aware Ranking
# ============================================================

def optimize_with_engagement(candidates: List[Dict], past_metrics: Optional[Dict] = None):
    top_keywords = []
    if past_metrics:
        top_keywords = list(past_metrics.get("top_keywords", []))[:3]

    scored = []

    for c in candidates:
        text = c.get("optimized_text", "")
        score = 0.0

        q = score_quality(text)
        if q["readability_score"] is not None:
            score += q["readability_score"] / 100
        if q["grammar_issues"] is not None:
            score -= min(1.0, 0.1 * q["grammar_issues"])

        # Keyword-boosting
        for kw in top_keywords:
            if kw.lower() in text.lower():
                score += 0.2

        c["engagement_score"] = score
        scored.append((score, c))

    scored_sorted = sorted(scored, key=lambda x: x[0], reverse=True)
    return [c for _, c in scored_sorted]


# ============================================================
# FINAL PIPELINE — FULLY UPDATED
# ============================================================

def generate_final_variations(
    topic: str,
    platform: str,
    keywords: List[str],
    audience: str,
    tone: str = "positive",
    n: int = 2,
    word_count: int = 50,
    past_metrics: Optional[Dict] = None
) -> List[Dict]:

    # Normalize keywords
    if isinstance(keywords, str):
        keywords = keywords.split(",")

    # Fast path: skip remote trend fetch by default.
    real_trends = []
    if ENABLE_TRENDING and not FAST_GENERATION:
        try:
            tf = TrendFetcher()
            real_trends = tf.fetch_google_global_trends()
        except Exception:
            logger.exception("Trend fetch failed; continuing without external trends.")
            real_trends = []

    injected_keywords = list(dict.fromkeys((keywords or []) + [t for t in real_trends if t not in (keywords or [])]))

    # Step 1: Generate raw content
    raw_variants = generate_variations(
        topic=topic,
        platform=platform,
        keywords=injected_keywords,
        audience=audience,
        tone=tone,
        word_count=word_count,
        n=n
    )

    optimized_candidates = []
    if ENABLE_TRENDING and not FAST_GENERATION:
        optimizer = TrendBasedOptimizer()
        for text in raw_variants:
            opt = optimizer.run(text)
            cleaned = clean_and_order_hashtags(opt["optimized"])
            opt["optimized_text"] = cleaned
            optimized_candidates.append(opt)
    else:
        for text in raw_variants:
            cleaned = clean_and_order_hashtags(text)
            optimized_candidates.append({
                "optimized_text": cleaned,
                "trend_score": _compute_fast_trend_score(cleaned, injected_keywords, platform),
                "insights": {
                    "keyword_hits": [k for k in injected_keywords[:5] if (k or "").lower() in cleaned.lower()]
                }
            })

    # Step 3: Engagement Ranking
    final_order = optimize_with_engagement(optimized_candidates, past_metrics)

    # Step 4: Build output objects
    results = []
    for item in final_order:
        optimized_text = item.get("optimized_text", "")

        results.append({
            "text": optimized_text,
            "quality": score_quality(optimized_text),
            "meta": {
                "topic": topic,
                "platform": platform,
                "audience": audience,
                "injected_keywords": injected_keywords,
                "trend_score": item.get("trend_score", 0),
                "trend_insights": item.get("insights", {}),
            }
        })

        # Log each generated variant to Sheets
        try:
            append_row("generated_content", [
                datetime.utcnow().isoformat(),
                platform,
                topic[:40] + "...",
                optimized_text[:80] + "...",
                item.get("trend_score", 0)
            ])
        except:
            pass

    return results


# ============================================================
# Test Run
# ============================================================

if __name__ == "__main__":
    out = generate_final_variations(
        "AI in Marketing",
        "Twitter",
        ["#AI", "#Marketing"],
        "marketers",
        "positive",
        n=2
    )

    for i, r in enumerate(out, 1):
        print(f"\nVariant {i}:")
        print("Text:", r["text"])
        print("Quality:", r["quality"])
        print("Meta:", r["meta"])
