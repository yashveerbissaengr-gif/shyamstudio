with open("src/pages/BillGenerator.tsx", "r") as f:
    content = f.read()

# Make the first bill have id="bill-capture"
# Since renderBill() is called twice, we can pass an optional prop.
content = content.replace(
    'const renderBill = () => (',
    'const renderBill = (isFirst = false) => ('
)
content = content.replace(
    '<main className="bill">',
    '<main className="bill" id={isFirst ? "bill-capture" : undefined}>'
)
content = content.replace(
    '''						<div className="bill-wrapper">
							{renderBill()}''',
    '''						<div className="bill-wrapper">
							{renderBill(true)}'''
)

# Now change handleDownloadPDF and handleDownloadJPG to use document.getElementById('bill-capture')
content = content.replace(
    'const el = docRef.current;',
    '''const el = document.getElementById('bill-capture') as HTMLElement;
            if (!el) return;'''
)
# Also remove the docRef check at the beginning of the handlers
content = content.replace(
    'if (!docRef.current) return;',
    ''
)

with open("src/pages/BillGenerator.tsx", "w") as f:
    f.write(content)

with open("src/pages/InvoiceGenerator.tsx", "r") as f:
    inv = f.read()

inv = inv.replace(
    'const renderInvoice = () => (',
    'const renderInvoice = (isFirst = false) => ('
)
inv = inv.replace(
    '<main className="bill">',
    '<main className="bill" id={isFirst ? "bill-capture" : undefined}>'
)
inv = inv.replace(
    '''						<div className="bill-wrapper">
							{renderInvoice()}''',
    '''						<div className="bill-wrapper">
							{renderInvoice(true)}'''
)
inv = inv.replace(
    'const el = docRef.current;',
    '''const el = document.getElementById('bill-capture') as HTMLElement;
            if (!el) return;'''
)
inv = inv.replace(
    'if (!docRef.current) return;',
    ''
)

with open("src/pages/InvoiceGenerator.tsx", "w") as f:
    f.write(inv)

print("Fixed capture")
