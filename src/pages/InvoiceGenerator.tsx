import { useRef, useState, useEffect, useCallback } from 'react';

// ── Toolbar helpers ──────────────────────────────────────────────────────────
function exec(cmd: string, value?: string) {
  document.execCommand(cmd, false, value);
}



// ── Types ────────────────────────────────────────────────────────────────────
interface Row { id: string; desc: string; qty: string; rate: string; amount: string }
interface ScheduleRow { id: string; time: string; fn: string; date: string; venue: string }
interface PaymentMethod { id: string; label: string; checked: boolean; extra?: string }

const uid = () => crypto.randomUUID();
const rupees = (n: number) => `₹${n.toLocaleString('en-IN')}`;

const defaultItems: Row[] = [
  { id: uid(), desc: '10-sheet photo book album (100 photos & video)\nPhoto and video shoot with one camera; video editing included.\nPen drive not included.', qty: '1', rate: '13500', amount: '13500' },
];
const defaultSchedule: ScheduleRow[] = [
  { id: uid(), time: '8:00 pm – 10:00 pm', fn: 'Haldi', date: '19 Aug 2026', venue: 'Sarai Nagar, Bhandewadi' },
  { id: uid(), time: '9:00 am – 12:00 pm', fn: 'Wedding', date: '20 Aug 2026', venue: 'Sarai Nagar, Bhandewadi' },
  { id: uid(), time: '7:00 pm – 10:00 pm', fn: 'Reception', date: '20 Aug 2026', venue: 'Sarai Nagar, Bhandewadi' },
];
const defaultPaymentMethods: PaymentMethod[] = [
  { id: uid(), label: 'Cash', checked: false },
  { id: uid(), label: 'Credit card', checked: false },
  { id: uid(), label: 'Cheque no.', checked: false, extra: '' },
  { id: uid(), label: 'Paytm', checked: false },
  { id: uid(), label: 'Other', checked: false },
];

const PREDEFINED_FNS = [
  "Wedding", "Reception", "Haldi", "Sangeet", "Mehendi", 
  "Flower holi", "Thread ceremony", "Janeu", "Birthday", 
  "Ring ceremony", "Engagement", "Pre wedding", "Reel"
];

const PREDEFINED_SERVICES = [
  "Candid photo shoot",
  "Candid video shoot",
  "Drone shoot",
  "Portrait photo shoot",
  "Traditional photo & video",
  "Pre-wedding shoot",
  "Crane",
  "LED wall",
  "Live shoot",
  "Projector"
];

const STORAGE_KEY_INV = 'shyam_invoice_doc';

function loadDoc() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_INV);
    if (raw) return JSON.parse(raw);
  } catch {}
  return null;
}
function saveDoc(data: object) {
  try { localStorage.setItem(STORAGE_KEY_INV, JSON.stringify(data)); } catch {}
}

