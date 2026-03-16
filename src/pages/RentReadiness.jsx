import { useProperty } from '../store/PropertyContext';
import Card from '../components/Card';
import { CheckCircle2, Circle } from 'lucide-react';

const checklistItems = [
  { category: 'Interior Preparation', items: [
    { key: 'cleaning', label: 'Deep cleaning complete' },
    { key: 'paint', label: 'Paint / patching complete' },
    { key: 'carpet', label: 'Carpet cleaned or replaced' },
    { key: 'appliances', label: 'All appliances working' },
    { key: 'hvac', label: 'HVAC serviced / filter replaced' },
    { key: 'plumbing', label: 'Plumbing checked' },
    { key: 'electrical', label: 'Electrical checked (outlets, GFCIs)' },
    { key: 'locks', label: 'Locks rekeyed' },
    { key: 'smoke', label: 'Smoke detectors checked' },
    { key: 'co', label: 'CO detectors (if gas appliances)' },
    { key: 'windows', label: 'Window coverings functional' },
    { key: 'garage', label: 'Garage door opener working' },
  ]},
  { category: 'Exterior / Safety', items: [
    { key: 'roof', label: 'Roof reviewed' },
    { key: 'yard', label: 'Yard condition acceptable' },
    { key: 'pest', label: 'Pest control treatment complete' },
    { key: 'extlights', label: 'Exterior lights working' },
    { key: 'driveway', label: 'Driveway / walkway condition' },
    { key: 'fence', label: 'Fence condition (if applicable)' },
    { key: 'hurricane', label: 'Hurricane shutters / prep ready' },
  ]},
  { category: 'Documentation & Listing', items: [
    { key: 'photos', label: 'Property photos taken' },
    { key: 'video', label: 'Video walkthrough recorded' },
    { key: 'listing', label: 'Rental listing description ready' },
    { key: 'comps', label: 'Rental comps reviewed' },
    { key: 'lease', label: 'Lease template ready (FL-compliant)' },
    { key: 'disclosures', label: 'Required FL disclosures prepared' },
    { key: 'movein', label: 'Move-in inspection template ready' },
    { key: 'utilities', label: 'Utility transfer plan ready' },
  ]},
  { category: 'Financial Readiness', items: [
    { key: 'reserve', label: 'Owner reserve cash set aside' },
    { key: 'insurance', label: 'Insurance converted to landlord policy' },
    { key: 'homestead', label: 'Homestead exemption removal planned' },
    { key: 'pm', label: 'Property manager selected & contracted' },
    { key: 'hoaapproval', label: 'HOA rental approval obtained' },
    { key: 'bankaccount', label: 'Rental bank account set up' },
    { key: 'cpa', label: 'CPA consulted on rental conversion' },
  ]},
];

export default function RentReadiness() {
  const { state, dispatch } = useProperty();
  const readiness = state.rentReadiness || {};

  const toggle = (key) => {
    dispatch({
      type: 'SET_RENT_READINESS',
      key,
      value: readiness[key] ? null : { done: true, date: new Date().toISOString().split('T')[0] }
    });
  };

  const totalItems = checklistItems.reduce((sum, cat) => sum + cat.items.length, 0);
  const completedItems = Object.values(readiness).filter(v => v?.done).length;
  const percent = Math.round((completedItems / totalItems) * 100);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Rent-Readiness Tracker</h1>
          <p className="text-sm text-slate-500 mt-1">Module 6 — Is the property ready to rent?</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-slate-900">{completedItems}/{totalItems}</p>
          <p className="text-xs text-slate-500">{percent}% complete</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
        <div className="w-full bg-slate-200 rounded-full h-3">
          <div
            className={`h-3 rounded-full transition-all duration-500 ${percent === 100 ? 'bg-green-500' : percent > 50 ? 'bg-yellow-500' : 'bg-red-500'}`}
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>

      {/* Checklists */}
      {checklistItems.map(category => {
        const catComplete = category.items.filter(item => readiness[item.key]?.done).length;
        return (
          <Card
            key={category.category}
            title={`${category.category} (${catComplete}/${category.items.length})`}
            status={catComplete === category.items.length ? 'green' : catComplete > 0 ? 'yellow' : 'red'}
          >
            <div className="space-y-1">
              {category.items.map(item => {
                const isDone = readiness[item.key]?.done;
                return (
                  <button
                    key={item.key}
                    onClick={() => toggle(item.key)}
                    className="w-full flex items-center gap-3 py-2 px-2 rounded-lg hover:bg-slate-50 transition-colors text-left"
                  >
                    {isDone ? (
                      <CheckCircle2 size={20} className="text-green-500 flex-shrink-0" />
                    ) : (
                      <Circle size={20} className="text-slate-300 flex-shrink-0" />
                    )}
                    <span className={`text-sm ${isDone ? 'text-slate-400 line-through' : 'text-slate-700'}`}>
                      {item.label}
                    </span>
                    {isDone && readiness[item.key]?.date && (
                      <span className="text-xs text-slate-400 ml-auto">{readiness[item.key].date}</span>
                    )}
                  </button>
                );
              })}
            </div>
          </Card>
        );
      })}
    </div>
  );
}
