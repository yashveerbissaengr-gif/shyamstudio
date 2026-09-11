import { useRef, useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { storage } from "../services/storage";
import type { BillData } from "../types/invoice";
import { downloadAsJPG, downloadAsPDF } from "../utils/downloadHelper";

export function BillViewer() {
	const { id } = useParams();
	const [bill] = useState<BillData | null>(() => (id ? storage.getBillById(id) || null : null));
	const [zoom, setZoom] = useState(85);
	const [downloading, setDownloading] = useState(false);
	const docRef = useRef<HTMLDivElement>(null);
	const canvasRef = useRef<HTMLDivElement>(null);

	const handleDownloadJPG = async () => {
		if (!docRef.current || !bill) return;
		setDownloading(true);
		try {
			await downloadAsJPG(docRef.current, `bill_${bill.billNo}.jpg`);
		} catch (e) {
			console.error(e);
			alert("Failed to generate JPG");
		} finally {
			setDownloading(false);
		}
	};

	const handleDownloadPDF = async () => {
		if (!docRef.current || !bill) return;
		setDownloading(true);
		try {
			await downloadAsPDF(docRef.current, `bill_${bill.billNo}.pdf`);
		} catch (e) {
			console.error(e);
			alert("Failed to generate PDF");
		} finally {
			setDownloading(false);
		}
	};

	const handleSendWhatsApp = (type: 'booking' | 'completed' | 'collected') => {
		if (!bill) return;
		let targetMobile = bill.customerMobile;
		if (!targetMobile) {
			const input = prompt("Please enter the customer's WhatsApp number:");
			if (!input) return;
			targetMobile = input;
		}
		const cleanMobile = targetMobile.replace(/\D/g, "");
		
		const itemsList = bill.items.map(item => `- ${item.desc} - ₹${item.amount || 0}`).join('\n');
		
		let message = "";
		if (type === 'booking') {
			message = `Dear Customer,\nShyam photo studio Thank's You\nFor Booking:\n${itemsList}\nYour Job ID is: ${bill.billNo}\nDATE : ${bill.date}`;
		} else if (type === 'completed') {
			message = `Dear Customer,\nYour Job ID : ${bill.billNo}\nIs completed Please Collect Your Job\nBalance Amt : ${bill.balance}\nFrom Shyam photo studio`;
		} else if (type === 'collected') {
			message = `Dear Customer,\nThank You For Successfully Collected Your Job\nJob Code : ${bill.billNo}\nFrom Shyam photo studio`;
		}
		const encoded = encodeURIComponent(message);
		const url = `https://wa.me/${cleanMobile}?text=${encoded}`;
		window.open(url, "_blank");
	};

	if (!bill) {
		return <div className="text-center py-20 text-gray-500">Bill not found.</div>;
	}

	useEffect(() => {
		const observer = new ResizeObserver((entries) => {
			for (let entry of entries) {
				const { width, height } = entry.contentRect;
				const scaleX = (width - 40) / 794;
				const scaleY = (height - 80) / 1122;
				const scale = Math.min(scaleX, scaleY, 1);
				if (scale > 0) {
					setZoom(Math.floor(scale * 100));
				} else {
					setZoom(100);
				}
			}
		});
		if (canvasRef.current) {
			observer.observe(canvasRef.current);
		}
		return () => observer.disconnect();
	}, []);

	const renderBill = () => (
		<main className="bill">
						{bill.showWatermark && (
							<div className="watermark" aria-hidden="true">
								<span style={{ whiteSpace: "pre-wrap" }}>{bill.watermarkText}</span>
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
								<span style={{ display: "inline-flex", alignItems: "baseline", gap: "6px" }}>
									<span>No.</span>
									<span
										style={{
											display: "inline-block",
											borderBottom: "2px solid #dc2626",
											padding: "0 10px 2px",
											color: "#dc2626",
											fontWeight: "bold",
											fontSize: "20px",
											minWidth: "60px",
											textAlign: "center",
										}}
									>
										{bill.billNo}
									</span>
								</span>
								<span style={{ display: "inline-flex", alignItems: "baseline", gap: "6px" }}>
									<span>Date :-</span>
									<span
										style={{
											display: "inline-block",
											borderBottom: "2px solid #111",
											padding: "0 10px 2px",
											fontWeight: "bold",
											minWidth: "110px",
											textAlign: "center",
										}}
									>
										{bill.date}
									</span>
								</span>
							</div>
							<section className="fields" aria-label="Customer details">
								<div className="field">
									<span className="label">Name :-</span>
									<span className="line" style={{ padding: "0 8px" }}>
										{bill.customerName}
									</span>
									<span className="label">Mo.</span>
									<span className="line short" style={{ padding: "0 8px" }}>
										{bill.customerMobile}
									</span>
								</div>
								<div className="field">
									<span className="label">Address :-</span>
									<span className="line" style={{ padding: "0 8px" }}>
										{bill.customerAddress}
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
										<td style={{ padding: "8px 4px", textAlign: "center" }}>
											{bill.items.map((row) => (
												<div key={row.id}>{row.sr}</div>
											))}
										</td>
										<td className="notes">
											<div style={{ padding: "8px 4px" }}>
												{bill.items.map((row) => (
													<div key={row.id}>{row.desc}</div>
												))}
												{bill.details && (
													<div
														style={{
															marginTop: "16px",
															whiteSpace: "pre-wrap",
														}}
													>
														{bill.details}
													</div>
												)}
											</div>
										</td>
										<td style={{ padding: "8px 4px", textAlign: "center" }}>
											{bill.items.map((row) => (
												<div key={row.id}>{row.qty}</div>
											))}
										</td>
										<td style={{ padding: "8px 4px", textAlign: "center" }}>
											{/* Rate left blank intentionally */}
										</td>
										<td style={{ padding: "8px 4px", textAlign: "center" }}>
											{bill.items.map((row) => (
												<div key={row.id}>{row.amount}</div>
											))}
										</td>
									</tr>
									<tr>
										<td colSpan={3} className="total-label">
											Total
										</td>
										<td className="total-cell"></td>
										<td className="amount-cell">{bill.total}</td>
									</tr>
									<tr>
										<td colSpan={3} className="total-label">
											Add.
										</td>
										<td className="total-cell"></td>
										<td className="amount-cell">{bill.advance}</td>
									</tr>
									<tr>
										<td colSpan={3} className="total-label">
											Bal.
										</td>
										<td className="total-cell"></td>
										<td className="amount-cell">{bill.balance}</td>
									</tr>
								</tbody>
							</table>
							<footer className="footer">
								<div className="terms">
									<span style={{ whiteSpace: "pre-wrap", display: "block" }}>
										{`1) Advance payment is non-refundable”.\n2) No refund or return after Printing.”\n3) Photo will be saved for 30 days only.”\nWe cover all types of photography and videography events”`}
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
						</div>
					</main>
	);

	return (
		<div className="bill-editor-root">
			<style>{`
        .bill-editor-root { display:flex; flex-direction:column; height:100vh; background:#e5e7eb; }
        .bill-toolbar {
          display:flex; align-items:center; gap:4px; padding:8px 16px;
          background:#1a0a00; color:#fef3c7; flex-shrink:0; flex-wrap:wrap;
          box-shadow:0 2px 8px rgba(0,0,0,.4); z-index:50;
        }
        .bill-toolbar button, .bill-toolbar a {
          background:rgba(255,255,255,0.1); border:none; color:#fef3c7; cursor:pointer; text-decoration: none;
          padding:6px 12px; border-radius:4px; font-size:13px; font-weight:600; transition:background .15s; margin-right: 4px;
        }
        .bill-toolbar button:hover, .bill-toolbar a:hover { background:rgba(255,255,255,0.2); }
        .bill-toolbar .sep { width:1px; min-height: 1.2em; background:#7c4a00; margin:0 8px; }
        .bill-toolbar .zoom-ctl { display:flex; align-items:center; gap:6px; font-size:13px; margin-right: 12px; background: rgba(255,255,255,0.1); padding: 2px 6px; border-radius: 4px; color: #fef3c7; }
        .bill-toolbar .zoom-ctl button { background: transparent; padding: 4px 8px; border: none; color: inherit; cursor: pointer; font-weight: bold; }
        .bill-toolbar .zoom-ctl button:hover { background: rgba(255,255,255,0.2); }
        .bill-dl-btn { background:#c00 !important; color:#fff !important; }
        .bill-dl-btn:hover { background:#a00 !important; }
        .bill-wa-btn { background:#16a34a !important; color:#fff !important; }
        .bill-wa-btn:hover { background:#15803d !important; }
        .bill-canvas { flex:1; overflow-y:auto; padding:40px 20px; }

        /* A4 Layout CSS */
        .bill-container { --red:#f10b0b; --ink:#111; --watermark:#c8c8c8; color:var(--ink); font-family:Arial, Helvetica, sans-serif; }
        .bill-container * { box-sizing:border-box; }
        .bill-container .bill { position:relative; width:8.27in; min-height:11.69in; margin:0 auto; padding:36px 42px 32px; overflow:hidden; background:#fff; box-shadow:0 4px 24px #0002; }
        .bill-container .watermark { position:absolute; inset:215px -100px 170px; z-index:0; pointer-events:none; transform:rotate(-24deg); color:var(--watermark); font-family:cursive; font-size:108px; font-weight:700; line-height:1.85; opacity:.9; white-space:nowrap; text-align:center; }
        .bill-container .content { position:relative; z-index:1; }
        .bill-container .brand { margin:0; text-align:center; color:var(--red); font-family:Georgia, "Times New Roman", serif; font-size:45px; line-height:1.15; font-weight:700; }
        .bill-container .header-rule { margin:13px -42px 0; border-top:4px double var(--ink); }
        .bill-container .address { padding:8px 10px; border-bottom:2px solid var(--ink); text-align:center; font-size:15px; line-height:1.35; font-weight:700; letter-spacing:.02em; background-color:#111827; color:#ffffff; border-radius:4px; margin-top:4px; }
        .bill-container .meta { display:flex; justify-content:space-between; padding:12px 7px 27px; font-size:18px; font-weight:700; }
        .bill-container .fields { display:grid; gap:12px; margin:0 7px 20px; font-size:18px; font-weight:700; }
        .bill-container .field { display:flex; align-items:end; gap:8px; }
        .bill-container .field .label { white-space:nowrap; }
        .bill-container .line { flex:1; min-width:0; min-height: 1.2em; border-bottom:1.5px solid var(--ink); display:inline-block; }
        .bill-container .line.short { flex:0 0 35%; }
        .bill-container .bill-table { width:100%; border-collapse:collapse; table-layout:fixed; font-size:19px; }
        .bill-container .bill-table th, .bill-container .bill-table td { border:3px solid var(--ink); }
        .bill-container .bill-table th { height:48px; color:var(--red); font-family:Georgia, "Times New Roman", serif; font-size:21px; }
        .bill-container .bill-table th:nth-child(1) { width:6%; }
        .bill-container .bill-table th:nth-child(2) { width:54%; }
        .bill-container .bill-table th:nth-child(3) { width:10%; }
        .bill-container .bill-table th:nth-child(4) { width:15%; }
        .bill-container .bill-table th:nth-child(5) { width:15%; }
        .bill-container .bill-table tbody td { height:465px; vertical-align:top; }
        .bill-container .bill-table .notes { padding:0 9px 8px; border-right:0; line-height:1.3; }
        .bill-container .bill-table .total-label { vertical-align:middle; height:43px; color:var(--red); font-family:Georgia, "Times New Roman", serif; font-size:20px; font-weight:700; padding-left:10px; }
        .bill-container .bill-table .total-cell { height:43px; }
        .bill-container .bill-table .amount-cell { height:43px; font-weight: bold; text-align: center; }
        .bill-container .footer { display:flex; justify-content:space-between; align-items:flex-end; margin-top:11px; }
        .bill-container .terms { color:var(--red); font-family:Georgia, "Times New Roman", serif; font-size:19px; line-height:1.18; font-weight:700; }
        .bill-container .signature { padding:0 18px 4px 0; font-family:Georgia, "Times New Roman", serif; font-size:16px; }

        .print-only { display: none; }

        @media print {
          @page { size: A4 portrait; margin: 5mm; }
          .bill-toolbar { display:none !important; }
          .bill-editor-root { height:auto; background:none; }
          .bill-canvas { padding:0; overflow:visible; }
          .bill-container { transform: none !important; width: 210mm !important; height: 148.5mm !important; }
          .bill-container .bill { margin:0; box-shadow:none; }
          .bill-print-grid {
            display: flex !important;
            flex-direction: row !important;
            justify-content: space-between !important;
            align-items: flex-start !important;
            width: 100% !important;
            height: 140mm !important;
            box-sizing: border-box !important;
            overflow: hidden !important;
            page-break-after: avoid !important;
            break-after: avoid !important;
          }
          
          .bill-wrapper {
            width: 49% !important;
            height: 140mm !important;
            overflow: hidden !important;
            border: 1px dashed #ccc;
          }
          
          .bill-wrapper .bill {
            zoom: 0.48;
            margin: 0;
            box-shadow: none;
          }
          
          .print-only { display: block !important; }

          html,body { -webkit-print-color-adjust:exact; print-color-adjust:exact; background: #ffffff !important; }
        }
      `}</style>

			{/* TOOLBAR */}
			<div className="no-print" style={{
				position: "fixed",
				top: "100px",
				right: "20px",
				display: "flex",
				flexDirection: "column",
				gap: "10px",
				zIndex: 9999,
			}}>
				<button className="bill-wa-btn" style={{ boxShadow: "0 4px 6px rgba(0,0,0,0.2)", padding: "12px 20px", borderRadius: "8px", fontWeight: "bold", fontSize: "15px" }} onClick={() => handleSendWhatsApp('booking')} title="Send Booking WA">
					💬 Booked
				</button>
				<button className="bill-wa-btn" style={{ background: '#059669', boxShadow: "0 4px 6px rgba(0,0,0,0.2)", padding: "12px 20px", borderRadius: "8px", fontWeight: "bold", fontSize: "15px" }} onClick={() => handleSendWhatsApp('completed')} title="Send Ready WA">
					💬 Ready
				</button>
				<button className="bill-wa-btn" style={{ background: '#047857', boxShadow: "0 4px 6px rgba(0,0,0,0.2)", padding: "12px 20px", borderRadius: "8px", fontWeight: "bold", fontSize: "15px" }} onClick={() => handleSendWhatsApp('collected')} title="Send Collected WA">
					💬 Collected
				</button>
			</div>
			<div className="bill-toolbar">
				<Link to="/dashboard">⬅ Back to Dashboard</Link>
				<div className="sep" />
				

				<div style={{ marginLeft: "auto", display: "flex", gap: "8px", alignItems: "center" }}>
					<button onClick={() => window.print()}>🖨 Print</button>
					
					{/* 2 Download Options: JPG & PDF */}
					<button
						style={{ background: "#2563eb", color: "#fff", fontWeight: "bold" }}
						disabled={downloading}
						onClick={handleDownloadJPG}
					>
						{downloading ? "⏳..." : "🖼️ Download JPG"}
					</button>
					<button className="bill-dl-btn" disabled={downloading} onClick={handleDownloadPDF}>
						{downloading ? "⏳..." : "📄 Download PDF"}
					</button>
				</div>
			</div>

			{/* CANVAS */}
			<div className="bill-canvas" ref={canvasRef}>
				<div
					ref={docRef}
					className="bill-container"
					style={{
						transform: `scale(${zoom / 100})`,
						transformOrigin: "top center",
						transition: "transform .2s",
					}}
				>
					<div className="bill-print-grid">
						<div className="bill-wrapper">
							{renderBill()}
						</div>
						<div className="bill-wrapper print-only" aria-hidden="true">
							{renderBill()}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
