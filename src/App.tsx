import { MotionConfig } from "framer-motion";
import { Route, BrowserRouter as Router, Routes, useLocation, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import { BillGenerator } from "./pages/BillGenerator";
import { BillViewer } from "./pages/BillViewer";
import { Dashboard } from "./pages/Dashboard";
import Home from "./pages/Home";
import { InvoiceGenerator } from "./pages/InvoiceGenerator";
import { Login } from "./pages/Login";
import { AuthProvider, useAuth } from "./contexts/AuthContext";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
	const { user, loading } = useAuth();
	if (loading) return <div>Loading...</div>;
	if (!user) return <Navigate to="/login" replace />;
	return <>{children}</>;
};

function AppLayout() {
	const location = useLocation();
	const isTool =
		location.pathname.startsWith("/bill") ||
		location.pathname.startsWith("/invoice") ||
		location.pathname.startsWith("/dashboard") ||
		location.pathname === "/login";

	return (
		<div className="min-h-screen bg-ink text-paper font-sans">
			{!isTool && <Navbar />}
			<main>
				<Routes>
					<Route path="/" element={<Home />} />
					<Route path="/login" element={<Login />} />
					<Route path="/invoice" element={<ProtectedRoute><InvoiceGenerator /></ProtectedRoute>} />
					<Route path="/invoice/:id" element={<ProtectedRoute><InvoiceGenerator /></ProtectedRoute>} />
					<Route path="/bill" element={<ProtectedRoute><BillGenerator /></ProtectedRoute>} />
					<Route path="/bill/:id" element={<ProtectedRoute><BillViewer /></ProtectedRoute>} />
					<Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
				</Routes>
			</main>
		</div>
	);
}

function App() {
	return (
		<AuthProvider>
			<MotionConfig reducedMotion="user">
				<Router>
					<AppLayout />
				</Router>
			</MotionConfig>
		</AuthProvider>
	);
}

export default App;
