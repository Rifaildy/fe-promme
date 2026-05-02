// --- src/pages/auth/RegisterPage.jsx ---
import React, { useState, useEffect } from 'react';
import { Mail, Lock, User, Briefcase, Phone, ArrowRight, Sparkles, Sun, Moon } from 'lucide-react';
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
        onClick={() => onNavigate?.('login')} 
        style={{ padding: '8px 20px', fontSize: 14 }}
      >
        Masuk
      </button>
    </div>
  </div>
);

// ── Injected Styles dengan Dukungan Dark/Light Mode ───────────────────────────
const RegisterStyles = () => (
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

    .register-container {
      min-height: 100vh;
      background: var(--bg);
      color: var(--text);
      font-family: 'DM Sans', sans-serif;
      display: flex;
      flex-direction: column;
      position: relative;
      overflow-x: hidden;
      transition: background-color 0.3s ease, color 0.3s ease;
    }

    /* ── Latar Belakang Orbs ── */
    .register-orb {
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
      bottom: 0px; right: -50px;
      animation-delay: -5s;
    }
    [data-theme='light'] .register-orb { opacity: 0.6; }

    @keyframes float {
      0% { transform: translate(0, 0); }
      100% { transform: translate(30px, 40px); }
    }

    /* ── Glass Card ── */
    .register-card {
      background: var(--glass-bg);
      border: 1px solid var(--border);
      backdrop-filter: blur(24px);
      -webkit-backdrop-filter: blur(24px);
      border-radius: 32px;
      padding: 48px;
      width: 100%;
      max-width: 540px; 
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
    .register-input {
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
    .register-input::placeholder {
      color: var(--muted);
      opacity: 0.7;
    }
    .register-input:focus {
      outline: none;
      border-color: var(--green);
      background: var(--surface);
      box-shadow: 0 0 0 4px var(--green-glow);
    }
    .register-input:focus + .input-icon {
      color: var(--green);
    }

    /* ── Button Styling ── */
    .register-btn {
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
      margin-top: 24px;
      transition: transform 0.2s, box-shadow 0.2s;
      box-shadow: 0 0 0 0 var(--green-glow);
    }
    .register-btn:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 8px 30px var(--green-glow);
    }
    .register-btn:disabled {
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

    /* ── Role Tabs ── */
    .role-tabs {
      display: flex;
      background: var(--card-inner);
      padding: 6px;
      border-radius: 16px;
      margin-bottom: 32px;
      border: 1px solid var(--border);
    }
    .role-tab {
      flex: 1;
      padding: 12px;
      font-family: 'Sora', sans-serif;
      font-weight: 700;
      font-size: 14px;
      color: var(--muted);
      background: transparent;
      border: none;
      border-radius: 12px;
      cursor: pointer;
      transition: all 0.3s;
    }
    .role-tab.active {
      background: var(--surface);
      color: var(--green);
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
      border: 1px solid var(--border);
    }
  `}</style>
);

const RegisterPage = ({ onNavigate }) => {
  const [regType, setRegType] = useState('brand'); // 'brand' | 'creator'
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Menggunakan Custom Hook useTheme
  const { theme, toggleTheme } = useTheme();

  // State Form
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    nama_perusahaan: '',
    pic_name: '',
    phone_number: '',
    nama_lengkap: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const endpoint = regType === 'brand' ? '/auth/register/brand' : '/auth/register/creator';
      
      const payload = regType === 'brand' 
        ? { 
            email: formData.email, 
            password: formData.password, 
            nama_perusahaan: formData.nama_perusahaan, 
            pic_name: formData.pic_name, 
            phone_number: formData.phone_number 
          }
        : { 
            email: formData.email, 
            password: formData.password, 
            nama_lengkap: formData.nama_lengkap 
          };

      await fetchApi(endpoint, {
        method: 'POST',
        body: JSON.stringify(payload)
      });

      setSuccessMsg('Registrasi berhasil! Mengalihkan ke halaman login...');
      
      setTimeout(() => {
        onNavigate('login');
      }, 2000);

    } catch (error) {
      setErrorMsg(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <RegisterStyles />
      <div className="register-container">
        
        <div style={{ position: 'relative', zIndex: 20 }}>
          <Topbar onNavigate={onNavigate} theme={theme} toggleTheme={toggleTheme} />
        </div>

        <div className="register-orb orb-a" />
        <div className="register-orb orb-b" />

        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
          <div className="register-card">
            
            <div style={{ textAlign: 'center', marginBottom: 32 }}>
              <div style={{ 
                width: 56, height: 56, borderRadius: 16, 
                background: 'rgba(29,191,115,0.15)', 
                display: 'flex', alignItems: 'center', justifyContent: 'center', 
                margin: '0 auto 20px', color: 'var(--green)'
              }}>
                <Sparkles size={28} />
              </div>
              <h2 style={{ fontFamily: "'Sora', sans-serif", fontSize: 32, fontWeight: 800, marginBottom: 8, letterSpacing: '-0.02em', color: 'var(--text)' }}>
                Daftar ke Promme
              </h2>
              <p style={{ color: 'var(--muted)', fontSize: 15 }}>
                Bergabunglah dengan ekosistem influencer marketing terbaik.
              </p>
            </div>
            
            {/* Tabs Role */}
            <div className="role-tabs">
              <button
                type="button"
                onClick={() => { setRegType('brand'); setErrorMsg(''); }}
                className={`role-tab ${regType === 'brand' ? 'active' : ''}`}
              >
                Saya Brand
              </button>
              <button
                type="button"
                onClick={() => { setRegType('creator'); setErrorMsg(''); }}
                className={`role-tab ${regType === 'creator' ? 'active' : ''}`}
              >
                Saya Creator
              </button>
            </div>

            {errorMsg && (
              <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#ef4444', padding: '12px 16px', borderRadius: 12, fontSize: 14, marginBottom: 24, display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 18 }}>⚠️</span> {errorMsg}
              </div>
            )}
            
            {successMsg && (
              <div style={{ background: 'rgba(29, 191, 115, 0.1)', border: '1px solid rgba(29, 191, 115, 0.3)', color: 'var(--green)', padding: '12px 16px', borderRadius: 12, fontSize: 14, marginBottom: 24, display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 18 }}>✅</span> {successMsg}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="input-group">
                <input 
                  type="email" name="email" 
                  className="register-input" placeholder="Alamat Email" 
                  value={formData.email} onChange={handleChange} required 
                />
                <Mail size={20} className="input-icon" />
              </div>

              <div className="input-group">
                <input 
                  type="password" name="password" 
                  className="register-input" placeholder="Kata Sandi (Minimal 8 karakter)" 
                  value={formData.password} onChange={handleChange} required 
                />
                <Lock size={20} className="input-icon" />
              </div>
              
              {regType === 'brand' ? (
                <>
                  <div className="input-group">
                    <input 
                      type="text" name="nama_perusahaan" 
                      className="register-input" placeholder="Nama Perusahaan (PT/CV)" 
                      value={formData.nama_perusahaan} onChange={handleChange} required 
                    />
                    <Briefcase size={20} className="input-icon" />
                  </div>
                  
                  <div className="input-group">
                    <input 
                      type="text" name="pic_name" 
                      className="register-input" placeholder="Nama Penanggung Jawab (PIC)" 
                      value={formData.pic_name} onChange={handleChange} required 
                    />
                    <User size={20} className="input-icon" />
                  </div>
                  
                  <div className="input-group">
                    <input 
                      type="tel" name="phone_number" 
                      className="register-input" placeholder="Nomor Telepon/WhatsApp" 
                      value={formData.phone_number} onChange={handleChange} required 
                    />
                    <Phone size={20} className="input-icon" />
                  </div>
                </>
              ) : (
                <div className="input-group">
                  <input 
                    type="text" name="nama_lengkap" 
                    className="register-input" placeholder="Nama Lengkap (Sesuai KTP)" 
                    value={formData.nama_lengkap} onChange={handleChange} required 
                  />
                  <User size={20} className="input-icon" />
                </div>
              )}

              <button type="submit" className="register-btn" disabled={loading}>
                {loading ? 'Memproses Pendaftaran...' : 'Buat Akun Sekarang'} 
                {!loading && <ArrowRight size={18} />}
              </button>
            </form>
            
            <div style={{ marginTop: 32, textAlign: 'center', fontSize: 14, color: 'var(--muted)' }}>
              Sudah punya akun?{' '}
              <span 
                onClick={() => onNavigate('login')} 
                style={{ color: 'var(--green)', fontWeight: 700, cursor: 'pointer', fontFamily: "'Sora', sans-serif" }}
              >
                Masuk
              </span>
            </div>

          </div>
        </div>
      </div>
    </>
  );
};

export default RegisterPage;