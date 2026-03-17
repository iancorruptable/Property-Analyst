import { useProperty } from '../store/PropertyContext';
import Card from '../components/Card';
import FormField from '../components/FormField';
import StatusBadge from '../components/StatusBadge';
import { formatCurrency, parseCurrency } from '../utils/calculations';

const screeningChecklist = [
  'Credit check completed',
  'Background check completed',
  'Income verification (3x rent)',
  'Rental history verified (2+ years)',
  'Employment verification',
  'References contacted',
  'Pet screening (if applicable)',
  'ID verification',
];

const moveInChecklist = [
  'Lease signed by all parties',
  'Security deposit collected',
  'First month rent collected',
  'Move-in inspection completed (with photos)',
  'Keys / access devices provided',
  'Utility transfer confirmed',
  'Emergency contact obtained',
  'Tenant handbook / welcome packet provided',
  'Renter\'s insurance proof obtained',
  'HOA registration (if required)',
];

const moveOutChecklist = [
  'Written move-out notice received',
  'Pre-move-out inspection scheduled',
  'Move-out inspection completed (with photos)',
  'Key return confirmed',
  'Security deposit disposition letter sent',
  'Deposit returned / deductions documented',
  'Utilities transferred back to owner',
  'Property cleaned and repaired',
  'Locks rekeyed',
  'Unit re-listed (if re-renting)',
];

