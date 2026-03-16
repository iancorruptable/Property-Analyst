import { useProperty } from '../store/PropertyContext';
import Card from '../components/Card';
import StatusBadge from '../components/StatusBadge';
import { formatCurrency, parseCurrency, calcVAEntitlement, calcDownPayment } from '../utils/calculations';

export default function VATracker() {
  const { state } = useProperty();
  const originalLoan = parseCurrency(state.mortgage.originalLoanAmount);
  const countyLimit = 766550; // 2026 standard conforming limit

  const va = originalLoan > 0 ? calcVAEntitlement(originalLoan, countyLimit) : null;

  const futurePrices = [250000, 300000, 350000, 400000, 450000, 500000, 550000, 600000];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">VA Entitlement Tracker</h1>
        <p className="text-sm text-slate-500 mt-1">Module 3 — Track VA benefit usage and future buying power</p>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-sm text-yellow-800">
        <strong>Important:</strong> VA entitlement calculations are estimates only. Always confirm with your COE and a VA-approved lender before making purchase decisions.
      </div>

      {/* Current VA Loan */}
      <Card title="Current VA Loan on This Property" status={originalLoan > 0 ? 'green' : 'red'}>
        <div className="grid sm:grid-cols-2 gap-4">
          {[
            { label: 'VA Loan Used', value: state.mortgage.isVaLoan ? 'Yes' : 'Unknown', status: state.mortgage.isVaLoan ? 'green' : 'yellow' },
            { label: 'Original Loan Amount', value: originalLoan > 0 ? formatCurrency(originalLoan) : 'Missing' },
            { label: 'Current Balance', value: parseCurrency(state.mortgage.currentBalance) > 0 ? formatCurrency(state.mortgage.currentBalance) : 'Missing' },
            { label: 'COE Available', value: state.vaBenefit.hasCOE === 'yes' ? 'Yes' : state.vaBenefit.hasCOE || 'Unknown', status: state.vaBenefit.hasCOE === 'yes' ? 'green' : 'red' },
            { label: 'Entitlement Charged', value: state.vaBenefit.entitlementCharged ? formatCurrency(state.vaBenefit.entitlementCharged) : va ? formatCurrency(va.entitlementCharged) + ' (est.)' : 'Missing' },
            { label: 'Disability Rating', value: state.vaBenefit.disabilityRating === 'yes' ? `Yes (${state.vaBenefit.disabilityPercent || '?'}%)` : state.vaBenefit.disabilityRating || 'Unknown' },
          ].map(item => (
            <div key={item.label} className="flex justify-between items-center py-2 border-b border-slate-50">
              <span className="text-sm text-slate-600">{item.label}</span>
              <span className="text-sm font-medium text-slate-900 flex items-center gap-2">
                {item.value}
                {item.status && <StatusBadge status={item.status}>{item.status === 'green' ? '✓' : '!'}</StatusBadge>}
              </span>
            </div>
          ))}
        </div>
      </Card>

      {/* Entitlement Calculation */}
      <Card title="Entitlement Calculation" status={va ? 'green' : 'red'}>
        {va ? (
          <div className="space-y-3">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-2 text-slate-600 font-medium">Step</th>
                    <th className="text-left py-2 text-slate-600 font-medium">Formula</th>
                    <th className="text-right py-2 text-slate-600 font-medium">Value</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-slate-50">
                    <td className="py-2 text-slate-700">A. Original VA Loan</td>
                    <td className="py-2 text-slate-500">Input</td>
                    <td className="py-2 text-right font-medium">{formatCurrency(originalLoan)}</td>
                  </tr>
                  <tr className="border-b border-slate-50">
                    <td className="py-2 text-slate-700">B. Entitlement Charged</td>
                    <td className="py-2 text-slate-500">25% x A</td>
                    <td className="py-2 text-right font-medium">{formatCurrency(va.entitlementCharged)}</td>
                  </tr>
                  <tr className="border-b border-slate-50">
                    <td className="py-2 text-slate-700">C. County Loan Limit (2026)</td>
                    <td className="py-2 text-slate-500">Standard</td>
                    <td className="py-2 text-right font-medium">{formatCurrency(countyLimit)}</td>
                  </tr>
                  <tr className="border-b border-slate-50">
                    <td className="py-2 text-slate-700">D. Max Guaranty</td>
                    <td className="py-2 text-slate-500">25% x C</td>
                    <td className="py-2 text-right font-medium">{formatCurrency(va.maxGuaranty)}</td>
                  </tr>
                  <tr className="border-b border-slate-50 bg-blue-50">
                    <td className="py-2 text-blue-800 font-semibold">E. Remaining Entitlement</td>
                    <td className="py-2 text-blue-600">D - B</td>
                    <td className="py-2 text-right font-bold text-blue-800">{formatCurrency(va.remaining)}</td>
                  </tr>
                  <tr className="bg-green-50">
                    <td className="py-2 text-green-800 font-semibold">F. Zero-Down Buying Power</td>
                    <td className="py-2 text-green-600">E x 4</td>
                    <td className="py-2 text-right font-bold text-green-800">{formatCurrency(va.zeroDownPower)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <p className="text-sm text-slate-500 text-center py-4">Enter your original VA loan amount in the Intake Form to calculate entitlement.</p>
        )}
      </Card>

      {/* Scenario Table */}
      <Card title="Future Home Purchase Scenarios (Keep Current Home + Buy Another)">
        {va ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-2 text-slate-600 font-medium">Future Price</th>
                  <th className="text-right py-2 text-slate-600 font-medium">Zero-Down?</th>
                  <th className="text-right py-2 text-slate-600 font-medium">Est. Down Payment</th>
                  <th className="text-left py-2 pl-4 text-slate-600 font-medium">Notes</th>
                </tr>
              </thead>
              <tbody>
                {futurePrices.map(price => {
                  const dp = calcDownPayment(price, va.zeroDownPower);
                  const zeroDown = dp === 0;
                  return (
                    <tr key={price} className="border-b border-slate-50">
                      <td className="py-2 text-slate-700 font-medium">{formatCurrency(price)}</td>
                      <td className="py-2 text-right">
                        <StatusBadge status={zeroDown ? 'green' : 'yellow'}>
                          {zeroDown ? 'Yes' : 'No'}
                        </StatusBadge>
                      </td>
                      <td className="py-2 text-right font-medium">
                        {dp > 0 ? formatCurrency(dp) : '$0'}
                      </td>
                      <td className="py-2 pl-4 text-xs text-slate-500">
                        {zeroDown ? 'Within remaining entitlement' : `25% of amount above ${formatCurrency(va.zeroDownPower)}`}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-slate-500 text-center py-4">Enter loan data to see scenarios.</p>
        )}
      </Card>

      {/* Scenario Comparison */}
      <div className="grid lg:grid-cols-3 gap-4">
        <Card title="Sell + Restore Entitlement">
          <div className="space-y-2 text-sm">
            <p className="text-slate-600">If you sell and pay off the loan:</p>
            <ul className="space-y-1 text-slate-700">
              <li>• Full entitlement restored</li>
              <li>• Zero-down up to ~{formatCurrency(countyLimit)}</li>
              <li>• One-time restoration available</li>
            </ul>
            <div className="mt-3 p-2 bg-green-50 rounded text-green-800 font-medium text-center">
              Full buying power: {formatCurrency(countyLimit)}
            </div>
          </div>
        </Card>

        <Card title="Refinance (IRRRL)">
          <div className="space-y-2 text-sm">
            <p className="text-slate-600">VA IRRRL refinance:</p>
            <ul className="space-y-1 text-slate-700">
              <li>• No entitlement change</li>
              <li>• Remaining buying power unchanged</li>
              <li>• May lower monthly payment</li>
              <li>• Must show net tangible benefit</li>
            </ul>
            <div className="mt-3 p-2 bg-yellow-50 rounded text-yellow-800 font-medium text-center">
              Entitlement: No change
            </div>
          </div>
        </Card>

        <Card title="Use Partial Entitlement">
          <div className="space-y-2 text-sm">
            <p className="text-slate-600">Buy second home with remaining:</p>
            <ul className="space-y-1 text-slate-700">
              <li>• Must occupy as primary residence</li>
              <li>• May need down payment</li>
              <li>• Must qualify for both payments (DTI)</li>
              <li>• Lender must approve</li>
            </ul>
            <div className="mt-3 p-2 bg-blue-50 rounded text-blue-800 font-medium text-center">
              Zero-down up to: {va ? formatCurrency(va.zeroDownPower) : '—'}
            </div>
          </div>
        </Card>
      </div>

      {/* Action Items */}
      <Card title="Action Items">
        <div className="space-y-2">
          {[
            { action: 'Obtain current COE from eBenefits / VA portal', done: state.vaBenefit.hasCOE === 'yes', priority: 'red' },
            { action: 'Record original VA loan amount from closing docs', done: originalLoan > 0, priority: 'red' },
            { action: 'Record current loan balance', done: parseCurrency(state.mortgage.currentBalance) > 0, priority: 'red' },
            { action: 'Identify target county for next home', done: !!state.vaBenefit.targetCounty, priority: 'yellow' },
            { action: 'Speak with VA-approved lender about second-use scenarios', done: false, priority: 'yellow' },
            { action: 'Check if one-time restoration has been previously used', done: state.vaBenefit.previousRestoration === 'no', priority: 'yellow' },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-3 py-1.5">
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs ${item.done ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-400'}`}>
                {item.done ? '✓' : i + 1}
              </span>
              <span className={`text-sm flex-1 ${item.done ? 'text-slate-400 line-through' : 'text-slate-700'}`}>{item.action}</span>
              {!item.done && <StatusBadge status={item.priority}>{item.priority === 'red' ? 'Urgent' : 'Soon'}</StatusBadge>}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
