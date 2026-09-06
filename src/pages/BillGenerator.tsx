import { useRef, useState, useEffect } from 'react';
import { storage } from '../services/storage';
import type { BillData, BillItem } from '../types/invoice';
import { useNavigate } from 'react-router-dom';

const uid = () => crypto.randomUUID();

export function BillGenerator() {
  const navigate = useNavigate();
  const docRef = useRef<HTMLDivElement>(null);
  
  // View states
  const [mode, setMode] = useState<'form' | 'preview'>('form');
  const [downloading, setDownloading] = useState(false);
  const [zoom, setZoom] = useState(85);

  // Form Data
  const [billNo, setBillNo] = useState('');
  const [date, setDate] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerMobile, setCustomerMobile] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [details, setDetails] = useState('');
  const [advance, setAdvance] = useState<number>(0);
  const watermarkText = 'Shyam Graphic Designer\nShyam Graphic Designer';
  const [showWatermark, setShowWatermark] = useState(true);

  // Predefined Items logic
  const predefinedOptions = ['Photo frame', 'Passport size photo', 'Printout', 'Lamination', 'Other (Custom)'];
  const [selectedOptions, setSelectedOptions] = useState<Record<string, boolean>>({});
  const [itemQuantities, setItemQuantities] = useState<Record<string, string>>({});
  const [itemAmounts, setItemAmounts] = useState<Record<string, string>>({});
  const [itemDescriptions, setItemDescriptions] = useState<Record<string, string>>({});
  const [isItemsExpanded, setIsItemsExpanded] = useState(false);

  useEffect(() => {
    // Initialize new bill
    setBillNo(storage.getNextBillNumber());
    setDate(new Date().toLocaleDateString('en-GB'));
  }, []);

  const calculateTotal = () => {
    let t = 0;
    predefinedOptions.forEach(opt => {
      if (selectedOptions[opt]) {
        t += parseFloat(itemAmounts[opt]) || 0;
      }
    });
    return t;
  };

  const total = calculateTotal();
  const balance = total - advance;

  const getItemsForPreview = (): BillItem[] => {
    const items: BillItem[] = [];
    let sr = 1;
    predefinedOptions.forEach(opt => {
      if (selectedOptions[opt]) {
        let customDesc = itemDescriptions[opt] || '';
        let desc = opt === 'Other (Custom)' 
          ? customDesc 
          : (customDesc ? `${opt} - ${customDesc}` : opt);
        items.push({
          id: uid(),
          sr: String(sr++),
          desc: desc,
          qty: itemQuantities[opt] || '1',
          rate: '', // Not strictly needed if amount is given directly
          amount: itemAmounts[opt] || '0',
        });
      }
    });
    return items;
  };

  const handleSave = () => {
    const data: BillData = {
      id: uid(),
      billNo,
      date,
      customerName,
      customerMobile,
      customerAddress,
      details,
      items: getItemsForPreview(),
      advance,
      balance,
      total,
      watermarkText,
      showWatermark,
      createdAt: Date.now()
    };
    storage.saveBill(data);
    alert('Bill saved successfully!');
    navigate('/bill-dashboard');
  };

  const downloadPDF = async () => {
    if (!docRef.current) return;
    setDownloading(true);
    const html2pdf = (await import('html2pdf.js')).default;
    const opt = {
      margin: 0,
      filename: `bill_${billNo}.pdf`,
      image: { type: 'jpeg' as const, quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' as const },
    };
    await html2pdf().set(opt).from(docRef.current).save();
    setDownloading(false);
  };

  const handleSendWhatsApp = async () => {
    let targetMobile = customerMobile;
    if (!targetMobile) {
      const input = prompt("Please enter the customer's WhatsApp number (with country code, e.g., 919876543210):");
      if (!input) return;
      targetMobile = input;
    }
    
    // Clean mobile number (keep only digits)
    const cleanMobile = targetMobile.replace(/\D/g, '');
    const message = `Hello ${customerName ? customerName : 'Customer'},\n\nYour bill details from Shyam Studio:\nBill No: ${billNo}\nDate: ${date}\nTotal Amount: ₹${total}\nAdvance: ₹${advance}\nBalance: ₹${balance}\n\nThank you!`;
    
    setDownloading(true);
    try {
      if (docRef.current) {
        const html2pdf = (await import('html2pdf.js')).default;
        const opt = {
          margin: 0,
          filename: `bill_${billNo}.pdf`,
          image: { type: 'jpeg' as const, quality: 0.98 },
          html2canvas: { scale: 2, useCORS: true },
          jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' as const },
        };
        
        const pdfBlob = await html2pdf().set(opt).from(docRef.current).output('blob');
        const file = new File([pdfBlob], `bill_${billNo}.pdf`, { type: 'application/pdf' });

        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          try {
            await navigator.share({
              files: [file],
              title: `Bill ${billNo}`,
              text: message,
            });
            setDownloading(false);
            return; // Successfully shared using native UI
          } catch (err) {
            console.log('Native share cancelled or failed:', err);
          }
        }

        // Fallback for Desktop/Web WhatsApp
        const url = URL.createObjectURL(pdfBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `bill_${billNo}.pdf`;
        a.click();
        URL.revokeObjectURL(url);
        
        alert("The PDF has been downloaded!\n\nWhatsApp Web doesn't allow automatic file attachments. Please drag and drop the downloaded PDF into the chat window after it opens.");
      }
    } catch (e) {
      console.error("Failed to generate PDF for WhatsApp:", e);
    }
    setDownloading(false);

    const encoded = encodeURIComponent(message);
    const waUrl = `https://wa.me/${cleanMobile}?text=${encoded}`;
    window.open(waUrl, '_blank');
  };

  if (mode === 'form') {
    return (
      <div className="max-w-4xl mx-auto p-6 bg-white shadow-md my-8 rounded-lg font-sans text-gray-900">
        <h2 className="text-2xl font-bold mb-6 text-slate-800">Create New Bill</h2>
        <div className="grid grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Bill No (Auto)</label>
            <input type="text" value={billNo} readOnly className="w-full border-gray-300 rounded-md bg-gray-50 px-3 py-2 border" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
            <input type="text" value={date} readOnly className="w-full border-gray-300 rounded-md bg-gray-50 px-3 py-2 border" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Customer Name</label>
            <input type="text" value={customerName} onChange={e => setCustomerName(e.target.value)} className="w-full border-gray-300 rounded-md px-3 py-2 border" placeholder="Enter Name" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mobile No.</label>
            <input type="text" value={customerMobile} onChange={e => setCustomerMobile(e.target.value)} className="w-full border-gray-300 rounded-md px-3 py-2 border" placeholder="Enter Mobile" />
          </div>
        </div>
        
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
          <input type="text" value={customerAddress} onChange={e => setCustomerAddress(e.target.value)} className="w-full border-gray-300 rounded-md px-3 py-2 border" placeholder="Enter Address" />
        </div>

        <div className="mb-6 border rounded-md overflow-hidden bg-white shadow-sm">
          <button 
            type="button" 
            onClick={() => setIsItemsExpanded(!isItemsExpanded)}
            className="w-full px-4 py-3 bg-gray-50 flex justify-between items-center text-sm font-bold text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <span className="flex items-center gap-2">
              📦 Select Items / Products
              {Object.values(selectedOptions).filter(Boolean).length > 0 && (
                <span className="bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full font-medium">
                  {Object.values(selectedOptions).filter(Boolean).length} Selected
                </span>
              )}
            </span>
            <span className={`transform transition-transform ${isItemsExpanded ? 'rotate-180' : ''}`}>▼</span>
          </button>
          
          <div className={`transition-all duration-300 ease-in-out ${isItemsExpanded ? 'max-h-[1500px] opacity-100' : 'max-h-0 opacity-0'}`}>
            <div className="p-4 space-y-3 border-t">
              {predefinedOptions.map(opt => (
                <div key={opt} className="p-3 border rounded-md bg-slate-50 transition-colors">
                  <div className="flex items-center">
                    <input type="checkbox" id={opt} checked={!!selectedOptions[opt]} 
                      onChange={e => setSelectedOptions(prev => ({...prev, [opt]: e.target.checked}))} 
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded cursor-pointer" 
                    />
                    <label htmlFor={opt} className="ml-2 text-sm font-medium text-gray-900 flex-1 cursor-pointer select-none">{opt}</label>
                  </div>
                  <div className={`overflow-hidden transition-all duration-300 ease-in-out ${selectedOptions[opt] ? 'max-h-40 opacity-100 mt-3' : 'max-h-0 opacity-0'}`}>
                    <div className="ml-6 flex gap-4">
                      <div className="flex-1">
                        <label className="block text-xs font-medium text-gray-700 mb-1">Description</label>
                        <input 
                          type="text" 
                          value={itemDescriptions[opt] || ''}
                          onChange={e => setItemDescriptions(prev => ({...prev, [opt]: e.target.value}))} 
                          className="w-full border-gray-300 rounded-md px-3 py-1.5 border text-sm" 
                          placeholder={opt === 'Other (Custom)' ? "Item name & details..." : "Add more details (optional)"} 
                        />
                      </div>
                      <div className="w-24">
                        <label className="block text-xs font-medium text-gray-700 mb-1">Qty</label>
                        <input type="number" min="1" value={itemQuantities[opt] || '1'} onChange={e => setItemQuantities(prev => ({...prev, [opt]: e.target.value}))} className="w-full border-gray-300 rounded-md px-3 py-1.5 border text-sm" />
                      </div>
                      <div className="w-32">
                        <label className="block text-xs font-medium text-gray-700 mb-1">Amount (₹)</label>
                        <input type="number" min="0" value={itemAmounts[opt] || ''} onChange={e => setItemAmounts(prev => ({...prev, [opt]: e.target.value}))} className="w-full border-gray-300 rounded-md px-3 py-1.5 border text-sm" placeholder="0" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">Custom Notes / Details (Optional)</label>
          <textarea value={details} onChange={e => setDetails(e.target.value)} rows={2} className="w-full border-gray-300 rounded-md px-3 py-2 border" placeholder="Any other details..."></textarea>
        </div>

        <div className="grid grid-cols-3 gap-6 mb-8 border-t pt-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Total Amount</label>
            <div className="text-xl font-bold text-slate-800">₹{total}</div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Advance Received (₹)</label>
            <input type="number" min="0" value={advance || ''} onChange={e => setAdvance(parseFloat(e.target.value) || 0)} className="w-full border-gray-300 rounded-md px-3 py-2 border" placeholder="0" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Balance Due</label>
            <div className="text-xl font-bold text-red-600">₹{balance}</div>
          </div>
        </div>

        <div className="flex justify-end">
          <button onClick={() => setMode('preview')} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded shadow">
            Preview Bill
          </button>
        </div>
      </div>
    );
  }

  // PREVIEW MODE
  const previewItems = getItemsForPreview();

  return (
    <div className="bill-editor-root">
      <style>{`
        .bill-editor-root { 
          display:flex; flex-direction:column; height:calc(100vh - 64px); background:#e5e7eb; 
          touch-action: manipulation;
        }
        ::selection { background: rgba(16, 185, 129, 0.3); color: inherit; }
        ::-moz-selection { background: rgba(16, 185, 129, 0.3); color: inherit; }

        .bill-toolbar {
          display:flex; align-items:center; gap:4px; padding:8px 16px;
          background:#1a0a00; color:#fef3c7; flex-shrink:0; flex-wrap:wrap;
          box-shadow:0 2px 8px rgba(0,0,0,.4); z-index:50;
        }
        .bill-toolbar button {
          background:rgba(255,255,255,0.1); border:none; color:#fef3c7; cursor:pointer;
          padding:6px 12px; border-radius:4px; font-size:13px; font-weight:600; transition:background .15s; margin-right: 4px;
        }
        .bill-toolbar button:hover { background:rgba(255,255,255,0.2); }
        .bill-toolbar .sep { width:1px; min-height: 1.2em; background:#7c4a00; margin:0 8px; }
        .bill-toolbar .zoom-ctl { display:flex; align-items:center; gap:6px; font-size:13px; margin-right: 12px; }
        .bill-dl-btn { background:#c00 !important; color:#fff !important; }
        .bill-dl-btn:hover { background:#a00 !important; }
        .bill-save-btn { background:#047857 !important; color:#fff !important; }
        .bill-save-btn:hover { background:#065f46 !important; }
        .bill-wa-btn { background:#16a34a !important; color:#fff !important; }
        .bill-wa-btn:hover { background:#15803d !important; }
        .bill-canvas { flex:1; overflow-y:auto; padding:40px 20px; }

        /* A4 Layout CSS */
        .bill-container { --red:#f10b0b; --ink:#111; --watermark:#c8c8c8; color:var(--ink); font-family:Arial, Helvetica, sans-serif; }
        .bill-container * { box-sizing:border-box; }
        .bill-container .bill { position:relative; width:8.27in; min-height:11.69in; margin:0 auto; padding:36px 42px 32px; overflow:hidden; background:#fff; box-shadow:0 4px 24px #0002; }
        .bill-container .watermark { position:absolute; inset:215px -100px 170px; z-index:0; pointer-events:none; transform:rotate(-24deg); color:var(--watermark); font-family:cursive; font-size:108px; font-weight:700; line-height:1.85; opacity:.2; white-space:nowrap; text-align:center; }
        .bill-container .content { position:relative; z-index:1; }
        .bill-container .brand { margin:0; text-align:center; color:var(--red); font-family:Georgia, "Times New Roman", serif; font-size:45px; line-height:1.15; font-weight:700; }
        .bill-container .header-rule { margin:13px -42px 0; border-top:4px double var(--ink); }
        .bill-container .address { padding:7px 5px 8px; border-bottom:2px solid var(--ink); text-align:center; font-size:15px; line-height:1.35; font-weight:700; letter-spacing:.02em; background-color:#e6ffed; }
        .bill-container .meta { display:flex; justify-content:space-between; padding:12px 7px 27px; font-size:18px; font-weight:700; }
        .bill-container .fields { display:grid; gap:12px; margin:0 7px 20px; font-size:18px; font-weight:700; }
        .bill-container .field { display:flex; align-items:end; gap:8px; }
        .bill-container .field .label { white-space:nowrap; }
        .bill-container .line { flex:1; min-width:0; min-height: 1.2em; border-bottom:1.5px solid var(--ink); display:inline-block; }
        .bill-container .line.short { flex:0 0 35%; }
        .bill-container .bill-table { width:100%; border-collapse:collapse; table-layout:fixed; font-size:19px; }
        .bill-container .bill-table th, .bill-container .bill-table td { border:3px solid var(--ink); }
        .bill-container .bill-table th { height:48px; color:var(--red); font-family:Georgia, "Times New Roman", serif; font-size:21px; }
        .bill-container .bill-table th:nth-child(1) { width:6%; }
        .bill-container .bill-table th:nth-child(2) { width:54%; }
        .bill-container .bill-table th:nth-child(3) { width:10%; }
        .bill-container .bill-table th:nth-child(4) { width:15%; }
        .bill-container .bill-table th:nth-child(5) { width:15%; }
        .bill-container .bill-table tbody td { height:465px; vertical-align:top; }
        .bill-container .bill-table .notes { padding:0 9px 8px; border-right:0; line-height:1.3; }
        .bill-container .bill-table .total-label { vertical-align:middle; height:43px; color:var(--red); font-family:Georgia, "Times New Roman", serif; font-size:20px; font-weight:700; padding-left:10px; }
        .bill-container .bill-table .total-cell { height:43px; }
        .bill-container .bill-table .amount-cell { height:43px; font-weight: bold; text-align: center; }
        .bill-container .footer { display:flex; justify-content:space-between; align-items:flex-end; margin-top:11px; }
        .bill-container .terms { color:var(--red); font-family:Georgia, "Times New Roman", serif; font-size:19px; line-height:1.18; font-weight:700; }
        .bill-container .signature { padding:0 18px 4px 0; font-family:Georgia, "Times New Roman", serif; font-size:16px; }

        @media print {
          .bill-toolbar { display:none !important; }
          .bill-editor-root { height:auto; background:none; }
          .bill-canvas { padding:0; overflow:visible; }
          .bill-container .bill { margin:0; box-shadow:none; }
          html,body { -webkit-print-color-adjust:exact; print-color-adjust:exact; }
        }
      `}</style>

      {/* TOOLBAR */}
      <div className="bill-toolbar">
        <button onClick={() => setMode('form')}>⬅ Edit Form</button>
        <div className="sep" />
        <div className="zoom-ctl">
          <button onClick={() => setZoom(z => Math.max(40, z - 10))}>−</button>
          <span style={{ minWidth: 40, textAlign: 'center' }}>{zoom}%</span>
          <button onClick={() => setZoom(z => Math.min(200, z + 10))}>+</button>
        </div>
        <div className="sep" />
        <button onClick={() => setShowWatermark(w => !w)} title="Toggle watermark">
          {showWatermark ? '👁 WM' : '🚫 WM'}
        </button>
        
        <div style={{ marginLeft: 'auto', display: 'flex', gap: '8px' }}>
          <button className="bill-wa-btn" onClick={handleSendWhatsApp}>💬 Send WA</button>
          <button className="bill-save-btn" onClick={handleSave}>💾 Save to App</button>
          <button onClick={() => window.print()}>🖨 Print</button>
          <button className="bill-dl-btn" disabled={downloading} onClick={downloadPDF}>
            {downloading ? '⏳ Generating…' : '⬇ Download PDF'}
          </button>
        </div>
      </div>

      {/* CANVAS */}
      <div className="bill-canvas">
        <div
          ref={docRef}
          className="bill-container"
          style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top center', transition: 'transform .2s' }}
        >
          <main className="bill">
            {showWatermark && (
              <div className="watermark" aria-hidden="true">
                <span style={{ whiteSpace: 'pre-wrap' }}>{watermarkText}</span>
              </div>
            )}
            <div className="content">
              <h1 className="brand">
                <span>Shyam Graphic Designer</span>
              </h1>
              <div className="header-rule"></div>
              <div className="address">
                <span>
                  PLAT NO. 1, SHOP NO. 3 BALAJI NAGAR, NEAR BY- BHAWANI HOSPITEL OPPOSITE<br/>PUNAPU ROAD, PARDI NAGPUR. 35 &nbsp;&nbsp;&nbsp; MO. 7775854937, 9404291477
                </span>
              </div>
              <div className="meta">
                <span>No. <span style={{borderBottom:'1.5px solid #111', padding:'0 8px'}}>{billNo}</span></span>
                <span>Date :- <span style={{borderBottom:'1.5px solid #111', padding:'0 8px'}}>{date}</span></span>
              </div>
              <section className="fields" aria-label="Customer details">
                <div className="field">
                  <span className="label">Name :-</span>
                  <span className="line" style={{padding:'0 8px'}}>{customerName}</span>
                  <span className="label">Mo.</span>
                  <span className="line short" style={{padding:'0 8px'}}>{customerMobile}</span>
                </div>
                <div className="field">
                  <span className="label">Address :-</span>
                  <span className="line" style={{padding:'0 8px'}}>{customerAddress}</span>
                </div>
              </section>
              <table className="bill-table" aria-label="Bill items">
                <thead><tr><th>Sr</th><th>Description</th><th>Qty</th><th>Rate</th><th>Amount</th></tr></thead>
                <tbody>
                  <tr>
                    <td style={{ padding: '8px 4px', textAlign: 'center' }}>
                      {previewItems.map(row => <div key={row.id}>{row.sr}</div>)}
                    </td>
                    <td className="notes">
                      <div style={{ padding: '8px 4px' }}>
                        {previewItems.map(row => <div key={row.id}>{row.desc}</div>)}
                        {details && <div style={{marginTop: '16px', whiteSpace: 'pre-wrap'}}>{details}</div>}
                      </div>
                    </td>
                    <td style={{ padding: '8px 4px', textAlign: 'center' }}>
                      {previewItems.map(row => <div key={row.id}>{row.qty}</div>)}
                    </td>
                    <td style={{ padding: '8px 4px', textAlign: 'center' }}>
                      {/* Rate column left empty as per standard requested usage or could be computed */}
                    </td>
                    <td style={{ padding: '8px 4px', textAlign: 'center' }}>
                      {previewItems.map(row => <div key={row.id}>{row.amount}</div>)}
                    </td>
                  </tr>
                  <tr><td colSpan={3} className="total-label">Total</td><td className="total-cell"></td><td className="amount-cell">{total}</td></tr>
                  <tr><td colSpan={3} className="total-label">Add.</td><td className="total-cell"></td><td className="amount-cell">{advance}</td></tr>
                  <tr><td colSpan={3} className="total-label">Bal.</td><td className="total-cell"></td><td className="amount-cell">{balance}</td></tr>
                </tbody>
              </table>
              <footer className="footer">
                <div className="terms">
                  <span style={{ whiteSpace: 'pre-wrap', display: 'block' }}>
                    {`1) Advance payment is non-refundable”.\n2) No refund or return after Printing.”\n3) Photo will be saved for 30 days only.”`}
                  </span>
                </div>
                <div className="signature">
                  <span>Signature<br/><br/>________________</span>
                </div>
              </footer>
              <div style={{ background: '#064e3b', color: '#fff', textAlign: 'center', padding: '6px', fontSize: '18px', fontWeight: 'bold', marginTop: '16px', letterSpacing: '0.02em', borderRadius: '4px' }}>
                We cover all types of photography and videography events”
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
