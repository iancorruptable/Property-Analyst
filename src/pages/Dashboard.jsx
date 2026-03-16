import { useProperty } from '../store/PropertyContext';
import Card from '../components/Card';
import StatusBadge, { StatusDot } from '../components/StatusBadge';
import { Link } from 'react-router-dom';
import {
  formatCurrency, formatPercent, parseCurrency,
  calcEquity, calcLTV, calcCashFlow, calcBreakEvenRent,
  getCompleteness
} from '../utils/calculations';
import {
  AlertTriangle, ArrowRight, TrendingUp, Home, DollarSign,
  Shield, ClipboardCheck, Bell
} from 'lucide-react';

export default function Dashboard() {
  const { state } = useProperty();
  const completeness = getCompleteness(state);

  const purchasePrice = parseCurrency(state.property.purchasePrice);
  const currentBalance = parseCurrency(state.mortgage.currentBalance);
  const estimatedValue = purchasePrice || 0; // Use purchase price as baseline if no other value
  const latestValue = state.valueEstimates?.length > 0
    ? parseCurrency(state.valueEstimates[state.valueEstimates.length - 1].value)
    : estimatedValue;

  const equity = latestValue ? calcEquity(latestValue, currentBalance) : 0;
  const ltv = latestValue ? calcLTV(currentBalance, latestValue) : 0;
  const cashFlow = calcCashFlow(state);
  const breakEven = calcBreakEvenRent(state);

  const hasFinancials = completeness.filled >= 4;

  // Generate alerts
  const alerts = [];
  if (completeness.percent < 100) {
    alerts.push({ severity: 'red', message: `Data intake ${completeness.percent}% complete — ${completeness.total - completeness.filled} critical fields missing`, link: '/intake' });
  }
  if (!state.taxesInsurance.floodZoneDesignation) {
    alerts.push({ severity: 'red', message: 'Flood zone not verified — Navarre has significant coastal exposure', link: '/insurance' });
  }
  if (!state.vaBenefit.hasCOE || state.vaBenefit.hasCOE === 'no') {
    alerts.push({ severity: 'red', message: 'VA Certificate of Eligibility not obtained — cannot estimate buying power', link: '/va-tracker' });
  }
  if (!state.property.hoaRentalRestrictions) {
    alerts.push({ severity: 'yellow', message: 'HOA rental restrictions unverified', link: '/property' });
  }
  if (!state.taxesInsurance.homesteadExemption) {
    alerts.push({ severity: 'yellow', message: 'Homestead exemption status unknown — tax impact unclear', link: '/tax' });
  }
  if (!state.propertyManager.companyName) {
    alerts.push({ severity: 'yellow', message: 'No property manager selected', link: '/pm-oversight' });
  }
  if (hasFinancials && cashFlow.cashFlow < 0) {
    alerts.push({ severity: 'yellow', message: `Estimated negative cash flow: ${formatCurrency(cashFlow.cashFlow)}/mo`, link: '/cashflow' });
  }

  const propertyStatusLabels = {
    'owner-occupied': 'Owner Occupied',
    'preparing-for-rent': 'Preparing for Rent',
    'listed': 'Listed for Rent',
    'tenant-occupied': 'Tenant Occupied',
    'vacant': 'Vacant',
    'under-repair': 'Under Repair',
    'for-sale': 'For Sale',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Executive Dashboard</h1>
          <p className="text-sm text-slate-500">9577 Naples Lane, Navarre, FL 32566</p>
        </div>
        <div className="flex items-center gap-3">
          <StatusBadge status={completeness.percent === 100 ? 'green' : completeness.percent > 50 ? 'yellow' : 'red'}>
            Data: {completeness.percent}%
          </StatusBadge>
          <span className="text-xs text-slate-400">
            Updated: {new Date(state.lastUpdated).toLocaleDateString()}
          </span>
        </div>
      </div>

      {/* Data Intake Banner */}
      {completeness.percent < 100 && (
        <Link to="/intake" className="block">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-4 text-white flex items-center justify-between hover:from-blue-700 hover:to-blue-800 transition-colors">
            <div className="flex items-center gap-3">
              <ClipboardCheck size={24} />
              <div>
                <p className="font-semibold">Complete Your Property Data</p>
                <p className="text-sm text-blue-100">{completeness.filled}/{completeness.total} critical fields filled — complete intake to unlock all analysis</p>
              </div>
            </div>
            <ArrowRight size={20} />
          </div>
        </Link>
      )}

      {/* Critical Alerts */}
      {alerts.length > 0 && (
        <Card title="Critical Alerts" status={alerts.some(a => a.severity === 'red') ? 'red' : 'yellow'}>
          <div className="space-y-2">
            {alerts.map((alert, i) => (
              <Link key={i} to={alert.link} className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 transition-colors">
                <StatusDot status={alert.severity} />
                <span className="text-sm text-slate-700 flex-1">{alert.message}</span>
                <ArrowRight size={14} className="text-slate-400" />
              </Link>
            ))}
          </div>
        </Card>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Home size={16} className="text-slate-400" />
            <span className="text-xs font-medium text-slate-500">Property Status</span>
          </div>
          <p className="text-lg font-bold text-slate-900">
            {propertyStatusLabels[state.property.status] || 'Not Set'}
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp size={16} className="text-slate-400" />
            <span className="text-xs font-medium text-slate-500">Estimated Value</span>
          </div>
          <p className="text-lg font-bold text-slate-900">
            {latestValue ? formatCurrency(latestValue) : '—'}
          </p>
          {purchasePrice > 0 && latestValue > 0 && latestValue !== purchasePrice && (
            <p className={`text-xs ${latestValue > purchasePrice ? 'text-green-600' : 'text-red-600'}`}>
              {latestValue > purchasePrice ? '+' : ''}{formatCurrency(latestValue - purchasePrice)} from purchase
            </p>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign size={16} className="text-slate-400" />
            <span className="text-xs font-medium text-slate-500">Estimated Equity</span>
          </div>
          <p className="text-lg font-bold text-slate-900">
            {equity ? formatCurrency(equity) : '—'}
          </p>
          {ltv > 0 && (
            <p className="text-xs text-slate-500">LTV: {formatPercent(ltv)}</p>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign size={16} className={cashFlow.cashFlow >= 0 ? 'text-green-500' : 'text-red-500'} />
            <span className="text-xs font-medium text-slate-500">Est. Cash Flow</span>
          </div>
          <p className={`text-lg font-bold ${hasFinancials ? (cashFlow.cashFlow >= 0 ? 'text-green-700' : 'text-red-700') : 'text-slate-900'}`}>
            {hasFinancials ? formatCurrency(cashFlow.cashFlow) : '—'}
          </p>
          {hasFinancials && (
            <p className="text-xs text-slate-500">per month</p>
          )}
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Monthly Payment Breakdown */}
        <Card title="Monthly Payment Breakdown">
          <div className="space-y-2">
            {[
              { label: 'Principal & Interest', value: state.mortgage.monthlyPI },
              { label: 'Property Taxes', value: parseCurrency(state.taxesInsurance.annualPropertyTax) / 12 || '' },
              { label: 'Insurance', value: parseCurrency(state.taxesInsurance.insurancePremium) / 12 || '' },
              { label: 'Flood Insurance', value: parseCurrency(state.taxesInsurance.floodPremium) / 12 || '' },
              { label: 'HOA Dues', value: state.property.hoaDues },
            ].map(item => (
              <div key={item.label} className="flex justify-between items-center py-1 border-b border-slate-50">
                <span className="text-sm text-slate-600">{item.label}</span>
                <span className="text-sm font-medium text-slate-900">
                  {item.value ? formatCurrency(item.value) : <span className="text-slate-400">—</span>}
                </span>
              </div>
            ))}
            <div className="flex justify-between items-center py-1 pt-2 border-t border-slate-200">
              <span className="text-sm font-semibold text-slate-800">Total Monthly</span>
              <span className="text-sm font-bold text-slate-900">
                {state.mortgage.totalMonthlyPayment ? formatCurrency(state.mortgage.totalMonthlyPayment) : '—'}
              </span>
            </div>
          </div>
        </Card>

        {/* Rental Snapshot */}
        <Card title="Rental Snapshot">
          <div className="space-y-2">
            {[
              { label: 'Target Monthly Rent', value: state.rental.targetRent, status: state.rental.targetRent ? 'green' : 'red' },
              { label: 'Break-Even Rent', value: hasFinancials ? breakEven : '', note: 'Min rent to cover all costs' },
              { label: 'Est. Monthly Cash Flow', value: hasFinancials ? cashFlow.cashFlow : '' },
              { label: 'Est. Monthly NOI', value: hasFinancials ? cashFlow.noi : '' },
              { label: 'Vacancy Assumption', value: state.rental.vacancyRatePercent ? `${state.rental.vacancyRatePercent}%` : '8%' },
              { label: 'Management Fee', value: state.rental.managementFeePercent ? `${state.rental.managementFeePercent}%` : '10%' },
            ].map(item => (
              <div key={item.label} className="flex justify-between items-center py-1 border-b border-slate-50">
                <div>
                  <span className="text-sm text-slate-600">{item.label}</span>
                  {item.note && <p className="text-xs text-slate-400">{item.note}</p>}
                </div>
                <span className="text-sm font-medium text-slate-900">
                  {item.value ? (typeof item.value === 'string' && item.value.includes('%') ? item.value : formatCurrency(item.value)) : <span className="text-slate-400">—</span>}
                </span>
              </div>
            ))}
          </div>
        </Card>

        {/* Key Dates */}
        <Card title="Key Dates & Deadlines">
          <div className="space-y-2">
            {[
              { label: 'Insurance Renewal', value: state.taxesInsurance.insuranceRenewalDate || 'Unknown', severity: state.taxesInsurance.insuranceRenewalDate ? 'green' : 'yellow' },
              { label: 'Property Tax Due (FL)', value: 'Nov 2026 (4% discount)', severity: 'yellow' },
              { label: 'Homestead Filing Window', value: 'Jan 1 – Mar 1 annually', severity: 'yellow' },
              { label: 'Hurricane Season', value: 'Jun 1 – Nov 30', severity: 'yellow' },
              { label: 'Lease Expiration', value: state.tenant.leaseEnd || 'N/A', severity: 'gray' },
              { label: 'PCS Date', value: state.operations.expectedPCSDate || 'Unknown', severity: state.operations.expectedPCSDate ? 'yellow' : 'gray' },
            ].map(item => (
              <div key={item.label} className="flex items-center gap-3 py-1 border-b border-slate-50">
                <StatusDot status={item.severity} />
                <span className="text-sm text-slate-600 flex-1">{item.label}</span>
                <span className="text-sm text-slate-800">{item.value}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* VA Entitlement Quick View */}
        <Card title="VA Entitlement Status">
          {state.vaBenefit.hasCOE === 'yes' ? (
            <div className="space-y-2">
              <div className="flex justify-between py-1">
                <span className="text-sm text-slate-600">COE Available</span>
                <StatusBadge status="green">Yes</StatusBadge>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-sm text-slate-600">Entitlement Charged</span>
                <span className="text-sm font-medium">
                  {state.vaBenefit.entitlementCharged ? formatCurrency(state.vaBenefit.entitlementCharged) : '—'}
                </span>
              </div>
            </div>
          ) : (
            <div className="text-center py-4">
              <Shield size={32} className="mx-auto text-slate-300 mb-2" />
              <p className="text-sm text-slate-500">COE not yet obtained</p>
              <Link to="/va-tracker" className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                Set up VA Tracker →
              </Link>
            </div>
          )}
        </Card>
      </div>

      {/* Top 5 Actions */}
      <Card title="Recommended Actions" status="yellow">
        <div className="space-y-3">
          {[
            { priority: 1, action: 'Complete the data intake form', link: '/intake', done: completeness.percent === 100 },
            { priority: 2, action: 'Obtain VA Certificate of Eligibility', link: '/va-tracker', done: state.vaBenefit.hasCOE === 'yes' },
            { priority: 3, action: 'Verify flood zone and insurance coverage', link: '/insurance', done: !!state.taxesInsurance.floodZoneDesignation },
            { priority: 4, action: 'Check HOA rental restrictions', link: '/property', done: !!state.property.hoaRentalRestrictions },
            { priority: 5, action: 'Get landlord insurance quote', link: '/insurance', done: false },
          ].map(item => (
            <Link key={item.priority} to={item.link} className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 transition-colors">
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${item.done ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                {item.done ? '✓' : item.priority}
              </span>
              <span className={`text-sm flex-1 ${item.done ? 'text-slate-400 line-through' : 'text-slate-700'}`}>
                {item.action}
              </span>
              <ArrowRight size={14} className="text-slate-400" />
            </Link>
          ))}
        </div>
      </Card>
    </div>
  );
}
