import type React from "react";
import type { Row, ScheduleRow } from "../../types/invoice";

const PREDEFINED_SERVICES = [
	"Candid photo shoot",
	"Candid video shoot",
	"Drone shoot",
	"Portrait photo shoot",
	"Traditional photo & video",
	"Pre-wedding shoot",
	"Crane",
	"LED wall",
	"Live shoot",
	"Projector",
];

const PREDEFINED_FNS = [
	"Wedding",
	"Reception",
	"Haldi",
	"Sangeet",
	"Mehendi",
	"Flower holi",
	"Thread ceremony",
	"Janeu",
	"Birthday",
	"Ring ceremony",
	"Engagement",
	"Pre wedding",
	"Reel",
];

interface InvoicePage1Props {
	invoiceNo: string;
	date: string;
	customerName: string;
	setCustomerName?: React.Dispatch<React.SetStateAction<string>>;
	customerMobile: string;
	setCustomerMobile?: React.Dispatch<React.SetStateAction<string>>;
	showSchedule: boolean;
	setShowSchedule?: React.Dispatch<React.SetStateAction<boolean>>;
	schedule: ScheduleRow[];
	setSchedule?: React.Dispatch<React.SetStateAction<ScheduleRow[]>>;
	showServiceDetails: boolean;
	setShowServiceDetails?: React.Dispatch<React.SetStateAction<boolean>>;
	items: Row[];
	setItems?: React.Dispatch<React.SetStateAction<Row[]>>;
	recalcItem?: (id: string, field: keyof Row, val: string) => void;
	subtotal: number;
	uid: () => string;
	readOnly?: boolean;
}

const rupees = (n: number) => `₹${n.toLocaleString("en-IN")}`;

