import { useProperty } from '../store/PropertyContext';
import Card from '../components/Card';
import FormField from '../components/FormField';
import StatusBadge from '../components/StatusBadge';
import { formatCurrency, parseCurrency } from '../utils/calculations';
import { useState } from 'react';
import { Plus, Trash2, Wrench, AlertTriangle } from 'lucide-react';

const preventiveSchedule = [
  { frequency: 'Monthly', items: ['HVAC filter replacement', 'Smoke/CO detector test', 'Garbage disposal cleaning'] },
  { frequency: 'Quarterly', items: ['HVAC coil cleaning', 'Water heater flush', 'Pest control treatment', 'Gutter inspection'] },
  { frequency: 'Semi-Annual', items: ['HVAC professional service', 'Plumbing inspection', 'Exterior paint/caulk check', 'Fire extinguisher check'] },
  { frequency: 'Annual', items: ['Roof inspection', 'Termite inspection', 'Dryer vent cleaning', 'Water heater anode rod check', 'Landscaping trim / tree service', 'Hurricane shutter test'] },
];

const systemLifespans = [
  { system: 'Roof (Shingle)', lifespan: '15–25 years', replacement: '$8,000–$15,000' },
  { system: 'Roof (Metal)', lifespan: '40–70 years', replacement: '$12,000–$25,000' },
  { system: 'HVAC', lifespan: '12–15 years', replacement: '$5,000–$10,000' },
  { system: 'Water Heater (Tank)', lifespan: '8–12 years', replacement: '$1,000–$2,000' },
  { system: 'Water Heater (Tankless)', lifespan: '15–20 years', replacement: '$2,000–$4,000' },
  { system: 'Appliances', lifespan: '10–15 years', replacement: '$500–$2,000 each' },
  { system: 'Exterior Paint', lifespan: '5–10 years', replacement: '$3,000–$6,000' },
  { system: 'Flooring (Carpet)', lifespan: '5–10 years', replacement: '$2,000–$5,000' },
  { system: 'Flooring (LVP/Tile)', lifespan: '15–25 years', replacement: '$3,000–$8,000' },
  { system: 'Plumbing', lifespan: '40–50 years', replacement: '$4,000–$10,000' },
  { system: 'Electrical Panel', lifespan: '25–40 years', replacement: '$1,500–$4,000' },
  { system: 'Garage Door/Opener', lifespan: '15–20 years', replacement: '$800–$2,500' },
];

const hurricaneChecklist = [
  'Hurricane shutters inventoried and functional',
  'Impact-rated windows verified (if applicable)',
  'Roof tie-downs / strapping verified',
  'Trees trimmed away from structure',
  'Outdoor furniture plan (secure or store)',
  'Generator plan (owner or tenant responsibility)',
  'Emergency contact list updated',
  'Insurance policy reviewed (wind/flood coverage)',
  'Evacuation route shared with tenant',
  'Important documents in waterproof storage',
];

