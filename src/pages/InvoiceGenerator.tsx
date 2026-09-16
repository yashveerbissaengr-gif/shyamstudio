import { useRef, useState, useEffect, type CSSProperties } from "react";
import { useParams } from "react-router-dom";
import "../components/invoice/Invoice.css";
import { InvoicePage1 } from "../components/invoice/InvoicePage1";
import { InvoicePage2 } from "../components/invoice/InvoicePage2";
import { InvoicePage3 } from "../components/invoice/InvoicePage3";
import { InvoiceToolbar } from "../components/invoice/InvoiceToolbar";
import { storage } from "../services/storage";
import type { PaymentMethod, Row, ScheduleRow } from "../types/invoice";
import { downloadMultiPagePDFFromNodes, shareOrDownloadBlob, buildPDFFromNodes, sharePDFViaWhatsApp, openWhatsAppChat } from "../utils/downloadHelper";

const uid = () => Math.random().toString(36).substring(2, 9);

const defaultItems: Row[] = [
	{
		id: uid(),
		desc: "Pre-wedding shoot (1 Day)",
		qty: "1",
		rate: "15000",
		amount: "15000",
	},
	{
		id: uid(),
		desc: "Traditional Photo & Video (2 Days)",
		qty: "1",
		rate: "30000",
		amount: "30000",
	},
];

const defaultSchedule: ScheduleRow[] = [
	{
		id: uid(),
		time: "09:00 AM",
		fn: "Haldi",
		date: "25/11/2026",
		venue: "Deep Nagar, Nagpur",
	},
	{
		id: uid(),
		time: "07:00 PM",
		fn: "Sangeet",
		date: "25/11/2026",
		venue: "Taj Hotel",
	},
];

const defaultPaymentMethods: PaymentMethod[] = [
	{ id: uid(), label: "Cash Payment", checked: true },
	{ id: uid(), label: "Bank Transfer (NEFT/RTGS)", checked: true },
	{ id: uid(), label: "UPI (GPay / PhonePe / Paytm)", checked: true },
	{ id: uid(), label: "Cheque (Subject to realization)", checked: false },
];

