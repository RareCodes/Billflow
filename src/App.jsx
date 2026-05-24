import { Routes, Route, Navigate } from 'react-router-dom'
import Auth from './pages/Auth'
import Dashboard from './pages/Dashboard'
import Invoices from './pages/Invoices'
import InvoiceNew from './pages/InvoiceNew'
import InvoiceDetail from './pages/InvoiceDetail'
import Receipts from './pages/Receipts'
import Clients from './pages/Clients'
import Settings from './pages/Settings'
import ReceiptDetail from './pages/ReceiptDetail'
import Landing from './pages/Landing'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
<Route path="/auth" element={<Auth />} />
<Route path="/dashboard" element={<Dashboard />} />
<Route path="/invoices" element={<Invoices />} />
<Route path="/invoices/new" element={<InvoiceNew />} />
<Route path="/invoices/:id" element={<InvoiceDetail />} />
<Route path="/receipts" element={<Receipts />} />
<Route path="/receipts/:id" element={<ReceiptDetail />} />
<Route path="/clients" element={<Clients />} />
<Route path="/settings" element={<Settings />} />
<Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App