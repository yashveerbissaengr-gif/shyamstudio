import { ArrowUpRight } from "lucide-react";
import { useEffect, useRef } from "react";

export function Hero() {
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
		window.addEventListener("scroll", onScroll, { passive: true });
		return () => {
			window.removeEventListener("scroll", onScroll);
			cancelAnimationFrame(raf);
		};
	}, []);

	return (
		<section style={{ position: "relative" }}>
			<div className="hero-root">
				<div className="hero-parallax" ref={heroImgRef}>
					<img src="/hero-bg.png" alt="Shyam Photo Studio" loading="eager" />
				</div>
				<div className="hero-dim" />

				<div className="hero-content">
					{/* Category Eyebrow */}
					<div className="hero-eyebrow">
						<span>WEDDING</span>
						<span className="hero-dot" />
						<span>PORTRAIT</span>
						<span className="hero-dot" />
						<span>EVENTS</span>
					</div>

					{/* Main Headline */}
					<h1 className="hero-h1">
						Shyam Photo
						<br />
						<em>Studio.</em>
					</h1>

					{/* Clean Subtitle */}
					<p className="hero-sub">
						Photography and films for weddings, families, brands, and the moments that matter.
					</p>

					{/* Action Buttons */}
					<div className="hero-btns">
						<a href="#portfolio" className="btn-fill">
							View Portfolio <ArrowUpRight size={14} />
						</a>
						<a href="#contact" className="btn-outline-hero">
							Book a Session
						</a>
					</div>

					{/* Scroll Indicator */}
					<div className="hero-scroll">
						<span>Scroll</span>
						<svg
							width="14"
							height="14"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="2"
						>
							<path d="M12 5v14M5 12l7 7 7-7" />
						</svg>
					</div>
				</div>
			</div>
		</section>
	);
}
