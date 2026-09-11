export function InvoicePage2({ readOnly }: { readOnly?: boolean }) {
	return (
		<div className="a4-page" style={{ position: "relative" }}>
			{/* "Agreement" watermark behind Page 2 */}
			<div
				className="no-print"
				style={{
					position: "absolute",
					top: "50%",
					left: "50%",
					transform: "translate(-50%, -50%) rotate(-45deg)",
					fontSize: "120px",
					color: "rgba(0,0,0,0.03)",
					fontWeight: 900,
					pointerEvents: "none",
					whiteSpace: "nowrap",
					zIndex: 0,
				}}
			>
				TERMS & CONDITIONS
			</div>

			<div style={{ position: "relative", zIndex: 1 }}>
				<div className="inv-header">
					<div className="inv-studio-name">
						<span>SHYAM STUDIO</span>
					</div>
					<div className="inv-studio-sub">
						<span>Photography · Videography · Events</span>
					</div>
				</div>

				<div className="inv-section-head">
					<span>Terms & Conditions</span>
				</div>
				<div className="terms-body">
					{[
						"We reserve the right to display photographs and videos for promotional purposes on our website, social media, and portfolio. If you wish to opt out, please inform us in writing prior to the event.",
						"The client is responsible for acquiring all necessary permissions and clearances for photography and videography at the venues (including temples, hotels, monuments, etc.). Any fees or restrictions imposed by the venue are the client's responsibility.",
						"While we use professional-grade equipment, we are not liable for technical failures, loss of data, or equipment malfunction beyond our reasonable control. In such rare events, liability is limited to a refund of the amount paid for the affected services.",
						"Any additional hours or services beyond the agreed package will be billed at standard hourly rates.",
						"Raw footage and unedited photos will be retained for a maximum of 30 days post-delivery of final files. Clients are advised to backup their files immediately upon receipt.",
						"Travel, accommodation, and food arrangements for the crew during outstation shoots must be provided by the client unless explicitly stated otherwise in the package.",
						"Force Majeure: The studio is not liable for delays or non-performance due to circumstances beyond our control (e.g., extreme weather, natural disasters, strikes, or sudden illness).",
						"In case of cancellation by the client, the advance payment is strictly non-refundable.",
						"We aim to deliver final edited photos and videos within 6-8 weeks from the date of final selection provided by the client. Delays in selection will correspondingly delay the final delivery.",
						"Please ensure that the final payment is cleared on or before the delivery of final processed materials. Processed work will not be handed over until full payment is received.",
					].map((term, i) => (
						<div key={`term-${i}`} className="term-item">
							<span className="term-num">{i + 1}.</span>
							<span
								contentEditable={!readOnly}
								suppressContentEditableWarning
								className="term-text"
							>
								{term}
							</span>
						</div>
					))}
					<div className="term-item">
						<span className="term-num">•</span>
						<span contentEditable={!readOnly} suppressContentEditableWarning className="term-text">
							By confirming the booking and paying the advance, you acknowledge that you have read,
							understood, and agreed to these terms.
						</span>
					</div>
				</div>

				{/* Signatures at bottom of Page 2 */}
				<div
					style={{
						display: "flex",
						justifyContent: "space-between",
						marginTop: 100,
					}}
				>
					<div style={{ textAlign: "center" }}>
						<div className="sig-line" />
						<div style={{ fontSize: "9.5pt", color: "#52636d", marginTop: 4 }}>
							<span>Client Signature</span>
						</div>
					</div>
					<div style={{ textAlign: "center" }}>
						<div className="sig-line" />
						<div style={{ fontSize: "9.5pt", color: "#52636d", marginTop: 4 }}>
							<span>Authorized Signature</span>
						</div>
						<div
							style={{
								fontSize: "9pt",
								color: "#163a4a",
								fontWeight: 600,
								marginTop: 2,
							}}
						>
							<span>Shyam Studio</span>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
