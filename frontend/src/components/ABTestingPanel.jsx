import { useEffect, useState } from 'react';

const card = { background: 'rgba(15,20,35,0.7)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '20px', padding: '2rem', backdropFilter: 'blur(12px)' };
const labelStyle = { display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.6rem' };
const taBase = { width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '0.85rem 1.1rem', color: '#f1f5f9', fontSize: '0.92rem', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.2s, box-shadow 0.2s', resize: 'vertical', lineHeight: 1.7 };

export default function ABTestingPanel({ generatedVariants, onAnalysisComplete }) {
  const hasGenerated = generatedVariants && generatedVariants.length > 0;
  const [variantTexts, setVariantTexts] = useState(
    hasGenerated
      ? generatedVariants.map(v => v.text || '').filter(Boolean)
      : [
          'AI tools are transforming marketing at unprecedented speed.',
          'Marketing teams must adopt AI now or risk falling behind.'
        ]
  );
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [focusedField, setFocusedField] = useState(-1);

  useEffect(() => {
    if (generatedVariants && generatedVariants.length > 0) {
      setVariantTexts(generatedVariants.map(v => v.text || '').filter(Boolean));
    }
  }, [generatedVariants]);

  const handleCompare = async () => {
    setLoading(true); setResult(null);
    try {
      const clean = variantTexts.map(v => v.trim()).filter(Boolean);
      const endpoint = clean.length > 2 ? '/api/ab-test/multi' : '/api/ab-test';
      const payload = clean.length > 2 ? { variants: clean } : { variantA: clean[0], variantB: clean[1] };
      const res = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const data = await res.json();
      if (!res.ok || !data?.result) {
        throw new Error(data?.detail || 'Failed to analyze variants');
      }
      setResult(data.result);
      const winnerIndex = clean.length > 2
        ? data.result.winner_index
        : (data.result.winner === 'A' ? 0 : 1);
      if (onAnalysisComplete) {
        onAnalysisComplete({
          winnerIndex,
          winnerLabel: `Variant ${winnerIndex + 1}`,
          winnerText: clean[winnerIndex] || '',
          winnerScore: clean.length > 2 ? data.result.winner_score : (winnerIndex === 0 ? data.result.scoreA : data.result.scoreB),
          explanation: data.result.explanation || '',
          scores: data.result.scores || [],
        });
      }
    } catch (err) {
      console.error(err);
      setResult({
        winner: 'A',
        scoreA: 0,
        scoreB: 0,
        explanation: err?.message || 'Unable to analyze variants right now.'
      });
    }
    finally { setLoading(false); }
  };

  const taStyle = (field) => ({ ...taBase, borderColor: focusedField === field ? 'rgba(249,115,22,0.4)' : 'rgba(255,255,255,0.08)', boxShadow: focusedField === field ? '0 0 0 3px rgba(249,115,22,0.08)' : 'none' });
  const isMulti = variantTexts.length > 2;

  return (
    <div style={{ width: '100%' }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}} @keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:none}} @keyframes popIn{0%{transform:scale(0.85);opacity:0}100%{transform:scale(1);opacity:1}}`}</style>
      <div style={{ marginBottom: '2.5rem' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(249,115,22,0.08)', border: '1px solid rgba(249,115,22,0.2)', borderRadius: '999px', padding: '0.3rem 0.9rem', marginBottom: '1rem' }}>
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#f97316' }} />
          <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#f97316', textTransform: 'uppercase', letterSpacing: '0.1em' }}>ML Predictor</span>
        </div>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.03em', color: '#f1f5f9', marginBottom: '0.5rem' }}>Multi-Variant Performance Predictor</h1>
        <p style={{ color: '#64748b', fontSize: '0.95rem' }}>Use our ML model and heuristics to rank variants and predict the top-performing copy.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.2rem', marginBottom: '1.5rem' }}>
        {variantTexts.map((val, idx) => (
          <div key={idx} style={{ ...card, border: result ? `1px solid ${((isMulti && result?.winner_index === idx) || (!isMulti && (idx === 0 ? result?.winner === 'A' : result?.winner === 'B'))) ? '#22c55e40' : 'rgba(255,255,255,0.07)'}` : '1px solid rgba(255,255,255,0.07)', position: 'relative', overflow: 'hidden', transition: 'border-color 0.5s' }}>
            {result && ((isMulti && result?.winner_index === idx) || (!isMulti && (idx === 0 ? result?.winner === 'A' : result?.winner === 'B'))) && <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: 'linear-gradient(90deg,#22c55e,transparent)' }} />}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '0.95rem', color: '#818cf8' }}>
                  {`V${idx + 1}`}
                </div>
                <label style={{ ...labelStyle, margin: 0 }}>Variant {idx + 1}</label>
              </div>
              {result && (
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.3rem 0.8rem', borderRadius: '999px', background: ((isMulti && result?.winner_index === idx) || (!isMulti && (idx === 0 ? result?.winner === 'A' : result?.winner === 'B'))) ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.07)', border: `1px solid ${((isMulti && result?.winner_index === idx) || (!isMulti && (idx === 0 ? result?.winner === 'A' : result?.winner === 'B'))) ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.2)'}`, animation: 'popIn 0.5s ease forwards' }}>
                  <span style={{ fontSize: '0.82rem', fontWeight: 700, color: ((isMulti && result?.winner_index === idx) || (!isMulti && (idx === 0 ? result?.winner === 'A' : result?.winner === 'B'))) ? '#22c55e' : '#ef4444' }}>
                    {((isMulti && result?.winner_index === idx) || (!isMulti && (idx === 0 ? result?.winner === 'A' : result?.winner === 'B'))) ? '🏆 Winner' : '—'} {(isMulti ? result?.scores?.find(s => s.index === idx)?.score : (idx === 0 ? result?.scoreA : result?.scoreB))?.toFixed(3)}
                  </span>
                </div>
              )}
            </div>
            <textarea rows={6} value={val} onChange={e => setVariantTexts(prev => prev.map((x, i) => i === idx ? e.target.value : x))}
              onFocus={() => setFocusedField(idx)} onBlur={() => setFocusedField(-1)}
              style={taStyle(idx)} />
          </div>
        ))}
      </div>

      <button onClick={handleCompare} disabled={loading || variantTexts.map(v => v.trim()).filter(Boolean).length < 2} style={{ width: '100%', padding: '1.1rem', background: loading ? 'rgba(249,115,22,0.25)' : 'linear-gradient(135deg,#f97316,#ec4899)', border: 'none', borderRadius: '14px', color: 'white', fontSize: '1.05rem', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'inherit', boxShadow: loading ? 'none' : '0 6px 24px rgba(249,115,22,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem', transition: 'all 0.3s', marginBottom: result ? '2rem' : 0 }}>
        {loading ? <><div style={{ width: '18px', height: '18px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} /> Analyzing variants...</> : `⚔️ Analyze ${variantTexts.length > 2 ? 'All Variants' : 'Multi-Variant Matchup'}`}
      </button>

      {result && (
        <div style={{ animation: 'fadeUp 0.5s ease forwards' }}>
          {/* Winner banner */}
          <div style={{ background: 'linear-gradient(135deg,rgba(34,197,94,0.08),rgba(34,197,94,0.04))', border: '1px solid rgba(34,197,94,0.2)', borderRadius: '20px', padding: '2.5rem', textAlign: 'center', marginBottom: '1.5rem', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: 'linear-gradient(90deg,transparent,#22c55e,transparent)' }} />
            <div style={{ fontSize: '3.5rem', marginBottom: '0.5rem' }}>🏆</div>
            <h2 style={{ fontSize: '2rem', fontWeight: 900, color: '#22c55e', letterSpacing: '-0.03em', marginBottom: '0.5rem' }}>Variant {isMulti ? (result.winner_index + 1) : result.winner} Wins!</h2>
            <p style={{ color: '#94a3b8', fontSize: '1rem', lineHeight: 1.7, maxWidth: '600px', margin: '0 auto' }}>{result.explanation}</p>
          </div>

          {/* Score comparison */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.2rem', marginBottom: '1.5rem' }}>
            {(isMulti ? result.scores : [{id:'A',score:result.scoreA,index:0},{id:'B',score:result.scoreB,index:1}]).map((item) => (
              <div key={item.id || item.index} style={{ ...card, textAlign: 'center', border: `1px solid ${(isMulti ? item.index === result.winner_index : item.id === result.winner) ? 'rgba(34,197,94,0.3)' : 'rgba(255,255,255,0.07)'}` }}>
                <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.8rem' }}>Variant {isMulti ? item.index + 1 : item.id} Score</div>
                <div style={{ fontSize: '3rem', fontWeight: 900, color: (isMulti ? item.index === result.winner_index : item.id === result.winner) ? '#22c55e' : '#f1f5f9', letterSpacing: '-0.03em', marginBottom: '0.8rem' }}>{item.score?.toFixed(3) || '—'}</div>
                <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '999px', height: '6px', overflow: 'hidden' }}>
                  <div style={{ width: `${Math.min((item.score || 0) * 100, 100)}%`, height: '100%', background: (isMulti ? item.index === result.winner_index : item.id === result.winner) ? 'linear-gradient(90deg,#22c55e,#4ade80)' : 'linear-gradient(90deg,#818cf880,#818cf8)', borderRadius: '999px', transition: 'width 1s ease' }} />
                </div>
              </div>
            ))}
          </div>

        </div>
      )}
    </div>
  );
}
