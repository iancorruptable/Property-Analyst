import { useProperty } from '../store/PropertyContext';
import Card from '../components/Card';
import StatusBadge from '../components/StatusBadge';
import { formatCurrency, formatPercent, parseCurrency, calcEquity, calcLTV, calcMonthlyPI } from '../utils/calculations';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

export default function Mortgage() {
  const { state } = useProperty();
  const m = state.mortgage;
  const balance = parseCurrency(m.currentBalance);
  const origAmount = parseCurrency(m.originalLoanAmount);
  const rate = parseFloat(m.interestRate) || 0;
  const term = parseInt(m.loanTerm) || 30;
  const purchasePrice = parseCurrency(state.property.purchasePrice);
  const latestValue = state.valueEstimates?.length > 0
    ? parseCurrency(state.valueEstimates[state.valueEstimates.length - 1].value)
    : purchasePrice;

  const equity = latestValue && balance ? calcEquity(latestValue, balance) : 0;
  const ltv = latestValue && balance ? calcLTV(balance, latestValue) : 0;
  const calcPI = origAmount && rate ? calcMonthlyPI(origAmount, rate, term) : 0;
  const principalPaid = origAmount - balance;

  const ltvStatus = ltv === 0 ? 'gray' : ltv < 80 ? 'green' : ltv < 90 ? 'yellow' : 'red';

  const pieData = latestValue && balance ? [
    { name: 'Equity', value: Math.max(0, equity), color: '#22c55e' },
    { name: 'Loan Balance', value: balance, color: '#3b82f6' },
  ] : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Mortgage & Equity Tracker</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Module 4 — Loan balance, equity position, amortization</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Loan Balance', value: balance ? formatCurrency(balance) : '—' },
          { label: 'Interest Rate', value: rate ? formatPercent(rate) : '—' },
          { label: 'Estimated Equity', value: equity ? formatCurrency(equity) : '—' },
          { label: 'LTV Ratio', value: ltv ? formatPercent(ltv) : '—', status: ltvStatus },
        ].map(item => (
          <div key={item.label} className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-4">
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{item.label}</p>
            <p className="text-xl font-bold text-slate-900 dark:text-slate-100 mt-1">{item.value}</p>
            {item.status && <StatusBadge status={item.status}>{item.status === 'green' ? 'Strong' : item.status === 'yellow' ? 'Moderate' : 'Low'}</StatusBadge>}
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Equity Visualization */}
        <Card title="Equity Position">
          {pieData.length > 0 ? (
            <div className="flex items-center gap-6">
              <ResponsiveContainer width={160} height={160}>
                <PieChart>
                  <Pie data={pieData} dataKey="value" innerRadius={40} outerRadius={70} paddingAngle={2}>
                    {pieData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={v => formatCurrency(v)} contentStyle={{ backgroundColor: 'var(--color-slate-800, #1e293b)', border: '1px solid var(--color-slate-600, #475569)', borderRadius: '8px', color: '#e2e8f0' }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-3">
                {pieData.map(item => (
                  <div key={item.name} className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-sm text-slate-600 dark:text-slate-400">{item.name}: <span className="font-semibold text-slate-900 dark:text-slate-100">{formatCurrency(item.value)}</span></span>
                  </div>
                ))}
                <div className="text-xs text-slate-400 dark:text-slate-500">Based on {latestValue === purchasePrice ? 'purchase price' : 'latest estimate'}</div>
              </div>
            </div>
          ) : (
            <p className="text-sm text-slate-400 dark:text-slate-500 text-center py-8">Enter property value and loan balance to see equity breakdown.</p>
          )}
        </Card>

        {/* Loan Details */}
        <Card title="Loan Details">
          <div className="space-y-2">
            {[
              ['Loan Type', `${m.loanType} ${m.rateType}`],
              ['Original Amount', origAmount ? formatCurrency(origAmount) : '—'],
              ['Current Balance', balance ? formatCurrency(balance) : '—'],
              ['Interest Rate', rate ? `${rate}% ${m.rateType}` : '—'],
              ['Term', `${term} years`],
              ['Monthly P&I (actual)', m.monthlyPI ? formatCurrency(m.monthlyPI) : '—'],
              ['Monthly P&I (calculated)', calcPI ? formatCurrency(calcPI) : '—'],
              ['Monthly Escrow', m.monthlyEscrow ? formatCurrency(m.monthlyEscrow) : '—'],
              ['Total Monthly', m.totalMonthlyPayment ? formatCurrency(m.totalMonthlyPayment) : '—'],
              ['Servicer', m.servicer || '—'],
              ['Principal Paid to Date', principalPaid > 0 ? formatCurrency(principalPaid) : '—'],
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between py-1 border-b border-slate-50 dark:border-slate-700/50 text-sm">
                <span className="text-slate-600 dark:text-slate-400">{label}</span>
                <span className="font-medium text-slate-900 dark:text-slate-100">{value}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Escrow Breakdown */}
        <Card title="Escrow Breakdown (Monthly)">
          <div className="space-y-2">
            {[
              ['Property Taxes', parseCurrency(state.taxesInsurance.annualPropertyTax) / 12],
              ['Homeowners Insurance', parseCurrency(state.taxesInsurance.insurancePremium) / 12],
              ['Flood Insurance', parseCurrency(state.taxesInsurance.floodPremium) / 12],
              ['HOA', parseCurrency(state.property.hoaDues)],
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between py-1 border-b border-slate-50 dark:border-slate-700/50 text-sm">
                <span className="text-slate-600 dark:text-slate-400">{label}</span>
                <span className="font-medium text-slate-900 dark:text-slate-100">{value > 0 ? formatCurrency(value) : '—'}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* LTV Health */}
        <Card title="LTV Health Guide">
          <div className="space-y-2">
            {[
              { range: '< 80%', status: 'green', label: 'Strong equity position', current: ltv > 0 && ltv < 80 },
              { range: '80–90%', status: 'yellow', label: 'Moderate equity', current: ltv >= 80 && ltv < 90 },
              { range: '> 90%', status: 'red', label: 'Low equity — limited options', current: ltv >= 90 },
            ].map(item => (
              <div key={item.range} className={`flex items-center justify-between py-2 px-3 rounded-lg text-sm ${item.current ? 'bg-slate-100 dark:bg-slate-700 font-semibold' : ''}`}>
                <div className="flex items-center gap-2">
                  <StatusBadge status={item.status}>{item.range}</StatusBadge>
                  <span className="text-slate-700 dark:text-slate-300">{item.label}</span>
                </div>
                {item.current && <span className="text-xs text-blue-600 dark:text-blue-400 font-bold">← Current</span>}
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
