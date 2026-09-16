import { collection, getDocs, doc, setDoc, deleteDoc, getDoc, updateDoc, query, orderBy } from "firebase/firestore";
import { db } from "../firebase";
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
	getAllBills: async (): Promise<BillData[]> => {
		try {
			const q = query(collection(db, "bills"), orderBy("createdAt", "desc"));
			const querySnapshot = await getDocs(q);
			const bills: BillData[] = [];
			querySnapshot.forEach((doc) => {
				bills.push(doc.data() as BillData);
			});
			return bills;
		} catch (e) {
			console.error("Failed to load bills from cloud", e);
			return [];
		}
	},

	getBillById: async (id: string): Promise<BillData | undefined> => {
		try {
			const docRef = doc(db, "bills", id);
			const docSnap = await getDoc(docRef);
			if (docSnap.exists()) {
				return docSnap.data() as BillData;
			}
		} catch (e) {
			console.error("Failed to get bill", e);
		}
		return undefined;
	},

	canEditBill: async (id: string): Promise<boolean> => {
		const bills = await storage.getAllBills();
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

	cancelBill: async (id: string): Promise<void> => {
		try {
			const docRef = doc(db, "bills", id);
			await updateDoc(docRef, { status: "CANCELLED" });
		} catch (e) {
			console.error("Failed to cancel bill", e);
		}
	},

	saveBill: async (bill: BillData): Promise<void> => {
		const canEdit = await storage.canEditBill(bill.id);
		if (!canEdit) {
			throw new Error("LOCKED_INVOICE");
		}
		try {
			await setDoc(doc(db, "bills", bill.id), bill);
		} catch (e) {
			console.error("Failed to save bill", e);
			throw e;
		}
	},

	deleteBill: async (id: string): Promise<void> => {
		try {
			await deleteDoc(doc(db, "bills", id));
		} catch (e) {
			console.error("Failed to delete bill", e);
		}
	},

	getNextBillNumber: async (): Promise<string> => {
		const bills = await storage.getAllBills();
		if (bills.length === 0) return "0001";

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

	getAllInvoices: async (): Promise<InvoiceData[]> => {
		try {
			const q = query(collection(db, "invoices"), orderBy("createdAt", "desc"));
			const querySnapshot = await getDocs(q);
			const invoices: InvoiceData[] = [];
			querySnapshot.forEach((doc) => {
				invoices.push(doc.data() as InvoiceData);
			});
			return invoices;
		} catch (e) {
			console.error("Failed to load invoices from cloud", e);
			return [];
		}
	},

	getInvoiceById: async (id: string): Promise<InvoiceData | undefined> => {
		try {
			const docRef = doc(db, "invoices", id);
			const docSnap = await getDoc(docRef);
			if (docSnap.exists()) {
				return docSnap.data() as InvoiceData;
			}
		} catch (e) {
			console.error("Failed to get invoice", e);
		}
		return undefined;
	},

	canEditInvoice: async (id: string): Promise<boolean> => {
		const invoices = await storage.getAllInvoices();
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

	cancelInvoice: async (id: string): Promise<void> => {
		try {
			const docRef = doc(db, "invoices", id);
			await updateDoc(docRef, { status: "CANCELLED" });
		} catch (e) {
			console.error("Failed to cancel invoice", e);
		}
	},

	saveInvoice: async (invoice: InvoiceData): Promise<void> => {
		const canEdit = await storage.canEditInvoice(invoice.id);
		if (!canEdit) {
			throw new Error("LOCKED_INVOICE");
		}
		try {
			await setDoc(doc(db, "invoices", invoice.id), invoice);
		} catch (e) {
			console.error("Failed to save invoice", e);
			throw e;
		}
	},

	deleteInvoice: async (id: string): Promise<void> => {
		try {
			await deleteDoc(doc(db, "invoices", id));
		} catch (e) {
			console.error("Failed to delete invoice", e);
		}
	},

	getNextInvoiceNumber: async (): Promise<string> => {
		const invoices = await storage.getAllInvoices();
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

	getAllCloudDocs: async (): Promise<CloudDoc[]> => {
		try {
			const q = query(collection(db, "cloudDocs"), orderBy("uploadedAt", "desc"));
			const querySnapshot = await getDocs(q);
			const docs: CloudDoc[] = [];
			querySnapshot.forEach((doc) => {
				docs.push(doc.data() as CloudDoc);
			});
			return docs;
		} catch (e) {
			console.error("Failed to load cloud docs", e);
			return [];
		}
	},

	saveCloudDoc: async (docData: CloudDoc): Promise<void> => {
		try {
			await setDoc(doc(db, "cloudDocs", docData.id), docData);
		} catch (e) {
			console.error("Failed to save cloud doc", e);
			throw e;
		}
	},

	deleteCloudDoc: async (id: string): Promise<void> => {
		try {
			await deleteDoc(doc(db, "cloudDocs", id));
		} catch (e) {
			console.error("Failed to delete cloud doc", e);
		}
	},

	migrateLocalData: async (): Promise<void> => {
		// Only run migration once if Firestore has NO bills/invoices/docs
		// First check bills
		const existingBills = await storage.getAllBills();
		if (existingBills.length === 0) {
			const localBillsStr = localStorage.getItem(STORAGE_KEY_BILLS);
			if (localBillsStr) {
				try {
					const localBills = JSON.parse(localBillsStr) as BillData[];
					for (const b of localBills) {
						await setDoc(doc(db, "bills", b.id), b);
					}
					console.log("Migrated bills to Firestore");
				} catch {}
			}
		}

		const existingInvoices = await storage.getAllInvoices();
		if (existingInvoices.length === 0) {
			const localInvoicesStr = localStorage.getItem(STORAGE_KEY_INVOICES);
			if (localInvoicesStr) {
				try {
					const localInvoices = JSON.parse(localInvoicesStr) as InvoiceData[];
					for (const inv of localInvoices) {
						await setDoc(doc(db, "invoices", inv.id), inv);
					}
					console.log("Migrated invoices to Firestore");
				} catch {}
			}
		}

		const existingDocs = await storage.getAllCloudDocs();
		if (existingDocs.length === 0) {
			const localDocsStr = localStorage.getItem(STORAGE_KEY_CLOUD_DOCS);
			if (localDocsStr) {
				try {
					const localDocs = JSON.parse(localDocsStr) as CloudDoc[];
					for (const d of localDocs) {
						await setDoc(doc(db, "cloudDocs", d.id), d);
					}
					console.log("Migrated cloud docs to Firestore");
				} catch {}
			}
		}
	}
};