export default function TenantLifecycle() {
  const { state, dispatch } = useProperty();
  const tenant = state.tenant || {};
  const update = (field, value) => dispatch({ type: 'SET_FIELD', section: 'tenant', field, value });

  const leaseStart = tenant.leaseStart ? new Date(tenant.leaseStart) : null;
  const leaseEnd = tenant.leaseEnd ? new Date(tenant.leaseEnd) : null;
  const today = new Date();
  const daysUntilExpiry = leaseEnd ? Math.ceil((leaseEnd - today) / (1000 * 60 * 60 * 24)) : null;

  const toggleChecklist = (listName, index) => {
    const list = tenant[listName] || [];
    const newList = [...list];
    newList[index] = !newList[index];
    update(listName, newList);
  };

  const getChecklistProgress = (listName, total) => {
    const list = tenant[listName] || [];
    return list.filter(Boolean).length;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Tenant Lifecycle</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Module 11 — Screening, lease, payments, maintenance, and move-out</p>
      </div>

      {/* Tenant Status */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-4">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Status</p>
          <p className="text-lg font-bold text-slate-900 dark:text-slate-100 mt-1 capitalize">{tenant.status || 'No Tenant'}</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-4">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Monthly Rent</p>
          <p className="text-lg font-bold text-slate-900 dark:text-slate-100 mt-1">{tenant.rentAmount ? formatCurrency(tenant.rentAmount) : '—'}</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-4">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Lease Ends</p>
          <p className="text-lg font-bold text-slate-900 dark:text-slate-100 mt-1">{tenant.leaseEnd || '—'}</p>
        </div>
        <div className={`bg-white dark:bg-slate-800 rounded-xl shadow-sm border p-4 ${daysUntilExpiry !== null && daysUntilExpiry < 60 ? 'border-red-200 dark:border-red-700' : 'border-slate-200 dark:border-slate-700'}`}>
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Days Until Expiry</p>
          <p className={`text-lg font-bold mt-1 ${daysUntilExpiry !== null && daysUntilExpiry < 60 ? 'text-red-600 dark:text-red-400' : 'text-slate-900 dark:text-slate-100'}`}>
            {daysUntilExpiry !== null ? (daysUntilExpiry > 0 ? daysUntilExpiry : 'Expired') : '—'}
          </p>
        </div>
      </div>

      {/* Tenant Info */}
      <Card title="Tenant Information">
        <div className="grid sm:grid-cols-2 gap-4">
          <FormField label="Tenant Name" value={tenant.name} onChange={v => update('name', v)} />
          <FormField label="Phone" value={tenant.phone} onChange={v => update('phone', v)} />
          <FormField label="Email" value={tenant.email} onChange={v => update('email', v)} />
          <FormField label="Status" type="select" value={tenant.status} onChange={v => update('status', v)} options={['screening', 'approved', 'active', 'month-to-month', 'notice-given', 'moved-out']} />
          <FormField label="Lease Start" type="date" value={tenant.leaseStart} onChange={v => update('leaseStart', v)} />
          <FormField label="Lease End" type="date" value={tenant.leaseEnd} onChange={v => update('leaseEnd', v)} />
          <FormField label="Monthly Rent" prefix="$" value={tenant.rentAmount} onChange={v => update('rentAmount', v)} />
          <FormField label="Security Deposit" prefix="$" value={tenant.securityDeposit} onChange={v => update('securityDeposit', v)} />
          <FormField label="Pet Deposit" prefix="$" value={tenant.petDeposit} onChange={v => update('petDeposit', v)} />
          <FormField label="Pet Description" value={tenant.petDescription} onChange={v => update('petDescription', v)} />
          <FormField label="Emergency Contact" value={tenant.emergencyContact} onChange={v => update('emergencyContact', v)} />
          <FormField label="Notes" type="textarea" value={tenant.notes} onChange={v => update('notes', v)} />
        </div>
      </Card>

      {/* Screening Checklist */}
      <Card title={`Screening Checklist (${getChecklistProgress('screeningChecklist', screeningChecklist.length)}/${screeningChecklist.length})`}
        status={getChecklistProgress('screeningChecklist', screeningChecklist.length) === screeningChecklist.length ? 'green' : 'yellow'}>
        <div className="space-y-1">
          {screeningChecklist.map((item, i) => (
            <button key={i} onClick={() => toggleChecklist('screeningChecklist', i)}
              className="w-full flex items-center gap-3 py-2 px-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors text-left min-h-[44px]">
              <span className={`w-5 h-5 rounded border flex items-center justify-center text-xs ${(tenant.screeningChecklist || [])[i] ? 'bg-green-500 border-green-500 text-white' : 'border-slate-300 dark:border-slate-600'}`}>
                {(tenant.screeningChecklist || [])[i] ? '✓' : ''}
              </span>
              <span className={`text-sm ${(tenant.screeningChecklist || [])[i] ? 'text-slate-400 dark:text-slate-500 line-through' : 'text-slate-700 dark:text-slate-300'}`}>{item}</span>
            </button>
          ))}
        </div>
      </Card>

      {/* Move-in Checklist */}
      <Card title={`Move-In Checklist (${getChecklistProgress('moveInChecklist', moveInChecklist.length)}/${moveInChecklist.length})`}
        status={getChecklistProgress('moveInChecklist', moveInChecklist.length) === moveInChecklist.length ? 'green' : 'yellow'}>
        <div className="space-y-1">
          {moveInChecklist.map((item, i) => (
            <button key={i} onClick={() => toggleChecklist('moveInChecklist', i)}
              className="w-full flex items-center gap-3 py-2 px-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors text-left min-h-[44px]">
              <span className={`w-5 h-5 rounded border flex items-center justify-center text-xs ${(tenant.moveInChecklist || [])[i] ? 'bg-green-500 border-green-500 text-white' : 'border-slate-300 dark:border-slate-600'}`}>
                {(tenant.moveInChecklist || [])[i] ? '✓' : ''}
              </span>
              <span className={`text-sm ${(tenant.moveInChecklist || [])[i] ? 'text-slate-400 dark:text-slate-500 line-through' : 'text-slate-700 dark:text-slate-300'}`}>{item}</span>
            </button>
          ))}
        </div>
      </Card>

      {/* Move-out Checklist */}
      <Card title={`Move-Out Checklist (${getChecklistProgress('moveOutChecklist', moveOutChecklist.length)}/${moveOutChecklist.length})`}
        status={getChecklistProgress('moveOutChecklist', moveOutChecklist.length) === moveOutChecklist.length ? 'green' : 'yellow'}>
        <div className="space-y-1">
          {moveOutChecklist.map((item, i) => (
            <button key={i} onClick={() => toggleChecklist('moveOutChecklist', i)}
              className="w-full flex items-center gap-3 py-2 px-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors text-left min-h-[44px]">
              <span className={`w-5 h-5 rounded border flex items-center justify-center text-xs ${(tenant.moveOutChecklist || [])[i] ? 'bg-green-500 border-green-500 text-white' : 'border-slate-300 dark:border-slate-600'}`}>
                {(tenant.moveOutChecklist || [])[i] ? '✓' : ''}
              </span>
              <span className={`text-sm ${(tenant.moveOutChecklist || [])[i] ? 'text-slate-400 dark:text-slate-500 line-through' : 'text-slate-700 dark:text-slate-300'}`}>{item}</span>
            </button>
          ))}
        </div>
      </Card>

      {/* Renewal Guide */}
      <Card title="Lease Renewal Guide">
        <div className="space-y-3 text-sm">
          {daysUntilExpiry !== null && daysUntilExpiry <= 90 && daysUntilExpiry > 0 && (
            <div className="bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-700 rounded-lg p-3 text-yellow-800 dark:text-yellow-300">
              Lease expires in {daysUntilExpiry} days — begin renewal discussions now.
            </div>
          )}
          <ul className="space-y-1.5 text-slate-700 dark:text-slate-300">
            <li>• Start renewal conversation 90 days before expiry</li>
            <li>• Review market rents and adjust if needed</li>
            <li>• Send formal renewal offer 60 days before expiry</li>
            <li>• If not renewing, give 60-day non-renewal notice</li>
            <li>• Update lease terms, addendums as needed</li>
            <li>• Review and adjust rent annually (FL has no rent control)</li>
          </ul>
        </div>
      </Card>
    </div>
  );
}
