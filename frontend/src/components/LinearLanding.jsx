import React, { useEffect, useRef, useState } from 'react';

function useInView(threshold = 0.15) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setInView(true); obs.disconnect(); } }, { threshold });
    obs.observe(el); return () => obs.disconnect();
  }, [threshold]);
  return [ref, inView];
}

function useCounter(target, duration = 1800, active = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!active) return;
    let start = null;
    const step = (ts) => { if (!start) start = ts; const p = Math.min((ts - start) / duration, 1); setCount(Math.floor(p * target)); if (p < 1) requestAnimationFrame(step); };
    requestAnimationFrame(step);
  }, [active, target, duration]);
  return count;
}

function Reveal({ children, delay = 0, style = {}, dir = 'up' }) {
  const [ref, inView] = useInView();
  const t = { up: 'translateY(60px)', left: 'translateX(-50px)', right: 'translateX(50px)', scale: 'scale(0.93)' };
  return (
    <div ref={ref} style={{ transform: inView ? 'none' : t[dir], opacity: inView ? 1 : 0, transition: `transform 0.75s cubic-bezier(0.22,1,0.36,1) ${delay}ms, opacity 0.75s ease ${delay}ms`, ...style }}>
      {children}
    </div>
  );
}

function Counter({ value, suffix = '', accent, label, delay }) {
  const [ref, inView] = useInView();
  const n = useCounter(value, 2000, inView);
  return (
    <Reveal delay={delay} style={{ flex: 1, minWidth: '180px' }}>
      <div ref={ref} style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${accent}30`, borderRadius: '20px', padding: '2.5rem 2rem', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: `linear-gradient(90deg, transparent, ${accent}, transparent)` }} />
        <div style={{ fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.12em', color: accent, marginBottom: '0.8rem' }}>Live</div>
        <div style={{ fontSize: '3rem', fontWeight: 900, color: '#fff', lineHeight: 1, letterSpacing: '-0.03em' }}>{n.toLocaleString()}{suffix}</div>
        <div style={{ color: '#64748b', marginTop: '0.6rem', fontSize: '0.9rem' }}>{label}</div>
      </div>
    </Reveal>
  );
}

function FeatCard({ icon, color, label, desc, tab, onNavigate, delay }) {
  const [h, setH] = useState(false);
  return (
    <Reveal delay={delay}>
      <div onClick={() => onNavigate(tab)} onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
        style={{ background: h ? 'rgba(30,30,45,0.9)' : 'rgba(14,14,22,0.7)', border: `1px solid ${h ? color + '50' : 'rgba(255,255,255,0.07)'}`, borderRadius: '20px', padding: '2rem', cursor: 'pointer', transform: h ? 'translateY(-8px)' : 'none', transition: 'all 0.35s cubic-bezier(0.22,1,0.36,1)', boxShadow: h ? `0 20px 60px ${color}20` : 'none', height: '100%', overflow: 'hidden', position: 'relative' }}>
        {h && <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse at top left, ${color}08, transparent)`, pointerEvents: 'none' }} />}
        <div style={{ width: '46px', height: '46px', borderRadius: '14px', background: `${color}18`, border: `1px solid ${color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.4rem' }}>
          <span className="material-symbols-outlined" style={{ color, fontSize: '22px' }}>{icon}</span>
        </div>
        <div style={{ fontWeight: 700, fontSize: '1.05rem', marginBottom: '0.5rem', color: '#f1f5f9' }}>{label}</div>
        <div style={{ color: '#64748b', fontSize: '0.88rem', lineHeight: 1.7 }}>{desc}</div>
        <div style={{ marginTop: '1.2rem', fontSize: '0.82rem', color, fontWeight: 600, opacity: h ? 1 : 0, transition: 'opacity 0.3s', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
          Open tool <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>arrow_forward</span>
        </div>
      </div>
    </Reveal>
  );
}

const SECTIONS = [
  { id: 'hero', label: '01 Hero', color: '#f97316' },
  { id: 'stats', label: '02 Metrics', color: '#a855f7' },
  { id: 'features', label: '03 Tools', color: '#3b82f6' },
  { id: 'analytics', label: '04 Analytics', color: '#f59e0b' },
  { id: 'process', label: '05 Process', color: '#8b5cf6' },
  { id: 'testimonials', label: '06 Stories', color: '#22c55e' },
  { id: 'cta', label: '07 Start', color: '#f97316' },
];

const SECTION_THEMES = {
  hero:         { bg: '#080810', glow: 'rgba(249,115,22,0.14)', glow2: 'rgba(168,85,247,0.08)', glowPos: 'top left', glow2Pos: 'bottom right' },
  stats:        { bg: '#06060f', glow: 'rgba(168,85,247,0.14)', glow2: 'rgba(59,130,246,0.08)', glowPos: 'top right', glow2Pos: 'bottom left' },
  features:     { bg: '#04090e', glow: 'rgba(59,130,246,0.14)', glow2: 'rgba(34,197,94,0.06)', glowPos: 'top center', glow2Pos: 'bottom right' },
  analytics:    { bg: '#0c0900', glow: 'rgba(245,158,11,0.14)', glow2: 'rgba(249,115,22,0.07)', glowPos: 'top left', glow2Pos: 'bottom right' },
  process:      { bg: '#08060f', glow: 'rgba(139,92,246,0.14)', glow2: 'rgba(168,85,247,0.07)', glowPos: 'top center', glow2Pos: 'bottom left' },
  testimonials: { bg: '#050e07', glow: 'rgba(34,197,94,0.12)', glow2: 'rgba(59,130,246,0.07)', glowPos: 'top right', glow2Pos: 'bottom left' },
  cta:          { bg: '#0a0510', glow: 'rgba(249,115,22,0.16)', glow2: 'rgba(168,85,247,0.12)', glowPos: 'top center', glow2Pos: 'bottom center' },
};

function SectionBg({ id }) {
  const t = SECTION_THEMES[id];
  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0, background: t.bg }} />
      <div style={{ position: 'absolute', width: '70vw', height: '70vh', [t.glowPos.includes('right') ? 'right' : 'left']: '-15vw', [t.glowPos.includes('bottom') ? 'bottom' : 'top']: '-15vh', background: `radial-gradient(ellipse, ${t.glow} 0%, transparent 65%)` }} />
      <div style={{ position: 'absolute', width: '60vw', height: '60vh', [t.glow2Pos.includes('right') ? 'right' : 'left']: '-10vw', [t.glow2Pos.includes('bottom') ? 'bottom' : 'top']: '-10vh', background: `radial-gradient(ellipse, ${t.glow2} 0%, transparent 65%)` }} />
    </div>
  );
}

function Divider({ fromColor, toColor }) {
  return (
    <div style={{ width: '100%', height: '1px', background: `linear-gradient(90deg, transparent 0%, ${fromColor}60 30%, ${toColor}60 70%, transparent 100%)`, position: 'relative' }}>
      <div style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%,-50%)', width: '8px', height: '8px', borderRadius: '50%', background: `linear-gradient(135deg, ${fromColor}, ${toColor})`, boxShadow: `0 0 12px ${fromColor}` }} />
    </div>
  );
}

export default function LinearLanding({ onNavigate }) {
  const [scrollY, setScrollY] = useState(0);
  const [activeSection, setActiveSection] = useState('hero');
  const [heroReady, setHeroReady] = useState(false);
  const sectionRefs = useRef({});

  useEffect(() => {
    ['https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap',
     'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap'
    ].forEach(href => { const l = document.createElement('link'); l.rel = 'stylesheet'; l.href = href; document.head.appendChild(l); });
    document.body.style.overflowX = 'hidden';
    setTimeout(() => setHeroReady(true), 120);

    const onScroll = () => {
      setScrollY(window.scrollY);
      SECTIONS.forEach(({ id }) => {
        const el = sectionRefs.current[id];
        if (el) { const r = el.getBoundingClientRect(); if (r.top <= window.innerHeight / 2 && r.bottom >= window.innerHeight / 2) setActiveSection(id); }
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => { window.removeEventListener('scroll', onScroll); document.body.style.overflowX = ''; };
  }, []);

  const scrollTo = (id) => sectionRefs.current[id]?.scrollIntoView({ behavior: 'smooth' });

  const features = [
    { icon: 'auto_awesome', color: '#f97316', label: 'AI Content Generator', desc: 'Generate high-converting marketing copy in seconds with fine-tuned LLMs trained on your brand voice.', tab: 'generate' },
    { icon: 'data_object', color: '#3b82f6', label: 'Web Scraper', desc: 'Extract structured data from any website at scale. Fuel competitive intelligence and market research.', tab: 'scraper' },
    { icon: 'mood', color: '#a855f7', label: 'Sentiment Engine', desc: 'Real-time emotional tracking across all social channels. Know exactly how your audience feels.', tab: 'sentiment' },
    { icon: 'analytics', color: '#f97316', label: 'Multi-Variant Predictor', desc: 'ML models that rank variants before launch — ship the best version every time.', tab: 'abtest' },
    { icon: 'sports_esports', color: '#3b82f6', label: 'Gamified Analytics', desc: 'Track team milestones with an interactive reward-based dashboard that turns metrics into motivation.', tab: 'analytics' },
    { icon: 'model_training', color: '#a855f7', label: 'Model Hub', desc: 'Fine-tune AI models on your brand\'s unique voice, tone, and style guidelines for perfect output.', tab: 'metrics' },
    { icon: 'sync', color: '#f97316', label: 'Slack Sync', desc: 'Campaign updates, performance alerts, and milestones delivered directly to your Slack channels.', tab: 'slack' },
    { icon: 'campaign', color: '#3b82f6', label: 'Campaign Manager', desc: 'Orchestrate multi-channel campaigns from a single intelligent command centre with AI co-pilot.', tab: 'generate' },
    { icon: 'bar_chart', color: '#a855f7', label: 'Deep Analytics', desc: 'Predictive performance modeling, competitor benchmarking, and automated reporting in one view.', tab: 'analytics' },
  ];

  const currentTheme = SECTION_THEMES[activeSection] || SECTION_THEMES.hero;
  const accentColor = SECTIONS.find(s => s.id === activeSection)?.color || '#f97316';

  return (
    <div style={{ width: '100vw', minHeight: '100vh', fontFamily: "'Inter', sans-serif", color: '#f1f5f9', overflowX: 'hidden', transition: 'background 1s ease', background: currentTheme.bg }}>
      <style>{`
        @keyframes shimmer { 0%,100%{background-position:0% center} 50%{background-position:100% center} }
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-18px)} }
        @keyframes float2 { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-12px)} }
        @keyframes pulse { 0%,100%{box-shadow:0 0 0 0 rgba(249,115,22,0.5)} 70%{box-shadow:0 0 0 12px rgba(249,115,22,0)} }
        @keyframes glow { 0%,100%{opacity:0.3} 50%{opacity:1} }
        @keyframes countup { from{opacity:0} to{opacity:1} }
        .nav-link { color:#64748b; text-decoration:none; font-size:0.88rem; font-weight:500; transition:color 0.2s; }
        .nav-link:hover { color:#f97316; }
        .btn-p { background:#f97316; color:white; border:none; border-radius:14px; font-weight:700; cursor:pointer; font-family:'Inter',sans-serif; transition:all 0.3s cubic-bezier(0.22,1,0.36,1); box-shadow:0 6px 24px rgba(249,115,22,0.35); }
        .btn-p:hover { transform:scale(1.05) translateY(-2px); box-shadow:0 14px 40px rgba(249,115,22,0.5); }
        .btn-g { background:rgba(255,255,255,0.05); color:#e2e8f0; border:1px solid rgba(255,255,255,0.12); border-radius:14px; font-weight:700; cursor:pointer; font-family:'Inter',sans-serif; transition:all 0.3s; backdrop-filter:blur(8px); }
        .btn-g:hover { background:rgba(255,255,255,0.1); transform:translateY(-2px); }
        .hero-word { display:inline-block; opacity:0; transform:translateY(40px); }
        .hero-ready .hero-word { opacity:1; transform:none; transition:opacity 0.65s ease, transform 0.65s cubic-bezier(0.22,1,0.36,1); }
        @media(max-width:900px) { .feat-grid{grid-template-columns:repeat(2,1fr)!important} .two-col{grid-template-columns:1fr!important} .side-nav{display:none!important} }
        @media(max-width:600px) { .feat-grid{grid-template-columns:1fr!important} }
      `}</style>

      {/* ── SIDE NAV DOTS ── */}
      <div className="side-nav" style={{ position: 'fixed', right: '2rem', top: '50%', transform: 'translateY(-50%)', zIndex: 900, display: 'flex', flexDirection: 'column', gap: '0.6rem', alignItems: 'flex-end' }}>
        {SECTIONS.map(s => (
          <button key={s.id} onClick={() => scrollTo(s.id)} title={s.label} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '4px 0' }}>
            {activeSection === s.id && <span style={{ fontSize: '0.65rem', color: s.color, fontWeight: 700, letterSpacing: '0.05em', opacity: 1, transition: 'opacity 0.4s', whiteSpace: 'nowrap' }}>{s.label}</span>}
            <div style={{ width: activeSection === s.id ? '10px' : '6px', height: activeSection === s.id ? '10px' : '6px', borderRadius: '50%', background: activeSection === s.id ? s.color : 'rgba(255,255,255,0.2)', transition: 'all 0.4s cubic-bezier(0.22,1,0.36,1)', boxShadow: activeSection === s.id ? `0 0 10px ${s.color}` : 'none' }} />
          </button>
        ))}
      </div>

      {/* ── NAV ── */}
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000, background: `rgba(8,8,16,${Math.min(scrollY / 150, 0.95)})`, backdropFilter: scrollY > 20 ? 'blur(20px)' : 'none', borderBottom: scrollY > 20 ? '1px solid rgba(255,255,255,0.06)' : '1px solid transparent', height: '66px', display: 'flex', alignItems: 'center', padding: '0 5vw', justifyContent: 'space-between', transition: 'all 0.4s' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer' }} onClick={() => scrollTo('hero')}>
          <div style={{ width: '32px', height: '32px', background: 'linear-gradient(135deg,#f97316,#ec4899)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span className="material-symbols-outlined" style={{ color: 'white', fontSize: '18px' }}>auto_awesome</span>
          </div>
          <span style={{ fontSize: '1.1rem', fontWeight: 800, letterSpacing: '-0.03em' }}>AI Optimizer</span>
          <span style={{ background: 'rgba(249,115,22,0.15)', border: '1px solid rgba(249,115,22,0.3)', color: '#f97316', fontSize: '0.62rem', fontWeight: 700, padding: '0.15rem 0.45rem', borderRadius: '6px' }}>v2.0</span>
        </div>
        <div style={{ display: 'flex', gap: '2.5rem' }}>
          {['Features','Tools','Analytics','Pricing','Docs'].map(n => <a key={n} className="nav-link" href="#">{n}</a>)}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button style={{ background: 'none', border: 'none', color: '#64748b', fontSize: '0.9rem', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 500 }}>Sign In</button>
          <button className="btn-p" style={{ padding: '0.65rem 1.4rem', fontSize: '0.88rem' }} onClick={() => onNavigate('generate')}>Get Started →</button>
        </div>
      </nav>

      {/* ═══════════════════════════════════
          PAGE 1 — HERO
      ══════════════════════════════════ */}
      <section ref={el => sectionRefs.current.hero = el} id="hero" style={{ minHeight: '100vh', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '100px 5vw 5rem', textAlign: 'center', position: 'relative' }}>
        <SectionBg id="hero" />
        <div style={{ position: 'relative', zIndex: 1, width: '100%' }}>
          <div style={{ opacity: heroReady ? 1 : 0, transform: heroReady ? 'none' : 'translateY(-20px)', transition: 'all 0.6s ease 0.1s', marginBottom: '2.5rem' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.6rem', background: 'rgba(249,115,22,0.08)', border: '1px solid rgba(249,115,22,0.25)', borderRadius: '999px', padding: '0.45rem 1.2rem' }}>
              <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#f97316', display: 'inline-block', animation: 'pulse 2s infinite' }} />
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#f97316', letterSpacing: '0.12em', textTransform: 'uppercase' }}>v2.0 Now Live — Integrated with GPT-4o</span>
            </div>
          </div>

          <h1 className={heroReady ? 'hero-ready' : ''} style={{ fontSize: 'clamp(3rem, 8vw, 7.5rem)', fontWeight: 900, lineHeight: 1.04, letterSpacing: '-0.04em', marginBottom: '0' }}>
            {['Scale','Your','Content'].map((w, i) => (
              <span key={w} className="hero-word" style={{ transitionDelay: `${i * 0.08 + 0.3}s`, marginRight: '0.22em' }}>{w}</span>
            ))}<br />
            {['Operations','with'].map((w, i) => (
              <span key={w} className="hero-word" style={{ transitionDelay: `${i * 0.08 + 0.55}s`, marginRight: '0.22em', color: 'rgba(255,255,255,0.45)' }}>{w}</span>
            ))}
            <span className="hero-word" style={{ transitionDelay: '0.75s', background: 'linear-gradient(90deg,#f97316,#ec4899,#a855f7,#f97316)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', backgroundSize: '300% auto', animation: 'shimmer 6s linear infinite' }}>AI</span>
          </h1>

          <p style={{ opacity: heroReady ? 1 : 0, transform: heroReady ? 'none' : 'translateY(20px)', transition: 'all 0.8s ease 0.9s', fontSize: 'clamp(1rem, 1.8vw, 1.25rem)', color: '#64748b', lineHeight: 1.8, marginTop: '2.5rem', marginBottom: '3rem', maxWidth: '640px', margin: '2.5rem auto 3rem' }}>
            Generate marketing content, analyze sentiment, predict multi-variant winners,<br />and optimize campaigns with a unified AI platform.
          </p>

          <div style={{ opacity: heroReady ? 1 : 0, transition: 'opacity 0.8s ease 1.1s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap', marginBottom: '2.5rem' }}>
            <button className="btn-p" style={{ fontSize: '1.1rem', padding: '1.1rem 3rem' }} onClick={() => onNavigate('generate')}>Start Creating Free</button>
            <button className="btn-g" style={{ fontSize: '1.1rem', padding: '1.1rem 2.5rem' }} onClick={() => scrollTo('features')}>Explore Tools ↓</button>
          </div>

          <div style={{ opacity: heroReady ? 1 : 0, transition: 'opacity 1s ease 1.4s', display: 'flex', alignItems: 'center', gap: '1.5rem', justifyContent: 'center', marginBottom: '4rem', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <div style={{ display: 'flex' }}>{['#f97316','#3b82f6','#a855f7','#22c55e'].map((c, i) => <div key={c} style={{ width: '28px', height: '28px', borderRadius: '50%', background: c, border: '2px solid #080810', marginLeft: i ? '-8px' : 0 }} />)}</div>
              <span style={{ color: '#64748b', fontSize: '0.85rem' }}>Trusted by <strong style={{ color: '#e2e8f0' }}>2,000+</strong> teams</span>
            </div>
            <div style={{ width: '1px', height: '18px', background: 'rgba(255,255,255,0.1)' }} />
            <div style={{ display: 'flex', gap: '0.2rem', alignItems: 'center' }}>
              {[...Array(5)].map((_, i) => <span key={i} style={{ color: '#f97316', fontSize: '0.9rem' }}>★</span>)}
              <span style={{ color: '#64748b', fontSize: '0.85rem', marginLeft: '0.4rem' }}>4.9/5 rating</span>
            </div>
          </div>

          {/* Mock dashboard */}
          <div style={{ width: '100%', position: 'relative' }}>
            <div style={{ position: 'absolute', inset: '-2px', background: 'linear-gradient(135deg,rgba(249,115,22,0.5),rgba(168,85,247,0.4))', borderRadius: '22px', filter: 'blur(18px)', opacity: 0.45 }} />
            <div style={{ position: 'relative', background: '#0d0d1a', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.07)', overflow: 'hidden', boxShadow: '0 50px 100px rgba(0,0,0,0.8)' }}>
              <div style={{ height: '44px', background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', padding: '0 1.5rem', gap: '0.5rem' }}>
                {['#FF5F57','#FFBD2E','#28C840'].map(c => <div key={c} style={{ width: '12px', height: '12px', borderRadius: '50%', background: c }} />)}
                <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
                  <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '8px', padding: '0.28rem 1.5rem', fontSize: '0.72rem', color: '#475569', border: '1px solid rgba(255,255,255,0.05)' }}>app.aioptimizer.io/dashboard</div>
                </div>
              </div>
              <div style={{ display: 'flex', height: '380px' }}>
                <div style={{ width: '180px', borderRight: '1px solid rgba(255,255,255,0.05)', padding: '1.2rem 0.8rem', display: 'flex', flexDirection: 'column', gap: '0.3rem', flexShrink: 0 }}>
                  {['🏠 Dashboard','🚀 Generate','🌍 Scraper','💬 Sentiment','🆚 Multi-Variant Test','🏆 Analytics','⚒️ Model Hub'].map((item, i) => (
                    <div key={i} style={{ padding: '0.55rem 0.75rem', borderRadius: '8px', fontSize: '0.76rem', color: i === 0 ? '#f97316' : '#475569', background: i === 0 ? 'rgba(249,115,22,0.1)' : 'transparent', fontWeight: i === 0 ? 600 : 400 }}>{item}</div>
                  ))}
                </div>
                <div style={{ flex: 1, padding: '1.5rem 2rem' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
                    {[{l:'Words Generated',v:'12,450',c:'+18%',a:'#f97316'},{l:'Sentiment Score',v:'87%',c:'+5pt',a:'#22c55e'},{l:'Active Campaigns',v:'24',c:'All live',a:'#3b82f6'}].map(card => (
                      <div key={card.l} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '10px', padding: '1.1rem' }}>
                        <div style={{ fontSize: '0.68rem', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.4rem' }}>{card.l}</div>
                        <div style={{ fontSize: '1.7rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.02em' }}>{card.v}</div>
                        <div style={{ fontSize: '0.72rem', color: card.a, marginTop: '0.2rem' }}>↑ {card.c}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: '10px', padding: '1.2rem', height: '185px', display: 'flex', alignItems: 'flex-end', gap: '0.4rem' }}>
                    {[65,80,45,90,70,95,75,88,60,92,78,85].map((h, i) => (
                      <div key={i} style={{ flex: 1, height: `${h}%`, borderRadius: '5px 5px 0 0', background: i === 9 ? 'linear-gradient(180deg,#f97316,#ec4899)' : `rgba(249,115,22,${0.12 + i * 0.02})` }} />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Divider fromColor="#f97316" toColor="#a855f7" />

      {/* ═══════════════════════════════════
          PAGE 2 — STATS
      ══════════════════════════════════ */}
      <section ref={el => sectionRefs.current.stats = el} id="stats" style={{ minHeight: '100vh', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '5rem 5vw', position: 'relative' }}>
        <SectionBg id="stats" />
        <div style={{ position: 'relative', zIndex: 1, width: '100%' }}>
          <Reveal style={{ textAlign: 'center', marginBottom: '5rem' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#a855f7', marginBottom: '1rem' }}>Real-time Platform Activity</div>
            <h2 style={{ fontSize: 'clamp(2rem, 4.5vw, 4rem)', fontWeight: 900, letterSpacing: '-0.03em', marginBottom: '1rem' }}>Numbers that<br />speak for themselves</h2>
            <p style={{ color: '#64748b', fontSize: '1.05rem', lineHeight: 1.7 }}>Live metrics from teams scaling with AI Optimizer right now.</p>
          </Reveal>
          <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
            <Counter label="Words Generated Today" value={12450} suffix="+" accent="#f97316" delay={0} />
            <Counter label="Sentiments Analyzed" value={8900} suffix="" accent="#a855f7" delay={100} />
            <Counter label="Active Campaigns" value={24} suffix="" accent="#3b82f6" delay={200} />
            <Counter label="Teams Scaling" value={2000} suffix="+" accent="#22c55e" delay={300} />
          </div>
          <Reveal delay={400} style={{ marginTop: '5rem', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '20px', padding: '2.5rem', display: 'flex', gap: '3rem', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center' }}>
            {[{icon:'speed',label:'< 3s',desc:'Average content generation time'},{icon:'thumb_up',label:'98%',desc:'Customer satisfaction rate'},{icon:'trending_up',label:'340%',desc:'Average ROI improvement'},{icon:'groups',label:'50+',desc:'Enterprise integrations'}].map((m, i) => (
              <div key={m.label} style={{ textAlign: 'center', minWidth: '120px' }}>
                <span className="material-symbols-outlined" style={{ color: ['#f97316','#a855f7','#3b82f6','#22c55e'][i], fontSize: '28px', marginBottom: '0.5rem', display: 'block' }}>{m.icon}</span>
                <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#fff', letterSpacing: '-0.02em' }}>{m.label}</div>
                <div style={{ color: '#64748b', fontSize: '0.82rem', marginTop: '0.3rem' }}>{m.desc}</div>
              </div>
            ))}
          </Reveal>
        </div>
      </section>

      <Divider fromColor="#a855f7" toColor="#3b82f6" />

      {/* ═══════════════════════════════════
          PAGE 3 — FEATURES
      ══════════════════════════════════ */}
      <section ref={el => sectionRefs.current.features = el} id="features" style={{ minHeight: '100vh', width: '100%', padding: '5rem 5vw', position: 'relative' }}>
        <SectionBg id="features" />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <Reveal style={{ marginBottom: '4rem' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#3b82f6', marginBottom: '1rem' }}>Powerful AI Toolset</div>
            <h2 style={{ fontSize: 'clamp(2rem, 4.5vw, 4rem)', fontWeight: 900, letterSpacing: '-0.03em', marginBottom: '1.2rem' }}>Everything you need<br />to dominate marketing</h2>
            <p style={{ color: '#64748b', fontSize: '1.05rem', lineHeight: 1.7, maxWidth: '560px' }}>Nine specialized AI tools, one unified platform. Automate your entire marketing workflow and crush your growth targets.</p>
          </Reveal>
          <div className="feat-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '1.2rem' }}>
            {features.map((f, i) => <FeatCard key={f.label} {...f} onNavigate={onNavigate} delay={i * 60} />)}
          </div>
        </div>
      </section>

      <Divider fromColor="#3b82f6" toColor="#f59e0b" />

      {/* ═══════════════════════════════════
          PAGE 4 — ANALYTICS
      ══════════════════════════════════ */}
      <section ref={el => sectionRefs.current.analytics = el} id="analytics" style={{ minHeight: '100vh', width: '100%', display: 'flex', alignItems: 'center', padding: '5rem 5vw', position: 'relative' }}>
        <SectionBg id="analytics" />
        <div className="two-col" style={{ position: 'relative', zIndex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6rem', width: '100%', alignItems: 'center' }}>
          <Reveal dir="left">
            <div style={{ fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#f59e0b', marginBottom: '1.5rem' }}>Enterprise Analytics</div>
            <h2 style={{ fontSize: 'clamp(2rem, 3.5vw, 3.5rem)', fontWeight: 900, letterSpacing: '-0.03em', marginBottom: '1.5rem', lineHeight: 1.1 }}>Deep Analytics<br />Insight</h2>
            <p style={{ color: '#64748b', lineHeight: 1.8, marginBottom: '2.5rem', fontSize: '1rem' }}>A 360° view of every campaign's performance. Monitor sentiment shifts, engagement spikes, and ROI in real-time with predictive AI modeling.</p>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '1.1rem', marginBottom: '2.5rem' }}>
              {['Predictive performance modeling','Competitor benchmarking with live data','Automated reporting & PDF exporting','Custom dashboards per team'].map(item => (
                <li key={item} style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', fontSize: '0.95rem' }}>
                  <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <span className="material-symbols-outlined" style={{ color: '#f59e0b', fontSize: '13px' }}>check</span>
                  </div>
                  <span style={{ color: '#cbd5e1' }}>{item}</span>
                </li>
              ))}
            </ul>
            <button className="btn-p" style={{ padding: '1rem 2.5rem', fontSize: '1rem', background: '#f59e0b', boxShadow: '0 6px 24px rgba(245,158,11,0.4)' }} onClick={() => onNavigate('analytics')}>Open Analytics →</button>
          </Reveal>
          <Reveal dir="right">
            <div style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', inset: '-2px', background: 'linear-gradient(135deg,rgba(245,158,11,0.4),transparent)', borderRadius: '22px', filter: 'blur(16px)', opacity: 0.5 }} />
              <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuBp-IWDCln_4YRBO0HWwnhX5ie-QWPtZwg2KvVqwynMhzI9CYeyPi-fOjCPfMj-XQ3_2XU0_A15VYdNC7Ii-2uA16UmMoTh240HY0XdkyDRvyEHHW4ve_dBU3tpGqXqSkrKOoVJx0OZ2uq5O9qtV84dCpplDr5fBLPmdw-LU8hzIDTcoZUtE-kuzYfiHInids47BnxnxJpSXqYJXYxxgNBmPywH9vUNw9bNIRXw8d6Fkvtye9KY_u2rSM5qyy0NqqOdcv6aiyuU5el5" alt="Analytics" style={{ width: '100%', borderRadius: '18px', boxShadow: '0 24px 80px rgba(0,0,0,0.8)', position: 'relative' }} />
            </div>
          </Reveal>
        </div>
      </section>

      <Divider fromColor="#f59e0b" toColor="#8b5cf6" />

      {/* ═══════════════════════════════════
          PAGE 5 — PROCESS
      ══════════════════════════════════ */}
      <section ref={el => sectionRefs.current.process = el} id="process" style={{ minHeight: '100vh', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '5rem 5vw', position: 'relative', textAlign: 'center' }}>
        <SectionBg id="process" />
        <div style={{ position: 'relative', zIndex: 1, width: '100%' }}>
          <Reveal style={{ marginBottom: '5rem' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#8b5cf6', marginBottom: '1rem' }}>Simple Process</div>
            <h2 style={{ fontSize: 'clamp(2rem, 4.5vw, 4rem)', fontWeight: 900, letterSpacing: '-0.03em', marginBottom: '1.2rem' }}>Three steps to<br />AI marketing supremacy</h2>
            <p style={{ color: '#64748b', fontSize: '1.05rem', lineHeight: 1.7 }}>Go from raw idea to fully optimized campaign in minutes, not weeks.</p>
          </Reveal>
          <div className="two-col" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '3rem', position: 'relative' }}>
            <div style={{ position: 'absolute', top: '55px', left: '20%', right: '20%', height: '1px', background: 'linear-gradient(90deg,transparent,rgba(139,92,246,0.5),rgba(168,85,247,0.5),transparent)', animation: 'glow 3s ease-in-out infinite' }} />
            {[
              { icon: 'add_circle', label: 'Generate', desc: 'Input your goals, target audience, and tone. Watch AI instantly craft bespoke content and marketing strategy tailored to you.', color: '#f97316', bg: 'rgba(249,115,22,0.08)', border: 'rgba(249,115,22,0.28)' },
              { icon: 'insights', label: 'Analyze', desc: 'AI evaluates every signal in your data — sentiment, engagement, conversion — to surface hidden optimization opportunities.', color: '#8b5cf6', bg: 'rgba(139,92,246,0.08)', border: 'rgba(139,92,246,0.28)' },
              { icon: 'rocket_launch', label: 'Optimize', desc: 'Deploy the top-performing content assets and let the platform auto-scale your results across every channel automatically.', color: '#3b82f6', bg: 'rgba(59,130,246,0.08)', border: 'rgba(59,130,246,0.28)' },
            ].map((step, i) => (
              <Reveal key={step.label} delay={i * 150}>
                <div style={{ padding: '2rem' }}>
                  <div style={{ width: '88px', height: '88px', borderRadius: '24px', background: step.bg, border: `1px solid ${step.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                    <span className="material-symbols-outlined" style={{ color: step.color, fontSize: '40px' }}>{step.icon}</span>
                  </div>
                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: step.bg, border: `1px solid ${step.border}`, color: step.color, fontSize: '0.85rem', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>{i + 1}</div>
                  <h4 style={{ fontSize: '1.6rem', fontWeight: 900, marginBottom: '1rem', letterSpacing: '-0.02em' }}>{step.label}</h4>
                  <p style={{ color: '#64748b', lineHeight: 1.8, fontSize: '0.95rem' }}>{step.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <Divider fromColor="#8b5cf6" toColor="#22c55e" />

      {/* ═══════════════════════════════════
          PAGE 6 — TESTIMONIALS
      ══════════════════════════════════ */}
      <section ref={el => sectionRefs.current.testimonials = el} id="testimonials" style={{ minHeight: '100vh', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '5rem 5vw', position: 'relative' }}>
        <SectionBg id="testimonials" />
        <div style={{ position: 'relative', zIndex: 1, width: '100%' }}>
          <Reveal style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#22c55e', marginBottom: '1rem' }}>Customer Stories</div>
            <h2 style={{ fontSize: 'clamp(2rem, 4.5vw, 4rem)', fontWeight: 900, letterSpacing: '-0.03em', marginBottom: '1rem' }}>Loved by marketing<br />teams worldwide</h2>
            <p style={{ color: '#64748b', fontSize: '1.05rem' }}>See what teams are saying after switching to AI Optimizer</p>
          </Reveal>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '1.5rem', marginBottom: '3rem' }}>
            {[
              { name: 'Sarah M.', role: 'Head of Content @ TechCorp', text: 'We went from 3 hours of content creation to 15 minutes. The AI understands our brand voice perfectly and never misses.', rating: 5, color: '#f97316' },
              { name: 'Alex R.', role: 'Growth Lead @ ScaleUp', text: 'The multi-variant predictor alone saved us $40k in wasted ad spend in the first month. Absolutely game-changing technology.', rating: 5, color: '#3b82f6' },
              { name: 'Priya K.', role: 'Marketing Director', text: 'The sentiment analysis caught a PR crisis before it blew up. I cannot imagine running campaigns without this platform.', rating: 5, color: '#22c55e' },
            ].map((t, i) => (
              <Reveal key={t.name} delay={i * 100}>
                <div style={{ background: 'rgba(10,18,10,0.7)', border: '1px solid rgba(34,197,94,0.1)', borderRadius: '20px', padding: '2.5rem', height: '100%' }}>
                  <div style={{ display: 'flex', gap: '0.2rem', marginBottom: '1.5rem' }}>{[...Array(5)].map((_, j) => <span key={j} style={{ color: '#22c55e', fontSize: '1rem' }}>★</span>)}</div>
                  <p style={{ color: '#cbd5e1', lineHeight: 1.85, marginBottom: '2rem', fontSize: '0.95rem' }}>"{t.text}"</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                    <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: t.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: '#fff', fontSize: '1.1rem' }}>{t.name[0]}</div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.92rem', color: '#f1f5f9' }}>{t.name}</div>
                      <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{t.role}</div>
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
          <Reveal delay={300}>
            <div style={{ background: 'rgba(34,197,94,0.04)', border: '1px solid rgba(34,197,94,0.1)', borderRadius: '20px', padding: '2rem 3rem', display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', gap: '2rem' }}>
              {['TechCorp','ScaleUp','GrowthHQ','MarketMind','BrandBoost','ContentPro'].map(brand => (
                <div key={brand} style={{ color: '#334155', fontWeight: 800, fontSize: '1rem', letterSpacing: '-0.01em' }}>{brand}</div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      <Divider fromColor="#22c55e" toColor="#f97316" />

      {/* ═══════════════════════════════════
          PAGE 7 — CTA + FOOTER
      ══════════════════════════════════ */}
      <section ref={el => sectionRefs.current.cta = el} id="cta" style={{ minHeight: '100vh', width: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', position: 'relative' }}>
        <SectionBg id="cta" />
        <div style={{ position: 'relative', zIndex: 1, padding: '5rem 5vw' }}>
          <Reveal dir="scale" style={{ marginBottom: '5rem' }}>
            <div style={{ position: 'relative', borderRadius: '32px', border: '1px solid rgba(249,115,22,0.22)', padding: 'clamp(4rem,8vw,8rem)', textAlign: 'center', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg,rgba(249,115,22,0.1),rgba(168,85,247,0.08))', borderRadius: '32px', pointerEvents: 'none' }} />
              <div style={{ position: 'relative' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#f97316', marginBottom: '1.5rem' }}>No Credit Card Required</div>
                <h2 style={{ fontSize: 'clamp(2.2rem, 5vw, 5rem)', fontWeight: 900, letterSpacing: '-0.04em', marginBottom: '1.5rem', lineHeight: 1.04 }}>Start Optimizing Your<br />Marketing Today</h2>
                <p style={{ color: '#64748b', fontSize: '1.1rem', marginBottom: '3rem', lineHeight: 1.7, maxWidth: '500px', margin: '0 auto 3rem' }}>Join 2,000+ teams scaling their content operations with high-precision AI. Free tier always available.</p>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '1.2rem', flexWrap: 'wrap' }}>
                  <button className="btn-p" style={{ fontSize: '1.15rem', padding: '1.2rem 3rem' }} onClick={() => onNavigate('generate')}>Create Free Account</button>
                  <button className="btn-g" style={{ fontSize: '1.15rem', padding: '1.2rem 2.5rem' }}>Schedule a Demo</button>
                </div>
              </div>
            </div>
          </Reveal>

          {/* Footer */}
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '4rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '3rem', flexWrap: 'wrap', marginBottom: '3rem' }}>
              <div style={{ flex: '0 0 280px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.2rem' }}>
                  <div style={{ width: '32px', height: '32px', background: 'linear-gradient(135deg,#f97316,#ec4899)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span className="material-symbols-outlined" style={{ color: 'white', fontSize: '18px' }}>auto_awesome</span>
                  </div>
                  <span style={{ fontSize: '1.1rem', fontWeight: 800 }}>AI Optimizer</span>
                </div>
                <p style={{ color: '#475569', fontSize: '0.88rem', lineHeight: 1.8 }}>The ultimate AI platform for modern marketing teams looking to scale fast with precision.</p>
              </div>
              {[
                { title: 'Product', links: ['Features','Integrations','Enterprise','Pricing','Changelog'] },
                { title: 'Resources', links: ['Documentation','API Reference','Blog','Community','Support'] },
                { title: 'Company', links: ['About Us','Careers','Press','Privacy','Terms'] },
              ].map(col => (
                <div key={col.title}>
                  <h5 style={{ fontWeight: 700, marginBottom: '1.2rem', color: '#e2e8f0', fontSize: '0.92rem' }}>{col.title}</h5>
                  <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {col.links.map(link => <li key={link}><a href="#" style={{ color: '#475569', textDecoration: 'none', fontSize: '0.87rem', transition: 'color 0.2s' }} onMouseOver={e => e.target.style.color='#f97316'} onMouseOut={e => e.target.style.color='#475569'}>{link}</a></li>)}
                  </ul>
                </div>
              ))}
            </div>
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
              <p style={{ color: '#334155', fontSize: '0.82rem' }}>© 2024 AI Marketing Optimizer Inc. All rights reserved.</p>
              <div style={{ display: 'flex', gap: '2rem' }}>
                {['Cookie Policy','Security','Accessibility'].map(l => <a key={l} href="#" style={{ color: '#334155', fontSize: '0.82rem', textDecoration: 'none' }}>{l}</a>)}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
