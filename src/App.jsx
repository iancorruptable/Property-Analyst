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
import Appreciation from './pages/Appreciation';
import TaxTracker from './pages/TaxTracker';
import Compliance from './pages/Compliance';
import TenantLifecycle from './pages/TenantLifecycle';
import Maintenance from './pages/Maintenance';
import Insurance from './pages/Insurance';
import PMOversight from './pages/PMOversight';
import PCSReadiness from './pages/PCSReadiness';
import DecisionEngine from './pages/DecisionEngine';
import DocumentsVault from './pages/DocumentsVault';

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
            <Route path="appreciation" element={<Appreciation />} />
            <Route path="tax" element={<TaxTracker />} />
            <Route path="compliance" element={<Compliance />} />
            <Route path="tenant" element={<TenantLifecycle />} />
            <Route path="maintenance" element={<Maintenance />} />
            <Route path="insurance" element={<Insurance />} />
            <Route path="pm-oversight" element={<PMOversight />} />
            <Route path="pcs" element={<PCSReadiness />} />
            <Route path="decisions" element={<DecisionEngine />} />
            <Route path="documents" element={<DocumentsVault />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </PropertyProvider>
  );
}
