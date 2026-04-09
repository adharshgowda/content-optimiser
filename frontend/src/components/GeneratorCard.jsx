import { useEffect, useState } from 'react';

const S = {
  page: { width: '100%' },
  header: { marginBottom: '3.5rem' },
  badge: { display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(75,159,255,0.08)', border: '1px solid rgba(75,159,255,0.2)', borderRadius: '999px', padding: '0.45rem 1.1rem', marginBottom: '1.3rem' },
  badgeDot: { width: '8px', height: '8px', borderRadius: '50%', background: '#4b9fff' },
  badgeText: { fontSize: '0.82rem', fontWeight: 700, color: '#4b9fff', textTransform: 'uppercase', letterSpacing: '0.12em' },
  title: { fontSize: '3rem', fontWeight: 900, letterSpacing: '-0.04em', color: '#f1f5f9', marginBottom: '0.7rem' },
  subtitle: { color: '#64748b', fontSize: '1.15rem', lineHeight: 1.7 },
  card: { background: 'rgba(15,20,35,0.7)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '24px', padding: '3rem', backdropFilter: 'blur(12px)' },
  grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2.5rem' },
  label: { display: 'block', fontSize: '0.9rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.75rem' },
  input: { width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px', padding: '1.1rem 1.4rem', color: '#f1f5f9', fontSize: '1.1rem', fontFamily: 'inherit', outline: 'none', transition: 'border-color 0.2s, box-shadow 0.2s', boxSizing: 'border-box', minHeight: '64px' },
  select: { width: '100%', background: 'rgba(15,20,35,0.9)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px', padding: '1.1rem 1.4rem', color: '#f1f5f9', fontSize: '1.1rem', fontFamily: 'inherit', outline: 'none', transition: 'border-color 0.2s', boxSizing: 'border-box', cursor: 'pointer', minHeight: '64px' },
  fieldGroup: { marginBottom: '2rem' },
};

const PlatformIcons = { Twitter: '🐦', LinkedIn: '💼', Facebook: '📘', Instagram: '📸' };
const ToneColors = { positive: '#22c55e', neutral: '#94a3b8', funny: '#f97316', professional: '#3b82f6' };

export default function GeneratorCard({ onGenerated, persistedState, onPersistState }) {
  const [topic, setTopic] = useState(persistedState?.topic ?? '');
  const [platform, setPlatform] = useState(persistedState?.platform ?? '');
  const [keywords, setKeywords] = useState(persistedState?.keywords ?? '');
  const [audience, setAudience] = useState(persistedState?.audience ?? '');
  const [tone, setTone] = useState(persistedState?.tone ?? '');
  const [wordCount, setWordCount] = useState(persistedState?.wordCount ?? 50);
  const [numVariants, setNumVariants] = useState(persistedState?.numVariants ?? 2);
  const [loading, setLoading] = useState(false);
  const [variants, setVariants] = useState(persistedState?.variants ?? []);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(null);
  const [focusedField, setFocusedField] = useState(null);

  useEffect(() => {
    if (!onPersistState) return;
    onPersistState({
      topic,
      platform,
      keywords,
      audience,
      tone,
      wordCount,
      numVariants,
      variants,
    });
  }, [topic, platform, keywords, audience, tone, wordCount, numVariants, variants, onPersistState]);

  const handleGenerate = async () => {
    if (!topic.trim() || !platform || !audience.trim() || !tone) {
      setError('Please fill Topic, Platform, Target Audience, and Tone of Voice.');
      return;
    }
    setLoading(true); setError(null); setVariants([]);
    try {
      const kwList = keywords.split(',').map(k => k.trim()).filter(Boolean);
      const res = await fetch('http://localhost:8000/api/generate', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, platform, keywords: kwList, audience, tone, word_count: parseInt(wordCount), n: parseInt(numVariants) })
      });
      if (!res.ok) throw new Error('Failed to generate. Is the backend running?');
      const data = await res.json();
      setVariants(data.variants || []);
      if (onGenerated) onGenerated(data.variants || []);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  const copyText = (text, idx) => {
    navigator.clipboard.writeText(text);
    setCopied(idx);
    setTimeout(() => setCopied(null), 2000);
  };

  const inputStyle = (field) => ({ ...S.input, borderColor: focusedField === field ? 'rgba(75,159,255,0.5)' : 'rgba(255,255,255,0.08)', boxShadow: focusedField === field ? '0 0 0 3px rgba(75,159,255,0.1)' : 'none' });
  const selectStyle = (field) => ({ ...S.select, borderColor: focusedField === field ? 'rgba(75,159,255,0.5)' : 'rgba(255,255,255,0.08)', boxShadow: focusedField === field ? '0 0 0 3px rgba(75,159,255,0.1)' : 'none' });

  return (
    <div style={S.page}>
      {/* Header */}
      <div style={S.header}>
        <div style={S.badge}><span style={S.badgeDot} /><span style={S.badgeText}>AI Powered</span></div>
        <h1 style={S.title}>Content Generator</h1>
        <p style={S.subtitle}>Generate high-converting marketing content optimized for current trends and your target audience.</p>
      </div>

      {/* Form Card */}
      <div style={S.card}>
        <div style={{ ...S.grid, marginBottom: '1.5rem' }}>
          {/* Left col */}
          <div>
            <div style={S.fieldGroup}>
              <label style={S.label}>Topic / Headline</label>
              <input style={inputStyle('topic')} value={topic} onChange={e => setTopic(e.target.value)}
                onFocus={() => setFocusedField('topic')} onBlur={() => setFocusedField(null)} placeholder="e.g. AI in Marketing" />
            </div>
            <div style={S.fieldGroup}>
              <label style={S.label}>Platform</label>
              {!platform && <div style={{ color: '#64748b', fontSize: '0.82rem', marginBottom: '0.55rem' }}>Select a platform</div>}
              <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
                {['Twitter','LinkedIn','Facebook','Instagram'].map(p => (
                  <button key={p} onClick={() => setPlatform(p)} style={{ padding: '0.6rem 1rem', borderRadius: '10px', border: `1px solid ${platform === p ? 'rgba(75,159,255,0.5)' : 'rgba(255,255,255,0.08)'}`, background: platform === p ? 'rgba(75,159,255,0.12)' : 'rgba(255,255,255,0.04)', color: platform === p ? '#4b9fff' : '#94a3b8', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s' }}>
                    {PlatformIcons[p]} {p}
                  </button>
                ))}
              </div>
            </div>
            <div style={S.fieldGroup}>
              <label style={S.label}>Target Audience</label>
              <input style={inputStyle('audience')} value={audience} onChange={e => setAudience(e.target.value)}
                onFocus={() => setFocusedField('audience')} onBlur={() => setFocusedField(null)} placeholder="e.g. digital marketers" />
            </div>
          </div>

          {/* Right col */}
          <div>
            <div style={S.fieldGroup}>
              <label style={S.label}>Keywords (comma-separated)</label>
              <input style={inputStyle('keywords')} value={keywords} onChange={e => setKeywords(e.target.value)}
                onFocus={() => setFocusedField('keywords')} onBlur={() => setFocusedField(null)} placeholder="e.g. #AI, #Marketing, #Growth" />
            </div>
            <div style={S.fieldGroup}>
              <label style={S.label}>Tone of Voice</label>
              {!tone && <div style={{ color: '#64748b', fontSize: '0.82rem', marginBottom: '0.55rem' }}>Select a tone</div>}
              <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
                {['positive','neutral','funny','professional'].map(t => (
                  <button key={t} onClick={() => setTone(t)} style={{ padding: '0.6rem 1rem', borderRadius: '10px', border: `1px solid ${tone === t ? ToneColors[t] + '60' : 'rgba(255,255,255,0.08)'}`, background: tone === t ? ToneColors[t] + '15' : 'rgba(255,255,255,0.04)', color: tone === t ? ToneColors[t] : '#94a3b8', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s', textTransform: 'capitalize' }}>
                    {t}
                  </button>
                ))}
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
              <div style={S.fieldGroup}>
                <label style={S.label}>Words: <span style={{ color: '#4b9fff', fontWeight: 800 }}>{wordCount}</span></label>
                <div style={{ position: 'relative' }}>
                  <input type="range" min="20" max="500" value={wordCount} onChange={e => setWordCount(e.target.value)}
                    style={{ width: '100%', accentColor: '#4b9fff', cursor: 'pointer', height: '4px' }} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: '#475569', marginTop: '0.3rem' }}>
                    <span>20</span><span>500</span>
                  </div>
                </div>
              </div>
              <div style={S.fieldGroup}>
                <label style={S.label}>Variants</label>
                <input type="number" min="1" max="6" value={numVariants} onChange={e => setNumVariants(e.target.value)}
                  style={{ ...inputStyle('variants'), textAlign: 'center', fontWeight: 800, fontSize: '1.2rem' }}
                  onFocus={() => setFocusedField('variants')} onBlur={() => setFocusedField(null)} />
              </div>
            </div>
          </div>
        </div>

        {/* Generate Button */}
        <button onClick={handleGenerate} disabled={loading} style={{ width: '100%', padding: '1.1rem', background: loading ? 'rgba(75,159,255,0.3)' : 'linear-gradient(135deg, #4b9fff, #6f42c1)', border: 'none', borderRadius: '14px', color: 'white', fontSize: '1.05rem', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'inherit', transition: 'all 0.3s', boxShadow: loading ? 'none' : '0 6px 24px rgba(75,159,255,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem' }}>
          {loading ? (
            <>
              <div style={{ width: '18px', height: '18px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
              Generating content...
            </>
          ) : '⚡ Generate Variations'}
        </button>
      </div>

      {/* Error */}
      {error && (
        <div style={{ marginTop: '1.5rem', background: 'rgba(218,54,51,0.08)', border: '1px solid rgba(218,54,51,0.25)', borderRadius: '14px', padding: '1rem 1.5rem', color: '#ff7b72', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          ⚠️ {error}
        </div>
      )}

      {/* Results */}
      {variants.length > 0 && (
        <div style={{ marginTop: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#f1f5f9', letterSpacing: '-0.02em' }}>Generated Variants</h3>
            <span style={{ fontSize: '0.8rem', color: '#64748b', background: 'rgba(255,255,255,0.05)', padding: '0.3rem 0.8rem', borderRadius: '999px', border: '1px solid rgba(255,255,255,0.07)' }}>{variants.length} results</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
            {variants.map((v, idx) => (
              <div key={idx} style={{ background: 'rgba(15,20,35,0.7)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '18px', padding: '1.8rem', animation: 'fadeIn 0.4s ease forwards', animationDelay: `${idx * 0.1}s`, opacity: 0, position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: `linear-gradient(90deg, #4b9fff, #6f42c1)` }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                    <span style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'rgba(75,159,255,0.12)', border: '1px solid rgba(75,159,255,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.78rem', fontWeight: 800, color: '#4b9fff' }}>V{idx + 1}</span>
                    <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#f1f5f9' }}>Variant {idx + 1}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                    {v.meta?.trend_score !== undefined && (
                      <span style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.25)', color: '#22c55e', fontSize: '0.78rem', fontWeight: 700, padding: '0.3rem 0.75rem', borderRadius: '999px' }}>
                        📈 Trend: {v.meta.trend_score}
                      </span>
                    )}
                    <button onClick={() => copyText(v.text, idx)} style={{ background: copied === idx ? 'rgba(34,197,94,0.15)' : 'rgba(255,255,255,0.05)', border: `1px solid ${copied === idx ? 'rgba(34,197,94,0.3)' : 'rgba(255,255,255,0.1)'}`, borderRadius: '8px', color: copied === idx ? '#22c55e' : '#94a3b8', padding: '0.35rem 0.85rem', fontSize: '0.8rem', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600, transition: 'all 0.2s' }}>
                      {copied === idx ? '✓ Copied' : '⎘ Copy'}
                    </button>
                  </div>
                </div>
                <p style={{ color: '#cbd5e1', lineHeight: 1.8, fontSize: '1rem', margin: 0 }}>{v.text}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: none; } }
        input[type=range]::-webkit-slider-thumb { width: 16px; height: 16px; border-radius: 50%; background: #4b9fff; cursor: pointer; }
      `}</style>
    </div>
  );
}