// ── Main Component ───────────────────────────────────────────────────────────
export function InvoiceGenerator() {
  const docRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(85);
  const [items, setItems] = useState<Row[]>(defaultItems);
  const [schedule, setSchedule] = useState<ScheduleRow[]>(defaultSchedule);
  const [showSchedule, setShowSchedule] = useState(true);
  const [payMethods, setPayMethods] = useState<PaymentMethod[]>(defaultPaymentMethods);
  const [showPaymentMethod, setShowPaymentMethod] = useState(true);
  const [showServiceDetails, setShowServiceDetails] = useState(true);
  const [downloading, setDownloading] = useState(false);

  // Auto-save on window unload
  useEffect(() => {
    const saved = loadDoc();
    if (saved?.items) setItems(saved.items);
    if (saved?.schedule) setSchedule(saved.schedule);
    if (saved?.payMethods) setPayMethods(saved.payMethods);
  }, []);

  const autoSave = useCallback(() => {
    saveDoc({ items, schedule, payMethods });
  }, [items, schedule, payMethods]);

  useEffect(() => {
    const t = setTimeout(autoSave, 800);
    return () => clearTimeout(t);
  }, [autoSave]);

  // ── Calculations ────────────────────────────────────────────────────────
  const recalcItem = (id: string, field: keyof Row, val: string) => {
    setItems(prev => prev.map(r => {
      if (r.id !== id) return r;
      const updated = { ...r, [field]: val };
      if (field === 'qty' || field === 'rate') {
        const q = parseFloat(updated.qty) || 0;
        const rt = parseFloat(updated.rate) || 0;
        updated.amount = (q * rt).toFixed(0);
      }
      return updated;
    }));
  };
  const subtotal = items.reduce((s, r) => s + (parseFloat(r.amount) || 0), 0);

  // ── PDF download ────────────────────────────────────────────────────────
  const downloadPDF = async () => {
    if (!docRef.current) return;
    setDownloading(true);
    const html2pdf = (await import('html2pdf.js')).default;
    const opt = {
      margin: 0,
      filename: `shyam_studio_invoice_${Date.now()}.pdf`,
      image: { type: 'jpeg' as const, quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      pagebreak: { mode: ['css', 'legacy'], before: '.page-break' },
    };
    await html2pdf().set(opt).from(docRef.current).save();
    setDownloading(false);
  };

  const handleSave = () => {
    saveDoc({ items, schedule, payMethods });
    alert('Invoice draft saved locally!');
  };

  const handleSendWhatsApp = async () => {
    const input = prompt("Please enter the customer's WhatsApp number (with country code, e.g., 919876543210):");
    if (!input) return;
    
    // Clean mobile number (keep only digits)
    const cleanMobile = input.replace(/\D/g, '');
    const message = `Hello,\n\nHere is your invoice from Shyam Studio.\n\nThank you!`;
    
    setDownloading(true);
    try {
      if (docRef.current) {
        const html2pdf = (await import('html2pdf.js')).default;
        const opt = {
          margin: 0,
          filename: `invoice_${Date.now()}.pdf`,
          image: { type: 'jpeg' as const, quality: 0.98 },
          html2canvas: { scale: 2, useCORS: true },
          jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
          pagebreak: { mode: ['css', 'legacy'], before: '.page-break' },
        };
        
        const pdfBlob = await html2pdf().set(opt).from(docRef.current).output('blob');
        const file = new File([pdfBlob], `invoice_${Date.now()}.pdf`, { type: 'application/pdf' });

        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          try {
            await navigator.share({
              files: [file],
              title: `Invoice`,
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
        a.download = `invoice_${Date.now()}.pdf`;
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

  // ── New document ─────────────────────────────────────────────────────────
  const newDoc = () => {
    if (!window.confirm('Clear document and start fresh?')) return;
    localStorage.removeItem(STORAGE_KEY_INV);
    setItems(defaultItems);
    setSchedule(defaultSchedule);
    setPayMethods(defaultPaymentMethods);
    if (docRef.current) {
      docRef.current.querySelectorAll('[contenteditable]').forEach(el => {
        (el as HTMLElement).innerText = (el as HTMLElement).dataset.default ?? '';
      });
    }
    window.location.reload();
  };

  return (
    <div className="invoice-editor-root">
      <style>{`
        /* ── RESET / EDITOR CHROME ─────────────────────────────────────── */
        .invoice-editor-root { 
          display:flex; flex-direction:column; min-height:100vh; background:#e5e7eb; 
          touch-action: manipulation; /* prevent double-tap zoom on iOS */
        }
        
        ::selection { background: rgba(44, 122, 123, 0.3); color: inherit; }
        ::-moz-selection { background: rgba(44, 122, 123, 0.3); color: inherit; }

        .doc-input {
          border: none; background: transparent; width: 100%;
          font-family: inherit; font-size: inherit; color: inherit;
          outline: none; padding: 0; box-sizing: border-box; cursor: text;
          touch-action: manipulation;
        }
        .doc-input:focus { background: rgba(249,115,22,.1); }

        /* ── TOOLBAR ───────────────────────────────────────────────────── */
        .inv-toolbar {
          display:flex; align-items:center; gap:4px; padding:8px 16px;
          background:#1e293b; color:#f1f5f9; flex-shrink:0; flex-wrap:wrap;
          box-shadow:0 2px 8px rgba(0,0,0,.4); z-index:50;
        }
        .inv-toolbar button { 
          background:transparent; border:none; color:#f1f5f9; cursor:pointer;
          padding:5px 10px; border-radius:4px; font-size:13px; font-weight:600;
          transition:background .15s;
        }
        .inv-toolbar button:hover { background:#334155; }
        .inv-toolbar .sep { width:1px; height:24px; background:#475569; margin:0 4px; }
        .inv-toolbar .zoom-ctl { display:flex; align-items:center; gap:6px; font-size:13px; }
        .inv-toolbar .zoom-ctl button { min-width:28px; }
        .dl-btn {
          background:#dc2626 !important; color:#fff !important; border-radius:4px !important;
          padding:6px 14px !important; font-weight:700 !important;
        }
        .dl-btn:hover { background:#b91c1c !important; }
        .bill-wa-btn { background:#10b981 !important; color:#fff !important; border-radius:4px !important; padding:6px 14px !important; font-weight:700 !important; }
        .bill-wa-btn:hover { background:#059669 !important; }
        .bill-save-btn { background:#0f766e !important; color:#fff !important; border-radius:4px !important; padding:6px 14px !important; font-weight:700 !important; }
        .bill-save-btn:hover { background:#115e59 !important; }
        .bill-print-btn { background:#3f2c25 !important; color:#fff !important; border-radius:4px !important; padding:6px 14px !important; font-weight:700 !important; }
        .bill-print-btn:hover { background:#2c1f19 !important; }

        /* ── SCROLL AREA ───────────────────────────────────────────────── */
        .inv-canvas { flex:1; overflow-y:auto; padding:40px 20px; }

        /* ── A4 PAGE ───────────────────────────────────────────────────── */
        .a4-page {
          width:210mm; min-height:297mm; background:#fff; margin:0 auto 32px;
          box-shadow:0 4px 24px rgba(0,0,0,.18); padding:14mm 16mm;
          font-family:'Times New Roman', Times, serif; font-size:11pt; color:#111;
          position:relative; box-sizing:border-box; page-break-after:always;
        }
        .a4-page:last-child { page-break-after:auto; }

        /* ── CONTENT EDITABLE FIELDS ───────────────────────────────────── */
        [contenteditable] {
          outline:none; cursor:text; display:inline;
          border-radius:2px; transition:background .15s;
        }
        [contenteditable]:hover { background:rgba(249,115,22,.07); }
        [contenteditable]:focus { background:rgba(249,115,22,.12); outline:none; }
        [contenteditable][data-placeholder]:empty:before {
          content: attr(data-placeholder); color:#aaa; font-style:italic; pointer-events:none;
        }
        .editable-line { display: inline-block; min-width: 100px; min-height: 1.2em; border-bottom: 1.5px solid #163a4a; outline: none; vertical-align: bottom; }

        /* ── INVOICE PAGE 1 ────────────────────────────────────────────── */
        .inv-header { text-align:center; border-bottom:3px double #163a4a; padding-bottom:8px; margin-bottom:10px; }
        .inv-studio-name { font-size:22pt; font-weight:700; color:#163a4a; letter-spacing:.04em; }
        .inv-studio-sub { font-size:10pt; color:#2c7a7b; margin-top:2px; }
        .inv-studio-addr { font-size:9pt; color:#52636d; margin-top:3px; }
        .inv-booking-label { font-size:13pt; font-weight:700; color:#2c7a7b; letter-spacing:.08em; margin:10px 0 8px; text-align:center; text-transform:uppercase; }
        .inv-meta-row { display:flex; justify-content:space-between; margin-bottom:6px; }
        .inv-meta-cell { font-size:10pt; }
        .inv-meta-cell b { color:#163a4a; }

        .inv-section-head { font-size:11pt; font-weight:700; color:#163a4a; letter-spacing:.04em; margin:14px 0 6px; text-transform:uppercase; border-bottom:1.5px solid #d9e2e8; padding-bottom:3px; }

        /* Customer info table */
        .info-table { width:100%; border-collapse:collapse; margin-bottom:12px; }
        .info-table td { padding:4px 6px; font-size:10pt; vertical-align:top; }
        .info-table td:first-child { width:35%; color:#52636d; font-weight:600; }
        .info-table td:last-child { color:#111; border-bottom:1px dotted #d9e2e8; }

        /* Schedule table */
        .doc-table { width:100%; border-collapse:collapse; margin-bottom:12px; }
        .doc-table th { background:#163a4a; color:#fff; font-size:9.5pt; padding:6px 8px; text-align:center; font-weight:600; }
        .doc-table td { border:1px solid #d9e2e8; padding:5px 8px; font-size:9.5pt; vertical-align:middle; background:#fff; }
        .doc-table td[contenteditable]:focus { background:rgba(249,115,22,.1); }

        /* Items table */
        .items-table { width:100%; border-collapse:collapse; margin-bottom:0; }
        .items-table th { background:#2c7a7b; color:#fff; font-size:9.5pt; padding:6px 8px; text-align:center; }
        .items-table td { border:1px solid #d9e2e8; padding:6px 8px; font-size:9.5pt; vertical-align:top; }
        .items-table .desc-cell { width:55%; }
        .items-table .num-cell { width:12%; text-align:center; }
        .items-table .money-cell { width:16%; text-align:right; }
        .items-table .subtotal-row td { font-weight:700; background:#eef6f6; color:#163a4a; }

        .doc-add-row { font-size:9pt; color:#2c7a7b; background:transparent; border:1px dashed #2c7a7b; padding:3px 10px; border-radius:4px; cursor:pointer; margin-top:4px; display:inline-block; }
        .doc-add-row:hover { background:#eef6f6; }
        .doc-del-row { font-size:8pt; color:#e53e3e; background:transparent; border:none; cursor:pointer; padding:0 4px; opacity:.6; }
        .doc-del-row:hover { opacity:1; }

        /* Terms / bank */
        .terms-box { border:1px solid #d9e2e8; background:#eef6f6; padding:8px 12px; margin:10px 0; }
        .terms-box p[contenteditable] { display:block; width:100%; }
        .bank-table td { padding:3px 6px; font-size:10pt; }
        .bank-table td:first-child { color:#52636d; font-weight:600; width:35%; }

        /* NOTE */
        .note-box { border-left:3px solid #2c7a7b; padding:4px 10px; margin:8px 0; font-size:9.5pt; color:#52636d; }

        /* ── PAGE 2 — MEDIA CONSENT ────────────────────────────────────── */
        .consent-title { font-size:16pt; font-weight:700; color:#163a4a; text-align:center; margin-bottom:4px; text-transform:uppercase; letter-spacing:.06em; }
        .consent-para { font-size:10pt; line-height:1.65; color:#222; display:block; width:100%; }
        .consent-info-table { width:100%; border-collapse:collapse; margin:10px 0; }
        .consent-info-table td { padding:5px 8px; font-size:10pt; border-bottom:1px dotted #d9e2e8; }
        .consent-info-table td:first-child { width:35%; color:#52636d; font-weight:600; }

        /* ── PAGE 3 — RECEIPT ──────────────────────────────────────────── */
        .receipt-title { font-size:18pt; font-weight:700; color:#163a4a; text-align:center; margin-bottom:2px; text-transform:uppercase; letter-spacing:.06em; }
        .receipt-sub { font-size:11pt; font-weight:700; color:#2c7a7b; text-align:center; margin-bottom:14px; text-transform:uppercase; letter-spacing:.08em; }
        .pay-method-row { display:flex; align-items:center; gap:8px; margin:5px 0; font-size:10.5pt; }
        .pay-method-row input[type=checkbox] { width:14px; height:14px; cursor:pointer; accent-color:#163a4a; }
        .sig-line { border-bottom:1.5px solid #111; width:200px; display:inline-block; margin-top:40px; }
        .thanks-msg { text-align:center; font-size:12pt; font-weight:700; color:#2c7a7b; margin-top:24px; }

        /* ── PRINT ─────────────────────────────────────────────────────── */
        @media print {
          .inv-toolbar, .doc-add-row, .doc-del-row { display:none !important; }
          .invoice-editor-root { height:auto; background:none; }
          .inv-canvas { padding:0; overflow:visible; }
          .a4-page { box-shadow:none; margin:0; }
          [contenteditable] { touch-action: manipulation; }
          [contenteditable]:hover, [contenteditable]:focus { background:transparent; }
          .doc-input::-webkit-calendar-picker-indicator { display: none !important; }
          html, body { -webkit-print-color-adjust:exact; print-color-adjust:exact; }
        }
      `}</style>

      {/* ── TOOLBAR ───────────────────────────────────────────────── */}
      <datalist id="fn-options">
        {PREDEFINED_FNS.map(opt => <option key={opt} value={opt} />)}
      </datalist>
      <div className="inv-toolbar">
        <button title="Bold" onClick={() => exec('bold')}><b>B</b></button>
        <button title="Italic" onClick={() => exec('italic')}><i>I</i></button>
        <button title="Underline" onClick={() => exec('underline')}><u>U</u></button>
        <div className="sep" />
        <button onClick={() => exec('justifyLeft')}>⬅</button>
        <button onClick={() => exec('justifyCenter')}>≡</button>
        <button onClick={() => exec('justifyRight')}>➡</button>
        <div className="sep" />
        <div className="zoom-ctl">
          <button onClick={() => setZoom(z => Math.max(40, z - 10))}>−</button>
          <span style={{minWidth:40, textAlign:'center'}}>{zoom}%</span>
          <button onClick={() => setZoom(z => Math.min(200, z + 10))}>+</button>
        </div>
        <div className="sep" />
        <button onClick={newDoc} title="New Invoice">🗋 New</button>
        
        <div style={{ marginLeft: 'auto', display: 'flex', gap: '8px' }}>
          <button className="bill-wa-btn" onClick={handleSendWhatsApp}>💬 Send WA</button>
          <button className="bill-save-btn" onClick={handleSave}>💾 Save to App</button>
          <button className="bill-print-btn" onClick={() => window.print()}>🖨 Print</button>
          <button
            className="dl-btn"
            disabled={downloading}
            onClick={downloadPDF}
          >
            {downloading ? '⏳ Generating…' : '⬇ Download PDF'}
          </button>
        </div>
      </div>

      {/* ── SCROLLABLE CANVAS ─────────────────────────────────────── */}
      <div className="inv-canvas">
        <div
          ref={docRef}
          style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top center', transition: 'transform .2s' }}
        >

          {/* ══════════════════════════════════════════════════════════
              PAGE 1 — ORDER BOOKING MEMO
          ══════════════════════════════════════════════════════════ */}
          <div className="a4-page">
            <div className="inv-header">
              <div className="inv-studio-name">
                <span contentEditable suppressContentEditableWarning data-placeholder="Studio Name">SHYAM STUDIO</span>
              </div>
              <div className="inv-studio-sub">
                <span contentEditable suppressContentEditableWarning data-placeholder="tagline">Photography · Videography · Events</span>
              </div>
              <div className="inv-studio-addr">
                <span contentEditable suppressContentEditableWarning>
                  Bhandewadi R.L.Y. Station Road, Near Samta Nagar, Nagpur – 440035
                </span>
                &nbsp;|&nbsp;
                <span contentEditable suppressContentEditableWarning>
                  📞 88559 06847 / 70203 40680
                </span>
              </div>
            </div>

            <div className="inv-booking-label">
              <span contentEditable suppressContentEditableWarning>Order Booking Memo</span>
            </div>

            {/* Bill No / Date */}
            <div className="inv-meta-row">
              <div className="inv-meta-cell">
                <b><span contentEditable suppressContentEditableWarning>Bill No.</span></b>&nbsp;
                <span className="editable-line" contentEditable suppressContentEditableWarning data-placeholder="e.g. SS-2026-001"></span>
              </div>
              <div className="inv-meta-cell">
                <b><span contentEditable suppressContentEditableWarning>Date</span></b>&nbsp;
                <span contentEditable suppressContentEditableWarning data-placeholder="DD/MM/YYYY">{new Date().toLocaleDateString('en-GB')}</span>
              </div>
            </div>

            {/* Customer info */}
            <table className="info-table">
              <tbody>
                {[
                  ['Customer', 'Akshay Ramteke'],
                  ['Bride / Groom', 'Pooja Ramteke / Rahul Sharma'],
                  ['Address', 'Deep Nagar, Bhandewadi, Pardi, Nagpur'],
                  ['Birth date', '15 Apr 1998 / 22 Jun 1996'],
                  ['Birth place', 'Nagpur / Nagpur'],
                  ['Mobile / telephone', '87676 15736'],
                  ['Occupation', 'Business'],
                  ['Email', 'akshay@example.com'],
                ].map(([label, val], i) => (
                  <tr key={i}>
                    <td><span contentEditable suppressContentEditableWarning>{label}</span></td>
                    <td><span contentEditable suppressContentEditableWarning data-placeholder={`Enter ${label}`}>{val}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Function Schedule */}
            <div className="no-print" style={{ marginBottom: showSchedule ? 0 : 16, marginTop: 16 }}>
              <button 
                onClick={() => setShowSchedule(!showSchedule)}
                style={{ background: 'transparent', color: '#2c7a7b', padding: '4px 8px', borderRadius: '4px', border: '1px dashed #2c7a7b', cursor: 'pointer', fontSize: '9pt', fontWeight: 600 }}
              >
                {showSchedule ? '▼ Hide Function Schedule' : '▶ Show Function Schedule'}
              </button>
            </div>

            {showSchedule && (
              <>
                <div className="inv-section-head"><span contentEditable suppressContentEditableWarning>Function Schedule</span></div>
                <table className="doc-table">
                  <thead>
                    <tr>
                      {['Time', 'Function', 'Date', 'Venue'].map((h, i) => (
                        <th key={i}><span contentEditable suppressContentEditableWarning>{h}</span></th>
                      ))}
                      <th style={{width:24, background:'#163a4a'}} className="no-print" />
                    </tr>
                  </thead>
                  <tbody>
                    {schedule.map(row => (
                      <tr key={row.id}>
                        {(['time', 'fn', 'date', 'venue'] as const).map(f => (
                          <td key={f}>
                            {f === 'fn' ? (
                              <input 
                                list="fn-options"
                                className="doc-input"
                                value={row[f]}
                                onChange={e => setSchedule(prev => prev.map(r => r.id === row.id ? { ...r, fn: e.target.value } : r))}
                                placeholder="Select or type..."
                              />
                            ) : (
                              <span
                                contentEditable
                                suppressContentEditableWarning
                                onBlur={e => setSchedule(prev => prev.map(r => r.id === row.id ? { ...r, [f]: e.currentTarget.innerText } : r))}
                              >{row[f]}</span>
                            )}
                          </td>
                        ))}
                        <td style={{textAlign:'center'}} className="no-print">
                          <button className="doc-del-row" onClick={() => setSchedule(prev => prev.filter(r => r.id !== row.id))}>✕</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <button className="doc-add-row" onClick={() => setSchedule(prev => [...prev, { id: uid(), time: '', fn: '', date: '', venue: '' }])}>+ Add Row</button>
              </>
            )}

            {/* Service Details */}
            <div className="no-print" style={{ marginBottom: showServiceDetails ? 0 : 16, marginTop: 16 }}>
              <button 
                onClick={() => setShowServiceDetails(!showServiceDetails)}
                style={{ background: 'transparent', color: '#2c7a7b', padding: '4px 8px', borderRadius: '4px', border: '1px dashed #2c7a7b', cursor: 'pointer', fontSize: '9pt', fontWeight: 600 }}
              >
                {showServiceDetails ? '▼ Hide Service Details' : '▶ Show Service Details'}
              </button>
            </div>

            {showServiceDetails && (
              <>
                <div className="inv-section-head"><span contentEditable suppressContentEditableWarning>Service Details</span></div>
                <table className="items-table">
                  <thead>
                    <tr>
                      <th className="desc-cell"><span contentEditable suppressContentEditableWarning>Description</span></th>
                      <th className="num-cell"><span contentEditable suppressContentEditableWarning>Qty.</span></th>
                      <th className="money-cell"><span contentEditable suppressContentEditableWarning>Rate</span></th>
                      <th className="money-cell"><span contentEditable suppressContentEditableWarning>Amount</span></th>
                      <th style={{width:24, background:'#2c7a7b'}} className="no-print" />
                    </tr>
                  </thead>
                  <tbody>
                    {items.map(row => (
                      <tr key={row.id}>
                        <td className="desc-cell" style={{ position: 'relative' }}>
                          <div className="no-print" style={{ position: 'absolute', top: 6, right: 6 }}>
                            <select 
                              className="doc-input" 
                              style={{ width: 20, height: 20, cursor: 'pointer', background: 'rgba(44, 122, 123, 0.1)', borderRadius: 4, textAlign: 'center', appearance: 'none', padding: 0 }}
                              title="Add predefined service"
                              onChange={e => {
                                if(e.target.value) {
                                  // Append to existing text or replace if empty
                                  const newDesc = row.desc ? row.desc + '\n' + e.target.value : e.target.value;
                                  recalcItem(row.id, 'desc', newDesc);
                                  e.target.value = '';
                                }
                              }}
                            >
                              <option value="">▼</option>
                              {PREDEFINED_SERVICES.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                          </div>
                          <span
                            contentEditable suppressContentEditableWarning
                            style={{whiteSpace:'pre-wrap', display:'block', minHeight: '1.5em', paddingRight: 28}}
                            onBlur={e => recalcItem(row.id, 'desc', e.currentTarget.innerText)}
                          >{row.desc}</span>
                        </td>
                        <td className="num-cell">
                          <span contentEditable suppressContentEditableWarning
                            onBlur={e => recalcItem(row.id, 'qty', e.currentTarget.innerText)}
                          >{row.qty}</span>
                        </td>
                        <td className="money-cell">
                          <span contentEditable suppressContentEditableWarning
                            onBlur={e => recalcItem(row.id, 'rate', e.currentTarget.innerText.replace(/[₹,]/g, ''))}
                          >₹{row.rate}</span>
                        </td>
                        <td className="money-cell">₹{parseFloat(row.amount).toLocaleString('en-IN') || '0'}</td>
                        <td style={{textAlign:'center'}} className="no-print">
                          <button className="doc-del-row" onClick={() => setItems(prev => prev.filter(r => r.id !== row.id))}>✕</button>
                        </td>
                      </tr>
                    ))}
                    <tr className="subtotal-row">
                      <td colSpan={3} style={{textAlign:'right'}}>
                        <span contentEditable suppressContentEditableWarning>Subtotal</span>
                      </td>
                      <td className="money-cell">{rupees(subtotal)}</td>
                      <td className="no-print" />
                    </tr>
                    <tr className="subtotal-row">
                      <td colSpan={3} style={{textAlign:'right'}}>
                        <span contentEditable suppressContentEditableWarning>Advance</span>
                      </td>
                      <td className="money-cell">
                        <span contentEditable suppressContentEditableWarning data-placeholder="₹0">₹0</span>
                      </td>
                      <td className="no-print" />
                    </tr>
                    <tr className="subtotal-row">
                      <td colSpan={3} style={{textAlign:'right'}}>
                        <span contentEditable suppressContentEditableWarning>Balance</span>
                      </td>
                      <td className="money-cell">
                        <span contentEditable suppressContentEditableWarning data-placeholder="₹0">{rupees(subtotal)}</span>
                      </td>
                      <td className="no-print" />
                    </tr>
                  </tbody>
                </table>
                <button className="doc-add-row" onClick={() => setItems(prev => [...prev, { id: uid(), desc: '', qty: '1', rate: '0', amount: '0' }])}>+ Add Item</button>
              </>
            )}

            {/* Payment Terms */}
            <div className="inv-section-head"><span contentEditable suppressContentEditableWarning>Payment Terms</span></div>
            <div className="terms-box">
              <p contentEditable suppressContentEditableWarning style={{display:'block', margin:0}}>
                50% ADVANCE ON BOOKING{'\n'}25% ON FIRST SHOOTING DAY{'\n'}25% AGAINST DELIVERY
              </p>
            </div>

            {/* Bank Details */}
            <div className="inv-section-head"><span contentEditable suppressContentEditableWarning>Bank Details</span></div>
            <table className="bank-table info-table">
              <tbody>
                {[
                  ['Bank', 'Punjab National Bank'],
                  ['Account name', 'Ritu N. Rokade'],
                  ['A/c no.', '51842121008558'],
                  ['IFSC', 'PUNB0513910'],
                  ['Mobile', '8855906847'],
                ].map(([l, v], i) => (
                  <tr key={i}>
                    <td><span contentEditable suppressContentEditableWarning>{l}</span></td>
                    <td><span contentEditable suppressContentEditableWarning>{v}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Note */}
            <div className="note-box">
              <b><span contentEditable suppressContentEditableWarning>Note: </span></b>
              <span contentEditable suppressContentEditableWarning>
                All services are subject to availability. Advance amount is non-refundable in case of cancellation.
              </span>
            </div>
          </div>

          {/* ══════════════════════════════════════════════════════════
              PAGE 2 — MEDIA CONSENT
          ══════════════════════════════════════════════════════════ */}
          <div className="a4-page">
            <div className="inv-header" style={{marginBottom:16}}>
              <div className="inv-studio-name">
                <span contentEditable suppressContentEditableWarning>SHYAM STUDIO</span>
              </div>
            </div>

            <div className="consent-title"><span contentEditable suppressContentEditableWarning>Media Consent</span></div>
            <div style={{marginTop:10}}>
              <p className="consent-para" contentEditable suppressContentEditableWarning>
                I hereby grant Shyam Studio and its representatives the right to photograph, video record, and otherwise capture images and audio of me and/or my property during the event(s) indicated below. I agree that Shyam Studio may use, reproduce, modify, distribute, and publicly display any photographs, video footage, audio recordings, or other media captured during the event for the purposes of marketing, promotion, portfolio display, social media, website use, and other business-related activities, without further compensation or approval from me. I understand that any media produced remains the property of Shyam Studio unless otherwise agreed in writing. I release Shyam Studio and its agents from all claims arising from or related to such use of media.
              </p>
            </div>

            <div className="inv-section-head" style={{marginTop:20}}>
              <span contentEditable suppressContentEditableWarning>Additional Requirements / Event Information</span>
            </div>

            <table className="consent-info-table">
              <tbody>
                {[
                  ['Function type', 'Wedding / Reception'],
                  ['Date', '19–20 Aug 2026'],
                  ['Venue', 'Sarai Nagar, Bhandewadi, Nagpur'],
                  ['Time', '8:00 pm onwards'],
                  ['Video format', 'HD (1080p) + Cinematic reel'],
                  ['Photo requirements', 'Traditional + Candid (min. 500 edited)'],
                  ['Contact number 1', '87676 15736'],
                  ['Contact number 2', '70203 40680'],
                  ['Emergency contact', '88559 06847'],
                ].map(([l, v], i) => (
                  <tr key={i}>
                    <td><span contentEditable suppressContentEditableWarning>{l}</span></td>
                    <td><span contentEditable suppressContentEditableWarning data-placeholder="—">{v}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="note-box" style={{marginTop:16}}>
              <span contentEditable suppressContentEditableWarning>
                Special instructions: Please ensure all family members are informed of the photography schedule. The team will require a dedicated area for equipment setup at the venue.
              </span>
            </div>

            {/* Signature area */}
            <div style={{display:'flex', justifyContent:'space-between', marginTop:60}}>
              <div>
                <div className="sig-line" />
                <div style={{fontSize:'9.5pt', color:'#52636d', marginTop:4}}>
                  <span contentEditable suppressContentEditableWarning>Customer Signature</span>
                </div>
              </div>
              <div style={{textAlign:'right'}}>
                <div className="sig-line" />
                <div style={{fontSize:'9.5pt', color:'#52636d', marginTop:4}}>
                  <span contentEditable suppressContentEditableWarning>Authorized Signature</span>
                </div>
              </div>
            </div>
          </div>

          {/* ══════════════════════════════════════════════════════════
              PAGE 3 — PAYMENT RECEIPT
          ══════════════════════════════════════════════════════════ */}
          <div className="a4-page">
            <div className="inv-header" style={{marginBottom:16}}>
              <div className="inv-studio-name">
                <span contentEditable suppressContentEditableWarning>SHYAM STUDIO</span>
              </div>
              <div className="inv-studio-addr">
                <span contentEditable suppressContentEditableWarning>Bhandewadi R.L.Y. Station Road, Nagpur – 440035</span>
                &nbsp;|&nbsp;
                <span contentEditable suppressContentEditableWarning>📞 88559 06847</span>
              </div>
            </div>

            <div className="receipt-title"><span contentEditable suppressContentEditableWarning>Payment Receipt</span></div>
            <div className="receipt-sub"><span contentEditable suppressContentEditableWarning>Cash / Credit Memo</span></div>

            {/* Receipt info */}
            <table className="info-table">
              <tbody>
                {[
                  ['Bill No.', ''],
                  ['Date', new Date().toLocaleDateString('en-GB')],
                  ['Customer', 'Akshay Ramteke'],
                ].map(([l, v], i) => (
                  <tr key={i}>
                    <td><span contentEditable suppressContentEditableWarning>{l}</span></td>
                    <td><span contentEditable suppressContentEditableWarning data-placeholder="—">{v}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Amount received */}
            <div className="inv-section-head"><span contentEditable suppressContentEditableWarning>Amount Received</span></div>
            <table className="info-table" style={{marginBottom:8}}>
              <tbody>
                <tr>
                  <td><span contentEditable suppressContentEditableWarning>Amount (₹)</span></td>
                  <td><span contentEditable suppressContentEditableWarning data-placeholder="Enter amount"></span></td>
                </tr>
                <tr>
                  <td><span contentEditable suppressContentEditableWarning>Amount in words</span></td>
                  <td><span contentEditable suppressContentEditableWarning data-placeholder="e.g. Six Thousand Seven Hundred Only"></span></td>
                </tr>
              </tbody>
            </table>

            {/* Payment methods */}
            <div className="no-print" style={{ marginBottom: showPaymentMethod ? 0 : 16, marginTop: 16 }}>
              <button 
                onClick={() => setShowPaymentMethod(!showPaymentMethod)}
                style={{ background: 'transparent', color: '#2c7a7b', padding: '4px 8px', borderRadius: '4px', border: '1px dashed #2c7a7b', cursor: 'pointer', fontSize: '9pt', fontWeight: 600 }}
              >
                {showPaymentMethod ? '▼ Hide Payment Method' : '▶ Show Payment Method'}
              </button>
            </div>

            {showPaymentMethod && (
              <>
                <div className="inv-section-head"><span contentEditable suppressContentEditableWarning>Payment Method</span></div>
                <div style={{padding:'4px 0'}}>
                  {payMethods.map(pm => (
                    <div key={pm.id} className="pay-method-row">
                      <input
                        type="checkbox"
                        checked={pm.checked}
                        onChange={e => setPayMethods(prev => prev.map(p => p.id === pm.id ? { ...p, checked: e.target.checked } : p))}
                      />
                      <span contentEditable suppressContentEditableWarning
                        onBlur={e => setPayMethods(prev => prev.map(p => p.id === pm.id ? { ...p, label: e.currentTarget.innerText } : p))}
                      >{pm.label}</span>
                      {pm.extra !== undefined && (
                        <span contentEditable suppressContentEditableWarning data-placeholder="Details..." style={{borderBottom:'1px solid #aaa', minWidth:100}}>
                          {pm.extra}
                        </span>
                      )}
                      <button className="doc-del-row" onClick={() => setPayMethods(prev => prev.filter(p => p.id !== pm.id))}>✕</button>
                    </div>
                  ))}
                  <button className="doc-add-row" style={{marginTop:6}} onClick={() => setPayMethods(prev => [...prev, { id: uid(), label: 'New method', checked: false }])}>+ Add method</button>
                </div>
              </>
            )}

            {/* Bank details */}
            <div className="inv-section-head"><span contentEditable suppressContentEditableWarning>Bank Details</span></div>
            <table className="info-table">
              <tbody>
                {[
                  ['Account name', 'Ritu N. Rokade'],
                  ['Account number', '51842121008558'],
                  ['IFSC', 'PUNB0513910'],
                  ['Mobile', '8855906847'],
                ].map(([l, v], i) => (
                  <tr key={i}>
                    <td><span contentEditable suppressContentEditableWarning>{l}</span></td>
                    <td><span contentEditable suppressContentEditableWarning>{v}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Signature */}
            <div style={{display:'flex', justifyContent:'flex-end', marginTop:60}}>
              <div style={{textAlign:'center'}}>
                <div className="sig-line" />
                <div style={{fontSize:'9.5pt', color:'#52636d', marginTop:4}}>
                  <span contentEditable suppressContentEditableWarning>Authorized Signature</span>
                </div>
                <div style={{fontSize:'9pt', color:'#163a4a', fontWeight:600, marginTop:2}}>
                  <span contentEditable suppressContentEditableWarning>Shyam Studio</span>
                </div>
              </div>
            </div>

            <div className="thanks-msg">
              <span contentEditable suppressContentEditableWarning>✦ Thank you for choosing Shyam Studio! ✦</span>
            </div>
          </div>

        </div>{/* end docRef */}
      </div>{/* end canvas */}
    </div>
  );
}
