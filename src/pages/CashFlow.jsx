import { useProperty } from '../store/PropertyContext';
import Card from '../components/Card';
import { formatCurrency, parseCurrency, calcCashFlow, calcBreakEvenRent } from '../utils/calculations';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export default function CashFlow() {
  const { state } = useProperty();
  const cf = calcCashFlow(state);
  const breakEven = calcBreakEvenRent(state);
  const rent = parseCurrency(state.rental?.targetRent);

  const hasData = rent > 0 && parseCurrency(state.mortgage?.monthlyPI) > 0;

  // Vacancy stress test
  const stressTest = [1, 2, 3].map(months => {
    const lostRent = rent * months;
    const turnoverCost = 1500;
    const totalImpact = lostRent + turnoverCost;
    return { months, lostRent, turnoverCost, totalImpact };
  });

  // Rent sensitivity
  const sensitivities = [-200, -100, 0, 100, 200].map(delta => {
    const testRent = rent + delta;
    const vacLoss = testRent * (parseFloat(state.rental?.vacancyRatePercent || 8) / 100);
    const effGross = testRent - vacLoss;
    const mgmt = effGross * (parseFloat(state.rental?.managementFeePercent || 10) / 100);
    const maint = testRent * (parseFloat(state.rental?.maintenanceReservePercent || 8) / 100);
    const capex = testRent * (parseFloat(state.rental?.capexReservePercent || 5) / 100);
    const taxes = parseCurrency(state.taxesInsurance?.annualPropertyTax) / 12;
    const ins = parseCurrency(state.taxesInsurance?.insurancePremium) / 12;
    const flood = parseCurrency(state.taxesInsurance?.floodPremium) / 12;
    const hoa = parseCurrency(state.property?.hoaDues);
    const opex = mgmt + maint + capex + taxes + ins + flood + hoa;
    const noi = effGross - opex;
    const debt = parseCurrency(state.mortgage?.monthlyPI);
    const cashFlow = noi - debt;
    return { delta, rent: testRent, cashFlow, annualCashFlow: cashFlow * 12 };
  });

  // Chart data
  const expenseChart = hasData ? [
    { name: 'P&I', value: cf.debtService, color: '#3b82f6' },
    { name: 'Taxes', value: cf.taxes, color: '#8b5cf6' },
    { name: 'Insurance', value: cf.insurance + cf.flood, color: '#f59e0b' },
    { name: 'HOA', value: cf.hoa, color: '#10b981' },
    { name: 'Mgmt', value: cf.mgmtFee, color: '#ef4444' },
    { name: 'Maint', value: cf.maintenance, color: '#6366f1' },
    { name: 'CapEx', value: cf.capex, color: '#ec4899' },
  ].filter(d => d.value > 0) : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Cash Flow Analysis</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Module 7 — Rental income projections and stress testing</p>
      </div>

      {!hasData && (
        <div className="bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-700 rounded-xl p-4 text-sm text-yellow-800 dark:text-yellow-300">
          Missing data: Enter target rent and mortgage payment in the Intake Form to see projections.
        </div>
      )}

      {/* Monthly Summary */}
      <div className="grid lg:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-5 text-center">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Gross Rent</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">{hasData ? formatCurrency(cf.grossRent) : '—'}</p>
          <p className="text-xs text-slate-400 dark:text-slate-500">per month</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-5 text-center">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Net Operating Income</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">{hasData ? formatCurrency(cf.noi) : '—'}</p>
          <p className="text-xs text-slate-400 dark:text-slate-500">after expenses, before mortgage</p>
        </div>
        <div className={`bg-white dark:bg-slate-800 rounded-xl shadow-sm border p-5 text-center ${hasData && cf.cashFlow < 0 ? 'border-red-200 dark:border-red-700' : 'border-slate-200 dark:border-slate-700'}`}>
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Cash Flow</p>
          <p className={`text-2xl font-bold mt-1 ${hasData ? (cf.cashFlow >= 0 ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400') : 'text-slate-900 dark:text-slate-100'}`}>
            {hasData ? formatCurrency(cf.cashFlow) : '—'}
          </p>
          <p className="text-xs text-slate-400 dark:text-slate-500">after all costs + mortgage</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Income & Expense Breakdown */}
        <Card title="Monthly Income & Expense Breakdown">
          <div className="space-y-1">
            <div className="flex justify-between py-1.5 bg-green-50 dark:bg-green-900/30 px-2 rounded text-sm font-medium">
              <span className="text-green-800 dark:text-green-300">Gross Rent</span>
              <span className="text-green-800 dark:text-green-300">{hasData ? formatCurrency(cf.grossRent) : '—'}</span>
            </div>
            <div className="flex justify-between py-1 px-2 text-sm text-red-600 dark:text-red-400">
              <span>− Vacancy ({state.rental?.vacancyRatePercent || 8}%)</span>
              <span>({formatCurrency(cf.vacancyLoss)})</span>
            </div>
            <div className="flex justify-between py-1.5 px-2 bg-blue-50 dark:bg-blue-900/30 rounded text-sm font-semibold">
              <span className="text-blue-800 dark:text-blue-300">Effective Gross Income</span>
              <span className="text-blue-800 dark:text-blue-300">{hasData ? formatCurrency(cf.effectiveGross) : '—'}</span>
            </div>
            <div className="border-t border-slate-100 dark:border-slate-700 mt-2 pt-2" />
            {[
              { label: `Management Fee (${state.rental?.managementFeePercent || 10}%)`, value: cf.mgmtFee },
              { label: `Maintenance Reserve (${state.rental?.maintenanceReservePercent || 8}%)`, value: cf.maintenance },
              { label: `CapEx Reserve (${state.rental?.capexReservePercent || 5}%)`, value: cf.capex },
              { label: 'Property Taxes', value: cf.taxes },
              { label: 'Insurance', value: cf.insurance },
              { label: 'Flood Insurance', value: cf.flood },
              { label: 'HOA Dues', value: cf.hoa },
            ].filter(i => i.value > 0).map(item => (
              <div key={item.label} className="flex justify-between py-1 px-2 text-sm">
                <span className="text-slate-600 dark:text-slate-400">− {item.label}</span>
                <span className="text-slate-700 dark:text-slate-300">({formatCurrency(item.value)})</span>
              </div>
            ))}
            <div className="flex justify-between py-1.5 px-2 bg-purple-50 dark:bg-purple-900/30 rounded text-sm font-semibold mt-1">
              <span className="text-purple-800 dark:text-purple-300">NOI</span>
              <span className="text-purple-800 dark:text-purple-300">{hasData ? formatCurrency(cf.noi) : '—'}</span>
            </div>
            <div className="flex justify-between py-1 px-2 text-sm">
              <span className="text-slate-600 dark:text-slate-400">− Mortgage P&I</span>
              <span className="text-slate-700 dark:text-slate-300">({formatCurrency(cf.debtService)})</span>
            </div>
            <div className={`flex justify-between py-1.5 px-2 rounded text-sm font-bold mt-1 ${cf.cashFlow >= 0 ? 'bg-green-50 dark:bg-green-900/30 text-green-800 dark:text-green-300' : 'bg-red-50 dark:bg-red-900/30 text-red-800 dark:text-red-300'}`}>
              <span>Net Cash Flow</span>
              <span>{hasData ? formatCurrency(cf.cashFlow) : '—'}</span>
            </div>
          </div>
        </Card>

        {/* Expense Chart */}
        <Card title="Monthly Expense Distribution">
          {hasData && expenseChart.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={expenseChart} layout="vertical" margin={{ left: 60 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-slate-200, #e2e8f0)" />
                <XAxis type="number" tickFormatter={v => `$${v.toLocaleString()}`} tick={{ fill: 'currentColor' }} />
                <YAxis type="category" dataKey="name" width={50} tick={{ fill: 'currentColor' }} />
                <Tooltip formatter={v => formatCurrency(v)} contentStyle={{ backgroundColor: 'var(--color-slate-800, #1e293b)', border: '1px solid var(--color-slate-600, #475569)', borderRadius: '8px', color: '#e2e8f0' }} />
                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                  {expenseChart.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-slate-400 dark:text-slate-500 text-center py-8">Enter financial data to see chart</p>
          )}
        </Card>

        {/* Break-Even Analysis */}
        <Card title="Break-Even Analysis" status={hasData && breakEven > rent ? 'red' : hasData ? 'green' : undefined}>
          <div className="space-y-3">
            <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-700">
              <span className="text-sm text-slate-600 dark:text-slate-400">Break-Even Rent</span>
              <span className="text-sm font-bold text-slate-900 dark:text-slate-100">{hasData ? formatCurrency(breakEven) : '—'}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-700">
              <span className="text-sm text-slate-600 dark:text-slate-400">Your Target Rent</span>
              <span className="text-sm font-bold text-slate-900 dark:text-slate-100">{rent ? formatCurrency(rent) : '—'}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-sm text-slate-600 dark:text-slate-400">Margin</span>
              <span className={`text-sm font-bold ${hasData ? (rent >= breakEven ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400') : 'text-slate-900 dark:text-slate-100'}`}>
                {hasData ? formatCurrency(rent - breakEven) : '—'}
              </span>
            </div>
            {hasData && rent < breakEven && (
              <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-lg p-3 text-sm text-red-700 dark:text-red-300">
                Your target rent is below break-even. You would lose approximately {formatCurrency(breakEven - rent)}/month.
              </div>
            )}
          </div>
        </Card>

        {/* Vacancy Stress Test */}
        <Card title="Vacancy Stress Test">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700">
                  <th className="text-left py-2 text-slate-600 dark:text-slate-400 font-medium">Scenario</th>
                  <th className="text-right py-2 text-slate-600 dark:text-slate-400 font-medium">Lost Rent</th>
                  <th className="text-right py-2 text-slate-600 dark:text-slate-400 font-medium">Turnover</th>
                  <th className="text-right py-2 text-slate-600 dark:text-slate-400 font-medium">Total Impact</th>
                </tr>
              </thead>
              <tbody>
                {stressTest.map(row => (
                  <tr key={row.months} className="border-b border-slate-50 dark:border-slate-700/50">
                    <td className="py-2 text-slate-700 dark:text-slate-300">{row.months} month{row.months > 1 ? 's' : ''} vacant</td>
                    <td className="py-2 text-right text-red-600 dark:text-red-400">{hasData ? formatCurrency(row.lostRent) : '—'}</td>
                    <td className="py-2 text-right text-slate-600 dark:text-slate-400">{formatCurrency(row.turnoverCost)}</td>
                    <td className="py-2 text-right font-semibold text-red-700 dark:text-red-400">{hasData ? formatCurrency(row.totalImpact) : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Rent Sensitivity */}
      <Card title="Rent Sensitivity Analysis">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left py-2 text-slate-600 dark:text-slate-400 font-medium">Monthly Rent</th>
                <th className="text-right py-2 text-slate-600 dark:text-slate-400 font-medium">Monthly Cash Flow</th>
                <th className="text-right py-2 text-slate-600 dark:text-slate-400 font-medium">Annual Cash Flow</th>
                <th className="text-left py-2 pl-4 text-slate-600 dark:text-slate-400 font-medium">Notes</th>
              </tr>
            </thead>
            <tbody>
              {sensitivities.map(row => (
                <tr key={row.delta} className={`border-b border-slate-50 dark:border-slate-700/50 ${row.delta === 0 ? 'bg-blue-50 dark:bg-blue-900/30 font-semibold' : ''}`}>
                  <td className="py-2 text-slate-700 dark:text-slate-300">{hasData ? formatCurrency(row.rent) : '—'}</td>
                  <td className={`py-2 text-right ${row.cashFlow >= 0 ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'}`}>
                    {hasData ? formatCurrency(row.cashFlow) : '—'}
                  </td>
                  <td className={`py-2 text-right ${row.annualCashFlow >= 0 ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'}`}>
                    {hasData ? formatCurrency(row.annualCashFlow) : '—'}
                  </td>
                  <td className="py-2 pl-4 text-slate-500 dark:text-slate-400">
                    {row.delta === 0 ? 'Your target' : row.delta > 0 ? 'Above target' : 'Below target'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
