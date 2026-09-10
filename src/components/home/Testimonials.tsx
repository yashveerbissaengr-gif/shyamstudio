import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";

const quotes = [
	{
		text: "I didn't expect to cry watching our wedding film. I expected to cringe. Shyam Studio made me do the former.",
		author: "Ankita & Vikas",
		event: "Dec 2025",
	},
	{
		text: "They were invisible on the day itself. Somehow that made everything in the photos more real.",
		author: "Priya Ramteke",
		event: "Oct 2025",
	},
	{
		text: "My mother said the album looks like a magazine. My father said it cost less than he expected. Both true.",
		author: "Rohan & Shruti",
		event: "Mar 2025",
	},
];

export function Testimonials() {
	const [qi, setQi] = useState(0);
	useEffect(() => {
		const t = setInterval(() => setQi((n) => (n + 1) % quotes.length), 6000);
		return () => clearInterval(t);
	}, []);

	return (
		<section style={{ padding: "80px 28px", background: "#0f0f0f" }}>
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
						<p className="quote-body">
							{quotes[qi].text.replace(/\.$/, "")}.
							<em style={{ fontStyle: "italic" }}> — {quotes[qi].author}</em>
						</p>
						<div className="label" style={{ marginTop: 4 }}>
							{quotes[qi].event}
						</div>
					</motion.div>
				</AnimatePresence>
				<div style={{ display: "flex", gap: 8, marginTop: 36 }}>
					{quotes.map((quote, i) => (
						<button
							key={quote.author}
							onClick={() => setQi(i)}
							style={{
								width: i === qi ? 24 : 8,
								height: 8,
								borderRadius: 4,
								border: "none",
								cursor: "pointer",
								background: i === qi ? "#f47a21" : "rgba(255,255,255,0.2)",
								transition: "all 0.3s",
							}}
						/>
					))}
				</div>
			</div>
		</section>
	);
}
