export function Portfolio() {
	return (
		<section id="portfolio" style={{ background: "#0c0c0c" }}>
			<div style={{ padding: "72px 28px 28px" }}>
				<div
					className="mx"
					style={{
						padding: 0,
						display: "flex",
						justifyContent: "space-between",
						alignItems: "flex-end",
						flexWrap: "wrap",
						gap: 16,
						marginBottom: 28,
					}}
				>
					<div>
						<div className="label" style={{ marginBottom: 10 }}>
							Selected work
						</div>
						<h2 className="serif" style={{ fontSize: "clamp(36px,6vw,68px)", color: "#f0ede6" }}>
							Portfolio
						</h2>
					</div>
					<a href="#contact" className="btn-ghost-text">
						Enquire about a date →
					</a>
				</div>
			</div>
			<div className="port-grid" style={{ padding: "0 28px 72px" }}>
				{[
					{
						src: "https://images.unsplash.com/photo-1606800052052-a08af7148866?auto=format&fit=crop&q=80&w=900",
						tag: "Wedding",
						tall: true,
					},
					{
						src: "https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&q=80&w=900",
						tag: "Reception",
						tall: false,
					},
					{
						src: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&q=80&w=900",
						tag: "Ceremony",
						tall: false,
					},
					{
						src: "https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&q=80&w=900",
						tag: "Portrait",
						tall: false,
					},
					{
						src: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&q=80&w=900",
						tag: "Pre‑Wedding",
						tall: false,
					},
				].map((p) => (
					<div key={p.tag} className={`port-cell${p.tall ? " p-tall" : ""}`}>
						<img src={p.src} alt={p.tag} loading="lazy" />
						<div className="port-badge">{p.tag}</div>
					</div>
				))}
			</div>
		</section>
	);
}
