with open("src/pages/BillGenerator.tsx", "r") as f:
    content = f.read()

# Fix the gray box issue: hide scrollbar during capture
# Wait, html2canvas config in downloadHelper.ts has 'windowWidth' and 'windowHeight' options which can help,
# but the easiest way is to apply `overflow: hidden` to the element being captured, or capture an element that is NOT scrollable.
# In BillGenerator.tsx, `docRef` is on `.bill-container`. `.bill-container` itself is NOT scrollable.
# The scrollable element is `.bill-canvas`.
# But maybe the gray box is a hover state or something else.
# Wait, look at the screenshot: the gray box is exactly where the scrollbar would be, or where the "print-only" wrapper would be.
# Let's completely remove the print-only wrapper from the DOM during download, or just remove it permanently if they don't print 2-up anymore?
# The user said "in printing its not perfect". If they want to print, they probably still want the A4 2-up format.
# Let's change the gray background of bill-editor-root to white temporarily, or hide scrollbars.

content = content.replace(
    '''			const el = docRef.current;
			const origTransform = el.style.transform;
			const origOrigin = el.style.transformOrigin;
			el.style.transform = 'none';
			el.style.transformOrigin = 'unset';''',
    '''			const el = docRef.current;
			const origTransform = el.style.transform;
			const origOrigin = el.style.transformOrigin;
			el.style.transform = 'none';
			el.style.transformOrigin = 'unset';
            // Hide scrollbars to prevent gray boxes
            const canvasEl = document.querySelector('.bill-canvas') as HTMLElement;
            const origOverflow = canvasEl ? canvasEl.style.overflow : '';
            if (canvasEl) canvasEl.style.overflow = 'hidden';'''
)

content = content.replace(
    '''				el.style.transform = origTransform;
				el.style.transformOrigin = origOrigin;
				setDownloading(false);''',
    '''				el.style.transform = origTransform;
				el.style.transformOrigin = origOrigin;
                const canvasEl = document.querySelector('.bill-canvas') as HTMLElement;
                if (canvasEl) canvasEl.style.overflow = origOverflow;
				setDownloading(false);'''
)

# Fix the strikethrough by using position relative and a pseudo element, or just border-bottom on a block inside an inline-flex.
# Actually, the simplest is inline-flex.
old_meta = """              <div className="meta">
                <span>No. <span style={{ display:"inline-block", borderBottom:"2px solid var(--red)", color:"var(--red)", fontWeight:"bold", fontSize:"20px", padding:"0 8px", lineHeight:"1" }}>{billNo}</span></span>
                <span>Date :- <span style={{ display:"inline-block", borderBottom:'1.5px solid #111', padding:'0 8px', lineHeight:"1" }}>{date}</span></span>
              </div>"""

new_meta = """              <div className="meta">
                <span style={{ display: "inline-flex", alignItems: "flex-end" }}>No. <span style={{ borderBottom:"2px solid var(--red)", color:"var(--red)", fontWeight:"bold", fontSize:"20px", padding:"0 8px", marginLeft: "4px" }}>{billNo}</span></span>
                <span style={{ display: "inline-flex", alignItems: "flex-end" }}>Date :- <span style={{borderBottom:'1.5px solid #111', padding:'0 8px', marginLeft: "4px"}}>{date}</span></span>
              </div>"""

content = content.replace(old_meta, new_meta)

with open("src/pages/BillGenerator.tsx", "w") as f:
    f.write(content)

with open("src/pages/InvoiceGenerator.tsx", "r") as f:
    inv = f.read()

inv = inv.replace(
    '''			const el = docRef.current;
			const origTransform = el.style.transform;
			const origOrigin = el.style.transformOrigin;
			el.style.transform = 'none';
			el.style.transformOrigin = 'unset';''',
    '''			const el = docRef.current;
			const origTransform = el.style.transform;
			const origOrigin = el.style.transformOrigin;
			el.style.transform = 'none';
			el.style.transformOrigin = 'unset';
            const canvasEl = document.querySelector('.bill-canvas') as HTMLElement;
            const origOverflow = canvasEl ? canvasEl.style.overflow : '';
            if (canvasEl) canvasEl.style.overflow = 'hidden';'''
)

inv = inv.replace(
    '''				el.style.transform = origTransform;
				el.style.transformOrigin = origOrigin;
				setDownloading(false);''',
    '''				el.style.transform = origTransform;
				el.style.transformOrigin = origOrigin;
                const canvasEl = document.querySelector('.bill-canvas') as HTMLElement;
                if (canvasEl) canvasEl.style.overflow = origOverflow;
				setDownloading(false);'''
)

inv = inv.replace(
    """              <div className="meta">
                <span>No. <span style={{ display:"inline-block", borderBottom:"2px solid var(--red)", color:"var(--red)", fontWeight:"bold", fontSize:"20px", padding:"0 8px", lineHeight:"1" }}>{invoiceNo}</span></span>
                <span>Date :- <span style={{ display:"inline-block", borderBottom:'1.5px solid #111', padding:'0 8px', lineHeight:"1" }}>{date}</span></span>
              </div>""",
    """              <div className="meta">
                <span style={{ display: "inline-flex", alignItems: "flex-end" }}>No. <span style={{ borderBottom:"2px solid var(--red)", color:"var(--red)", fontWeight:"bold", fontSize:"20px", padding:"0 8px", marginLeft: "4px" }}>{invoiceNo}</span></span>
                <span style={{ display: "inline-flex", alignItems: "flex-end" }}>Date :- <span style={{borderBottom:'1.5px solid #111', padding:'0 8px', marginLeft: "4px"}}>{date}</span></span>
              </div>"""
)

with open("src/pages/InvoiceGenerator.tsx", "w") as f:
    f.write(inv)

print("Fixed")
