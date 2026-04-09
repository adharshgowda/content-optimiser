import { useState } from 'react';
import { ArrowRight } from 'lucide-react';

export default function LoginScreen({ onLogin }) {
  const initialUser = (() => {
    try {
      return localStorage.getItem('auth_user');
    } catch {
      return null;
    }
  })();
  const initialPassword = (() => {
    try {
      return localStorage.getItem('auth_password');
    } catch {
      return null;
    }
  })();
  const [storedUser, setStoredUser] = useState(initialUser || '');
  const [storedPassword, setStoredPassword] = useState(initialPassword || '');
  const [hasAccount, setHasAccount] = useState(Boolean(initialUser && initialPassword));
  const [mode, setMode] = useState(Boolean(initialUser && initialPassword) ? 'login' : 'register');

  const [user, setUser] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetUser, setResetUser] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  const clearMessages = () => {
    setError('');
    setInfo('');
  };

  const saveCredentials = (nextUser, nextPassword) => {
    try {
      localStorage.setItem('auth_user', nextUser);
      localStorage.setItem('auth_password', nextPassword);
    } catch {
      // Ignore storage failures for demo mode.
    }
    setStoredUser(nextUser);
    setStoredPassword(nextPassword);
    setHasAccount(true);
  };

  const handleLogin = (e) => {
    e.preventDefault();
    if (!user || !password) return;
    clearMessages();
    setLoading(true);

    setTimeout(() => {
      if (!hasAccount || mode !== 'login') {
        setLoading(false);
        setError('Please register first.');
        return;
      }

      if (user === storedUser && password === storedPassword) {
        setLoading(false);
        onLogin({ user: storedUser || user });
      } else {
        setLoading(false);
        setError('Invalid user or password. Please login with your sign-up details.');
      }
    }, 1200);
  };

  const handleRegister = (e) => {
    e.preventDefault();
    if (!user || !password || !confirmPassword) return;
    clearMessages();
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      saveCredentials(user, password);
      setLoading(false);
      setPassword('');
      setConfirmPassword('');
      setMode('login');
      setInfo('Registration successful. Please login with your credentials.');
    }, 1000);
  };

  const handleForgotPassword = (e) => {
    e.preventDefault();
    clearMessages();
    if (!hasAccount) {
      setError('No account found. Please register first.');
      return;
    }
    if (!resetUser || !newPassword || !confirmNewPassword) return;
    if (newPassword !== confirmNewPassword) {
      setError('New passwords do not match.');
      return;
    }
    if (resetUser !== storedUser) {
      setError('User not found. Enter your registered user/email.');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      saveCredentials(storedUser, newPassword);
      setLoading(false);
      setNewPassword('');
      setConfirmNewPassword('');
      setResetUser('');
      setMode('login');
      setInfo('Password reset successful. Please login with your new password.');
    }, 1000);
  };

  return (
    <div style={{ minHeight: '100vh', width: '100vw', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(111,66,193,0.15) 0%, rgba(0,0,0,0) 70%)', top: '-10%', left: '-10%', zIndex: 0 }} />
      <div style={{ position: 'absolute', width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(75,159,255,0.15) 0%, rgba(0,0,0,0) 70%)', bottom: '-10%', right: '-10%', zIndex: 0 }} />

      <div className="glass-panel fade-in" style={{ width: '100%', maxWidth: '520px', padding: '3.2rem', position: 'relative', zIndex: 1, border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' }}>
        <h1 style={{ textAlign: 'center', fontSize: '2.7rem', fontWeight: 500, marginBottom: '2rem', textTransform: 'lowercase' }}>
          {mode === 'register' ? 'register' : mode === 'forgot' ? 'forgot password' : 'sign in'}
        </h1>

        {mode === 'login' && (
          <form onSubmit={handleLogin}>
            <input
              type="text"
              required
              placeholder="Username"
              value={user}
              onChange={(e) => setUser(e.target.value)}
              style={{ width: '100%', background: 'rgba(0,0,0,0.25)', border: '2px solid rgba(255,255,255,0.18)', borderRadius: '999px', padding: '1rem 1.2rem', fontSize: '1.35rem', color: 'var(--text-main)', marginBottom: '1.1rem', boxSizing: 'border-box' }}
            />

            <input
              type="password"
              required
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ width: '100%', background: 'rgba(0,0,0,0.25)', border: '2px solid rgba(255,255,255,0.18)', borderRadius: '999px', padding: '1rem 1.2rem', fontSize: '1.35rem', color: 'var(--text-main)', marginBottom: '1rem', boxSizing: 'border-box' }}
            />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.8rem', fontSize: '1rem', color: 'var(--text-muted)' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', cursor: 'pointer' }}>
                <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} style={{ width: '13px', height: '13px' }} />
                Remember me
              </label>
              <span style={{ cursor: 'pointer' }} onClick={() => { clearMessages(); setMode('forgot'); }}>Forgot Password</span>
            </div>

            {info && <div style={{ marginBottom: '0.9rem', color: '#8bd4ff', fontWeight: 600, fontSize: '0.95rem' }}>{info}</div>}
            {error && <div style={{ marginBottom: '0.9rem', color: '#ff7b72', fontWeight: 600, fontSize: '0.95rem' }}>{error}</div>}

            <button className="btn-primary" type="submit" disabled={loading} style={{ width: '100%', padding: '1rem', fontSize: '1.5rem', borderRadius: '999px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
              {loading ? 'LOGGING IN...' : 'LOGIN'}
              {!loading && <ArrowRight size={20} />}
            </button>

            <div style={{ marginTop: '1.4rem', textAlign: 'center', fontSize: '0.98rem', color: 'var(--text-muted)' }}>
              Don&apos;t have an account? <span style={{ color: 'var(--primary)', fontWeight: 600, cursor: 'pointer' }} onClick={() => { clearMessages(); setMode('register'); }}>Register here</span>
            </div>
          </form>
        )}

        {mode === 'register' && (
          <form onSubmit={handleRegister}>
            <input
              type="text"
              required
              placeholder="Username / Email"
              value={user}
              onChange={(e) => setUser(e.target.value)}
              style={{ width: '100%', background: 'rgba(0,0,0,0.25)', border: '2px solid rgba(255,255,255,0.18)', borderRadius: '999px', padding: '1rem 1.2rem', fontSize: '1.15rem', color: 'var(--text-main)', marginBottom: '0.9rem', boxSizing: 'border-box' }}
            />
            <input
              type="password"
              required
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ width: '100%', background: 'rgba(0,0,0,0.25)', border: '2px solid rgba(255,255,255,0.18)', borderRadius: '999px', padding: '1rem 1.2rem', fontSize: '1.15rem', color: 'var(--text-main)', marginBottom: '0.9rem', boxSizing: 'border-box' }}
            />
            <input
              type="password"
              required
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              style={{ width: '100%', background: 'rgba(0,0,0,0.25)', border: '2px solid rgba(255,255,255,0.18)', borderRadius: '999px', padding: '1rem 1.2rem', fontSize: '1.15rem', color: 'var(--text-main)', marginBottom: '1rem', boxSizing: 'border-box' }}
            />

            {info && <div style={{ marginBottom: '0.9rem', color: '#8bd4ff', fontWeight: 600, fontSize: '0.95rem' }}>{info}</div>}
            {error && <div style={{ marginBottom: '0.9rem', color: '#ff7b72', fontWeight: 600, fontSize: '0.95rem' }}>{error}</div>}

            <button className="btn-primary" type="submit" disabled={loading} style={{ width: '100%', padding: '1rem', fontSize: '1.35rem', borderRadius: '999px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
              {loading ? 'REGISTERING...' : 'REGISTER'}
              {!loading && <ArrowRight size={20} />}
            </button>

            <div style={{ marginTop: '1.4rem', textAlign: 'center', fontSize: '0.98rem', color: 'var(--text-muted)' }}>
              Already have an account? <span style={{ color: 'var(--primary)', fontWeight: 600, cursor: 'pointer' }} onClick={() => { clearMessages(); setMode('login'); }}>Login</span>
            </div>
          </form>
        )}

        {mode === 'forgot' && (
          <form onSubmit={handleForgotPassword}>
            <input
              type="text"
              required
              placeholder="Enter registered Username / Email"
              value={resetUser}
              onChange={(e) => setResetUser(e.target.value)}
              style={{ width: '100%', background: 'rgba(0,0,0,0.25)', border: '2px solid rgba(255,255,255,0.18)', borderRadius: '999px', padding: '1rem 1.2rem', fontSize: '1.1rem', color: 'var(--text-main)', marginBottom: '0.9rem', boxSizing: 'border-box' }}
            />
            <input
              type="password"
              required
              placeholder="New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              style={{ width: '100%', background: 'rgba(0,0,0,0.25)', border: '2px solid rgba(255,255,255,0.18)', borderRadius: '999px', padding: '1rem 1.2rem', fontSize: '1.1rem', color: 'var(--text-main)', marginBottom: '0.9rem', boxSizing: 'border-box' }}
            />
            <input
              type="password"
              required
              placeholder="Confirm New Password"
              value={confirmNewPassword}
              onChange={(e) => setConfirmNewPassword(e.target.value)}
              style={{ width: '100%', background: 'rgba(0,0,0,0.25)', border: '2px solid rgba(255,255,255,0.18)', borderRadius: '999px', padding: '1rem 1.2rem', fontSize: '1.1rem', color: 'var(--text-main)', marginBottom: '1rem', boxSizing: 'border-box' }}
            />

            {info && <div style={{ marginBottom: '0.9rem', color: '#8bd4ff', fontWeight: 600, fontSize: '0.95rem' }}>{info}</div>}
            {error && <div style={{ marginBottom: '0.9rem', color: '#ff7b72', fontWeight: 600, fontSize: '0.95rem' }}>{error}</div>}

            <button className="btn-primary" type="submit" disabled={loading} style={{ width: '100%', padding: '1rem', fontSize: '1.2rem', borderRadius: '999px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
              {loading ? 'RESETTING...' : 'RESET PASSWORD'}
              {!loading && <ArrowRight size={20} />}
            </button>

            <div style={{ marginTop: '1.4rem', textAlign: 'center', fontSize: '0.98rem', color: 'var(--text-muted)' }}>
              Back to <span style={{ color: 'var(--primary)', fontWeight: 600, cursor: 'pointer' }} onClick={() => { clearMessages(); setMode('login'); }}>Login</span>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
