import { useState, useRef } from 'react';

const STEPS = [
  { id: 'scrape',     icon: '🌍', label: 'Web Scraping',        desc: 'Extracting article content from URL' },
  { id: 'generate',   icon: '✍️', label: 'Content Generation',  desc: 'Generating 4 AI content variants' },
  { id: 'sentiment',  icon: '💬', label: 'Sentiment Analysis',  desc: 'Scoring tone and emotion of each variant' },
  { id: 'abtest',     icon: '⚔️', label: 'Multi-Variant Prediction', desc: 'Ranking all variants and picking the winner' },
  { id: 'slack',      icon: '📣', label: 'Slack Broadcast',     desc: 'Sending winner to your team channel' },
];

const STATUS = { idle: 'idle', running: 'running', done: 'done', error: 'error' };

const PLATFORMS = { Twitter: '🐦', LinkedIn: '💼', Facebook: '📘', Instagram: '📸' };
const TONES = { professional: '#3b82f6', engaging: '#f97316', funny: '#f59e0b', urgent: '#ef4444' };

const card = { background: 'rgba(15,20,35,0.75)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '22px', padding: '2.5rem', backdropFilter: 'blur(12px)' };
const lbl = { display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.7rem' };
const inp = { width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px', padding: '1rem 1.25rem', color: '#f1f5f9', fontSize: '1.05rem', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box', minHeight: '60px', transition: 'border-color 0.2s, box-shadow 0.2s' };

export default function CampaignPipeline() {
  const [url, setUrl] = useState('');
  const [platform, setPlatform] = useState('LinkedIn');
  const [tone, setTone] = useState('professional');
  const [stepStatus, setStepStatus] = useState({});   // id → STATUS
  const [stepData, setStepData] = useState({});        // id → result data
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState(null);
  const [urlFocused, setUrlFocused] = useState(false);
  const abortRef = useRef(false);

  const setStep = (id, status, data = null) => {
    setStepStatus(s => ({ ...s, [id]: status }));
    if (data !== null) setStepData(s => ({ ...s, [id]: data }));
  };

  const delay = (ms) => new Promise(r => setTimeout(r, ms));

  const runPipeline = async () => {
    if (!url.trim()) return;
    abortRef.current = false;
    setRunning(true); setDone(false); setError(null);
    setStepStatus({}); setStepData({});

    try {
      // ── STEP 1: Scrape ──────────────────────────────────────────────
      setStep('scrape', STATUS.running);
      await delay(300);
      const scrapeRes = await fetch('http://localhost:8000/api/scrape-generate', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, platform, tone, word_count: 80, n: 4 })
      });
      if (!scrapeRes.ok) throw new Error('Scraping failed. Check the URL and backend.');
      const scrapeData = await scrapeRes.json();
      const variants = scrapeData.variants || [];
      if (!variants.length) throw new Error('No content scraped. Try a different URL.');
      setStep('scrape', STATUS.done, { excerpt: scrapeData.article_excerpt, count: variants.length });
      await delay(400);

      // ── STEP 2: Generate additional variants ────────────────────────
      setStep('generate', STATUS.running);
      await delay(300);
      const genRes = await fetch('http://localhost:8000/api/generate', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: scrapeData.article_excerpt?.slice(0, 100) || url, platform, tone, word_count: 80, n: 2 })
      });
      let allVariants = [...variants];
      if (genRes.ok) {
        const genData = await genRes.json();
        allVariants = [...variants, ...(genData.variants || [])];
      }
      setStep('generate', STATUS.done, { count: allVariants.length });
      await delay(400);

      // ── STEP 3: Sentiment on all variants ───────────────────────────
      setStep('sentiment', STATUS.running);
      const sentimentResults = [];
      for (const v of allVariants.slice(0, 4)) {
        const text = typeof v === 'string' ? v : v.text || '';
        try {
          const sRes = await fetch('http://localhost:8000/api/sentiment', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text })
          });
          const sData = await sRes.json();
          sentimentResults.push({ text, sentiment: sData.sentiment, score: sData.sentiment?.sentiment_score || 0 });
        } catch { sentimentResults.push({ text, score: 0.5 }); }
      }
      sentimentResults.sort((a, b) => b.score - a.score);
      setStep('sentiment', STATUS.done, { results: sentimentResults, topScore: (sentimentResults[0]?.score * 100).toFixed(0) });
      await delay(400);

      // ── STEP 4: Multi-variant ranking on all candidates ─────────────
      setStep('abtest', STATUS.running);
      const candidates = sentimentResults
        .map(item => item.text || '')
        .filter(Boolean);
      let winner = candidates[0] || '';
      let abResult = null;
      try {
        const abRes = await fetch('http://localhost:8000/api/ab-test/multi', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ variants: candidates })
        });
        abResult = (await abRes.json()).result;
        winner = candidates[abResult?.winner_index] || winner;
      } catch { winner = candidates[0] || ''; }
      setStep('abtest', STATUS.done, {
        winner,
        winnerIndex: abResult?.winner_index,
        winnerScore: abResult?.winner_score,
        explanation: abResult?.explanation,
        scores: abResult?.scores || [],
      });
      await delay(400);

      // ── STEP 5: Send to Slack ────────────────────────────────────────
      setStep('slack', STATUS.running);
      const slackMsg = `🏆 *Campaign Pipeline Result*\n📊 Platform: ${platform} | Tone: ${tone}\n🔗 Source: ${url}\n\n✅ *Winning Post:*\n${winner}\n\n_Sentiment Score: ${sentimentResults[0]?.score?.toFixed(2)} | Multi-variant winner: Variant ${(abResult?.winner_index ?? 0) + 1}_`;
      try {
        await fetch('http://localhost:8000/api/slack/test', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: slackMsg })
        });
        setStep('slack', STATUS.done, { sent: true });
      } catch { setStep('slack', STATUS.done, { sent: false }); }

      // Record to metrics
      try {
        await fetch('http://localhost:8000/api/metrics/record-demo', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            winner: `Variant ${(abResult?.winner_index ?? 0) + 1}`,
            score: abResult?.winner_score || 0.8
          })
        });
      } catch {}

      setDone(true);
    } catch (err) {
      setError(err.message);
      // Mark current running step as error
      const runningStep = STEPS.find(s => stepStatus[s.id] === STATUS.running);
      if (runningStep) setStep(runningStep.id, STATUS.error);
    } finally {
      setRunning(false);
    }
  };

  const reset = () => {
    setStepStatus({}); setStepData({}); setDone(false); setError(null); setUrl('');
  };

  const winnerPost = stepData.abtest?.winner;
  const completedCount = Object.values(stepStatus).filter(s => s === STATUS.done).length;
  const progressPct = (completedCount / STEPS.length) * 100;

  return (
    <div style={{ width: '100%' }}>
      <style>{`
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:none}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.5}}
        @keyframes stepIn{0%{opacity:0;transform:scale(0.85)}100%{opacity:1;transform:scale(1)}}
      `}</style>

      {/* Header */}
      <div style={{ marginBottom: '3rem' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.6rem', background: 'linear-gradient(135deg,rgba(249,115,22,0.1),rgba(168,85,247,0.1))', border: '1px solid rgba(249,115,22,0.25)', borderRadius: '999px', padding: '0.45rem 1.1rem', marginBottom: '1.2rem' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'linear-gradient(135deg,#f97316,#a855f7)', display: 'inline-block', animation: running ? 'pulse 1.2s ease infinite' : 'none' }} />
          <span style={{ fontSize: '0.8rem', fontWeight: 700, background: 'linear-gradient(135deg,#f97316,#a855f7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Full AI Pipeline</span>
        </div>
        <h1 style={{ fontSize: '2.8rem', fontWeight: 900, letterSpacing: '-0.04em', color: '#f1f5f9', marginBottom: '0.6rem' }}>Campaign Autopilot</h1>
        <p style={{ color: '#64748b', fontSize: '1.1rem', lineHeight: 1.7 }}>
          Paste any article URL and watch all 5 AI tools work together in sequence —<br />
          scrape → generate → analyze → predict → broadcast.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: '2rem', alignItems: 'start' }}>

        {/* LEFT: Config + Steps */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

          {/* Input card */}
          <div style={card}>
            <div style={{ marginBottom: '1.8rem' }}>
              <label style={lbl}>Article URL</label>
              <input type="url" value={url} onChange={e => setUrl(e.target.value)} placeholder="https://techcrunch.com/..."
                onFocus={() => setUrlFocused(true)} onBlur={() => setUrlFocused(false)} disabled={running}
                style={{ ...inp, borderColor: urlFocused ? 'rgba(249,115,22,0.5)' : 'rgba(255,255,255,0.08)', boxShadow: urlFocused ? '0 0 0 3px rgba(249,115,22,0.1)' : 'none' }} />
            </div>

            <div style={{ marginBottom: '1.8rem' }}>
              <label style={lbl}>Platform</label>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {Object.entries(PLATFORMS).map(([p, icon]) => (
                  <button key={p} onClick={() => setPlatform(p)} disabled={running}
                    style={{ padding: '0.6rem 1rem', borderRadius: '10px', border: `1px solid ${platform === p ? 'rgba(249,115,22,0.5)' : 'rgba(255,255,255,0.08)'}`, background: platform === p ? 'rgba(249,115,22,0.12)' : 'rgba(255,255,255,0.04)', color: platform === p ? '#f97316' : '#94a3b8', fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s' }}>
                    {icon} {p}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: '2rem' }}>
              <label style={lbl}>Tone</label>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {Object.entries(TONES).map(([t, c]) => (
                  <button key={t} onClick={() => setTone(t)} disabled={running}
                    style={{ padding: '0.6rem 1rem', borderRadius: '10px', border: `1px solid ${tone === t ? c + '60' : 'rgba(255,255,255,0.08)'}`, background: tone === t ? c + '18' : 'rgba(255,255,255,0.04)', color: tone === t ? c : '#94a3b8', fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s', textTransform: 'capitalize' }}>
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <button onClick={done ? reset : runPipeline} disabled={running || (!done && !url.trim())}
              style={{ width: '100%', padding: '1.1rem', background: running ? 'rgba(249,115,22,0.2)' : done ? 'linear-gradient(135deg,#22c55e,#16a34a)' : 'linear-gradient(135deg,#f97316,#a855f7)', border: 'none', borderRadius: '14px', color: 'white', fontSize: '1.1rem', fontWeight: 700, cursor: running || (!done && !url.trim()) ? 'not-allowed' : 'pointer', fontFamily: 'inherit', boxShadow: running ? 'none' : done ? '0 6px 24px rgba(34,197,94,0.35)' : '0 6px 24px rgba(249,115,22,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem', transition: 'all 0.3s', opacity: !running && !done && !url.trim() ? 0.5 : 1 }}>
              {running ? (
                <><div style={{ width: '20px', height: '20px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} /> Running Pipeline...</>
              ) : done ? '🔄 Run Again' : '🚀 Launch Pipeline'}
            </button>
          </div>

          {/* Progress Bar */}
          {(running || done) && (
            <div style={{ ...card, padding: '1.5rem 2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#94a3b8' }}>Pipeline Progress</span>
                <span style={{ fontSize: '0.85rem', fontWeight: 800, color: done ? '#22c55e' : '#f97316' }}>{Math.round(progressPct)}%</span>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: '999px', height: '8px', overflow: 'hidden' }}>
                <div style={{ width: `${progressPct}%`, height: '100%', background: done ? 'linear-gradient(90deg,#22c55e,#4ade80)' : 'linear-gradient(90deg,#f97316,#a855f7)', borderRadius: '999px', transition: 'width 0.6s ease' }} />
              </div>
            </div>
          )}
        </div>

        {/* RIGHT: Step tracker + Results */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

          {/* Steps */}
          {STEPS.map((step, i) => {
            const st = stepStatus[step.id] || STATUS.idle;
            const data = stepData[step.id];
            const isRunning = st === STATUS.running;
            const isDone = st === STATUS.done;
            const isError = st === STATUS.error;
            const accents = { idle: 'rgba(255,255,255,0.06)', running: 'rgba(249,115,22,0.35)', done: 'rgba(34,197,94,0.3)', error: 'rgba(239,68,68,0.3)' };
            const icons = { idle: <span style={{ color: '#475569', fontSize: '0.85rem', fontWeight: 700 }}>0{i + 1}</span>, running: <div style={{ width: '18px', height: '18px', border: '2px solid rgba(249,115,22,0.3)', borderTopColor: '#f97316', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />, done: <span style={{ color: '#22c55e', fontSize: '1.1rem' }}>✓</span>, error: <span style={{ color: '#ef4444', fontSize: '1rem' }}>✗</span> };
            return (
              <div key={step.id} style={{ ...card, padding: '1.5rem 2rem', border: `1px solid ${accents[st]}`, transition: 'all 0.4s', animation: isDone ? 'stepIn 0.4s ease' : 'none', position: 'relative', overflow: 'hidden' }}>
                {isDone && <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: 'linear-gradient(90deg,#22c55e,transparent)' }} />}
                {isRunning && <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: 'linear-gradient(90deg,#f97316,#a855f7)', animation: 'pulse 1.5s ease infinite' }} />}

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: isDone ? 'rgba(34,197,94,0.1)' : isRunning ? 'rgba(249,115,22,0.1)' : isError ? 'rgba(239,68,68,0.1)' : 'rgba(255,255,255,0.04)', border: `1px solid ${accents[st]}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '1.2rem' }}>
                    {st === STATUS.idle ? step.icon : icons[st]}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: '1rem', color: isDone ? '#22c55e' : isRunning ? '#f97316' : isError ? '#ef4444' : '#64748b', marginBottom: '0.15rem' }}>{step.label}</div>
                    <div style={{ fontSize: '0.82rem', color: '#475569' }}>
                      {isRunning ? step.desc :
                       isDone && step.id === 'scrape' ? `✓ Scraped article · ${data?.count} variants generated` :
                       isDone && step.id === 'generate' ? `✓ ${data?.count} total variants ready for analysis` :
                       isDone && step.id === 'sentiment' ? `✓ Best sentiment score: ${data?.topScore}%` :
                       isDone && step.id === 'abtest' ? `✓ Winner: Variant ${(data?.winnerIndex ?? 0) + 1} · Score: ${data?.winnerScore?.toFixed(3)}` :
                       isDone && step.id === 'slack' ? (data?.sent ? '✓ Winner broadcast to team Slack channel' : '⚠ Slack not configured — skipped') :
                       isError ? 'Failed — check backend connection' :
                       step.desc}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Final result card */}
          {done && winnerPost && (
            <div style={{ ...card, background: 'rgba(34,197,94,0.04)', border: '1px solid rgba(34,197,94,0.2)', animation: 'fadeUp 0.5s ease forwards', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: 'linear-gradient(90deg,#22c55e,#4ade80,transparent)' }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '1.5rem' }}>
                <span style={{ fontSize: '2rem' }}>🏆</span>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '1.1rem', color: '#22c55e' }}>Winning Post</div>
                  <div style={{ fontSize: '0.82rem', color: '#64748b' }}>Highest multi-variant score · Best sentiment · Ready to publish</div>
                </div>
                <button onClick={() => { navigator.clipboard.writeText(winnerPost); }} style={{ marginLeft: 'auto', background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.25)', borderRadius: '10px', color: '#22c55e', padding: '0.5rem 1rem', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
                  ⎘ Copy
                </button>
              </div>
              <div style={{ background: 'rgba(0,0,0,0.2)', borderRadius: '14px', padding: '1.5rem', border: '1px solid rgba(255,255,255,0.05)' }}>
                <p style={{ color: '#cbd5e1', lineHeight: 1.85, fontSize: '1rem', margin: 0 }}>{winnerPost}</p>
              </div>
              {stepData.abtest?.explanation && (
                <div style={{ marginTop: '1rem', fontSize: '0.85rem', color: '#64748b', fontStyle: 'italic', padding: '0 0.5rem' }}>
                  💡 Why it won: {stepData.abtest.explanation}
                </div>
              )}
            </div>
          )}

          {error && (
            <div style={{ ...card, background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.2)' }}>
              <div style={{ color: '#f87171', fontWeight: 600, marginBottom: '0.5rem' }}>⚠️ Pipeline Error</div>
              <div style={{ color: '#64748b', fontSize: '0.9rem' }}>{error}</div>
              <button onClick={reset} style={{ marginTop: '1rem', background: 'none', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '10px', color: '#f87171', padding: '0.5rem 1rem', cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.9rem' }}>Reset Pipeline</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
