import { toJpeg } from "html-to-image";
import { jsPDF } from "jspdf";

const A4_W_MM = 210;
const A4_H_MM = 297;

export const isMobileDevice = () =>
	typeof navigator !== "undefined" && /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

// Lower pixel ratio on phones to avoid OOM / blank captures on iOS Safari.
const getPixelRatio = () => (isMobileDevice() ? 1.5 : 2);

const excludeNoPrint = (node: HTMLElement) => {
	if (node instanceof HTMLElement) {
		if (
			node.classList?.contains("no-print") ||
			node.classList?.contains("doc-add-row") ||
			node.classList?.contains("doc-del-row")
		) {
			return false;
		}
	}
	return true;
};

async function nodeToJpegDataUrl(node: HTMLElement): Promise<string> {
	try {
		await document.fonts?.ready;
	} catch {
		/* ignore */
	}
	return toJpeg(node, {
		quality: 0.92,
		pixelRatio: getPixelRatio(),
		backgroundColor: "#ffffff",
		cacheBust: true,
		filter: excludeNoPrint,
		// Neutralise any responsive shrinking on the clone so the full
		// fixed-width (794px / 210mm) layout is captured even on a 360px phone.
		style: {
			transform: "none",
			margin: "0 auto",
		} as Partial<CSSStyleDeclaration>,
	});
}

function dataUrlToBlob(dataUrl: string): Blob {
	const [header, base64] = dataUrl.split(",");
	const mime = header.match(/:(.*?);/)?.[1] || "image/jpeg";
	const binary = atob(base64);
	const arr = new Uint8Array(binary.length);
	for (let i = 0; i < binary.length; i++) arr[i] = binary.charCodeAt(i);
	return new Blob([arr], { type: mime });
}

/** iOS Safari ignores <a download> — use native Share sheet when possible. */
export async function shareOrDownloadBlob(
	blob: Blob,
	filename: string,
): Promise<"shared" | "downloaded"> {
	const mime = blob.type || "application/octet-stream";
	try {
		const file = new File([blob], filename, { type: mime });
		if (
			typeof navigator !== "undefined" &&
			"canShare" in navigator &&
			navigator.canShare({ files: [file] })
		) {
			try {
				await navigator.share({ files: [file], title: filename });
				return "shared";
			} catch (err: unknown) {
				if (err instanceof Error && err.name === "AbortError") return "shared";
				// fall through to download
			}
		}
	} catch {
		/* fall through */
	}

	const url = URL.createObjectURL(blob);
	try {
		const a = document.createElement("a");
		a.href = url;
		a.download = filename;
		a.rel = "noopener";
		document.body.appendChild(a);
		a.click();
		a.remove();
	} finally {
		setTimeout(() => URL.revokeObjectURL(url), 8000);
	}

	// Extra fallback for iOS where the download attribute is ignored:
	// opening the blob gives the user a way to save/share it manually.
	if (isMobileDevice()) {
		try {
			window.open(url, "_blank");
		} catch {
			/* ignore */
		}
	}
	return "downloaded";
}

export const downloadAsJPG = async (element: HTMLElement, filename: string) => {
	const name = filename.endsWith(".jpg") ? filename : `${filename}.jpg`;
	const dataUrl = await nodeToJpegDataUrl(element);
	await shareOrDownloadBlob(dataUrlToBlob(dataUrl), name);
};

/** Single element (bill) → fitted onto A4 pages, slicing if taller than 1 page. */
export const downloadAsPDF = async (element: HTMLElement, filename: string) => {
	const name = filename.endsWith(".pdf") ? filename : `${filename}.pdf`;
	const dataUrl = await nodeToJpegDataUrl(element);

	const img = await new Promise<HTMLImageElement>((resolve, reject) => {
		const i = new Image();
		i.onload = () => resolve(i);
		i.onerror = reject;
		i.src = dataUrl;
	});

	const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
	const imgAspect = img.naturalWidth / img.naturalHeight;
	// Full-width render height in mm
	const fullH = A4_W_MM / imgAspect;

	if (fullH <= A4_H_MM + 1) {
		pdf.addImage(dataUrl, "JPEG", 0, 0, A4_W_MM, fullH);
	} else {
		// Slice the tall image across multiple A4 pages via canvas crops
		const pageCount = Math.ceil(fullH / A4_H_MM);
		const srcW = img.naturalWidth;
		const srcHPerPage = Math.floor(srcW * (A4_H_MM / A4_W_MM));
		const canvas = document.createElement("canvas");
		canvas.width = srcW;
		canvas.height = srcHPerPage;
		const ctx = canvas.getContext("2d");

		for (let p = 0; p < pageCount; p++) {
			const sy = p * srcHPerPage;
			const sh = Math.min(srcHPerPage, img.naturalHeight - sy);
			if (sh <= 0) break;
			if (ctx) {
				ctx.fillStyle = "#ffffff";
				ctx.fillRect(0, 0, canvas.width, canvas.height);
				ctx.drawImage(img, 0, sy, srcW, sh, 0, 0, srcW, sh);
				const sliceUrl = canvas.toDataURL("image/jpeg", 0.92);
				const sliceH =
					sh === srcHPerPage ? A4_H_MM : (sh / srcW) * A4_W_MM;
				if (p > 0) pdf.addPage("a4", "portrait");
				pdf.addImage(sliceUrl, "JPEG", 0, 0, A4_W_MM, sliceH);
			}
		}
	}

	const pdfBlob = pdf.output("blob") as Blob;
	await shareOrDownloadBlob(pdfBlob, name);
};

