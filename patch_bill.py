import re

with open("src/pages/BillGenerator.tsx", "r") as f:
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
                <span>No. <span style={{ borderBottom:"2px solid var(--red)", color:"var(--red)", fontWeight:"bold", fontSize:"20px", padding:"0 8px" }}>{billNo}</span></span>
                <span>Date :- <span style={{borderBottom:'1.5px solid #111', padding:'0 8px'}}>{date}</span></span>
              </div>"""

new_meta = """              <div className="meta">
                <span>No. <span style={{ display:"inline-block", borderBottom:"2px solid var(--red)", color:"var(--red)", fontWeight:"bold", fontSize:"20px", padding:"0 8px", lineHeight:"1" }}>{billNo}</span></span>
                <span>Date :- <span style={{ display:"inline-block", borderBottom:'1.5px solid #111', padding:'0 8px', lineHeight:"1" }}>{date}</span></span>
              </div>"""
content = content.replace(old_meta, new_meta)

# Fix downloads
old_pdf = """		const handleDownloadPDF = async () => {
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
				await downloadAsPDF(el, `bill_${billNo}.pdf`);
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
				await downloadAsJPG(docRef.current, `bill_${billNo}.jpg`);
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
				await downloadAsJPG(el, `bill_${billNo}.jpg`);
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

with open("src/pages/BillGenerator.tsx", "w") as f:
    f.write(content)

print("Patched BillGenerator.tsx")
