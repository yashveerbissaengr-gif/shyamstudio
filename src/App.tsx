import { MotionConfig } from "framer-motion";
import { Route, BrowserRouter as Router, Routes, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import { BillGenerator } from "./pages/BillGenerator";
import { BillViewer } from "./pages/BillViewer";
import { Dashboard } from "./pages/Dashboard";
import Home from "./pages/Home";
import { InvoiceGenerator } from "./pages/InvoiceGenerator";

function AppLayout() {
	const location = useLocation();
	const isTool =
		location.pathname.startsWith("/bill") ||
		location.pathname.startsWith("/invoice") ||
		location.pathname.startsWith("/dashboard");

	return (
		<div className="min-h-screen bg-ink text-paper font-sans">
			{!isTool && <Navbar />}
			<main>
				<Routes>
					<Route path="/" element={<Home />} />
					<Route path="/invoice" element={<InvoiceGenerator />} />
					<Route path="/invoice/:id" element={<InvoiceGenerator />} />
					<Route path="/bill" element={<BillGenerator />} />
					<Route path="/bill/:id" element={<BillViewer />} />
					<Route path="/dashboard" element={<Dashboard />} />
				</Routes>
			</main>
		</div>
	);
}

function App() {
	return (
		<MotionConfig reducedMotion="user">
			<Router>
				<AppLayout />
			</Router>
		</MotionConfig>
	);
}

export default App;
