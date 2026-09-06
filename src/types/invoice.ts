export interface InvoiceItem {
  id: string;
  description: string;
  qty: number;
  rate: number;
  amount: number;
}

export interface InvoiceData {
  // Common
  billNo: string;
  date: string;
  customerName: string;
  customerMobile: string;
  customerAddress: string;

  // Studio specific
  brideGroom1?: string;
  brideGroom1BirthDate?: string;
  brideGroom1BirthTime?: string;
  brideGroom1BirthPlace?: string;
  brideGroom2?: string;
  brideGroom2BirthDate?: string;
  brideGroom2BirthTime?: string;
  brideGroom2BirthPlace?: string;
  customerOccupation?: string;
  customerEmail?: string;

  // Graphic Designer specific
  // Uses common fields mostly

  // Items
  items: InvoiceItem[];
  subtotal: number;
  advance: number;
  balance: number;

  // Studio Schedule
  schedules?: {
    id: string;
    time: string;
    functionName: string;
    date: string;
    venue: string;
  }[];
}

export interface BillItem {
  id: string;
  sr: string;
  desc: string;
  qty: string;
  rate: string;
  amount: string;
}

export interface BillData {
  id: string;
  billNo: string;
  date: string;
  customerName: string;
  customerMobile: string;
  customerAddress: string;
  details: string; // Custom details/notes
  items: BillItem[];
  advance: number;
  balance: number;
  total: number;
  watermarkText: string;
  showWatermark: boolean;
  createdAt: number;
}
