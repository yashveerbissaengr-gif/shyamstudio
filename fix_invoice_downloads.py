import re

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
                <span>No. <span style={{ textDecoration:"underline", textUnderlineOffset:"4px", textDecorationThickness:"2px", color:"var(--red)", fontWeight:"bold", fontSize:"20px", padding:"0 8px" }}>{invoiceNo}</span></span>
                <span>Date :- <span style={{ textDecoration:"underline", textUnderlineOffset:"4px", textDecorationThickness:"1.5px", padding:"0 8px" }}>{date}</span></span>
              </div>"""
content = content.replace(old_meta, new_meta)

# Make the first bill have id="bill-capture"
content = content.replace(
    'const renderInvoice = () => (',
    'const renderInvoice = (isFirst = false) => ('
)
content = content.replace(
    '<main className="bill">',
    '<main className="bill" id={isFirst ? "bill-capture" : undefined}>'
)
content = content.replace(
    '''						<div className="bill-wrapper">
							{renderInvoice()}''',
    '''						<div className="bill-wrapper">
							{renderInvoice(true)}'''
)

pdf_pattern = r'const handleDownloadPDF = async \(\) => \{.*?\};'
new_pdf = """const handleDownloadPDF = async () => {
		autoSave();
		const el = document.getElementById('bill-capture') as HTMLElement;
		if (!el) return;
		setDownloading(true);
		
		const parent = el.closest('.bill-container') as HTMLElement;
		const origTransform = parent ? parent.style.transform : '';
		const origOrigin = parent ? parent.style.transformOrigin : '';
		if (parent) {
			parent.style.transform = 'none';
			parent.style.transformOrigin = 'unset';
		}
		
		await new Promise(r => setTimeout(r, 100));
		try {
			await (await import('../utils/downloadHelper')).downloadAsPDF(el, `invoice_${invoiceNo}.pdf`);
		} catch (e) {
			console.error(e);
			alert("Failed to generate PDF");
		} finally {
			if (parent) {
				parent.style.transform = origTransform;
				parent.style.transformOrigin = origOrigin;
			}
			setDownloading(false);
		}
	};"""

content = re.sub(pdf_pattern, new_pdf, content, flags=re.DOTALL)

jpg_pattern = r'const handleDownloadJPG = async \(\) => \{.*?\};'
new_jpg = """const handleDownloadJPG = async () => {
		autoSave();
		const el = document.getElementById('bill-capture') as HTMLElement;
		if (!el) return;
		setDownloading(true);
		
		const parent = el.closest('.bill-container') as HTMLElement;
		const origTransform = parent ? parent.style.transform : '';
		const origOrigin = parent ? parent.style.transformOrigin : '';
		if (parent) {
			parent.style.transform = 'none';
			parent.style.transformOrigin = 'unset';
		}
		
		await new Promise(r => setTimeout(r, 100));
		try {
			await (await import('../utils/downloadHelper')).downloadAsJPG(el, `invoice_${invoiceNo}.jpg`);
		} catch (e) {
			console.error(e);
			alert("Failed to generate JPG");
		} finally {
			if (parent) {
				parent.style.transform = origTransform;
				parent.style.transformOrigin = origOrigin;
			}
			setDownloading(false);
		}
	};"""

content = re.sub(jpg_pattern, new_jpg, content, flags=re.DOTALL)

with open("src/pages/InvoiceGenerator.tsx", "w") as f:
    f.write(content)

