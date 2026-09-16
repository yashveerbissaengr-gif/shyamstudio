import { useRef, useState, useEffect, type CSSProperties } from "react";
import { useNavigate } from "react-router-dom";
import { BillForm } from "../components/bill/BillForm";
import { BillToolbar } from "../components/bill/BillToolbar";
import { storage } from "../services/storage";
import type { BillData, BillItem } from "../types/invoice";
import { downloadAsJPG, downloadAsPDF, buildPDFFromElement, sharePDFViaWhatsApp, shareOrDownloadBlob, openWhatsAppChat } from "../utils/downloadHelper";

const uid = () => crypto.randomUUID();

const watermarkText = "Shyam Graphic Designer\nShyam Graphic Designer";

export function BillGenerator() {
	const navigate = useNavigate();
	const docRef = useRef<HTMLDivElement>(null);
	const canvasRef = useRef<HTMLDivElement>(null);
	const containerRef = useRef<HTMLDivElement>(null);

	// View states
	const [mode, setMode] = useState<"form" | "preview">("form");
	const [downloading, setDownloading] = useState(false);
	const [zoom] = useState(100);

	// Form Data
	const [id] = useState(uid);
	const [billNo, setBillNo] = useState("0001");
	const [date] = useState(() => new Date().toLocaleDateString("en-GB"));
	const [customerName, setCustomerName] = useState("");
	const [customerMobile, setCustomerMobile] = useState("");
	const [customerAddress, setCustomerAddress] = useState("");
	const [details, setDetails] = useState("");
	const [advance, setAdvance] = useState<number>(0);
	const [discount, setDiscount] = useState<number>(0);
	const [showWatermark, setShowWatermark] = useState(true);

	useEffect(() => {
		let isMounted = true;
		const initNo = async () => {
			const nextNo = await storage.getNextBillNumber();
			if (isMounted) setBillNo(nextNo);
		};
		initNo();
		return () => { isMounted = false; };
	}, []);

	// Predefined Items logic
	const [billItems, setBillItems] = useState<Array<{ id: string; option: string; description: string; quantity: string; amount: string }>>([]);
	const [isItemsExpanded, setIsItemsExpanded] = useState(false);

	const calculateSubTotal = () => {
		return billItems.reduce((acc, item) => acc + (parseFloat(item.amount) || 0), 0);
	};

	const subTotal = calculateSubTotal();
	const total = subTotal - discount;
	const balance = total - advance;

	const getItemsForPreview = (): BillItem[] => {
		return billItems.map((item, index) => {
			const customDesc = item.description || "";
			const desc = item.option === "Other (Custom)" ? customDesc : customDesc ? `${item.option} - ${customDesc}` : item.option;
			return {
				id: item.id,
				sr: String(index + 1),
				desc: desc,
				qty: item.quantity || "1",
				rate: "",
				amount: item.amount || "0",
			};
		});
	};

	const saveSilently = async () => {
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
		await storage.saveBill(data);
	};

	const handleSave = async () => {
		try {
			await saveSilently();
			alert("Bill saved successfully!");
			navigate("/dashboard");
		} catch (e: any) {
			alert(e.message || "Failed to save bill");
		}
	};

	const handleDownloadPDF = async () => {
		try {
			await saveSilently();
		} catch (e) {
			console.error(e);
		}
		const el = document.getElementById('bill-capture') as HTMLElement;
		if (!el) return;
		setDownloading(true);
		await new Promise(r => setTimeout(r, 60));
		try {
			await downloadAsPDF(el, `bill_${billNo}.pdf`);
		} catch (e) {
			console.error(e);
			alert("Failed to generate PDF");
		} finally {
			setDownloading(false);
		}
	};

	const handleDownloadJPG = async () => {
		try {
			await saveSilently();
		} catch (e) {
			console.error(e);
		}
		const el = document.getElementById('bill-capture') as HTMLElement;
		if (!el) return;
		setDownloading(true);
		await new Promise(r => setTimeout(r, 60));
		try {
			await downloadAsJPG(el, `bill_${billNo}.jpg`);
		} catch (e) {
			console.error(e);
			alert("Failed to generate JPG");
		} finally {
			setDownloading(false);
		}
	};

	const handleSendWhatsApp = async (type: 'booking' | 'completed' | 'collected') => {
		try {
			await saveSilently();
		} catch (e) {
			console.error(e);
		}
		let targetMobile = customerMobile;
		if (!targetMobile) {
			const input = prompt("Please enter the customer's WhatsApp number:");
			if (!input) return;
			targetMobile = input;
		}

		const itemsList = billItems.map(item => `- ${item.option} ${item.description ? `(${item.description})` : ''} - ₹${item.amount || 0}`).join('\n');

		let message = "";
		if (type === 'booking') {
			message = `Dear Customer,\nShyam photo studio Thank's You\nFor Booking:\n${itemsList}\nYour Job ID is: ${billNo}\nDATE : ${date}`;
		} else if (type === 'completed') {
			message = `Dear Customer,\nYour Job ID : ${billNo}\nIs completed Please Collect Your Job\nBalance Amt : ${balance}\nFrom Shyam photo studio`;
		} else if (type === 'collected') {
			message = `Dear Customer,\nThank You For Successfully Collected Your Job\nJob Code : ${billNo}\nFrom Shyam photo studio`;
		}

		// Direct PDF send: generate the bill PDF, then share the FILE + message
		// via the system sheet (pick WhatsApp → PDF arrives attached).
		// Falls back to download + text-only chat on desktop.
		if (!docRef.current) {
			openWhatsAppChat(targetMobile, message);
			return;
		}

		const filename = `bill_${billNo}.pdf`;
		setDownloading(true);
		try {
			const pdfBlob = await buildPDFFromElement(docRef.current);
			const file = new File([pdfBlob], filename, { type: "application/pdf" });

			// Backup to R2 (fire-and-forget)
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

			const shared = await sharePDFViaWhatsApp(pdfBlob, filename, message);
			if (!shared) {
				await shareOrDownloadBlob(pdfBlob, filename);
				openWhatsAppChat(targetMobile, message);
			}
		} catch (e) {
			console.error("Failed to send bill PDF via WhatsApp:", e);
			try {
				openWhatsAppChat(targetMobile, message);
			} catch {
				/* ignore */
			}
		} finally {
			setDownloading(false);
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
				billItems={billItems}
				setBillItems={setBillItems}
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

	const renderBill = (isFirst = false) => (
		<main className="bill" id={isFirst ? "bill-capture" : undefined}>
            {showWatermark && (
              <div className="watermark" aria-hidden="true">
                <span style={{ whiteSpace: 'pre-wrap' }}>{watermarkText}</span>
              </div>
            )}
            <div className="content">
              <h1 className="brand">
                <span>Shyam Graphic Designer</span>
              </h1>
              <div className="header-rule"></div>
              <div className="address">
                <span>
                  PLAT NO. 1, SHOP NO. 3 BALAJI NAGAR, NEAR BY- BHAWANI HOSPITEL OPPOSITE<br/>PUNAPU ROAD, PARDI NAGPUR. 35 &nbsp;&nbsp;&nbsp; MO. 7775854937, 9404291477
                </span>
              </div>
              <div className="meta">
                <span>No. <span style={{ textDecoration:"underline", textUnderlineOffset:"4px", textDecorationThickness:"2px", color:"var(--red)", fontWeight:"bold", fontSize:"20px", padding:"0 8px" }}>{billNo}</span></span>
                <span>Date :- <span style={{ textDecoration:"underline", textUnderlineOffset:"4px", textDecorationThickness:"1.5px", padding:"0 8px" }}>{date}</span></span>
              </div>
              <section className="fields" aria-label="Customer details">
                <div className="field">
                  <span className="label">Name :-</span>
                  <span className="line" style={{padding:'0 8px'}}>{customerName}</span>
                  <span className="label">Mo.</span>
                  <span className="line short" style={{padding:'0 8px'}}>{customerMobile}</span>
                </div>
                <div className="field">
                  <span className="label">Address :-</span>
                  <span className="line" style={{padding:'0 8px'}}>{customerAddress}</span>
                </div>
              </section>
              <table className="bill-table" aria-label="Bill items">
                <thead><tr><th>Sr</th><th>Description</th><th>Qty</th><th>Rate</th><th>Amount</th></tr></thead>
                <tbody>
                  <tr>
                    <td style={{ padding: '8px 4px', textAlign: 'center' }}>
                      {previewItems.map(row => <div key={row.id}>{row.sr}</div>)}
                    </td>
                    <td className="notes">
                      <div style={{ padding: '8px 4px' }}>
                        {previewItems.map(row => <div key={row.id}>{row.desc}</div>)}
                        {details && <div style={{marginTop: '16px', whiteSpace: 'pre-wrap'}}>{details}</div>}
                      </div>
                    </td>
                    <td style={{ padding: '8px 4px', textAlign: 'center' }}>
                      {previewItems.map(row => <div key={row.id}>{row.qty}</div>)}
                    </td>
                    <td style={{ padding: '8px 4px', textAlign: 'center' }}>
                      {/* Rate column left empty as per standard requested usage or could be computed */}
                    </td>
                    <td style={{ padding: '8px 4px', textAlign: 'center' }}>
                      {previewItems.map(row => <div key={row.id}>{row.amount}</div>)}
                    </td>
                  </tr>
                  <tr><td colSpan={3} className="total-label">Total</td><td className="total-cell"></td><td className="amount-cell">{total}</td></tr>
                  <tr><td colSpan={3} className="total-label">Add.</td><td className="total-cell"></td><td className="amount-cell">{advance}</td></tr>
                  <tr><td colSpan={3} className="total-label">Bal.</td><td className="total-cell"></td><td className="amount-cell">{balance}</td></tr>
                </tbody>
              </table>
              <footer className="footer">
                <div className="terms">
                  <span style={{ whiteSpace: 'pre-wrap', display: 'block' }}>
                    {`1) Advance payment is non-refundable”.\n2) No refund or return after Printing.”\n3) Photo will be saved for 30 days only.”`}
                  </span>
                </div>
                <div className="signature">
                  <span>Signature<br/><br/>________________</span>
                </div>
              </footer>
              <div style={{ background: '#064e3b', color: '#fff', textAlign: 'center', padding: '12px 20px', fontSize: '24px', fontWeight: '900', marginTop: '24px', letterSpacing: '0.05em', borderRadius: '8px', textTransform: 'uppercase', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                We cover all types of photography and videography events"
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
          display:flex; align-items:center; gap:4px; padding:8px 12px;
          background:#1a0a00; color:#fef3c7; flex-shrink:0;
          overflow-x:auto; white-space:nowrap;
          box-shadow:0 2px 8px rgba(0,0,0,.4); z-index:50;
          -webkit-overflow-scrolling: touch;
          scrollbar-width: none;
        }
        .bill-toolbar::-webkit-scrollbar { display: none; }
        .bill-toolbar button {
          background:rgba(255,255,255,0.1); border:none; color:#fef3c7; cursor:pointer;
          padding:6px 10px; border-radius:4px; font-size:12px; font-weight:600; transition:background .15s;
          white-space: nowrap; flex-shrink: 0;
        }
        .bill-toolbar button:hover { background:rgba(255,255,255,0.2); }
        .bill-toolbar .sep { width:1px; min-height:1.2em; background:#7c4a00; margin:0 6px; flex-shrink:0; }
        .bill-toolbar .zoom-ctl { display:flex; align-items:center; gap:4px; font-size:12px; flex-shrink:0; }
        .bill-dl-btn { background:#c00 !important; color:#fff !important; }
        .bill-dl-btn:hover { background:#a00 !important; }
        .bill-save-btn { background:#047857 !important; color:#fff !important; }
        .bill-save-btn:hover { background:#065f46 !important; }
        .bill-wa-btn { background:#16a34a !important; color:#fff !important; }
        .bill-wa-btn:hover { background:#15803d !important; }

        /* Inline status bar replaces floating badges */
        .bill-status-bar {
          display:flex; align-items:center; gap:8px; padding:6px 12px;
          background:#fff; border-bottom:1px solid #d1d5db; flex-shrink:0;
          overflow-x:auto; -webkit-overflow-scrolling:touch;
          scrollbar-width:none;
        }
        .bill-status-bar::-webkit-scrollbar { display:none; }
        .bill-status-bar .status-label { font-size:11px; font-weight:600; color:#64748b; text-transform:uppercase; letter-spacing:.05em; flex-shrink:0; }
        .bill-status-btn {
          display:flex; align-items:center; gap:5px; padding:5px 12px; border-radius:999px;
          font-size:12px; font-weight:700; border:none; cursor:pointer; transition:opacity .15s; flex-shrink:0;
        }
        .bill-status-btn:active { opacity:.8; }

        .bill-canvas {
          flex:1; overflow:auto; -webkit-overflow-scrolling:touch; touch-action:pan-x pan-y;
          padding:20px 8px; display:block; text-align:center;
        }
        @media(min-width:640px) { .bill-canvas { padding:40px 20px; } }
        @media(max-width:639px) { .bill-canvas { padding:8px 4px; } }

        /* Mobile bottom dock */
        .bill-mobile-dock {
          display:none; position:sticky; bottom:0; z-index:30;
          background:#fff; border-top:1px solid #e2e8f0;
          padding:8px 8px calc(8px + env(safe-area-inset-bottom, 0px)); box-shadow:0 -4px 12px rgba(0,0,0,.08);
        }
        .bill-mobile-dock-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:6px; }
        .bill-mobile-dock-grid + .bill-mobile-dock-grid { margin-top:6px; }
        .bill-mobile-dock-btn { display:flex; flex-direction:column; align-items:center; justify-content:center; padding:10px 4px; border:none; border-radius:8px; cursor:pointer; font-size:11px; font-weight:700; gap:3px; min-height:52px; }
        .bill-mobile-dock-btn:disabled { opacity:.6; }
        @media(max-width:639px) {
          .bill-mobile-dock { display:block; }
          .bill-status-bar { display:none !important; }
          .desktop-actions { display:none !important; }
          .bill-toolbar { flex-wrap:wrap; overflow-x:visible; white-space:normal; row-gap:6px; }
          .bill-toolbar button { min-height:40px; padding:8px 12px; font-size:12px; }
          .bill-toolbar .sep { display:none; }
        }

        /* A4 Layout CSS — fixed 794px width kept on phones; scaling via
           CSS zoom (layout-aware) so full bill stays visible/scrollable */
        .bill-container { --red:#f10b0b; --ink:#111; --watermark:#c8c8c8; color:var(--ink); font-family:Arial, Helvetica, sans-serif; width:794px; max-width:none; flex-shrink:0; margin:0 auto; }
        .bill-container * { box-sizing:border-box; }
        .bill-container .bill { position:relative; width:794px; max-width:none; min-height:11.69in; margin:0 auto; padding:36px 42px 32px; overflow:hidden; background:#fff; }
        .bill-container .watermark { position:absolute; inset:215px -100px 170px; z-index:0; pointer-events:none; transform:rotate(-24deg); color:var(--watermark); font-family:cursive; font-size:108px; font-weight:700; line-height:1.85; opacity:.2; white-space:nowrap; text-align:center; }
        .bill-container .content { position:relative; z-index:1; }
        .bill-container .brand { margin:0; text-align:center; color:var(--red); font-family:Georgia, "Times New Roman", serif; font-size:45px; line-height:1.15; font-weight:700; }
        .bill-container .header-rule { margin:13px -42px 0; border-top:4px double var(--ink); }
        .bill-container .address { padding:6px 5px 7px; border-bottom:2px solid var(--ink); text-align:center; font-size:16.5px; line-height:1.25; font-weight:800; letter-spacing:.01em; background-color:#bbf7d0; }
        .bill-container .meta { display:flex; justify-content:space-between; padding:12px 7px 27px; font-size:18px; font-weight:700; }
        .bill-container .fields { display:grid; gap:12px; margin:0 7px 20px; font-size:18px; font-weight:700; }
        .bill-container .field { display:flex; align-items:end; gap:8px; }
        .bill-container .field .label { white-space:nowrap; }
        .bill-container .line { flex:1; min-width:0; min-height: 1.2em; border-bottom:1.5px solid var(--ink); display:block; vertical-align:bottom; }
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
          .bill-toolbar, .bill-status-bar, .bill-mobile-dock { display:none !important; }
          .bill-editor-root { height:auto; background:none; }
          .bill-canvas { padding:0; overflow:visible; display: block; }
          .bill-container { transform: none !important; zoom: 1 !important; width: 210mm !important; height: 148.5mm !important; }
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

			{/* INLINE STATUS BAR — send bill PDF directly via WhatsApp */}
			<div className="bill-status-bar no-print">
				<span className="status-label">Send PDF via WA:</span>
				<button
					className="bill-status-btn"
					style={{ background: '#16a34a', color: '#fff' }}
					onClick={() => handleSendWhatsApp('booking')}
					title="Send bill PDF via WhatsApp"
				>
					📄 Booked
				</button>
				<button
					className="bill-status-btn"
					style={{ background: '#3b82f6', color: '#fff' }}
					onClick={() => handleSendWhatsApp('completed')}
					title="Send bill PDF via WhatsApp"
				>
					📸 Ready
				</button>
				<button
					className="bill-status-btn"
					style={{ background: '#10b981', color: '#fff' }}
					onClick={() => handleSendWhatsApp('collected')}
					title="Send bill PDF via WhatsApp"
				>
					✅ Collected
				</button>
			</div>

			<BillToolbar
				onEdit={() => setMode("form")}
				showWatermark={showWatermark}
				setShowWatermark={setShowWatermark}
				downloading={downloading}
				onSave={handleSave}
				onPrint={() => {
					saveSilently();
					window.print();
				}}
				onDownloadPDF={handleDownloadPDF}
				onDownloadJPG={handleDownloadJPG}
			/>

			{/* CANVAS */}
			<div
				className="bill-canvas"
				ref={containerRef}
			>
				<div
					ref={canvasRef}
					className="bill-layout-scale"
					style={{
						position: "relative",
						width: `${794 * (zoom / 100)}px`,
						height: `${1122 * (zoom / 100)}px`
					} as CSSProperties}
				>
					<div
						ref={docRef}
						className="bill-container"
						style={{
							position: "absolute",
							top: 0,
							left: 0,
							transform: `scale(${zoom / 100})`,
							transformOrigin: "top left",
						} as CSSProperties}
					>
						<div className="bill-print-grid">
							<div className="bill-wrapper">
								{renderBill(true)}
							</div>
							<div className="bill-wrapper print-only" aria-hidden="true">
								{renderBill()}
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* MOBILE BOTTOM DOCK — always visible on phones */}
			<div className="bill-mobile-dock no-print">
				<div className="bill-mobile-dock-grid">
					<button
						className="bill-mobile-dock-btn"
						style={{ background: '#f1f5f9', color: '#334155' }}
						onClick={() => { saveSilently(); window.print(); }}
					>
						<span style={{ fontSize: '18px' }}>🖨</span>
						<span>Print</span>
					</button>
					<button
						className="bill-mobile-dock-btn"
						style={{ background: '#eff6ff', color: '#1d4ed8' }}
						disabled={downloading}
						onClick={handleDownloadJPG}
					>
						<span style={{ fontSize: '18px' }}>🖼️</span>
						<span>{downloading ? '⏳' : 'JPG'}</span>
					</button>
					<button
						className="bill-mobile-dock-btn"
						style={{ background: '#fef2f2', color: '#b91c1c' }}
						disabled={downloading}
						onClick={handleDownloadPDF}
					>
						<span style={{ fontSize: '18px' }}>📄</span>
						<span>{downloading ? '⏳' : 'PDF'}</span>
					</button>
				</div>
				<div className="bill-mobile-dock-grid">
					<button
						className="bill-mobile-dock-btn"
						style={{ background: '#25D366', color: '#fff' }}
						onClick={() => handleSendWhatsApp('booking')}
						title="Send bill PDF via WhatsApp"
					>
						<span style={{ fontSize: '18px' }}>💬</span>
						<span>WA: Booked</span>
					</button>
					<button
						className="bill-mobile-dock-btn"
						style={{ background: '#128C7E', color: '#fff' }}
						onClick={() => handleSendWhatsApp('completed')}
						title="Send bill PDF via WhatsApp"
					>
						<span style={{ fontSize: '18px' }}>💬</span>
						<span>WA: Ready</span>
					</button>
					<button
						className="bill-mobile-dock-btn"
						style={{ background: '#075E54', color: '#fff' }}
						onClick={() => handleSendWhatsApp('collected')}
						title="Send bill PDF via WhatsApp"
					>
						<span style={{ fontSize: '18px' }}>💬</span>
						<span>WA: Collected</span>
					</button>
				</div>
			</div>
		</div>
	);
}
