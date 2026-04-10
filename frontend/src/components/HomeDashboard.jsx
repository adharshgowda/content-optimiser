import { useState, useEffect } from 'react';
import { Sparkles, MessageSquare, SplitSquareHorizontal, LineChart, Cpu, Slack, Globe } from 'lucide-react';

export default function HomeDashboard({ onNavigate }) {
  const [stats, setStats] = useState({
    totalGenerations: 0,
    totalAnalyses: 0,
    activeCampaigns: 0
  });

  // Fetch some real/dummy stats to show on the landing page
  useEffect(() => {
    const fetchGlobalStats = async () => {
      try {
        const res = await fetch('/api/metrics/recent');
        const data = await res.json();
        if (data.metrics && data.metrics.length > 0) {
          setStats({
            totalGenerations: 12450 + (data.metrics.length * 12), // Simulated large number based on activity
            totalAnalyses: 8900 + (data.metrics.length * 8),
            activeCampaigns: data.metrics.length
          });
        } else {
          // Fallback numbers if DB is empty
          setStats({
            totalGenerations: 12450,
            totalAnalyses: 8900,
            activeCampaigns: 24
          });
        }
      } catch (err) {
        setStats({ totalGenerations: 12450, totalAnalyses: 8900, activeCampaigns: 24 });
      }
    };
    fetchGlobalStats();
  }, []);

  const features = [
    {
      id: 'generate',
      title: 'AI Content Generator',
      description: 'Create trend-optimized social media posts perfectly tuned for your target audience and platform.',
      icon: Sparkles,
      color: '#4b9fff'
    },
    {
      id: 'scraper',
      title: 'Web Scraper & Auto-Writer',
      description: 'Paste a link to any article and let the AI automatically read it and summarize it into viral social posts.',
      icon: Globe,
      color: '#00c389'
    },
    {
      id: 'sentiment',
      title: 'Sentiment Engine',
      description: 'Analyze the emotional tone, readability, and toxicity of your copy before you hit publish.',
      icon: MessageSquare,
      color: '#6f42c1'
    },
    {
      id: 'abtest',
      title: 'Multi-Variant Predictor',
      description: 'Compare and rank multiple variations. Our ML model predicts the top winner automatically.',
      icon: SplitSquareHorizontal,
      color: '#f78166'
    },
    {
      id: 'analytics',
      title: 'Gamified Analytics',
      description: 'Track daily impressions, clicks, and conversions in beautifully animated charts.',
      icon: LineChart,
      color: '#2ea043'
    },
    {
      id: 'metrics',
      title: 'Model Training Hub',
      description: 'Retrain the underlying machine learning model using your latest campaign performance data.',
      icon: Cpu,
      color: '#e3b341'
    },
    {
      id: 'slack',
      title: 'Slack Integrations',
      description: 'Broadcast reports and multi-variant winners directly to your marketing teams Slack channel.',
      icon: Slack,
      color: '#d29922'
    }
  ];

  return (
    <div className="fade-in" style={{width: '100%', padding: '0 1rem'}}>
      
      {/* Top Split Section: Hero (Left) and Live Stats (Right) */}
      <div style={{display: 'flex', gap: '4rem', marginBottom: '4rem', alignItems: 'center'}}>
        
        {/* Left: Bold Typography Hero */}
        <div style={{flex: '1.5', paddingRight: '2rem'}}>
          <div style={{display: 'inline-block', background: 'rgba(75, 159, 255, 0.08)', color: 'var(--primary)', padding: '0.4rem 1rem', borderRadius: '8px', fontWeight: 600, marginBottom: '1.5rem', border: '1px solid rgba(75, 159, 255, 0.2)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px'}}>
            Workspace Online 🟢
          </div>
          
          <h1 style={{fontSize: '5rem', fontWeight: 800, marginBottom: '1.5rem', lineHeight: 1.05, letterSpacing: '-0.03em', color: '#fff'}}>
            Scale Your <br/>
            <span style={{background: 'linear-gradient(90deg, #4b9fff, #8a4fff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'}}>
              Content Ops.
            </span>
          </h1>
          
          <p style={{fontSize: '1.25rem', color: 'var(--text-muted)', maxWidth: '90%', lineHeight: 1.6, marginBottom: '2.5rem', fontWeight: 400}}>
            An end-to-end AI workspace. Generate copy, scrape competitor blogs, predict multi-variant winners, and route live analytics directly to your team's Slack.
          </p>

          <div style={{display: 'flex', gap: '1rem'}}>
            <button 
              onClick={() => onNavigate('generate')} 
              style={{background: 'var(--text-main)', color: 'var(--bg-color)', border: 'none', padding: '1rem 2rem', borderRadius: '8px', fontSize: '1.1rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', transition: 'all 0.2sease'}}
              className="hover-lift"
            >
              <Sparkles size={20} /> Create Campaign
            </button>
            <button 
              onClick={() => onNavigate('analytics')} 
              style={{background: 'rgba(255,255,255,0.05)', color: 'var(--text-main)', border: '1px solid rgba(255,255,255,0.1)', padding: '1rem 2rem', borderRadius: '8px', fontSize: '1.1rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', transition: 'all 0.2sease'}}
              className="hover-lift"
            >
              <LineChart size={20} /> View Analytics
            </button>
          </div>
        </div>

        {/* Right: Floating Analytics Cards */}
        <div style={{flex: '1', display: 'flex', flexDirection: 'column', gap: '1.5rem'}}>
          <div className="glass-panel stat-card" style={{padding: '1.5rem 2rem', borderLeft: '4px solid #4b9fff', background: 'linear-gradient(145deg, rgba(30, 35, 45, 0.8), rgba(20, 24, 32, 0.4))'}}>
            <h3 style={{fontSize: '2.5rem', color: '#fff', marginBottom: '0.2rem', fontFamily: 'Inter', fontWeight: 700}}>{stats.totalGenerations.toLocaleString()}<span style={{color: '#4b9fff'}}>{"+"}</span></h3>
            <p style={{color: 'var(--text-muted)', fontWeight: 500, fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px'}}>Words Generated Pipeline</p>
          </div>
          
          <div className="glass-panel stat-card" style={{padding: '1.5rem 2rem', borderLeft: '4px solid #8a4fff', background: 'linear-gradient(145deg, rgba(30, 35, 45, 0.8), rgba(20, 24, 32, 0.4))'}}>
            <h3 style={{fontSize: '2.5rem', color: '#fff', marginBottom: '0.2rem', fontFamily: 'Inter', fontWeight: 700}}>{stats.totalAnalyses.toLocaleString()}</h3>
            <p style={{color: 'var(--text-muted)', fontWeight: 500, fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px'}}>Sentiments Analyzed</p>
          </div>

          <div className="glass-panel stat-card" style={{padding: '1.5rem 2rem', borderLeft: '4px solid #2ea043', background: 'linear-gradient(145deg, rgba(30, 35, 45, 0.8), rgba(20, 24, 32, 0.4))'}}>
             <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
               <div>
                  <h3 style={{fontSize: '2.5rem', color: '#fff', marginBottom: '0.2rem', fontFamily: 'Inter', fontWeight: 700}}>{stats.activeCampaigns}</h3>
                  <p style={{color: 'var(--text-muted)', fontWeight: 500, fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px'}}>Active Campaigns</p>
               </div>
               <div style={{background: 'rgba(46, 160, 67, 0.1)', color: '#2ea043', padding: '0.5rem', borderRadius: '50%'}}>
                 <LineChart size={24} />
               </div>
             </div>
          </div>
        </div>

      </div>

      <hr style={{border: 'none', height: '1px', background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)', margin: '4rem 0'}} />

      {/* Feature Grid Navigation (The Workspace) */}
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem'}}>
        <div>
          <h2 style={{fontSize: '1.8rem', fontWeight: 600, color: '#fff', margin: 0}}>Marketing Tools</h2>
          <p style={{color: 'var(--text-muted)', margin: '0.5rem 0 0 0'}}>Select an intelligence engine to begin.</p>
        </div>
      </div>

      <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '1.5rem', paddingBottom: '4rem'}}>
        {features.map((feature, idx) => {
          const Icon = feature.icon;
          return (
            <div 
              key={feature.id} 
              className="premium-feature-card fade-in" 
              style={{
                animationDelay: `${idx * 0.05}s`, 
                cursor: 'pointer', 
                background: 'rgba(20, 24, 32, 0.6)',
                border: '1px solid rgba(255,255,255,0.05)',
                borderRadius: '16px',
                padding: '2rem',
                transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '1.2rem'
              }}
              onClick={() => onNavigate(feature.id)}
            >
              <div style={{background: `${feature.color}15`, padding: '1rem', borderRadius: '14px', color: feature.color, flexShrink: 0}}>
                <Icon size={24} strokeWidth={2.5} />
              </div>
              <div>
                <h3 style={{fontSize: '1.15rem', color: '#fff', margin: '0 0 0.4rem 0', fontWeight: 600}}>{feature.title}</h3>
                <p style={{color: 'var(--text-muted)', lineHeight: 1.5, fontSize: '0.95rem', margin: 0}}>{feature.description}</p>
              </div>
            </div>
          );
        })}
      </div>

      <style jsx>{`
        .hover-lift:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 25px rgba(0,0,0,0.5);
        }
        .stat-card {
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .stat-card:hover {
          transform: translateX(5px);
          border-color: rgba(255,255,255,0.2) !important;
        }
        .premium-feature-card:hover {
          background: rgba(30, 35, 45, 0.9) !important;
          border-color: rgba(255,255,255,0.15) !important;
          transform: translateY(-4px);
          box-shadow: 0 12px 30px rgba(0,0,0,0.3);
        }
      `}</style>
    </div>
  );
}
