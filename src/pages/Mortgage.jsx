import { useProperty } from '../store/PropertyContext';
import Card from '../components/Card';
import StatusBadge from '../components/StatusBadge';
import { formatCurrency, formatPercent, parseCurrency, calcEquity, calcLTV, calcMonthlyPI } from '../utils/calculations';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

export default function Mortgage() {
  const { state, dispatch } = useProperty();
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

  // Rate advantage calculations
  const inflationRate = parseFloat(state.rental?.inflationRate || 3.2);
  const currentMarketRate = parseFloat(state.rental?.currentMarketRate || 6.5);
  const realCostOfDebt = rate - inflationRate; // negative = debt shrinks in real terms
  const rateDelta = currentMarketRate - rate; // spread vs today's market
  const monthlyAtMarketRate = origAmount && currentMarketRate ? calcMonthlyPI(origAmount, currentMarketRate, term) : 0;
  const actualMonthly = parseCurrency(m.monthlyPI) || calcPI;
  const monthlySavings = monthlyAtMarketRate - actualMonthly;
  const annualSavings = monthlySavings * 12;
  const remainingYears = term - (origAmount > 0 && balance > 0 ? Math.round(term * (1 - balance / origAmount) / (1 - Math.pow(1 + rate / 1200, -term * 12))) : 0);
  const lifetimeSavings = annualSavings * Math.max(1, Math.min(remainingYears, term));
  // How much the loan balance "shrinks" in real purchasing power each year
  const annualInflationBenefit = balance * (inflationRate / 100);

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
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
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
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <ResponsiveContainer width="100%" height={160} className="max-w-[160px]">
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

      {/* Rate Advantage Analysis */}
      {rate > 0 && balance > 0 && (
        <Card title="Rate Advantage Analysis" status={realCostOfDebt < 0 ? 'green' : 'yellow'}>
          <div className="space-y-4">
            {/* Comparison inputs */}
            <div className="flex flex-col sm:flex-row flex-wrap items-start sm:items-center gap-3 sm:gap-4 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-slate-500 dark:text-slate-400">Today's market rate</span>
                <input
                  type="text"
                  value={state.rental?.currentMarketRate || ''}
                  onChange={e => dispatch({ type: 'SET_FIELD', section: 'rental', field: 'currentMarketRate', value: e.target.value })}
                  placeholder="6.5"
                  className="w-20 px-2 py-2 text-right text-sm font-bold border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 min-h-[44px]"
                />
                <span className="text-slate-400 dark:text-slate-500">%</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-slate-500 dark:text-slate-400">Inflation rate</span>
                <input
                  type="text"
                  value={state.rental?.inflationRate || ''}
                  onChange={e => dispatch({ type: 'SET_FIELD', section: 'rental', field: 'inflationRate', value: e.target.value })}
                  placeholder="3.2"
                  className="w-20 px-2 py-2 text-right text-sm font-bold border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 min-h-[44px]"
                />
                <span className="text-slate-400 dark:text-slate-500">%</span>
              </div>
            </div>

            {/* The Big Number */}
            <div className={`rounded-xl p-5 text-center ${realCostOfDebt < 0 ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700' : 'bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600'}`}>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase mb-1">Real Cost of Your Debt</p>
              <p className={`text-3xl font-black ${realCostOfDebt < 0 ? 'text-green-700 dark:text-green-300' : 'text-slate-900 dark:text-slate-100'}`}>
                {realCostOfDebt > 0 ? '+' : ''}{realCostOfDebt.toFixed(2)}%
              </p>
              <p className="text-sm mt-1 text-slate-600 dark:text-slate-400">
                {realCostOfDebt < 0
                  ? `Your ${rate}% rate minus ${inflationRate}% inflation = your debt is shrinking in real terms`
                  : `Your rate is above inflation — the loan costs real money`
                }
              </p>
              {realCostOfDebt < 0 && (
                <p className="text-xs text-green-700 dark:text-green-400 font-semibold mt-2">
                  This is effectively free money. Every year, inflation erodes {formatCurrency(annualInflationBenefit)} of your loan's real value.
                </p>
              )}
            </div>

            {/* Detailed breakdown */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Your Rate vs. Market</p>
                {[
                  ['Your Rate', `${rate}%`],
                  ['Today\'s Market Rate', `${currentMarketRate}%`],
                  ['Rate Advantage', `${rateDelta.toFixed(2)}% lower`],
                ].map(([label, value]) => (
                  <div key={label} className="flex justify-between py-1 border-b border-slate-50 dark:border-slate-700/50 text-sm">
                    <span className="text-slate-600 dark:text-slate-400">{label}</span>
                    <span className="font-medium text-slate-900 dark:text-slate-100">{value}</span>
                  </div>
                ))}
              </div>
              <div className="space-y-2">
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Monthly Savings</p>
                {[
                  ['Your P&I', formatCurrency(actualMonthly)],
                  [`P&I at ${currentMarketRate}%`, formatCurrency(monthlyAtMarketRate)],
                  ['Monthly Savings', formatCurrency(monthlySavings)],
                  ['Annual Savings', formatCurrency(annualSavings)],
                ].map(([label, value]) => (
                  <div key={label} className="flex justify-between py-1 border-b border-slate-50 dark:border-slate-700/50 text-sm">
                    <span className="text-slate-600 dark:text-slate-400">{label}</span>
                    <span className={`font-medium ${label.includes('Savings') ? 'text-green-600 dark:text-green-400' : 'text-slate-900 dark:text-slate-100'}`}>{value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Inflation wealth transfer */}
            <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-xl p-4">
              <p className="text-sm font-semibold text-blue-800 dark:text-blue-300 mb-2">Why This Matters for Keep vs. Sell</p>
              <ul className="text-xs text-blue-700 dark:text-blue-400 space-y-1.5">
                <li>• <strong>Inflation erodes your loan:</strong> Your {formatCurrency(balance)} balance loses ~{formatCurrency(annualInflationBenefit)}/yr in real purchasing power</li>
                <li>• <strong>Rate you can't replace:</strong> Selling this property means losing your {rate}% rate. A new loan today would cost {currentMarketRate}% — that's {formatCurrency(monthlySavings)}/mo more</li>
                <li>• <strong>Leverage advantage:</strong> You're borrowing at {rate}% and inflation runs at {inflationRate}% — the spread pays you to hold debt</li>
                {annualSavings > 0 && <li>• <strong>Opportunity cost of selling:</strong> Giving up ~{formatCurrency(annualSavings)}/yr in rate savings, or ~{formatCurrency(lifetimeSavings)} over the remaining loan life</li>}
              </ul>
            </div>

            {/* Sell penalty estimate */}
            {monthlySavings > 0 && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-xl p-4">
                <p className="text-sm font-semibold text-red-800 dark:text-red-300 mb-1">Cost of Losing This Rate</p>
                <p className="text-xs text-red-700 dark:text-red-400">
                  If you sell and buy a similar property at today's {currentMarketRate}% rate, you'd pay <strong>{formatCurrency(monthlySavings)}/mo more</strong> — that's <strong>{formatCurrency(annualSavings)}/yr</strong> out of pocket. Over 10 years, that's roughly <strong>{formatCurrency(annualSavings * 10)}</strong> in extra interest.
                </p>
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}
