export function About({ addReveal }: { addReveal: (el: Element | null) => void }) {
	return (
		<section id="about" className="about-grid">
			<div className="about-img-wrap reveal" ref={addReveal}>
				<img
					src="https://images.unsplash.com/photo-1606800052052-a08af7148866?auto=format&fit=crop&q=80&w=900"
					alt="Photographer at work"
					loading="lazy"
				/>
				<div className="about-ghost">1991</div>
			</div>
			<div className="about-text">
				<div className="label reveal" ref={addReveal} style={{ marginBottom: 20 }}>
					Who we are
				</div>
				<h2
					className="serif reveal reveal-d1"
					ref={addReveal}
					style={{
						fontSize: "clamp(38px,5.5vw,64px)",
						lineHeight: "0.92",
						color: "#f0ede6",
						marginBottom: 28,
					}}
				>
					A small team.
					<br />
					<em style={{ color: "rgba(240,237,230,0.42)", fontStyle: "italic" }}>Very serious</em>
					<br />
					about this work.
				</h2>
				<p className="body-sm reveal reveal-d2" ref={addReveal} style={{ marginBottom: 18 }}>
					We started in Nagpur in 1991 — one camera, one lens, one wedding. Thirty-five years later
					we've worked at mandaps in Bhandewadi, on rooftops in Dharampeth, in farmhouses outside
					Wardha, and at venues we had never heard of before the booking call.
				</p>
				<p className="body-sm reveal reveal-d3" ref={addReveal} style={{ marginBottom: 36 }}>
					We do a limited number of weddings per year. If you want 47 photos of you pretending to
					look at each other dramatically — we are probably not the right fit. If you want us to
					actually be there and document something that happened — call us.
				</p>
				<a href="#contact" className="btn-ghost-text reveal reveal-d4" ref={addReveal}>
					See how to work with us →
				</a>
			</div>
		</section>
	);
}
