import { useRef, useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { storage } from '../services/storage';
import type { BillData } from '../types/invoice';

export function BillViewer() {
  const { id } = useParams();
  const [bill, setBill] = useState<BillData | null>(null);
  const [zoom, setZoom] = useState(85);
  const [downloading, setDownloading] = useState(false);
  const docRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (id) {
      const data = storage.getBillById(id);
      if (data) {
        setBill(data);
      }
    }
  }, [id]);

  const downloadPDF = async () => {
    if (!docRef.current || !bill) return;
    setDownloading(true);
    const html2pdf = (await import('html2pdf.js')).default;
    const opt = {
      margin: 0,
      filename: `bill_${bill.billNo}.pdf`,
      image: { type: 'jpeg' as const, quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' as const },
    };
    await html2pdf().set(opt).from(docRef.current).save();
    setDownloading(false);
  };

  const handleSendWhatsApp = () => {
    if (!bill) return;
    let targetMobile = bill.customerMobile;
    if (!targetMobile) {
      const input = prompt("Please enter the customer's WhatsApp number (with country code, e.g., 919876543210):");
      if (!input) return;
      targetMobile = input;
    }
    const cleanMobile = targetMobile.replace(/\D/g, '');
    const message = `Hello ${bill.customerName ? bill.customerName : 'Customer'},\n\nYour bill details from Shyam Studio:\nBill No: ${bill.billNo}\nDate: ${bill.date}\nTotal Amount: ₹${bill.total}\nAdvance: ₹${bill.advance}\nBalance: ₹${bill.balance}\n\nThank you!`;
    const encoded = encodeURIComponent(message);
    const url = `https://wa.me/${cleanMobile}?text=${encoded}`;
    window.open(url, '_blank');
  };

  if (!bill) {
    return <div className="text-center py-20 text-gray-500">Bill not found.</div>;
  }

  return (
    <div className="bill-editor-root">
      <style>{`
        .bill-editor-root { display:flex; flex-direction:column; height:calc(100vh - 64px); background:#e5e7eb; }
        .bill-toolbar {
          display:flex; align-items:center; gap:4px; padding:8px 16px;
          background:#1a0a00; color:#fef3c7; flex-shrink:0; flex-wrap:wrap;
          box-shadow:0 2px 8px rgba(0,0,0,.4); z-index:50;
        }
        .bill-toolbar button, .bill-toolbar a {
          background:rgba(255,255,255,0.1); border:none; color:#fef3c7; cursor:pointer; text-decoration: none;
          padding:6px 12px; border-radius:4px; font-size:13px; font-weight:600; transition:background .15s; margin-right: 4px;
        }
        .bill-toolbar button:hover, .bill-toolbar a:hover { background:rgba(255,255,255,0.2); }
        .bill-toolbar .sep { width:1px; min-height: 1.2em; background:#7c4a00; margin:0 8px; }
        .bill-toolbar .zoom-ctl { display:flex; align-items:center; gap:6px; font-size:13px; margin-right: 12px; }
        .bill-dl-btn { background:#c00 !important; color:#fff !important; }
        .bill-dl-btn:hover { background:#a00 !important; }
        .bill-wa-btn { background:#16a34a !important; color:#fff !important; }
        .bill-wa-btn:hover { background:#15803d !important; }
        .bill-canvas { flex:1; overflow-y:auto; padding:40px 20px; }

        /* A4 Layout CSS */
        .bill-container { --red:#f10b0b; --ink:#111; --watermark:#c8c8c8; color:var(--ink); font-family:Arial, Helvetica, sans-serif; }
        .bill-container * { box-sizing:border-box; }
        .bill-container .bill { position:relative; width:8.27in; min-height:11.69in; margin:0 auto; padding:36px 42px 32px; overflow:hidden; background:#fff; box-shadow:0 4px 24px #0002; }
        .bill-container .watermark { position:absolute; inset:215px -100px 170px; z-index:0; pointer-events:none; transform:rotate(-24deg); color:var(--watermark); font-family:cursive; font-size:108px; font-weight:700; line-height:1.85; opacity:.9; white-space:nowrap; text-align:center; }
        .bill-container .content { position:relative; z-index:1; }
        .bill-container .brand { margin:0; text-align:center; color:var(--red); font-family:Georgia, "Times New Roman", serif; font-size:45px; line-height:1.15; font-weight:700; }
        .bill-container .header-rule { margin:13px -42px 0; border-top:4px double var(--ink); }
        .bill-container .address { padding:7px 5px 8px; border-bottom:2px solid var(--ink); text-align:center; font-size:15px; line-height:1.35; font-weight:700; letter-spacing:.02em; }
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
        <Link to="/bill-dashboard">⬅ Back to Dashboard</Link>
        <div className="sep" />
        <div className="zoom-ctl">
          <button onClick={() => setZoom(z => Math.max(40, z - 10))}>−</button>
          <span style={{ minWidth: 40, textAlign: 'center' }}>{zoom}%</span>
          <button onClick={() => setZoom(z => Math.min(200, z + 10))}>+</button>
        </div>
        
        <div style={{ marginLeft: 'auto', display: 'flex', gap: '8px' }}>
          <button className="bill-wa-btn" onClick={handleSendWhatsApp}>💬 Send WA</button>
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
            {bill.showWatermark && (
              <div className="watermark" aria-hidden="true">
                <span style={{ whiteSpace: 'pre-wrap' }}>{bill.watermarkText}</span>
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
                <span>No. <span style={{borderBottom:'1.5px solid #111', padding:'0 8px'}}>{bill.billNo}</span></span>
                <span>Date :- <span style={{borderBottom:'1.5px solid #111', padding:'0 8px'}}>{bill.date}</span></span>
              </div>
              <section className="fields" aria-label="Customer details">
                <div className="field">
                  <span className="label">Name :-</span>
                  <span className="line" style={{padding:'0 8px'}}>{bill.customerName}</span>
                  <span className="label">Mo.</span>
                  <span className="line short" style={{padding:'0 8px'}}>{bill.customerMobile}</span>
                </div>
                <div className="field">
                  <span className="label">Address :-</span>
                  <span className="line" style={{padding:'0 8px'}}>{bill.customerAddress}</span>
                </div>
              </section>
              <table className="bill-table" aria-label="Bill items">
                <thead><tr><th>Sr</th><th>Description</th><th>Qty</th><th>Rate</th><th>Amount</th></tr></thead>
                <tbody>
                  <tr>
                    <td style={{ padding: '8px 4px', textAlign: 'center' }}>
                      {bill.items.map(row => <div key={row.id}>{row.sr}</div>)}
                    </td>
                    <td className="notes">
                      <div style={{ padding: '8px 4px' }}>
                        {bill.items.map(row => <div key={row.id}>{row.desc}</div>)}
                        {bill.details && <div style={{marginTop: '16px', whiteSpace: 'pre-wrap'}}>{bill.details}</div>}
                      </div>
                    </td>
                    <td style={{ padding: '8px 4px', textAlign: 'center' }}>
                      {bill.items.map(row => <div key={row.id}>{row.qty}</div>)}
                    </td>
                    <td style={{ padding: '8px 4px', textAlign: 'center' }}>
                      {/* Rate left blank intentionally */}
                    </td>
                    <td style={{ padding: '8px 4px', textAlign: 'center' }}>
                      {bill.items.map(row => <div key={row.id}>{row.amount}</div>)}
                    </td>
                  </tr>
                  <tr><td colSpan={3} className="total-label">Total</td><td className="total-cell"></td><td className="amount-cell">{bill.total}</td></tr>
                  <tr><td colSpan={3} className="total-label">Add.</td><td className="total-cell"></td><td className="amount-cell">{bill.advance}</td></tr>
                  <tr><td colSpan={3} className="total-label">Bal.</td><td className="total-cell"></td><td className="amount-cell">{bill.balance}</td></tr>
                </tbody>
              </table>
              <footer className="footer">
                <div className="terms">
                  <span style={{ whiteSpace: 'pre-wrap', display: 'block' }}>
                    {`1) Advance payment is non-refundable”.\n2) No refund or return after Printing.”\n3) Photo will be saved for 30 days only.”\nWe cover all types of photography and videography events”`}
                  </span>
                </div>
                <div className="signature">
                  <span>Signature<br/><br/>________________</span>
                </div>
              </footer>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
