import { useEffect, useRef, useState } from "react";

function Counter({ to, suffix = "" }: { to: number; suffix?: string }) {
	const [val, setVal] = useState(0);
	const elRef = useRef<HTMLSpanElement>(null);
	const started = useRef(false);
	useEffect(() => {
		const el = elRef.current;
		if (!el) return;
		const io = new IntersectionObserver(
			([e]) => {
				if (!e.isIntersecting || started.current) return;
				started.current = true;
				const dur = 1200;
				const start = performance.now();
				const tick = (now: number) => {
					const p = Math.min((now - start) / dur, 1);
					const ease = 1 - (1 - p) ** 3;
					setVal(Math.round(ease * to));
					if (p < 1) requestAnimationFrame(tick);
				};
				requestAnimationFrame(tick);
			},
			{ threshold: 0.4 },
		);
		io.observe(el);
		return () => io.disconnect();
	}, [to]);
	return (
		<span ref={elRef}>
			{val}
			{suffix}
		</span>
	);
}

export function Stats({ addReveal }: { addReveal: (el: Element | null) => void }) {
	return (
		<div className="nums-grid">
			{[
				{ n: 35, s: "+", label: "Years doing this", sub: "Since 1991" },
				{
					n: 1200,
					s: "+",
					label: "Events photographed",
					sub: "Across Vidarbha",
				},
				{ n: 500, s: "+", label: "Families served", sub: "And counting" },
				{ n: 4, s: ".9★", label: "Google rating", sub: "Verified reviews" },
			].map((c, i) => (
				<div key={c.label} className={`num-cell reveal reveal-d${i + 1}`} ref={addReveal}>
					<div className="num-big">
						<Counter to={c.n} suffix={c.s} />
					</div>
					<div
						style={{
							fontSize: 13,
							color: "rgba(240,237,230,0.58)",
							marginBottom: 4,
						}}
					>
						{c.label}
					</div>
					<div className="label">{c.sub}</div>
				</div>
			))}
		</div>
	);
}
