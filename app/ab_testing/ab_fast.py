from typing import Dict, Any, List


def score_variant_fast(text: str) -> float:
    t = (text or "").strip()
    words = t.split()
    if not words:
        return 0.0

    text_lower = t.lower()
    hashtags = [w for w in t.split() if w.startswith("#")]
    unique_words = set(w.strip(".,!?;:()[]{}\"'").lower() for w in words if w.strip())
    long_words = [w for w in unique_words if len(w) >= 6]

    # More nuanced signals to avoid identical scores.
    length_score = min(len(words), 120) / 120.0
    hashtag_score = min(len(set(hashtags)), 5) / 5.0
    cta_score = 1.0 if "?" in t else 0.0
    emoji_score = 1.0 if any(ord(ch) > 10000 for ch in t) else 0.0
    lexical_diversity = len(unique_words) / max(1, len(words))
    detail_score = min(len(long_words), 20) / 20.0
    sentence_breaks = text_lower.count(".") + text_lower.count("!") + text_lower.count("?")
    readability_shape = min(sentence_breaks, 6) / 6.0

    # Penalize repetitive text heavily.
    repeat_penalty = 0.0
    if lexical_diversity < 0.35:
        repeat_penalty += 0.18
    if len(words) < 10:
        repeat_penalty += 0.12

    # Tiny deterministic tie-breaker from text hash.
    tie_break = (sum(ord(ch) for ch in text_lower) % 17) / 1000.0

    score = (
        0.28 * length_score
        + 0.14 * hashtag_score
        + 0.10 * cta_score
        + 0.05 * emoji_score
        + 0.22 * lexical_diversity
        + 0.13 * detail_score
        + 0.08 * readability_shape
        - repeat_penalty
        + tie_break
    )
    return max(0.0, min(1.0, score))


def rank_variants_fast(variants: List[str]) -> Dict[str, Any]:
    n = len(variants)
    if n == 0:
        return {
            "winner_index": 0,
            "winner_score": 0.0,
            "scores": [],
            "explanation": "No variants provided.",
        }

    # Round-robin comparison: same 2-variant logic applied to every pair.
    wins = [0] * n
    aggregate = [0.0] * n
    pair_results = []

    for i in range(n):
        for j in range(i + 1, n):
            res = simulate_ab_fast(variants[i], variants[j])
            score_i = float(res["scoreA"])
            score_j = float(res["scoreB"])
            aggregate[i] += score_i
            aggregate[j] += score_j
            if res["winner"] == "A":
                wins[i] += 1
            else:
                wins[j] += 1
            pair_results.append({
                "left_index": i,
                "right_index": j,
                "left_score": score_i,
                "right_score": score_j,
                "winner_index": i if res["winner"] == "A" else j,
            })

    scored = []
    for idx, text in enumerate(variants):
        avg_score = aggregate[idx] / max(1, n - 1)
        scored.append({
            "index": idx,
            "score": float(avg_score),
            "wins": int(wins[idx]),
            "text": text,
        })

    # Sort by wins first, then by average score.
    scored.sort(key=lambda x: (x["wins"], x["score"]), reverse=True)
    winner = scored[0]
    return {
        "winner_index": int(winner["index"]),
        "winner_score": float(winner["score"]),
        "scores": scored,
        "pair_results": pair_results,
        "explanation": f"Variant {winner['index'] + 1} wins most head-to-head matchups ({winner['wins']} wins), then ranks highest by average score.",
    }

def simulate_ab_fast(textA: str, textB: str) -> Dict[str, Any]:
    """
    Lightweight A/B scoring for real-time API responses.
    Keeps endpoint fast by avoiding heavy imports/integrations.
    """
    scoreA = score_variant_fast(textA)
    scoreB = score_variant_fast(textB)
    winner = "A" if scoreA >= scoreB else "B"
    explanation = f"Variant {winner} performs better based on fast engagement heuristics."
    return {
        "scoreA": float(scoreA),
        "scoreB": float(scoreB),
        "winner": winner,
        "explanation": explanation,
    }
