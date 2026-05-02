// --- src/pages/auth/LoginPage.jsx ---
import React, { useState, useEffect } from 'react';
import { Mail, Lock, ArrowRight, Sparkles, Sun, Moon } from 'lucide-react';
import { fetchApi } from '../../utils/api';

// ── Hook Kustom untuk Tema dengan Local Storage ─────────────────────────────
function useTheme() {
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem('promme_theme');
    if (savedTheme) return savedTheme;
    const docTheme = document.documentElement.getAttribute('data-theme');
    if (docTheme) return docTheme;
    return 'dark';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('promme_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'dark' ? 'light' : 'dark');
  };

  return { theme, toggleTheme };
}
// ──────────────────────────────────────────────────────────────────────────────

// ── Mock Topbar dengan Theme Toggle Khusus Halaman Auth ──────────────────────
const Topbar = ({ onNavigate, theme, toggleTheme }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '16px 32px', alignItems: 'center', maxWidth: 1280, margin: '0 auto', width: '100%' }}>
    <div 
      style={{ fontFamily: "'Sora', sans-serif", fontWeight: 900, fontSize: 22, color: 'var(--text)', cursor: 'pointer' }}
      onClick={() => onNavigate?.('landing')}
    >
      Promme<span style={{ color: 'var(--green)' }}>.</span>
    </div>
    <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
      <button 
        onClick={toggleTheme} 
        style={{ 
          background: 'var(--surface)', 
          border: '1px solid var(--border)', 
          color: 'var(--text)',
          width: 36, 
          height: 36, 
          borderRadius: '50%', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          cursor: 'pointer',
          transition: 'all 0.3s'
        }}
        aria-label="Toggle Theme"
      >
        {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
      </button>
      <button 
        className="btn-outline" 
        onClick={() => onNavigate?.('register')} 
        style={{ padding: '8px 20px', fontSize: 14 }}
      >
        Daftar
      </button>
    </div>
  </div>
);

