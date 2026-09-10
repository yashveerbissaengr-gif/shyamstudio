import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

export const downloadAsJPG = async (element: HTMLElement, filename: string) => {
	const canvas = await html2canvas(element, {
		scale: 2,
		useCORS: true,
		logging: false,
		backgroundColor: "#ffffff",
	});
	const dataUrl = canvas.toDataURL("image/jpeg", 0.95);
	const link = document.createElement("a");
	link.href = dataUrl;
	link.download = filename.endsWith(".jpg") ? filename : `${filename}.jpg`;
	document.body.appendChild(link);
	link.click();
	document.body.removeChild(link);
};

export const downloadAsPDF = async (element: HTMLElement, filename: string) => {
	const canvas = await html2canvas(element, {
		scale: 2,
		useCORS: true,
		logging: false,
		backgroundColor: "#ffffff",
	});
	const imgData = canvas.toDataURL("image/jpeg", 0.98);
	const pdf = new jsPDF({
		orientation: "portrait",
		unit: "mm",
		format: "a4",
	});
	const pdfWidth = pdf.internal.pageSize.getWidth(); // 210mm
	const pdfMaxHeight = pdf.internal.pageSize.getHeight(); // 297mm

	let renderWidth = pdfWidth;
	let renderHeight = (canvas.height * pdfWidth) / canvas.width;

	// Scale down if height exceeds 1 A4 page to prevent blank 2nd page
	if (renderHeight > pdfMaxHeight) {
		renderHeight = pdfMaxHeight;
		renderWidth = (canvas.width * pdfMaxHeight) / canvas.height;
	}

	const xOffset = (pdfWidth - renderWidth) / 2;
	pdf.addImage(imgData, "JPEG", xOffset, 0, renderWidth, renderHeight);
	pdf.save(filename.endsWith(".pdf") ? filename : `${filename}.pdf`);
};
