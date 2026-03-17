import { useProperty } from '../store/PropertyContext';
import Card from '../components/Card';
import StatusBadge from '../components/StatusBadge';
import { CheckCircle2, Circle } from 'lucide-react';

const thirtyDayChecklist = [
  { key: 'pm_selected', label: 'Property manager selected and under contract' },
  { key: 'pm_keys', label: 'Spare keys / access codes provided to PM' },
  { key: 'insurance_converted', label: 'Insurance converted to landlord policy (DP-3)' },
  { key: 'homestead_filed', label: 'Homestead exemption removal filed with county' },
  { key: 'cpa_consulted', label: 'CPA consulted on rental conversion and depreciation' },
  { key: 'lease_ready', label: 'Lease template ready (FL-compliant)' },
  { key: 'bank_account', label: 'Rental bank account set up' },
  { key: 'reserve_funded', label: 'Reserve fund established ($5K–$10K recommended)' },
  { key: 'hoa_notified', label: 'HOA notified of rental plans and approval obtained' },
  { key: 'rent_price_set', label: 'Market rent price researched and set' },
  { key: 'photos_taken', label: 'Property photos and video walkthrough recorded' },
  { key: 'listing_ready', label: 'Listing description drafted' },
  { key: 'disclosures_ready', label: 'FL required disclosures prepared' },
  { key: 'utilities_plan', label: 'Utility transfer plan established' },
  { key: 'mail_forwarded', label: 'Mail forwarding set up' },
  { key: 'emergency_contacts', label: 'Local emergency contacts list created' },
  { key: 'vendor_list', label: 'Trusted vendor list provided to PM (plumber, electrician, HVAC, etc.)' },
  { key: 'security_deposit_bank', label: 'Security deposit holding account identified' },
  { key: 'va_coe_obtained', label: 'VA COE obtained and entitlement calculated' },
];

const sevenDayChecklist = [
  { key: 'final_inspection', label: 'Final walkthrough / property inspection completed' },
  { key: 'move_in_photos', label: 'Pre-tenant condition photos taken (timestamped)' },
  { key: 'cleaning', label: 'Deep cleaning completed' },
  { key: 'repairs_done', label: 'All outstanding repairs completed' },
  { key: 'locks_rekeyed', label: 'Locks rekeyed' },
  { key: 'systems_tested', label: 'All systems tested (HVAC, plumbing, electrical, appliances)' },
  { key: 'filters_replaced', label: 'HVAC filters replaced' },
  { key: 'pest_treatment', label: 'Pest control treatment done' },
  { key: 'yard_maintained', label: 'Yard and exterior in show-ready condition' },
  { key: 'pm_walkthrough', label: 'Final walkthrough with PM' },
  { key: 'garage_cleared', label: 'Garage and storage areas cleared of personal items' },
  { key: 'documents_organized', label: 'All property documents organized and accessible remotely' },
];

const monthlyRemoteReview = [
  'Review PM owner statement',
  'Verify rent collected and deposited',
  'Review maintenance charges',
  'Check reserve fund balance',
  'Review any tenant issues or complaints',
  'Confirm insurance policies current',
  'Check upcoming lease expirations',
  'Review property tax status',
  'Update this dashboard with latest data',
  'Check local market rent trends (annually)',
];

