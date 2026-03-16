import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { PropertyProvider } from './store/PropertyContext';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import IntakeForm from './pages/IntakeForm';
import CashFlow from './pages/CashFlow';
import VATracker from './pages/VATracker';
import PropertyProfile from './pages/PropertyProfile';
import Mortgage from './pages/Mortgage';
import RentReadiness from './pages/RentReadiness';
import Alerts from './pages/Alerts';
import Placeholder from './pages/Placeholder';

export default function App() {
  return (
    <PropertyProvider>
      <BrowserRouter basename="/Property-Analyst">
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="intake" element={<IntakeForm />} />
            <Route path="cashflow" element={<CashFlow />} />
            <Route path="va-tracker" element={<VATracker />} />
            <Route path="property" element={<PropertyProfile />} />
            <Route path="mortgage" element={<Mortgage />} />
            <Route path="rent-readiness" element={<RentReadiness />} />
            <Route path="alerts" element={<Alerts />} />
            <Route path="appreciation" element={<Placeholder path="/appreciation" />} />
            <Route path="tax" element={<Placeholder path="/tax" />} />
            <Route path="compliance" element={<Placeholder path="/compliance" />} />
            <Route path="tenant" element={<Placeholder path="/tenant" />} />
            <Route path="maintenance" element={<Placeholder path="/maintenance" />} />
            <Route path="insurance" element={<Placeholder path="/insurance" />} />
            <Route path="pm-oversight" element={<Placeholder path="/pm-oversight" />} />
            <Route path="pcs" element={<Placeholder path="/pcs" />} />
            <Route path="decisions" element={<Placeholder path="/decisions" />} />
            <Route path="documents" element={<Placeholder path="/documents" />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </PropertyProvider>
  );
}
