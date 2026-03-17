import { useProperty } from '../store/PropertyContext';
import Card from '../components/Card';
import FormField from '../components/FormField';
import StatusBadge from '../components/StatusBadge';
import { formatCurrency, parseCurrency } from '../utils/calculations';
import { useState } from 'react';
import { Plus, Trash2, ShieldAlert } from 'lucide-react';

const riskCategories = [
  { risk: 'Hurricane / Wind Damage', severity: 'red', mitigation: 'Windstorm + homeowner policy, hurricane shutters, roof tie-downs' },
  { risk: 'Flood', severity: 'red', mitigation: 'NFIP or private flood policy, know your flood zone' },
  { risk: 'Liability (Slip & Fall)', severity: 'red', mitigation: 'Umbrella policy ($1M+), maintain walkways, lighting' },
  { risk: 'Tenant Non-Payment', severity: 'yellow', mitigation: 'Thorough screening, 3x income requirement, reserve fund' },
  { risk: 'Vacancy', severity: 'yellow', mitigation: 'Competitive pricing, property condition, good PM' },
  { risk: 'Appliance Failure', severity: 'yellow', mitigation: 'CapEx reserve, preventive maintenance, home warranty consideration' },
  { risk: 'Roof Damage', severity: 'yellow', mitigation: 'Annual inspection, age-based insurance pricing, reserve for replacement' },
  { risk: 'Plumbing Failure', severity: 'yellow', mitigation: 'Annual inspection, know pipe material and age' },
  { risk: 'Mold / Water Damage', severity: 'yellow', mitigation: 'Prompt leak repair, humidity control, tenant reporting protocol' },
  { risk: 'Termites / Pest', severity: 'yellow', mitigation: 'Annual termite bond, quarterly pest treatment' },
  { risk: 'HOA Special Assessment', severity: 'yellow', mitigation: 'Review HOA financials, attend meetings, maintain reserves' },
  { risk: 'Property Tax Increase', severity: 'yellow', mitigation: 'Budget for increases after homestead removal, appeal if needed' },
  { risk: 'Insurance Rate Increase', severity: 'yellow', mitigation: 'Shop annually, wind mitigation inspection, roof upgrades' },
  { risk: 'Eviction Cost', severity: 'yellow', mitigation: 'FL-compliant lease, thorough screening, legal fund' },
  { risk: 'Market Decline', severity: 'yellow', mitigation: 'Long-term hold strategy, maintain property condition' },
];

