import re

def patch_file(filepath):
    try:
        with open(filepath, "r") as f:
            content = f.read()
    except FileNotFoundError:
        return

    # Fix 1: The "gray thing". html2canvas has bugs with box-shadow on the root element. 
    # Let's remove box-shadow from the CSS of .bill
    content = content.replace(
        '.bill-container .bill { position:relative; width:8.27in; min-height:11.69in; margin:0 auto; padding:36px 42px 32px; overflow:hidden; background:#fff; box-shadow:0 4px 24px #0002; }',
        '.bill-container .bill { position:relative; width:8.27in; min-height:11.69in; margin:0 auto; padding:36px 42px 32px; overflow:hidden; background:#fff; }'
    )
    
    # Also, wait, let's explicitly set the background of bill-editor-root to #fff temporarily in the download handler, 
    # just in case html2canvas captures outside the bounds.
    # In the download handlers, we already have:
    download_patch = """		const rootEl = document.querySelector('.bill-editor-root') as HTMLElement;
		const origRootBg = rootEl ? rootEl.style.background : '';
		if (rootEl) rootEl.style.background = '#fff';
		
		const parent = el.closest('.bill-container') as HTMLElement;"""
    
    download_patch_restore = """			if (rootEl) {
				rootEl.style.background = origRootBg;
			}
			if (parent) {"""

    if "const rootEl = document.querySelector" not in content:
        content = content.replace(
            "const parent = el.closest('.bill-container') as HTMLElement;",
            download_patch
        )
        content = content.replace(
            "if (parent) {",
            download_patch_restore
        )

    # Fix 2: Make the last line broader and larger in size.
    old_banner = "<div style={{ background: '#064e3b', color: '#fff', textAlign: 'center', padding: '6px', fontSize: '18px', fontWeight: 'bold', marginTop: '16px', letterSpacing: '0.02em', borderRadius: '4px' }}>"
    new_banner = "<div style={{ background: '#064e3b', color: '#fff', textAlign: 'center', padding: '14px', fontSize: '24px', fontWeight: '900', marginTop: '20px', letterSpacing: '0.03em', borderRadius: '8px', border: '2px solid #000' }}>"
    
    content = content.replace(old_banner, new_banner)

    with open(filepath, "w") as f:
        f.write(content)

patch_file("src/pages/BillGenerator.tsx")
patch_file("src/pages/InvoiceGenerator.tsx")

print("Fixed final issues")
