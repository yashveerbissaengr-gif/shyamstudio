import type React from "react";
import type { PaymentMethod } from "../../types/invoice";

interface InvoicePage3Props {
	showPaymentMethod: boolean;
	setShowPaymentMethod?: React.Dispatch<React.SetStateAction<boolean>>;
	payMethods: PaymentMethod[];
	setPayMethods?: React.Dispatch<React.SetStateAction<PaymentMethod[]>>;
	uid: () => string;
	readOnly?: boolean;
}

export function InvoicePage3({
	showPaymentMethod,
	setShowPaymentMethod,
	payMethods,
	setPayMethods,
	uid,
	readOnly,
}: InvoicePage3Props) {
	return (
		<div className="a4-page">
			<div className="inv-header">
				<div className="inv-studio-name">
					<span>SHYAM STUDIO</span>
				</div>
				<div className="inv-studio-sub">
					<span>Photography · Videography · Events</span>
				</div>
			</div>

			<div className="no-print" style={{ marginBottom: showPaymentMethod ? 0 : 16, marginTop: 16 }}>
				<button
					onClick={() => setShowPaymentMethod?.(!showPaymentMethod)}
					style={{
						background: "transparent",
						color: "#2c7a7b",
						padding: "4px 8px",
						borderRadius: "4px",
						border: "1px dashed #2c7a7b",
						cursor: "pointer",
						fontSize: "9pt",
						fontWeight: 600,
					}}
				>
					{showPaymentMethod ? "▼ Hide Payment Options" : "▶ Show Payment Options"}
				</button>
			</div>

			{showPaymentMethod && (
				<>
					<div className="inv-section-head">
						<span>Payment Options</span>
					</div>
					<div style={{ marginBottom: 20 }}>
						{payMethods.map((pm) => (
							<div
								key={pm.id}
								style={{
									display: "flex",
									alignItems: "center",
									gap: 12,
									marginBottom: 12,
								}}
							>
								<input
									type="checkbox"
									checked={pm.checked}
									onChange={() =>
										setPayMethods?.((prev) =>
											prev.map((m) => (m.id === pm.id ? { ...m, checked: !m.checked } : m)),
										)
									}
									style={{
										width: 18,
										height: 18,
										cursor: "pointer",
										accentColor: "#163a4a",
									}}
								/>
								<span
									contentEditable
									suppressContentEditableWarning
									style={{
										fontSize: "11pt",
										color: pm.checked ? "#163a4a" : "#52636d",
										fontWeight: pm.checked ? 600 : 400,
									}}
									onBlur={(e) => {
										const newLabel = e.currentTarget.innerText;
										setPayMethods?.((prev) =>
											prev.map((p) =>
												p.id === pm.id ? { ...p, label: newLabel } : p,
											),
										);
									}}
								>
									{pm.label}
								</span>
								<button
									className="doc-del-row"
									onClick={() => setPayMethods?.((prev) => prev.filter((m) => m.id !== pm.id))}
									aria-label="Delete payment method"
								>
									✕
								</button>
							</div>
						))}
						<button
							className="doc-add-row"
							onClick={() =>
								setPayMethods?.((prev) => [...prev, { id: uid(), label: "", checked: true }])
							}
						>
							+ Add Option
						</button>
					</div>
				</>
			)}

			{/* Bank details */}
			<div className="inv-section-head">
				<span>Bank Details</span>
			</div>
			<table className="info-table">
				<tbody>
					{[
						["Account name", "Ritu N. Rokade"],
						["Account number", "51842121008558"],
						["IFSC", "PUNB0513910"],
						["Mobile", "8855906847"],
					].map(([l, v]) => (
						<tr key={l}>
							<td>
								<span>{l}</span>
							</td>
							<td>
								<span contentEditable={!readOnly} suppressContentEditableWarning>
									{v}
								</span>
							</td>
						</tr>
					))}
				</tbody>
			</table>

			{/* Signature */}
			<div style={{ display: "flex", justifyContent: "flex-end", marginTop: 60 }}>
				<div style={{ textAlign: "center" }}>
					<div className="sig-line" />
					<div style={{ fontSize: "9.5pt", color: "#52636d", marginTop: 4 }}>
						<span>Authorized Signature</span>
					</div>
					<div
						style={{
							fontSize: "9pt",
							color: "#163a4a",
							fontWeight: 600,
							marginTop: 2,
						}}
					>
						<span>Shyam Studio</span>
					</div>
				</div>
			</div>

			<div className="thanks-msg">
				<span>✦ Thank you for choosing Shyam Studio! ✦</span>
			</div>
		</div>
	);
}
