export function Footer() {
	return (
		<>
			<footer className="footer-root" style={{ background: "#080808" }}>
				<div className="mx" style={{ padding: "0 28px" }}>
					<div className="footer-top">
						<div>
							<div className="serif" style={{ fontSize: 52, color: "#f0ede6", lineHeight: 1 }}>
								Shyam
							</div>
							<div
								className="serif"
								style={{
									fontSize: 52,
									color: "rgba(240,237,230,0.18)",
									lineHeight: 1,
								}}
							>
								Studio
							</div>
							<p className="body-sm" style={{ fontSize: 12, marginTop: 16, maxWidth: 240 }}>
								Photography & films. Nagpur, Maharashtra. Since 1991.
							</p>
						</div>
						<div style={{ display: "flex", gap: 56, flexWrap: "wrap" }}>
							<div>
								<div className="label" style={{ marginBottom: 18 }}>
									Navigation
								</div>
								<div className="footer-nav">
									{["Home", "About", "Services", "Portfolio", "Packages", "Contact"].map((l) => (
										<a key={l} href={`#${l.toLowerCase()}`}>
											{l}
										</a>
									))}
								</div>
							</div>
							<div>
								<div className="label" style={{ marginBottom: 18 }}>
									Contact
								</div>
								<div className="footer-nav">
									<a
										href="https://wa.me/918855906847"
										target="_blank"
										rel="noreferrer"
										style={{
											fontSize: 13,
											color: "rgba(240,237,230,0.42)",
											textDecoration: "none",
										}}
									>
										+91 88559 06847 (WhatsApp)
									</a>
									<span style={{ fontSize: 13, color: "rgba(240,237,230,0.42)" }}>
										+91 9404291477
									</span>
									<a
										href="https://maps.app.goo.gl/ri3gfVGTidNvpqCr5"
										target="_blank"
										rel="noreferrer"
									>
										Nagpur, MH →
									</a>
								</div>
							</div>
						</div>
					</div>
					<div className="footer-bottom">
						<div className="label">
							© {new Date().getFullYear()} Shyam Studio. All rights reserved.
						</div>
						<div className="label">Photography · Films · Design · Nagpur</div>
					</div>
				</div>
			</footer>

			{/* WhatsApp float */}
			<a
				href="https://wa.me/917775854937?text=Hi%20Shyam%20Studio%2C%20I'd%20like%20to%20enquire."
				target="_blank"
				rel="noreferrer"
				className="wa"
				title="WhatsApp"
			>
				💬
			</a>
		</>
	);
}
