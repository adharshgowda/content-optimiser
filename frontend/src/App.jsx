import { useState } from 'react';
import GeneratorCard from './components/GeneratorCard';
import SentimentDashboard from './components/SentimentDashboard';
import ABTestingPanel from './components/ABTestingPanel';
import WinnerInsightsPage from './components/WinnerInsightsPage';
import MarketingReadyPage from './components/MarketingReadyPage';
import LoginScreen from './components/LoginScreen';
import { LogOut, Sparkles } from 'lucide-react';
import './index.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState('');
  const [activeTab, setActiveTab] = useState('generate');
  const [generatedItems, setGeneratedItems] = useState([]);
  const [analysisData, setAnalysisData] = useState(null);
  const [generatorState, setGeneratorState] = useState({
    topic: '',
    platform: '',
    keywords: '',
    audience: '',
    tone: '',
    wordCount: 50,
    numVariants: 2,
    variants: [],
  });

  if (!isAuthenticated) {
    return <LoginScreen onLogin={({ user }) => { setCurrentUser(user || 'User'); setIsAuthenticated(true); }} />;
  }

  return (
    <div style={{display: 'flex', minHeight: '100vh', width: '100vw', backgroundColor: 'var(--bg-color)', overflow: 'hidden'}}>
      <>
        {/* Persistent Left Sidebar for Dashboard Views */}
        <aside className="sidebar fade-in" style={{
          width: '300px', 
          flexShrink: 0, 
          borderRight: '1px solid var(--panel-border)', 
          background: 'rgba(13, 17, 23, 0.5)',
          display: 'flex', 
          flexDirection: 'column', 
          padding: '1.8rem 1.2rem',
          position: 'sticky',
          top: 0,
          height: '100vh',
          overflowY: 'auto'
        }}>
          
          {/* Logo */}
          <div style={{display: 'flex', alignItems: 'center', gap: '0.8rem', padding: '0 0.5rem', marginBottom: '3rem'}}>
            <div style={{background: 'rgba(75, 159, 255, 0.1)', color: 'var(--primary)', padding: '0.5rem', borderRadius: '10px', display: 'flex'}}>
              <Sparkles size={22} />
            </div>
            <h2 style={{fontSize: '1.35rem', fontWeight: 700, margin: 0, background: 'linear-gradient(135deg, var(--primary), var(--secondary))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'}}>
              AI Optimizer
            </h2>
          </div>
    
          {/* Navigation Links */}
          <div style={{flex: 1, display: 'flex', flexDirection: 'column', gap: '0.3rem'}}>
            <button className={`sidebar-btn ${activeTab === 'generate' ? 'active' : ''}`} onClick={() => setActiveTab('generate')}>✍️ Content Generator</button>
            <button className={`sidebar-btn ${activeTab === 'sentiment' ? 'active' : ''}`} onClick={() => setActiveTab('sentiment')}>💬 Sentiment Engine</button>
            <button className={`sidebar-btn ${activeTab === 'abtest' ? 'active' : ''}`} onClick={() => setActiveTab('abtest')}>🆚 Multi-Variant Predictor</button>
            <button className={`sidebar-btn ${activeTab === 'winner-insights' ? 'active' : ''}`} onClick={() => setActiveTab('winner-insights')}>📊 Winner Insights</button>
            <button className={`sidebar-btn ${activeTab === 'ready' ? 'active' : ''}`} onClick={() => setActiveTab('ready')}>✅ Ready to Post</button>
          </div>
    
          {/* User Profile / Logout (Bottom of Sidebar) */}
          <div style={{marginTop: 'auto', paddingTop: '1.5rem', borderTop: '1px solid var(--panel-border)', display: 'flex', flexDirection: 'column', gap: '0.8rem'}}>
                 <div style={{display: 'flex', alignItems: 'center', gap: '0.8rem', padding: '0 0.5rem'}}>
                 <div style={{width: '36px', height: '36px', borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: '#fff', fontSize: '1rem'}}>{(currentUser || 'U').charAt(0).toUpperCase()}</div>
                 <div style={{minWidth: 0}}>
                   <div style={{fontSize: '1rem', fontWeight: 600, color: 'var(--text-main)', overflow: 'hidden', textOverflow: 'ellipsis'}}>{currentUser || 'User'}</div>
                 </div>
              </div>
             <button onClick={() => { setIsAuthenticated(false); setCurrentUser(''); }} className="logout-btn" style={{padding: '0.5rem', justifyContent: 'center', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', width: '100%', marginTop: '0.5rem'}}>
               <LogOut size={16} /> Sign Out
             </button>
          </div>
        </aside>
  
        {/* Main Content Area */}
        <main style={{flex: 1, minWidth: 0, padding: '2.5rem 3rem', display: 'flex', flexDirection: 'column', width: '100%', overflowY: 'auto', height: '100vh', boxSizing: 'border-box'}}>
          <div className="fade-in" style={{animationDelay: '0.2s', width: '100%'}}>
            {activeTab === 'generate' && (
              <GeneratorCard
                onGenerated={setGeneratedItems}
                persistedState={generatorState}
                onPersistState={setGeneratorState}
              />
            )}
            {activeTab === 'sentiment' && <SentimentDashboard initialVariants={generatedItems} />}
            {activeTab === 'abtest' && (
              <ABTestingPanel
                generatedVariants={generatedItems}
                onAnalysisComplete={(data) => setAnalysisData(data)}
              />
            )}
            {activeTab === 'winner-insights' && (
              <WinnerInsightsPage
                analysisData={analysisData}
                onNext={() => setActiveTab('ready')}
              />
            )}
            {activeTab === 'ready' && <MarketingReadyPage analysisData={analysisData} />}
            </div>
        </main>
      </>

    </div>
  );
}

export default App;
