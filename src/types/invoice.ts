export interface InvoiceItem {
	id: string;
	description: string;
	qty: number;
	rate: number;
	amount: number;
}

export interface InvoiceData {
	id: string;
	invoiceNo: string;
	date: string;
	customerName: string;
	customerMobile: string;
	items: Row[];
	schedule: ScheduleRow[];
	payMethods: PaymentMethod[];
	createdAt: number;
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
	discount: number;
	balance: number;
	total: number;
	watermarkText: string;
	showWatermark: boolean;
	createdAt: number;
}

export type Row = {
	id: string;
	desc: string;
	qty: string;
	rate: string;
	amount: string;
};
export type ScheduleRow = {
	id: string;
	time: string;
	fn: string;
	date: string;
	venue: string;
};
export type PaymentMethod = { id: string; label: string; checked: boolean };
