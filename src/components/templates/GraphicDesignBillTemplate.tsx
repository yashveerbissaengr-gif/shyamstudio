import type { InvoiceData } from '../../types/invoice';

export function GraphicDesignBillTemplate({ data }: { data: InvoiceData }) {
  return (
    <div className="graphic-bill-template" style={{ backgroundColor: '#eee', color: '#111', fontFamily: 'Arial, Helvetica, sans-serif' }}>
      <style>{`
        .graphic-bill-template {
          --red: #f10b0b; --ink: #111; --watermark: #c8c8c8;
        }
        .graphic-bill-template * { box-sizing: border-box; }
        .graphic-bill-template .bill { position: relative; width: 8.27in; min-height: 11.69in; margin: 0 auto; padding: 36px 42px 32px; overflow: hidden; background: #fff; box-shadow: 0 4px 24px #0002; }
        .graphic-bill-template .watermark { position: absolute; inset: 215px -100px 170px; z-index: 0; pointer-events: none; transform: rotate(-24deg); color: var(--watermark); font-family: cursive; font-size: 108px; font-weight: 700; line-height: 1.85; opacity: .9; white-space: nowrap; }
        .graphic-bill-template .content { position: relative; z-index: 1; }
        .graphic-bill-template .brand { margin: 0; text-align: center; color: var(--red); font-family: Georgia, "Times New Roman", serif; font-size: 45px; line-height: 1.15; font-weight: 700; }
        .graphic-bill-template .header-rule { margin: 13px -42px 0; border-top: 4px double var(--ink); }
        .graphic-bill-template .address { padding: 7px 5px 8px; border-bottom: 2px solid var(--ink); text-align: center; font-size: 15px; line-height: 1.35; font-weight: 700; letter-spacing: .02em; }
        .graphic-bill-template .meta { display: flex; justify-content: space-between; padding: 12px 7px 27px; font-size: 18px; font-weight: 700; }
        .graphic-bill-template .fields { display: grid; gap: 12px; margin: 0 7px 20px; font-size: 18px; font-weight: 700; }
        .graphic-bill-template .field { display: flex; align-items: end; gap: 8px; }
        .graphic-bill-template .field .label { white-space: nowrap; }
        .graphic-bill-template .line { flex: 1; min-width: 0; min-height: 1.2em; border-bottom: 1.5px solid var(--ink); }
        .graphic-bill-template .line.short { flex: 0 0 35%; }
        .graphic-bill-template .editable-line { display: inline-block; min-width: 120px; min-height: 1.2em; border-bottom: 1.5px solid var(--ink); }
        .graphic-bill-template .bill-table { width: 100%; border-collapse: collapse; table-layout: fixed; font-size: 19px; }
        .graphic-bill-template .bill-table th, .graphic-bill-template .bill-table td { border: 3px solid var(--ink); }
        .graphic-bill-template .bill-table th { height: 48px; color: var(--red); font-family: Georgia, "Times New Roman", serif; font-size: 21px; }
        .graphic-bill-template .bill-table th:nth-child(1) { width: 5%; }
        .graphic-bill-template .bill-table th:nth-child(2) { width: 55%; }
        .graphic-bill-template .bill-table th:nth-child(3) { width: 10%; }
        .graphic-bill-template .bill-table th:nth-child(4) { width: 15%; }
        .graphic-bill-template .bill-table th:nth-child(5) { width: 15%; }
        .graphic-bill-template .bill-table tbody td { height: 465px; vertical-align: top; }
        .graphic-bill-template .bill-table .notes { padding: 0 9px 8px; border-right: 0; line-height: 1.3; }
        .graphic-bill-template .bill-table .total-label { vertical-align: middle; height: 43px; color: var(--red); font-family: Georgia, "Times New Roman", serif; font-size: 20px; font-weight: 700; padding-left: 10px; }
        .graphic-bill-template .bill-table .total-cell { height: 43px; }
        .graphic-bill-template .bill-table .amount-cell { height: 43px; text-align: center; font-weight: bold; }
        .graphic-bill-template .footer { display: flex; justify-content: space-between; align-items: flex-end; margin-top: 11px; }
        .graphic-bill-template .terms { color: var(--red); font-family: Georgia, "Times New Roman", serif; font-size: 19px; line-height: 1.18; font-weight: 700; }
        .graphic-bill-template .signature { padding: 0 18px 4px 0; font-family: Georgia, "Times New Roman", serif; font-size: 16px; }
        @media print { body { background: #fff; } .graphic-bill-template .bill { margin: 0; box-shadow: none; } }
        @media (max-width: 900px) { .graphic-bill-template .bill { width: 100%; min-height: 0; margin: 0; padding: 24px 20px; } .graphic-bill-template .header-rule { margin-left: -20px; margin-right: -20px; } .graphic-bill-template .brand { font-size: 34px; } .graphic-bill-template .address { font-size: 11px; } .graphic-bill-template .meta, .graphic-bill-template .fields { font-size: 14px; } .graphic-bill-template .bill-table th { font-size: 16px; } .graphic-bill-template .terms { font-size: 15px; } }
      `}</style>
      
      <main className="bill">
        <div className="watermark" aria-hidden="true">Shyam Graphic Designer<br/>Shyam Graphic Designer</div>
        <div className="content">
          <h1 className="brand">Shyam Graphic Designer</h1>
          <div className="header-rule"></div>
          <div className="address">PLAT NO. 1, SHOP NO. 3 BALAJI NAGAR, NEAR BY- BHAWANI HOSPITEL OPPOSITE<br/>PUNAPU ROAD, PARDI NAGPUR. 35 &nbsp;&nbsp;&nbsp; MO. 7775854937, 9404291477</div>
          <div className="meta">
            <span>No. <span className="editable-line" style={{minWidth: '160px'}}>{data.billNo || ''}</span></span>
            <span>Date :- <span className="editable-line" style={{minWidth: '140px'}}>{data.date || ''}</span></span>
          </div>
          <section className="fields" aria-label="Customer details">
            <div className="field">
              <span className="label">Name :-</span><span className="line">{data.customerName}</span>
              <span className="label">Mo.</span><span className="line short">{data.customerMobile}</span>
            </div>
            <div className="field"><span className="label">Address :-</span><span className="line">{data.customerAddress}</span></div>
          </section>
          
          <table className="bill-table" aria-label="Bill items">
            <thead><tr><th>Sr</th><th>Description</th><th>Qty</th><th>Rate</th><th>Amount</th></tr></thead>
            <tbody>
              <tr>
                <td style={{ padding: '8px 4px' }}>
                  {data.items && data.items.map((_, i) => <div key={i}>{i+1}</div>)}
                </td>
                <td className="notes">
                  <div style={{ padding: '8px 4px' }}>
                    {data.items && data.items.map((item, i) => <div key={i}>{item.description}</div>)}
                  </div>
                </td>
                <td style={{ padding: '8px 4px', textAlign: 'center' }}>
                  {data.items && data.items.map((item, i) => <div key={i}>{item.qty}</div>)}
                </td>
                <td style={{ padding: '8px 4px', textAlign: 'center' }}>
                  {data.items && data.items.map((item, i) => <div key={i}>{item.rate}</div>)}
                </td>
                <td style={{ padding: '8px 4px', textAlign: 'center' }}>
                  {data.items && data.items.map((item, i) => <div key={i}>{item.amount}</div>)}
                </td>
              </tr>
              <tr><td colSpan={3} className="total-label">Total</td><td className="total-cell"></td><td className="amount-cell">{data.subtotal}</td></tr>
              <tr><td colSpan={3} className="total-label">Add.</td><td className="total-cell"></td><td className="amount-cell">{data.advance}</td></tr>
              <tr><td colSpan={3} className="total-label">Bal.</td><td className="total-cell"></td><td className="amount-cell">{data.balance}</td></tr>
            </tbody>
          </table>
          <footer className="footer">
            <div className="terms">1) Advance payment is non-refundable”.<br/>2) No refund or return after Printing.”<br/>3) Photo will be saved for 30 days only.”<br/>We cover all types of photography and videography events”</div>
            <div className="signature">Signature<br/><br/>________________</div>
          </footer>
        </div>
      </main>
    </div>
  );
}
