const tickerItems = [
	"Wedding Photography",
	"Cinematic Films",
	"Pre‑Wedding Shoots",
	"Event Coverage",
	"Portrait Sessions",
	"Graphic Design",
	"Based in Nagpur",
];

export function Ticker() {
	const row = [...tickerItems, ...tickerItems].join("   ✦   ");
	return (
		<div
			style={{
				overflow: "hidden",
				borderTop: "1px solid rgba(255,255,255,0.08)",
				borderBottom: "1px solid rgba(255,255,255,0.08)",
				padding: "13px 0",
				userSelect: "none",
			}}
		>
			<style>{`
        @keyframes ticker { from { transform: translateX(0) } to { transform: translateX(-50%) } }
        .ticker-inner { display: inline-block; white-space: nowrap; animation: ticker 30s linear infinite; will-change: transform; }
      `}</style>
			<div className="ticker-inner">
				<span
					style={{
						fontSize: 10,
						letterSpacing: "0.22em",
						textTransform: "uppercase",
						color: "rgba(240,237,230,0.38)",
						padding: "0 32px",
					}}
				>
					{row}
				</span>
				<span
					style={{
						fontSize: 10,
						letterSpacing: "0.22em",
						textTransform: "uppercase",
						color: "rgba(240,237,230,0.38)",
						padding: "0 32px",
					}}
				>
					{row}
				</span>
			</div>
		</div>
	);
}
