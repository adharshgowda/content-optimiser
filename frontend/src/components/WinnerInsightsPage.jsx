export default function WinnerInsightsPage({ analysisData }) {
  const winnerLabel = analysisData?.winnerLabel || 'Variant 1';
  const winnerScore = Number(analysisData?.winnerScore ?? 0);
  const explanation = analysisData?.explanation || 'This variant outperformed the others under the multi-variant scoring model.';
  const scores = Array.isArray(analysisData?.scores) && analysisData.scores.length
    ? analysisData.scores
    : [{ index: 0, score: winnerScore }];

  const sorted = [...scores].sort((a, b) => Number(b.score) - Number(a.score));
  const top = sorted[0];
  const runnerUp = sorted[1];
  const margin = runnerUp ? Number(top.score) - Number(runnerUp.score) : 0;
  const reasonText = runnerUp
    ? `${winnerLabel} achieved a composite score of ${winnerScore.toFixed(3)}, beating Variant ${Number(runnerUp.index) + 1} (${Number(runnerUp.score).toFixed(3)}) by ${margin.toFixed(3)} points. ${explanation}`
    : `Only one scored variant is available. ${winnerLabel} is selected as the best option with a score of ${winnerScore.toFixed(3)}.`;

  return (
    <div style={{ width: '100%' }}>
      <div style={{ marginBottom: '1.2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#f1f5f9', marginBottom: '0.3rem' }}>Winner Insights</h1>
        <p style={{ color: '#94a3b8', margin: 0 }}>Quantitative comparison across all variants, with the winning choice explained in plain language.</p>
      </div>

      <div style={{ background: 'rgba(15,20,35,0.7)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '18px', padding: '1.3rem', marginBottom: '0.8rem' }}>
        <div style={{ fontSize: '0.78rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.08em', marginBottom: '0.5rem' }}>Winner</div>
        <div style={{ fontSize: '1.7rem', color: '#22c55e', fontWeight: 900, marginBottom: '0.5rem' }}>{winnerLabel}</div>
        <div style={{ fontSize: '0.95rem', color: '#cbd5e1', lineHeight: 1.8 }}>{explanation}</div>
      </div>

      <div style={{ background: 'rgba(15,20,35,0.7)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '18px', padding: '1.3rem', marginBottom: '0.8rem' }}>
        <div style={{ fontSize: '0.78rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.08em', marginBottom: '0.7rem' }}>Variant Scores</div>
        <div style={{ display: 'grid', gap: '0.7rem' }}>
          {sorted.map((item) => {
            const score = Number(item.score || 0);
            const pct = Math.max(0, Math.min(100, score * 100));
            const isWinner = `Variant ${Number(item.index) + 1}` === winnerLabel;
            return (
              <div key={item.index}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                  <span style={{ color: '#cbd5e1', fontSize: '0.85rem' }}>{`Variant ${Number(item.index) + 1}`}</span>
                  <span style={{ color: isWinner ? '#22c55e' : '#a5b4fc', fontWeight: 700, fontSize: '0.85rem' }}>{score.toFixed(3)}</span>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: '999px', height: '10px', overflow: 'hidden' }}>
                  <div style={{ width: `${pct}%`, height: '100%', background: isWinner ? 'linear-gradient(90deg,#22c55e,#4ade80)' : 'linear-gradient(90deg,#6366f1,#818cf8)', borderRadius: '999px' }} />
                </div>
              </div>
            );
          })}
        </div>
        <p style={{ color: '#64748b', fontSize: '0.8rem', marginTop: '0.8rem', marginBottom: 0 }}>Bars show each variant&apos;s composite score (higher is better). Winner is highlighted in green.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
        <div style={{ background: 'rgba(15,20,35,0.7)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '1.1rem' }}>
          <div style={{ fontSize: '0.78rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.08em' }}>Winner Score</div>
          <div style={{ fontSize: '2rem', fontWeight: 900, color: '#22c55e', marginTop: '0.35rem' }}>{winnerScore.toFixed(3)}</div>
        </div>
        <div style={{ background: 'rgba(15,20,35,0.7)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '1.1rem' }}>
          <div style={{ fontSize: '0.78rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.08em' }}>Reasons</div>
          <div style={{ fontSize: '0.98rem', color: '#cbd5e1', marginTop: '0.35rem', lineHeight: 1.6 }}>{reasonText}</div>
        </div>
      </div>
    </div>
  );
}
