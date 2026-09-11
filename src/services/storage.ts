import type { BillData, InvoiceData } from "../types/invoice";

const STORAGE_KEY_BILLS = "shyam_bills_v1";
const STORAGE_KEY_INVOICES = "shyam_invoices_v1";
const STORAGE_KEY_CLOUD_DOCS = "shyam_cloud_docs_v1";

export interface CloudDoc {
	id: string;
	name: string;
	url: string;
	format: string;
	size: string;
	type: "bill" | "invoice" | "other";
	uploadedAt: number;
}

export const storage = {
	getAllBills: (): BillData[] => {
		try {
			const data = localStorage.getItem(STORAGE_KEY_BILLS);
			if (data) {
				return JSON.parse(data) as BillData[];
			}
		} catch (e) {
			console.error("Failed to load bills", e);
		}
		return [];
	},

	getBillById: (id: string): BillData | undefined => {
		const bills = storage.getAllBills();
		return bills.find((b) => b.id === id);
	},

	canEditBill: (id: string): boolean => {
		const bills = storage.getAllBills();
		const target = bills.find((b) => b.id === id);
		if (!target) return true; // new bill
		
		const targetMatch = target.billNo.match(/\d+/);
		if (!targetMatch) return true;
		const targetNum = parseInt(targetMatch[0], 10);

		let max = 0;
		for (const bill of bills) {
			const match = bill.billNo.match(/\d+/);
			if (match) {
				const num = parseInt(match[0], 10);
				if (num > max) max = num;
			}
		}
		return targetNum >= max;
	},

	cancelBill: (id: string) => {
		const bills = storage.getAllBills();
		const index = bills.findIndex((b) => b.id === id);
		if (index >= 0) {
			bills[index].status = 'CANCELLED';
			localStorage.setItem(STORAGE_KEY_BILLS, JSON.stringify(bills));
		}
	},

	saveBill: (bill: BillData) => {
		const bills = storage.getAllBills();
		const index = bills.findIndex((b) => b.id === bill.id);
		
		if (index >= 0) {
			if (!storage.canEditBill(bill.id)) {
				throw new Error("LOCKED_INVOICE");
			}
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
		if (bills.length === 0) return "0001";

		// Find highest bill number
		let max = 0;
		for (const bill of bills) {
			const match = bill.billNo.match(/\d+/);
			if (match) {
				const num = parseInt(match[0], 10);
				if (num > max) max = num;
			}
		}
		return String(max + 1).padStart(4, "0");
	},

	getAllInvoices: (): InvoiceData[] => {
		try {
			const data = localStorage.getItem(STORAGE_KEY_INVOICES);
			if (data) {
				return JSON.parse(data) as InvoiceData[];
			}
		} catch (e) {
			console.error("Failed to load invoices", e);
		}
		return [];
	},

	getInvoiceById: (id: string): InvoiceData | undefined => {
		const invoices = storage.getAllInvoices();
		return invoices.find((inv) => inv.id === id);
	},

	canEditInvoice: (id: string): boolean => {
		const invoices = storage.getAllInvoices();
		const target = invoices.find((inv) => inv.id === id);
		if (!target) return true;
		
		const targetMatch = target.invoiceNo.match(/\d+/);
		if (!targetMatch) return true;
		const targetNum = parseInt(targetMatch[0], 10);

		let max = 0;
		for (const inv of invoices) {
			const match = inv.invoiceNo.match(/\d+/);
			if (match) {
				const num = parseInt(match[0], 10);
				if (num > max) max = num;
			}
		}
		return targetNum >= max;
	},

	cancelInvoice: (id: string) => {
		const invoices = storage.getAllInvoices();
		const index = invoices.findIndex((inv) => inv.id === id);
		if (index >= 0) {
			invoices[index].status = 'CANCELLED';
			localStorage.setItem(STORAGE_KEY_INVOICES, JSON.stringify(invoices));
		}
	},

	saveInvoice: (invoice: InvoiceData) => {
		const invoices = storage.getAllInvoices();
		const index = invoices.findIndex((inv) => inv.id === invoice.id);
		
		if (index >= 0) {
			if (!storage.canEditInvoice(invoice.id)) {
				throw new Error("LOCKED_INVOICE");
			}
			invoices[index] = invoice;
		} else {
			invoices.push(invoice);
		}
		invoices.sort((a, b) => b.createdAt - a.createdAt);
		localStorage.setItem(STORAGE_KEY_INVOICES, JSON.stringify(invoices));
	},

	deleteInvoice: (id: string) => {
		const invoices = storage.getAllInvoices();
		const filtered = invoices.filter((inv) => inv.id !== id);
		localStorage.setItem(STORAGE_KEY_INVOICES, JSON.stringify(filtered));
	},

	getNextInvoiceNumber: (): string => {
		const invoices = storage.getAllInvoices();
		if (invoices.length === 0) return "0001";

		let max = 0;
		for (const inv of invoices) {
			const match = inv.invoiceNo.match(/\d+/);
			if (match) {
				const num = parseInt(match[0], 10);
				if (num > max) max = num;
			}
		}
		return String(max + 1).padStart(4, "0");
	},

	getAllCloudDocs: (): CloudDoc[] => {
		try {
			const data = localStorage.getItem(STORAGE_KEY_CLOUD_DOCS);
			if (data) {
				return JSON.parse(data) as CloudDoc[];
			}
		} catch (e) {
			console.error("Failed to load cloud docs", e);
		}
		return [];
	},

	saveCloudDoc: (doc: CloudDoc) => {
		const docs = storage.getAllCloudDocs();
		docs.unshift(doc);
		localStorage.setItem(STORAGE_KEY_CLOUD_DOCS, JSON.stringify(docs));
	},

	deleteCloudDoc: (id: string) => {
		const docs = storage.getAllCloudDocs();
		const filtered = docs.filter((d) => d.id !== id);
		localStorage.setItem(STORAGE_KEY_CLOUD_DOCS, JSON.stringify(filtered));
	},
};

