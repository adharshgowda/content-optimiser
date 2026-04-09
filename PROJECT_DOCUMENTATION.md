# AI Content Marketing Optimizer

### Complete Feature Documentation
**Built by**: [Your Name] | **Stack**: React + FastAPI + Python AI/ML

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────┐
│              REACT FRONTEND (Vite)               │
│  Dashboard • Charts • Live Pipeline Tracker      │
└──────────────────────┬──────────────────────────┘
                       │ REST API (JSON)
┌──────────────────────▼──────────────────────────┐
│              FASTAPI BACKEND (Python)            │
│  Content Engine • Sentiment • A/B • ML Model     │
└──────────────────────┬──────────────────────────┘
                       │
    ┌──────────┬───────┼──────────┬────────────┐
    ▼          ▼       ▼          ▼            ▼
  Groq AI   Google   Slack    Google       Local
  (LLaMA)   Trends   API     Sheets       CSV DB
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, CSS (Glassmorphism) |
| Backend | FastAPI, Uvicorn, Python 3.13 |
| AI/LLM | Groq (LLaMA 3.3 70B), Google Gemini (fallback) |
| NLP | HuggingFace Transformers, spaCy, TextBlob |
| ML | TensorFlow, scikit-learn |
| Trends | PyTrends (Google Trends), PRAW (Reddit) |
| Integrations | Slack Webhooks, Google Sheets API, Tweepy (Twitter) |
| Data | Pandas, local CSV storage |

---

## Feature 1: ✍️ Content Generator

**What it does**: Generates multiple AI-powered social media post variants optimized for a specific platform, audience, and tone.

**How it works**:
1. User inputs: topic, platform (Twitter/LinkedIn/Facebook/Instagram), keywords, audience, tone, word count
2. Backend fetches **real-time Google Trends** data and injects trending keywords into the prompt
3. Groq AI (LLaMA 3.3 70B) generates N post variants
4. Each variant goes through **Trend-Based Optimization** — rewording to include currently trending phrases
5. Posts are scored for **readability** (Flesch score) and **grammar quality**
6. Results are ranked by engagement score and returned with trend scores

**API**: `POST /api/generate`

---

## Feature 2: 🌍 Web Scraper + Content Generator

**What it does**: Takes any article URL, reads its content, and generates social media posts based on the article.

**How it works**:
1. User pastes a blog/news URL (e.g., TechCrunch, Medium)
2. Backend uses **BeautifulSoup** to scrape the page, removing navigation, ads, and boilerplate
3. Extracted text is sent to the AI with a prompt: "Summarize this into a viral [platform] post"
4. AI generates multiple variants optimized for the chosen platform and tone
5. Each variant is trend-optimized and quality-scored

**API**: `POST /api/scrape-generate`

**Use Case**: A marketer sees a breaking news article → pastes the URL → gets ready-to-publish posts in seconds.

---

## Feature 3: 💬 Sentiment Analysis Engine

**What it does**: Analyzes any text and returns its emotional profile — sentiment label, confidence score, polarity, and individual emotion breakdown.

**How it works**:
1. User inputs any text (a tweet, comment, review, etc.)
2. Backend runs it through **HuggingFace Transformer models**:
   - `distilbert-base-uncased-finetuned-sst-2-english` for sentiment classification
   - `j-hartmann/emotion-english-distilbert-base-uncased` for emotion detection
   - `TextBlob` for polarity scoring
3. Returns: `POSITIVE/NEGATIVE/NEUTRAL` label, confidence score (0–1), polarity (-1 to +1), and emotion breakdown (joy, anger, fear, sadness, surprise)

**API**: `POST /api/sentiment`

**Example Output**:
```json
{
  "sentiment_label": "POSITIVE",
  "sentiment_score": 0.9999,
  "polarity": 0.55,
  "emotions": { "joy": 0.97, "anger": 0.001, "surprise": 0.03 }
}
```

---

## Feature 4: 🆚 A/B Testing Predictor

**What it does**: Compares two content variants and predicts which one will perform better using simulated engagement scoring.

**How it works**:
1. User inputs Variant A and Variant B text
2. Backend's `ABCoach` module scores each variant based on:
   - Sentiment analysis scores
   - Language complexity and readability
   - Keyword density and engagement patterns
3. Returns winner, scores for both, and an AI explanation of why one is better

**API**: `POST /api/ab-test`

**Example Output**:
```json
{
  "scoreA": 0.35,
  "scoreB": 0.26,
  "winner": "A",
  "explanation": "Variant A performs better based on simulated engagement scoring."
}
```

---

## Feature 5: 🚀 Campaign Autopilot (Advanced Feature)

**What it does**: Chains ALL 5 tools together into one automated pipeline. One click runs the entire marketing workflow.

