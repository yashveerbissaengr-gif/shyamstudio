import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BillForm } from "../components/bill/BillForm";
import { BillToolbar } from "../components/bill/BillToolbar";
import { storage } from "../services/storage";
import type { BillData, BillItem } from "../types/invoice";
import { downloadAsJPG, downloadAsPDF } from "../utils/downloadHelper";

const uid = () => crypto.randomUUID();

const predefinedOptions = [
	"Photo frame",
	"Passport size photo",
	"Printout",
	"Lamination",
	"Other (Custom)",
];
const watermarkText = "Shyam Graphic Designer\nShyam Graphic Designer";

export function BillGenerator() {
	const navigate = useNavigate();
	const docRef = useRef<HTMLDivElement>(null);

	// View states
	const [mode, setMode] = useState<"form" | "preview">("form");
	const [downloading, setDownloading] = useState(false);
	const [zoom, setZoom] = useState(150);

	// Form Data
	const [id] = useState(uid);
	const [billNo] = useState(() => storage.getNextBillNumber());
	const [date] = useState(() => new Date().toLocaleDateString("en-GB"));
	const [customerName, setCustomerName] = useState("");
	const [customerMobile, setCustomerMobile] = useState("");
	const [customerAddress, setCustomerAddress] = useState("");
	const [details, setDetails] = useState("");
	const [advance, setAdvance] = useState<number>(0);
	const [discount, setDiscount] = useState<number>(0);
	const [showWatermark, setShowWatermark] = useState(true);

	// Predefined Items logic
	const [selectedOptions, setSelectedOptions] = useState<Record<string, boolean>>({});
	const [itemQuantities, setItemQuantities] = useState<Record<string, string>>({});
	const [itemAmounts, setItemAmounts] = useState<Record<string, string>>({});
	const [itemDescriptions, setItemDescriptions] = useState<Record<string, string>>({});
	const [isItemsExpanded, setIsItemsExpanded] = useState(false);

	const calculateSubTotal = () => {
		let t = 0;
		predefinedOptions.forEach((opt) => {
			if (selectedOptions[opt]) {
				t += parseFloat(itemAmounts[opt]) || 0;
			}
		});
		return t;
	};

	const subTotal = calculateSubTotal();
	const total = subTotal - discount;
	const balance = total - advance;

	const getItemsForPreview = (): BillItem[] => {
		const items: BillItem[] = [];
		let sr = 1;
		predefinedOptions.forEach((opt) => {
			if (selectedOptions[opt]) {
				const customDesc = itemDescriptions[opt] || "";
				const desc =
					opt === "Other (Custom)" ? customDesc : customDesc ? `${opt} - ${customDesc}` : opt;
				items.push({
					id: uid(),
					sr: String(sr++),
					desc: desc,
					qty: itemQuantities[opt] || "1",
					rate: "", // Not strictly needed if amount is given directly
					amount: itemAmounts[opt] || "0",
				});
			}
		});
		return items;
	};

	const saveSilently = () => {
		const data: BillData = {
			id,
			billNo,
			date,
			customerName,
			customerMobile,
			customerAddress,
			details,
			items: getItemsForPreview(),
			advance,
			discount,
			balance,
			total,
			watermarkText,
			showWatermark,
			createdAt: Date.now(),
		};
		storage.saveBill(data);
	};

	// Removed auto-save useEffect to prevent accidental saving of blank documents

	const handleSave = () => {
		saveSilently();
		alert("Bill saved successfully!");
		navigate("/dashboard");
	};

	const handleDownloadPDF = async () => {
		saveSilently();
		if (!docRef.current) return;
		setDownloading(true);
		try {
			await downloadAsPDF(docRef.current, `bill_${billNo}.pdf`);
		} catch (e) {
			console.error(e);
			alert("Failed to generate PDF");
		} finally {
			setDownloading(false);
		}
	};

	const handleDownloadJPG = async () => {
		saveSilently();
		if (!docRef.current) return;
		setDownloading(true);
		try {
			await downloadAsJPG(docRef.current, `bill_${billNo}.jpg`);
		} catch (e) {
			console.error(e);
			alert("Failed to generate JPG");
		} finally {
			setDownloading(false);
		}
	};

	const handleSendWhatsApp = async () => {
		saveSilently();
		let targetMobile = customerMobile;
		if (!targetMobile) {
			const input = prompt("Please enter the customer's WhatsApp number:");
			if (!input) return;
			targetMobile = input;
		}

		// Clean mobile number (keep only digits)
		let cleanMobile = targetMobile.replace(/\D/g, "");
		if (cleanMobile.length === 10) {
			cleanMobile = "91" + cleanMobile; // Assume India if 10 digits
		}
		
		const message = `Hello ${customerName ? customerName : "Customer"},\n\nYour bill details from Shyam Studio:\nBill No: ${billNo}\nDate: ${date}\nSub Total: ₹${subTotal}\nDiscount: ₹${discount}\nTotal Amount: ₹${total}\nAdvance: ₹${advance}\nBalance: ₹${balance}\n\nThank you!`;

		const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
		
		// Open new tab immediately to prevent browser popup blockers on desktop
		let waWindow: Window | null = null;
		if (!isMobile) {
			waWindow = window.open("", "_blank");
			if (waWindow) {
				waWindow.document.write("Generating PDF and preparing WhatsApp... please wait.");
			}
		}

		setDownloading(true);
		try {
			if (docRef.current) {
				const html2pdf = (await import("html2pdf.js")).default;
				const opt = {
					margin: 0,
					filename: `bill_${billNo}.pdf`,
					image: { type: "jpeg" as const, quality: 0.98 },
					html2canvas: { scale: 2, useCORS: true },
					jsPDF: { unit: "mm", format: "a4", orientation: "portrait" as const },
				};

				const pdfBlob = (await html2pdf().set(opt).from(docRef.current).output("blob")) as Blob;
				const file = new File([pdfBlob], `bill_${billNo}.pdf`, {
					type: "application/pdf",
				});

				// Upload to R2 Cloud Storage
				try {
					const formData = new FormData();
					formData.append("file", file);
					formData.append("filename", `bill_${billNo}_${Date.now()}.pdf`);
					fetch("/api/upload", { method: "POST", body: formData })
						.then((res) => console.log("R2 backup initiated", res.status))
						.catch((err) => console.error("R2 backup failed", err));
				} catch (uploadErr) {
					console.error("R2 backup error:", uploadErr);
				}

				// Try native share for mobile devices
				if (isMobile && navigator.canShare && navigator.canShare({ files: [file] })) {
					try {
						await navigator.share({
							files: [file],
							title: `Bill ${billNo}`,
							text: message,
						});
						setDownloading(false);
						return; // Successfully shared using native UI
					} catch (err) {
						console.log("Native share cancelled or failed:", err);
					}
				}

				// Fallback (Desktop or failed mobile share)
				const url = URL.createObjectURL(pdfBlob);
				const a = document.createElement("a");
				a.href = url;
				a.download = `bill_${billNo}.pdf`;
				a.click();
				URL.revokeObjectURL(url);
			}
		} catch (e) {
			console.error("Failed to generate PDF for WhatsApp:", e);
			if (waWindow) waWindow.close();
		} finally {
			setDownloading(false);
		}

		const encoded = encodeURIComponent(message);
		const waUrl = `https://wa.me/${cleanMobile}?text=${encoded}`;
		
		if (waWindow) {
			waWindow.location.href = waUrl;
		} else {
			window.open(waUrl, "_blank");
		}
	};

	if (mode === "form") {
		return (
			<BillForm
				billNo={billNo}
				date={date}
				customerName={customerName}
				setCustomerName={setCustomerName}
				customerMobile={customerMobile}
				setCustomerMobile={setCustomerMobile}
				customerAddress={customerAddress}
				setCustomerAddress={setCustomerAddress}
				isItemsExpanded={isItemsExpanded}
				setIsItemsExpanded={setIsItemsExpanded}
				selectedOptions={selectedOptions}
				setSelectedOptions={setSelectedOptions}
				itemDescriptions={itemDescriptions}
				setItemDescriptions={setItemDescriptions}
				itemQuantities={itemQuantities}
				setItemQuantities={setItemQuantities}
				itemAmounts={itemAmounts}
				setItemAmounts={setItemAmounts}
				details={details}
				setDetails={setDetails}
				subTotal={subTotal}
				discount={discount}
				setDiscount={setDiscount}
				total={total}
				advance={advance}
				setAdvance={setAdvance}
				balance={balance}
				onPreview={() => {
					saveSilently();
					setMode("preview");
				}}
			/>
		);
	}

	// PREVIEW MODE
	const previewItems = getItemsForPreview();

	const renderBill = (index: number) => (
		<main className="bill" key={index}>
			{showWatermark && (
				<div className="watermark" aria-hidden="true">
					<span style={{ whiteSpace: "pre-wrap" }}>{watermarkText}</span>
				</div>
			)}
			<div className="content">
				<h1 className="brand">
					<span>Shyam Graphic Designer</span>
				</h1>
				<div className="header-rule"></div>
				<div className="address">
					<span>
						PLAT NO. 1, SHOP NO. 3 BALAJI NAGAR, NEAR BY- BHAWANI HOSPITEL OPPOSITE
						<br />
						PUNAPU ROAD, PARDI NAGPUR. 35 &nbsp;&nbsp;&nbsp; MO. 7775854937, 9404291477
					</span>
				</div>
				<div className="meta">
					<span style={{ display: "inline-flex", alignItems: "baseline", gap: "3px" }}>
						<span>No.</span>
						<span
							style={{
								display: "inline-block",
								borderBottom: "1px solid #dc2626",
								padding: "0 5px 1px",
								color: "#dc2626",
								fontWeight: "bold",
								fontSize: "10px",
								minWidth: "30px",
								textAlign: "center",
							}}
						>
							{billNo}
						</span>
					</span>
					<span style={{ display: "inline-flex", alignItems: "baseline", gap: "3px" }}>
						<span>Date :-</span>
						<span
							style={{
								display: "inline-block",
								borderBottom: "1px solid #111",
								padding: "0 5px 1px",
								fontWeight: "bold",
								minWidth: "55px",
								textAlign: "center",
							}}
						>
							{date}
						</span>
					</span>
				</div>
				<section className="fields" aria-label="Customer details">
					<div className="field">
						<span className="label">Name :-</span>
						<span className="line" style={{ padding: "0 4px" }}>
							{customerName}
						</span>
						<span className="label">Mo.</span>
						<span className="line short" style={{ padding: "0 4px" }}>
							{customerMobile}
						</span>
					</div>
					<div className="field">
						<span className="label">Address :-</span>
						<span className="line" style={{ padding: "0 4px" }}>
							{customerAddress}
						</span>
					</div>
				</section>
				<table className="bill-table" aria-label="Bill items">
					<thead>
						<tr>
							<th>Sr</th>
							<th>Description</th>
							<th>Qty</th>
							<th>Rate</th>
							<th>Amount</th>
						</tr>
					</thead>
					<tbody>
						<tr>
							<td style={{ padding: "4px 2px", textAlign: "center" }}>
								{previewItems.map((row) => (
									<div key={row.id}>{row.sr}</div>
								))}
							</td>
							<td className="notes">
								<div style={{ padding: "4px 2px" }}>
									{previewItems.map((row) => (
										<div key={row.id}>{row.desc}</div>
									))}
									{details && (
										<div
											style={{
												marginTop: "8px",
												whiteSpace: "pre-wrap",
											}}
										>
											{details}
										</div>
									)}
								</div>
							</td>
							<td style={{ padding: "4px 2px", textAlign: "center" }}>
								{previewItems.map((row) => (
									<div key={row.id}>{row.qty}</div>
								))}
							</td>
							<td style={{ padding: "4px 2px", textAlign: "center" }}>
								{/* Rate column left empty as per standard requested usage or could be computed */}
							</td>
							<td style={{ padding: "4px 2px", textAlign: "center" }}>
								{previewItems.map((row) => (
									<div key={row.id}>{row.amount}</div>
								))}
							</td>
						</tr>
						<tr>
							<td colSpan={3} className="total-label">
								Sub Total
							</td>
							<td className="total-cell"></td>
							<td className="amount-cell">{subTotal}</td>
						</tr>
						<tr>
							<td colSpan={3} className="total-label">
								Discount
							</td>
							<td className="total-cell"></td>
							<td className="amount-cell">{discount}</td>
						</tr>
						<tr>
							<td colSpan={3} className="total-label">
								Total
							</td>
							<td className="total-cell"></td>
							<td className="amount-cell">{total}</td>
						</tr>
						<tr>
							<td colSpan={3} className="total-label">
								Add.
							</td>
							<td className="total-cell"></td>
							<td className="amount-cell">{advance}</td>
						</tr>
						<tr>
							<td colSpan={3} className="total-label">
								Bal.
							</td>
							<td className="total-cell"></td>
							<td className="amount-cell">{balance}</td>
						</tr>
					</tbody>
				</table>
				<footer className="footer">
					<div className="terms">
						<span style={{ whiteSpace: "pre-wrap", display: "block" }}>
							{`1) Advance payment is non-refundable”.\n2) No refund or return after Printing.”\n3) Photo will be saved for 30 days only.”`}
						</span>
					</div>
					<div className="signature">
						<span>
							Signature
							<br />
							<br />
							________________
						</span>
					</div>
				</footer>
				<div
					style={{
						background: "#064e3b",
						color: "#fff",
						textAlign: "center",
						padding: "8px 4px",
						fontSize: "12px",
						fontWeight: "bold",
						marginTop: "auto",
						letterSpacing: "0.02em",
						borderRadius: "4px",
						width: "100%"
					}}
				>
					We cover all types of photography and videography events”
				</div>
			</div>
		</main>
	);

	return (
		<div className="bill-editor-root">
			<style>{`
        .bill-editor-root { 
          display:flex; flex-direction:column; height:calc(100vh - 64px); background:#e5e7eb; 
          touch-action: manipulation;
        }
        ::selection { background: rgba(16, 185, 129, 0.3); color: inherit; }
        ::-moz-selection { background: rgba(16, 185, 129, 0.3); color: inherit; }

        .bill-toolbar {
          display:flex; align-items:center; gap:4px; padding:8px 16px;
          background:#1a0a00; color:#fef3c7; flex-shrink:0; flex-wrap:wrap;
          box-shadow:0 2px 8px rgba(0,0,0,.4); z-index:50;
        }
        .bill-toolbar button {
          background:rgba(255,255,255,0.1); border:none; color:#fef3c7; cursor:pointer;
          padding:6px 12px; border-radius:4px; font-size:13px; font-weight:600; transition:background .15s; margin-right: 4px;
        }
        .bill-toolbar button:hover { background:rgba(255,255,255,0.2); }
        .bill-toolbar .sep { width:1px; min-height: 1.2em; background:#7c4a00; margin:0 8px; }
        .bill-toolbar .zoom-ctl { display:flex; align-items:center; gap:6px; font-size:13px; margin-right: 12px; background: rgba(255,255,255,0.1); padding: 2px 6px; border-radius: 4px; color: #fef3c7; }
        .bill-toolbar .zoom-ctl button { background: transparent; padding: 4px 8px; border: none; color: inherit; cursor: pointer; font-weight: bold; }
        .bill-toolbar .zoom-ctl button:hover { background: rgba(255,255,255,0.2); }
        .bill-dl-btn { background:#c00 !important; color:#fff !important; }
        .bill-dl-btn:hover { background:#a00 !important; }
        .bill-save-btn { background:#047857 !important; color:#fff !important; }
        .bill-save-btn:hover { background:#065f46 !important; }
        .bill-wa-btn { background:#16a34a !important; color:#fff !important; }
        .bill-wa-btn:hover { background:#15803d !important; }
        .bill-canvas { flex:1; overflow-y:auto; padding:40px 20px; }

        .bill-container { --red:#f10b0b; --ink:#111; --watermark:#c8c8c8; color:var(--ink); font-family:Arial, Helvetica, sans-serif; }
        .bill-container * { box-sizing:border-box; }
        .bill-container .bill-page-a4 { width:4.135in; min-height:5.845in; margin:0 auto; background:#fff; box-shadow:0 4px 24px #0002; display:block; }
        .bill-container .bill { position:relative; width:100%; height:100%; padding:20px 24px; overflow:hidden; border:none; }
        .bill-container .bill:nth-child(n+2) { display:none; }
        .bill-container .watermark { position:absolute; inset:0; display:flex; align-items:center; justify-content:center; z-index:0; pointer-events:none; transform:rotate(-24deg); color:var(--watermark); font-family:cursive; font-size:42px; font-weight:700; line-height:1.5; opacity:.2; white-space:nowrap; text-align:center; }
        .bill-container .content { position:relative; z-index:1; height:100%; display:flex; flex-direction:column; }
        .bill-container .brand { margin:0; text-align:center; color:var(--red); font-family:Georgia, "Times New Roman", serif; font-size:28px; line-height:1.2; font-weight:700; }
        .bill-container .header-rule { margin:8px -24px 0; border-top:2px double var(--ink); }
        .bill-container .address { padding:6px 10px; text-align:center; font-size:9.5px; line-height:1.5; font-weight:700; letter-spacing:.02em; background-color:#111827; color:#ffffff; border-radius:4px; margin-top:4px; }
        .bill-container .meta { display:flex; justify-content:space-between; padding:8px 4px 12px; font-size:11px; font-weight:700; }
        .bill-container .fields { display:grid; gap:8px; margin:0 4px 12px; font-size:11px; font-weight:700; }
        .bill-container .field { display:flex; align-items:end; gap:6px; }
        .bill-container .field .label { white-space:nowrap; }
        .bill-container .line { flex:1; min-width:0; min-height: 1.2em; border-bottom:1px solid var(--ink); display:inline-block; }
        .bill-container .line.short { flex:0 0 35%; }
        .bill-container .bill-table { width:100%; border-collapse:collapse; table-layout:fixed; font-size:11px; flex:1; }
        .bill-container .bill-table th, .bill-container .bill-table td { border:1.5px solid var(--ink); }
        .bill-container .bill-table th { height:26px; color:var(--red); font-family:Georgia, "Times New Roman", serif; font-size:12px; }
        .bill-container .bill-table th:nth-child(1) { width:8%; }
        .bill-container .bill-table th:nth-child(2) { width:48%; }
        .bill-container .bill-table th:nth-child(3) { width:12%; }
        .bill-container .bill-table th:nth-child(4) { width:16%; }
        .bill-container .bill-table th:nth-child(5) { width:16%; }
        .bill-container .bill-table tbody td { vertical-align:top; }
        .bill-container .bill-table .notes { padding:4px; border-right:0; line-height:1.4; }
        .bill-container .bill-table .total-label { vertical-align:middle; height:24px; color:var(--red); font-family:Georgia, "Times New Roman", serif; font-size:11px; font-weight:700; padding-left:6px; }
        .bill-container .bill-table .total-cell { height:24px; }
        .bill-container .bill-table .amount-cell { height:24px; font-weight: bold; text-align: center; }
        .bill-container .footer { display:flex; justify-content:space-between; align-items:flex-end; margin-top:8px; padding-bottom:8px; }
        .bill-container .terms { color:var(--red); font-family:Georgia, "Times New Roman", serif; font-size:10px; line-height:1.3; font-weight:700; }
        .bill-container .signature { padding:0 12px 0 0; font-family:Georgia, "Times New Roman", serif; font-size:10px; text-align:center; }

        @media print {
          @page { size: A4 portrait; margin: 0; }
          .bill-toolbar { display:none !important; }
          .bill-editor-root { height:auto; background:none; }
          .bill-canvas { padding:0; overflow:visible; }
          .bill-container .bill-page-a4 { margin:0; box-shadow:none; width:210mm !important; height:148.5mm !important; overflow:hidden !important; margin:0 !important; padding:0 !important; display:grid !important; grid-template-columns:1fr 1fr !important; grid-template-rows:1fr !important; }
          .bill-container .bill { display:block !important; border-right:1px dashed #ccc !important; border-bottom:none !important; }
          .bill-container .bill:nth-child(even) { border-right:none !important; }
          .bill-container .bill:nth-child(n+3) { display:none !important; }
          html,body { -webkit-print-color-adjust:exact; print-color-adjust:exact; }
        }

        .print-mode .bill-page-a4 { width:210mm !important; height:148.5mm !important; overflow:hidden !important; margin:0 !important; padding:0 !important; display:grid !important; grid-template-columns:1fr 1fr !important; grid-template-rows:1fr !important; box-shadow:none !important; }
        .print-mode .bill { display:block !important; border-right:1px dashed #ccc !important; border-bottom:none !important; }
        .print-mode .bill:nth-child(even) { border-right:none !important; }
        .print-mode .bill:nth-child(n+3) { display:none !important; }
      `}</style>

			{/* TOOLBAR */}
			<BillToolbar
				onEdit={() => setMode("form")}
				zoom={zoom}
				setZoom={setZoom}
				showWatermark={showWatermark}
				setShowWatermark={setShowWatermark}
				downloading={downloading}
				onSendWhatsApp={handleSendWhatsApp}
				onSave={handleSave}
				onPrint={() => {
					saveSilently();
					window.print();
				}}
				onDownloadPDF={handleDownloadPDF}
				onDownloadJPG={handleDownloadJPG}
			/>

			{/* CANVAS */}
			<div className="bill-canvas">
				<div
					ref={docRef}
					className="bill-container"
					style={{
						transform: `scale(${zoom / 100})`,
						transformOrigin: "top center",
						transition: "transform .2s",
					}}
				>
					<div className="bill-page-a4">
						{renderBill(1)}
						{renderBill(2)}
						{renderBill(3)}
						{renderBill(4)}
					</div>
				</div>
			</div>
		</div>
	);
}
