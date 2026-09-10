import type React from "react";

const predefinedOptions = [
	"Photo frame",
	"Passport size photo",
	"Printout",
	"Lamination",
	"Other (Custom)",
];

interface BillFormProps {
	billNo: string;
	date: string;
	customerName: string;
	setCustomerName: (v: string) => void;
	customerMobile: string;
	setCustomerMobile: (v: string) => void;
	customerAddress: string;
	setCustomerAddress: (v: string) => void;
	isItemsExpanded: boolean;
	setIsItemsExpanded: (v: boolean) => void;
	selectedOptions: Record<string, boolean>;
	setSelectedOptions: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
	itemDescriptions: Record<string, string>;
	setItemDescriptions: React.Dispatch<React.SetStateAction<Record<string, string>>>;
	itemQuantities: Record<string, string>;
	setItemQuantities: React.Dispatch<React.SetStateAction<Record<string, string>>>;
	itemAmounts: Record<string, string>;
	setItemAmounts: React.Dispatch<React.SetStateAction<Record<string, string>>>;
	details: string;
	setDetails: (v: string) => void;
	subTotal: number;
	discount: number;
	setDiscount: (v: number) => void;
	total: number;
	advance: number;
	setAdvance: (v: number) => void;
	balance: number;
	onPreview: () => void;
}

