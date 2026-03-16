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
    const annualCashFlow = (cf.cashFlow * 12) - totalImpact + (rent * months * 0); // already accounted in vacancy rate
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
        <h1 className="text-2xl font-bold text-slate-900">Cash Flow Analysis</h1>
        <p className="text-sm text-slate-500 mt-1">Module 7 — Rental income projections and stress testing</p>
      </div>

      {!hasData && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-sm text-yellow-800">
          Missing data: Enter target rent and mortgage payment in the Intake Form to see projections.
        </div>
      )}

      {/* Monthly Summary */}
      <div className="grid lg:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 text-center">
          <p className="text-xs font-medium text-slate-500 uppercase">Gross Rent</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{hasData ? formatCurrency(cf.grossRent) : '—'}</p>
          <p className="text-xs text-slate-400">per month</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 text-center">
          <p className="text-xs font-medium text-slate-500 uppercase">Net Operating Income</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{hasData ? formatCurrency(cf.noi) : '—'}</p>
          <p className="text-xs text-slate-400">after expenses, before mortgage</p>
        </div>
        <div className={`bg-white rounded-xl shadow-sm border p-5 text-center ${hasData && cf.cashFlow < 0 ? 'border-red-200' : 'border-slate-200'}`}>
          <p className="text-xs font-medium text-slate-500 uppercase">Cash Flow</p>
          <p className={`text-2xl font-bold mt-1 ${hasData ? (cf.cashFlow >= 0 ? 'text-green-700' : 'text-red-700') : 'text-slate-900'}`}>
            {hasData ? formatCurrency(cf.cashFlow) : '—'}
          </p>
          <p className="text-xs text-slate-400">after all costs + mortgage</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Income & Expense Breakdown */}
        <Card title="Monthly Income & Expense Breakdown">
          <div className="space-y-1">
            <div className="flex justify-between py-1.5 bg-green-50 px-2 rounded text-sm font-medium">
              <span className="text-green-800">Gross Rent</span>
              <span className="text-green-800">{hasData ? formatCurrency(cf.grossRent) : '—'}</span>
            </div>
            <div className="flex justify-between py-1 px-2 text-sm text-red-600">
              <span>− Vacancy ({state.rental?.vacancyRatePercent || 8}%)</span>
              <span>({formatCurrency(cf.vacancyLoss)})</span>
            </div>
            <div className="flex justify-between py-1.5 px-2 bg-blue-50 rounded text-sm font-semibold">
              <span className="text-blue-800">Effective Gross Income</span>
              <span className="text-blue-800">{hasData ? formatCurrency(cf.effectiveGross) : '—'}</span>
            </div>
            <div className="border-t border-slate-100 mt-2 pt-2" />
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
                <span className="text-slate-600">− {item.label}</span>
                <span className="text-slate-700">({formatCurrency(item.value)})</span>
              </div>
            ))}
            <div className="flex justify-between py-1.5 px-2 bg-purple-50 rounded text-sm font-semibold mt-1">
              <span className="text-purple-800">NOI</span>
              <span className="text-purple-800">{hasData ? formatCurrency(cf.noi) : '—'}</span>
            </div>
            <div className="flex justify-between py-1 px-2 text-sm">
              <span className="text-slate-600">− Mortgage P&I</span>
              <span className="text-slate-700">({formatCurrency(cf.debtService)})</span>
            </div>
            <div className={`flex justify-between py-1.5 px-2 rounded text-sm font-bold mt-1 ${cf.cashFlow >= 0 ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
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
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" tickFormatter={v => `$${v.toLocaleString()}`} />
                <YAxis type="category" dataKey="name" width={50} />
                <Tooltip formatter={v => formatCurrency(v)} />
                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                  {expenseChart.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-slate-400 text-center py-8">Enter financial data to see chart</p>
          )}
        </Card>

        {/* Break-Even Analysis */}
        <Card title="Break-Even Analysis" status={hasData && breakEven > rent ? 'red' : hasData ? 'green' : undefined}>
          <div className="space-y-3">
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-sm text-slate-600">Break-Even Rent</span>
              <span className="text-sm font-bold text-slate-900">{hasData ? formatCurrency(breakEven) : '—'}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-sm text-slate-600">Your Target Rent</span>
              <span className="text-sm font-bold text-slate-900">{rent ? formatCurrency(rent) : '—'}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-sm text-slate-600">Margin</span>
              <span className={`text-sm font-bold ${hasData ? (rent >= breakEven ? 'text-green-700' : 'text-red-700') : 'text-slate-900'}`}>
                {hasData ? formatCurrency(rent - breakEven) : '—'}
              </span>
            </div>
            {hasData && rent < breakEven && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
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
                <tr className="border-b border-slate-200">
                  <th className="text-left py-2 text-slate-600 font-medium">Scenario</th>
                  <th className="text-right py-2 text-slate-600 font-medium">Lost Rent</th>
                  <th className="text-right py-2 text-slate-600 font-medium">Turnover</th>
                  <th className="text-right py-2 text-slate-600 font-medium">Total Impact</th>
                </tr>
              </thead>
              <tbody>
                {stressTest.map(row => (
                  <tr key={row.months} className="border-b border-slate-50">
                    <td className="py-2 text-slate-700">{row.months} month{row.months > 1 ? 's' : ''} vacant</td>
                    <td className="py-2 text-right text-red-600">{hasData ? formatCurrency(row.lostRent) : '—'}</td>
                    <td className="py-2 text-right text-slate-600">{formatCurrency(row.turnoverCost)}</td>
                    <td className="py-2 text-right font-semibold text-red-700">{hasData ? formatCurrency(row.totalImpact) : '—'}</td>
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
              <tr className="border-b border-slate-200">
                <th className="text-left py-2 text-slate-600 font-medium">Monthly Rent</th>
                <th className="text-right py-2 text-slate-600 font-medium">Monthly Cash Flow</th>
                <th className="text-right py-2 text-slate-600 font-medium">Annual Cash Flow</th>
                <th className="text-left py-2 pl-4 text-slate-600 font-medium">Notes</th>
              </tr>
            </thead>
            <tbody>
              {sensitivities.map(row => (
                <tr key={row.delta} className={`border-b border-slate-50 ${row.delta === 0 ? 'bg-blue-50 font-semibold' : ''}`}>
                  <td className="py-2 text-slate-700">{hasData ? formatCurrency(row.rent) : '—'}</td>
                  <td className={`py-2 text-right ${row.cashFlow >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                    {hasData ? formatCurrency(row.cashFlow) : '—'}
                  </td>
                  <td className={`py-2 text-right ${row.annualCashFlow >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                    {hasData ? formatCurrency(row.annualCashFlow) : '—'}
                  </td>
                  <td className="py-2 pl-4 text-slate-500">
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
