import { useState, useEffect } from 'react';
import { storage } from '../services/storage';
import type { BillData } from '../types/invoice';
import { Link } from 'react-router-dom';

export function BillDashboard() {
  const [bills, setBills] = useState<BillData[]>([]);

  useEffect(() => {
    setBills(storage.getAllBills());
  }, []);

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this bill?')) {
      storage.deleteBill(id);
      setBills(storage.getAllBills());
    }
  };

  const handleSendWhatsApp = (bill: BillData) => {
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

  return (
    <div className="max-w-7xl mx-auto py-8 sm:px-6 lg:px-8 font-sans">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-slate-900 font-outfit">Saved Bills</h2>
        <Link to="/bill" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded shadow">
          + Create New Bill
        </Link>
      </div>
      
      <div className="bg-white shadow overflow-hidden sm:rounded-md border border-slate-200">
        {bills.length === 0 ? (
          <div className="p-6 text-center text-gray-500">No bills saved yet.</div>
        ) : (
          <ul className="divide-y divide-slate-200">
            {bills.map((bill) => (
              <li key={bill.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
                <div className="flex flex-col">
                  <span className="text-lg font-semibold text-gray-900">{bill.billNo} - {bill.customerName || 'Unknown Customer'}</span>
                  <span className="text-sm text-gray-500">Date: {bill.date} | Total: ₹{bill.total} | Balance: <span className={bill.balance > 0 ? "text-red-500" : "text-green-500"}>₹{bill.balance}</span></span>
                </div>
                <div className="flex gap-2">
                  <Link to={`/bill/${bill.id}`} className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded text-sm font-medium border border-slate-300">
                    View / Print
                  </Link>
                  <button onClick={() => handleSendWhatsApp(bill)} className="bg-green-500 hover:bg-green-600 text-white px-3 py-1.5 rounded text-sm font-medium">
                    Send WA
                  </button>
                  <button onClick={() => handleDelete(bill.id)} className="bg-red-50 hover:bg-red-100 text-red-600 px-3 py-1.5 rounded text-sm font-medium border border-red-200">
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