export default function Insurance() {
  const { state, dispatch } = useProperty();
  const policies = state.insurancePolicies || [];
  const t = state.taxesInsurance;

  const [newPolicy, setNewPolicy] = useState({ type: '', carrier: '', policyNumber: '', premium: '', deductible: '', coverageAmount: '', renewalDate: '' });

  const addPolicy = () => {
    if (!newPolicy.type || !newPolicy.carrier) return;
    dispatch({ type: 'ADD_TO_ARRAY', section: 'insurancePolicies', item: { ...newPolicy, id: Date.now() } });
    setNewPolicy({ type: '', carrier: '', policyNumber: '', premium: '', deductible: '', coverageAmount: '', renewalDate: '' });
  };

  const removePolicy = (index) => {
    dispatch({ type: 'REMOVE_FROM_ARRAY', section: 'insurancePolicies', index });
  };

  const totalPremiums = policies.reduce((sum, p) => sum + parseCurrency(p.premium), 0) || (parseCurrency(t.insurancePremium) + parseCurrency(t.floodPremium));

  // Coverage gap analysis
  const gaps = [];
  if (!t.insuranceCarrier) gaps.push('No homeowner/landlord policy on file');
  if (t.hasFloodInsurance === 'no' || !t.hasFloodInsurance) gaps.push('No flood insurance — Navarre has coastal flood exposure');
  if (t.hasUmbrella === 'no' || !t.hasUmbrella) gaps.push('No umbrella liability policy — recommended $1M+ for landlords');
  if (!t.hasSeparateWindstorm || t.hasSeparateWindstorm === 'unknown') gaps.push('Windstorm coverage not verified');
  if (!t.hurricaneDeductible) gaps.push('Hurricane deductible unknown');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Insurance & Risk</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Module 13 — Policy tracker, coverage gaps, and risk register</p>
      </div>

      {/* Coverage Gap Alert */}
      {gaps.length > 0 && (
        <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <ShieldAlert size={18} className="text-red-600 dark:text-red-400" />
            <h3 className="text-sm font-semibold text-red-800 dark:text-red-300">Coverage Gaps Detected</h3>
          </div>
          <ul className="space-y-1">
            {gaps.map((gap, i) => (
              <li key={i} className="text-sm text-red-700 dark:text-red-400 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0" />
                {gap}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-4">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Policies on File</p>
          <p className="text-xl font-bold text-slate-900 dark:text-slate-100 mt-1">{policies.length || (t.insuranceCarrier ? 1 : 0)}</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-4">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Annual Premiums</p>
          <p className="text-xl font-bold text-slate-900 dark:text-slate-100 mt-1">{totalPremiums ? formatCurrency(totalPremiums) : '—'}</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-4">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Monthly Cost</p>
          <p className="text-xl font-bold text-slate-900 dark:text-slate-100 mt-1">{totalPremiums ? formatCurrency(totalPremiums / 12) : '—'}</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-4">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Coverage Gaps</p>
          <p className={`text-xl font-bold mt-1 ${gaps.length > 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>{gaps.length}</p>
        </div>
      </div>

      {/* Current Policies from Intake */}
      <Card title="Current Coverage (from Intake Data)">
        <div className="space-y-2">
          {[
            ['Homeowner Insurance', t.insuranceCarrier, t.insurancePremium ? formatCurrency(t.insurancePremium) + '/yr' : '—'],
            ['Flood Insurance', t.floodCarrier || (t.hasFloodInsurance === 'yes' ? 'On file' : '—'), t.floodPremium ? formatCurrency(t.floodPremium) + '/yr' : '—'],
            ['Flood Zone', t.floodZoneDesignation || 'Unknown', '—'],
            ['Hurricane Deductible', t.hurricaneDeductible || 'Unknown', '—'],
            ['Windstorm Policy', t.hasSeparateWindstorm || 'Unknown', '—'],
            ['Umbrella', t.hasUmbrella === 'yes' ? `Yes (${t.umbrellaAmount ? formatCurrency(t.umbrellaAmount) : '?'})` : t.hasUmbrella || 'Unknown', '—'],
          ].map(([label, value, premium]) => (
            <div key={label} className="flex justify-between items-center py-1 border-b border-slate-50 dark:border-slate-700/50 text-sm">
              <span className="text-slate-600 dark:text-slate-400">{label}</span>
              <div className="text-right">
                <span className="font-medium text-slate-900 dark:text-slate-100">{value}</span>
                {premium !== '—' && <span className="text-xs text-slate-400 dark:text-slate-500 ml-2">{premium}</span>}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Add Policy */}
      <Card title="Additional Policies">
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            <FormField label="Type" type="select" value={newPolicy.type} onChange={v => setNewPolicy(p => ({ ...p, type: v }))} options={['landlord', 'flood', 'umbrella', 'windstorm', 'earthquake', 'renters-required', 'other']} />
            <FormField label="Carrier" value={newPolicy.carrier} onChange={v => setNewPolicy(p => ({ ...p, carrier: v }))} />
            <FormField label="Annual Premium" prefix="$" value={newPolicy.premium} onChange={v => setNewPolicy(p => ({ ...p, premium: v }))} />
            <FormField label="Deductible" prefix="$" value={newPolicy.deductible} onChange={v => setNewPolicy(p => ({ ...p, deductible: v }))} />
            <FormField label="Coverage Amount" prefix="$" value={newPolicy.coverageAmount} onChange={v => setNewPolicy(p => ({ ...p, coverageAmount: v }))} />
            <FormField label="Policy Number" value={newPolicy.policyNumber} onChange={v => setNewPolicy(p => ({ ...p, policyNumber: v }))} />
            <FormField label="Renewal Date" type="date" value={newPolicy.renewalDate} onChange={v => setNewPolicy(p => ({ ...p, renewalDate: v }))} />
          </div>
          <button onClick={addPolicy} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
            <Plus size={16} /> Add Policy
          </button>
        </div>
        {policies.length > 0 && (
          <>
            {/* Mobile cards */}
            <div className="mt-4 block sm:hidden space-y-3">
              {policies.map((pol, i) => (
                <div key={pol.id || i} className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <StatusBadge status="blue">{pol.type}</StatusBadge>
                    <button onClick={() => removePolicy(i)} className="p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center text-slate-400 hover:text-red-500 dark:text-slate-500 dark:hover:text-red-400">
                      <Trash2 size={14} />
                    </button>
                  </div>
                  <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{pol.carrier}</p>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Premium</p>
                      <p className="font-medium text-slate-900 dark:text-slate-100">{pol.premium ? formatCurrency(pol.premium) : '—'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Deductible</p>
                      <p className="text-slate-600 dark:text-slate-400">{pol.deductible ? formatCurrency(pol.deductible) : '—'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Renewal</p>
                      <p className="text-slate-500 dark:text-slate-400">{pol.renewalDate || '—'}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {/* Desktop table */}
            <div className="mt-4 hidden sm:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-700">
                    <th className="text-left py-2 text-slate-600 dark:text-slate-400 font-medium">Type</th>
                    <th className="text-left py-2 text-slate-600 dark:text-slate-400 font-medium">Carrier</th>
                    <th className="text-right py-2 text-slate-600 dark:text-slate-400 font-medium">Premium</th>
                    <th className="text-right py-2 text-slate-600 dark:text-slate-400 font-medium">Deductible</th>
                    <th className="text-left py-2 text-slate-600 dark:text-slate-400 font-medium">Renewal</th>
                    <th className="py-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {policies.map((pol, i) => (
                    <tr key={pol.id || i} className="border-b border-slate-50 dark:border-slate-700/50">
                      <td className="py-2"><StatusBadge status="blue">{pol.type}</StatusBadge></td>
                      <td className="py-2 text-slate-700 dark:text-slate-300">{pol.carrier}</td>
                      <td className="py-2 text-right font-medium text-slate-900 dark:text-slate-100">{pol.premium ? formatCurrency(pol.premium) : '—'}</td>
                      <td className="py-2 text-right text-slate-600 dark:text-slate-400">{pol.deductible ? formatCurrency(pol.deductible) : '—'}</td>
                      <td className="py-2 text-slate-500 dark:text-slate-400">{pol.renewalDate || '—'}</td>
                      <td className="py-2 text-right">
                        <button onClick={() => removePolicy(i)} className="p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center text-slate-400 hover:text-red-500"><Trash2 size={14} /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </Card>

      {/* Risk Register */}
      <Card title="Risk Register">
        {/* Mobile cards */}
        <div className="block sm:hidden space-y-3">
          {riskCategories.map((r, i) => (
            <div key={i} className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-900 dark:text-slate-100">{r.risk}</span>
                <StatusBadge status={r.severity}>{r.severity === 'red' ? 'High' : 'Medium'}</StatusBadge>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400">{r.mitigation}</p>
            </div>
          ))}
        </div>
        {/* Desktop table */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left py-2 text-slate-600 dark:text-slate-400 font-medium">Risk</th>
                <th className="text-left py-2 text-slate-600 dark:text-slate-400 font-medium">Severity</th>
                <th className="text-left py-2 text-slate-600 dark:text-slate-400 font-medium">Mitigation</th>
              </tr>
            </thead>
            <tbody>
              {riskCategories.map((r, i) => (
                <tr key={i} className="border-b border-slate-50 dark:border-slate-700/50">
                  <td className="py-2 text-slate-700 dark:text-slate-300 font-medium">{r.risk}</td>
                  <td className="py-2"><StatusBadge status={r.severity}>{r.severity === 'red' ? 'High' : 'Medium'}</StatusBadge></td>
                  <td className="py-2 text-slate-600 dark:text-slate-400 text-xs">{r.mitigation}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Conversion Reminder */}
      <Card title="Landlord Policy Conversion Checklist">
        <div className="space-y-3 text-sm">
          <div className="bg-yellow-50 dark:bg-yellow-900/30 rounded-lg p-3 text-yellow-800 dark:text-yellow-300 text-xs">
            You must convert your homeowner's policy to a landlord (DP-3) policy before renting. Failure to do so may void coverage.
          </div>
          <ul className="space-y-1.5 text-slate-700 dark:text-slate-300">
            <li>• Contact your insurance carrier about conversion to DP-3 / landlord policy</li>
            <li>• Verify dwelling coverage is adequate for replacement cost</li>
            <li>• Add loss-of-rents coverage (covers rental income during repairs)</li>
            <li>• Consider requiring tenant renter's insurance</li>
            <li>• Review liability limits — minimum $300K, $500K+ preferred</li>
            <li>• Add umbrella policy for additional liability coverage</li>
          </ul>
        </div>
      </Card>
    </div>
  );
}