export function InvoicePage1({
	invoiceNo,
	date,
	customerName,
	setCustomerName,
	customerMobile,
	setCustomerMobile,
	showSchedule,
	setShowSchedule,
	schedule,
	setSchedule,
	showServiceDetails,
	setShowServiceDetails,
	items,
	setItems,
	recalcItem,
	subtotal,
	uid,
	readOnly,
}: InvoicePage1Props) {
	return (
		<div className="a4-page">
			<datalist id="fn-options">
				{PREDEFINED_FNS.map((opt) => (
					<option key={opt} value={opt} />
				))}
			</datalist>

			<div className="inv-header">
				<div className="inv-studio-name">
					<span>SHYAM STUDIO</span>
				</div>
				<div className="inv-studio-sub">
					<span>Photography · Videography · Events</span>
				</div>
				<div className="inv-studio-addr">
					<span>Bhandewadi R.L.Y. Station Road, Near Samta Nagar, Nagpur – 440035</span>
					&nbsp;|&nbsp;
					<span>📞 88559 06847 / 70203 40680</span>
				</div>
			</div>

			<div className="inv-booking-label">
				<span>Order Booking Memo</span>
			</div>

			{/* Bill No / Date */}
			<div className="inv-meta-row">
				<div className="inv-meta-cell">
					<b>
						<span>Invoice No.</span>
					</b>
					&nbsp;
					<span className="editable-line">
						SS-{new Date().getFullYear()}-{invoiceNo}
					</span>
				</div>
				<div className="inv-meta-cell">
					<b>
						<span>Date</span>
					</b>
					&nbsp;
					<span>{date}</span>
				</div>
			</div>

			{/* Customer info */}
			<table className="info-table">
				<tbody>
					<tr>
						<td>
							<span>Customer</span>
						</td>
						<td>
							{readOnly ? (
								<span>{customerName}</span>
							) : (
								<input
									className="doc-input"
									value={customerName}
									onChange={(e) => setCustomerName?.(e.target.value)}
									placeholder="Enter Customer Name"
								/>
							)}
						</td>
					</tr>
					<tr>
						<td>
							<span>Mobile</span>
						</td>
						<td>
							{readOnly ? (
								<span>{customerMobile}</span>
							) : (
								<input
									className="doc-input"
									value={customerMobile}
									onChange={(e) => setCustomerMobile?.(e.target.value)}
									placeholder="Enter Mobile Number"
								/>
							)}
						</td>
					</tr>
					{[
						["Bride / Groom", "Pooja Ramteke / Rahul Sharma"],
						["Address", "Deep Nagar, Bhandewadi, Pardi, Nagpur"],
						["Birth date", "15 Apr 1998 / 22 Jun 1996"],
						["Birth place", "Nagpur / Nagpur"],
						["Occupation", "Software Engg. / Civil Engg."],
						["Email ID", "akshay@example.com"],
					].map(([l, v]) => (
						<tr key={l}>
							<td>
								<span>{l}</span>
							</td>
							<td>
								{l === "Birth date" && !readOnly ? (
									<div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
										<input
											type="date"
											className="doc-input"
											style={{ flex: 1 }}
											onKeyDown={(e) => e.preventDefault()}
										/>
										<span>/</span>
										<input
											type="date"
											className="doc-input"
											style={{ flex: 1 }}
											onKeyDown={(e) => e.preventDefault()}
										/>
									</div>
								) : (
									<span contentEditable={!readOnly} suppressContentEditableWarning>
										{v}
									</span>
								)}
							</td>
						</tr>
					))}
				</tbody>
			</table>

			{/* Function Schedule */}
			<div className="no-print" style={{ marginBottom: showSchedule ? 0 : 16, marginTop: 16 }}>
				<button
					onClick={() => setShowSchedule?.(!showSchedule)}
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
					{showSchedule ? "▼ Hide Function Schedule" : "▶ Show Function Schedule"}
				</button>
			</div>

			{showSchedule && (
				<>
					<div className="inv-section-head">
						<span>Function Schedule</span>
					</div>
					<table className="doc-table">
						<thead>
							<tr>
								{["Time", "Function", "Date", "Venue"].map((h) => (
									<th key={h}>
										<span>{h}</span>
									</th>
								))}
								<th style={{ width: 24, background: "#163a4a" }} className="no-print" />
							</tr>
						</thead>
						<tbody>
							{schedule.map((row) => (
								<tr key={row.id}>
									{(["time", "fn", "date", "venue"] as const).map((f) => (
										<td key={f}>
											{f === "fn" ? (
												<input
													list="fn-options"
													className="doc-input"
													value={row[f]}
													onChange={(e) =>
														setSchedule?.((prev) =>
															prev.map((r) => (r.id === row.id ? { ...r, fn: e.target.value } : r)),
														)
													}
													placeholder="Select or type..."
													aria-label="Function name"
													readOnly={readOnly}
												/>
											) : f === "time" ? (
												<input
													type="time"
													className="doc-input"
													value={row[f]}
													onChange={(e) =>
														setSchedule?.((prev) =>
															prev.map((r) => (r.id === row.id ? { ...r, time: e.target.value } : r)),
														)
													}
													onKeyDown={(e) => e.preventDefault()}
													readOnly={readOnly}
												/>
											) : f === "date" ? (
												<input
													type="date"
													className="doc-input"
													value={row[f] ? row[f].split("/").reverse().join("-") : ""}
													onChange={(e) => {
														const val = e.target.value;
														const [y, m, d] = val.split("-");
														const formatted = val ? `${d}/${m}/${y}` : "";
														setSchedule?.((prev) =>
															prev.map((r) => (r.id === row.id ? { ...r, date: formatted } : r)),
														);
													}}
													onKeyDown={(e) => e.preventDefault()}
													readOnly={readOnly}
												/>
											) : (
												<span
													contentEditable={!readOnly}
													suppressContentEditableWarning
													onBlur={(e) => {
														const val = e.currentTarget.innerText;
														setSchedule?.((prev) =>
															prev.map((r) =>
																r.id === row.id ? { ...r, [f]: val } : r,
															),
														);
													}}
												>
													{row[f]}
												</span>
											)}
										</td>
									))}
									<td style={{ textAlign: "center" }} className="no-print">
										<button
											className="doc-del-row"
											onClick={() => setSchedule?.((prev) => prev.filter((r) => r.id !== row.id))}
											aria-label="Delete schedule row"
										>
											✕
										</button>
									</td>
								</tr>
							))}
						</tbody>
					</table>
					<button
						className="doc-add-row"
						onClick={() =>
							setSchedule?.((prev) => [
								...prev,
								{ id: uid(), time: "", fn: "", date: "", venue: "" },
							])
						}
					>
						+ Add Row
					</button>
				</>
			)}

			{/* Service Details */}
			<div
				className="no-print"
				style={{ marginBottom: showServiceDetails ? 0 : 16, marginTop: 16 }}
			>
				<button
					onClick={() => setShowServiceDetails?.(!showServiceDetails)}
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
					{showServiceDetails ? "▼ Hide Service Details" : "▶ Show Service Details"}
				</button>
			</div>

			{showServiceDetails && (
				<>
					<div className="inv-section-head">
						<span>Service Details</span>
					</div>
					<table className="items-table">
						<thead>
							<tr>
								<th className="desc-cell">
									<span>Description</span>
								</th>
								<th className="num-cell">
									<span>Qty.</span>
								</th>
								<th className="money-cell">
									<span>Rate</span>
								</th>
								<th className="money-cell">
									<span>Amount</span>
								</th>
								<th style={{ width: 24, background: "#2c7a7b" }} className="no-print" />
							</tr>
						</thead>
						<tbody>
							{items.map((row) => (
								<tr key={row.id}>
									<td className="desc-cell" style={{ position: "relative" }}>
										<div className="no-print" style={{ position: "absolute", top: 6, right: 6 }}>
											<select
												className="doc-input"
												style={{
													width: 20,
													height: 20,
													cursor: "pointer",
													background: "rgba(44, 122, 123, 0.1)",
													borderRadius: 4,
													textAlign: "center",
													appearance: "none",
													padding: 0,
												}}
												title="Add predefined service"
												onChange={(e) => {
													if (e.target.value) {
														const newDesc = row.desc
															? row.desc + "\n" + e.target.value
															: e.target.value;
														recalcItem?.(row.id, "desc", newDesc);
														e.target.value = "";
													}
												}}
											>
												<option value="">▼</option>
												{PREDEFINED_SERVICES.map((s) => (
													<option key={s} value={s}>
														{s}
													</option>
												))}
											</select>
										</div>
										<span
											contentEditable
											suppressContentEditableWarning
											style={{
												whiteSpace: "pre-wrap",
												display: "block",
												minHeight: "1.5em",
												paddingRight: 28,
											}}
											onBlur={(e) => recalcItem?.(row.id, "desc", e.currentTarget.innerText)}
										>
											{row.desc}
										</span>
									</td>
									<td className="num-cell">
										<span
											contentEditable
											suppressContentEditableWarning
											onBlur={(e) => recalcItem?.(row.id, "qty", e.currentTarget.innerText)}
										>
											{row.qty}
										</span>
									</td>
									<td className="money-cell">
										<span
											contentEditable
											suppressContentEditableWarning
											onBlur={(e) =>
												recalcItem?.(row.id, "rate", e.currentTarget.innerText.replace(/[₹,]/g, ""))
											}
										>
											₹{row.rate}
										</span>
									</td>
									<td className="money-cell">
										₹{parseFloat(row.amount).toLocaleString("en-IN") || "0"}
									</td>
									<td style={{ textAlign: "center" }} className="no-print">
										<button
											className="doc-del-row"
											onClick={() => setItems?.((prev) => prev.filter((r) => r.id !== row.id))}
											aria-label="Delete item row"
										>
											✕
										</button>
									</td>
								</tr>
							))}
							<tr className="subtotal-row">
								<td colSpan={3} style={{ textAlign: "right" }}>
									<span>Subtotal</span>
								</td>
								<td className="money-cell">{rupees(subtotal)}</td>
								<td className="no-print" />
							</tr>
							<tr className="subtotal-row">
								<td colSpan={3} style={{ textAlign: "right" }}>
									<span>Advance</span>
								</td>
								<td className="money-cell">
									<span contentEditable suppressContentEditableWarning data-placeholder="₹0">
										₹0
									</span>
								</td>
								<td className="no-print" />
							</tr>
							<tr className="subtotal-row">
								<td colSpan={3} style={{ textAlign: "right" }}>
									<span>Balance</span>
								</td>
								<td className="money-cell">
									<span contentEditable suppressContentEditableWarning data-placeholder="₹0">
										{rupees(subtotal)}
									</span>
								</td>
								<td className="no-print" />
							</tr>
						</tbody>
					</table>
					<button
						className="doc-add-row"
						onClick={() =>
							setItems?.((prev) => [
								...prev,
								{ id: uid(), desc: "", qty: "1", rate: "0", amount: "0" },
							])
						}
					>
						+ Add Item
					</button>
				</>
			)}

			{/* Payment Terms */}
			<div className="inv-section-head">
				<span>Payment Terms</span>
			</div>
			<div className="terms-box">
				<p contentEditable={!readOnly} suppressContentEditableWarning style={{ display: "block", margin: 0 }}>
					50% ADVANCE ON BOOKING{"\n"}25% ON FIRST SHOOTING DAY{"\n"}25% AGAINST DELIVERY
				</p>
			</div>

			{/* Bank Details */}
			<div className="inv-section-head">
				<span>Bank Details</span>
			</div>
			<table className="bank-table info-table">
				<tbody>
					{[
						["Bank", "Punjab National Bank"],
						["Account name", "Ritu N. Rokade"],
						["A/c no.", "51842121008558"],
						["IFSC", "PUNB0513910"],
						["Mobile", "8855906847"],
					].map(([l, v]) => (
						<tr key={l}>
							<td>
								<span>{l}</span>
							</td>
							<td>
								<span contentEditable suppressContentEditableWarning>
									{v}
								</span>
							</td>
						</tr>
					))}
				</tbody>
			</table>

			{/* Note */}
			<div className="note-box">
				<b>
					<span>Note: </span>
				</b>
				<span contentEditable={!readOnly} suppressContentEditableWarning>
					All services are subject to availability. Advance amount is non-refundable in case of
					cancellation.
				</span>
			</div>
		</div>
	);
}
