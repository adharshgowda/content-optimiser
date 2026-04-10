import { useState } from 'react';

const card = { background: 'rgba(15,20,35,0.75)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '22px', padding: '2.5rem', backdropFilter: 'blur(12px)' };
const lbl = { display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.7rem' };
const inp = { width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px', padding: '1rem 1.25rem', color: '#f1f5f9', fontSize: '1rem', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box', minHeight: '56px', transition: 'border-color 0.2s, box-shadow 0.2s' };

const TOPIC_COLORS = {
  'AI & Automation':    '#a855f7',
  'Marketing Strategy': '#3b82f6',
  'Content Creation':   '#22c55e',
  'Social Media':       '#f97316',
  'Data & Analytics':   '#06b6d4',
  'Productivity':       '#f59e0b',
  'Startup & Business': '#ec4899',
  'SEO & Growth':       '#84cc16',
};

const PLATFORMS = { Twitter: '🐦', LinkedIn: '💼', Facebook: '📘', Instagram: '📸' };
const TONES = { professional: '#3b82f6', engaging: '#f97316', funny: '#f59e0b', urgent: '#ef4444' };

export default function CompetitorIntelligence() {
  const [urls, setUrls] = useState(['', '', '']);
  const [platform, setPlatform] = useState('LinkedIn');
  const [tone, setTone] = useState('professional');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [generating, setGenerating] = useState(null); // topic being generated for
  const [generatedContent, setGeneratedContent] = useState({});
  const [copied, setCopied] = useState(null);
  const [focusedIdx, setFocusedIdx] = useState(null);

  const setUrl = (i, val) => setUrls(u => { const n = [...u]; n[i] = val; return n; });
  const addUrl = () => setUrls(u => [...u, '']);
  const removeUrl = (i) => setUrls(u => u.filter((_, idx) => idx !== i));
  const validUrls = urls.filter(u => u.trim().length > 5);

  const runAnalysis = async () => {
    if (!validUrls.length) return;
    setLoading(true); setError(null); setResult(null); setGeneratedContent({});
    try {
      const res = await fetch('/api/competitor-analysis', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ urls: validUrls, your_platform: platform, your_tone: tone })
      });
      if (!res.ok) throw new Error(await res.text());
      setResult(await res.json());
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  const stealGap = async (topic) => {
    setGenerating(topic);
    try {
      const res = await fetch('/api/generate', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: `Create a compelling ${platform} post about "${topic}" — an underexplored topic in this niche.`, platform, keywords: [topic], audience: 'marketing professionals', tone, word_count: 80, n: 1 })
      });
      if (!res.ok) throw new Error('Generation failed');
      const data = await res.json();
      const text = data.variants?.[0]?.text || data.variants?.[0] || 'Could not generate content.';
      setGeneratedContent(g => ({ ...g, [topic]: text }));
    } catch (err) { setGeneratedContent(g => ({ ...g, [topic]: 'Failed to generate. Try again.' })); }
    finally { setGenerating(null); }
  };

  const copy = (topic, text) => { navigator.clipboard.writeText(text); setCopied(topic); setTimeout(() => setCopied(null), 2500); };

  const maxCoverage = result ? Math.max(...result.topic_coverage.map(t => t.coverage), 1) : 1;

  return (
    <div style={{ width: '100%' }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}} @keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:none}} @keyframes barGrow{from{width:0}to{width:var(--bar-w)}}`}</style>

      {/* Header */}
      <div style={{ marginBottom: '3rem' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.6rem', background: 'rgba(6,182,212,0.08)', border: '1px solid rgba(6,182,212,0.25)', borderRadius: '999px', padding: '0.45rem 1.1rem', marginBottom: '1.2rem' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#06b6d4', display: 'inline-block' }} />
          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#06b6d4', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Intelligence Engine</span>
        </div>
        <h1 style={{ fontSize: '2.8rem', fontWeight: 900, letterSpacing: '-0.04em', color: '#f1f5f9', marginBottom: '0.6rem' }}>Competitor Gap Finder</h1>
        <p style={{ color: '#64748b', fontSize: '1.1rem', lineHeight: 1.7 }}>
          Add competitor URLs — your AI reads their content, maps their topics,<br />
          and shows you the <span style={{ color: '#06b6d4', fontWeight: 600 }}>uncovered gaps</span> you can own.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: '2rem', alignItems: 'start' }}>

        {/* LEFT: URL inputs + settings */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={card}>
            <label style={lbl}>Competitor URLs <span style={{ color: '#475569', fontWeight: 400, textTransform: 'none', fontSize: '0.8rem' }}>(up to 5)</span></label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1rem' }}>
              {urls.map((u, i) => (
                <div key={i} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <input type="url" value={u} onChange={e => setUrl(i, e.target.value)} placeholder={`https://competitor${i + 1}.com/blog`}
                    onFocus={() => setFocusedIdx(i)} onBlur={() => setFocusedIdx(null)}
                    style={{ ...inp, flex: 1, borderColor: focusedIdx === i ? 'rgba(6,182,212,0.5)' : 'rgba(255,255,255,0.08)', boxShadow: focusedIdx === i ? '0 0 0 3px rgba(6,182,212,0.1)' : 'none', minHeight: '50px', fontSize: '0.9rem' }} />
                  {urls.length > 1 && (
                    <button onClick={() => removeUrl(i)} style={{ width: '36px', height: '36px', borderRadius: '10px', border: '1px solid rgba(239,68,68,0.2)', background: 'rgba(239,68,68,0.05)', color: '#f87171', cursor: 'pointer', fontSize: '1rem', flexShrink: 0 }}>×</button>
                  )}
                </div>
              ))}
            </div>
            {urls.length < 5 && (
              <button onClick={addUrl} style={{ width: '100%', padding: '0.65rem', borderRadius: '12px', border: '1px dashed rgba(255,255,255,0.1)', background: 'transparent', color: '#475569', cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.9rem', marginBottom: '1.5rem', transition: 'all 0.2s' }}>+ Add Competitor URL</button>
            )}

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={lbl}>Your Platform</label>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {Object.entries(PLATFORMS).map(([p, icon]) => (
                  <button key={p} onClick={() => setPlatform(p)}
                    style={{ padding: '0.5rem 0.85rem', borderRadius: '10px', border: `1px solid ${platform === p ? 'rgba(6,182,212,0.5)' : 'rgba(255,255,255,0.08)'}`, background: platform === p ? 'rgba(6,182,212,0.1)' : 'rgba(255,255,255,0.04)', color: platform === p ? '#06b6d4' : '#94a3b8', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s' }}>
                    {icon} {p}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: '2rem' }}>
              <label style={lbl}>Your Tone</label>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {Object.entries(TONES).map(([t, c]) => (
                  <button key={t} onClick={() => setTone(t)}
                    style={{ padding: '0.5rem 0.85rem', borderRadius: '10px', border: `1px solid ${tone === t ? c + '60' : 'rgba(255,255,255,0.08)'}`, background: tone === t ? c + '15' : 'rgba(255,255,255,0.04)', color: tone === t ? c : '#94a3b8', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s', textTransform: 'capitalize' }}>
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <button onClick={runAnalysis} disabled={loading || !validUrls.length}
              style={{ width: '100%', padding: '1.1rem', background: loading ? 'rgba(6,182,212,0.2)' : 'linear-gradient(135deg,#06b6d4,#3b82f6)', border: 'none', borderRadius: '14px', color: 'white', fontSize: '1.05rem', fontWeight: 700, cursor: loading || !validUrls.length ? 'not-allowed' : 'pointer', fontFamily: 'inherit', boxShadow: loading ? 'none' : '0 6px 24px rgba(6,182,212,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem', transition: 'all 0.3s', opacity: !validUrls.length ? 0.5 : 1 }}>
              {loading ? <><div style={{ width: '20px', height: '20px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} /> Analyzing Competitors...</> : '🔍 Run Intelligence Scan'}
            </button>

            {error && <div style={{ marginTop: '1rem', background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '12px', padding: '1rem', color: '#f87171', fontSize: '0.88rem' }}>⚠️ {error}</div>}
          </div>

          {/* Stats summary */}
          {result && (
            <div style={{ ...card, padding: '1.5rem 2rem', animation: 'fadeUp 0.4s ease forwards' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                {[
                  { label: 'URLs Scanned', val: result.urls_scraped, color: '#06b6d4' },
                  { label: 'Topics Mapped', val: result.topic_coverage.length, color: '#a855f7' },
                  { label: 'Gaps Found', val: result.top_gaps.length, color: '#22c55e' },
                  { label: 'Words Read', val: result.total_words_scraped.toLocaleString(), color: '#f97316' },
                ].map(({ label, val, color }) => (
                  <div key={label} style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '1.6rem', fontWeight: 900, color, letterSpacing: '-0.02em' }}>{val}</div>
                    <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* RIGHT: Results */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

          {!result && !loading && (
            <div style={{ ...card, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '400px', opacity: 0.4, textAlign: 'center', gap: '1rem' }}>
              <span style={{ fontSize: '3.5rem' }}>🔍</span>
              <p style={{ color: '#64748b', fontSize: '1rem' }}>Add competitor URLs and run the scan<br />to see their topic coverage and your gaps</p>
            </div>
          )}

          {result && (
            <>
              {/* Topic Coverage Bar Chart */}
              <div style={{ ...card, animation: 'fadeUp 0.4s ease forwards' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#f1f5f9', letterSpacing: '-0.02em' }}>Competitor Topic Coverage</h3>
                  <div style={{ display: 'flex', gap: '1rem', fontSize: '0.78rem', color: '#64748b' }}>
                    <span>🔴 High coverage = They own it</span>
                    <span>🟢 Low coverage = Your opportunity</span>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
                  {[...result.topic_coverage].reverse().map(({ topic, coverage, opportunity }) => {
                    const color = TOPIC_COLORS[topic] || '#94a3b8';
                    const barColor = coverage < 30 ? '#22c55e' : coverage < 60 ? '#f97316' : '#ef4444';
                    return (
                      <div key={topic}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                          <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#cbd5e1' }}>{topic}</span>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <span style={{ fontSize: '0.78rem', color: barColor, fontWeight: 700 }}>
                              {coverage < 30 ? '🟢 LOW — Opportunity!' : coverage < 60 ? '🟡 MEDIUM' : '🔴 HIGH — Saturated'}
                            </span>
                            <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#f1f5f9', width: '36px', textAlign: 'right' }}>{coverage}%</span>
                          </div>
                        </div>
                        <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '999px', height: '10px', overflow: 'hidden' }}>
                          <div style={{ width: `${coverage}%`, height: '100%', background: `linear-gradient(90deg, ${barColor}80, ${barColor})`, borderRadius: '999px', transition: 'width 1s ease 0.2s' }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Gap Opportunities */}
              {result.top_gaps.length > 0 && (
                <div style={{ animation: 'fadeUp 0.5s ease forwards' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '1rem' }}>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#22c55e', letterSpacing: '-0.02em' }}>🎯 Top Content Gaps — Your Opportunities</h3>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {result.top_gaps.map(({ topic, coverage, opportunity }, i) => (
                      <div key={topic} style={{ ...card, border: '1px solid rgba(34,197,94,0.2)', background: 'rgba(34,197,94,0.03)', position: 'relative', overflow: 'hidden', animation: `fadeUp 0.4s ease ${i * 0.1}s forwards`, opacity: 0 }}>
                        <div style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: '3px', background: `linear-gradient(180deg,#22c55e,transparent)` }} />
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: generatedContent[topic] ? '1.5rem' : 0 }}>
                          <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', flexShrink: 0 }}>🕳️</div>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 800, color: '#f1f5f9', fontSize: '1rem', marginBottom: '0.2rem' }}>{topic}</div>
                            <div style={{ fontSize: '0.82rem', color: '#64748b' }}>Competitors cover only <span style={{ color: '#22c55e', fontWeight: 700 }}>{coverage}%</span> of this topic — <span style={{ color: '#22c55e' }}>{opportunity}% opportunity gap</span></div>
                          </div>
                          <button onClick={() => stealGap(topic)} disabled={generating === topic}
                            style={{ padding: '0.6rem 1.2rem', borderRadius: '10px', background: generating === topic ? 'rgba(34,197,94,0.1)' : 'linear-gradient(135deg,#22c55e,#16a34a)', border: 'none', color: 'white', fontWeight: 700, fontSize: '0.85rem', cursor: generating === topic ? 'not-allowed' : 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '0.4rem', boxShadow: '0 4px 12px rgba(34,197,94,0.25)' }}>
                            {generating === topic ? <><div style={{ width: '14px', height: '14px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} /> Generating</> : '⚡ Steal This Gap'}
                          </button>
                        </div>

                        {generatedContent[topic] && (
                          <div style={{ background: 'rgba(0,0,0,0.2)', borderRadius: '14px', padding: '1.25rem', border: '1px solid rgba(34,197,94,0.15)', animation: 'fadeUp 0.4s ease forwards' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                              <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#22c55e', textTransform: 'uppercase', letterSpacing: '0.08em' }}>✓ Generated for {platform}</span>
                              <button onClick={() => copy(topic, generatedContent[topic])} style={{ background: copied === topic ? 'rgba(34,197,94,0.15)' : 'rgba(255,255,255,0.05)', border: `1px solid ${copied === topic ? 'rgba(34,197,94,0.3)' : 'rgba(255,255,255,0.1)'}`, borderRadius: '8px', color: copied === topic ? '#22c55e' : '#94a3b8', padding: '0.3rem 0.75rem', fontSize: '0.78rem', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600 }}>
                                {copied === topic ? '✓ Copied' : '⎘ Copy'}
                              </button>
                            </div>
                            <p style={{ color: '#cbd5e1', lineHeight: 1.8, fontSize: '0.95rem', margin: 0 }}>{generatedContent[topic]}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Per-URL keyword breakdown */}
              <div style={{ ...card, animation: 'fadeUp 0.6s ease forwards' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#f1f5f9', marginBottom: '1.5rem', letterSpacing: '-0.02em' }}>Competitor Keyword Profiles</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
                  {result.url_profiles.map((profile, i) => (
                    <div key={i} style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '16px', padding: '1.25rem', border: '1px solid rgba(255,255,255,0.06)' }}>
                      <div style={{ fontSize: '0.75rem', color: '#475569', fontWeight: 600, marginBottom: '0.75rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        🌍 {new URL(profile.url.startsWith('http') ? profile.url : 'https://' + profile.url).hostname}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.75rem' }}>{profile.word_count.toLocaleString()} words scraped</div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                        {profile.top_keywords.map(kw => (
                          <span key={kw} style={{ fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8', background: 'rgba(255,255,255,0.05)', padding: '0.25rem 0.6rem', borderRadius: '999px', border: '1px solid rgba(255,255,255,0.07)' }}>{kw}</span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                {result.errors?.length > 0 && (
                  <div style={{ marginTop: '1rem', fontSize: '0.82rem', color: '#64748b' }}>
                    ⚠️ {result.errors.length} URL(s) could not be scraped — they may require login or block scrapers.
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