export function InvoiceGenerator() {
	const { id: routeId } = useParams();
	
	const [id, setId] = useState<string>(() => crypto.randomUUID());
	const [invoiceNo, setInvoiceNo] = useState("");
	const [date, setDate] = useState(() => new Date().toLocaleDateString("en-GB"));
	const [customerName, setCustomerName] = useState("");
	const [customerMobile, setCustomerMobile] = useState("");

	const [zoom, setZoom] = useState(100);
	const [items, setItems] = useState<Row[]>(defaultItems);
	const [schedule, setSchedule] = useState<ScheduleRow[]>(defaultSchedule);
	const [showSchedule, setShowSchedule] = useState(true);
	const [payMethods, setPayMethods] = useState<PaymentMethod[]>(defaultPaymentMethods);
	const [showPaymentMethod, setShowPaymentMethod] = useState(true);
	const [showServiceDetails, setShowServiceDetails] = useState(true);
	const [downloading, setDownloading] = useState(false);
	const [isExporting, setIsExporting] = useState(false);
	const docRef = useRef<HTMLDivElement>(null);

	const [isEditable, setIsEditable] = useState(true);
	const [status, setStatus] = useState<'ACTIVE' | 'CANCELLED'>('ACTIVE');
	const isCancelled = status === "CANCELLED";
	const [createdAt, setCreatedAt] = useState(Date.now());

	useEffect(() => {
		let isMounted = true;
		const init = async () => {
			if (routeId) {
				const existing = await storage.getInvoiceById(routeId);
				if (existing && isMounted) {
					setId(existing.id);
					setInvoiceNo(existing.invoiceNo);
					setDate(existing.date);
					setCustomerName(existing.customerName);
					setCustomerMobile(existing.customerMobile);
					setItems(existing.items);
					setSchedule(existing.schedule);
					setPayMethods(existing.payMethods);
					setStatus(existing.status || 'ACTIVE');
					setCreatedAt(existing.createdAt);
					const editable = await storage.canEditInvoice(existing.id);
					setIsEditable(editable);
				}
			} else {
				const nextNo = await storage.getNextInvoiceNumber();
				if (isMounted) setInvoiceNo(nextNo);
			}
		};
		init();
		return () => { isMounted = false; };
	}, [routeId]);

	// Auto-zoom to fit viewport on mobile — uses CSS `zoom` (layout-aware)
	// so the full 794px A4 width stays visible instead of getting clipped
	// to half (which transform:scale + overflow-x:hidden caused on phones).
	const canvasRef = useRef<HTMLDivElement>(null);
	const A4_WIDTH_PX = 794; // 210mm at 96dpi

	useEffect(() => {
		setZoom(100);
	}, []);

	const autoSave = async () => {
		if (!isEditable && !isCancelled) return;
		await storage.saveInvoice({
			id,
			invoiceNo,
			date,
			customerName,
			customerMobile,
			items,
			schedule,
			payMethods,
			createdAt,
			status
		});
	};

	const recalcItem = (rowId: string, field: keyof Row, val: string) => {
		setItems((prev) =>
			prev.map((r) => {
				if (r.id !== rowId) return r;
				const nextR = { ...r, [field]: val };
				if (field === "qty" || field === "rate") {
					const q = parseFloat(nextR.qty) || 0;
					const rt = parseFloat(nextR.rate) || 0;
					nextR.amount = (q * rt).toString();
				}
				return nextR;
			}),
		);
	};

	const subtotal = items.reduce((sum, r) => sum + (parseFloat(r.amount) || 0), 0);

	const handleDownloadPDF = async (isPrint = false, printWindow: Window | null = null) => {
		try {
			await autoSave();
		} catch (e) {
			console.error(e);
		}
		const el = docRef.current;
		if (!el) {
			if (printWindow) printWindow.close();
			return;
		}

		setDownloading(true);
		setIsExporting(true);

		// Let contentEditable fields settle into read-only render
		await new Promise((r) => setTimeout(r, 150));

		try {

			// Capture each A4 page node directly — html-to-image clones the node
			// itself, so phone viewport width / scroll / zoom can't clip it to half.
			const pages = Array.from(el.querySelectorAll<HTMLElement>(".a4-page"));
			if (pages.length === 0) throw new Error("No pages found");

			if (isPrint === true) {
				const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
				if (isMobile) {
					// On phones `window.open(blobURL)` printing is unreliable —
					// generate the PDF and hand it to the native Share sheet so the
					// user can save / print the FULL layout from their phone.
					if (printWindow) printWindow.close();
					const pdfBlob = await buildPDFFromNodes(pages);
					await shareOrDownloadBlob(pdfBlob, `Invoice_${invoiceNo}.pdf`);
				} else if (printWindow) {
					const { jsPDF } = await import("jspdf");
					const pdf = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait" });
					const { toJpeg } = await import("html-to-image");
					try {
						await document.fonts?.ready;
					} catch {
						/* ignore */
					}
					for (let i = 0; i < pages.length; i++) {
						const dataUrl = await toJpeg(pages[i], {
							quality: 0.92,
							pixelRatio: 2,
							backgroundColor: "#ffffff",
							cacheBust: true,
						});
						if (i > 0) pdf.addPage("a4", "portrait");
						pdf.addImage(dataUrl, "JPEG", 0, 0, 210, 297);
					}
					pdf.autoPrint({ variant: "non-conform" });
					printWindow.location.href = pdf.output("bloburl").toString();
				} else {
					await downloadMultiPagePDFFromNodes(pages, `Invoice_${invoiceNo}.pdf`);
				}
			} else {
				if (printWindow) printWindow.close();
				await downloadMultiPagePDFFromNodes(pages, `Invoice_${invoiceNo}.pdf`);
			}
		} catch (error) {
			console.error("Error generating PDF:", error);
			if (printWindow) printWindow.close();
			// Fallback to print
			try {
				window.print();
			} catch {
				alert("Failed to generate PDF. Please try Print instead.");
			}
		} finally {
			setIsExporting(false);
			setDownloading(false);
		}
	};

	const handleSendWhatsApp = async (type: 'booking' | 'completed' | 'collected') => {
		try {
			await autoSave();
		} catch (e) {
			console.error(e);
		}
		let targetMobile = customerMobile;
		if (!targetMobile) {
			const input = prompt("Please enter the customer's WhatsApp number:");
			if (!input) return;
			targetMobile = input;
		}

		const subTotal = items.reduce((acc, row) => acc + (parseFloat(row.amount) || 0), 0);
		const totalStr = subTotal.toString();
		const itemsList = items.map(item => `- ${item.desc} - ₹${item.amount || 0}`).join('\n');

		let message = "";
		if (type === 'booking') {
			message = `Dear Customer,\nShyam photo studio Thank's You\nFor Booking:\n${itemsList}\nYour Job ID is: ${invoiceNo}\nDATE : ${date}`;
		} else if (type === 'completed') {
			message = `Dear Customer,\nYour Job ID : ${invoiceNo}\nIs completed Please Collect Your Job\nBalance Amt : ${totalStr}\nFrom Shyam photo studio`;
		} else if (type === 'collected') {
			message = `Dear Customer,\nThank You For Successfully Collected Your Job\nJob Code : ${invoiceNo}\nFrom Shyam photo studio`;
		}

		// Direct PDF send: generate the full invoice PDF, then hand the FILE +
		// message to the system Share sheet so the user picks WhatsApp and the
		// PDF arrives attached. Falls back to text-only chat + download.
		const filename = `Invoice_${invoiceNo}.pdf`;
		setDownloading(true);
		setIsExporting(true);
		try {
			await new Promise((r) => setTimeout(r, 150));
			const el = docRef.current;
			if (!el) throw new Error("Invoice not ready");
			const pages = Array.from(el.querySelectorAll<HTMLElement>(".a4-page"));
			if (pages.length === 0) throw new Error("No pages found");
			const pdfBlob = await buildPDFFromNodes(pages);
			const shared = await sharePDFViaWhatsApp(pdfBlob, filename, message);
			if (!shared) {
				// Desktop / no file-share support: download PDF so it can be
				// attached manually, then open the customer chat with the text.
				await shareOrDownloadBlob(pdfBlob, filename);
				openWhatsAppChat(targetMobile, message);
			}
		} catch (e) {
			console.error("Failed to send invoice PDF via WhatsApp:", e);
			try {
				openWhatsAppChat(targetMobile, message);
			} catch {
				/* ignore */
			}
		} finally {
			setIsExporting(false);
			setDownloading(false);
		}
	};

	const onNewDoc = async () => {
		if (window.confirm("Clear all data and start new?")) {
			setId(crypto.randomUUID());
			const nextNo = await storage.getNextInvoiceNumber();
			setInvoiceNo(nextNo);
			setDate(new Date().toLocaleDateString("en-GB"));
			setCustomerName("");
			setCustomerMobile("");
			setItems([{ id: uid(), desc: "", qty: "1", rate: "0", amount: "0" }]);
			setSchedule([{ id: uid(), time: "", fn: "", date: "", venue: "" }]);
			setPayMethods(defaultPaymentMethods);
			setShowSchedule(true);
			setShowPaymentMethod(true);
			setShowServiceDetails(true);
		}
	};

	return (
		<div
			className="invoice-editor-root"
			style={{
				minHeight: "100vh",
				background: "#f0f2f5",
				fontFamily: '"Inter", sans-serif',
				display: "flex",
				flexDirection: "column",
			}}
		>
			{/* TOOLBAR: Row 1 = Dashboard + WA buttons, Row 2 = formatting + zoom + downloads */}
			<InvoiceToolbar
				zoom={zoom}
				setZoom={setZoom}
				onNewDoc={onNewDoc}
				onSave={async () => {
					await autoSave();
					alert("Invoice saved successfully!");
				}}
			onPrint={async () => {
					await autoSave();
					const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
					if (isMobile) {
						handleDownloadPDF(true, null);
					} else {
						const w = window.open("about:blank", "_blank");
						handleDownloadPDF(true, w);
					}
				}}
				onDownloadPDF={() => handleDownloadPDF(false)}
				downloading={downloading}
				onWABooked={() => handleSendWhatsApp('booking')}
				onWAReady={() => handleSendWhatsApp('completed')}
				onWACollected={() => handleSendWhatsApp('collected')}
			/>

			<div
				className="inv-canvas"
				ref={canvasRef}
			>
				<div
					className="inv-layout-scale"
					style={{
						position: "relative",
						width: `${794 * (zoom / 100)}px`,
						height: `${3406 * (zoom / 100)}px`,
					} as CSSProperties}
				>
					<div
						className="doc-wrapper"
						ref={docRef}
						style={{
							position: "absolute",
							top: 0,
							left: 0,
							transform: `scale(${zoom / 100})`,
							transformOrigin: "top left",
						} as CSSProperties}
					>
					<InvoicePage1
						invoiceNo={invoiceNo}
						date={date}
						setDate={setDate}
						customerName={customerName}
						setCustomerName={setCustomerName}
						customerMobile={customerMobile}
						setCustomerMobile={setCustomerMobile}
						showSchedule={showSchedule}
						setShowSchedule={setShowSchedule}
						schedule={schedule}
						setSchedule={setSchedule}
						showServiceDetails={showServiceDetails}
						setShowServiceDetails={setShowServiceDetails}
						items={items}
						setItems={setItems}
						recalcItem={recalcItem}
						subtotal={subtotal}
						uid={uid}
						readOnly={isExporting}
					/>
					<InvoicePage2 readOnly={isExporting} />
					<InvoicePage3
						showPaymentMethod={showPaymentMethod}
						setShowPaymentMethod={setShowPaymentMethod}
						payMethods={payMethods}
						setPayMethods={setPayMethods}
						uid={uid}
						readOnly={isExporting}
					/>
				</div>
				</div>
			</div>

			{/* MOBILE BOTTOM DOCK — always visible on phones: Print / PDF + 3 WhatsApp */}
			<div className="inv-mobile-dock no-print">
				<div className="inv-mobile-dock-grid">
					<button
						className="inv-mobile-dock-btn"
						style={{ background: "#f1f5f9", color: "#334155" }}
						onClick={async () => {
							await autoSave();
							handleDownloadPDF(true, null);
						}}
					>
						<span style={{ fontSize: "18px" }}>🖨</span>
						<span>Print</span>
					</button>
					<button
						className="inv-mobile-dock-btn"
						style={{ background: "#fef2f2", color: "#b91c1c" }}
						disabled={downloading}
						onClick={() => handleDownloadPDF(false)}
					>
						<span style={{ fontSize: "18px" }}>📄</span>
						<span>{downloading ? "⏳" : "PDF"}</span>
					</button>
					<button
						className="inv-mobile-dock-btn"
						style={{ background: "#0f766e", color: "#fff" }}
						onClick={async () => {
							await autoSave();
							alert("Invoice saved successfully!");
						}}
					>
						<span style={{ fontSize: "18px" }}>💾</span>
						<span>Save</span>
					</button>
				</div>
				<div className="inv-mobile-dock-grid">
					<button
						className="inv-mobile-dock-btn"
						style={{ background: "#25D366", color: "#fff" }}
						onClick={() => handleSendWhatsApp("booking")}
						title="Send invoice PDF via WhatsApp"
					>
						<span style={{ fontSize: "18px" }}>💬</span>
						<span>WA: Booked</span>
					</button>
					<button
						className="inv-mobile-dock-btn"
						style={{ background: "#128C7E", color: "#fff" }}
						onClick={() => handleSendWhatsApp("completed")}
						title="Send invoice PDF via WhatsApp"
					>
						<span style={{ fontSize: "18px" }}>💬</span>
						<span>WA: Ready</span>
					</button>
					<button
						className="inv-mobile-dock-btn"
						style={{ background: "#075E54", color: "#fff" }}
						onClick={() => handleSendWhatsApp("collected")}
						title="Send invoice PDF via WhatsApp"
					>
						<span style={{ fontSize: "18px" }}>💬</span>
						<span>WA: Collected</span>
					</button>
				</div>
			</div>
		</div>
	);
}
