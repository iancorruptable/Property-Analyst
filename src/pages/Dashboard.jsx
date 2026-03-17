import { useProperty } from '../store/PropertyContext';
import Card from '../components/Card';
import StatusBadge, { StatusDot } from '../components/StatusBadge';
import { formatCurrency, formatPercent, calcEquity, calcLTV, calcCashFlow, calcBreakEvenRent, getCompleteness, parseCurrency } from '../utils/calculations';
import { Link } from 'react-router-dom';
import { AlertTriangle, ArrowRight, CheckCircle, TrendingUp, TrendingDown } from 'lucide-react';

function MetricCard({ label, value, sublabel, status }) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
      <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{label}</p>
      <p className={`text-2xl font-bold mt-1 ${status === 'red' ? 'text-red-600 dark:text-red-400' : status === 'green' ? 'text-green-600 dark:text-green-400' : 'text-slate-900 dark:text-slate-100'}`}>
        {value}
      </p>
      {sublabel && <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{sublabel}</p>}
    </div>
  );
}

export default function Dashboard() {
  const { state } = useProperty();
  const completeness = getCompleteness(state);
  const hasData = completeness.filled > 0;

  const purchasePrice = parseCurrency(state.property?.purchasePrice);
  const balance = parseCurrency(state.mortgage?.currentBalance);
  const estimates = state.valueEstimates || [];
  const sortedEstimates = [...estimates].sort((a, b) => new Date(a.date) - new Date(b.date));
  const latestValue = sortedEstimates.length > 0 ? parseCurrency(sortedEstimates[sortedEstimates.length - 1].value) : purchasePrice;
  const equity = calcEquity(latestValue || 0, balance || 0);
  const ltv = calcLTV(balance, latestValue);
  const cashFlow = hasData ? calcCashFlow(state) : null;
  const breakEven = hasData ? calcBreakEvenRent(state) : 0;

  const statusLabels = {
    'owner-occupied': 'Owner Occupied',
    'preparing-for-rent': 'Preparing for Rent',
    'listed': 'Listed for Rent',
    'tenant-occupied': 'Tenant Occupied',
    'vacant': 'Vacant',
    'under-repair': 'Under Repair',
    'for-sale': 'For Sale',
  };

  const alerts = [];

  if (completeness.percent < 100) {
    alerts.push({ severity: 'red', text: `Data intake ${completeness.percent}% complete — financial analysis is limited`, link: '/intake' });
  }
  if (!state.taxesInsurance?.hasFloodInsurance) {
    alerts.push({ severity: 'yellow', text: 'Flood insurance status unverified — Navarre has coastal flood exposure', link: '/insurance' });
  }
  if (!state.vaBenefit?.hasCOE || state.vaBenefit.hasCOE === 'no') {
    alerts.push({ severity: 'red', text: 'VA COE not obtained — cannot estimate future buying power', link: '/va-tracker' });
  }
  if (!state.property?.hoaRentalRestrictions) {
    alerts.push({ severity: 'yellow', text: 'HOA rental restrictions not verified', link: '/compliance' });
  }
  if (!state.propertyManager?.companyName) {
    alerts.push({ severity: 'yellow', text: 'No property manager selected', link: '/pm-oversight' });
  }
  if (cashFlow && cashFlow.cashFlow < 0 && hasData) {
    alerts.push({ severity: 'red', text: `Projected negative cash flow: ${formatCurrency(cashFlow.cashFlow)}/mo`, link: '/cashflow' });
  }
  if (!state.taxesInsurance?.insuranceCarrier) {
    alerts.push({ severity: 'yellow', text: 'Insurance policy details not entered — conversion to landlord policy needed before renting', link: '/insurance' });
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Executive Dashboard</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">9577 Naples Lane, Navarre, FL 32566</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-slate-400 dark:text-slate-500">Last Updated</p>
          <p className="text-sm text-slate-600 dark:text-slate-400">{new Date(state.lastUpdated).toLocaleDateString()}</p>
        </div>
      </div>

      {/* Data Completeness Bar */}
      {completeness.percent < 100 && (
        <Link to="/intake" className="block">
          <div className="bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-700 rounded-xl p-4 flex items-center gap-4 hover:bg-amber-100 dark:hover:bg-amber-900/50 transition-colors">
            <AlertTriangle className="text-amber-600 dark:text-amber-400 flex-shrink-0" size={24} />
            <div className="flex-1">
              <p className="text-sm font-semibold text-amber-900 dark:text-amber-200">Data Intake Required</p>
              <p className="text-xs text-amber-700 dark:text-amber-400 mt-0.5">{completeness.filled} of {completeness.total} critical fields completed</p>
              <div className="w-full bg-amber-200 dark:bg-amber-800 rounded-full h-2 mt-2">
                <div className="bg-amber-600 h-2 rounded-full transition-all" style={{ width: `${completeness.percent}%` }} />
              </div>
            </div>
            <ArrowRight className="text-amber-600 dark:text-amber-400" size={20} />
          </div>
        </Link>
      )}

      {/* Equity Banner */}
      {hasData && balance > 0 && (
        <div className={`rounded-xl border-2 p-5 flex items-center justify-between ${equity >= 0 ? 'border-green-500 bg-green-50 dark:bg-green-900/20' : 'border-red-500 bg-red-50 dark:bg-red-900/20'}`}>
          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Total Equity</p>
            <p className={`text-3xl font-bold ${equity >= 0 ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'}`}>
              {formatCurrency(equity)}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {formatCurrency(latestValue)} value − {formatCurrency(balance)} owed • LTV: {formatPercent(ltv)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-400 dark:text-slate-500">
              {sortedEstimates.length > 0 ? 'Based on latest estimate' : 'Based on purchase price'}
            </p>
          </div>
        </div>
      )}

      {/* Property Status */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
        <MetricCard
          label="Property Status"
          value={statusLabels[state.property?.status] || 'Not Set'}
          status={state.property?.status ? 'green' : 'red'}
        />
        <MetricCard
          label="Est. Value"
          value={latestValue ? formatCurrency(latestValue) : '—'}
          sublabel={sortedEstimates.length > 0 ? 'Latest estimate' : (hasData ? 'Purchase price' : 'Missing')}
          status={latestValue ? 'green' : 'red'}
        />
        <MetricCard
          label="Loan Balance"
          value={balance ? formatCurrency(balance) : '—'}
          sublabel={state.mortgage?.interestRate ? `${state.mortgage.interestRate}% rate` : ''}
          status={balance ? 'green' : 'red'}
        />
        <MetricCard
          label="Estimated Equity"
          value={hasData && balance ? formatCurrency(equity) : '—'}
          sublabel={hasData && balance ? `LTV: ${formatPercent(ltv)}` : ''}
          status={equity > 0 ? 'green' : equity < 0 ? 'red' : 'gray'}
        />
      </div>

      {/* Financial Snapshot */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
        <MetricCard
          label="Monthly Payment"
          value={state.mortgage?.totalMonthlyPayment ? formatCurrency(state.mortgage.totalMonthlyPayment) : '—'}
          sublabel="P&I + Escrow"
        />
        <MetricCard
          label="Est. Market Rent"
          value={state.rental?.targetRent ? formatCurrency(state.rental.targetRent) : '—'}
          sublabel={hasData ? `Break-even: ${formatCurrency(breakEven)}` : 'Missing'}
        />
        <MetricCard
          label="Est. Cash Flow"
          value={cashFlow && hasData ? formatCurrency(cashFlow.cashFlow) : '—'}
          sublabel="After all expenses + debt"
          status={cashFlow && cashFlow.cashFlow >= 0 ? 'green' : cashFlow && cashFlow.cashFlow < 0 ? 'red' : undefined}
        />
        <MetricCard
          label="VA Entitlement"
          value={state.vaBenefit?.hasCOE === 'yes' ? 'On File' : 'Needed'}
          sublabel="COE Status"
          status={state.vaBenefit?.hasCOE === 'yes' ? 'green' : 'red'}
        />
      </div>

      {/* Alerts Panel */}
      <Card title="Active Alerts" status={alerts.some(a => a.severity === 'red') ? 'red' : 'yellow'}>
        {alerts.length === 0 ? (
          <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
            <CheckCircle size={18} />
            <span className="text-sm">All systems green</span>
          </div>
        ) : (
          <div className="space-y-2">
            {alerts.map((alert, i) => (
              <Link key={i} to={alert.link} className="flex items-center gap-3 p-2 min-h-[44px] rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                <StatusDot status={alert.severity} />
                <span className="text-sm text-slate-700 dark:text-slate-300 flex-1">{alert.text}</span>
                <ArrowRight size={16} className="text-slate-400 dark:text-slate-500" />
              </Link>
            ))}
          </div>
        )}
      </Card>

      {/* Monthly Payment Breakdown */}
      {hasData && (
        <Card title="Monthly Cost Breakdown (as Rental)">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Row label="Mortgage P&I" value={formatCurrency(cashFlow?.debtService)} />
              <Row label="Property Taxes" value={formatCurrency(cashFlow?.taxes)} />
              <Row label="Insurance" value={formatCurrency(cashFlow?.insurance)} />
              <Row label="Flood Insurance" value={formatCurrency(cashFlow?.flood)} />
              <Row label="HOA" value={formatCurrency(cashFlow?.hoa)} />
              <Row label="Property Mgmt" value={formatCurrency(cashFlow?.mgmtFee)} sub={`${state.rental?.managementFeePercent}%`} />
              <div className="border-t border-dashed border-slate-200 dark:border-slate-700 pt-2 mt-2">
                <p className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold uppercase tracking-wide mb-1">Budget Reserves (not actual monthly bills)</p>
                <Row label="Maintenance Reserve" value={formatCurrency(cashFlow?.maintenance)} sub={`${state.rental?.maintenanceReservePercent}% · ${formatCurrency((cashFlow?.maintenance || 0) * 12)}/yr`} />
                <Row label="CapEx Reserve" value={formatCurrency(cashFlow?.capex)} sub={`${state.rental?.capexReservePercent}% · ${formatCurrency((cashFlow?.capex || 0) * 12)}/yr`} />
              </div>
              <div className="border-t border-slate-200 dark:border-slate-700 pt-2 mt-2">
                <Row label="Total Monthly Cost" value={formatCurrency((cashFlow?.totalOpEx || 0) + (cashFlow?.debtService || 0))} bold />
              </div>
            </div>
            <div className="space-y-2">
              <Row label="Gross Rent" value={formatCurrency(cashFlow?.grossRent)} />
              <Row label="Vacancy Allowance" value={`(${formatCurrency(cashFlow?.vacancyLoss)})`} sub={`${state.rental?.vacancyRatePercent}% · budget estimate`} />
              <Row label="Effective Gross Income" value={formatCurrency(cashFlow?.effectiveGross)} />
              <Row label="Total Operating Expenses" value={`(${formatCurrency(cashFlow?.totalOpEx)})`} />
              <Row label="Net Operating Income" value={formatCurrency(cashFlow?.noi)} />
              <Row label="Debt Service" value={`(${formatCurrency(cashFlow?.debtService)})`} />
              <div className="border-t border-slate-200 dark:border-slate-700 pt-2 mt-2">
                <Row
                  label="Net Cash Flow"
                  value={formatCurrency(cashFlow?.cashFlow)}
                  bold
                  color={cashFlow?.cashFlow >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}
                />
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Top 5 Actions */}
      <Card title="Top Actions Needed">
        <div className="space-y-3">
          {completeness.percent < 100 && (
            <ActionItem num={1} text="Complete the data intake form" link="/intake" severity="red" />
          )}
          {state.vaBenefit?.hasCOE !== 'yes' && (
            <ActionItem num={completeness.percent < 100 ? 2 : 1} text="Obtain VA Certificate of Eligibility (COE)" link="/va-tracker" severity="red" />
          )}
          {!state.taxesInsurance?.hasFloodInsurance && (
            <ActionItem num={3} text="Verify flood zone and insurance coverage" link="/insurance" severity="yellow" />
          )}
          {!state.property?.hoaRentalRestrictions && (
            <ActionItem num={4} text="Check HOA rental restrictions (request CC&Rs)" link="/compliance" severity="yellow" />
          )}
          {!state.propertyManager?.companyName && (
            <ActionItem num={5} text="Research and interview property managers" link="/pm-oversight" severity="yellow" />
          )}
        </div>
      </Card>
    </div>
  );
}

function Row({ label, value, sub, bold, color }) {
  return (
    <div className="flex items-center justify-between">
      <span className={`text-sm ${bold ? 'font-semibold text-slate-900 dark:text-slate-100' : 'text-slate-600 dark:text-slate-400'}`}>{label}</span>
      <div className="text-right">
        <span className={`text-sm ${bold ? 'font-semibold' : 'font-medium'} ${color || 'text-slate-900 dark:text-slate-100'}`}>{value}</span>
        {sub && <span className="text-xs text-slate-400 dark:text-slate-500 ml-1">({sub})</span>}
      </div>
    </div>
  );
}

function ActionItem({ num, text, link, severity }) {
  return (
    <Link to={link} className="flex items-center gap-3 p-3 min-h-[44px] rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0 ${severity === 'red' ? 'bg-red-500' : 'bg-yellow-500'}`}>
        {num}
      </div>
      <span className="text-sm text-slate-700 dark:text-slate-300 flex-1">{text}</span>
      <ArrowRight size={16} className="text-slate-400 dark:text-slate-500" />
    </Link>
  );
}
