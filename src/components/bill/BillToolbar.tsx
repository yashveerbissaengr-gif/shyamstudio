import type React from "react";

interface BillToolbarProps {
	onEdit?: () => void;
	zoom: number;
	setZoom: React.Dispatch<React.SetStateAction<number>>;
	showWatermark: boolean;
	setShowWatermark: React.Dispatch<React.SetStateAction<boolean>>;
	downloading: boolean;
	onSendWhatsApp: () => void;
	onSave: () => void;
	onPrint: () => void;
	onDownloadPDF: () => void;
	onDownloadJPG: () => void;
}

export function BillToolbar({
	onEdit,
	zoom,
	setZoom,
	showWatermark,
	setShowWatermark,
	downloading,
	onSendWhatsApp,
	onSave,
	onPrint,
	onDownloadPDF,
	onDownloadJPG,
}: BillToolbarProps) {
	return (
		<div className="bill-toolbar">
			{onEdit && <button onClick={onEdit}>⬅ Edit Form</button>}
			<div className="sep" />
			<div className="zoom-ctl">
				<button onClick={() => setZoom((z) => Math.max(40, z - 10))}>−</button>
				<span style={{ minWidth: 40, textAlign: "center" }}>{zoom}%</span>
				<button onClick={() => setZoom((z) => Math.min(200, z + 10))}>+</button>
			</div>
			<div className="sep" />
			<button onClick={() => setShowWatermark((w) => !w)} title="Toggle watermark">
				{showWatermark ? "👁 WM" : "🚫 WM"}
			</button>

			<div style={{ marginLeft: "auto", display: "flex", gap: "8px", alignItems: "center" }}>
				<button className="bill-wa-btn" onClick={onSendWhatsApp}>
					💬 Send WA
				</button>
				<button className="bill-save-btn" onClick={onSave}>
					💾 Save to App
				</button>
				<button onClick={onPrint}>🖨 Print</button>

				{/* 2 Download Options: JPG & PDF */}
				<button
					className="bill-jpg-btn"
					style={{ background: "#2563eb", color: "#fff", fontWeight: "bold" }}
					disabled={downloading}
					onClick={onDownloadJPG}
				>
					{downloading ? "⏳..." : "🖼️ Download JPG"}
				</button>

				<button
					className="bill-dl-btn"
					disabled={downloading}
					onClick={onDownloadPDF}
				>
					{downloading ? "⏳..." : "📄 Download PDF"}
				</button>
			</div>
		</div>
	);
}
