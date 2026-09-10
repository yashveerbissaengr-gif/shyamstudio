import { useCallback, useEffect, useRef } from "react";
import { About } from "../components/home/About";
import { Contact } from "../components/home/Contact";
import { Footer } from "../components/home/Footer";
import { Hero } from "../components/home/Hero";
import { Portfolio } from "../components/home/Portfolio";
import { Services } from "../components/home/Services";
import { Stats } from "../components/home/Stats";
import { Testimonials } from "../components/home/Testimonials";
import { Ticker } from "../components/home/Ticker";

export default function Home() {
	/* Scroll-reveal utility — simple CSS class toggle */
	const revealRefs = useRef<Element[]>([]);
	const addReveal = useCallback((el: Element | null) => {
		if (el && !revealRefs.current.includes(el)) revealRefs.current.push(el);
	}, []);

	useEffect(() => {
		const io = new IntersectionObserver(
			(entries) => {
				entries.forEach((e) => {
					if (e.isIntersecting) {
						(e.target as HTMLElement).classList.add("revealed");
						io.unobserve(e.target);
					}
				});
			},
			{ threshold: 0.08 },
		);
		revealRefs.current.forEach((el) => io.observe(el));
		return () => io.disconnect();
	}, []);

	return (
		<>
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
        .hero-parallax img { width:100%; height:100%; object-fit:cover; object-position:center; display:block; filter: brightness(0.85) contrast(1.05); }
        .hero-dim {
          position:absolute; inset:0;
          background: linear-gradient(to bottom, rgba(12,12,12,0.65) 0%, rgba(12,12,12,0.3) 45%, rgba(12,12,12,0.85) 100%);
        }
        .hero-content {
          position:relative; z-index:2; height:100%;
          display:flex; flex-direction:column; align-items:center; justify-content:center;
          text-align:center; padding: 80px 24px 48px;
        }
        .hero-eyebrow {
          display:inline-flex; align-items:center; gap:10px;
          font-size:11px; letter-spacing:0.28em; text-transform:uppercase;
          color:#f47a21; font-weight:600; margin-bottom:24px;
        }
        .hero-dot { width:4px; height:4px; border-radius:50%; background:#f47a21; }
        
        .hero-h1 {
          font-family: 'Cormorant Garamond', Georgia, serif;
          font-size: clamp(54px, 9vw, 116px);
          font-weight: 400;
          line-height: 0.92;
          color: #f0ede6;
          margin-bottom: 24px;
          text-shadow: 0 4px 24px rgba(0,0,0,0.85);
        }
        .hero-h1 em { font-style: italic; color: #f47a21; }
        
        .hero-sub { font-size:clamp(15px,1.8vw,18px); font-weight:300; color:rgba(240,237,230,0.82); max-width:540px; line-height:1.7; margin-bottom:40px; text-shadow: 0 2px 10px rgba(0,0,0,0.8); }
        .hero-btns { display:flex; gap:14px; flex-wrap:wrap; justify-content:center; align-items:center; }
        
        .btn-outline-hero {
          display:inline-flex; align-items:center; gap:8px;
          font-size:10.5px; letter-spacing:0.17em; text-transform:uppercase; font-weight:500;
          color:rgba(240,237,230,0.9);
          border:1px solid rgba(240,237,230,0.3);
          padding:13px 26px; text-decoration:none; transition:all 0.2s ease;
        }
        .btn-outline-hero:hover {
          background:rgba(240,237,230,0.1);
          border-color:rgba(240,237,230,0.6);
        }

        .hero-scroll { position:absolute; bottom:28px; left:50%; transform:translateX(-50%); display:flex; flex-direction:column; align-items:center; gap:6px; color:rgba(240,237,230,0.35); font-size:9px; letter-spacing:0.2em; text-transform:uppercase; animation:scrollbounce 2.5s ease-in-out infinite; }
        @keyframes scrollbounce { 0%,100%{transform:translateX(-50%) translateY(0)} 50%{transform:translateX(-50%) translateY(7px)} }

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
				<Hero />
				<Ticker />
				<Stats addReveal={addReveal} />
				<About addReveal={addReveal} />
				<Services addReveal={addReveal} />
				<Portfolio />
				<Testimonials />
				<Contact addReveal={addReveal} />
				<Footer />
			</div>
		</>
	);
}
