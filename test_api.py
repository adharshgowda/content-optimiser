"""
Quick health-check for every API endpoint.
Run:  python test_api.py
"""
import requests, json, sys, time

BASE = "http://localhost:8000"

def test(name, method, path, body=None, timeout=15):
    url = f"{BASE}{path}"
    print(f"\n{'='*50}")
    print(f"TEST: {name}")
    print(f"  {method} {url}")
    try:
        if method == "GET":
            r = requests.get(url, timeout=timeout)
        else:
            r = requests.post(url, json=body, timeout=timeout)
        
        if r.status_code == 200:
            data = r.json()
            preview = json.dumps(data, indent=2)[:300]
            print(f"  ✅ PASS — Status {r.status_code}")
            print(f"  Preview: {preview}")
        else:
            print(f"  ❌ FAIL — Status {r.status_code}")
            print(f"  Error: {r.text[:300]}")
    except requests.exceptions.Timeout:
        print(f"  ⏰ TIMEOUT — Server did not respond in {timeout}s")
    except requests.exceptions.ConnectionError:
        print(f"  🔌 CONNECTION ERROR — Is the server running on port 8000?")
    except Exception as e:
        print(f"  💥 ERROR — {e}")

print("="*50)
print("AI CONTENT OPTIMIZER — API TEST SUITE")
print("="*50)

# Test 1: Health check
test("Docs Page", "GET", "/docs", timeout=5)

# Test 2: Metrics (GET)
test("Recent Metrics", "GET", "/api/metrics/recent", timeout=10)

# Test 3: Sentiment
test("Sentiment Analysis", "POST", "/api/sentiment",
     {"text": "I love this amazing product! It changed my life."}, timeout=15)

# Test 4: A/B Test
test("A/B Predictor", "POST", "/api/ab-test",
     {"variantA": "AI will transform marketing forever", "variantB": "Use AI to save time on ads"}, timeout=30)

# Test 5: Content Generator
test("Content Generator", "POST", "/api/generate",
     {"topic": "AI tools", "platform": "Twitter", "keywords": ["AI"], "audience": "marketers", "tone": "professional", "word_count": 30, "n": 1}, timeout=60)

# Test 6: Scraper
test("Web Scraper", "POST", "/api/scrape-generate",
     {"url": "https://example.com", "platform": "LinkedIn", "tone": "professional", "word_count": 30, "n": 1}, timeout=60)

# Test 7: Competitor Analysis
test("Competitor Intelligence", "POST", "/api/competitor-analysis",
     {"urls": ["https://example.com"], "your_platform": "LinkedIn", "your_tone": "professional"}, timeout=30)

# Test 8: Slack
test("Slack Notification", "POST", "/api/slack/test",
     {"message": "🧪 Test from API suite"}, timeout=15)

print(f"\n{'='*50}")
print("TEST SUITE COMPLETE")
print("="*50)
