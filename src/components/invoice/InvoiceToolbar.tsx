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
	downloading: boolean;
	status?: 'ACTIVE' | 'CANCELLED';
	isEditable?: boolean;
	onCancel?: () => void;
	// WhatsApp actions
	onWABooked?: () => void;
	onWAReady?: () => void;
	onWACollected?: () => void;
}

export function InvoiceToolbar({
	zoom,
	setZoom,
	onNewDoc,
	onSave,
	onPrint,
	onDownloadPDF,
	downloading,
	status,
	isEditable = true,
	onCancel,
	onWABooked,
	onWAReady,
	onWACollected,
}: InvoiceToolbarProps) {
	return (
		<div className="inv-toolbar-wrap no-print">
			{/* ── ROW 1: Navigation + WhatsApp Status Buttons ── */}
			<div className="inv-toolbar inv-toolbar-row1">
				<Link
					to="/dashboard"
					style={{ textDecoration: 'none', color: '#163a4a', fontWeight: 'bold', flexShrink: 0, whiteSpace: 'nowrap' }}
				>
					⬅ Dashboard
				</Link>

				<div className="sep" />

				{/* WA Status Buttons — always visible in row 1 */}
				<span style={{ fontSize: '10px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '.05em', flexShrink: 0 }}>
					Send:
				</span>
				{onWABooked && (
					<button
						className="bill-wa-btn"
						style={{ padding: '4px 12px', borderRadius: '999px', fontSize: '11px', fontWeight: 700, flexShrink: 0, minHeight: '28px' }}
						onClick={onWABooked}
						title="Send invoice PDF via WhatsApp"
					>
						📄 Booked
					</button>
				)}
				{onWAReady && (
					<button
						className="bill-wa-btn"
						style={{ background: '#059669', padding: '4px 12px', borderRadius: '999px', fontSize: '11px', fontWeight: 700, flexShrink: 0, minHeight: '28px' }}
						onClick={onWAReady}
						title="Send invoice PDF via WhatsApp"
					>
						📄 Ready
					</button>
				)}
				{onWACollected && (
					<button
						className="bill-wa-btn"
						style={{ background: '#047857', padding: '4px 12px', borderRadius: '999px', fontSize: '11px', fontWeight: 700, flexShrink: 0, minHeight: '28px' }}
						onClick={onWACollected}
						title="Send invoice PDF via WhatsApp"
					>
						📄 Collected
					</button>
				)}

				<div className="sep" />

				{/* Editable / Locked / Cancelled badge */}
				{status === 'CANCELLED' && (
					<span className="bg-red-100 text-red-700 text-xs font-bold px-2 py-1 rounded uppercase tracking-wider" style={{ flexShrink: 0 }}>
						Cancelled
					</span>
				)}
				{status !== 'CANCELLED' && !isEditable && (
					<span className="bg-yellow-100 text-yellow-700 text-xs font-bold px-2 py-1 rounded uppercase tracking-wider" style={{ flexShrink: 0 }}>
						Locked
					</span>
				)}
				{status !== 'CANCELLED' && isEditable && (
					<span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded uppercase tracking-wider" style={{ flexShrink: 0 }}>
						Editable
					</span>
				)}

				{isEditable && status !== 'CANCELLED' && (
					<button className="bill-save-btn" onClick={onSave} style={{ flexShrink: 0 }}>
						💾 Save
					</button>
				)}

				{!isEditable && status !== 'CANCELLED' && onCancel && (
					<button
						style={{ background: '#dc2626', color: '#fff', fontWeight: 'bold', padding: '4px 10px', borderRadius: '4px', border: 'none', cursor: 'pointer', flexShrink: 0 }}
						onClick={onCancel}
					>
						❌ Cancel
					</button>
				)}
			</div>

			{/* ── ROW 2: Formatting + Zoom + Actions ── */}
			<div className="inv-toolbar inv-toolbar-row2">
				<button title="Bold" onClick={() => exec("bold")}><b>B</b></button>
				<button title="Italic" onClick={() => exec("italic")}><i>I</i></button>
				<button title="Underline" onClick={() => exec("underline")}><u>U</u></button>
				<div className="sep" />
				<button onClick={() => exec("justifyLeft")} aria-label="Align left">⬅</button>
				<button onClick={() => exec("justifyCenter")} aria-label="Align center">≡</button>
				<button onClick={() => exec("justifyRight")} aria-label="Align right">➡</button>
				<div className="sep" />
				<div className="zoom-ctl">
					<button onClick={() => setZoom((z) => Math.max(30, z - 10))} aria-label="Zoom out">−</button>
					<span style={{ minWidth: 38, textAlign: "center", fontSize: '11px' }}>{zoom}%</span>
					<button onClick={() => setZoom((z) => Math.min(200, z + 10))} aria-label="Zoom in">+</button>
				</div>
				<div className="sep" />
				<button onClick={onNewDoc} title="New Invoice" style={{ flexShrink: 0 }}>🗋 New</button>
				<div className="sep" />
				<button className="bill-print-btn" onClick={onPrint} style={{ flexShrink: 0 }}>🖨 Print</button>
				<button
					className="dl-btn"
					style={{ flexShrink: 0, background: '#2563eb' }}
					disabled={downloading}
					onClick={onDownloadPDF}
				>
					{downloading ? '⏳' : '📄 Download PDF'}
				</button>
			</div>
		</div>
	);
}