/** One PDF page per source node — used for the 3-page invoice. */
export const downloadMultiPagePDFFromNodes = async (
	nodes: HTMLElement[],
	filename: string,
) => {
	const name = filename.endsWith(".pdf") ? filename : `${filename}.pdf`;
	const pdf = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait" });

	for (let i = 0; i < nodes.length; i++) {
		const dataUrl = await nodeToJpegDataUrl(nodes[i]);
		if (i > 0) pdf.addPage("a4", "portrait");
		pdf.addImage(dataUrl, "JPEG", 0, 0, A4_W_MM, A4_H_MM);
	}

	const pdfBlob = pdf.output("blob") as Blob;
	await shareOrDownloadBlob(pdfBlob, name);
};

/** Returns the PDF as a Blob (for WhatsApp share flows) using full-width capture. */
export const buildPDFFromNodes = async (
	nodes: HTMLElement[],
): Promise<Blob> => {
	const pdf = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait" });
	for (let i = 0; i < nodes.length; i++) {
		const dataUrl = await nodeToJpegDataUrl(nodes[i]);
		if (i > 0) pdf.addPage("a4", "portrait");
		pdf.addImage(dataUrl, "JPEG", 0, 0, A4_W_MM, A4_H_MM);
	}
	return pdf.output("blob") as Blob;
};

export const buildPDFFromElement = async (
	element: HTMLElement,
): Promise<Blob> => {
	const dataUrl = await nodeToJpegDataUrl(element);
	const img = await new Promise<HTMLImageElement>((resolve, reject) => {
		const i = new Image();
		i.onload = () => resolve(i);
		i.onerror = reject;
		i.src = dataUrl;
	});
	const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
	const renderH = (img.naturalHeight * A4_W_MM) / img.naturalWidth;
	const h = Math.min(renderH, A4_H_MM);
	pdf.addImage(dataUrl, "JPEG", 0, 0, A4_W_MM, h);
	return pdf.output("blob") as Blob;
};

/**
 * Try to send a PDF + message DIRECTLY via the system Share sheet
 * (user picks WhatsApp → picks customer → PDF arrives attached with caption).
 * Returns true if the share UI was completed/dismissed with the file handed off.
 * Returns false when file-sharing isn't supported so the caller can fall back
 * to download + wa.me text link.
 */
export const sharePDFViaWhatsApp = async (
	pdfBlob: Blob,
	filename: string,
	message: string,
): Promise<boolean> => {
	try {
		const file = new File([pdfBlob], filename, { type: "application/pdf" });
		if (
			typeof navigator !== "undefined" &&
			"canShare" in navigator &&
			navigator.canShare({ files: [file] })
		) {
			try {
				await navigator.share({ files: [file], title: filename, text: message });
				return true;
			} catch (err: unknown) {
				// User dismissing the sheet still means they saw the option;
				// treat Abort as handled so we don't also pop a wa.me tab.
				if (err instanceof Error && err.name === "AbortError") return true;
				return false;
			}
		}
	} catch {
		/* not supported */
	}
	return false;
};

/** Open a wa.me chat with prefilled text (text-only fallback). */
export const openWhatsAppChat = (mobile: string, message: string) => {
	let clean = mobile.replace(/\D/g, "");
	if (clean.length === 10) clean = `91${clean}`;
	const url = `https://wa.me/${clean}?text=${encodeURIComponent(message)}`;
	const isMobile = isMobileDevice();
	if (isMobile) {
		window.location.href = url;
	} else {
		window.open(url, "_blank");
	}
};
