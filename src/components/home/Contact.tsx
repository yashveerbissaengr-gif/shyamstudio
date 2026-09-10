import { ArrowUpRight } from "lucide-react";

export function Contact({ addReveal }: { addReveal: (el: Element | null) => void }) {
	return (
		<section id="contact" style={{ background: "#0c0c0c" }}>
			<div className="mx">
				<div className="contact-grid">
					<div className="contact-left">
						<div className="label reveal" ref={addReveal} style={{ marginBottom: 22 }}>
							Get in touch
						</div>
						<h2
							className="serif reveal reveal-d1"
							ref={addReveal}
							style={{
								fontSize: "clamp(34px,5vw,58px)",
								color: "#f0ede6",
								marginBottom: 28,
								lineHeight: "0.9",
							}}
						>
							Your date
							<br />
							still open?
						</h2>
						<p
							className="body-sm reveal reveal-d2"
							ref={addReveal}
							style={{ marginBottom: 44, maxWidth: 360 }}
						>
							We take on a limited number of weddings per year. Fill in the form and we'll come back
							to you within 24 hours.
						</p>
						<div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
							{[
								{
									label: "Phone / WhatsApp",
									val: "+91 7775854937\n+91 9404291477",
								},
								{
									label: "Owner (WhatsApp)",
									val: "+91 88559 06847",
									link: "https://wa.me/918855906847",
								},
								{ label: "Location", val: "Nagpur, Maharashtra 440035" },
								{ label: "Working hours", val: "Mon–Sat, 10 am – 7 pm" },
							].map((c, i) => (
								<div
									key={c.label}
									className={`reveal reveal-d${i + 1}`}
									ref={addReveal}
									style={{
										paddingBottom: 22,
										borderBottom: "1px solid rgba(255,255,255,0.07)",
									}}
								>
									<div className="label" style={{ marginBottom: 7 }}>
										{c.label}
									</div>
									{c.link ? (
										<a
											href={c.link}
											target="_blank"
											rel="noreferrer"
											style={{
												fontSize: 15,
												color: "rgba(240,237,230,0.68)",
												whiteSpace: "pre-line",
												fontWeight: 300,
												textDecoration: "none",
											}}
										>
											{c.val}
										</a>
									) : (
										<div
											style={{
												fontSize: 15,
												color: "rgba(240,237,230,0.68)",
												whiteSpace: "pre-line",
												fontWeight: 300,
											}}
										>
											{c.val}
										</div>
									)}
								</div>
							))}
						</div>
					</div>

					<div className="contact-right">
						<div className="label" style={{ marginBottom: 32 }}>
							Send an enquiry
						</div>
						<form
							style={{ display: "flex", flexDirection: "column", gap: 28 }}
							onSubmit={(e) => {
								e.preventDefault();
								alert("Thanks! We'll be in touch within 24 hours.");
							}}
						>
							<div
								style={{
									display: "grid",
									gridTemplateColumns: "1fr 1fr",
									gap: 24,
								}}
							>
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
							<button type="submit" className="btn-fill" style={{ alignSelf: "flex-start" }}>
								Send message <ArrowUpRight size={14} />
							</button>
						</form>
					</div>
				</div>
			</div>
		</section>
	);
}
