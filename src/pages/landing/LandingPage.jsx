import React, { useEffect, useRef, useState } from 'react';
import {
  Users, Briefcase, TrendingUp, Shield, Zap, Star,
  ChevronRight, Play, BarChart2, CheckCircle, ArrowRight,
  Music2, Award, Target, Clock, DollarSign
} from 'lucide-react';

// Jika Anda menggunakan file terpisah, silakan aktifkan kembali import di bawah ini:
// import Topbar from '../../components/layout/Topbar';
// import Button from '../../components/ui/Button';

// ── Mock Topbar (Hapus bagian ini jika Anda menggunakan import Topbar dari file lain) ──
const Topbar = ({ onNavigate }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '16px 32px', alignItems: 'center', maxWidth: 1280, margin: '0 auto', width: '100%' }}>
    <div style={{ fontFamily: "'Sora', sans-serif", fontWeight: 900, fontSize: 22, color: 'white' }}>
      Promme<span style={{ color: 'var(--green)' }}>.</span>
    </div>
    <div style={{ display: 'flex', gap: 16 }}>
      <button className="btn-outline" onClick={() => onNavigate?.('login')} style={{ padding: '8px 20px', fontSize: 14 }}>
        Login
      </button>
    </div>
  </div>
);
// ────────────────────────────────────────────────────────────────────────────────────────

