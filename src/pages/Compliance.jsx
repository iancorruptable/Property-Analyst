import Card from '../components/Card';
import StatusBadge from '../components/StatusBadge';
import { useProperty } from '../store/PropertyContext';
import { CheckCircle2, Circle, ExternalLink } from 'lucide-react';

const disclosures = [
  { key: 'leadPaint', label: 'Lead-based paint disclosure (pre-1978 homes)', required: true },
  { key: 'radon', label: 'Radon gas disclosure (FL Statute 404.056)', required: true },
  { key: 'mold', label: 'Mold disclosure', required: false },
  { key: 'hoa', label: 'HOA disclosure and governing documents', required: true },
  { key: 'floodZone', label: 'Flood zone notification', required: false },
  { key: 'securityDeposit', label: 'Security deposit holding notice (FL 83.49)', required: true },
  { key: 'fireProtection', label: 'Fire protection / smoke detector disclosure', required: true },
];

const landlordObligations = [
  { category: 'Security Deposit', items: [
    'Hold in FL bank (separate or surety bond)',
    'Notify tenant of bank name & whether interest-bearing within 30 days',
    'Return within 15 days (no claim) or 30 days (with claim) after move-out',
    'Send claim letter via certified mail',
    'Cannot commingle with personal funds',
  ]},
  { category: 'Property Maintenance (FL 83.51)', items: [
    'Comply with building, housing, and health codes',
    'Maintain roof, windows, doors, floors, steps, porches',
    'Maintain plumbing in reasonable working condition',
    'Provide reasonable heat, running water, hot water',
    'Maintain common areas',
    'Provide garbage receptacles and removal',
    'Provide functioning smoke detectors',
    'Extermination of pests (excluding bed bugs in some cases)',
  ]},
  { category: 'Tenant Rights', items: [
    'Right to 12-hour notice before landlord entry (except emergency)',
    'Right to withhold rent if landlord fails to maintain (after 7-day notice)',
    'Right to privacy and quiet enjoyment',
    'Cannot retaliate against tenant for complaints (FL 83.64)',
    'Cannot change locks, remove doors, or shut off utilities as eviction tactic',
  ]},
  { category: 'Eviction Process', items: [
    '3-day notice for non-payment of rent',
    '7-day notice to cure for lease violations',
    '7-day unconditional quit for repeated violations',
    '15-day notice for month-to-month termination',
    'Must file formal eviction through county court',
    'Cannot perform self-help eviction',
  ]},
];

export default function Compliance() {
  const { state, dispatch } = useProperty();
  const complianceData = state.documents?.compliance || {};

  const toggleDisclosure = (key) => {
    const current = complianceData[key];
    dispatch({
      type: 'SET_FIELD',
      section: 'documents',
      field: 'compliance',
      value: { ...complianceData, [key]: current ? null : { done: true, date: new Date().toISOString().split('T')[0] } },
    });
  };

  const completedDisclosures = disclosures.filter(d => complianceData[d.key]?.done).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Florida Compliance</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Module 9 — FL landlord-tenant law, disclosures, and security deposits</p>
      </div>

      <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-xl p-4 text-sm text-blue-800 dark:text-blue-300">
        Based on <strong>Florida Statute Chapter 83, Part II</strong> — Residential Tenancies. This is a summary — consult a FL real estate attorney for legal advice.
      </div>

      {/* Disclosure Checklist */}
      <Card title={`Required Disclosures (${completedDisclosures}/${disclosures.length})`} status={completedDisclosures === disclosures.length ? 'green' : completedDisclosures > 0 ? 'yellow' : 'red'}>
        <div className="space-y-1">
          {disclosures.map(d => {
            const isDone = complianceData[d.key]?.done;
            return (
              <button key={d.key} onClick={() => toggleDisclosure(d.key)} className="w-full flex items-center gap-3 py-2 px-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors text-left min-h-[44px]">
                {isDone ? <CheckCircle2 size={20} className="text-green-500 flex-shrink-0" /> : <Circle size={20} className="text-slate-300 dark:text-slate-600 flex-shrink-0" />}
                <span className={`text-sm flex-1 ${isDone ? 'text-slate-400 dark:text-slate-500 line-through' : 'text-slate-700 dark:text-slate-300'}`}>{d.label}</span>
                {d.required && <StatusBadge status="red">Required</StatusBadge>}
              </button>
            );
          })}
        </div>
      </Card>

      {/* Landlord Obligations */}
      {landlordObligations.map(section => (
        <Card key={section.category} title={section.category}>
          <ul className="space-y-2">
            {section.items.map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300">
                <span className="text-slate-400 dark:text-slate-500 mt-0.5">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </Card>
      ))}

      {/* Key Deadlines */}
      <Card title="Key FL Landlord Deadlines">
        {/* Mobile card view */}
        <div className="block sm:hidden space-y-3">
          {[
            ['30 days after receipt', 'Notify tenant where security deposit is held', '83.49(1)'],
            ['12 hours minimum', 'Written notice before entering unit', '83.53'],
            ['3 days', 'Notice for non-payment of rent', '83.56(3)'],
            ['7 days', 'Notice to cure lease violation', '83.56(2)'],
            ['15 days', 'Notice to terminate month-to-month', '83.57'],
            ['15 days after move-out', 'Return deposit (no claim)', '83.49(3)(a)'],
            ['30 days after move-out', 'Send written claim on deposit', '83.49(3)(a)'],
            ['Annual', 'Homestead exemption filing (if removing)', 'County'],
          ].map(([deadline, action, statute], i) => (
            <div key={i} className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-3 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-900 dark:text-slate-100">{deadline}</span>
                <span className="text-xs text-slate-500 dark:text-slate-400">{statute}</span>
              </div>
              <p className="text-sm text-slate-700 dark:text-slate-300">{action}</p>
            </div>
          ))}
        </div>
        {/* Desktop table view */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left py-2 text-slate-600 dark:text-slate-400 font-medium">Deadline</th>
                <th className="text-left py-2 text-slate-600 dark:text-slate-400 font-medium">Action Required</th>
                <th className="text-left py-2 text-slate-600 dark:text-slate-400 font-medium">Statute</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['30 days after receipt', 'Notify tenant where security deposit is held', '83.49(1)'],
                ['12 hours minimum', 'Written notice before entering unit', '83.53'],
                ['3 days', 'Notice for non-payment of rent', '83.56(3)'],
                ['7 days', 'Notice to cure lease violation', '83.56(2)'],
                ['15 days', 'Notice to terminate month-to-month', '83.57'],
                ['15 days after move-out', 'Return deposit (no claim)', '83.49(3)(a)'],
                ['30 days after move-out', 'Send written claim on deposit', '83.49(3)(a)'],
                ['Annual', 'Homestead exemption filing (if removing)', 'County'],
              ].map(([deadline, action, statute], i) => (
                <tr key={i} className="border-b border-slate-50 dark:border-slate-700/50">
                  <td className="py-2 text-slate-900 dark:text-slate-100 font-medium">{deadline}</td>
                  <td className="py-2 text-slate-700 dark:text-slate-300">{action}</td>
                  <td className="py-2 text-slate-500 dark:text-slate-400">{statute}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
