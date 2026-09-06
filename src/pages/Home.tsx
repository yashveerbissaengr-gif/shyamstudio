import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';

/* ── Animated counter ─────────────────────────────────────────────────────── */
function Counter({ to, suffix = '' }: { to: number; suffix?: string }) {
  const [val, setVal] = useState(0);
  const elRef = useRef<HTMLSpanElement>(null);
  const started = useRef(false);
  useEffect(() => {
    const el = elRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting || started.current) return;
      started.current = true;
      const dur = 1200;
      const start = performance.now();
      const tick = (now: number) => {
        const p = Math.min((now - start) / dur, 1);
        const ease = 1 - Math.pow(1 - p, 3);
        setVal(Math.round(ease * to));
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }, { threshold: 0.4 });
    io.observe(el);
    return () => io.disconnect();
  }, [to]);
  return <span ref={elRef}>{val}{suffix}</span>;
}

/* ── CSS-only marquee (no JS animation = no jank) ────────────────────────── */
function Ticker() {
  const items = ['Wedding Photography', 'Cinematic Films', 'Pre‑Wedding Shoots', 'Event Coverage', 'Portrait Sessions', 'Graphic Design', 'Based in Nagpur'];
  const row = [...items, ...items].join('   ✦   ');
  return (
    <div style={{ overflow: 'hidden', borderTop: '1px solid rgba(255,255,255,0.08)', borderBottom: '1px solid rgba(255,255,255,0.08)', padding: '13px 0', userSelect: 'none' }}>
      <style>{`
        @keyframes ticker { from { transform: translateX(0) } to { transform: translateX(-50%) } }
        .ticker-inner { display: inline-block; white-space: nowrap; animation: ticker 30s linear infinite; will-change: transform; }
      `}</style>
      <div className="ticker-inner">
        <span style={{ fontSize: 10, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'rgba(240,237,230,0.38)', padding: '0 32px' }}>{row}</span>
        <span style={{ fontSize: 10, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'rgba(240,237,230,0.38)', padding: '0 32px' }}>{row}</span>
      </div>
    </div>
  );
}

