import { useState } from 'react';

export default function MarketingReadyPage({ analysisData }) {
  const winnerLabel = analysisData?.winnerLabel || 'Variant 1';
  const winnerText = analysisData?.winnerText || 'Your winning content will appear here.';
  const [copied, setCopied] = useState(false);
  const copyContent = async () => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(winnerText);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = winnerText;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (e) {
      console.error('Failed to copy content', e);
      alert('Unable to copy content. Please copy manually.');
    }
  };

  return (
    <div style={{ width: '100%' }}>
      <div style={{ marginBottom: '1rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#f1f5f9', marginBottom: '0.2rem' }}>Ready to Post</h1>
        <p style={{ color: '#94a3b8', margin: 0 }}>Winning variant: <span style={{ color: '#22c55e', fontWeight: 700 }}>{winnerLabel}</span></p>
      </div>
      <div style={{ height: '1px', background: 'rgba(255,255,255,0.08)', marginBottom: '1.1rem' }} />

      <div style={{ background: 'rgba(15,20,35,0.7)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '1.2rem', marginBottom: '0.9rem', maxWidth: '860px' }}>
        <div style={{ fontSize: '0.82rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.08em', marginBottom: '0.6rem' }}>Selected Content</div>
        <p style={{ color: '#e2e8f0', lineHeight: 1.8, margin: 0 }}>{winnerText}</p>
      </div>

      <button
        onClick={copyContent}
        style={{
          border: 'none',
          borderRadius: '10px',
          background: 'linear-gradient(135deg, #22c55e, #16a34a)',
          color: '#fff',
          fontWeight: 700,
          padding: '0.7rem 1.1rem',
          cursor: 'pointer'
        }}
      >
        {copied ? '✅ Copied' : '📋 Copy Content'}
      </button>
    </div>
  );
}
