import { ArrowUpRight } from "lucide-react";

export function Services({ addReveal }: { addReveal: (el: Element | null) => void }) {
	return (
		<section id="services" style={{ padding: "80px 28px", background: "#0f0f0f" }}>
			<div className="mx" style={{ padding: 0 }}>
				<div
					style={{
						display: "flex",
						justifyContent: "space-between",
						alignItems: "flex-end",
						flexWrap: "wrap",
						gap: 16,
						marginBottom: 44,
					}}
				>
					<div>
						<div className="label reveal" ref={addReveal} style={{ marginBottom: 12 }}>
							What we do
						</div>
						<h2
							className="serif reveal reveal-d1"
							ref={addReveal}
							style={{ fontSize: "clamp(36px,6vw,68px)", color: "#f0ede6" }}
						>
							Services
						</h2>
					</div>
					<div className="label reveal" ref={addReveal}>
						Six ways to work together
					</div>
				</div>

				{[
					{
						n: "01",
						name: "Wedding Photography",
						desc: "Full day. Ceremony, reception, the chaos in between. We stay until the last dance and the first goodbye.",
					},
					{
						n: "02",
						name: "Cinematic Films",
						desc: "Not a slideshow with music. An actual short film of your wedding day — proper sound, proper editing, proper emotion.",
					},
					{
						n: "03",
						name: "Pre‑Wedding Shoots",
						desc: "Before the chaos of the wedding, two people and a camera. Simple. Worth doing.",
					},
					{
						n: "04",
						name: "Portrait Sessions",
						desc: "Newborn, maternity, family, individual. Natural light. Your home or ours.",
					},
					{
						n: "05",
						name: "Event Coverage",
						desc: "Sangeet, engagement, corporate event, birthday. If it is happening, we can document it.",
					},
					{
						n: "06",
						name: "Graphic Design & Print",
						desc: "Invitation cards, wedding albums, business cards, banners. Design that does not look like a template.",
					},
				].map((s) => (
					<div key={s.n} className="svc-row">
						<div className="svc-num">{s.n}</div>
						<div>
							<div className="svc-name">{s.name}</div>
							<div className="svc-desc">{s.desc}</div>
						</div>
						<div className="svc-arrow">
							<ArrowUpRight size={17} />
						</div>
					</div>
				))}
			</div>
		</section>
	);
}
