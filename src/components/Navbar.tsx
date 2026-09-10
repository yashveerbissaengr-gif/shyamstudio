import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const navLinks = [
	{ label: "Home", href: "#home" },
	{ label: "About", href: "#about" },
	{ label: "Services", href: "#services" },
	{ label: "Portfolio", href: "#portfolio" },
	{ label: "Packages", href: "#packages" },
	{ label: "Contact", href: "#contact" },
];

export default function Navbar() {
	const [scrolled, setScrolled] = useState(false);
	const [open, setOpen] = useState(false);

	useEffect(() => {
		const fn = () => setScrolled(window.scrollY > 60);
		window.addEventListener("scroll", fn, { passive: true });
		return () => window.removeEventListener("scroll", fn);
	}, []);

	return (
		<>
			<style>{`
        .nav-root {
          position: fixed; top: 0; left: 0; right: 0; z-index: 100;
          transition: background 0.35s, padding 0.35s, backdrop-filter 0.35s, border-color 0.35s;
        }
        .nav-root.scrolled {
          background: rgba(10,10,10,0.88);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(255,255,255,0.07);
        }
        .nav-inner {
          max-width: 1200px; margin: 0 auto;
          padding: 0 16px;
          display: flex; align-items: center; justify-content: space-between;
          height: 64px;
        }
        @media(min-width:640px){ .nav-inner{ padding:0 24px; height:72px; } }
        .nav-logo { display: flex; flex-direction: column; text-decoration: none; gap: 1px; }
        .nav-logo-main {
          font-family: 'Cormorant Garamond', Georgia, serif;
          font-size: 22px; font-weight: 700; letter-spacing: 0.12em;
          color: #fafaf7; line-height: 1;
        }
        .nav-logo-sub {
          font-family: 'Inter', Arial, sans-serif;
          font-size: 9px; letter-spacing: 0.25em; color: rgba(250,250,247,0.5);
          text-transform: uppercase;
        }
        .nav-links { display: flex; align-items: center; gap: 32px; }
        .nav-link {
          font-size: 10.5px; letter-spacing: 0.18em; text-transform: uppercase;
          color: rgba(250,250,247,0.75); text-decoration: none;
          transition: color 0.2s; position: relative; padding-bottom: 2px;
        }
        .nav-link::after {
          content: ''; position: absolute; bottom: -2px; left: 0;
          width: 0; height: 1px; background: #f47a21;
          transition: width 0.3s;
        }
        .nav-link:hover { color: #fafaf7; }
        .nav-link:hover::after { width: 100%; }
        .nav-hamburger {
          background: none; border: none; cursor: pointer;
          color: #fafaf7; padding: 8px; display: none;
          min-width: 48px; min-height: 48px;
          display: none; align-items: center; justify-content: center;
        }
        @media (max-width: 900px) {
          .nav-links { display: none !important; }
          .nav-hamburger { display: flex !important; }
        }
        .mob-link {
          font-size: clamp(22px, 7vw, 32px); font-family: 'Cormorant Garamond', Georgia, serif;
          color: #fafaf7; text-decoration: none; letter-spacing: 0.06em;
          border-bottom: 1px solid rgba(255,255,255,0.08); padding-bottom: 18px;
          transition: color 0.2s; min-height: 48px; display: flex; align-items: center;
        }
        .mob-link:hover { color: #f47a21; }
      `}</style>

			<nav className={`nav-root${scrolled ? " scrolled" : ""}`}>
				<div className="nav-inner">
					<Link to="/" className="nav-logo">
						<span className="nav-logo-main">SHYAM</span>
						<span className="nav-logo-sub">Studio · Nagpur</span>
					</Link>

					<div className="nav-links">
						{navLinks.map((l) =>
							l.href.startsWith("#") ? (
								<a key={l.label} href={l.href} className="nav-link">
									{l.label}
								</a>
							) : (
								<Link key={l.label} to={l.href} className="nav-link">
									{l.label}
								</Link>
							),
						)}
					</div>

					<button
						className="nav-hamburger"
						onClick={() => setOpen((o) => !o)}
						aria-label="Toggle navigation menu"
					>
						{open ? <X size={22} /> : <Menu size={22} />}
					</button>
				</div>
			</nav>

			{open && (
				<div className="mob-menu">
					{navLinks.map((l) =>
						l.href.startsWith("#") ? (
							<a key={l.label} href={l.href} className="mob-link" onClick={() => setOpen(false)}>
								{l.label}
							</a>
						) : (
							<Link key={l.label} to={l.href} className="mob-link" onClick={() => setOpen(false)}>
								{l.label}
							</Link>
						),
					)}
				</div>
			)}
		</>
	);
}
