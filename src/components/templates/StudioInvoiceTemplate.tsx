import type { InvoiceData } from '../../types/invoice';

export function StudioInvoiceTemplate({ data }: { data: InvoiceData }) {
  return (
    <div className="studio-invoice-template" style={{ backgroundColor: '#f3f6f7', color: '#24313a', fontFamily: 'Georgia, "Times New Roman", serif' }}>
      <style>{`
        .studio-invoice-template {
          --ink: #24313a; --navy: #163a4a; --teal: #2c7a7b; --line: #d9e2e8; --pale: #eef6f6;
          box-sizing: border-box;
        }
        .studio-invoice-template * { box-sizing: border-box; }
        .studio-invoice-template .sheet { width: 8.5in; min-height: 11in; margin: 0 auto; padding: .55in .65in; background: #fff; box-shadow: 0 4px 24px #163a4a18; }
        .studio-invoice-template .brand { display: flex; align-items: center; justify-content: space-between; }
        .studio-invoice-template .studio { color: var(--navy); font-size: 31px; font-weight: 700; letter-spacing: .02em; }
        .studio-invoice-template .title { color: var(--teal); font-size: 28px; font-weight: 700; }
        .studio-invoice-template .contact { margin: 13px 0 10px; text-align: center; color: #52636d; font-size: 11px; letter-spacing: .02em; }
        .studio-invoice-template .kicker { margin: 0 0 25px; text-align: center; color: var(--teal); font-size: 13px; font-weight: 700; letter-spacing: .05em; }
        .studio-invoice-template .meta, .studio-invoice-template .info, .studio-invoice-template .schedule, .studio-invoice-template .items, .studio-invoice-template .terms, .studio-invoice-template .bank, .studio-invoice-template .payment { width: 100%; border-collapse: collapse; }
        .studio-invoice-template .meta { margin-bottom: 18px; }
        .studio-invoice-template th, .studio-invoice-template td { border: 1px solid var(--line); padding: 8px 10px; vertical-align: middle; }
        .studio-invoice-template .meta td { color: var(--navy); font-weight: 700; font-size: 13px; }
        .studio-invoice-template .right { text-align: right; }
        .studio-invoice-template .info { margin-bottom: 22px; }
        .studio-invoice-template .info td:first-child, .studio-invoice-template .bank td:first-child { width: 25%; color: #52636d; font-weight: 700; font-size: 12px; }
        .studio-invoice-template .info td:last-child, .studio-invoice-template .bank td:last-child { font-size: 13px; }
        .studio-invoice-template .section { margin: 19px 0 6px; color: var(--navy); font-size: 14px; font-weight: 700; letter-spacing: .02em; }
        .studio-invoice-template th { background: var(--teal); color: #fff; font-size: 12px; text-align: center; }
        .studio-invoice-template td { font-size: 12px; }
        .studio-invoice-template .center { text-align: center; }
        .studio-invoice-template .items td { height: 118px; }
        .studio-invoice-template .items .description { width: 58%; line-height: 1.45; }
        .studio-invoice-template .items .qty { width: 10%; text-align: center; }
        .studio-invoice-template .items .money { width: 16%; text-align: right; }
        .studio-invoice-template .subtotal td { height: auto; font-weight: 700; color: var(--navy); }
        .studio-invoice-template .subtotal td:first-child { text-align: right; }
        .studio-invoice-template .terms { margin-top: 4px; }
        .studio-invoice-template .terms td { background: var(--pale); color: var(--teal); text-align: center; font-size: 12px; font-weight: 700; }
        .studio-invoice-template .note, .studio-invoice-template .consent, .studio-invoice-template .instructions { font-size: 11px; line-height: 1.45; }
        .studio-invoice-template .note { margin: 13px 0 0; }
        .studio-invoice-template .label { color: var(--teal); font-weight: 700; letter-spacing: .03em; }
        .studio-invoice-template .consent { margin: 6px 0 0; }
        .studio-invoice-template .instructions { margin: 8px 0 0; color: #52636d; font-style: italic; }
        .studio-invoice-template .receipt .kicker { margin-bottom: 25px; }
        .studio-invoice-template .receipt .section { margin-top: 28px; }
        .studio-invoice-template .payment td { text-align: center; font-size: 13px; padding: 11px 7px; }
        .studio-invoice-template .signature { margin-top: 80px; text-align: right; color: #52636d; font-size: 12px; line-height: 2; }
        .studio-invoice-template .thanks { margin-top: 78px; text-align: center; color: var(--teal); font-weight: 700; font-size: 14px; }
      `}</style>
      
      <main className="sheet invoice mb-8">
        <div className="brand"><div className="studio">SHYAM STUDIO</div><div className="title">INVOICE</div></div>
        <div className="contact">BHANDEWADI R.L.Y. STATION ROAD, PARDI, NAGPUR – 35 &nbsp;|&nbsp; 8855906847 &nbsp;•&nbsp; 7775854937 &nbsp;•&nbsp; 9404291477</div>
        <div className="kicker">ORDER BOOKING MEMO</div>
        <table className="meta"><tbody><tr><td>BILL NO. &nbsp;{data.billNo || '_____'}</td><td className="right">DATE &nbsp;{data.date || '___'}</td></tr></tbody></table>

        <table className="info">
          <tbody>
            <tr><td>Customer</td><td>{data.customerName}</td></tr>
            <tr><td>Bride / Groom</td><td>{data.brideGroom1}</td></tr>
            <tr><td>Address</td><td>{data.customerAddress}</td></tr>
            <tr><td>Birth date</td><td>{data.brideGroom1BirthDate}</td></tr>
            <tr><td>Birth place</td><td>{data.brideGroom1BirthPlace}</td></tr>
            <tr><td>Mobile / telephone</td><td>{data.customerMobile}</td></tr>
            <tr><td>Occupation</td><td>{data.customerOccupation}</td></tr>
            <tr><td>Email</td><td>{data.customerEmail}</td></tr>
            <tr><td>Bride / Groom</td><td>{data.brideGroom2}</td></tr>
            <tr><td>Birth date</td><td>{data.brideGroom2BirthDate}</td></tr>
            <tr><td>Birth place</td><td>{data.brideGroom2BirthPlace}</td></tr>
          </tbody>
        </table>

        <div className="section">FUNCTION SCHEDULE</div>
        <table className="schedule">
          <thead><tr><th>Time</th><th>Function</th><th>Date</th><th>Venue</th></tr></thead>
          <tbody>
            {data.schedules && data.schedules.length > 0 ? (
              data.schedules.map(sch => (
                <tr key={sch.id}>
                  <td className="center">{sch.time}</td>
                  <td className="center">{sch.functionName}</td>
                  <td className="center">{sch.date}</td>
                  <td className="center">{sch.venue}</td>
                </tr>
              ))
            ) : (
              <tr><td className="center">&nbsp;</td><td className="center">&nbsp;</td><td className="center">&nbsp;</td><td className="center">&nbsp;</td></tr>
            )}
          </tbody>
        </table>

        <div className="section">SERVICE DETAILS</div>
        <table className="items">
          <thead><tr><th>Description</th><th>Qty.</th><th>Rate</th><th>Amount</th></tr></thead>
          <tbody>
            {data.items && data.items.length > 0 ? (
              data.items.map(item => (
                <tr key={item.id}>
                  <td className="description">{item.description}</td>
                  <td className="qty">{item.qty}</td>
                  <td className="money">₹{item.rate}</td>
                  <td className="money"><strong>₹{item.amount}</strong></td>
                </tr>
              ))
            ) : (
              <tr><td className="description">&nbsp;</td><td className="qty"></td><td className="money"></td><td className="money"></td></tr>
            )}
            <tr className="subtotal"><td colSpan={3}>Subtotal</td><td className="money">₹{data.subtotal || 0}</td></tr>
          </tbody>
        </table>

        <div className="section">PAYMENT TERMS</div>
        <table className="terms"><tbody><tr><td>50% ADVANCE ON BOOKING</td><td>25% ON FIRST SHOOTING DAY</td><td>25% AGAINST DELIVERY</td></tr></tbody></table>

        <div className="section">BANK DETAILS</div>
        <table className="bank"><tbody><tr><td>Bank</td><td>Punjab National Bank &nbsp;|&nbsp; Account name: Ritu N. Rokade</td></tr><tr><td>Account / IFSC</td><td>A/c no. 51842121008558 &nbsp;|&nbsp; IFSC: PUNB0513910</td></tr></tbody></table>
        <p className="note"><span className="label">NOTE &nbsp;</span>This is an electronically generated invoice and does not require a digital signature.</p>
        <p className="consent"><span className="label">MEDIA CONSENT &nbsp;</span>Digital images received for the wedding—photographs and video—may be used by the concept designer or anyone authorized by them, without further compensation. All photographs, negatives, positives, digital files, videos, and prints remain the sole property of the concept designer. Shyam Studio is not responsible for photographs or video left with us for more than one month.</p>
        <p className="instructions">Please provide the function type, date, venue, time, video format (DVD, HD, Full HD, or 4K), photo requirements, contact numbers, and an emergency contact.</p>
      </main>

      {/* Adding a visual break for the screen, but it will be rendered sequentially in PDF or multiple pages */}
      <main className="sheet receipt">
        <div className="brand"><div className="studio">SHYAM STUDIO</div><div className="title">PAYMENT RECEIPT</div></div>
        <div className="kicker">CASH / CREDIT MEMO</div>
        <table className="meta"><tbody><tr><td>BILL NO. &nbsp;{data.billNo || '_____'}</td><td className="right">DATE &nbsp;{data.date || '___'}</td></tr><tr><td>CUSTOMER &nbsp;{data.customerName || '_____'}</td><td className="right">AMOUNT RECEIVED &nbsp;₹{data.advance || '________'}</td></tr></tbody></table>
        <div className="section">PAYMENT METHOD</div>
        <table className="payment"><tbody><tr><td>☐ Cash</td><td>☐ Credit card</td><td>☐ Cheque no.</td><td>☐ Paytm</td><td>☐ Other</td></tr></tbody></table>
        <div className="section">BANK DETAILS</div>
        <table className="bank"><tbody><tr><td>Bank</td><td>Punjab National Bank &nbsp;|&nbsp; Account name: Ritu N. Rokade</td></tr><tr><td>Account / IFSC</td><td>A/c no. 51842121008558 &nbsp;|&nbsp; IFSC: PUNB0513910 &nbsp;|&nbsp; Mobile: 8855906847</td></tr></tbody></table>
        <div className="signature">Authorized signature<br/>____________________________</div>
        <div className="thanks">Thank you for choosing Shyam Studio.</div>
      </main>
    </div>
  );
}
