import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import { InvoiceGenerator } from './pages/InvoiceGenerator';
import { BillGenerator } from './pages/BillGenerator';
import { BillViewer } from './pages/BillViewer';
import { BillDashboard } from './pages/BillDashboard';

function AppLayout() {
  const location = useLocation();
  const isTool = location.pathname.startsWith('/bill') || location.pathname.startsWith('/invoice');

  return (
    <div className="min-h-screen bg-ink text-paper font-sans">
      {!isTool && <Navbar />}
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/invoice" element={<InvoiceGenerator />} />
          <Route path="/bill" element={<BillGenerator />} />
          <Route path="/bill/:id" element={<BillViewer />} />
          <Route path="/bill-dashboard" element={<BillDashboard />} />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppLayout />
    </Router>
  );
}

export default App;
