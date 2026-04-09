from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import pandas as pd
from datetime import datetime
import json
import os

app = FastAPI(title="AI Content Marketing Optimizer API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

# --- Import modules (wrapped in try-except for dummy fallbacks if keys are missing) ---
try:
    from app.content_engine.content_generator3 import generate_final_variations
except ImportError:
    generate_final_variations = None
    
try:
    from app.content_engine.url_scraper import extract_text_from_url
except ImportError:
    extract_text_from_url = None

try:
    from app.sentiment_engine.sentiment_analyzer2 import analyze_sentiment
except ImportError:
    analyze_sentiment = None

try:
    from app.ab_testing.ab_fast import simulate_ab_fast, rank_variants_fast
except ImportError:
    simulate_ab_fast = None
    rank_variants_fast = None

try:
    from app.metrics_engine.metrics_tracker2 import push_daily_metrics
except ImportError:
    push_daily_metrics = None

try:
    from app.metrics_engine.metrics_hub2 import record_campaign_metrics, fetch_recent_metrics
except ImportError:
    record_campaign_metrics = None
    fetch_recent_metrics = None

try:
    from app.ml_engine.train_model3 import train
except ImportError:
    train = None

try:
    from app.ml_engine.auto_retrainer import AutoRetrainer
except ImportError:
    AutoRetrainer = None

try:
    from app.integrations.slack_notifier3 import SlackNotifier
except ImportError:
    SlackNotifier = None


# --- Models ---
class GenerateRequest(BaseModel):
    topic: str
    platform: str
    keywords: List[str]
    audience: str
    tone: str
    word_count: int = 50
    n: int = 2

class SentimentRequest(BaseModel):
    text: str

class ABTestRequest(BaseModel):
    variantA: str
    variantB: str

class ABMultiRequest(BaseModel):
    variants: List[str]

class MetricsRecordRequest(BaseModel):
    winner: str
    score: float
    platform: str = "auto-platform"

class DailyMetricsPushRequest(BaseModel):
    impressions: int
    clicks: int
    likes: int
    comments: int
    shares: int
    conversions: int
    trend_score: float

class SlackMessageRequest(BaseModel):
    message: str

class ScrapeGenerateRequest(BaseModel):
    url: str
    platform: str
    tone: str
    word_count: int = 50
    n: int = 2

# --- Endpoints ---

@app.post("/api/generate")
def generate_content(req: GenerateRequest):
    if not generate_final_variations:
        raise HTTPException(status_code=500, detail="Generator module not found")
    try:
        variants = generate_final_variations(
            topic=req.topic,
            platform=req.platform,
            keywords=req.keywords,
            audience=req.audience,
            tone=req.tone,
            n=req.n,
            word_count=req.word_count
        )
        return {"variants": variants}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/scrape-generate")
def scrape_and_generate(req: ScrapeGenerateRequest):
    if not extract_text_from_url or not generate_final_variations:
        raise HTTPException(status_code=500, detail="Scraper or Generator module not found")
    
    try:
        # 1. Scrape the URL
        article_text = extract_text_from_url(req.url)
        
        # 2. Tell the LLM to summarize this specific article text
        custom_topic = f"Summarize this article into a viral {req.platform} post. Article text: {article_text}"
        
        # 3. Use the existing generator logic
        variants = generate_final_variations(
            topic=custom_topic,
            platform=req.platform,
            keywords=["#NewsJacking", "#Update"], # Default keywords for news
            audience="General Audience",
            tone=req.tone,
            n=req.n,
            word_count=req.word_count
        )
        return {"article_excerpt": article_text[:300] + "...", "variants": variants}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/sentiment")
def analyze_content_sentiment(req: SentimentRequest):
    if not analyze_sentiment:
        raise HTTPException(status_code=500, detail="Sentiment analyzer not found")
    try:
        # analyze_sentiment might accept a string or list and return list
        result = analyze_sentiment(req.text)
        if isinstance(result, list) and len(result) > 0:
            return {"sentiment": result[0]}
        return {"sentiment": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/ab-test")
def run_ab_test(req: ABTestRequest):
    if not simulate_ab_fast:
        raise HTTPException(status_code=500, detail="A/B fast analyzer not found")
    try:
        out = simulate_ab_fast(req.variantA, req.variantB)
        
        # Optional auto slack alert on A/B test completion (disabled by default for speed)
        if SlackNotifier and os.getenv("ENABLE_SLACK_NOTIFICATIONS", "false").lower() == "true":
            try:
                notifier = SlackNotifier()
                ab_message = (
                    f"📊 *A/B Test Completed!*\n"
                    f"• *Variant A Score:* {out['scoreA']:.2f}\n"
                    f"• *Variant B Score:* {out['scoreB']:.2f}\n"
                    f"🏆 *Winner:* Variant {out['winner']}\n"
                    f"💬 *Reason:* {out['explanation']}"
                )
                notifier.send_message(ab_message)
            except:
                pass

        return {"result": out}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/ab-test/multi")
def run_ab_test_multi(req: ABMultiRequest):
    if not rank_variants_fast:
        raise HTTPException(status_code=500, detail="A/B multi analyzer not found")
    try:
        variants = [v for v in req.variants if isinstance(v, str) and v.strip()]
        if len(variants) < 2:
            raise HTTPException(status_code=400, detail="At least 2 variants are required")
        out = rank_variants_fast(variants)
        return {"result": out}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/metrics/record-demo")
def record_demo_metrics(req: MetricsRecordRequest):
    if not record_campaign_metrics:
        raise HTTPException(status_code=500, detail="record_campaign_metrics not found")
    try:
        campaign_id = f"demo_{int(datetime.now().timestamp())}"
        record_campaign_metrics(
            campaign_id=campaign_id,
            variant=req.winner,
            impressions=1000,
            clicks=int(100 * req.score),
            conversions=int(10 * req.score),
            sentiment_score=req.score,
            trend_score=50.0,
            platform=req.platform,
            post_id=""
        )
        return {"status": "success", "campaign_id": campaign_id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/metrics/push-daily")
def push_daily(req: DailyMetricsPushRequest):
    if not push_daily_metrics:
        raise HTTPException(status_code=500, detail="push_daily_metrics not found")
    try:
        df = pd.DataFrame([req.model_dump()])
        res = push_daily_metrics(df)
        return {"status": "success", "info": res}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/metrics/recent")
def get_recent_metrics():
    if not fetch_recent_metrics:
        return {"metrics": []}
    try:
        df = fetch_recent_metrics(limit=20)
        # Replace NaN/inf with None for JSON serialization
        import numpy as np
        df = df.replace([np.inf, -np.inf], np.nan)
        records = df.to_dict(orient="records")
        # Convert any remaining NaN to None (JSON-safe)
        clean = []
        for row in records:
            clean.append({k: (None if isinstance(v, float) and (v != v) else v) for k, v in row.items()})
        return {"metrics": clean}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/model/train")
def train_model():
    if not train:
        raise HTTPException(status_code=500, detail="train module not found")
    try:
        stats = train()
        return {"stats": stats}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/model/auto-retrain")
def auto_retrain():
    if not AutoRetrainer:
        raise HTTPException(status_code=500, detail="AutoRetrainer not found")
    try:
        retrainer = AutoRetrainer()
        retrainer.run_full_cycle()
        
        if SlackNotifier:
            try:
                notifier = SlackNotifier()
                notifier.send_message(
                    "🤖 *Auto Retrainer Completed Successfully!*\n"
                    "The ML model has been retrained using the latest campaign data. 🚀"
                )
            except:
                pass

        return {"status": "success"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/slack/test")
def send_slack_test(req: SlackMessageRequest):
    if not SlackNotifier:
        raise HTTPException(status_code=500, detail="SlackNotifier not found")
    try:
        notifier = SlackNotifier()
        ok = notifier.send_message(req.message)
        if ok:
            return {"status": "success"}
        else:
            raise HTTPException(status_code=500, detail="Slack message failed to send")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

class CompetitorAnalysisRequest(BaseModel):
    urls: List[str]
    your_platform: str = "LinkedIn"
    your_tone: str = "professional"

@app.post("/api/competitor-analysis")
def analyze_competitors(req: CompetitorAnalysisRequest):
    if not extract_text_from_url:
        raise HTTPException(status_code=500, detail="Scraper module not found")

    import re
    from collections import Counter

    # Common English stop words to filter out
    STOP_WORDS = set([
        "the","a","an","and","or","but","in","on","at","to","for","of","with",
        "is","are","was","were","be","been","being","have","has","had","do","does",
        "did","will","would","could","should","may","might","shall","can","need",
        "this","that","these","those","it","its","we","our","you","your","they",
        "their","he","his","she","her","i","my","me","us","them","who","what",
        "which","how","when","where","why","all","also","more","as","by","from",
        "not","no","so","if","about","into","than","then","some","only","very",
        "just","up","out","there","here","get","use","new","one","two","time",
        "way","make","take","know","see","look","come","go","say","tell","give",
    ])

    TOPIC_SEEDS = {
        "AI & Automation": ["ai","artificial intelligence","automation","machine learning","ml","llm","gpt","chatbot","model"],
        "Marketing Strategy": ["marketing","strategy","campaign","brand","audience","conversion","funnel","growth"],
        "Content Creation": ["content","writing","copy","blog","post","article","storytelling","creative"],
        "Social Media": ["social","twitter","linkedin","instagram","facebook","tiktok","viral","engagement"],
        "Data & Analytics": ["data","analytics","metrics","kpi","insights","tracking","performance","dashboard"],
        "Productivity": ["productivity","workflow","tools","efficiency","automation","time","management","team"],
        "Startup & Business": ["startup","business","founder","entrepreneurship","saas","product","launch","revenue"],
        "SEO & Growth": ["seo","search","ranking","traffic","backlinks","keywords","organic","growth hacking"],
    }

    scraped = []
    errors = []
    for url in req.urls[:5]:
        try:
            text = extract_text_from_url(url)
            scraped.append({"url": url, "text": text, "word_count": len(text.split())})
        except Exception as e:
            errors.append({"url": url, "error": str(e)})

    if not scraped:
        raise HTTPException(status_code=400, detail="Could not scrape any of the provided URLs.")

    # Combine all text and tokenise
    all_text = " ".join(s["text"].lower() for s in scraped)
    words = re.findall(r'\b[a-z]{4,}\b', all_text)
    filtered = [w for w in words if w not in STOP_WORDS]
    word_freq = Counter(filtered)
    top_words = [w for w, _ in word_freq.most_common(120)]

    # Score each topic seed against top words
    topic_scores = {}
    for topic, seeds in TOPIC_SEEDS.items():
        score = sum(1 for s in seeds if any(s in w or w in s for w in top_words[:60]))
        topic_scores[topic] = round((score / len(seeds)) * 100)

    # Sort topics by coverage (high = they cover it a lot = less opportunity)
    sorted_topics = sorted(topic_scores.items(), key=lambda x: x[1])
    gaps = [{"topic": t, "coverage": c, "opportunity": max(0, 100 - c)} for t, c in sorted_topics]

    # Top 3 gap opportunities (lowest coverage)
    top_gaps = [g for g in gaps if g["coverage"] < 40][:3]

    # Per-URL breakdown: top 5 keywords each
    url_profiles = []
    for s in scraped:
        words_u = re.findall(r'\b[a-z]{4,}\b', s["text"].lower())
        freq_u = Counter(w for w in words_u if w not in STOP_WORDS)
        url_profiles.append({
            "url": s["url"],
            "word_count": s["word_count"],
            "top_keywords": [w for w, _ in freq_u.most_common(8)],
        })

    # Activity timeline: rough posting frequency guess from word count
    total_words = sum(s["word_count"] for s in scraped)

    return {
        "topic_coverage": gaps,
        "top_gaps": top_gaps,
        "url_profiles": url_profiles,
        "total_words_scraped": total_words,
        "urls_scraped": len(scraped),
        "errors": errors,
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("api:app", host="0.0.0.0", port=8000, reload=True)