export function BillForm({
	billNo,
	date,
	customerName,
	setCustomerName,
	customerMobile,
	setCustomerMobile,
	customerAddress,
	setCustomerAddress,
	isItemsExpanded,
	setIsItemsExpanded,
	selectedOptions,
	setSelectedOptions,
	itemDescriptions,
	setItemDescriptions,
	itemQuantities,
	setItemQuantities,
	itemAmounts,
	setItemAmounts,
	details,
	setDetails,
	subTotal,
	discount,
	setDiscount,
	total,
	advance,
	setAdvance,
	balance,
	onPreview,
}: BillFormProps) {
	return (
		<div className="max-w-4xl mx-auto p-6 bg-white shadow-md my-8 rounded-lg font-sans text-gray-900">
			<h2 className="text-2xl font-bold mb-6 text-slate-800">Create New Bill</h2>
			<div className="grid grid-cols-2 gap-6 mb-6">
				<div>
					<label className="block text-sm font-medium text-gray-700 mb-1">Bill No (Auto)</label>
					<input
						type="text"
						value={billNo}
						readOnly
						className="w-full border-gray-300 rounded-md bg-gray-50 px-3 py-2 border"
					/>
				</div>
				<div>
					<label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
					<input
						type="text"
						value={date}
						readOnly
						className="w-full border-gray-300 rounded-md bg-gray-50 px-3 py-2 border"
					/>
				</div>
			</div>

			<div className="grid grid-cols-2 gap-6 mb-6">
				<div>
					<label className="block text-sm font-medium text-gray-700 mb-1">Customer Name</label>
					<input
						type="text"
						value={customerName}
						onChange={(e) => setCustomerName(e.target.value)}
						className="w-full border-gray-300 rounded-md px-3 py-2 border"
						placeholder="Enter Name"
					/>
				</div>
				<div>
					<label className="block text-sm font-medium text-gray-700 mb-1">Mobile No.</label>
					<input
						type="text"
						value={customerMobile}
						onChange={(e) => setCustomerMobile(e.target.value)}
						className="w-full border-gray-300 rounded-md px-3 py-2 border"
						placeholder="Enter Mobile"
					/>
				</div>
			</div>

			<div className="mb-6">
				<label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
				<input
					type="text"
					value={customerAddress}
					onChange={(e) => setCustomerAddress(e.target.value)}
					className="w-full border-gray-300 rounded-md px-3 py-2 border"
					placeholder="Enter Address"
				/>
			</div>

			<div className="mb-6 border rounded-md overflow-hidden bg-white shadow-sm">
				<button
					type="button"
					onClick={() => setIsItemsExpanded(!isItemsExpanded)}
					className="w-full px-4 py-3 bg-gray-50 flex justify-between items-center text-sm font-bold text-gray-700 hover:bg-gray-100 transition-colors"
				>
					<span className="flex items-center gap-2">
						📦 Select Items / Products
						{Object.values(selectedOptions).filter(Boolean).length > 0 && (
							<span className="bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full font-medium">
								{Object.values(selectedOptions).filter(Boolean).length} Selected
							</span>
						)}
					</span>
					<span className={`transform transition-transform ${isItemsExpanded ? "rotate-180" : ""}`}>
						▼
					</span>
				</button>

				<div
					className={`transition-all duration-300 ease-in-out ${isItemsExpanded ? "max-h-[1500px] opacity-100" : "max-h-0 opacity-0"}`}
				>
					<div className="p-4 space-y-3 border-t">
						{predefinedOptions.map((opt) => (
							<div key={opt} className="p-3 border rounded-md bg-slate-50 transition-colors">
								<div className="flex items-center">
									<input
										type="checkbox"
										id={opt}
										checked={!!selectedOptions[opt]}
										onChange={(e) =>
											setSelectedOptions((prev) => ({
												...prev,
												[opt]: e.target.checked,
											}))
										}
										className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded cursor-pointer"
									/>
									<label
										htmlFor={opt}
										className="ml-2 text-sm font-medium text-gray-900 flex-1 cursor-pointer select-none"
									>
										{opt}
									</label>
								</div>
								<div
									className={`overflow-hidden transition-all duration-300 ease-in-out ${selectedOptions[opt] ? "max-h-40 opacity-100 mt-3" : "max-h-0 opacity-0"}`}
								>
									<div className="ml-6 flex gap-4">
										<div className="flex-1">
											<label className="block text-xs font-medium text-gray-700 mb-1">
												Description
											</label>
											<input
												type="text"
												value={itemDescriptions[opt] || ""}
												onChange={(e) =>
													setItemDescriptions((prev) => ({
														...prev,
														[opt]: e.target.value,
													}))
												}
												className="w-full border-gray-300 rounded-md px-3 py-1.5 border text-sm"
												placeholder={
													opt === "Other (Custom)"
														? "Item name & details..."
														: "Add more details (optional)"
												}
											/>
										</div>
										<div className="w-24">
											<label className="block text-xs font-medium text-gray-700 mb-1">Qty</label>
											<input
												type="number"
												min="1"
												value={itemQuantities[opt] || "1"}
												onChange={(e) =>
													setItemQuantities((prev) => ({
														...prev,
														[opt]: e.target.value,
													}))
												}
												className="w-full border-gray-300 rounded-md px-3 py-1.5 border text-sm"
											/>
										</div>
										<div className="w-32">
											<label className="block text-xs font-medium text-gray-700 mb-1">
												Amount (₹)
											</label>
											<input
												type="number"
												min="0"
												value={itemAmounts[opt] || ""}
												onChange={(e) =>
													setItemAmounts((prev) => ({
														...prev,
														[opt]: e.target.value,
													}))
												}
												className="w-full border-gray-300 rounded-md px-3 py-1.5 border text-sm"
												placeholder="0"
											/>
										</div>
									</div>
								</div>
							</div>
						))}
					</div>
				</div>
			</div>

			<div className="mb-6">
				<label className="block text-sm font-medium text-gray-700 mb-1">
					Custom Notes / Details (Optional)
				</label>
				<textarea
					value={details}
					onChange={(e) => setDetails(e.target.value)}
					rows={2}
					className="w-full border-gray-300 rounded-md px-3 py-2 border"
					placeholder="Any other details..."
				></textarea>
			</div>

			<div className="grid grid-cols-5 gap-4 mb-8 border-t pt-4">
				<div>
					<label className="block text-sm font-medium text-gray-700 mb-1">Sub Total</label>
					<div className="text-xl font-bold text-slate-600">₹{subTotal}</div>
				</div>
				<div>
					<label className="block text-sm font-medium text-gray-700 mb-1">
						Discount (₹)
					</label>
					<input
						type="number"
						min="0"
						value={discount || ""}
						onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
						className="w-full border-gray-300 rounded-md px-3 py-2 border"
						placeholder="0"
					/>
				</div>
				<div>
					<label className="block text-sm font-medium text-gray-700 mb-1">Total Amount</label>
					<div className="text-xl font-bold text-slate-800">₹{total}</div>
				</div>
				<div>
					<label className="block text-sm font-medium text-gray-700 mb-1">
						Advance (₹)
					</label>
					<input
						type="number"
						min="0"
						value={advance || ""}
						onChange={(e) => setAdvance(parseFloat(e.target.value) || 0)}
						className="w-full border-gray-300 rounded-md px-3 py-2 border"
						placeholder="0"
					/>
				</div>
				<div>
					<label className="block text-sm font-medium text-gray-700 mb-1">Balance Due</label>
					<div className="text-xl font-bold text-red-600">₹{balance}</div>
				</div>
			</div>

			<div className="flex justify-end">
				<button
					onClick={onPreview}
					className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded shadow"
				>
					Preview Bill
				</button>
			</div>
		</div>
	);
}
