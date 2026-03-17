import { useProperty } from '../store/PropertyContext';
import Card from '../components/Card';
import StatusBadge from '../components/StatusBadge';
import { formatCurrency, formatPercent, parseCurrency, calcEquity, calcLTV, calcCashFlow, calcBreakEvenRent, calcVAEntitlement } from '../utils/calculations';

export default function DecisionEngine() {
  const { state } = useProperty();

  const purchasePrice = parseCurrency(state.property.purchasePrice);
  const balance = parseCurrency(state.mortgage.currentBalance);
  const estimates = state.valueEstimates || [];
  const sortedEstimates = [...estimates].sort((a, b) => new Date(a.date) - new Date(b.date));
  const latestValue = sortedEstimates.length > 0 ? parseCurrency(sortedEstimates[sortedEstimates.length - 1].value) : purchasePrice;
  const equity = latestValue && balance ? calcEquity(latestValue, balance) : 0;
  const ltv = latestValue && balance ? calcLTV(balance, latestValue) : 0;
  const cf = calcCashFlow(state);
  const breakEven = calcBreakEvenRent(state);
  const targetRent = parseCurrency(state.rental?.targetRent);
  const originalLoan = parseCurrency(state.mortgage.originalLoanAmount);
  const va = originalLoan > 0 ? calcVAEntitlement(originalLoan) : null;
  const reserveCash = parseCurrency(state.rental?.reserveCash);

  const hasData = purchasePrice > 0 && balance > 0 && targetRent > 0;

  // Scoring
  const scores = {
    cashFlow: cf.cashFlow >= 200 ? 3 : cf.cashFlow >= 0 ? 2 : cf.cashFlow >= -200 ? 1 : 0,
    equity: equity >= 50000 ? 3 : equity >= 20000 ? 2 : equity > 0 ? 1 : 0,
    ltv: ltv < 80 ? 3 : ltv < 90 ? 2 : ltv < 95 ? 1 : 0,
    reserves: reserveCash >= 10000 ? 3 : reserveCash >= 5000 ? 2 : reserveCash > 0 ? 1 : 0,
    breakEvenMargin: targetRent >= breakEven + 200 ? 3 : targetRent >= breakEven ? 2 : targetRent >= breakEven - 200 ? 1 : 0,
    vaEntitlement: va && va.zeroDownPower >= 400000 ? 3 : va && va.zeroDownPower >= 200000 ? 2 : va ? 1 : 0,
  };

  const totalScore = Object.values(scores).reduce((a, b) => a + b, 0);
  const maxScore = Object.keys(scores).length * 3;
  const scorePercent = Math.round((totalScore / maxScore) * 100);

  const recommendation = scorePercent >= 75 ? 'rent' : scorePercent >= 50 ? 'hold-evaluate' : scorePercent >= 25 ? 'consider-selling' : 'sell';
  const recLabels = {
    'rent': { text: 'Strong Case for Renting', color: 'green', detail: 'Property shows positive fundamentals for rental conversion.' },
    'hold-evaluate': { text: 'Hold & Evaluate', color: 'yellow', detail: 'Some metrics need improvement. Address gaps before committing.' },
    'consider-selling': { text: 'Consider Selling', color: 'yellow', detail: 'Multiple risk factors present. Selling may be the better financial move.' },
    'sell': { text: 'Selling May Be Optimal', color: 'red', detail: 'Significant negative indicators. Selling likely preserves more wealth.' },
  };
  const rec = recLabels[recommendation];

  // Selling scenario
  const sellingCosts = latestValue * 0.08; // ~8% closing + agent
  const netFromSale = equity - sellingCosts;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Decision Engine</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Module 17 — Keep/sell/rent analysis, break-even, and risk assessment</p>
      </div>

      {!hasData && (
        <div className="bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-700 rounded-xl p-4 text-sm text-yellow-800 dark:text-yellow-300">
          Complete the Intake Form to unlock full decision analysis.
        </div>
      )}

      {/* Recommendation */}
      <div className={`rounded-xl border-2 p-6 text-center ${rec.color === 'green' ? 'border-green-500 bg-green-50 dark:bg-green-900/20' : rec.color === 'red' ? 'border-red-500 bg-red-50 dark:bg-red-900/20' : 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20'}`}>
        <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase mb-1">Decision Recommendation</p>
        <p className={`text-2xl font-bold ${rec.color === 'green' ? 'text-green-700 dark:text-green-300' : rec.color === 'red' ? 'text-red-700 dark:text-red-300' : 'text-yellow-700 dark:text-yellow-300'}`}>
          {rec.text}
        </p>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{rec.detail}</p>
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">Score: {totalScore}/{maxScore} ({scorePercent}%)</p>
      </div>

      {/* Scorecard */}
      <Card title="Decision Scorecard">
        <div className="space-y-3">
          {[
            { label: 'Monthly Cash Flow', score: scores.cashFlow, value: hasData ? formatCurrency(cf.cashFlow) : '—', detail: cf.cashFlow >= 200 ? 'Strong positive' : cf.cashFlow >= 0 ? 'Break-even' : 'Negative' },
            { label: 'Equity Position', score: scores.equity, value: equity ? formatCurrency(equity) : '—', detail: equity >= 50000 ? 'Strong' : equity > 0 ? 'Building' : 'Underwater' },
            { label: 'LTV Ratio', score: scores.ltv, value: ltv ? formatPercent(ltv) : '—', detail: ltv < 80 ? 'Healthy' : 'High leverage' },
            { label: 'Reserve Fund', score: scores.reserves, value: reserveCash ? formatCurrency(reserveCash) : '—', detail: reserveCash >= 10000 ? 'Well-funded' : reserveCash > 0 ? 'Underfunded' : 'None' },
            { label: 'Break-Even Margin', score: scores.breakEvenMargin, value: hasData ? formatCurrency(targetRent - breakEven) : '—', detail: targetRent >= breakEven ? 'Above break-even' : 'Below break-even' },
            { label: 'VA Buying Power', score: scores.vaEntitlement, value: va ? formatCurrency(va.zeroDownPower) : '—', detail: va ? `${formatCurrency(va.zeroDownPower)} zero-down` : 'Unknown' },
          ].map(item => (
            <div key={item.label} className="flex items-center gap-4 py-2 border-b border-slate-50 dark:border-slate-700/50">
              <div className="flex-1">
                <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{item.label}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{item.detail}</p>
              </div>
              <span className="text-sm font-medium text-slate-900 dark:text-slate-100 w-24 text-right">{item.value}</span>
              <div className="flex gap-1">
                {[0, 1, 2, 3].map(s => (
                  <span key={s} className={`w-3 h-3 rounded-full ${s <= item.score ? (item.score >= 2 ? 'bg-green-500' : item.score >= 1 ? 'bg-yellow-500' : 'bg-red-500') : 'bg-slate-200 dark:bg-slate-700'}`} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </Card>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Keep & Rent */}
        <Card title="Scenario: Keep & Rent" status={cf.cashFlow >= 0 ? 'green' : 'yellow'}>
          <div className="space-y-2 text-sm">
            {[
              ['Monthly Cash Flow', hasData ? formatCurrency(cf.cashFlow) : '—'],
              ['Annual Cash Flow', hasData ? formatCurrency(cf.cashFlow * 12) : '—'],
              ['Equity Growth', 'Continues via appreciation + paydown'],
              ['Tax Benefit', 'Depreciation deduction'],
              ['Risk', 'Vacancy, maintenance, tenant issues'],
              ['VA Impact', 'Entitlement remains used'],
            ].map(([l, v]) => (
              <div key={l} className="flex justify-between py-1 border-b border-slate-50 dark:border-slate-700/50">
                <span className="text-slate-600 dark:text-slate-400">{l}</span>
                <span className="font-medium text-slate-900 dark:text-slate-100 text-right">{v}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Sell */}
        <Card title="Scenario: Sell" status={netFromSale > 50000 ? 'green' : 'yellow'}>
          <div className="space-y-2 text-sm">
            {[
              ['Estimated Equity', equity ? formatCurrency(equity) : '—'],
              ['Selling Costs (~8%)', purchasePrice ? formatCurrency(sellingCosts) : '—'],
              ['Net Proceeds', netFromSale ? formatCurrency(netFromSale) : '—'],
              ['VA Entitlement', 'Restored after payoff'],
              ['Tax Impact', 'Capital gains if >$250K profit'],
              ['Benefit', 'Cash in hand + full VA restoration'],
            ].map(([l, v]) => (
              <div key={l} className="flex justify-between py-1 border-b border-slate-50 dark:border-slate-700/50">
                <span className="text-slate-600 dark:text-slate-400">{l}</span>
                <span className="font-medium text-slate-900 dark:text-slate-100 text-right">{v}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Hold / Wait */}
        <Card title="Scenario: Hold Vacant" status="red">
          <div className="space-y-2 text-sm">
            {[
              ['Monthly Carry Cost', hasData ? formatCurrency(parseCurrency(state.mortgage.totalMonthlyPayment) + parseCurrency(state.property.hoaDues)) : '—'],
              ['Annual Carry Cost', hasData ? formatCurrency((parseCurrency(state.mortgage.totalMonthlyPayment) + parseCurrency(state.property.hoaDues)) * 12) : '—'],
              ['Risk', 'High — insurance, maintenance, no income'],
              ['Tax Impact', 'No rental deductions available'],
              ['Benefit', 'Flexibility, potential appreciation'],
              ['Recommendation', 'Avoid if possible — rent or sell'],
            ].map(([l, v]) => (
              <div key={l} className="flex justify-between py-1 border-b border-slate-50 dark:border-slate-700/50">
                <span className="text-slate-600 dark:text-slate-400">{l}</span>
                <span className="font-medium text-slate-900 dark:text-slate-100 text-right">{v}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Reserve Sizing */}
      <Card title="Reserve Fund Sizing Guide">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left py-2 text-slate-600 dark:text-slate-400 font-medium">Risk Level</th>
                <th className="text-right py-2 text-slate-600 dark:text-slate-400 font-medium">Recommended Reserve</th>
                <th className="text-left py-2 pl-4 text-slate-600 dark:text-slate-400 font-medium">Covers</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['Conservative', '$10,000–$15,000', '6 months expenses + 1 major repair', 'green'],
                ['Moderate', '$5,000–$10,000', '3 months expenses + emergency fund', 'yellow'],
                ['Aggressive', '$3,000–$5,000', 'Minimum — 2 months expenses only', 'red'],
              ].map(([level, amount, covers, status], i) => (
                <tr key={i} className="border-b border-slate-50 dark:border-slate-700/50">
                  <td className="py-2"><StatusBadge status={status}>{level}</StatusBadge></td>
                  <td className="py-2 text-right font-medium text-slate-900 dark:text-slate-100">{amount}</td>
                  <td className="py-2 pl-4 text-slate-600 dark:text-slate-400 text-xs">{covers}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-3 text-sm">
          <span className="text-slate-600 dark:text-slate-400">Your current reserve: </span>
          <span className={`font-bold ${reserveCash >= 10000 ? 'text-green-600 dark:text-green-400' : reserveCash >= 5000 ? 'text-yellow-600 dark:text-yellow-400' : 'text-red-600 dark:text-red-400'}`}>
            {reserveCash ? formatCurrency(reserveCash) : 'Not set'}
          </span>
        </div>
      </Card>
    </div>
  );
}
