import {
	Cloud,
	ExternalLink,
	FileSpreadsheet,
	FileText,
	Image as ImageIcon,
	Loader2,
	PlusCircle,
	Search,
	Trash2,
	Upload,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { cloudinaryService } from "../services/cloudinary";
import { storage } from "../services/storage";

export function Dashboard() {
	const [files, setFiles] = useState<any[]>([]);
	const [searchTerm, setSearchTerm] = useState("");
	const [filter, setFilter] = useState<"all" | "bill" | "invoice">("all");
	const [isUploading, setIsUploading] = useState(false);
	const [uploadDocType, setUploadDocType] = useState<"bill" | "invoice">("bill");
	const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
	const [uploadError, setUploadError] = useState<string | null>(null);

	const loadFiles = () => {
		const bills = storage.getAllBills().map((b) => ({
			id: b.id,
			name: `Bill_${b.billNo}_${b.customerName || "Customer"}.pdf`,
			size: "Local",
			date: new Date(b.createdAt).toISOString(),
			type: "bill",
			isCloud: false,
			url: null,
		}));

		const invoices = storage.getAllInvoices().map((i) => ({
			id: i.id,
			name: `Invoice_${i.invoiceNo}_${i.customerName || "Customer"}.pdf`,
			size: "Local",
			date: new Date(i.createdAt).toISOString(),
			type: "invoice",
			isCloud: false,
			url: null,
		}));

		const cloudDocs = storage.getAllCloudDocs().map((d) => ({
			id: d.id,
			name: d.name,
			size: d.size,
			date: new Date(d.uploadedAt).toISOString(),
			type: d.type,
			isCloud: true,
			url: d.url,
		}));

		const all = [...bills, ...invoices, ...cloudDocs].sort(
			(a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
		);
		setFiles(all);
	};

	useEffect(() => {
		loadFiles();
		window.addEventListener("storage", loadFiles);
		return () => window.removeEventListener("storage", loadFiles);
	}, []);

	const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;

		setIsUploading(true);
		setUploadSuccess(null);
		setUploadError(null);

		try {
			const res = await cloudinaryService.uploadFile(file, "invoices");
			
			// Format size
			let formattedSize = "Cloud";
			if (res.bytes) {
				const kb = res.bytes / 1024;
				formattedSize = kb > 1024 ? `${(kb / 1024).toFixed(1)} MB` : `${kb.toFixed(0)} KB`;
			}

			// Save to local storage registry
			storage.saveCloudDoc({
				id: res.public_id || `cloud_${Date.now()}`,
				name: file.name,
				url: res.secure_url,
				format: res.format || file.name.split(".").pop() || "file",
				size: formattedSize,
				type: uploadDocType,
				uploadedAt: Date.now(),
			});

			setUploadSuccess(`"${file.name}" uploaded to Cloudinary successfully!`);
			loadFiles();
		} catch (err: any) {
			console.error(err);
			setUploadError(err.message || "Failed to upload document to Cloudinary");
		} finally {
			setIsUploading(false);
			e.target.value = "";
		}
	};

	const filteredFiles = files.filter((f) => {
		const matchesSearch = f.name.toLowerCase().includes(searchTerm.toLowerCase());
		const matchesFilter = filter === "all" || f.type === filter;
		return matchesSearch && matchesFilter;
	});

	const handleDelete = (id: string, type: string, isCloud: boolean) => {
		if (window.confirm(`Are you sure you want to delete this ${type}? This action cannot be undone.`)) {
			if (isCloud) {
				storage.deleteCloudDoc(id);
			} else if (type === "bill") {
				storage.deleteBill(id);
			} else if (type === "invoice") {
				storage.deleteInvoice(id);
			}
			loadFiles();
		}
	};

	return (
		<div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-12">
			{/* Dashboard Header */}
			<div className="bg-white border-b border-slate-200">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="flex justify-between items-center py-6">
						<div>
							<h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
								<Cloud className="text-blue-600" size={28} />
								Admin Dashboard
							</h1>
							<p className="text-sm text-slate-500 mt-1">
								Manage your business documents and Cloudinary cloud archive.
							</p>
						</div>
						<Link
							to="/"
							className="text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors"
						>
							&larr; Back to Main Site
						</Link>
					</div>
				</div>
			</div>

			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
				{/* Quick Actions & Cloud Upload Panel */}
				<div className="mb-10">
					<h2 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4">
						Quick Actions & Cloud Upload
					</h2>
					<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
						<Link
							to="/bill"
							className="group bg-white rounded-xl border border-slate-200 p-6 flex items-center gap-4 hover:border-blue-500 hover:shadow-md transition-all"
						>
							<div className="bg-blue-50 text-blue-600 p-4 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-colors">
								<FileText size={32} />
							</div>
							<div>
								<h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
									Create New Bill
								</h3>
								<p className="text-sm text-slate-500 mt-1">
									Generate a standard receipt for regular customers.
								</p>
							</div>
							<PlusCircle
								className="ml-auto text-slate-300 group-hover:text-blue-500 transition-colors"
								size={24}
							/>
						</Link>

						<Link
							to="/invoice"
							className="group bg-white rounded-xl border border-slate-200 p-6 flex items-center gap-4 hover:border-purple-500 hover:shadow-md transition-all"
						>
							<div className="bg-purple-50 text-purple-600 p-4 rounded-lg group-hover:bg-purple-600 group-hover:text-white transition-colors">
								<FileSpreadsheet size={32} />
							</div>
							<div>
								<h3 className="text-lg font-bold text-slate-900 group-hover:text-purple-600 transition-colors">
									Create New Invoice
								</h3>
								<p className="text-sm text-slate-500 mt-1">
									Generate a detailed tax invoice for businesses.
								</p>
							</div>
							<PlusCircle
								className="ml-auto text-slate-300 group-hover:text-purple-500 transition-colors"
								size={24}
							/>
						</Link>

						{/* Cloudinary Direct File Upload Card */}
						<div className="bg-white rounded-xl border border-slate-200 p-6 flex flex-col justify-between hover:border-emerald-500 transition-all shadow-sm">
							<div className="flex items-center gap-3">
								<div className="bg-emerald-50 text-emerald-600 p-3 rounded-lg">
									<Upload size={24} />
								</div>
								<div>
									<h3 className="text-md font-bold text-slate-900">
										Cloud Storage Upload
									</h3>
									<p className="text-xs text-slate-500">
										Upload PDF or Image bill directly to Cloudinary.
									</p>
								</div>
							</div>

							<div className="mt-4">
								<div className="flex items-center gap-2 mb-3">
									<label className="text-xs font-semibold text-slate-600">Save as:</label>
									<select
										value={uploadDocType}
										onChange={(e) => setUploadDocType(e.target.value as "bill" | "invoice")}
										className="text-xs border border-slate-300 rounded px-2 py-1 bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
									>
										<option value="bill">Bill</option>
										<option value="invoice">Invoice</option>
									</select>
								</div>

								<label
									className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold cursor-pointer transition-colors ${
										isUploading
											? "bg-slate-100 text-slate-400 cursor-not-allowed"
											: "bg-emerald-600 text-white hover:bg-emerald-700 active:bg-emerald-800"
									}`}
								>
									{isUploading ? (
										<>
											<Loader2 size={16} className="animate-spin" />
											Uploading to Cloudinary...
										</>
									) : (
										<>
											<Upload size={16} />
											Choose File to Upload
										</>
									)}
									<input
										type="file"
										accept="image/*,application/pdf"
										className="hidden"
										disabled={isUploading}
										onChange={handleFileUpload}
									/>
								</label>
							</div>
						</div>
					</div>

					{/* Feedback Alerts */}
					{uploadSuccess && (
						<div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-sm flex justify-between items-center">
							<span>{uploadSuccess}</span>
							<button
								onClick={() => setUploadSuccess(null)}
								className="text-emerald-600 hover:text-emerald-900 font-bold ml-4"
							>
								✕
							</button>
						</div>
					)}
					{uploadError && (
						<div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-800 rounded-lg text-sm flex justify-between items-center">
							<span>{uploadError}</span>
							<button
								onClick={() => setUploadError(null)}
								className="text-red-600 hover:text-red-900 font-bold ml-4"
							>
								✕
							</button>
						</div>
					)}
				</div>

				{/* Cloud Archive Section */}
				<div>
					<div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
						<h2 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">
							Cloud Archive ({filteredFiles.length} Documents)
						</h2>

						<div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
							<div className="flex rounded-md shadow-sm">
								<button
									onClick={() => setFilter("all")}
									className={`px-4 py-2 text-sm font-medium rounded-l-lg border ${
										filter === "all"
											? "bg-slate-800 text-white border-slate-800"
											: "bg-white text-slate-600 border-slate-300 hover:bg-slate-50"
									}`}
								>
									All
								</button>
								<button
									onClick={() => setFilter("bill")}
									className={`px-4 py-2 text-sm font-medium border-t border-b ${
										filter === "bill"
											? "bg-slate-800 text-white border-slate-800"
											: "bg-white text-slate-600 border-slate-300 hover:bg-slate-50"
									}`}
								>
									Bills
								</button>
								<button
									onClick={() => setFilter("invoice")}
									className={`px-4 py-2 text-sm font-medium rounded-r-lg border ${
										filter === "invoice"
											? "bg-slate-800 text-white border-slate-800"
											: "bg-white text-slate-600 border-slate-300 hover:bg-slate-50"
									}`}
								>
									Invoices
								</button>
							</div>

							<div className="relative w-full sm:w-64">
								<Search
									className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
									size={16}
								/>
								<input
									type="text"
									placeholder="Search files..."
									className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
									value={searchTerm}
									onChange={(e) => setSearchTerm(e.target.value)}
								/>
							</div>
						</div>
					</div>

					<div className="bg-white shadow-sm overflow-hidden sm:rounded-xl border border-slate-200">
						{filteredFiles.length === 0 ? (
							<div className="p-16 text-center flex flex-col items-center">
								<div className="bg-slate-50 p-4 rounded-full mb-4">
									<ImageIcon className="text-slate-300" size={32} />
								</div>
								<h3 className="text-lg font-medium text-slate-900">No documents found</h3>
								<p className="text-slate-500 mt-1 max-w-sm text-sm">
									When you generate or upload bills or invoices, they will automatically be safely stored here.
								</p>
							</div>
						) : (
							<div className="overflow-x-auto">
								<table className="w-full text-left border-collapse">
									<thead>
										<tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500 font-semibold">
											<th className="p-4 px-6">Document Name</th>
											<th className="p-4 px-6">Date Uploaded</th>
											<th className="p-4 px-6">Storage & Size</th>
											<th className="p-4 px-6 text-right">Action</th>
										</tr>
									</thead>
									<tbody className="divide-y divide-slate-100">
										{filteredFiles.map((file) => (
											<tr key={file.id} className="hover:bg-slate-50 transition-colors group">
												<td className="p-4 px-6">
													<div className="flex items-center gap-3">
														<div
															className={`p-2 rounded-lg ${
																file.type === "invoice"
																	? "bg-purple-50 text-purple-600"
																	: "bg-blue-50 text-blue-600"
															}`}
														>
															{file.type === "invoice" ? (
																<FileSpreadsheet size={18} />
															) : (
																<FileText size={18} />
															)}
														</div>
														<div>
															<div className="flex items-center gap-2">
																<span className="font-medium text-slate-900 block">
																	{file.name}
																</span>
																{file.isCloud && (
																	<span className="bg-emerald-100 text-emerald-700 text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider">
																		Cloudinary
																	</span>
																)}
															</div>
															<span className="text-xs text-slate-400 capitalize">
																{file.type}
															</span>
														</div>
													</div>
												</td>
												<td className="p-4 px-6 text-sm text-slate-600">
													{new Date(file.date).toLocaleString(undefined, {
														year: "numeric",
														month: "short",
														day: "numeric",
														hour: "2-digit",
														minute: "2-digit",
													})}
												</td>
												<td className="p-4 px-6 text-sm text-slate-600">
													<span className="inline-flex items-center gap-1">
														{file.isCloud && <Cloud size={14} className="text-emerald-500" />}
														{file.size}
													</span>
												</td>
												<td className="p-4 px-6 text-right">
													<div className="flex justify-end gap-2">
														{file.isCloud ? (
															<a
																href={file.url}
																target="_blank"
																rel="noopener noreferrer"
																className="inline-flex items-center gap-1.5 text-sm font-medium text-emerald-700 hover:text-emerald-900 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-md transition-colors"
															>
																<ExternalLink size={14} />
																Open Cloud File
															</a>
														) : (
															<Link
																to={`/${file.type}/${file.id}`}
																className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-md transition-colors"
															>
																View/Edit
															</Link>
														)}
														<button
															onClick={() => handleDelete(file.id, file.type, file.isCloud)}
															className="inline-flex items-center gap-1.5 text-sm font-medium text-red-600 hover:text-red-900 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-md transition-colors"
															title="Delete"
														>
															<Trash2 size={14} />
														</button>
													</div>
												</td>
											</tr>
										))}
									</tbody>
								</table>
							</div>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}
