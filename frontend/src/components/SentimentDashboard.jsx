import { useState } from 'react';

const sentimentConfig = {
  POSITIVE: { color: '#22c55e', bg: 'rgba(34,197,94,0.08)', border: 'rgba(34,197,94,0.25)', icon: '😊', label: 'Positive' },
  NEGATIVE: { color: '#ef4444', bg: 'rgba(239,68,68,0.08)', border: 'rgba(239,68,68,0.25)', icon: '😞', label: 'Negative' },
  NEUTRAL:  { color: '#94a3b8', bg: 'rgba(148,163,184,0.08)', border: 'rgba(148,163,184,0.2)', icon: '😐', label: 'Neutral' },
};

const card = { background: 'rgba(15,20,35,0.7)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '20px', padding: '2rem', backdropFilter: 'blur(12px)' };
const label = { display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.6rem' };
const inputBase = { width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '0.85rem 1.1rem', color: '#f1f5f9', fontSize: '0.95rem', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.2s, box-shadow 0.2s', resize: 'vertical' };

export default function SentimentDashboard({ initialVariants }) {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [manualText, setManualText] = useState('');
  const [focused, setFocused] = useState(false);

  const analyzeAll = async () => {
    if (!initialVariants?.length) return;
    setLoading(true);
    try {
      // Fire all requests in parallel instead of waiting one-by-one.
      const requests = initialVariants.map(async (v) => {
        const text = v?.text || '';
        const res = await fetch('/api/sentiment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data?.detail || 'Sentiment request failed');
        return { text, sentiment: data.sentiment };
      });

      const settled = await Promise.allSettled(requests);
      const arr = settled
        .filter((item) => item.status === 'fulfilled')
        .map((item) => item.value);
      setResults(arr);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const analyzeManual = async () => {
    if (!manualText.trim()) return;
    setLoading(true);
    try {
      const res = await fetch('/api/sentiment', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text: manualText }) });
      const data = await res.json();
      setResults([{ text: manualText, sentiment: data.sentiment }]);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ width: '100%' }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}} @keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none}}`}</style>
      <div style={{ marginBottom: '2.5rem' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(168,85,247,0.08)', border: '1px solid rgba(168,85,247,0.2)', borderRadius: '999px', padding: '0.3rem 0.9rem', marginBottom: '1rem' }}>
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#a855f7' }} />
          <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#a855f7', textTransform: 'uppercase', letterSpacing: '0.1em' }}>NLP Analysis</span>
        </div>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.03em', color: '#f1f5f9', marginBottom: '0.5rem' }}>Sentiment Engine</h1>
        <p style={{ color: '#64748b', fontSize: '0.95rem' }}>Deep NLP analysis for emotion, toxicity, and overall sentiment.</p>
      </div>

      <div style={card}>
        {initialVariants?.length > 0 ? (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem', background: 'rgba(168,85,247,0.06)', border: '1px solid rgba(168,85,247,0.15)', borderRadius: '14px', padding: '1.2rem' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(168,85,247,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', flexShrink: 0 }}>📦</div>
              <div>
                <div style={{ fontWeight: 700, color: '#f1f5f9', marginBottom: '0.2rem' }}>{initialVariants.length} Variants Ready</div>
                <div style={{ fontSize: '0.85rem', color: '#64748b' }}>Generated from Content Generator — ready for instant analysis</div>
              </div>
            </div>
            <button onClick={analyzeAll} disabled={loading} style={{ width: '100%', padding: '1.1rem', background: loading ? 'rgba(168,85,247,0.25)' : 'linear-gradient(135deg,#a855f7,#7c3aed)', border: 'none', borderRadius: '14px', color: 'white', fontSize: '1.05rem', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'inherit', boxShadow: loading ? 'none' : '0 6px 24px rgba(168,85,247,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem', transition: 'all 0.3s' }}>
              {loading ? <><div style={{ width: '18px', height: '18px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} /> Analyzing All...</> : '🔍 Analyze All Variants'}
            </button>
          </div>
        ) : (
          <div>
            <label style={label}>Paste text to analyze</label>
            <textarea rows={6} value={manualText} onChange={e => setManualText(e.target.value)} placeholder="Enter your marketing copy, tweet, caption or any text here..."
              onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
              style={{ ...inputBase, borderColor: focused ? 'rgba(168,85,247,0.5)' : 'rgba(255,255,255,0.08)', boxShadow: focused ? '0 0 0 3px rgba(168,85,247,0.1)' : 'none', marginBottom: '1.2rem' }} />
            <button onClick={analyzeManual} disabled={loading || !manualText.trim()} style={{ width: '100%', padding: '1.1rem', background: loading ? 'rgba(168,85,247,0.25)' : 'linear-gradient(135deg,#a855f7,#7c3aed)', border: 'none', borderRadius: '14px', color: 'white', fontSize: '1.05rem', fontWeight: 700, cursor: loading || !manualText.trim() ? 'not-allowed' : 'pointer', fontFamily: 'inherit', boxShadow: loading ? 'none' : '0 6px 24px rgba(168,85,247,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem', transition: 'all 0.3s', opacity: !manualText.trim() ? 0.5 : 1 }}>
              {loading ? <><div style={{ width: '18px', height: '18px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} /> Analyzing...</> : '🔍 Analyze Sentiment'}
            </button>
          </div>
        )}
      </div>

      {results.length > 0 && (
        <div style={{ marginTop: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#f1f5f9', letterSpacing: '-0.02em' }}>Analysis Results</h3>
            <span style={{ fontSize: '0.8rem', color: '#64748b', background: 'rgba(255,255,255,0.05)', padding: '0.3rem 0.8rem', borderRadius: '999px', border: '1px solid rgba(255,255,255,0.07)' }}>{results.length} analyzed</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
            {results.map((r, idx) => {
              const rawLabel = (r.sentiment?.sentiment_label || 'NEUTRAL').toUpperCase();
              const cfg = sentimentConfig[rawLabel] || sentimentConfig.NEUTRAL;
              const score = ((r.sentiment?.sentiment_score || 0) * 100).toFixed(0);
              return (
                <div key={idx} style={{ background: 'rgba(15,20,35,0.7)', border: `1px solid ${cfg.border}`, borderRadius: '18px', padding: '1.8rem', animation: 'fadeUp 0.4s ease forwards', animationDelay: `${idx * 0.1}s`, opacity: 0, position: 'relative', overflow: 'hidden' }}>
                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: `linear-gradient(90deg, ${cfg.color}, transparent)` }} />
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: cfg.bg, border: `1px solid ${cfg.border}`, borderRadius: '999px', padding: '0.4rem 1rem' }}>
                      <span>{cfg.icon}</span>
                      <span style={{ color: cfg.color, fontWeight: 700, fontSize: '0.85rem' }}>{cfg.label} — {score}%</span>
                    </div>
                    {r.sentiment?.dominant_emotion && (
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '999px', padding: '0.4rem 0.9rem' }}>
                        <span style={{ fontSize: '0.82rem', color: '#94a3b8', fontWeight: 600 }}>🎭 {r.sentiment.dominant_emotion}</span>
                      </div>
                    )}
                    {r.sentiment?.readability_score && (
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '999px', padding: '0.4rem 0.9rem' }}>
                        <span style={{ fontSize: '0.82rem', color: '#94a3b8', fontWeight: 600 }}>📖 Readability: {r.sentiment.readability_score.toFixed(1)}</span>
                      </div>
                    )}
                    {r.sentiment?.toxicity !== undefined && (
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: r.sentiment.toxicity > 0.5 ? 'rgba(239,68,68,0.08)' : 'rgba(34,197,94,0.08)', border: `1px solid ${r.sentiment.toxicity > 0.5 ? 'rgba(239,68,68,0.25)' : 'rgba(34,197,94,0.2)'}`, borderRadius: '999px', padding: '0.4rem 0.9rem' }}>
                        <span style={{ fontSize: '0.82rem', color: r.sentiment.toxicity > 0.5 ? '#ef4444' : '#22c55e', fontWeight: 600 }}>⚗️ Toxicity: {(r.sentiment.toxicity * 100).toFixed(1)}%</span>
                      </div>
                    )}
                  </div>
                  {/* Score bar */}
                  <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '999px', height: '6px', marginBottom: '1.2rem', overflow: 'hidden' }}>
                    <div style={{ width: `${score}%`, height: '100%', background: `linear-gradient(90deg, ${cfg.color}80, ${cfg.color})`, borderRadius: '999px', transition: 'width 1s ease' }} />
                  </div>
                  <p style={{ color: '#94a3b8', lineHeight: 1.75, fontSize: '0.92rem', fontStyle: 'italic', margin: 0 }}>"{r.text}"</p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
