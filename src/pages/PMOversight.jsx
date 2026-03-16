import { useProperty } from '../store/PropertyContext';
import Card from '../components/Card';
import FormField from '../components/FormField';
import StatusBadge from '../components/StatusBadge';

const interviewQuestions = [
  'How many single-family rentals do you currently manage in this area?',
  'What is your management fee structure? (monthly %, leasing fee, renewal fee)',
  'How do you handle maintenance requests and what is the spending authorization limit?',
  'What is your tenant screening process and criteria?',
  'How do you handle evictions? What is the typical cost?',
  'What property management software do you use? Do owners get portal access?',
  'How often do you perform property inspections?',
  'What is your process for rent increases at renewal?',
  'How do you market vacant properties? What platforms do you list on?',
  'Can you provide references from other military/remote owners?',
  'What is your average vacancy rate and days on market?',
  'What happens if I want to terminate the management agreement?',
];

const redFlags = [
  'No written management agreement',
  'Cannot provide references',
  'Commingling owner funds with operating account',
  'No online portal for owners',
  'Resistance to regular property inspections',
  'Unusually low management fees (below 8%)',
  'No clear maintenance spending limits',
  'No regular financial reporting schedule',
  'Poor online reviews or BBB complaints',
  'No errors & omissions (E&O) insurance',
];

const monthlyReview = [
  'Review owner statement for accuracy',
  'Verify rent collected matches lease amount',
  'Check maintenance charges — reasonable?',
  'Confirm reserve balance is adequate',
  'Review any vacancy / marketing activity',
  'Check lease expiration dates approaching',
  'Review tenant complaints or issues',
  'Verify insurance compliance',
];

const scorecardMetrics = [
  { key: 'communication', label: 'Communication & Responsiveness' },
  { key: 'tenantScreening', label: 'Tenant Screening Quality' },
  { key: 'maintenance', label: 'Maintenance Handling' },
  { key: 'financialReporting', label: 'Financial Reporting Accuracy' },
  { key: 'vacancyTime', label: 'Vacancy & Turnover Time' },
  { key: 'leaseEnforcement', label: 'Lease Enforcement' },
  { key: 'inspections', label: 'Property Inspections' },
  { key: 'transparency', label: 'Transparency & Trust' },
  { key: 'overall', label: 'Overall Satisfaction' },
];

export default function PMOversight() {
  const { state, dispatch } = useProperty();
  const pm = state.propertyManager || {};

  const update = (field, value) => dispatch({ type: 'SET_FIELD', section: 'propertyManager', field, value });

  const avgScore = scorecardMetrics.reduce((sum, m) => sum + (parseInt(pm[m.key]) || 0), 0) / scorecardMetrics.filter(m => pm[m.key]).length || 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Property Manager Oversight</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Module 10 — PM scorecard, interview guide, and monthly review</p>
      </div>

      {/* PM Info */}
      <Card title="Property Manager Information">
        <div className="grid sm:grid-cols-2 gap-4">
          <FormField label="Company Name" value={pm.companyName} onChange={v => update('companyName', v)} />
          <FormField label="Contact Name" value={pm.contactName} onChange={v => update('contactName', v)} />
          <FormField label="Phone" value={pm.phone} onChange={v => update('phone', v)} />
          <FormField label="Email" value={pm.email} onChange={v => update('email', v)} />
          <FormField label="Website" value={pm.website} onChange={v => update('website', v)} />
          <FormField label="Contract Start" type="date" value={pm.contractStart} onChange={v => update('contractStart', v)} />
          <FormField label="Contract End" type="date" value={pm.contractEnd} onChange={v => update('contractEnd', v)} />
          <FormField label="Management Fee %" suffix="%" value={pm.feePercent} onChange={v => update('feePercent', v)} />
          <FormField label="Leasing Fee" value={pm.leasingFee} onChange={v => update('leasingFee', v)} placeholder="50% of first month, $500, etc." />
          <FormField label="Maintenance Spend Limit" prefix="$" value={pm.maintenanceSpendLimit} onChange={v => update('maintenanceSpendLimit', v)} placeholder="Amount before owner approval needed" />
          <FormField label="Notes" type="textarea" value={pm.notes} onChange={v => update('notes', v)} />
        </div>
      </Card>

      {/* Scorecard */}
      <Card title={`PM Scorecard ${avgScore > 0 ? `(Avg: ${avgScore.toFixed(1)}/5)` : ''}`}
        status={avgScore >= 4 ? 'green' : avgScore >= 3 ? 'yellow' : avgScore > 0 ? 'red' : undefined}>
        <div className="space-y-3">
          <p className="text-xs text-slate-500 dark:text-slate-400">Rate your PM from 1 (poor) to 5 (excellent) on each metric.</p>
          {scorecardMetrics.map(m => (
            <div key={m.key} className="flex items-center justify-between gap-4">
              <span className="text-sm text-slate-700 dark:text-slate-300 flex-1">{m.label}</span>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map(score => (
                  <button
                    key={score}
                    onClick={() => update(m.key, score)}
                    className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                      parseInt(pm[m.key]) === score
                        ? score >= 4 ? 'bg-green-500 text-white' : score >= 3 ? 'bg-yellow-500 text-white' : 'bg-red-500 text-white'
                        : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600'
                    }`}
                  >
                    {score}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Card>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Interview Questions */}
        <Card title="PM Interview Questions">
          <ol className="space-y-2">
            {interviewQuestions.map((q, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300">
                <span className="text-xs font-bold text-slate-400 dark:text-slate-500 mt-0.5 w-5 flex-shrink-0">{i + 1}.</span>
                <span>{q}</span>
              </li>
            ))}
          </ol>
        </Card>

        {/* Red Flags */}
        <Card title="Red Flags to Watch For" status="red">
          <ul className="space-y-2">
            {redFlags.map((flag, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300">
                <span className="text-red-500 mt-0.5 flex-shrink-0">⚠</span>
                <span>{flag}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      {/* Monthly Review Checklist */}
      <Card title="Monthly Owner Review Checklist">
        <div className="space-y-3 text-sm">
          <p className="text-slate-500 dark:text-slate-400 text-xs">Review these items each month when you receive your PM statement.</p>
          <ul className="space-y-2">
            {monthlyReview.map((item, i) => (
              <li key={i} className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                <span className="w-5 h-5 rounded border border-slate-300 dark:border-slate-600 flex items-center justify-center text-xs flex-shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </Card>

      {/* Fee Comparison */}
      <Card title="Typical PM Fee Structure (NW Florida)">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left py-2 text-slate-600 dark:text-slate-400 font-medium">Fee Type</th>
                <th className="text-left py-2 text-slate-600 dark:text-slate-400 font-medium">Typical Range</th>
                <th className="text-left py-2 text-slate-600 dark:text-slate-400 font-medium">Notes</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['Monthly Management', '8–10%', 'Of collected rent'],
                ['Leasing / Placement', '50–100%', 'Of first month rent'],
                ['Lease Renewal', '$0–$300', 'Some charge, some don\'t'],
                ['Maintenance Markup', '0–15%', 'On vendor invoices'],
                ['Eviction Coordination', '$200–$500', 'Plus legal costs'],
                ['Early Termination', '1–3 months', 'Management fee penalty'],
              ].map(([type, range, notes], i) => (
                <tr key={i} className="border-b border-slate-50 dark:border-slate-700/50">
                  <td className="py-2 text-slate-700 dark:text-slate-300 font-medium">{type}</td>
                  <td className="py-2 text-slate-900 dark:text-slate-100">{range}</td>
                  <td className="py-2 text-slate-500 dark:text-slate-400 text-xs">{notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