export default function PCSReadiness() {
  const { state, dispatch } = useProperty();
  const pcsData = state.documents?.pcsReadiness || {};

  const toggle = (key) => {
    dispatch({
      type: 'SET_FIELD',
      section: 'documents',
      field: 'pcsReadiness',
      value: { ...pcsData, [key]: pcsData[key] ? null : { done: true, date: new Date().toISOString().split('T')[0] } },
    });
  };

  const thirtyDayComplete = thirtyDayChecklist.filter(i => pcsData[i.key]?.done).length;
  const sevenDayComplete = sevenDayChecklist.filter(i => pcsData[i.key]?.done).length;

  const pcsDate = state.operations?.expectedPCSDate;
  const daysUntilPCS = pcsDate ? Math.ceil((new Date(pcsDate) - new Date()) / (1000 * 60 * 60 * 24)) : null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">PCS Readiness</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Module 14 — 30-day PCS prep, 7-day handoff, and remote owner checklist</p>
        </div>
        {daysUntilPCS !== null && (
          <div className={`px-4 py-2 rounded-xl text-center ${daysUntilPCS <= 30 ? 'bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700' : 'bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700'}`}>
            <p className={`text-2xl font-bold ${daysUntilPCS <= 30 ? 'text-red-700 dark:text-red-400' : 'text-blue-700 dark:text-blue-400'}`}>{daysUntilPCS > 0 ? daysUntilPCS : 'Past'}</p>
            <p className={`text-xs ${daysUntilPCS <= 30 ? 'text-red-600 dark:text-red-400' : 'text-blue-600 dark:text-blue-400'}`}>days until PCS</p>
          </div>
        )}
      </div>

      {/* PCS Info */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-4">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Current Station</p>
          <p className="text-sm font-bold text-slate-900 dark:text-slate-100 mt-1">{state.operations?.currentDutyStation || '—'}</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-4">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Next Station</p>
          <p className="text-sm font-bold text-slate-900 dark:text-slate-100 mt-1">{state.operations?.nextDutyStation || '—'}</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-4">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">PCS Date</p>
          <p className="text-sm font-bold text-slate-900 dark:text-slate-100 mt-1">{pcsDate || '—'}</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-4">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">CONUS/OCONUS</p>
          <p className="text-sm font-bold text-slate-900 dark:text-slate-100 mt-1">{state.operations?.oconusOrConus || '—'}</p>
        </div>
      </div>

      {/* 30-Day Checklist */}
      <Card title={`30-Day PCS Prep (${thirtyDayComplete}/${thirtyDayChecklist.length})`}
        status={thirtyDayComplete === thirtyDayChecklist.length ? 'green' : thirtyDayComplete > 0 ? 'yellow' : 'red'}>
        <div className="space-y-1">
          {thirtyDayChecklist.map(item => {
            const isDone = pcsData[item.key]?.done;
            return (
              <button key={item.key} onClick={() => toggle(item.key)}
                className="w-full flex items-center gap-3 py-2 px-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors text-left min-h-[44px]">
                {isDone ? <CheckCircle2 size={20} className="text-green-500 flex-shrink-0" /> : <Circle size={20} className="text-slate-300 dark:text-slate-600 flex-shrink-0" />}
                <span className={`text-sm flex-1 ${isDone ? 'text-slate-400 dark:text-slate-500 line-through' : 'text-slate-700 dark:text-slate-300'}`}>{item.label}</span>
                {isDone && pcsData[item.key]?.date && <span className="text-xs text-slate-400 dark:text-slate-500">{pcsData[item.key].date}</span>}
              </button>
            );
          })}
        </div>
      </Card>

      {/* 7-Day Checklist */}
      <Card title={`7-Day Handoff (${sevenDayComplete}/${sevenDayChecklist.length})`}
        status={sevenDayComplete === sevenDayChecklist.length ? 'green' : sevenDayComplete > 0 ? 'yellow' : 'red'}>
        <div className="space-y-1">
          {sevenDayChecklist.map(item => {
            const isDone = pcsData[item.key]?.done;
            return (
              <button key={item.key} onClick={() => toggle(item.key)}
                className="w-full flex items-center gap-3 py-2 px-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors text-left min-h-[44px]">
                {isDone ? <CheckCircle2 size={20} className="text-green-500 flex-shrink-0" /> : <Circle size={20} className="text-slate-300 dark:text-slate-600 flex-shrink-0" />}
                <span className={`text-sm flex-1 ${isDone ? 'text-slate-400 dark:text-slate-500 line-through' : 'text-slate-700 dark:text-slate-300'}`}>{item.label}</span>
                {isDone && pcsData[item.key]?.date && <span className="text-xs text-slate-400 dark:text-slate-500">{pcsData[item.key].date}</span>}
              </button>
            );
          })}
        </div>
      </Card>

      {/* Monthly Remote Owner Review */}
      <Card title="Monthly Remote Owner Review Template">
        <div className="space-y-3 text-sm">
          <p className="text-slate-500 dark:text-slate-400 text-xs">Use this template each month after PCS to stay on top of your property remotely.</p>
          <ol className="space-y-2">
            {monthlyRemoteReview.map((item, i) => (
              <li key={i} className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                <span className="w-5 h-5 rounded border border-slate-300 dark:border-slate-600 flex items-center justify-center text-xs flex-shrink-0">{i + 1}</span>
                {item}
              </li>
            ))}
          </ol>
        </div>
      </Card>
    </div>
  );
}
