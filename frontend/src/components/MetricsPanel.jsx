import { useState } from 'react';

export default function MetricsPanel() {
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState(null);

  const [impressions, setImpressions] = useState(1000);
  const [clicks, setClicks] = useState(80);
  const [likes, setLikes] = useState(50);
  const [comments, setComments] = useState(10);
  const [shares, setShares] = useState(15);
  const [conversions, setConversions] = useState(8);
  const [trendScore, setTrendScore] = useState(50.0);

  const pushMetrics = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/metrics/push-daily', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          impressions: parseInt(impressions),
          clicks: parseInt(clicks),
          likes: parseInt(likes),
          comments: parseInt(comments),
          shares: parseInt(shares),
          conversions: parseInt(conversions),
          trend_score: parseFloat(trendScore)
        })
      });
      const data = await res.json();
      alert('Metrics pushed successfully!');
    } catch (err) {
      alert('Failed to push metrics');
    } finally {
      setLoading(false);
    }
  };

  const runManualTraining = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/model/train', { method: 'POST' });
      const data = await res.json();
      setStats(data.stats);
    } catch (err) {
      alert('Failed to train model');
    } finally {
      setLoading(false);
    }
  };

  const runAutoRetrainer = async () => {
    setLoading(true);
    try {
      await fetch('/api/model/auto-retrain', { method: 'POST' });
      alert('Auto-Retrainer completed and Slack notified!');
    } catch (err) {
      alert('Failed auto-retrain cycle');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid-2">
      <div className="glass-panel fade-in">
        <h2>📊 Push Daily Metrics</h2>
        <p style={{color: 'var(--text-muted)', marginBottom: '1.5rem'}}>
          Record daily performance to Google Sheets or local DB.
        </p>

        <div className="grid-2">
          <div className="form-group"><label>Impressions</label><input type="number" value={impressions} onChange={e=>setImpressions(e.target.value)} /></div>
          <div className="form-group"><label>Clicks</label><input type="number" value={clicks} onChange={e=>setClicks(e.target.value)} /></div>
          <div className="form-group"><label>Likes</label><input type="number" value={likes} onChange={e=>setLikes(e.target.value)} /></div>
          <div className="form-group"><label>Comments</label><input type="number" value={comments} onChange={e=>setComments(e.target.value)} /></div>
          <div className="form-group"><label>Shares</label><input type="number" value={shares} onChange={e=>setShares(e.target.value)} /></div>
          <div className="form-group"><label>Conversions</label><input type="number" value={conversions} onChange={e=>setConversions(e.target.value)} /></div>
        </div>
        <div className="form-group">
          <label>Avg Trend Score: {trendScore}</label>
          <input type="range" min="0" max="100" value={trendScore} onChange={e=>setTrendScore(e.target.value)} />
        </div>
        <button className="btn-primary" onClick={pushMetrics} disabled={loading} style={{background: 'rgba(255,255,255,0.1)'}}>
          Push Sample Metrics 📈
        </button>
      </div>

      <div className="glass-panel fade-in" style={{animationDelay: '0.1s'}}>
        <h2>🧠 Model Training Hub</h2>
        <p style={{color: 'var(--text-muted)', marginBottom: '1.5rem'}}>
          Control the Machine Learning model that powers your optimization.
        </p>

        <button className="btn-primary" onClick={runManualTraining} disabled={loading} style={{marginBottom: '1rem'}}>
          {loading ? "Processing..." : "Train Model Now (Manual) 🚀"}
        </button>

        <button className="btn-primary" onClick={runAutoRetrainer} disabled={loading} style={{background: 'rgba(255,255,255,0.1)'}}>
          {loading ? "Processing..." : "Run Auto Retrainer Cycle 🔄"}
        </button>

        {stats && (
          <div className="result-card" style={{marginTop: '2rem'}}>
            <h4 style={{marginBottom: '0.5rem', color: 'var(--success)'}}>Training Completed</h4>
            <pre style={{whiteSpace: 'pre-wrap', fontSize: '0.9rem', color: 'var(--text-muted)'}}>
              {JSON.stringify(stats, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