/* ── Main ─────────────────────────────────────────────────────────────────── */
export default function Home() {
  /* Parallax — only runs on rAF, no Framer hooks that fire on every render */
  const heroImgRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        if (!heroImgRef.current) return;
        const y = window.scrollY * 0.18;
        heroImgRef.current.style.transform = `translateY(${y}px)`;
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => { window.removeEventListener('scroll', onScroll); cancelAnimationFrame(raf); };
  }, []);

  /* Rotating quotes */
  const quotes = [
    { text: "I didn't expect to cry watching our wedding film. I expected to cringe. Shyam Studio made me do the former.", author: 'Ankita & Vikas', event: 'Dec 2025' },
    { text: "They were invisible on the day itself. Somehow that made everything in the photos more real.", author: 'Priya Ramteke', event: 'Oct 2025' },
    { text: "My mother said the album looks like a magazine. My father said it cost less than he expected. Both true.", author: 'Rohan & Shruti', event: 'Mar 2025' },
  ];
  const [qi, setQi] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setQi(n => (n + 1) % quotes.length), 6000);
    return () => clearInterval(t);
  }, [quotes.length]);

  /* Scroll-reveal utility — simple CSS class toggle */
  const revealRefs = useRef<Element[]>([]);
  const addReveal = useCallback((el: Element | null) => {
    if (el && !revealRefs.current.includes(el)) revealRefs.current.push(el);
  }, []);
  useEffect(() => {
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) { (e.target as HTMLElement).classList.add('revealed'); io.unobserve(e.target); } });
    }, { threshold: 0.08 });
    revealRefs.current.forEach(el => io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <>
      {/* ── Global Styles ─────────────────────────────────────────────────── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400;1,600&family=Inter:wght@300;400;500&display=swap');

        /* Reset baseline — scoped to .ss-home */
        .ss-home *, .ss-home *::before, .ss-home *::after { box-sizing: border-box; }
        .ss-home { font-family: 'Inter','Helvetica Neue',sans-serif; background:#0c0c0c; color:#f0ede6; overflow-x:hidden; }
        .ss-home a { text-decoration:none; color:inherit; }
        .ss-home ::selection { background:#f47a21; color:#0c0c0c; }

        /* Scroll reveal */
        .reveal { opacity:0; transform:translateY(28px); transition:opacity 0.75s ease, transform 0.75s ease; }
        .reveal.revealed { opacity:1; transform:translateY(0); }
        .reveal-d1 { transition-delay:0.1s; }
        .reveal-d2 { transition-delay:0.22s; }
        .reveal-d3 { transition-delay:0.34s; }
        .reveal-d4 { transition-delay:0.46s; }

        /* Typography */
        .serif { font-family:'Cormorant Garamond',Georgia,serif; font-weight:400; letter-spacing:-0.01em; }
        .label { font-size:10px; letter-spacing:0.24em; text-transform:uppercase; color:rgba(240,237,230,0.4); }
        .body-sm { font-size:14.5px; line-height:1.78; font-weight:300; color:rgba(240,237,230,0.62); }

        /* Max-width wrapper */
        .mx { max-width:1140px; margin:0 auto; padding:0 28px; }

        /* ── Hero ── */
        .hero-root { position:relative; height:100vh; min-height:600px; overflow:hidden; background:#0c0c0c; }
        .hero-parallax { position:absolute; top:-15%; left:0; width:100%; height:115%; will-change:transform; }
        .hero-parallax img { width:100%; height:100%; object-fit:cover; object-position:center; display:block; }
        .hero-dim {
          position:absolute; inset:0;
          background:linear-gradient(to bottom, rgba(12,12,12,0.72) 0%, rgba(12,12,12,0.3) 40%, rgba(12,12,12,0.85) 100%);
        }
        .hero-content {
          position:relative; z-index:2; height:100%;
          display:flex; flex-direction:column; align-items:center; justify-content:center;
          text-align:center; padding: 80px 24px 48px;
        }
        .hero-eyebrow {
          display:inline-flex; align-items:center; gap:10px;
          font-size:10px; letter-spacing:0.26em; text-transform:uppercase;
          color:#f47a21; font-weight:600; margin-bottom:28px;
        }
        .hero-dot { width:5px; height:5px; border-radius:50%; background:#f47a21; }
        .hero-h1 { font-family:'Cormorant Garamond',serif; font-size:clamp(52px,9vw,116px); font-weight:400; line-height:0.92; color:#f0ede6; margin-bottom:24px; }
        .hero-h1 em { font-style:italic; }
        .hero-sub { font-size:clamp(15px,1.8vw,18px); font-weight:300; color:rgba(240,237,230,0.7); max-width:520px; line-height:1.7; margin-bottom:44px; }
        .hero-btns { display:flex; gap:14px; flex-wrap:wrap; justify-content:center; }
        .hero-scroll { position:absolute; bottom:28px; left:50%; transform:translateX(-50%); display:flex; flex-direction:column; align-items:center; gap:6px; color:rgba(240,237,230,0.35); font-size:9px; letter-spacing:0.2em; text-transform:uppercase; animation:scrollbounce 2.5s ease-in-out infinite; }
        @keyframes scrollbounce { 0%,100%{transform:translateX(-50%) translateY(0)} 50%{transform:translateX(-50%) translateY(7px)} }

        /* ── Buttons ── */
        .btn-fill {
          display:inline-flex; align-items:center; gap:8px;
          background:#f47a21; color:#0c0c0c; padding:13px 26px;
          font-size:10.5px; letter-spacing:0.17em; text-transform:uppercase; font-weight:500;
          border:none; cursor:pointer; transition:background 0.2s, transform 0.2s;
        }
        .btn-fill:hover { background:#e06810; transform:translateY(-1px); }
        .btn-ghost-text {
          font-size:10.5px; letter-spacing:0.17em; text-transform:uppercase;
          color:rgba(240,237,230,0.5); display:inline-flex; align-items:center; gap:8px;
          transition:color 0.2s;
        }
        .btn-ghost-text:hover { color:#f0ede6; }

        /* ── Numbers strip ── */
        .nums-grid { display:grid; grid-template-columns:repeat(4,1fr); border-bottom:1px solid rgba(255,255,255,0.07); }
        .num-cell { padding:32px 24px; border-right:1px solid rgba(255,255,255,0.07); }
        .num-cell:last-child { border-right:none; }
        .num-big { font-family:'Cormorant Garamond',serif; font-size:clamp(38px,5vw,58px); font-weight:400; color:#f0ede6; line-height:1; margin-bottom:6px; }
        @media(max-width:640px){ .nums-grid{grid-template-columns:repeat(2,1fr);} .num-cell:nth-child(2){border-right:none;} }

        /* ── About ── */
        .about-grid { display:grid; grid-template-columns:1fr 1fr; }
        @media(max-width:768px){ .about-grid{grid-template-columns:1fr;} }
        .about-img-wrap { position:relative; overflow:hidden; min-height:480px; }
        .about-img-wrap img { width:100%; height:100%; object-fit:cover; display:block; filter:saturate(0.75) brightness(0.85); }
        .about-ghost { position:absolute; bottom:16px; right:16px; font-family:'Cormorant Garamond',serif; font-size:100px; font-weight:400; color:rgba(240,237,230,0.08); line-height:1; pointer-events:none; user-select:none; }
        .about-text { padding:64px 52px; display:flex; flex-direction:column; justify-content:center; background:#0f0f0f; }
        @media(max-width:768px){ .about-text{padding:44px 24px;} }

        /* ── Services list ── */
        .svc-row { display:grid; grid-template-columns:36px 1fr 20px; gap:0 20px; align-items:start; padding:24px 0; border-bottom:1px solid rgba(255,255,255,0.07); transition:padding-left 0.25s; cursor:default; }
        .svc-row:first-of-type { border-top:1px solid rgba(255,255,255,0.07); }
        .svc-row:hover { padding-left:10px; }
        .svc-row:hover .svc-num { color:#f47a21; }
        .svc-row:hover .svc-arrow { opacity:1; color:#f47a21; }
        .svc-num { font-family:'Cormorant Garamond',serif; font-size:13px; color:rgba(240,237,230,0.28); padding-top:5px; transition:color 0.25s; }
        .svc-name { font-family:'Cormorant Garamond',serif; font-size:clamp(22px,3vw,34px); font-weight:400; color:#f0ede6; margin-bottom:6px; line-height:1.15; }
        .svc-desc { font-size:13px; line-height:1.65; color:rgba(240,237,230,0.45); font-weight:300; max-width:480px; }
        .svc-arrow { opacity:0; transition:opacity 0.25s; padding-top:6px; color:#f47a21; }

        /* ── Portfolio ── */
        .port-grid { display:grid; grid-template-columns:1.55fr 1fr 1fr; grid-template-rows:300px 200px; gap:3px; }
        .port-grid .p-tall { grid-row:span 2; }
        .port-cell { overflow:hidden; position:relative; background:#111; }
        .port-cell img { width:100%; height:100%; object-fit:cover; display:block; filter:saturate(0.7); transition:filter 0.45s ease, transform 0.55s ease; }
        .port-cell:hover img { filter:saturate(1); transform:scale(1.04); }
        .port-badge { position:absolute; bottom:12px; left:12px; font-size:9px; letter-spacing:0.18em; text-transform:uppercase; color:rgba(240,237,230,0.6); opacity:0; transition:opacity 0.3s; background:rgba(12,12,12,0.65); padding:4px 10px; }
        .port-cell:hover .port-badge { opacity:1; }
        @media(max-width:680px){ .port-grid{grid-template-columns:1fr 1fr; grid-template-rows:auto;} .port-grid .p-tall{grid-row:auto;} .port-cell{height:200px;} }

        /* ── Quote ── */
        .quote-mark { font-family:'Cormorant Garamond',serif; font-size:clamp(72px,10vw,140px); color:rgba(244,122,33,0.14); line-height:1; }
        .quote-body { font-family:'Cormorant Garamond',serif; font-size:clamp(24px,3.8vw,44px); font-weight:400; line-height:1.3; color:#f0ede6; margin-bottom:28px; }
        .quote-body em { font-style:italic; color:rgba(240,237,230,0.5); }

        /* ── Rate sheet ── */
        .rate-head { display:grid; grid-template-columns:1.8fr 1fr 1fr 1.2fr; gap:0; padding-bottom:14px; border-bottom:2px solid rgba(255,255,255,0.1); }
        .rate-row { display:grid; grid-template-columns:1.8fr 1fr 1fr 1.2fr; gap:0; padding:18px 0; border-bottom:1px solid rgba(255,255,255,0.06); align-items:center; transition:background 0.2s, padding 0.2s; }
        .rate-row:hover { background:rgba(255,255,255,0.02); margin:0 -12px; padding:18px 12px; }
        .rate-row.hot { border-left:2px solid #f47a21; padding-left:14px; background:rgba(244,122,33,0.05); }
        .rate-row.hot:hover { margin-left:0; }
        .r-name { font-family:'Cormorant Garamond',serif; font-size:22px; color:#f0ede6; font-weight:400; }
        .r-tag { font-size:9px; letter-spacing:0.15em; text-transform:uppercase; color:#f47a21; display:block; margin-top:3px; }
        .r-price { font-size:18px; font-weight:300; color:#f0ede6; }
        .r-meta { font-size:13px; color:rgba(240,237,230,0.45); }
        @media(max-width:580px){ .rate-head,.rate-row{grid-template-columns:1fr 1fr;} .rate-head div:nth-child(3),.rate-head div:nth-child(4),.rate-row div:nth-child(3),.rate-row div:nth-child(4){display:none;} }

        /* ── Contact ── */
        .contact-grid { display:grid; grid-template-columns:1fr 1fr; gap:0; }
        @media(max-width:768px){ .contact-grid{grid-template-columns:1fr;} }
        .contact-left { padding:72px 52px 72px 0; border-right:1px solid rgba(255,255,255,0.07); }
        .contact-right { padding:72px 0 72px 52px; }
        @media(max-width:768px){ .contact-left{padding:52px 0; border-right:none; border-bottom:1px solid rgba(255,255,255,0.07);} .contact-right{padding:52px 0 72px;} }
        .cfield { display:flex; flex-direction:column; gap:7px; }
        .cfield label { font-size:9.5px; letter-spacing:0.22em; text-transform:uppercase; color:rgba(240,237,230,0.35); }
        .cfield input, .cfield select, .cfield textarea { background:transparent; border:none; border-bottom:1px solid rgba(255,255,255,0.12); color:#f0ede6; font-size:15px; padding:10px 0; font-family:'Inter',sans-serif; font-weight:300; outline:none; transition:border-color 0.2s; resize:none; width:100%; }
        .cfield input:focus, .cfield select:focus, .cfield textarea:focus { border-color:#f47a21; }
        .cfield select { cursor:pointer; }
        .cfield select option { background:#1a1a1a; }

        /* ── Footer ── */
        .footer-root { border-top:1px solid rgba(255,255,255,0.07); padding:60px 28px 28px; }
        .footer-top { display:flex; justify-content:space-between; align-items:flex-start; gap:48px; flex-wrap:wrap; margin-bottom:56px; }
        .footer-nav { display:flex; flex-direction:column; gap:10px; }
        .footer-nav a { font-size:13px; color:rgba(240,237,230,0.42); transition:color 0.2s; }
        .footer-nav a:hover { color:#f47a21; }
        .footer-bottom { border-top:1px solid rgba(255,255,255,0.06); padding-top:22px; display:flex; justify-content:space-between; flex-wrap:wrap; gap:10px; }

        /* ── WhatsApp float ── */
        .wa { position:fixed; bottom:16px; right:16px; z-index:9999; width:50px; height:50px; border-radius:50%; background:#128C7E; display:flex; align-items:center; justify-content:center; font-size:21px; box-shadow:0 4px 20px rgba(18,140,126,0.4); transition:transform 0.2s; }
        .wa:hover { transform:scale(1.1); }

        /* ── Phone ≤ 480px ── */
        @media(max-width:480px){
          .mx { padding:0 16px; }
          .hero-content { padding:72px 16px 40px; }
          .hero-h1 { font-size:clamp(38px,13vw,68px); }
          .hero-sub { font-size:15px; }
          .hero-btns { flex-direction:column; align-items:stretch; }
          .hero-btns a,.hero-btns .btn-fill { width:100%; justify-content:center; }
          .nums-grid { grid-template-columns:1fr 1fr; }
          .num-cell { padding:20px 14px; }
          .num-cell:nth-child(2){ border-right:none; }
          .about-text { padding:32px 16px; }
          .about-ghost { font-size:70px; }
          section#services { padding:52px 16px !important; }
          .svc-name { font-size:clamp(18px,5.5vw,26px); }
          .svc-row { grid-template-columns:24px 1fr 16px; gap:0 10px; padding:16px 0; }
          .port-grid { grid-template-columns:1fr; grid-template-rows:auto; }
          .port-cell,.port-grid .p-tall { height:55vw; grid-row:auto; }
          .rate-head,.rate-row { grid-template-columns:1fr 1fr; }
          .rate-head div:nth-child(3),.rate-head div:nth-child(4),
          .rate-row div:nth-child(3),.rate-row div:nth-child(4){ display:none; }
           .r-name { font-size:17px; }
           .contact-grid { grid-template-columns:1fr; }
          .contact-left { padding:44px 0; border-right:none; border-bottom:1px solid rgba(255,255,255,0.07); }
          .contact-right { padding:44px 0 60px; }
          .btn-fill { width:100%; justify-content:center; }
          .footer-root { padding:40px 16px 20px; }
          .footer-top { gap:24px; }
        }

        /* ── Tablet 481–768px ── */
        @media(min-width:481px) and (max-width:768px){
          .mx { padding:0 20px; }
          .hero-h1 { font-size:clamp(46px,10vw,82px); }
          .hero-btns { flex-wrap:wrap; justify-content:center; }
          .nums-grid { grid-template-columns:repeat(2,1fr); }
          .num-cell:nth-child(2){ border-right:none; }
          .about-grid { grid-template-columns:1fr; }
          .about-text { padding:48px 28px; }
          .about-img-wrap { min-height:360px; }
          .port-grid { grid-template-columns:1fr 1fr; grid-template-rows:auto; }
          .port-cell,.port-grid .p-tall { height:40vw; grid-row:auto; }
           section#services { padding:60px 20px !important; }
          .rate-head { grid-template-columns:1.5fr 1fr 1fr; }
          .rate-row  { grid-template-columns:1.5fr 1fr 1fr; }
          .rate-head div:nth-child(4),.rate-row div:nth-child(4){ display:none; }
        }

        /* ── Landscape / tablet 769–1024px ── */
        @media(min-width:769px) and (max-width:1024px){
          .nums-grid { grid-template-columns:repeat(2,1fr); }
          .num-cell:nth-child(2){ border-right:none; }
          .port-grid { grid-template-columns:1fr 1fr; grid-template-rows:auto; }
          .port-cell,.port-grid .p-tall { height:30vw; grid-row:auto; }
        }

        /* ── Touch devices: always show port badge, bigger tap targets ── */
        @media(hover:none) and (pointer:coarse){
          .port-badge { opacity:1; }
          .btn-fill,.btn-ghost-text { min-height:48px; }
          .svc-row:hover { padding-left:0; }
        }
      `}</style>

      <div className="ss-home">

        {/* ══ HERO ══════════════════════════════════════════════════════════ */}
        <section style={{ position: 'relative' }}>
          <div className="hero-root">
            <div className="hero-parallax" ref={heroImgRef}>
              <img src="/hero-bg.png" alt="Shyam Studio" loading="eager" />
            </div>
            <div className="hero-dim" />

            <div className="hero-content">
              <div className="hero-eyebrow">
                <span>Wedding</span>
                <span className="hero-dot" />
                <span>Portrait</span>
                <span className="hero-dot" />
                <span>Events</span>
              </div>

              <h1 className="hero-h1">
                Stories worth<br />
                <em>remembering.</em>
              </h1>

              <p className="hero-sub">
                Photography and films for weddings, families, brands, and the moments that matter.
              </p>

              <div className="hero-btns">
                <a href="#portfolio" className="btn-fill">View Portfolio <ArrowUpRight size={14} /></a>
                <a href="#contact" style={{ display:'inline-flex', alignItems:'center', gap:8, fontSize:'10.5px', letterSpacing:'0.17em', textTransform:'uppercase', color:'rgba(240,237,230,0.65)', border:'1px solid rgba(240,237,230,0.25)', padding:'13px 26px', transition:'all 0.2s' }}
                  onMouseOver={e=>(e.currentTarget.style.background='rgba(240,237,230,0.08)')} onMouseOut={e=>(e.currentTarget.style.background='transparent')}
                >Book a Session</a>
              </div>

              <div className="hero-scroll">
                <span>Scroll</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12l7 7 7-7"/></svg>
              </div>
            </div>
          </div>
        </section>

        {/* ══ TICKER ════════════════════════════════════════════════════════ */}
        <Ticker />

        {/* ══ NUMBERS ═══════════════════════════════════════════════════════ */}
        <div className="nums-grid">
          {[
            { n: 35, s: '+', label: 'Years doing this', sub: 'Since 1991' },
            { n: 1200, s: '+', label: 'Events photographed', sub: 'Across Vidarbha' },
            { n: 500, s: '+', label: 'Families served', sub: 'And counting' },
            { n: 4, s: '.9★', label: 'Google rating', sub: 'Verified reviews' },
          ].map((c, i) => (
            <div key={i} className={`num-cell reveal reveal-d${i + 1}`} ref={addReveal}>
              <div className="num-big"><Counter to={c.n} suffix={c.s} /></div>
              <div style={{ fontSize: 13, color: 'rgba(240,237,230,0.58)', marginBottom: 4 }}>{c.label}</div>
              <div className="label">{c.sub}</div>
            </div>
          ))}
        </div>

        {/* ══ ABOUT ═════════════════════════════════════════════════════════ */}
        <section id="about" className="about-grid">
          <div className="about-img-wrap reveal" ref={addReveal}>
            <img src="https://images.unsplash.com/photo-1606800052052-a08af7148866?auto=format&fit=crop&q=80&w=900" alt="Photographer at work" loading="lazy" />
            <div className="about-ghost">1991</div>
          </div>
          <div className="about-text">
            <div className="label reveal" ref={addReveal} style={{ marginBottom: 20 }}>Who we are</div>
            <h2 className="serif reveal reveal-d1" ref={addReveal} style={{ fontSize: 'clamp(38px,5.5vw,64px)', lineHeight: '0.92', color: '#f0ede6', marginBottom: 28 }}>
              A small team.<br />
              <em style={{ color: 'rgba(240,237,230,0.42)', fontStyle: 'italic' }}>Very serious</em><br />
              about this work.
            </h2>
            <p className="body-sm reveal reveal-d2" ref={addReveal} style={{ marginBottom: 18 }}>
              We started in Nagpur in 1991 — one camera, one lens, one wedding. Thirty-five years later we've worked at mandaps in Bhandewadi, on rooftops in Dharampeth, in farmhouses outside Wardha, and at venues we had never heard of before the booking call.
            </p>
            <p className="body-sm reveal reveal-d3" ref={addReveal} style={{ marginBottom: 36 }}>
              We do a limited number of weddings per year. If you want 47 photos of you pretending to look at each other dramatically — we are probably not the right fit. If you want us to actually be there and document something that happened — call us.
            </p>
            <a href="#contact" className="btn-ghost-text reveal reveal-d4" ref={addReveal}>See how to work with us →</a>
          </div>
        </section>

        {/* ══ SERVICES ══════════════════════════════════════════════════════ */}
        <section id="services" style={{ padding: '80px 28px', background: '#0f0f0f' }}>
          <div className="mx" style={{ padding: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 16, marginBottom: 44 }}>
              <div>
                <div className="label reveal" ref={addReveal} style={{ marginBottom: 12 }}>What we do</div>
                <h2 className="serif reveal reveal-d1" ref={addReveal} style={{ fontSize: 'clamp(36px,6vw,68px)', color: '#f0ede6' }}>Services</h2>
              </div>
              <div className="label reveal" ref={addReveal}>Six ways to work together</div>
            </div>

            {[
              { n: '01', name: 'Wedding Photography', desc: 'Full day. Ceremony, reception, the chaos in between. We stay until the last dance and the first goodbye.' },
              { n: '02', name: 'Cinematic Films', desc: 'Not a slideshow with music. An actual short film of your wedding day — proper sound, proper editing, proper emotion.' },
              { n: '03', name: 'Pre‑Wedding Shoots', desc: 'Before the chaos of the wedding, two people and a camera. Simple. Worth doing.' },
              { n: '04', name: 'Portrait Sessions', desc: 'Newborn, maternity, family, individual. Natural light. Your home or ours.' },
              { n: '05', name: 'Event Coverage', desc: 'Sangeet, engagement, corporate event, birthday. If it is happening, we can document it.' },
              { n: '06', name: 'Graphic Design & Print', desc: 'Invitation cards, wedding albums, business cards, banners. Design that does not look like a template.' },
            ].map((s, i) => (
              <div key={i} className="svc-row">
                <div className="svc-num">{s.n}</div>
                <div>
                  <div className="svc-name">{s.name}</div>
                  <div className="svc-desc">{s.desc}</div>
                </div>
                <div className="svc-arrow"><ArrowUpRight size={17} /></div>
              </div>
            ))}
          </div>
        </section>

        {/* ══ PORTFOLIO ═════════════════════════════════════════════════════ */}
        <section id="portfolio" style={{ background: '#0c0c0c' }}>
          <div style={{ padding: '72px 28px 28px' }}>
            <div className="mx" style={{ padding: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 16, marginBottom: 28 }}>
              <div>
                <div className="label" style={{ marginBottom: 10 }}>Selected work</div>
                <h2 className="serif" style={{ fontSize: 'clamp(36px,6vw,68px)', color: '#f0ede6' }}>Portfolio</h2>
              </div>
              <a href="#contact" className="btn-ghost-text">Enquire about a date →</a>
            </div>
          </div>
          <div className="port-grid" style={{ padding: '0 28px 72px' }}>
            {[
              { src: 'https://images.unsplash.com/photo-1606800052052-a08af7148866?auto=format&fit=crop&q=80&w=900', tag: 'Wedding', tall: true },
              { src: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&q=80&w=900', tag: 'Reception', tall: false },
              { src: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&q=80&w=900', tag: 'Ceremony', tall: false },
              { src: 'https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&q=80&w=900', tag: 'Portrait', tall: false },
              { src: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&q=80&w=900', tag: 'Pre‑Wedding', tall: false },
            ].map((p, i) => (
              <div key={i} className={`port-cell${p.tall ? ' p-tall' : ''}`}>
                <img src={p.src} alt={p.tag} loading="lazy" />
                <div className="port-badge">{p.tag}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ══ PULL QUOTE ════════════════════════════════════════════════════ */}
        <section style={{ padding: '80px 28px', background: '#0f0f0f' }}>
          <div className="mx" style={{ padding: 0 }}>
            <AnimatePresence mode="wait">
              <motion.div
                key={qi}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              >
                <div className="quote-mark">"</div>
                <p className="quote-body">{quotes[qi].text.replace(/\.$/, '')}.<em style={{ fontStyle: 'italic' }}> — {quotes[qi].author}</em></p>
                <div className="label" style={{ marginTop: 4 }}>{quotes[qi].event}</div>
              </motion.div>
            </AnimatePresence>
            <div style={{ display: 'flex', gap: 8, marginTop: 36 }}>
              {quotes.map((_, i) => (
                <button key={i} onClick={() => setQi(i)} style={{ width: i === qi ? 24 : 8, height: 8, borderRadius: 4, border: 'none', cursor: 'pointer', background: i === qi ? '#f47a21' : 'rgba(255,255,255,0.2)', transition: 'all 0.3s' }} />
              ))}
            </div>
          </div>
        </section>

        {/* ══ PACKAGES ══════════════════════════════════════════════════════ */}
        <section id="packages" style={{ padding: '80px 28px', background: '#0c0c0c' }}>
          <div className="mx" style={{ padding: 0 }}>
            <div style={{ marginBottom: 44 }}>
              <div className="label reveal" ref={addReveal} style={{ marginBottom: 12 }}>Pricing</div>
              <h2 className="serif reveal reveal-d1" ref={addReveal} style={{ fontSize: 'clamp(36px,6vw,68px)', color: '#f0ede6', marginBottom: 10 }}>What it costs</h2>
              <p className="body-sm reveal reveal-d2" ref={addReveal} style={{ maxWidth: 460 }}>Honest pricing. No "call us for a quote" mystery. Custom packages available for multi-day weddings. All prices include GST.</p>
            </div>

            <div className="rate-head">
              {['Package', 'Price', 'Duration', 'Deliverables'].map(h => (
                <div key={h} className="label">{h}</div>
              ))}
            </div>
            {[
              { name: 'Half Day', hot: false, price: '₹15,000', dur: '4 hours', del: '200+ edited photos' },
              { name: 'Full Day', hot: true, price: '₹28,000', dur: '10 hours', del: '500+ photos · highlight film' },
              { name: 'Premium', hot: false, price: '₹45,000', dur: 'Full day + reel', del: 'Photos · full film · album' },
              { name: 'Complete', hot: false, price: '₹65,000', dur: 'Multi-day', del: 'Everything · drone · engagement' },
            ].map((r, i) => (
              <div key={i} className={`rate-row${r.hot ? ' hot' : ''}`}>
                <div>
                  <div className="r-name">{r.name}</div>
                  {r.hot && <span className="r-tag">Most booked</span>}
                </div>
                <div className="r-price">{r.price}</div>
                <div className="r-meta">{r.dur}</div>
                <div className="r-meta">{r.del}</div>
              </div>
            ))}
            <div style={{ marginTop: 28, display: 'flex', gap: 24, alignItems: 'center', flexWrap: 'wrap' }}>
              <a href="#contact" className="btn-fill">Ask about your date <ArrowUpRight size={14} /></a>
              <p className="body-sm" style={{ fontSize: 12 }}>Travel charges apply outside Nagpur district.</p>
            </div>
          </div>
        </section>

        {/* ══ CONTACT ═══════════════════════════════════════════════════════ */}
        <section id="contact" style={{ background: '#0c0c0c' }}>
          <div className="mx">
            <div className="contact-grid">
              <div className="contact-left">
                <div className="label reveal" ref={addReveal} style={{ marginBottom: 22 }}>Get in touch</div>
                <h2 className="serif reveal reveal-d1" ref={addReveal} style={{ fontSize: 'clamp(34px,5vw,58px)', color: '#f0ede6', marginBottom: 28, lineHeight: '0.9' }}>
                  Your date<br />still open?
                </h2>
                <p className="body-sm reveal reveal-d2" ref={addReveal} style={{ marginBottom: 44, maxWidth: 360 }}>
                  We take on a limited number of weddings per year. Fill in the form and we'll come back to you within 24 hours.
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                  {[
                    { label: 'Phone / WhatsApp', val: '+91 7775854937\n+91 9404291477' },
                    { label: 'Owner (WhatsApp)', val: '+91 88559 06847', link: 'https://wa.me/918855906847' },
                    { label: 'Location', val: 'Nagpur, Maharashtra 440035' },
                    { label: 'Working hours', val: 'Mon–Sat, 10 am – 7 pm' },
                  ].map((c, i) => (
                    <div key={i} className={`reveal reveal-d${i + 1}`} ref={addReveal} style={{ paddingBottom: 22, borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                      <div className="label" style={{ marginBottom: 7 }}>{c.label}</div>
                      {c.link ? (
                        <a href={c.link} target="_blank" rel="noreferrer" style={{ fontSize: 15, color: 'rgba(240,237,230,0.68)', whiteSpace: 'pre-line', fontWeight: 300, textDecoration: 'none' }}>
                          {c.val}
                        </a>
                      ) : (
                        <div style={{ fontSize: 15, color: 'rgba(240,237,230,0.68)', whiteSpace: 'pre-line', fontWeight: 300 }}>{c.val}</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="contact-right">
                <div className="label" style={{ marginBottom: 32 }}>Send an enquiry</div>
                <form
                  style={{ display: 'flex', flexDirection: 'column', gap: 28 }}
                  onSubmit={e => { e.preventDefault(); alert("Thanks! We'll be in touch within 24 hours."); }}
                >
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                    <div className="cfield">
                      <label>Your name</label>
                      <input type="text" required placeholder="Rahul Sharma" />
                    </div>
                    <div className="cfield">
                      <label>Phone / WhatsApp</label>
                      <input type="tel" required placeholder="+91 98765 43210" />
                    </div>
                  </div>
                  <div className="cfield">
                    <label>Event date</label>
                    <input type="text" placeholder="e.g. March 2026, or not sure yet" />
                  </div>
                  <div className="cfield">
                    <label>Service</label>
                    <select>
                      <option>Wedding Photography</option>
                      <option>Wedding Film</option>
                      <option>Both (Photo + Film)</option>
                      <option>Pre-Wedding Shoot</option>
                      <option>Portrait Session</option>
                      <option>Event Coverage</option>
                      <option>Graphic Design</option>
                    </select>
                  </div>
                  <div className="cfield">
                    <label>Anything else</label>
                    <textarea rows={4} placeholder="Venue, vibe, requirements, or just say hello." />
                  </div>
                  <button type="submit" className="btn-fill" style={{ alignSelf: 'flex-start' }}>
                    Send message <ArrowUpRight size={14} />
                  </button>
                </form>
              </div>
            </div>
          </div>
        </section>

        {/* ══ FOOTER ════════════════════════════════════════════════════════ */}
        <footer className="footer-root" style={{ background: '#080808' }}>
          <div className="mx" style={{ padding: '0 28px' }}>
            <div className="footer-top">
              <div>
                <div className="serif" style={{ fontSize: 52, color: '#f0ede6', lineHeight: 1 }}>Shyam</div>
                <div className="serif" style={{ fontSize: 52, color: 'rgba(240,237,230,0.18)', lineHeight: 1 }}>Studio</div>
                <p className="body-sm" style={{ fontSize: 12, marginTop: 16, maxWidth: 240 }}>Photography & films. Nagpur, Maharashtra. Since 1991.</p>
              </div>
              <div style={{ display: 'flex', gap: 56, flexWrap: 'wrap' }}>
                <div>
                  <div className="label" style={{ marginBottom: 18 }}>Navigation</div>
                  <div className="footer-nav">
                    {['Home', 'About', 'Services', 'Portfolio', 'Packages', 'Contact'].map(l => (
                      <a key={l} href={`#${l.toLowerCase()}`}>{l}</a>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="label" style={{ marginBottom: 18 }}>Contact</div>
                  <div className="footer-nav">
                    <a href="https://wa.me/918855906847" target="_blank" rel="noreferrer" style={{ fontSize: 13, color: 'rgba(240,237,230,0.42)', textDecoration: 'none' }}>+91 88559 06847 (WhatsApp)</a>
                    <span style={{ fontSize: 13, color: 'rgba(240,237,230,0.42)' }}>+91 9404291477</span>
                    <a href="https://maps.app.goo.gl/ri3gfVGTidNvpqCr5" target="_blank" rel="noreferrer">Nagpur, MH →</a>
                  </div>
                </div>
              </div>
            </div>
            <div className="footer-bottom">
              <div className="label">© {new Date().getFullYear()} Shyam Studio. All rights reserved.</div>
              <div className="label">Photography · Films · Design · Nagpur</div>
            </div>
          </div>
        </footer>

        {/* WhatsApp float */}
        <a href="https://wa.me/917775854937?text=Hi%20Shyam%20Studio%2C%20I'd%20like%20to%20enquire." target="_blank" rel="noreferrer" className="wa" title="WhatsApp">💬</a>

      </div>
    </>
  );
}
