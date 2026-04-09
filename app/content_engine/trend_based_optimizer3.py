# trend_based_optimizer3.py (UPDATED FULL VERSION)
import logging
from datetime import datetime

from app.integrations.trend_fetcher import TrendFetcher
from app.integrations.sheets_connector import append_row

logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)
if not logger.handlers:
    ch = logging.StreamHandler()
    ch.setLevel(logging.INFO)
    logger.addHandler(ch)


class TrendBasedOptimizer:
    """
    Trend-Based Optimizer
    ----------------------
    Enhances generated marketing content using real trend signals from:

        • Google Trends (PyTrends)
        • Reddit Hot Topics
        • Keyword Extraction (spaCy)

    Provides:
        - Trend score (0–100)
        - Trend insights (rising queries, related topics)
        - Optimized version of the content
        - Writes trend scoring rows to Google Sheets
    """

    def __init__(self):
        logger.info("Initializing TrendBasedOptimizer with TrendFetcher...")
        self.fetcher = TrendFetcher()

    # ----------------------------------------------------------------------
    # Generate Trend Score + Insights for a given content text
    # ----------------------------------------------------------------------
    def analyze_trends(self, text: str):
        """
        Returns:
            trend_score: int 0–100
            insights: dict of keyword → rising queries & score
        """
        trend_score = self.fetcher.get_combined_trend_score(text)
        insights = self.fetcher.get_trend_insights(text)

        return trend_score, insights

    # ----------------------------------------------------------------------
    # Core Optimization Logic
    # ----------------------------------------------------------------------
    def optimize_content(self, original_text: str) -> dict:
        """
        Takes the generated content and boosts it with trend-awareness.

        Returns dictionary:
            {
                "original": "...",
                "optimized": "...",
                "trend_score": 0-100,
                "insights": {...}
            }
        """

        trend_score, insights = self.analyze_trends(original_text)

        # Build optimization insights for metadata only.
        trending_keywords = list(insights.keys())
        rising_phrases = []
        for kw, detail in insights.items():
            rising = detail.get("rising_queries", [])
            if rising:
                rising_phrases.extend(rising)

        # Keep generated text focused on user's topic.
        # Trend data is returned as metadata and should not mutate post body.
        optimized_text = original_text

        # Log results to Google Sheets
        try:
            append_row("trend_scores", [
                datetime.utcnow().isoformat(),
                original_text[:60] + "...",
                trend_score,
                ", ".join(trending_keywords[:5])
            ])
        except Exception as e:
            logger.warning(f"Could not write trend data to sheets: {e}")

        return {
            "original": original_text,
            "optimized": optimized_text,
            "trend_score": trend_score,
            "insights": insights
        }

    # ----------------------------------------------------------------------
    # Public Entry Point
    # ----------------------------------------------------------------------
    def run(self, text: str):
        """
        Simple wrapper for pipeline usage.
        """
        return self.optimize_content(text)


# ----------------------------------------------------------------------
# Developer Test (Keep for your students)
# ----------------------------------------------------------------------
if __name__ == "__main__":
    sample_text = "AI marketing automation tool to boost business growth"

    optimizer = TrendBasedOptimizer()
    output = optimizer.run(sample_text)

    print("Original:", output["original"])
    print("\nOptimized:", output["optimized"])
    print("\nTrend Score:", output["trend_score"])
    print("\nInsights:", output["insights"])