// ── Custom Brand Icons (Sama persis dengan style Lucide) ──────────────────────────────
const Instagram = ({ size = 24, color = "currentColor", ...props }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

const Youtube = ({ size = 24, color = "currentColor", ...props }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17" />
    <path d="m10 15 5-3-5-3z" />
  </svg>
);
// ──────────────────────────────────────────────────────────────────────────────────────

/* ─────────────────────────────────────────────────────────────────────────────
   DESIGN DIRECTION:
   "Digital Marketplace Premium" — dark luxury base (#0a0a0f) with electric
   emerald (#1dbf73) as the hero accent. Editorial grid-breaking layouts,
   kinetic number counters, glassmorphism cards, diagonal section cuts,
   and a floating particle canvas. Fonts: Sora (display) + DM Sans (body).
───────────────────────────────────────────────────────────────────────────── */

// ── Injected global styles ────────────────────────────────────────────────────
const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;600;700;800;900&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,300&display=swap');

    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    :root {
      --bg:        #0a0a0f;
      --surface:   #111118;
      --surface2:  #18181f;
      --border:    rgba(255,255,255,0.07);
      --green:     #1dbf73;
      --green-dim: #15a060;
      --green-glow:rgba(29,191,115,0.25);
      --text:      #f0f0f4;
      --muted:     #8b8b9a;
      --white:     #ffffff;
      --radius:    20px;
    }

    html { scroll-behavior: smooth; }

    body, #root { background: var(--bg); font-family: 'DM Sans', sans-serif; color: var(--text); overflow-x: hidden; }

    /* Scrollbar */
    ::-webkit-scrollbar { width: 4px; }
    ::-webkit-scrollbar-track { background: var(--bg); }
    ::-webkit-scrollbar-thumb { background: var(--green); border-radius: 2px; }

    /* ── Canvas particles ── */
    #hero-canvas { position: absolute; inset: 0; pointer-events: none; z-index: 0; }

    /* ── Animated gradient orbs ── */
    .orb {
      position: absolute; border-radius: 50%; filter: blur(80px); pointer-events: none;
      animation: orb-drift 12s ease-in-out infinite alternate;
    }
    .orb-1 { width: 560px; height: 560px; background: radial-gradient(circle, rgba(29,191,115,0.18) 0%, transparent 70%); top: -100px; left: -80px; animation-delay: 0s; }
    .orb-2 { width: 420px; height: 420px; background: radial-gradient(circle, rgba(29,191,115,0.10) 0%, transparent 70%); bottom: 0; right: 0; animation-delay: -5s; }
    .orb-3 { width: 300px; height: 300px; background: radial-gradient(circle, rgba(100,100,255,0.08) 0%, transparent 70%); top: 50%; left: 40%; animation-delay: -8s; }

    @keyframes orb-drift {
      0%   { transform: translate(0,0) scale(1); }
      100% { transform: translate(40px, 30px) scale(1.1); }
    }

    /* ── Hero text reveal ── */
    .hero-word {
      display: inline-block;
      opacity: 0;
      transform: translateY(60px);
      animation: word-rise 0.7s cubic-bezier(0.16,1,0.3,1) forwards;
    }
    @keyframes word-rise { to { opacity: 1; transform: translateY(0); } }

    /* ── Fade-up on scroll ── */
    .fade-up {
      opacity: 0;
      transform: translateY(40px);
      transition: opacity 0.75s cubic-bezier(0.16,1,0.3,1), transform 0.75s cubic-bezier(0.16,1,0.3,1);
    }
    .fade-up.visible { opacity: 1; transform: translateY(0); }

    /* ── Glassmorphism card ── */
    .glass {
      background: rgba(255,255,255,0.035);
      border: 1px solid var(--border);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
    }

    /* ── Glow button ── */
    .btn-glow {
      position: relative; overflow: hidden;
      background: var(--green); color: #000; font-family: 'Sora', sans-serif;
      font-weight: 700; font-size: 15px; letter-spacing: 0.02em;
      padding: 14px 32px; border-radius: 100px; border: none; cursor: pointer;
      transition: transform 0.2s, box-shadow 0.2s;
      box-shadow: 0 0 0 0 var(--green-glow);
    }
    .btn-glow:hover {
      transform: translateY(-2px);
      box-shadow: 0 0 40px 8px var(--green-glow);
    }
    .btn-glow::after {
      content: ''; position: absolute; inset: 0;
      background: linear-gradient(135deg, rgba(255,255,255,0.25) 0%, transparent 60%);
      border-radius: inherit;
    }

    .btn-outline {
      background: transparent; color: var(--text); font-family: 'Sora', sans-serif;
      font-weight: 600; font-size: 15px; padding: 13px 28px;
      border-radius: 100px; border: 1px solid var(--border); cursor: pointer;
      transition: all 0.2s; backdrop-filter: blur(8px);
    }
    .btn-outline:hover { border-color: var(--green); color: var(--green); }

    /* ── Stat card ── */
    .stat-card {
      border-radius: 24px;
      padding: 32px 28px;
      transition: transform 0.3s, box-shadow 0.3s;
    }
    .stat-card:hover {
      transform: translateY(-6px);
      box-shadow: 0 24px 64px rgba(0,0,0,0.4);
    }

    /* ── Feature card ── */
    .feature-card {
      border-radius: 24px; padding: 36px 32px;
      transition: all 0.3s cubic-bezier(0.16,1,0.3,1);
      cursor: default;
    }
    .feature-card:hover {
      transform: translateY(-8px);
      border-color: rgba(29,191,115,0.3) !important;
      box-shadow: 0 30px 80px rgba(0,0,0,0.4), 0 0 0 1px rgba(29,191,115,0.15);
    }
    .feature-card:hover .feature-icon { background: var(--green); color: #000; }

    .feature-icon {
      width: 52px; height: 52px; border-radius: 14px;
      background: rgba(29,191,115,0.12); color: var(--green);
      display: flex; align-items: center; justify-content: center;
      transition: all 0.3s; margin-bottom: 20px;
    }

    /* ── How it works step ── */
    .step-number {
      font-family: 'Sora', sans-serif;
      font-size: 72px; font-weight: 900;
      color: transparent;
      -webkit-text-stroke: 1px rgba(29,191,115,0.25);
      line-height: 1;
      position: absolute; top: -16px; left: -8px;
      pointer-events: none;
    }

    /* ── Marquee ── */
    .marquee-wrapper { overflow: hidden; position: relative; }
    .marquee-track {
      display: flex; gap: 16px; width: max-content;
      animation: marquee-scroll 30s linear infinite;
    }
    .marquee-track:hover { animation-play-state: paused; }
    @keyframes marquee-scroll {
      0%   { transform: translateX(0); }
      100% { transform: translateX(-50%); }
    }
    .marquee-tag {
      padding: 8px 20px; border-radius: 100px; white-space: nowrap;
      font-size: 13px; font-weight: 500; letter-spacing: 0.04em;
      border: 1px solid var(--border); color: var(--muted);
      background: var(--surface);
      transition: all 0.2s;
    }

    /* ── Testimonial card ── */
    .testimonial-card {
      border-radius: 24px; padding: 32px;
      transition: transform 0.3s;
    }
    .testimonial-card:hover { transform: translateY(-4px); }

    /* ── Diagonal divider ── */
    .diagonal-cut {
      clip-path: polygon(0 0, 100% 5%, 100% 100%, 0 95%);
    }
    .diagonal-cut-reverse {
      clip-path: polygon(0 5%, 100% 0, 100% 95%, 0 100%);
    }

    /* ── Noise overlay ── */
    .noise::before {
      content: '';
      position: absolute; inset: 0;
      background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E");
      pointer-events: none; z-index: 1; border-radius: inherit;
    }

    /* ── Floating badge ── */
    @keyframes float-y {
      0%, 100% { transform: translateY(0px) rotate(-3deg); }
      50%      { transform: translateY(-12px) rotate(-3deg); }
    }
    @keyframes float-y2 {
      0%, 100% { transform: translateY(0px) rotate(4deg); }
      50%      { transform: translateY(-10px) rotate(4deg); }
    }
    .float-1 { animation: float-y  4s ease-in-out infinite; }
    .float-2 { animation: float-y2 5s ease-in-out infinite 1s; }

    /* ── Platform chip ── */
    .platform-chip {
      display: flex; align-items: center; gap: 8px;
      padding: 10px 18px; border-radius: 100px;
      border: 1px solid var(--border);
      background: var(--surface);
      font-size: 13px; font-weight: 500; color: var(--muted);
      transition: all 0.2s;
    }
    .platform-chip:hover { border-color: var(--green); color: var(--text); }

    /* ── CTA section ── */
    .cta-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 2px;
      border-radius: 32px;
      overflow: hidden;
    }
    @media (max-width: 768px) {
      .cta-grid { grid-template-columns: 1fr; }
      .step-number { font-size: 48px; }
    }

    /* ── Number counter ── */
    .counter { font-family: 'Sora', sans-serif; font-weight: 900; }

    /* ── Pricing badge ── */
    .pricing-badge {
      position: absolute; top: -14px; left: 50%; transform: translateX(-50%);
      background: var(--green); color: #000; font-family: 'Sora', sans-serif;
      font-size: 11px; font-weight: 700; letter-spacing: 0.08em;
      padding: 4px 14px; border-radius: 100px; text-transform: uppercase;
    }

    /* Responsive tweaks */
    @media (max-width: 768px) {
      .cta-grid { gap: 0; }
    }
  `}</style>
);

// ── Animated counter hook ─────────────────────────────────────────────────────
function useCounter(target, duration = 2000, suffix = '') {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const start = Date.now();
          const tick = () => {
            const elapsed = Date.now() - start;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 4);
            setCount(Math.round(eased * target));
            if (progress < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        }
      },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target, duration]);

  return [count, ref];
}

// ── Scroll reveal hook ────────────────────────────────────────────────────────
function useScrollReveal() {
  useEffect(() => {
    const els = document.querySelectorAll('.fade-up');
    const observer = new IntersectionObserver(
      (entries) => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); }),
      { threshold: 0.12 }
    );
    els.forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);
}

// ── Particle canvas ───────────────────────────────────────────────────────────
function ParticleCanvas() {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let W = canvas.width = canvas.offsetWidth;
    let H = canvas.height = canvas.offsetHeight;
    const particles = Array.from({ length: 60 }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      r: Math.random() * 1.8 + 0.3,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      opacity: Math.random() * 0.5 + 0.1,
    }));
    let raf;
    const render = () => {
      ctx.clearRect(0, 0, W, H);
      particles.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = W; if (p.x > W) p.x = 0;
        if (p.y < 0) p.y = H; if (p.y > H) p.y = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(29,191,115,${p.opacity})`;
        ctx.fill();
      });
      // Draw connecting lines
      particles.forEach((a, i) => {
        particles.slice(i + 1).forEach(b => {
          const dist = Math.hypot(a.x - b.x, a.y - b.y);
          if (dist < 100) {
            ctx.beginPath();
            ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = `rgba(29,191,115,${0.06 * (1 - dist / 100)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        });
      });
      raf = requestAnimationFrame(render);
    };
    render();
    const onResize = () => { W = canvas.width = canvas.offsetWidth; H = canvas.height = canvas.offsetHeight; };
    window.addEventListener('resize', onResize);
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', onResize); };
  }, []);
  return <canvas ref={canvasRef} id="hero-canvas" style={{ width: '100%', height: '100%' }} />;
}

// ── Stat card with counter ────────────────────────────────────────────────────
function StatCard({ target, suffix, label, icon: Icon, delay = 0 }) {
  const [count, ref] = useCounter(target, 1800);
  return (
    <div
      ref={ref}
      className="stat-card glass fade-up"
      style={{ animationDelay: `${delay}ms`, transitionDelay: `${delay}ms` }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(29,191,115,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--green)' }}>
          <Icon size={18} />
        </div>
        <span style={{ fontSize: 13, color: 'var(--muted)', letterSpacing: '0.04em', fontWeight: 500 }}>{label}</span>
      </div>
      <div className="counter" style={{ fontSize: 44, lineHeight: 1, color: 'var(--text)' }}>
        {count.toLocaleString('id')}{suffix}
      </div>
    </div>
  );
}

// ── Data ──────────────────────────────────────────────────────────────────────
const features = [
  { icon: BarChart2, title: 'Tracking Real-Time', desc: 'Views konten Anda divalidasi otomatis setiap menit langsung dari API resmi TikTok, YouTube, dan Instagram. Tidak ada angka palsu.', tag: 'Anti-Fraud' },
  { icon: Shield,    title: 'Sistem Escrow Aman', desc: 'Budget Brand terkunci di escrow sebelum kampanye dimulai. Creator hanya dibayar setelah performa konten terverifikasi secara akurat.', tag: 'Trusted' },
  { icon: Zap,       title: 'Komisi Otomatis',   desc: 'Kalkulasi komisi berjalan otomatis berbasis model CPM (Cost Per 1000 Views). Tidak ada negosiasi, tidak ada keterlambatan pembayaran.', tag: 'Instant' },
  { icon: Target,    title: 'Matching Cerdas',   desc: 'Filter kampanye berdasarkan platform, niche, dan rentang komisi. Creator menemukan kampanye yang tepat, Brand menemukan Creator yang sesuai.', tag: 'Smart' },
  { icon: DollarSign,title: 'Withdrawal Mudah',  desc: 'Cairkan pendapatan ke rekening bank kapan saja. Minimum Rp 50.000 dengan proses otomatis untuk nominal normal.', tag: 'Flexible' },
  { icon: Award,     title: 'KYC Terverifikasi', desc: 'Semua Creator melalui verifikasi identitas (KYC) ketat. Brand dapat berkolaborasi dengan tenang bersama kreator yang terpercaya.', tag: 'Verified' },
];

const steps = [
  { num: '01', who: 'Brand',   title: 'Buat Kampanye',      desc: 'Atur platform, komisi per 1000 views, durasi, dan upload aset kreatif dalam hitungan menit.' },
  { num: '02', who: 'Brand',   title: 'Isi Budget',         desc: 'Bayar via Midtrans (kartu kredit, transfer, e-wallet). Budget terkunci aman di sistem escrow Promme.' },
  { num: '03', who: 'Creator', title: 'Join & Submit',      desc: 'Creator bergabung, buat konten, dan submit URL. Sistem langsung mulai tracking performa secara real-time.' },
  { num: '04', who: 'Semua',   title: 'Terima Pembayaran',  desc: 'Komisi dihitung otomatis dan langsung masuk wallet Creator. Cairkan kapan saja ke rekening bank.' },
];

const testimonials = [
  { name: 'Aditya R.', role: 'Brand Manager — FMCG', avatar: 'AR', stars: 5, quote: 'Akhirnya ada platform yang bisa verifikasi views secara objektif. ROI kampanye kami meningkat 3x karena tidak ada lagi pembayaran ke konten yang tidak performa.' },
  { name: 'Siti Rahayu', role: 'Content Creator — 500K Followers', avatar: 'SR', stars: 5, quote: 'Sistem komisi otomatisnya luar biasa. Saya bisa fokus bikin konten tanpa khawatir soal negosiasi atau keterlambatan pembayaran.' },
  { name: 'Dimas Putra', role: 'Startup Founder', avatar: 'DP', stars: 5, quote: 'Dashboard analytics-nya lengkap banget. Saya bisa lihat real-time berapa views yang sudah tervalidasi dan berapa budget yang sudah terpakai.' },
];

const tags = ['#TikTok Creator', '#YouTube Partner', '#Instagram Influencer', '#Brand Partnership', '#Content Marketing', '#CPM Model', '#Escrow System', '#KYC Verified', '#Anti-Fraud', '#Real-Time Tracking', '#Affiliate Marketing', '#Digital Campaign'];

const platforms = [
  { icon: Music2,    name: 'TikTok',    color: '#FF0050' },
  { icon: Youtube,   name: 'YouTube',   color: '#FF0000' },
  { icon: Instagram, name: 'Instagram', color: '#E1306C' },
];

// ── Main Component ────────────────────────────────────────────────────────────
const LandingPage = ({ onNavigate }) => {
  useScrollReveal();

  const words = ['Kolaborasi', 'Cerdas,', 'Hasil', 'Maksimal.'];
  const delays = [0, 100, 250, 350];

  return (
    <>
      <GlobalStyles />
      <div style={{ minHeight: '100vh', background: 'var(--bg)', fontFamily: "'DM Sans', sans-serif", color: 'var(--text)', overflowX: 'hidden' }}>

        {/* ── Topbar ── */}
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, background: 'rgba(10,10,15,0.85)', backdropFilter: 'blur(20px)', borderBottom: '1px solid var(--border)' }}>
          <Topbar onNavigate={onNavigate} />
        </div>

        {/* ═══════════════════════════════════════════════════
            HERO
        ═══════════════════════════════════════════════════ */}
        <section style={{ position: 'relative', minHeight: '100vh', display: 'flex', alignItems: 'center', paddingTop: 80, overflow: 'hidden' }}>
          <div className="orb orb-1" /><div className="orb orb-2" /><div className="orb orb-3" />
          <ParticleCanvas />

          <div style={{ position: 'relative', zIndex: 2, width: '100%', maxWidth: 1280, margin: '0 auto', padding: '60px 32px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 80, alignItems: 'center' }}>

              {/* Left */}
              <div>
                {/* Badge */}
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 16px', borderRadius: 100, border: '1px solid rgba(29,191,115,0.3)', background: 'rgba(29,191,115,0.08)', marginBottom: 32 }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--green)', boxShadow: '0 0 8px var(--green)', display: 'inline-block' }} />
                  <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--green)', letterSpacing: '0.06em', fontFamily: "'Sora', sans-serif" }}>PLATFORM #1 INFLUENCER MARKETING INDONESIA</span>
                </div>

                {/* Headline */}
                <h1 style={{ fontFamily: "'Sora', sans-serif", fontSize: 'clamp(44px,5vw,76px)', fontWeight: 900, lineHeight: 1.05, marginBottom: 28, letterSpacing: '-0.02em' }}>
                  {words.map((w, i) => (
                    <span key={i}>
                      <span className="hero-word" style={{ animationDelay: `${delays[i]}ms` }}>
                        {w.includes('Cerdas') || w.includes('Maksimal')
                          ? <span style={{ color: 'var(--green)', textShadow: '0 0 40px rgba(29,191,115,0.4)' }}>{w}</span>
                          : w}
                      </span>
                      {' '}
                    </span>
                  ))}
                </h1>

                <p style={{ fontSize: 18, lineHeight: 1.7, color: 'var(--muted)', marginBottom: 40, maxWidth: 480, animationDelay: '500ms' }}>
                  Jembatani Brand dan Content Creator dengan sistem verifikasi views otomatis, pembayaran escrow, dan analytics real-time. Transparan, aman, dan menguntungkan.
                </p>

                {/* CTA Buttons */}
                <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 52 }}>
                  <button className="btn-glow" onClick={() => onNavigate?.('register')} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    Mulai Gratis <ArrowRight size={16} />
                  </button>
                  <button className="btn-outline" onClick={() => onNavigate?.('login')} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Play size={14} fill="currentColor" /> Lihat Demo
                  </button>
                </div>

                {/* Social proof row */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                  <div style={{ display: 'flex' }}>
                    {['DP','SR','AR','BW','KL'].map((init, i) => (
                      <div key={i} style={{ width: 36, height: 36, borderRadius: '50%', background: `hsl(${i*60},60%,45%)`, border: '2px solid var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#fff', marginLeft: i === 0 ? 0 : -10, position: 'relative', zIndex: 5 - i }}>
                        {init}
                      </div>
                    ))}
                  </div>
                  <div>
                    <div style={{ display: 'flex', gap: 2, marginBottom: 2 }}>
                      {[...Array(5)].map((_, i) => <Star key={i} size={12} fill="#f59e0b" color="#f59e0b" />)}
                    </div>
                    <span style={{ fontSize: 13, color: 'var(--muted)' }}>Dipercaya <strong style={{ color: 'var(--text)' }}>10.000+</strong> pengguna</span>
                  </div>
                </div>
              </div>

              {/* Right — Floating dashboard mockup */}
              <div style={{ position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center', height: 520, '@media(minWidth: 768px)': { display: 'flex' } }}>

                {/* Main card */}
                <div className="glass float-1" style={{ width: 320, borderRadius: 28, padding: 28, position: 'relative', zIndex: 3 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                    <div>
                      <div style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 500, marginBottom: 2, letterSpacing: '0.06em' }}>TOTAL PENDAPATAN</div>
                      <div style={{ fontFamily: "'Sora', sans-serif", fontSize: 36, fontWeight: 900, color: 'var(--text)' }}>Rp 12,4<span style={{ color: 'var(--green)' }}>jt</span></div>
                    </div>
                    <div style={{ width: 48, height: 48, borderRadius: 14, background: 'rgba(29,191,115,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--green)' }}>
                      <TrendingUp size={22} />
                    </div>
                  </div>
                  {/* Mini chart bars */}
                  <div style={{ display: 'flex', gap: 6, alignItems: 'flex-end', height: 64, marginBottom: 20 }}>
                    {[40, 65, 35, 80, 55, 90, 70, 95, 60, 100, 85, 75].map((h, i) => (
                      <div key={i} style={{ flex: 1, height: `${h}%`, borderRadius: 4, background: i === 10 ? 'var(--green)' : 'rgba(29,191,115,0.2)', transition: 'all 0.3s' }} />
                    ))}
                  </div>
                  <div style={{ display: 'flex', gap: 10 }}>
                    {[{ l: 'Views', v: '2.4M' }, { l: 'Kampanye', v: '8' }, { l: 'Komisi', v: '+23%' }].map(({ l, v }) => (
                      <div key={l} style={{ flex: 1, background: 'rgba(255,255,255,0.04)', borderRadius: 12, padding: '10px 8px', textAlign: 'center' }}>
                        <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', fontFamily: "'Sora', sans-serif" }}>{v}</div>
                        <div style={{ fontSize: 10, color: 'var(--muted)', marginTop: 2 }}>{l}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Floating badge 1 — verified */}
                <div className="glass float-2" style={{ position: 'absolute', top: 40, right: -20, borderRadius: 18, padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 10, zIndex: 4, minWidth: 180 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(29,191,115,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--green)' }}>
                    <CheckCircle size={18} />
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>KYC Verified</div>
                    <div style={{ fontSize: 11, color: 'var(--muted)' }}>Creator terverifikasi</div>
                  </div>
                </div>

                {/* Floating badge 2 — live tracking */}
                <div className="glass" style={{ position: 'absolute', bottom: 80, left: -30, borderRadius: 18, padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 10, zIndex: 4 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--green)', boxShadow: '0 0 12px var(--green)' }} />
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>Live Tracking</div>
                  <div style={{ fontSize: 11, color: '#4ade80', fontWeight: 600 }}>+1.2K views/hr</div>
                </div>

                {/* Floating badge 3 — payment */}
                <div className="glass" style={{ position: 'absolute', bottom: 30, right: 10, borderRadius: 18, padding: '12px 16px', zIndex: 4 }}>
                  <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 2 }}>Pembayaran Masuk</div>
                  <div style={{ fontFamily: "'Sora', sans-serif", fontSize: 18, fontWeight: 800, color: 'var(--green)' }}>+ Rp 750.000</div>
                </div>

                {/* Background glow */}
                <div style={{ position: 'absolute', width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(29,191,115,0.12) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 1 }} />
              </div>
            </div>
          </div>

          {/* Scroll indicator */}
          <div style={{ position: 'absolute', bottom: 40, left: '50%', transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, zIndex: 2 }}>
            <span style={{ fontSize: 11, letterSpacing: '0.1em', color: 'var(--muted)', fontWeight: 500 }}>SCROLL</span>
            <div style={{ width: 1, height: 48, background: 'linear-gradient(to bottom, var(--green), transparent)' }} />
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════
            MARQUEE TAGS
        ═══════════════════════════════════════════════════ */}
        <div className="marquee-wrapper" style={{ padding: '24px 0', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', background: 'var(--surface)' }}>
          <div className="marquee-track">
            {[...tags, ...tags].map((t, i) => <div key={i} className="marquee-tag">{t}</div>)}
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════
            STATS
        ═══════════════════════════════════════════════════ */}
        <section style={{ padding: '100px 32px', maxWidth: 1280, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <p className="fade-up" style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.12em', color: 'var(--green)', marginBottom: 14, fontFamily: "'Sora', sans-serif" }}>DALAM ANGKA</p>
            <h2 className="fade-up" style={{ fontFamily: "'Sora', sans-serif", fontSize: 'clamp(32px,4vw,52px)', fontWeight: 900, letterSpacing: '-0.02em' }}>Platform yang Terbukti Bekerja</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20 }}>
            <StatCard target={10000} suffix="+" label="Creator Aktif" icon={Users} delay={0} />
            <StatCard target={500}   suffix="+" label="Brand Terdaftar" icon={Briefcase} delay={100} />
            <StatCard target={12}    suffix=" M" label="Views Tervalidasi" icon={BarChart2} delay={200} />
            <StatCard target={98}    suffix="%" label="Kepuasan Pengguna" icon={Star} delay={300} />
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════
            PLATFORM SUPPORT
        ═══════════════════════════════════════════════════ */}
        <section style={{ padding: '0 32px 80px', maxWidth: 1280, margin: '0 auto' }}>
          <div className="glass fade-up" style={{ borderRadius: 32, padding: '40px 48px', display: 'flex', alignItems: 'center', gap: 40, flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: 200 }}>
              <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.1em', color: 'var(--green)', marginBottom: 8 }}>PLATFORM TERINTEGRASI</p>
              <h3 style={{ fontFamily: "'Sora', sans-serif", fontSize: 24, fontWeight: 800 }}>Tracking views dari platform favorit Anda</h3>
            </div>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              {platforms.map(({ icon: Icon, name, color }) => (
                <div key={name} className="platform-chip">
                  <Icon size={16} color={color} />
                  <span>{name}</span>
                </div>
              ))}
              <div className="platform-chip">
                <span style={{ fontSize: 16 }}>📘</span>
                <span>Facebook</span>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════
            FEATURES
        ═══════════════════════════════════════════════════ */}
        <section style={{ padding: '80px 32px 120px', background: 'var(--surface)', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'radial-gradient(ellipse at 50% 0%, rgba(29,191,115,0.06) 0%, transparent 60%)', pointerEvents: 'none' }} />
          <div style={{ maxWidth: 1280, margin: '0 auto', position: 'relative', zIndex: 1 }}>
            <div style={{ textAlign: 'center', marginBottom: 72 }}>
              <p className="fade-up" style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.12em', color: 'var(--green)', marginBottom: 14, fontFamily: "'Sora', sans-serif" }}>FITUR UNGGULAN</p>
              <h2 className="fade-up" style={{ fontFamily: "'Sora', sans-serif", fontSize: 'clamp(32px,4vw,52px)', fontWeight: 900, letterSpacing: '-0.02em', marginBottom: 16 }}>Dirancang untuk Performa Terbaik</h2>
              <p className="fade-up" style={{ fontSize: 17, color: 'var(--muted)', maxWidth: 540, margin: '0 auto', lineHeight: 1.7 }}>
                Setiap fitur dibangun untuk menghilangkan gesekan antara Brand dan Creator, dan memastikan ekosistem yang adil bagi semua pihak.
              </p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>
              {features.map(({ icon: Icon, title, desc, tag }, i) => (
                <div
                  key={title}
                  className="feature-card glass fade-up"
                  style={{ transitionDelay: `${i * 80}ms` }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
                    <div className="feature-icon"><Icon size={22} /></div>
                    <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', color: 'var(--green)', background: 'rgba(29,191,115,0.1)', padding: '4px 10px', borderRadius: 100, fontFamily: "'Sora', sans-serif" }}>{tag}</span>
                  </div>
                  <h3 style={{ fontFamily: "'Sora', sans-serif", fontSize: 19, fontWeight: 700, marginBottom: 10 }}>{title}</h3>
                  <p style={{ fontSize: 14, color: 'var(--muted)', lineHeight: 1.7 }}>{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════
            HOW IT WORKS
        ═══════════════════════════════════════════════════ */}
        <section style={{ padding: '120px 32px', maxWidth: 1280, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 80 }}>
            <p className="fade-up" style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.12em', color: 'var(--green)', marginBottom: 14, fontFamily: "'Sora', sans-serif" }}>CARA KERJA</p>
            <h2 className="fade-up" style={{ fontFamily: "'Sora', sans-serif", fontSize: 'clamp(32px,4vw,52px)', fontWeight: 900, letterSpacing: '-0.02em' }}>4 Langkah Menuju Kolaborasi Sukses</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 28 }}>
            {steps.map(({ num, who, title, desc }, i) => (
              <div
                key={num}
                className="fade-up"
                style={{
                  position: 'relative', padding: '40px 32px 36px',
                  borderRadius: 28, background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  transitionDelay: `${i * 100}ms`,
                  overflow: 'hidden',
                }}
              >
                <span className="step-number">{num}</span>
                <div style={{ position: 'relative', zIndex: 1 }}>
                  <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', color: who === 'Brand' ? '#60a5fa' : who === 'Creator' ? 'var(--green)' : '#a78bfa', background: who === 'Brand' ? 'rgba(96,165,250,0.1)' : who === 'Creator' ? 'rgba(29,191,115,0.1)' : 'rgba(167,139,250,0.1)', padding: '4px 10px', borderRadius: 100, fontFamily: "'Sora', sans-serif", display: 'inline-block', marginBottom: 20 }}>{who.toUpperCase()}</span>
                  <h3 style={{ fontFamily: "'Sora', sans-serif", fontSize: 21, fontWeight: 800, marginBottom: 12 }}>{title}</h3>
                  <p style={{ fontSize: 14, color: 'var(--muted)', lineHeight: 1.7 }}>{desc}</p>
                  {i < steps.length - 1 && (
                    <div style={{ position: 'absolute', right: -14, top: '50%', transform: 'translateY(-50%)', width: 28, height: 28, borderRadius: '50%', background: 'var(--bg)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10 }}>
                      <ChevronRight size={14} color="var(--muted)" />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════
            FOR WHOM (TWO COLUMN CTA)
        ═══════════════════════════════════════════════════ */}
        <section style={{ padding: '0 32px 120px', maxWidth: 1280, margin: '0 auto' }}>
          <div className="cta-grid">
            {/* Brand */}
            <div className="fade-up" style={{ background: 'linear-gradient(135deg, #1dbf73 0%, #15a060 100%)', padding: '64px 52px', borderRadius: '32px 32px 0 0', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', bottom: -40, right: -40, width: 200, height: 200, borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }} />
              <div style={{ position: 'absolute', top: -20, left: -20, width: 120, height: 120, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
              <div style={{ position: 'relative', zIndex: 1 }}>
                <Briefcase size={36} color="#000" style={{ marginBottom: 24 }} />
                <h3 style={{ fontFamily: "'Sora', sans-serif", fontSize: 32, fontWeight: 900, color: '#000', marginBottom: 16, lineHeight: 1.15 }}>Untuk Brand &<br/>Pengiklan</h3>
                <p style={{ fontSize: 15, color: 'rgba(0,0,0,0.65)', marginBottom: 32, lineHeight: 1.7 }}>Jalankan kampanye iklan berbasis performa nyata. Bayar hanya untuk views yang tervalidasi. Budget aman di escrow.</p>
                {['Budget Escrow Terlindungi', 'Analytics Real-Time', 'Creator KYC Verified', 'ROI Terukur & Transparan'].map(item => (
                  <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                    <CheckCircle size={16} color="#000" style={{ flexShrink: 0 }} />
                    <span style={{ fontSize: 14, fontWeight: 500, color: 'rgba(0,0,0,0.75)' }}>{item}</span>
                  </div>
                ))}
                <button className="btn-glow" onClick={() => onNavigate?.('register')} style={{ marginTop: 32, background: '#000', color: '#fff', display: 'flex', alignItems: 'center', gap: 8 }}>
                  Daftar sebagai Brand <ArrowRight size={15} />
                </button>
              </div>
            </div>

            {/* Creator */}
            <div className="fade-up" style={{ background: 'var(--surface2)', padding: '64px 52px', borderRadius: '0 0 32px 32px', border: '1px solid var(--border)', position: 'relative', overflow: 'hidden', transitionDelay: '100ms' }}>
              <div style={{ position: 'absolute', bottom: -60, right: -60, width: 240, height: 240, borderRadius: '50%', background: 'radial-gradient(circle, rgba(29,191,115,0.08) 0%, transparent 70%)' }} />
              <div style={{ position: 'relative', zIndex: 1 }}>
                <Users size={36} color="var(--green)" style={{ marginBottom: 24 }} />
                <h3 style={{ fontFamily: "'Sora', sans-serif", fontSize: 32, fontWeight: 900, color: 'var(--text)', marginBottom: 16, lineHeight: 1.15 }}>Untuk Content<br/>Creator</h3>
                <p style={{ fontSize: 15, color: 'var(--muted)', marginBottom: 32, lineHeight: 1.7 }}>Monetisasi konten Anda dengan sistem komisi yang adil dan transparan. Tidak ada negosiasi, tidak ada keterlambatan.</p>
                {['Komisi Otomatis per 1000 Views', 'Withdrawal ke Rekening Bank', 'Dashboard Pendapatan Lengkap', 'KYC Mudah & Cepat'].map(item => (
                  <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                    <CheckCircle size={16} color="var(--green)" style={{ flexShrink: 0 }} />
                    <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--muted)' }}>{item}</span>
                  </div>
                ))}
                <button className="btn-glow" onClick={() => onNavigate?.('register')} style={{ marginTop: 32, display: 'flex', alignItems: 'center', gap: 8 }}>
                  Daftar sebagai Creator <ArrowRight size={15} />
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════
            TESTIMONIALS
        ═══════════════════════════════════════════════════ */}
        <section style={{ padding: '80px 32px 120px', background: 'var(--surface)', position: 'relative' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 100%, rgba(29,191,115,0.05) 0%, transparent 60%)', pointerEvents: 'none' }} />
          <div style={{ maxWidth: 1280, margin: '0 auto', position: 'relative', zIndex: 1 }}>
            <div style={{ textAlign: 'center', marginBottom: 64 }}>
              <p className="fade-up" style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.12em', color: 'var(--green)', marginBottom: 14, fontFamily: "'Sora', sans-serif" }}>TESTIMONI</p>
              <h2 className="fade-up" style={{ fontFamily: "'Sora', sans-serif", fontSize: 'clamp(32px,4vw,52px)', fontWeight: 900, letterSpacing: '-0.02em' }}>Mereka Sudah Merasakannya</h2>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>
              {testimonials.map(({ name, role, avatar, stars, quote }, i) => (
                <div key={name} className="testimonial-card glass fade-up" style={{ transitionDelay: `${i * 100}ms` }}>
                  <div style={{ display: 'flex', gap: 2, marginBottom: 20 }}>
                    {[...Array(stars)].map((_, j) => <Star key={j} size={14} fill="#f59e0b" color="#f59e0b" />)}
                  </div>
                  <p style={{ fontSize: 15, color: 'var(--muted)', lineHeight: 1.75, marginBottom: 24, fontStyle: 'italic' }}>"{quote}"</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 42, height: 42, borderRadius: '50%', background: 'linear-gradient(135deg, var(--green) 0%, #15a060 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Sora', sans-serif", fontWeight: 800, fontSize: 14, color: '#000' }}>{avatar}</div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>{name}</div>
                      <div style={{ fontSize: 12, color: 'var(--muted)' }}>{role}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════
            FINAL CTA
        ═══════════════════════════════════════════════════ */}
        <section style={{ padding: '80px 32px 120px', maxWidth: 1280, margin: '0 auto' }}>
          <div className="fade-up" style={{ borderRadius: 40, background: 'linear-gradient(135deg, #0f2318 0%, #0a1a10 50%, #0a0a0f 100%)', border: '1px solid rgba(29,191,115,0.2)', padding: '80px 64px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
            {/* Green orb */}
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 500, height: 300, borderRadius: '50%', background: 'radial-gradient(ellipse, rgba(29,191,115,0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />
            <div style={{ position: 'relative', zIndex: 1 }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '7px 18px', borderRadius: 100, border: '1px solid rgba(29,191,115,0.3)', background: 'rgba(29,191,115,0.08)', fontSize: 11, fontWeight: 700, color: 'var(--green)', letterSpacing: '0.08em', fontFamily: "'Sora', sans-serif", marginBottom: 28 }}>
                <Zap size={12} fill="currentColor" /> GRATIS UNTUK MEMULAI
              </span>
              <h2 style={{ fontFamily: "'Sora', sans-serif", fontSize: 'clamp(36px,5vw,62px)', fontWeight: 900, letterSpacing: '-0.02em', marginBottom: 20, lineHeight: 1.1 }}>
                Siap Memulai<br /><span style={{ color: 'var(--green)' }}>Kolaborasi Cerdas?</span>
              </h2>
              <p style={{ fontSize: 17, color: 'var(--muted)', maxWidth: 480, margin: '0 auto 48px', lineHeight: 1.7 }}>
                Bergabunglah dengan ribuan Brand dan Creator yang sudah merasakan manfaat platform transparan Promme.
              </p>
              <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
                <button className="btn-glow" onClick={() => onNavigate?.('register')} style={{ fontSize: 16, padding: '16px 40px', display: 'flex', alignItems: 'center', gap: 10 }}>
                  Mulai Gratis Sekarang <ArrowRight size={18} />
                </button>
                <button className="btn-outline" onClick={() => onNavigate?.('login')} style={{ fontSize: 15, padding: '15px 28px' }}>
                  Sudah punya akun? Login
                </button>
              </div>
              <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 24 }}>
                Tidak perlu kartu kredit · Setup dalam 2 menit · Batalkan kapan saja
              </p>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════
            FOOTER
        ═══════════════════════════════════════════════════ */}
        <footer style={{ borderTop: '1px solid var(--border)', padding: '48px 32px', background: 'var(--surface)' }}>
          <div style={{ maxWidth: 1280, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 20 }}>
            <div>
              <div style={{ fontFamily: "'Sora', sans-serif", fontWeight: 900, fontSize: 22, color: 'var(--text)', marginBottom: 4 }}>
                Promme<span style={{ color: 'var(--green)' }}>.</span>
              </div>
              <p style={{ fontSize: 13, color: 'var(--muted)' }}>Platform Influencer Marketing #1 Indonesia</p>
            </div>
            <div style={{ display: 'flex', gap: 28, flexWrap: 'wrap' }}>
              {['Tentang Kami', 'Fitur', 'Harga', 'Blog', 'Kontak'].map(link => (
                <span key={link} style={{ fontSize: 13, color: 'var(--muted)', cursor: 'pointer', transition: 'color 0.2s' }} onMouseEnter={e => e.target.style.color = 'var(--green)'} onMouseLeave={e => e.target.style.color = 'var(--muted)'}>{link}</span>
              ))}
            </div>
            <p style={{ fontSize: 12, color: 'var(--muted)' }}>© 2025 Promme. All rights reserved.</p>
          </div>
        </footer>

      </div>
    </>
  );
};

export default LandingPage;