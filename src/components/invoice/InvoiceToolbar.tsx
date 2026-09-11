import { Link } from "react-router-dom";


function exec(cmd: string, value?: string) {
	document.execCommand(cmd, false, value);
}

interface InvoiceToolbarProps {
	zoom: number;
	setZoom: (val: number | ((prev: number) => number)) => void;
	onNewDoc: () => void;
	onSave: () => void;
	onPrint: () => void;
	onDownloadPDF: () => void;
	onDownloadJPG: () => void;
	downloading: boolean;
	status?: 'ACTIVE' | 'CANCELLED';
	isEditable?: boolean;
	onCancel?: () => void;
}

export function InvoiceToolbar({
	zoom,
	setZoom,
	onNewDoc,
	onSave,
	onPrint,
	onDownloadPDF,
	onDownloadJPG,
	downloading,
	status,
	isEditable = true,
	onCancel
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
				{status === 'CANCELLED' && (
					<span className="bg-red-100 text-red-700 text-xs font-bold px-2 py-1 rounded uppercase tracking-wider">
						Cancelled
					</span>
				)}
				{status !== 'CANCELLED' && !isEditable && (
					<span className="bg-yellow-100 text-yellow-700 text-xs font-bold px-2 py-1 rounded uppercase tracking-wider">
						Locked
					</span>
				)}
				{status !== 'CANCELLED' && isEditable && (
					<span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded uppercase tracking-wider">
						Editable
					</span>
				)}

				{isEditable && status !== 'CANCELLED' && (
					<button className="bill-save-btn" onClick={onSave}>
						💾 Save to App
					</button>
				)}
				
				{!isEditable && status !== 'CANCELLED' && onCancel && (
					<button style={{ background: "#dc2626", color: "#fff", fontWeight: "bold", padding: "6px 12px", borderRadius: "4px", border: "none", cursor: "pointer" }} onClick={onCancel}>
						❌ Cancel Document
					</button>
				)}

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
