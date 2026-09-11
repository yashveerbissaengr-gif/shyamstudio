import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import { useRef, useState } from "react";
import { useParams } from "react-router-dom";
import "../components/invoice/Invoice.css";
import { InvoicePage1 } from "../components/invoice/InvoicePage1";
import { InvoicePage2 } from "../components/invoice/InvoicePage2";
import { InvoicePage3 } from "../components/invoice/InvoicePage3";
import { InvoiceToolbar } from "../components/invoice/InvoiceToolbar";
import { storage } from "../services/storage";
import type { PaymentMethod, Row, ScheduleRow } from "../types/invoice";

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
	const existing = routeId ? storage.getInvoiceById(routeId) : null;

	const [id, setId] = useState(() => existing?.id || crypto.randomUUID());
	const [invoiceNo, setInvoiceNo] = useState(() => existing?.invoiceNo || storage.getNextInvoiceNumber());
	const [date, setDate] = useState(() => existing?.date || new Date().toLocaleDateString("en-GB"));
	const [customerName, setCustomerName] = useState(existing?.customerName || "");
	const [customerMobile, setCustomerMobile] = useState(existing?.customerMobile || "");

	const [zoom, setZoom] = useState(100);
	const [items, setItems] = useState<Row[]>(existing?.items || defaultItems);
	const [schedule, setSchedule] = useState<ScheduleRow[]>(existing?.schedule || defaultSchedule);
	const [showSchedule, setShowSchedule] = useState(true);
	const [payMethods, setPayMethods] = useState<PaymentMethod[]>(existing?.payMethods || defaultPaymentMethods);
	const [showPaymentMethod, setShowPaymentMethod] = useState(true);
	const [showServiceDetails, setShowServiceDetails] = useState(true);
	const [downloading, setDownloading] = useState(false);
	const docRef = useRef<HTMLDivElement>(null);

	const isEditable = storage.canEditInvoice(id);
	const status = existing?.status || 'ACTIVE';
	const isCancelled = status === "CANCELLED";

	const autoSave = () => {
		if (!isEditable && !isCancelled) return;
		storage.saveInvoice({
			id,
			invoiceNo,
			date,
			customerName,
			customerMobile,
			items,
			schedule,
			payMethods,
			createdAt: existing?.createdAt || Date.now(),
			status: status
		});
	};

	// Removed auto-save useEffect to prevent accidental saving of blank documents

	const recalcItem = (id: string, field: keyof Row, val: string) => {
		setItems((prev) =>
			prev.map((r) => {
				if (r.id !== id) return r;
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

	const handleDownloadPDF = async () => {
		autoSave();
		if (!docRef.current) return;
		setDownloading(true);
		try {
			const pages = docRef.current.querySelectorAll(".a4-page");
			const pdf = new jsPDF("p", "mm", "a4");

			for (let i = 0; i < pages.length; i++) {
				const pageEl = pages[i] as HTMLElement;
				const noPrintEls = pageEl.querySelectorAll(".no-print");
				noPrintEls.forEach((el) => ((el as HTMLElement).style.display = "none"));

				const canvas = await html2canvas(pageEl, {
					scale: 2,
					useCORS: true,
					logging: false,
				});

				noPrintEls.forEach((el) => ((el as HTMLElement).style.display = ""));

				const imgData = canvas.toDataURL("image/jpeg", 0.95);
				if (i > 0) pdf.addPage();
				pdf.addImage(imgData, "JPEG", 0, 0, 210, 297);
			}
			pdf.save(`invoice_${invoiceNo}.pdf`);
		} catch (err) {
			console.error(err);
			alert("Error generating PDF");
		} finally {
			setDownloading(false);
		}
	};

	const handleDownloadJPG = async () => {
		autoSave();
		if (!docRef.current) return;
		setDownloading(true);
		try {
			const firstPage = docRef.current.querySelector(".a4-page") as HTMLElement;
			if (firstPage) {
				const canvas = await html2canvas(firstPage, {
					scale: 2,
					useCORS: true,
					logging: false,
				});
				const dataUrl = canvas.toDataURL("image/jpeg", 0.95);
				const link = document.createElement("a");
				link.href = dataUrl;
				link.download = `invoice_${invoiceNo}.jpg`;
				document.body.appendChild(link);
				link.click();
				document.body.removeChild(link);
			}
		} catch (err) {
			console.error(err);
			alert("Error generating JPG");
		} finally {
			setDownloading(false);
		}
	};

	const handleSendWhatsApp = async (type: 'booking' | 'completed' | 'collected') => {
		autoSave();
		let targetMobile = customerMobile;
		if (!targetMobile) {
			const input = prompt("Please enter the customer's WhatsApp number:");
			if (!input) return;
			targetMobile = input;
		}
		
		let cleanMobile = targetMobile.replace(/\D/g, "");
		if (cleanMobile.length === 10) {
			cleanMobile = "91" + cleanMobile; // Assume India if 10 digits
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

		const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
		
		// Open new tab immediately to prevent browser popup blockers on desktop
		let waWindow: Window | null = null;
		if (!isMobile) {
			waWindow = window.open('about:blank', '_blank');
		}

		const encoded = encodeURIComponent(message);
		const waUrl = `https://wa.me/${cleanMobile}?text=${encoded}`;
		
		if (isMobile) {
			window.location.href = waUrl;
		} else if (waWindow) {
			waWindow.location.href = waUrl;
		} else {
			window.open(waUrl, "_blank");
		}
	};

	const onNewDoc = () => {
		if (window.confirm("Clear all data and start new?")) {
			setId(crypto.randomUUID());
			setInvoiceNo(storage.getNextInvoiceNumber());
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
			}}
		>
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
			<InvoiceToolbar
				zoom={zoom}
				setZoom={setZoom}
				onNewDoc={onNewDoc}
				onSave={() => {
					autoSave();
					alert("Invoice saved successfully!");
				}}
				onPrint={() => {
					autoSave();
					window.print();
				}}
				onDownloadPDF={handleDownloadPDF}
				onDownloadJPG={handleDownloadJPG}
				downloading={downloading}
			/>

			<div className="inv-canvas">
				<div
					className="doc-wrapper"
					ref={docRef}
					style={{
						transform: `scale(${zoom / 100})`,
						transformOrigin: "top center",
						transition: "transform 0.2s ease",
					}}
				>
					<InvoicePage1
						invoiceNo={invoiceNo}
						date={date}
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
					/>
					<InvoicePage2 />
					<InvoicePage3
						showPaymentMethod={showPaymentMethod}
						setShowPaymentMethod={setShowPaymentMethod}
						payMethods={payMethods}
						setPayMethods={setPayMethods}
						uid={uid}
					/>
				</div>
			</div>
		</div>
	);
}
