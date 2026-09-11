import re

def fix_file(filepath):
    with open(filepath, "r") as f:
        content = f.read()

    # Find handleDownloadPDF
    pdf_pattern = r'const handleDownloadPDF = async \(\) => \{.*?\};'
    
    new_pdf = """const handleDownloadPDF = async () => {
		saveSilently();
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
		
		// Small delay to let browser reflow
		await new Promise(r => setTimeout(r, 100));
		
		try {
			await downloadAsPDF(el, `${filepath.startswith('src/pages/Invoice') ? 'invoice_' + '${invoiceNo}' : 'bill_' + '${billNo}'}.pdf`);
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

    # We need to make sure the template string uses the right variable for the filename
    if "Invoice" in filepath:
        new_pdf = new_pdf.replace("`${filepath.startswith('src/pages/Invoice') ? 'invoice_' + '${invoiceNo}' : 'bill_' + '${billNo}'}.pdf`", "`invoice_${invoiceNo}.pdf`")
    else:
        new_pdf = new_pdf.replace("`${filepath.startswith('src/pages/Invoice') ? 'invoice_' + '${invoiceNo}' : 'bill_' + '${billNo}'}.pdf`", "`bill_${billNo}.pdf`")

    content = re.sub(pdf_pattern, new_pdf, content, flags=re.DOTALL)

    # Find handleDownloadJPG
    jpg_pattern = r'const handleDownloadJPG = async \(\) => \{.*?\};'
    
    new_jpg = """const handleDownloadJPG = async () => {
		saveSilently();
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
		
		// Small delay to let browser reflow
		await new Promise(r => setTimeout(r, 100));
		
		try {
			await downloadAsJPG(el, `${filepath.startswith('src/pages/Invoice') ? 'invoice_' + '${invoiceNo}' : 'bill_' + '${billNo}'}.jpg`);
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

    if "Invoice" in filepath:
        new_jpg = new_jpg.replace("`${filepath.startswith('src/pages/Invoice') ? 'invoice_' + '${invoiceNo}' : 'bill_' + '${billNo}'}.jpg`", "`invoice_${invoiceNo}.jpg`")
    else:
        new_jpg = new_jpg.replace("`${filepath.startswith('src/pages/Invoice') ? 'invoice_' + '${invoiceNo}' : 'bill_' + '${billNo}'}.jpg`", "`bill_${billNo}.jpg`")

    content = re.sub(jpg_pattern, new_jpg, content, flags=re.DOTALL)

    with open(filepath, "w") as f:
        f.write(content)

fix_file("src/pages/BillGenerator.tsx")
if __import__('os').path.exists("src/pages/InvoiceGenerator.tsx"):
    fix_file("src/pages/InvoiceGenerator.tsx")

print("Fixed download handlers")
