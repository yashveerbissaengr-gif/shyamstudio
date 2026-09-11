import re
import os

if not os.path.exists("src/pages/InvoiceGenerator.tsx"):
    print("No InvoiceGenerator.tsx")
    exit(0)

with open("src/pages/InvoiceGenerator.tsx", "r") as f:
    content = f.read()

# Fix docRef duplicate
content = content.replace('<div className="bill-wrapper" ref={docRef}>', '<div className="bill-wrapper">')

# Fix line class
content = content.replace(
    '.bill-container .line { flex:1; min-width:0; min-height: 1.2em; border-bottom:1.5px solid var(--ink); display:inline-block; }',
    '.bill-container .line { flex:1; min-width:0; min-height: 1.2em; border-bottom:1.5px solid var(--ink); display:block; vertical-align:bottom; }'
)

# Fix spans
old_meta = """              <div className="meta">
                <span>No. <span style={{ borderBottom:"2px solid var(--red)", color:"var(--red)", fontWeight:"bold", fontSize:"20px", padding:"0 8px" }}>{invoiceNo}</span></span>
                <span>Date :- <span style={{borderBottom:'1.5px solid #111', padding:'0 8px'}}>{date}</span></span>
              </div>"""

new_meta = """              <div className="meta">
                <span>No. <span style={{ display:"inline-block", borderBottom:"2px solid var(--red)", color:"var(--red)", fontWeight:"bold", fontSize:"20px", padding:"0 8px", lineHeight:"1" }}>{invoiceNo}</span></span>
                <span>Date :- <span style={{ display:"inline-block", borderBottom:'1.5px solid #111', padding:'0 8px', lineHeight:"1" }}>{date}</span></span>
              </div>"""
content = content.replace(old_meta, new_meta)

# Fix downloads
old_pdf = """		const handleDownloadPDF = async () => {
			saveSilently();
			if (!docRef.current) return;
			setDownloading(true);
			try {
				await downloadAsPDF(docRef.current, `invoice_${invoiceNo}.pdf`);
			} catch (e) {
				console.error(e);
				alert("Failed to generate PDF");
			} finally {
				setDownloading(false);
			}
		};"""

new_pdf = """		const handleDownloadPDF = async () => {
			saveSilently();
			if (!docRef.current) return;
			setDownloading(true);
			const el = docRef.current;
			const origTransform = el.style.transform;
			const origOrigin = el.style.transformOrigin;
			el.style.transform = 'none';
			el.style.transformOrigin = 'unset';
			await new Promise(r => setTimeout(r, 50));
			try {
				await downloadAsPDF(el, `invoice_${invoiceNo}.pdf`);
			} catch (e) {
				console.error(e);
				alert("Failed to generate PDF");
			} finally {
				el.style.transform = origTransform;
				el.style.transformOrigin = origOrigin;
				setDownloading(false);
			}
		};"""
content = content.replace(old_pdf, new_pdf)

old_jpg = """		const handleDownloadJPG = async () => {
			saveSilently();
			if (!docRef.current) return;
			setDownloading(true);
			try {
				await downloadAsJPG(docRef.current, `invoice_${invoiceNo}.jpg`);
			} catch (e) {
				console.error(e);
				alert("Failed to generate JPG");
			} finally {
				setDownloading(false);
			}
		};"""

new_jpg = """		const handleDownloadJPG = async () => {
			saveSilently();
			if (!docRef.current) return;
			setDownloading(true);
			const el = docRef.current;
			const origTransform = el.style.transform;
			const origOrigin = el.style.transformOrigin;
			el.style.transform = 'none';
			el.style.transformOrigin = 'unset';
			await new Promise(r => setTimeout(r, 50));
			try {
				await downloadAsJPG(el, `invoice_${invoiceNo}.jpg`);
			} catch (e) {
				console.error(e);
				alert("Failed to generate JPG");
			} finally {
				el.style.transform = origTransform;
				el.style.transformOrigin = origOrigin;
				setDownloading(false);
			}
		};"""
content = content.replace(old_jpg, new_jpg)

with open("src/pages/InvoiceGenerator.tsx", "w") as f:
    f.write(content)

print("Patched InvoiceGenerator.tsx")
