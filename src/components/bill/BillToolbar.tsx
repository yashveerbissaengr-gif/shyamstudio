import type React from "react";

interface BillToolbarProps {
	onEdit?: () => void;
	showWatermark: boolean;
	setShowWatermark: React.Dispatch<React.SetStateAction<boolean>>;
	downloading: boolean;
	onSave: () => void;
	onPrint: () => void;
	onDownloadPDF: () => void;
	onDownloadJPG: () => void;
	status?: 'ACTIVE' | 'CANCELLED';
	isEditable?: boolean;
	onCancel?: () => void;
}

export function BillToolbar({
	onEdit,
	showWatermark,
	setShowWatermark,
	downloading,
	onSave,
	onPrint,
	onDownloadPDF,
	onDownloadJPG,
	status,
	isEditable = true,
	onCancel
}: BillToolbarProps) {
	return (
		<div className="bill-toolbar">
			{onEdit && <button onClick={onEdit}>⬅ Edit Form</button>}
			<div className="sep" />
			<button onClick={() => setShowWatermark((w) => !w)} title="Toggle watermark">
				{showWatermark ? "👁 WM" : "🚫 WM"}
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
