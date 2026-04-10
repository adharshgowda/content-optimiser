import { useState } from 'react';

const card = { background: 'rgba(15,20,35,0.7)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '20px', padding: '2rem', backdropFilter: 'blur(12px)' };
const labelStyle = { display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.6rem' };
const inputBase = { width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '0.85rem 1.1rem', color: '#f1f5f9', fontSize: '0.95rem', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.2s, box-shadow 0.2s' };
const ToneColors = { Professional: '#3b82f6', Engaging: '#f97316', Funny: '#f59e0b', Urgent: '#ef4444', Educational: '#22c55e' };
const PlatformIcons = { Twitter: '🐦', LinkedIn: '💼', Facebook: '📘', Instagram: '📸' };

export default function WebScraperCard({ onGenerated }) {
  const [url, setUrl] = useState('');
  const [platform, setPlatform] = useState('Twitter');
  const [tone, setTone] = useState('Professional');
  const [wordCount, setWordCount] = useState(50);
  const [variantsCount, setVariantsCount] = useState(2);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [excerpt, setExcerpt] = useState('');
  const [error, setError] = useState(null);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [urlFocused, setUrlFocused] = useState(false);

  const handleScrape = async (e) => {
    e.preventDefault();
    if (!url) return;
    setLoading(true); setError(null); setResults(null); setExcerpt('');
    try {
      const res = await fetch('/api/scrape-generate', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, platform, tone, word_count: wordCount, n: variantsCount })
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setExcerpt(data.article_excerpt);
      setResults(data.variants);
      if (onGenerated) onGenerated(data.variants);
    } catch (err) { setError(err.message || 'Failed to scrape. Check your URL and API keys.'); }
    finally { setLoading(false); }
  };

  const copy = (text, idx) => { navigator.clipboard.writeText(text); setCopiedIndex(idx); setTimeout(() => setCopiedIndex(null), 2000); };

  return (
    <div style={{ width: '100%' }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}} @keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none}}`}</style>
      <div style={{ marginBottom: '2.5rem' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.2)', borderRadius: '999px', padding: '0.3rem 0.9rem', marginBottom: '1rem' }}>
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#3b82f6' }} />
          <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#3b82f6', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Web Intelligence</span>
        </div>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.03em', color: '#f1f5f9', marginBottom: '0.5rem' }}>Web Scraper & Auto-Writer</h1>
        <p style={{ color: '#64748b', fontSize: '0.95rem' }}>Paste any article URL. AI reads it and instantly generates platform-optimized social posts.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        {/* Left: Controls */}
        <div style={card}>
          <form onSubmit={handleScrape}>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={labelStyle}>Article URL to Scrape</label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', fontSize: '1.1rem' }}>🌍</span>
                <input type="url" value={url} onChange={e => setUrl(e.target.value)} placeholder="https://techcrunch.com/article..." required
                  onFocus={() => setUrlFocused(true)} onBlur={() => setUrlFocused(false)}
                  style={{ ...inputBase, paddingLeft: '2.5rem', borderColor: urlFocused ? 'rgba(59,130,246,0.5)' : 'rgba(255,255,255,0.08)', boxShadow: urlFocused ? '0 0 0 3px rgba(59,130,246,0.1)' : 'none' }} />
              </div>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={labelStyle}>Target Platform</label>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {['Twitter','LinkedIn','Facebook','Instagram'].map(p => (
                  <button type="button" key={p} onClick={() => setPlatform(p)} style={{ padding: '0.5rem 0.9rem', borderRadius: '10px', border: `1px solid ${platform === p ? 'rgba(59,130,246,0.5)' : 'rgba(255,255,255,0.08)'}`, background: platform === p ? 'rgba(59,130,246,0.12)' : 'rgba(255,255,255,0.04)', color: platform === p ? '#3b82f6' : '#94a3b8', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s' }}>
                    {PlatformIcons[p]} {p}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={labelStyle}>Brand Tone</label>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {Object.entries(ToneColors).map(([t, c]) => (
                  <button type="button" key={t} onClick={() => setTone(t)} style={{ padding: '0.5rem 0.9rem', borderRadius: '10px', border: `1px solid ${tone === t ? c + '60' : 'rgba(255,255,255,0.08)'}`, background: tone === t ? c + '15' : 'rgba(255,255,255,0.04)', color: tone === t ? c : '#94a3b8', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s' }}>
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
              <div>
                <label style={labelStyle}>Words: <span style={{ color: '#3b82f6', fontWeight: 800 }}>{wordCount}</span></label>
                <input type="range" min="20" max="250" value={wordCount} onChange={e => setWordCount(parseInt(e.target.value))} style={{ width: '100%', accentColor: '#3b82f6', cursor: 'pointer' }} />
              </div>
              <div>
                <label style={labelStyle}>Variants: <span style={{ color: '#3b82f6', fontWeight: 800 }}>{variantsCount}</span></label>
                <input type="range" min="1" max="5" value={variantsCount} onChange={e => setVariantsCount(parseInt(e.target.value))} style={{ width: '100%', accentColor: '#3b82f6', cursor: 'pointer' }} />
              </div>
            </div>

            <button type="submit" disabled={loading || !url} style={{ width: '100%', padding: '1.1rem', background: loading ? 'rgba(59,130,246,0.25)' : 'linear-gradient(135deg,#3b82f6,#6366f1)', border: 'none', borderRadius: '14px', color: 'white', fontSize: '1.05rem', fontWeight: 700, cursor: loading || !url ? 'not-allowed' : 'pointer', fontFamily: 'inherit', boxShadow: loading ? 'none' : '0 6px 24px rgba(59,130,246,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem', transition: 'all 0.3s', opacity: !url ? 0.6 : 1 }}>
              {loading ? <><div style={{ width: '18px', height: '18px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} /> Scraping & Writing...</> : '🌍 Scrape & Auto-Write'}
            </button>

            {error && <div style={{ marginTop: '1rem', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: '12px', padding: '1rem 1.2rem', color: '#f87171', fontSize: '0.88rem' }}>⚠️ {error}</div>}
          </form>
        </div>

        {/* Right: Results */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
          {!results && !loading && (
            <div style={{ ...card, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '300px', opacity: 0.4, textAlign: 'center', gap: '1rem' }}>
              <span style={{ fontSize: '3rem' }}>🌍</span>
              <p style={{ color: '#64748b', fontSize: '0.95rem' }}>Paste a URL on the left to see AI-generated social posts</p>
            </div>
          )}

          {excerpt && (
            <div style={{ ...card, background: 'rgba(59,130,246,0.05)', border: '1px solid rgba(59,130,246,0.2)', animation: 'fadeUp 0.4s ease forwards' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.8rem' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#22c55e' }} />
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#22c55e' }}>Successfully Scraped</span>
              </div>
              <p style={{ fontSize: '0.88rem', color: '#94a3b8', fontStyle: 'italic', lineHeight: 1.7, margin: 0 }}>{excerpt}</p>
            </div>
          )}

          {results?.map((variant, idx) => (
            <div key={idx} style={{ ...card, animation: 'fadeUp 0.4s ease forwards', animationDelay: `${idx * 0.1}s`, opacity: 0, position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: 'linear-gradient(90deg,#3b82f6,#6366f1)' }} />
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem' }}>
                  <span style={{ width: '26px', height: '26px', borderRadius: '8px', background: 'rgba(59,130,246,0.12)', border: '1px solid rgba(59,130,246,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.72rem', fontWeight: 800, color: '#3b82f6' }}>#{idx + 1}</span>
                  <span style={{ fontWeight: 600, color: '#f1f5f9', fontSize: '0.88rem' }}>Generated Post</span>
                </div>
                <button onClick={() => copy(variant, idx)} style={{ background: copiedIndex === idx ? 'rgba(34,197,94,0.12)' : 'rgba(255,255,255,0.05)', border: `1px solid ${copiedIndex === idx ? 'rgba(34,197,94,0.3)' : 'rgba(255,255,255,0.1)'}`, borderRadius: '8px', color: copiedIndex === idx ? '#22c55e' : '#94a3b8', padding: '0.32rem 0.8rem', fontSize: '0.78rem', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600, transition: 'all 0.2s' }}>
                  {copiedIndex === idx ? '✓ Copied' : '⎘ Copy'}
                </button>
              </div>
              <p style={{ color: '#cbd5e1', lineHeight: 1.8, whiteSpace: 'pre-wrap', fontSize: '0.93rem', margin: 0 }}>{variant}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
