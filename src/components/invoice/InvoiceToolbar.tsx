import type React from "react";
import { Link } from "react-router-dom";

function exec(cmd: string, value?: string) {
	document.execCommand(cmd, false, value);
}

interface InvoiceToolbarProps {
	zoom: number;
	setZoom: React.Dispatch<React.SetStateAction<number>>;
	onNewDoc: () => void;
	onSendWhatsApp: () => void;
	onSave: () => void;
	onPrint: () => void;
	onDownloadPDF: () => void;
	onDownloadJPG: () => void;
	downloading: boolean;
}

export function InvoiceToolbar({
	zoom,
	setZoom,
	onNewDoc,
	onSendWhatsApp,
	onSave,
	onPrint,
	onDownloadPDF,
	onDownloadJPG,
	downloading,
}: InvoiceToolbarProps) {
	return (
		<div className="inv-toolbar">
			<Link to="/dashboard" style={{ textDecoration: 'none', color: '#163a4a', fontWeight: 'bold', marginRight: '8px' }}>⬅ Dashboard</Link>
			<div className="sep" />
			<button title="Bold" onClick={() => exec("bold")}>
				<b>B</b>
			</button>
			<button title="Italic" onClick={() => exec("italic")}>
				<i>I</i>
			</button>
			<button title="Underline" onClick={() => exec("underline")}>
				<u>U</u>
			</button>
			<div className="sep" />
			<button onClick={() => exec("justifyLeft")} aria-label="Align left">
				⬅
			</button>
			<button onClick={() => exec("justifyCenter")} aria-label="Align center">
				≡
			</button>
			<button onClick={() => exec("justifyRight")} aria-label="Align right">
				➡
			</button>
			<div className="sep" />
			<div className="zoom-ctl">
				<button onClick={() => setZoom((z) => Math.max(40, z - 10))} aria-label="Zoom out">
					−
				</button>
				<span style={{ minWidth: 40, textAlign: "center" }}>{zoom}%</span>
				<button onClick={() => setZoom((z) => Math.min(200, z + 10))} aria-label="Zoom in">
					+
				</button>
			</div>
			<div className="sep" />
			<button onClick={onNewDoc} title="New Invoice">
				🗋 New
			</button>

			<div style={{ marginLeft: "auto", display: "flex", gap: "8px", alignItems: "center" }}>
				<button className="bill-wa-btn" onClick={onSendWhatsApp}>
					💬 Send WA
				</button>
				<button className="bill-save-btn" onClick={onSave}>
					💾 Save to App
				</button>
				<button className="bill-print-btn" onClick={onPrint}>
					🖨 Print
				</button>

				{/* 2 Download Options: JPG & PDF */}
				<button
					style={{ background: "#2563eb", color: "#fff", fontWeight: "bold", padding: "6px 12px", borderRadius: "4px", border: "none", cursor: "pointer" }}
					disabled={downloading}
					onClick={onDownloadJPG}
				>
					{downloading ? "⏳..." : "🖼️ Download JPG"}
				</button>

				<button className="dl-btn" disabled={downloading} onClick={onDownloadPDF}>
					{downloading ? "⏳..." : "📄 Download PDF"}
				</button>
			</div>
		</div>
	);
}