export default function Maintenance() {
  const { state, dispatch } = useProperty();
  const log = state.maintenanceLog || [];
  const [newEntry, setNewEntry] = useState({ date: '', description: '', cost: '', category: '', vendor: '', status: 'completed' });

  const addEntry = () => {
    if (!newEntry.date || !newEntry.description) return;
    dispatch({ type: 'ADD_TO_ARRAY', section: 'maintenanceLog', item: { ...newEntry, id: Date.now() } });
    setNewEntry({ date: '', description: '', cost: '', category: '', vendor: '', status: 'completed' });
  };

  const removeEntry = (index) => {
    dispatch({ type: 'REMOVE_FROM_ARRAY', section: 'maintenanceLog', index });
  };

  const totalSpent = log.reduce((sum, e) => sum + parseCurrency(e.cost), 0);
  const categories = ['repair', 'preventive', 'emergency', 'improvement', 'inspection', 'hurricane-prep'];

  const toggleHurricane = (index) => {
    const list = state.documents?.hurricanePrep || [];
    const newList = [...list];
    newList[index] = !newList[index];
    dispatch({ type: 'SET_FIELD', section: 'documents', field: 'hurricanePrep', value: newList });
  };

  const hurricaneComplete = (state.documents?.hurricanePrep || []).filter(Boolean).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Maintenance & CapEx</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Module 12 — Maintenance log, preventive schedule, and hurricane readiness</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-4">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Total Entries</p>
          <p className="text-xl font-bold text-slate-900 dark:text-slate-100 mt-1">{log.length}</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-4">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Total Spent</p>
          <p className="text-xl font-bold text-slate-900 dark:text-slate-100 mt-1">{formatCurrency(totalSpent)}</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-4">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Open Items</p>
          <p className="text-xl font-bold text-slate-900 dark:text-slate-100 mt-1">{log.filter(e => e.status === 'pending' || e.status === 'in-progress').length}</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-4">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Hurricane Prep</p>
          <p className="text-xl font-bold text-slate-900 dark:text-slate-100 mt-1">{hurricaneComplete}/{hurricaneChecklist.length}</p>
        </div>
      </div>

      {/* Add Maintenance Entry */}
      <Card title="Log Maintenance Item">
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <FormField label="Date" type="date" value={newEntry.date} onChange={v => setNewEntry(p => ({ ...p, date: v }))} />
            <FormField label="Description" value={newEntry.description} onChange={v => setNewEntry(p => ({ ...p, description: v }))} placeholder="What was done" />
            <FormField label="Cost" prefix="$" value={newEntry.cost} onChange={v => setNewEntry(p => ({ ...p, cost: v }))} />
            <FormField label="Category" type="select" value={newEntry.category} onChange={v => setNewEntry(p => ({ ...p, category: v }))} options={categories} />
            <FormField label="Vendor" value={newEntry.vendor} onChange={v => setNewEntry(p => ({ ...p, vendor: v }))} placeholder="Company or person" />
            <FormField label="Status" type="select" value={newEntry.status} onChange={v => setNewEntry(p => ({ ...p, status: v }))} options={['pending', 'in-progress', 'completed']} />
          </div>
          <button onClick={addEntry} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
            <Plus size={16} /> Add Entry
          </button>
        </div>
      </Card>

      {/* Maintenance Log */}
      {log.length > 0 && (
        <Card title="Maintenance Log">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700">
                  <th className="text-left py-2 text-slate-600 dark:text-slate-400 font-medium">Date</th>
                  <th className="text-left py-2 text-slate-600 dark:text-slate-400 font-medium">Description</th>
                  <th className="text-left py-2 text-slate-600 dark:text-slate-400 font-medium">Category</th>
                  <th className="text-left py-2 text-slate-600 dark:text-slate-400 font-medium">Vendor</th>
                  <th className="text-right py-2 text-slate-600 dark:text-slate-400 font-medium">Cost</th>
                  <th className="text-left py-2 text-slate-600 dark:text-slate-400 font-medium">Status</th>
                  <th className="py-2"></th>
                </tr>
              </thead>
              <tbody>
                {[...log].reverse().map((entry, i) => {
                  const realIndex = log.length - 1 - i;
                  return (
                    <tr key={entry.id || i} className="border-b border-slate-50 dark:border-slate-700/50">
                      <td className="py-2 text-slate-700 dark:text-slate-300">{entry.date}</td>
                      <td className="py-2 text-slate-700 dark:text-slate-300">{entry.description}</td>
                      <td className="py-2"><StatusBadge status="blue">{entry.category}</StatusBadge></td>
                      <td className="py-2 text-slate-500 dark:text-slate-400">{entry.vendor || '—'}</td>
                      <td className="py-2 text-right font-medium text-slate-900 dark:text-slate-100">{entry.cost ? formatCurrency(entry.cost) : '—'}</td>
                      <td className="py-2">
                        <StatusBadge status={entry.status === 'completed' ? 'green' : entry.status === 'in-progress' ? 'yellow' : 'red'}>
                          {entry.status}
                        </StatusBadge>
                      </td>
                      <td className="py-2 text-right">
                        <button onClick={() => removeEntry(realIndex)} className="text-slate-400 hover:text-red-500"><Trash2 size={14} /></button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Preventive Schedule */}
      <Card title="Preventive Maintenance Schedule">
        <div className="space-y-4">
          {preventiveSchedule.map(group => (
            <div key={group.frequency}>
              <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">{group.frequency}</h4>
              <ul className="space-y-1 ml-4">
                {group.items.map((item, i) => (
                  <li key={i} className="text-sm text-slate-600 dark:text-slate-400 flex items-center gap-2">
                    <Wrench size={12} className="text-slate-400 dark:text-slate-500" /> {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Card>

      {/* System Lifespans */}
      <Card title="System Replacement Planning">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left py-2 text-slate-600 dark:text-slate-400 font-medium">System</th>
                <th className="text-left py-2 text-slate-600 dark:text-slate-400 font-medium">Expected Lifespan</th>
                <th className="text-right py-2 text-slate-600 dark:text-slate-400 font-medium">Est. Replacement Cost</th>
              </tr>
            </thead>
            <tbody>
              {systemLifespans.map((sys, i) => (
                <tr key={i} className="border-b border-slate-50 dark:border-slate-700/50">
                  <td className="py-2 text-slate-700 dark:text-slate-300 font-medium">{sys.system}</td>
                  <td className="py-2 text-slate-600 dark:text-slate-400">{sys.lifespan}</td>
                  <td className="py-2 text-right text-slate-900 dark:text-slate-100">{sys.replacement}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Hurricane Readiness */}
      <Card title={`Hurricane Readiness (${hurricaneComplete}/${hurricaneChecklist.length})`}
        status={hurricaneComplete === hurricaneChecklist.length ? 'green' : hurricaneComplete > 0 ? 'yellow' : 'red'}>
        <div className="space-y-1">
          {hurricaneChecklist.map((item, i) => {
            const done = (state.documents?.hurricanePrep || [])[i];
            return (
              <button key={i} onClick={() => toggleHurricane(i)}
                className="w-full flex items-center gap-3 py-2 px-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors text-left">
                <span className={`w-5 h-5 rounded border flex items-center justify-center text-xs ${done ? 'bg-green-500 border-green-500 text-white' : 'border-slate-300 dark:border-slate-600'}`}>
                  {done ? '✓' : ''}
                </span>
                <span className={`text-sm ${done ? 'text-slate-400 dark:text-slate-500 line-through' : 'text-slate-700 dark:text-slate-300'}`}>{item}</span>
              </button>
            );
          })}
        </div>
        <div className="mt-4 bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-700 rounded-lg p-3 flex items-start gap-2">
          <AlertTriangle size={16} className="text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-yellow-800 dark:text-yellow-300">FL hurricane season: June 1 – November 30. Complete prep by May 31.</p>
        </div>
      </Card>
    </div>
  );
}
