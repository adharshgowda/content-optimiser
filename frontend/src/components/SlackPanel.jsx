import { useState } from 'react';

export default function SlackPanel() {
  const [message, setMessage] = useState('Hello from AI Marketing Optimizer Team!');
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/slack/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message })
      });
      if (!res.ok) throw new Error('Slack notification failed. Check .env config.');
      alert('Slack message sent! 📣');
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-panel fade-in">
      <h2>🔔 Slack Notifications</h2>
      <p style={{color: 'var(--text-muted)', marginBottom: '1.5rem'}}>
        Send updates manually to your team channel. (Multi-variant tests and auto-retrainer send automatically).
      </p>

      <div className="form-group">
        <label>Custom Message</label>
        <textarea rows={4} value={message} onChange={e => setMessage(e.target.value)}></textarea>
      </div>

      <button className="btn-primary" onClick={handleSend} disabled={loading} style={{width: 'auto'}}>
        {loading ? <><span className="loader"></span> Sending...</> : "Send Slack Broadcast 🛫"}
      </button>
    </div>
  );
}
