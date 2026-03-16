import { useProperty } from '../store/PropertyContext';
import Card from '../components/Card';
import FormField from '../components/FormField';
import StatusBadge from '../components/StatusBadge';
import { formatCurrency, parseCurrency } from '../utils/calculations';
import { useState } from 'react';
import { TrendingUp, TrendingDown, Minus, Plus, Trash2 } from 'lucide-react';

export default function Appreciation() {
  const { state, dispatch } = useProperty();
  const estimates = state.valueEstimates || [];
  const purchasePrice = parseCurrency(state.property.purchasePrice);

  const [newEstimate, setNewEstimate] = useState({ date: '', value: '', source: '' });

  const addEstimate = () => {
    if (!newEstimate.date || !newEstimate.value) return;
    dispatch({ type: 'ADD_TO_ARRAY', section: 'valueEstimates', item: { ...newEstimate, id: Date.now() } });
    setNewEstimate({ date: '', value: '', source: '' });
  };

  const removeEstimate = (index) => {
    dispatch({ type: 'REMOVE_FROM_ARRAY', section: 'valueEstimates', index });
  };

  const sorted = [...estimates].sort((a, b) => new Date(a.date) - new Date(b.date));
  const latestValue = sorted.length > 0 ? parseCurrency(sorted[sorted.length - 1].value) : purchasePrice;
  const totalAppreciation = purchasePrice ? latestValue - purchasePrice : 0;
  const appreciationPct = purchasePrice ? ((totalAppreciation / purchasePrice) * 100).toFixed(1) : 0;
  const purchaseDate = state.property.purchaseDate ? new Date(state.property.purchaseDate) : null;
  const yearsHeld = purchaseDate ? ((Date.now() - purchaseDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000)).toFixed(1) : 0;
  const annualizedReturn = yearsHeld > 0 ? (totalAppreciation / yearsHeld) : 0;

  // Future projection scenarios
  const projections = [2, 3, 4, 5].map(rate => {
    const years = [1, 3, 5, 10];
    return {
      rate,
      values: years.map(y => ({
        year: y,
        value: latestValue * Math.pow(1 + rate / 100, y),
      })),
    };
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Appreciation & Value Tracker</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Module 5 — Track property value estimates and market trends</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Purchase Price', value: purchasePrice ? formatCurrency(purchasePrice) : '—' },
          { label: 'Latest Est. Value', value: latestValue ? formatCurrency(latestValue) : '—' },
          { label: 'Total Appreciation', value: totalAppreciation ? formatCurrency(totalAppreciation) : '—', color: totalAppreciation >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400' },
          { label: 'Appreciation %', value: appreciationPct ? `${appreciationPct}%` : '—', color: totalAppreciation >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400' },
        ].map(item => (
          <div key={item.label} className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-4">
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{item.label}</p>
            <p className={`text-xl font-bold mt-1 ${item.color || 'text-slate-900 dark:text-slate-100'}`}>{item.value}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Add Value Estimate */}
        <Card title="Add Value Estimate">
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <FormField label="Date" type="date" value={newEstimate.date} onChange={v => setNewEstimate(p => ({ ...p, date: v }))} />
              <FormField label="Value" prefix="$" value={newEstimate.value} onChange={v => setNewEstimate(p => ({ ...p, value: v }))} placeholder="340,000" />
              <FormField label="Source" value={newEstimate.source} onChange={v => setNewEstimate(p => ({ ...p, source: v }))} placeholder="Zillow, Appraisal..." />
            </div>
            <button onClick={addEstimate} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
              <Plus size={16} /> Add Estimate
            </button>
          </div>
        </Card>

        {/* Value History */}
        <Card title="Value History">
          {sorted.length === 0 ? (
            <p className="text-sm text-slate-400 dark:text-slate-500 text-center py-4">No value estimates recorded yet.</p>
          ) : (
            <div className="space-y-2">
              {sorted.map((est, i) => {
                const val = parseCurrency(est.value);
                const prev = i > 0 ? parseCurrency(sorted[i - 1].value) : purchasePrice;
                const delta = prev ? val - prev : 0;
                return (
                  <div key={est.id || i} className="flex items-center gap-3 py-2 border-b border-slate-50 dark:border-slate-700/50">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-slate-900 dark:text-slate-100">{formatCurrency(val)}</span>
                        {delta !== 0 && (
                          <span className={`text-xs flex items-center gap-0.5 ${delta > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                            {delta > 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                            {formatCurrency(Math.abs(delta))}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 dark:text-slate-500">{est.date} — {est.source || 'No source'}</p>
                    </div>
                    <button onClick={() => removeEstimate(i)} className="text-slate-400 hover:text-red-500 dark:text-slate-500 dark:hover:text-red-400">
                      <Trash2 size={14} />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        {/* Holding Period Summary */}
        <Card title="Holding Period Summary">
          <div className="space-y-2">
            {[
              ['Purchase Date', state.property.purchaseDate || '—'],
              ['Years Held', yearsHeld > 0 ? `${yearsHeld} years` : '—'],
              ['Annual Appreciation', annualizedReturn ? formatCurrency(annualizedReturn) + '/yr' : '—'],
              ['Annual Return %', yearsHeld > 0 && purchasePrice ? `${((totalAppreciation / purchasePrice / yearsHeld) * 100).toFixed(2)}%` : '—'],
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between py-1 border-b border-slate-50 dark:border-slate-700/50 text-sm">
                <span className="text-slate-600 dark:text-slate-400">{label}</span>
                <span className="font-medium text-slate-900 dark:text-slate-100">{value}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Navarre Market Context */}
        <Card title="Navarre / Santa Rosa County Context">
          <div className="space-y-3 text-sm">
            <p className="text-slate-600 dark:text-slate-400">Key market drivers for Navarre, FL:</p>
            <ul className="space-y-1.5 text-slate-700 dark:text-slate-300">
              <li>• Military demand from NAS Whiting Field, Hurlburt, Eglin AFB</li>
              <li>• Growing beach tourism and vacation rental demand</li>
              <li>• Santa Rosa County population growth above state average</li>
              <li>• New construction and commercial development along US-98</li>
              <li>• Hurricane risk is a pricing factor</li>
            </ul>
            <div className="bg-blue-50 dark:bg-blue-900/30 rounded-lg p-3 text-blue-800 dark:text-blue-300 text-xs">
              Track comparable sales in your neighborhood using Zillow, Realtor.com, or county records at santarosa.fl.gov.
            </div>
          </div>
        </Card>
      </div>

      {/* Future Projections */}
      <Card title="Value Projections (from current estimate)">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left py-2 text-slate-600 dark:text-slate-400 font-medium">Annual Rate</th>
                <th className="text-right py-2 text-slate-600 dark:text-slate-400 font-medium">1 Year</th>
                <th className="text-right py-2 text-slate-600 dark:text-slate-400 font-medium">3 Years</th>
                <th className="text-right py-2 text-slate-600 dark:text-slate-400 font-medium">5 Years</th>
                <th className="text-right py-2 text-slate-600 dark:text-slate-400 font-medium">10 Years</th>
              </tr>
            </thead>
            <tbody>
              {projections.map(p => (
                <tr key={p.rate} className="border-b border-slate-50 dark:border-slate-700/50">
                  <td className="py-2 text-slate-700 dark:text-slate-300 font-medium">{p.rate}%</td>
                  {p.values.map(v => (
                    <td key={v.year} className="py-2 text-right text-slate-900 dark:text-slate-100">{latestValue ? formatCurrency(v.value) : '—'}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