**How it works**:
```
User pastes a URL + picks platform + tone
              ↓
Step 1: 🌍 Web Scraper     → Reads the article content
              ↓
Step 2: ✍️ Content Gen     → Creates 4 social media post variants
              ↓
Step 3: 💬 Sentiment       → Scores each variant's tone and emotion
              ↓
Step 4: ⚔️ A/B Predictor  → Picks top 2, compares, selects the winner
              ↓
Step 5: 📣 Slack Broadcast → Sends the winning post to your Slack team
```

**UI Features**:
- Live animated step-by-step progress tracker
- Real-time progress bar showing % complete
- Final "🏆 Winning Post" card with copy button
- AI explanation of why that post won
- Error handling with per-step failure reporting

**Why it's impressive**: This is a **full orchestration engine** — it demonstrates API chaining, state management, error handling, and real-time UI updates.

---

## Feature 6: 🔍 Competitor Intelligence Gap Finder (Advanced Feature)

**What it does**: Scrapes multiple competitor websites, maps their topic coverage, identifies content gaps, and generates content to fill those gaps.

**How it works**:
1. User adds 2–5 competitor blog/article URLs
2. Backend scrapes all URLs using BeautifulSoup
3. All text is combined and tokenized — stop words filtered out
4. **Topic Clustering**: Words are matched against 8 predefined topic categories:
   - AI & Automation, Marketing Strategy, Content Creation, Social Media, Data & Analytics, Productivity, Startup & Business, SEO & Growth
5. Each topic gets a **coverage score** (0–100%) based on keyword frequency
6. Topics with low coverage = **Content Gaps** = your opportunity
7. One-click "⚡ Steal This Gap" button generates your post on that topic

**API**: `POST /api/competitor-analysis`

**UI Features**:
- Topic coverage bar chart (color-coded: 🟢 low = opportunity, 🔴 high = saturated)
- Content gap cards with opportunity percentages
- Per-URL keyword profiles showing each competitor's focus
- Inline content generation with copy button

---

## Feature 7: 🏆 Gamified Analytics Dashboard

**What it does**: Displays campaign performance data with interactive charts — CTR, sentiment trends, conversion rates across all campaigns.

**How it works**:
- Reads from local CSV files (`data/campaigns1.csv`)
- Optional sync to Google Sheets for cloud backup
- Shows metrics: impressions, clicks, conversions, CTR, sentiment scores, trend scores
- Data is recorded automatically when A/B tests complete or pipeline runs

**API**: `GET /api/metrics/recent`

---

## Feature 8: 🔔 Slack Integration

**What it does**: Sends any message or generated content directly to a Slack channel via webhook.

**How it works**:
1. Uses Slack Incoming Webhooks (no OAuth required)
2. Automatically notifies team when:
   - A/B test completes (with winner + scores)
   - Campaign Pipeline finishes (winning post sent)
   - Manual messages from the Slack Sync panel

**API**: `POST /api/slack/test`

---

## Feature 9: ⚒️ ML Model Hub

**What it does**: Trains and manages machine learning models for content performance prediction.

**How it works**:
- Uses historical campaign data (CTR, sentiment, trend scores)
- Trains a prediction model using scikit-learn / TensorFlow
- Auto-retrainer runs periodic retraining cycles
- Slack notifications on retraining completion

**APIs**: `POST /api/model/train`, `POST /api/model/auto-retrain`

---

## API Endpoints Summary

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/generate` | Generate AI content variants |
| POST | `/api/scrape-generate` | Scrape URL + generate posts |
| POST | `/api/sentiment` | Analyze text sentiment |
| POST | `/api/ab-test` | Compare two variants |
| POST | `/api/competitor-analysis` | Analyze competitor content gaps |
| GET | `/api/metrics/recent` | Fetch campaign analytics |
| POST | `/api/metrics/record-demo` | Record campaign metrics |
| POST | `/api/metrics/push-daily` | Push daily metrics |
| POST | `/api/slack/test` | Send Slack notification |
| POST | `/api/model/train` | Train ML model |
| POST | `/api/model/auto-retrain` | Auto-retrain pipeline |

---

## How to Run

**Step 1 — Start Backend** (Terminal 1):
```bash
cd content-marketing-optimizer-final
python -m uvicorn api:app --reload
```
Wait for `Application startup complete`.

**Step 2 — Start Frontend** (Terminal 2):
```bash
cd content-marketing-optimizer-final/frontend
npm run dev
```
Open the URL shown (usually `http://localhost:5174`).

---

## Required API Keys

| Key | Required? | Purpose |
|---|---|---|
| `GROQ_API_KEY` | ✅ Yes | Powers all AI content generation |
| `SLACK_WEBHOOK_URL` | Optional | Enables Slack notifications |
| `GEMINI_API_KEY` | Optional | Backup AI if Groq is down |
| `TWITTER_API_KEY` | Optional | Live social media metrics |
| `REDDIT_CLIENT_ID` | Optional | Reddit trending topics |
| `GOOGLE_SHEET_ID` | Optional | Cloud backup (local CSV works without it) |

---

*Built with ❤️ using React, FastAPI, Groq AI, and Python ML*
