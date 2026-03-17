import { useProperty } from '../store/PropertyContext';
import Card from '../components/Card';
import { formatCurrency, parseCurrency, calcCashFlow, calcBreakEvenRent, calcDepreciation, calcMultiYearCashFlow } from '../utils/calculations';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LineChart, Line, Legend } from 'recharts';

export default function CashFlow() {
  const { state, dispatch } = useProperty();
  const cf = calcCashFlow(state);
  const breakEven = calcBreakEvenRent(state);
  const rent = parseCurrency(state.rental?.targetRent);

  const hasData = rent > 0 && parseCurrency(state.mortgage?.monthlyPI) > 0;
  const reserveCash = parseCurrency(state.rental?.reserveCash);
  const monthlyReserveContrib = cf.maintenance + cf.capex;
  const monthsOfCoverage = monthlyReserveContrib > 0 ? reserveCash / monthlyReserveContrib : 0;

  const updateReserveCash = (value) => {
    dispatch({ type: 'SET_FIELD', section: 'rental', field: 'reserveCash', value });
  };

  // After-tax cash flow
  const purchasePrice = parseCurrency(state.property?.purchasePrice);
  const landValue = parseCurrency(state.taxesInsurance?.countyLandValue);
  const dep = purchasePrice > 0 ? calcDepreciation(purchasePrice, landValue) : null;
  const monthlyDepreciation = dep?.monthly || 0;
  // Rough mortgage interest estimate: early in loan ~70% of P&I is interest
  const monthlyMortgageInterest = cf.debtService * (parseFloat(state.mortgage?.interestRate || 0) / 100) * 0.7;
  // Taxable rental income = rent - all deductible expenses - depreciation - mortgage interest
  const monthlyTaxableIncome = cf.effectiveGross - cf.totalOpEx - monthlyMortgageInterest - monthlyDepreciation;
  const marginalTaxRate = parseFloat(state.rental?.marginalTaxRate || 22) / 100;
  const monthlyTaxImpact = monthlyTaxableIncome * marginalTaxRate; // positive = tax owed, negative = tax savings
  const afterTaxCashFlow = cf.cashFlow - monthlyTaxImpact;

  // Multi-year projections
  const multiYear = hasData ? calcMultiYearCashFlow(state, 10) : [];

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
    { name: 'Maint*', value: cf.maintenance, color: '#6366f1' },
    { name: 'CapEx*', value: cf.capex, color: '#ec4899' },
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
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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

      {/* Cash Reserves */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border-2 border-blue-200 dark:border-blue-700 p-5">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h2 className="text-sm font-semibold text-blue-800 dark:text-blue-300 uppercase tracking-wide">Cash Reserves on Hand</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Money set aside for maintenance, repairs, and capital expenditures
            </p>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-500 dark:text-slate-400">$</span>
              <input
                type="text"
                value={state.rental?.reserveCash || ''}
                onChange={e => updateReserveCash(e.target.value)}
                placeholder="8,000"
                className="w-full sm:w-32 px-3 py-2 text-right text-lg font-bold border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="flex items-center gap-1">
              <label className="text-xs text-slate-500 dark:text-slate-400">Tax bracket</label>
              <input
                type="text"
                value={state.rental?.marginalTaxRate || ''}
                onChange={e => dispatch({ type: 'SET_FIELD', section: 'rental', field: 'marginalTaxRate', value: e.target.value })}
                placeholder="22"
                className="w-full sm:w-16 px-2 py-2 text-right text-sm font-bold border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <span className="text-sm text-slate-500 dark:text-slate-400">%</span>
            </div>
          </div>
        </div>
        {hasData && reserveCash > 0 && (
          <div className="mt-4 grid sm:grid-cols-3 gap-3">
            <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-3 text-center">
              <p className="text-xs text-slate-500 dark:text-slate-400">Maint. Budget Set-Aside</p>
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{formatCurrency(cf.maintenance)}/mo</p>
              <p className="text-[10px] text-slate-400 dark:text-slate-500">{formatCurrency(cf.maintenance * 12)}/yr target</p>
            </div>
            <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-3 text-center">
              <p className="text-xs text-slate-500 dark:text-slate-400">CapEx Budget Set-Aside</p>
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{formatCurrency(cf.capex)}/mo</p>
              <p className="text-[10px] text-slate-400 dark:text-slate-500">{formatCurrency(cf.capex * 12)}/yr target</p>
            </div>
            <div className={`rounded-lg p-3 text-center ${monthsOfCoverage >= 12 ? 'bg-green-50 dark:bg-green-900/30' : monthsOfCoverage >= 6 ? 'bg-yellow-50 dark:bg-yellow-900/30' : 'bg-red-50 dark:bg-red-900/30'}`}>
              <p className="text-xs text-slate-500 dark:text-slate-400">Reserves Coverage</p>
              <p className={`text-sm font-semibold ${monthsOfCoverage >= 12 ? 'text-green-700 dark:text-green-400' : monthsOfCoverage >= 6 ? 'text-yellow-700 dark:text-yellow-400' : 'text-red-700 dark:text-red-400'}`}>
                {monthsOfCoverage.toFixed(1)} months
              </p>
            </div>
          </div>
        )}
        {hasData && reserveCash > 0 && monthsOfCoverage < 6 && (
          <p className="mt-2 text-xs text-red-600 dark:text-red-400">
            Tip: Most advisors recommend 6–12 months of reserve contributions on hand.
          </p>
        )}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Income & Expense Breakdown */}
        <Card title="Monthly Income & Expense Breakdown">
          <div className="space-y-1">
            <div className="flex justify-between py-1.5 bg-green-50 dark:bg-green-900/30 px-2 rounded text-sm font-medium">
              <span className="text-green-800 dark:text-green-300">Gross Rent</span>
              <span className="text-green-800 dark:text-green-300">{hasData ? formatCurrency(cf.grossRent) : '—'}</span>
            </div>
            <div className="flex justify-between py-1 px-2 text-sm text-amber-600 dark:text-amber-400">
              <span>− Vacancy Allowance ({state.rental?.vacancyRatePercent || 8}%)</span>
              <span>({formatCurrency(cf.vacancyLoss)}) <span className="text-[10px] text-slate-400 dark:text-slate-500">budget, not guaranteed</span></span>
            </div>
            <div className="flex justify-between py-1.5 px-2 bg-blue-50 dark:bg-blue-900/30 rounded text-sm font-semibold">
              <span className="text-blue-800 dark:text-blue-300">Effective Gross Income</span>
              <span className="text-blue-800 dark:text-blue-300">{hasData ? formatCurrency(cf.effectiveGross) : '—'}</span>
            </div>
            <div className="border-t border-slate-100 dark:border-slate-700 mt-2 pt-2" />
            {[
              { label: `Management Fee (${state.rental?.managementFeePercent || 10}%)`, value: cf.mgmtFee },
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
            {/* Reserve allocations — separated to clarify these are budget set-asides, not actual monthly bills */}
            <div className="border-t border-dashed border-slate-200 dark:border-slate-600 mt-2 pt-2">
              <p className="text-[10px] uppercase tracking-wide font-semibold text-amber-600 dark:text-amber-400 px-2 mb-1">Annualized Reserve Allocations</p>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 px-2 mb-2">
                These are not actual monthly bills — they represent money you should budget over time for irregular, unpredictable costs (e.g. a full vacancy month, a new HVAC, roof repairs). Actual timing and amounts will vary.
              </p>
              {[
                { label: `Vacancy Allowance (${state.rental?.vacancyRatePercent || 8}%)`, value: cf.vacancyLoss, annual: cf.vacancyLoss * 12, note: `≈ ${formatCurrency(cf.vacancyLoss * 12)}/yr` },
                { label: `Maintenance Reserve (${state.rental?.maintenanceReservePercent || 8}%)`, value: cf.maintenance, annual: cf.maintenance * 12, note: `≈ ${formatCurrency(cf.maintenance * 12)}/yr` },
                { label: `CapEx Reserve (${state.rental?.capexReservePercent || 5}%)`, value: cf.capex, annual: cf.capex * 12, note: `≈ ${formatCurrency(cf.capex * 12)}/yr` },
              ].filter(i => i.value > 0).map(item => (
                <div key={item.label} className="flex justify-between py-1 px-2 text-sm">
                  <span className="text-slate-600 dark:text-slate-400">− {item.label}</span>
                  <span className="text-slate-700 dark:text-slate-300">
                    ({formatCurrency(item.value)}<span className="text-[10px] text-slate-400 dark:text-slate-500 ml-1">{item.note}</span>)
                  </span>
                </div>
              ))}
            </div>
            <div className="flex justify-between py-1.5 px-2 bg-purple-50 dark:bg-purple-900/30 rounded text-sm font-semibold mt-1">
              <span className="text-purple-800 dark:text-purple-300">NOI</span>
              <span className="text-purple-800 dark:text-purple-300">{hasData ? formatCurrency(cf.noi) : '—'}</span>
            </div>
            <div className="flex justify-between py-1 px-2 text-sm">
              <span className="text-slate-600 dark:text-slate-400">− Mortgage P&I</span>
              <span className="text-slate-700 dark:text-slate-300">({formatCurrency(cf.debtService)})</span>
            </div>
            <div className={`flex justify-between py-1.5 px-2 rounded text-sm font-bold mt-1 ${cf.cashFlow >= 0 ? 'bg-green-50 dark:bg-green-900/30 text-green-800 dark:text-green-300' : 'bg-red-50 dark:bg-red-900/30 text-red-800 dark:text-red-300'}`}>
              <span>Net Cash Flow (pre-tax)</span>
              <span>{hasData ? formatCurrency(cf.cashFlow) : '—'}</span>
            </div>

            {/* After-Tax Section */}
            {hasData && dep && (
              <>
                <div className="border-t border-slate-200 dark:border-slate-600 mt-3 pt-2" />
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase px-2 mb-1">Tax Impact (estimated)</p>
                <div className="flex justify-between py-1 px-2 text-sm">
                  <span className="text-slate-600 dark:text-slate-400">Depreciation (paper)</span>
                  <span className="text-green-600 dark:text-green-400">({formatCurrency(monthlyDepreciation)})</span>
                </div>
                <div className="flex justify-between py-1 px-2 text-sm">
                  <span className="text-slate-600 dark:text-slate-400">Mortgage Interest (est.)</span>
                  <span className="text-green-600 dark:text-green-400">({formatCurrency(monthlyMortgageInterest)})</span>
                </div>
                <div className="flex justify-between py-1 px-2 text-sm">
                  <span className="text-slate-600 dark:text-slate-400">Taxable Rental Income</span>
                  <span className={`font-medium ${monthlyTaxableIncome < 0 ? 'text-green-600 dark:text-green-400' : 'text-slate-700 dark:text-slate-300'}`}>
                    {formatCurrency(monthlyTaxableIncome)}
                  </span>
                </div>
                <div className="flex justify-between py-1 px-2 text-sm">
                  <span className="text-slate-600 dark:text-slate-400">
                    Tax @ {(marginalTaxRate * 100).toFixed(0)}% {monthlyTaxImpact < 0 ? '(savings)' : ''}
                  </span>
                  <span className={monthlyTaxImpact < 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                    {monthlyTaxImpact < 0 ? '+' : '−'}{formatCurrency(Math.abs(monthlyTaxImpact))}
                  </span>
                </div>
                <div className={`flex justify-between py-1.5 px-2 rounded text-sm font-bold mt-1 ${afterTaxCashFlow >= 0 ? 'bg-green-50 dark:bg-green-900/30 text-green-800 dark:text-green-300' : 'bg-red-50 dark:bg-red-900/30 text-red-800 dark:text-red-300'}`}>
                  <span>After-Tax Cash Flow</span>
                  <span>{formatCurrency(afterTaxCashFlow)}</span>
                </div>
                {monthlyTaxableIncome < 0 && (
                  <p className="text-xs text-green-700 dark:text-green-400 px-2 mt-1">
                    Depreciation creates a paper loss — may offset other income. Consult your CPA.
                  </p>
                )}
              </>
            )}
          </div>
        </Card>

        {/* Expense Chart */}
        <Card title="Monthly Expense Distribution">
          {hasData && expenseChart.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={220}>
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
              <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-2">* Budget reserves — not recurring monthly bills. Actual costs are irregular and unpredictable.</p>
            </>
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
          {/* Mobile cards */}
          <div className="block sm:hidden space-y-3">
            {stressTest.map(row => (
              <div key={row.months} className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-3 space-y-1">
                <p className="text-sm font-bold text-slate-900 dark:text-slate-100">{row.months} month{row.months > 1 ? 's' : ''} vacant</p>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500 dark:text-slate-400">Lost Rent</span>
                  <span className="text-red-600 dark:text-red-400">{hasData ? formatCurrency(row.lostRent) : '—'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500 dark:text-slate-400">Turnover</span>
                  <span className="text-slate-600 dark:text-slate-400">{formatCurrency(row.turnoverCost)}</span>
                </div>
                <div className="flex justify-between text-sm font-semibold">
                  <span className="text-slate-500 dark:text-slate-400">Total Impact</span>
                  <span className="text-red-700 dark:text-red-400">{hasData ? formatCurrency(row.totalImpact) : '—'}</span>
                </div>
              </div>
            ))}
          </div>
          {/* Desktop table */}
          <div className="hidden sm:block overflow-x-auto">
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
        {/* Mobile cards */}
        <div className="block sm:hidden space-y-3">
          {sensitivities.map(row => (
            <div key={row.delta} className={`rounded-lg p-3 space-y-1 ${row.delta === 0 ? 'bg-blue-50 dark:bg-blue-900/30 ring-1 ring-blue-200 dark:ring-blue-700' : 'bg-slate-50 dark:bg-slate-700/50'}`}>
              <p className="text-sm font-bold text-slate-900 dark:text-slate-100">{hasData ? formatCurrency(row.rent) : '—'} <span className="text-xs font-normal text-slate-500 dark:text-slate-400">{row.delta === 0 ? 'Your target' : row.delta > 0 ? 'Above target' : 'Below target'}</span></p>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500 dark:text-slate-400">Monthly CF</span>
                <span className={row.cashFlow >= 0 ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'}>{hasData ? formatCurrency(row.cashFlow) : '—'}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500 dark:text-slate-400">Annual CF</span>
                <span className={row.annualCashFlow >= 0 ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'}>{hasData ? formatCurrency(row.annualCashFlow) : '—'}</span>
              </div>
            </div>
          ))}
        </div>
        {/* Desktop table */}
        <div className="hidden sm:block overflow-x-auto">
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

      {/* Multi-Year Projection */}
      <Card title="10-Year Cash Flow Projection">
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-4">
            <div className="flex items-center gap-2">
              <label className="text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">Annual rent increase</label>
              <input
                type="text"
                value={state.rental?.rentEscalationPercent || ''}
                onChange={e => dispatch({ type: 'SET_FIELD', section: 'rental', field: 'rentEscalationPercent', value: e.target.value })}
                placeholder="3"
                className="w-16 px-2 py-1.5 text-right text-sm border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-xs text-slate-500 dark:text-slate-400">%</span>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">Annual expense growth</label>
              <input
                type="text"
                value={state.rental?.expenseGrowthPercent || ''}
                onChange={e => dispatch({ type: 'SET_FIELD', section: 'rental', field: 'expenseGrowthPercent', value: e.target.value })}
                placeholder="2"
                className="w-16 px-2 py-1.5 text-right text-sm border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-xs text-slate-500 dark:text-slate-400">%</span>
            </div>
          </div>

          {hasData && multiYear.length > 0 && (
            <>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={multiYear} margin={{ left: 10, right: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-slate-200, #e2e8f0)" />
                  <XAxis dataKey="year" tick={{ fill: 'currentColor', fontSize: 12 }} label={{ value: 'Year', position: 'insideBottom', offset: -5, fill: 'currentColor', fontSize: 12 }} />
                  <YAxis tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} tick={{ fill: 'currentColor', fontSize: 12 }} />
                  <Tooltip formatter={v => formatCurrency(v)} contentStyle={{ backgroundColor: 'var(--color-slate-800, #1e293b)', border: '1px solid var(--color-slate-600, #475569)', borderRadius: '8px', color: '#e2e8f0' }} />
                  <Legend />
                  <Line type="monotone" dataKey="preTaxCashFlow" stroke="#3b82f6" name="Pre-Tax" strokeWidth={2} dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="afterTaxCashFlow" stroke="#10b981" name="After-Tax" strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>

              {/* Mobile cards */}
              <div className="block sm:hidden space-y-3">
                {multiYear.map(row => (
                  <div key={row.year} className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-3 space-y-1">
                    <p className="text-sm font-bold text-slate-900 dark:text-slate-100">Year {row.year}</p>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500 dark:text-slate-400">Mo. Rent</span>
                      <span className="text-slate-700 dark:text-slate-300">{formatCurrency(row.monthlyRent)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500 dark:text-slate-400">NOI</span>
                      <span className="text-slate-700 dark:text-slate-300">{formatCurrency(row.noi)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500 dark:text-slate-400">Pre-Tax CF</span>
                      <span className={`font-medium ${row.preTaxCashFlow >= 0 ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'}`}>{formatCurrency(row.preTaxCashFlow)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500 dark:text-slate-400">Tax Impact</span>
                      <span className={row.taxImpact < 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>{row.taxImpact < 0 ? '+' : ''}{formatCurrency(Math.abs(row.taxImpact))}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500 dark:text-slate-400">After-Tax CF</span>
                      <span className={`font-medium ${row.afterTaxCashFlow >= 0 ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'}`}>{formatCurrency(row.afterTaxCashFlow)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500 dark:text-slate-400">Cumulative</span>
                      <span className={`font-medium ${row.cumulativeAfterTax >= 0 ? 'text-blue-700 dark:text-blue-400' : 'text-red-700 dark:text-red-400'}`}>{formatCurrency(row.cumulativeAfterTax)}</span>
                    </div>
                  </div>
                ))}
              </div>
              {/* Desktop table */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-700">
                      <th className="text-left py-2 text-slate-600 dark:text-slate-400 font-medium">Yr</th>
                      <th className="text-right py-2 text-slate-600 dark:text-slate-400 font-medium">Mo. Rent</th>
                      <th className="text-right py-2 text-slate-600 dark:text-slate-400 font-medium">NOI</th>
                      <th className="text-right py-2 text-slate-600 dark:text-slate-400 font-medium">Pre-Tax CF</th>
                      <th className="text-right py-2 text-slate-600 dark:text-slate-400 font-medium">Tax Impact</th>
                      <th className="text-right py-2 text-slate-600 dark:text-slate-400 font-medium">After-Tax CF</th>
                      <th className="text-right py-2 text-slate-600 dark:text-slate-400 font-medium">Cumulative</th>
                    </tr>
                  </thead>
                  <tbody>
                    {multiYear.map(row => (
                      <tr key={row.year} className="border-b border-slate-50 dark:border-slate-700/50">
                        <td className="py-1.5 text-slate-700 dark:text-slate-300 font-medium">{row.year}</td>
                        <td className="py-1.5 text-right text-slate-700 dark:text-slate-300">{formatCurrency(row.monthlyRent)}</td>
                        <td className="py-1.5 text-right text-slate-700 dark:text-slate-300">{formatCurrency(row.noi)}</td>
                        <td className={`py-1.5 text-right font-medium ${row.preTaxCashFlow >= 0 ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'}`}>
                          {formatCurrency(row.preTaxCashFlow)}
                        </td>
                        <td className={`py-1.5 text-right ${row.taxImpact < 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                          {row.taxImpact < 0 ? '+' : ''}{formatCurrency(Math.abs(row.taxImpact))}
                        </td>
                        <td className={`py-1.5 text-right font-medium ${row.afterTaxCashFlow >= 0 ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'}`}>
                          {formatCurrency(row.afterTaxCashFlow)}
                        </td>
                        <td className={`py-1.5 text-right ${row.cumulativeAfterTax >= 0 ? 'text-blue-700 dark:text-blue-400' : 'text-red-700 dark:text-red-400'}`}>
                          {formatCurrency(row.cumulativeAfterTax)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
          {!hasData && (
            <p className="text-sm text-slate-400 dark:text-slate-500 text-center py-4">Enter rent and mortgage data to see projections.</p>
          )}
        </div>
      </Card>
    </div>
  );
}