// ── Injected Styles dengan Dukungan Dark/Light Mode ───────────────────────────
const LoginStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;600;700;800;900&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,300&display=swap');

    :root {
      --green:     #1dbf73;
      --green-glow:rgba(29,191,115,0.25);
    }

    [data-theme='dark'] {
      --bg:             #0a0a0f;
      --surface:        #111118;
      --border:         rgba(255,255,255,0.07);
      --text:           #f0f0f4;
      --muted:          #8b8b9a;
      --glass-bg:       rgba(255,255,255,0.035);
      --card-inner:     rgba(255,255,255,0.04);
      --mockup-shadow:  rgba(0,0,0,0.4);
    }

    [data-theme='light'] {
      --bg:             #f8fafc;
      --surface:        #ffffff;
      --border:         rgba(0,0,0,0.08);
      --text:           #0f172a;
      --muted:          #64748b;
      --glass-bg:       rgba(255,255,255,0.7);
      --card-inner:     rgba(0,0,0,0.03);
      --mockup-shadow:  rgba(0,0,0,0.08);
    }

    .login-container {
      min-height: 100vh;
      background: var(--bg);
      color: var(--text);
      font-family: 'DM Sans', sans-serif;
      display: flex;
      flex-direction: column;
      position: relative;
      overflow: hidden;
      transition: background-color 0.3s ease, color 0.3s ease;
    }

    /* ── Latar Belakang Orbs ── */
    .login-orb {
      position: absolute;
      border-radius: 50%;
      filter: blur(80px);
      pointer-events: none;
      animation: float 10s ease-in-out infinite alternate;
      z-index: 0;
      transition: opacity 0.3s;
    }
    .orb-a {
      width: 400px; height: 400px;
      background: radial-gradient(circle, rgba(29,191,115,0.15) 0%, transparent 70%);
      top: -50px; left: -100px;
    }
    .orb-b {
      width: 500px; height: 500px;
      background: radial-gradient(circle, rgba(100,100,255,0.05) 0%, transparent 70%);
      bottom: -100px; right: -50px;
      animation-delay: -5s;
    }
    [data-theme='light'] .login-orb { opacity: 0.6; }

    @keyframes float {
      0% { transform: translate(0, 0); }
      100% { transform: translate(30px, 40px); }
    }

    /* ── Glass Card ── */
    .login-card {
      background: var(--glass-bg);
      border: 1px solid var(--border);
      backdrop-filter: blur(24px);
      -webkit-backdrop-filter: blur(24px);
      border-radius: 32px;
      padding: 48px;
      width: 100%;
      max-width: 460px;
      position: relative;
      z-index: 10;
      box-shadow: 0 24px 64px var(--mockup-shadow);
      transition: background-color 0.3s, border-color 0.3s, box-shadow 0.3s;
    }

    /* ── Input Styling ── */
    .input-group {
      position: relative;
      margin-bottom: 20px;
    }
    .input-icon {
      position: absolute;
      left: 18px;
      top: 50%;
      transform: translateY(-50%);
      color: var(--muted);
      transition: color 0.3s;
      pointer-events: none;
    }
    .login-input {
      width: 100%;
      background: var(--card-inner);
      border: 1px solid var(--border);
      color: var(--text);
      padding: 16px 20px 16px 52px;
      border-radius: 16px;
      font-family: 'DM Sans', sans-serif;
      font-size: 15px;
      transition: all 0.3s;
    }
    .login-input::placeholder {
      color: var(--muted);
      opacity: 0.7;
    }
    .login-input:focus {
      outline: none;
      border-color: var(--green);
      background: var(--surface);
      box-shadow: 0 0 0 4px var(--green-glow);
    }
    .login-input:focus + .input-icon {
      color: var(--green);
    }

    /* ── Button Styling ── */
    .login-btn {
      width: 100%;
      background: var(--green);
      color: #000;
      font-family: 'Sora', sans-serif;
      font-weight: 700;
      font-size: 16px;
      padding: 16px;
      border-radius: 16px;
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      margin-top: 12px;
      transition: transform 0.2s, box-shadow 0.2s;
      box-shadow: 0 0 0 0 var(--green-glow);
    }
    .login-btn:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 8px 30px var(--green-glow);
    }
    .login-btn:disabled {
      opacity: 0.7;
      cursor: not-allowed;
      transform: none;
    }

    .btn-outline {
      background: transparent; color: var(--text); font-family: 'Sora', sans-serif;
      font-weight: 600; font-size: 15px; padding: 13px 28px;
      border-radius: 100px; border: 1px solid var(--border); cursor: pointer;
      transition: all 0.2s; backdrop-filter: blur(8px);
    }
    .btn-outline:hover { border-color: var(--green); color: var(--green); }
  `}</style>
);

const LoginPage = ({ onNavigate, onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  // Menggunakan Custom Hook useTheme
  const { theme, toggleTheme } = useTheme();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      const response = await fetchApi('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      });

      localStorage.setItem('access_token', response.data.access_token);
      localStorage.setItem('user_role', response.data.role);

      onLogin({
        email: email,
        role: response.data.role.toLowerCase(), 
        name: email.split('@')[0] 
      });

    } catch (error) {
      setErrorMsg(error.message || 'Terjadi kesalahan saat memproses login.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <LoginStyles />
      <div className="login-container">
        
        <div style={{ position: 'relative', zIndex: 20 }}>
          <Topbar onNavigate={onNavigate} theme={theme} toggleTheme={toggleTheme} />
        </div>

        <div className="login-orb orb-a" />
        <div className="login-orb orb-b" />

        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
          <div className="login-card">
            
            <div style={{ textAlign: 'center', marginBottom: 40 }}>
              <div style={{ 
                width: 56, height: 56, borderRadius: 16, 
                background: 'rgba(29,191,115,0.15)', 
                display: 'flex', alignItems: 'center', justifyContent: 'center', 
                margin: '0 auto 20px', color: 'var(--green)'
              }}>
                <Sparkles size={28} />
              </div>
              <h2 style={{ fontFamily: "'Sora', sans-serif", fontSize: 32, fontWeight: 800, marginBottom: 8, letterSpacing: '-0.02em', color: 'var(--text)' }}>
                Selamat Datang
              </h2>
              <p style={{ color: 'var(--muted)', fontSize: 15 }}>
                Masuk ke ekosistem kolaborasi <strong style={{ color: 'var(--text)', fontWeight: 600 }}>Promme.</strong>
              </p>
            </div>

            {errorMsg && (
              <div style={{ 
                background: 'rgba(239, 68, 68, 0.1)', 
                border: '1px solid rgba(239, 68, 68, 0.3)', 
                color: '#ef4444', 
                padding: '12px 16px', 
                borderRadius: 12, 
                fontSize: 14, 
                marginBottom: 24,
                display: 'flex', alignItems: 'center', gap: 8
              }}>
                <span style={{ fontSize: 18 }}>⚠️</span> {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="input-group">
                <input 
                  type="email" 
                  className="login-input" 
                  placeholder="Alamat Email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required 
                />
                <Mail size={20} className="input-icon" />
              </div>

              <div className="input-group">
                <input 
                  type="password" 
                  className="login-input" 
                  placeholder="Kata Sandi" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required 
                />
                <Lock size={20} className="input-icon" />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 24 }}>
                <span style={{ fontSize: 13, color: 'var(--green)', fontWeight: 600, cursor: 'pointer', fontFamily: "'Sora', sans-serif" }}>
                  Lupa Password?
                </span>
              </div>

              <button type="submit" className="login-btn" disabled={loading}>
                {loading ? 'Memproses Akses...' : 'Masuk Sekarang'} 
                {!loading && <ArrowRight size={18} />}
              </button>
            </form>

            <div style={{ marginTop: 32, textAlign: 'center', fontSize: 14, color: 'var(--muted)' }}>
              Belum punya akun?{' '}
              <span 
                onClick={() => onNavigate('register')} 
                style={{ color: 'var(--green)', fontWeight: 700, cursor: 'pointer', fontFamily: "'Sora', sans-serif" }}
              >
                Daftar Gratis
              </span>
            </div>

          </div>
        </div>
      </div>
    </>
  );
};

export default LoginPage;