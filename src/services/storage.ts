import type { BillData } from '../types/invoice';

const STORAGE_KEY_BILLS = 'shyam_bills_v1';

export const storage = {
  getAllBills: (): BillData[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEY_BILLS);
      if (data) {
        return JSON.parse(data) as BillData[];
      }
    } catch (e) {
      console.error('Failed to load bills', e);
    }
    return [];
  },

  getBillById: (id: string): BillData | undefined => {
    const bills = storage.getAllBills();
    return bills.find((b) => b.id === id);
  },

  saveBill: (bill: BillData) => {
    const bills = storage.getAllBills();
    const index = bills.findIndex((b) => b.id === bill.id);
    if (index >= 0) {
      bills[index] = bill;
    } else {
      bills.push(bill);
    }
    // Sort by createdAt descending
    bills.sort((a, b) => b.createdAt - a.createdAt);
    localStorage.setItem(STORAGE_KEY_BILLS, JSON.stringify(bills));
  },

  deleteBill: (id: string) => {
    const bills = storage.getAllBills();
    const filtered = bills.filter((b) => b.id !== id);
    localStorage.setItem(STORAGE_KEY_BILLS, JSON.stringify(filtered));
  },

  getNextBillNumber: (): string => {
    const bills = storage.getAllBills();
    if (bills.length === 0) return '0001';
    
    // Find highest bill number
    let max = 0;
    for (const bill of bills) {
      const match = bill.billNo.match(/\d+/);
      if (match) {
        const num = parseInt(match[0], 10);
        if (num > max) max = num;
      }
    }
    return String(max + 1).padStart(4, '0');
  }
};
