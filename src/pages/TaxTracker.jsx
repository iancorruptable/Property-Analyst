import { useProperty } from '../store/PropertyContext';
import Card from '../components/Card';
import FormField from '../components/FormField';
import StatusBadge from '../components/StatusBadge';
import { formatCurrency, parseCurrency, calcDepreciation } from '../utils/calculations';
import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';

export default function TaxTracker() {
  const { state, dispatch } = useProperty();
  const expenses = state.taxExpenses || [];
  const purchasePrice = parseCurrency(state.property.purchasePrice);
  const landValue = parseCurrency(state.taxesInsurance.countyLandValue);
  const dep = purchasePrice ? calcDepreciation(purchasePrice, landValue) : null;

  const [newExpense, setNewExpense] = useState({ date: '', description: '', amount: '', category: '' });

  const addExpense = () => {
    if (!newExpense.date || !newExpense.amount) return;
    dispatch({ type: 'ADD_TO_ARRAY', section: 'taxExpenses', item: { ...newExpense, id: Date.now() } });
    setNewExpense({ date: '', description: '', amount: '', category: '' });
  };

  const removeExpense = (index) => {
    dispatch({ type: 'REMOVE_FROM_ARRAY', section: 'taxExpenses', index });
  };

  const categories = ['repair', 'improvement', 'travel', 'insurance', 'management', 'legal', 'utilities', 'supplies', 'other'];
  const totalByCategory = categories.reduce((acc, cat) => {
    acc[cat] = expenses.filter(e => e.category === cat).reduce((sum, e) => sum + parseCurrency(e.amount), 0);
    return acc;
  }, {});
  const totalExpenses = Object.values(totalByCategory).reduce((a, b) => a + b, 0);

  // Schedule E summary
  const annualRent = parseCurrency(state.rental?.targetRent) * 12;
  const annualMortgageInterest = parseCurrency(state.mortgage?.monthlyPI) * 12 * (parseFloat(state.mortgage?.interestRate || 0) / 100) * 0.7; // rough estimate
  const annualTaxes = parseCurrency(state.taxesInsurance?.annualPropertyTax);
  const annualInsurance = parseCurrency(state.taxesInsurance?.insurancePremium) + parseCurrency(state.taxesInsurance?.floodPremium);
  const annualDepreciation = dep?.annual || 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Tax Tracker</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Module 8 — Depreciation, deductions, and Schedule E prep</p>
      </div>

      <div className="bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-700 rounded-xl p-4 text-sm text-yellow-800 dark:text-yellow-300">
        <strong>Disclaimer:</strong> This is for tracking and estimation only. Always consult your CPA for actual tax filing.
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Depreciation */}
        <Card title="Residential Depreciation (27.5 years)" status={dep ? 'green' : 'red'}>
          {dep ? (
            <div className="space-y-2">
              {[
                ['Purchase Price (Cost Basis)', formatCurrency(purchasePrice)],
                ['Land Value (non-depreciable)', formatCurrency(landValue || 0)],
                ['Depreciable Building Value', formatCurrency(dep.buildingValue)],
                ['Annual Depreciation', formatCurrency(dep.annual)],
                ['Monthly Depreciation', formatCurrency(dep.monthly)],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between py-1 border-b border-slate-50 dark:border-slate-700/50 text-sm">
                  <span className="text-slate-600 dark:text-slate-400">{label}</span>
                  <span className="font-medium text-slate-900 dark:text-slate-100">{value}</span>
                </div>
              ))}
              <div className="bg-blue-50 dark:bg-blue-900/30 rounded-lg p-3 mt-2 text-xs text-blue-800 dark:text-blue-300">
                Enter your county land value in the Intake Form for an accurate depreciation split. Without it, 20% of purchase price is used as estimated land value.
              </div>
            </div>
          ) : (
            <p className="text-sm text-slate-400 dark:text-slate-500 text-center py-4">Enter purchase price in Intake Form.</p>
          )}
        </Card>

        {/* Repair vs Improvement Guide */}
        <Card title="Repair vs. Capital Improvement">
          <div className="space-y-3 text-sm">
            <div className="bg-green-50 dark:bg-green-900/30 rounded-lg p-3">
              <p className="font-semibold text-green-800 dark:text-green-300 mb-1">Repairs (Deductible in Year 1)</p>
              <ul className="text-green-700 dark:text-green-400 space-y-0.5 text-xs">
                <li>• Fixing a leak, patching drywall</li>
                <li>• Replacing a broken appliance part</li>
                <li>• Repainting, re-caulking</li>
                <li>• Pest treatment, cleaning</li>
              </ul>
            </div>
            <div className="bg-purple-50 dark:bg-purple-900/30 rounded-lg p-3">
              <p className="font-semibold text-purple-800 dark:text-purple-300 mb-1">Improvements (Depreciated over time)</p>
              <ul className="text-purple-700 dark:text-purple-400 space-y-0.5 text-xs">
                <li>• New roof, HVAC, water heater</li>
                <li>• Kitchen/bathroom renovation</li>
                <li>• Adding a room or fence</li>
                <li>• New flooring throughout</li>
              </ul>
            </div>
          </div>
        </Card>
      </div>

      {/* Expense Tracker */}
      <Card title="Expense Tracker">
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <FormField label="Date" type="date" value={newExpense.date} onChange={v => setNewExpense(p => ({ ...p, date: v }))} />
            <FormField label="Description" value={newExpense.description} onChange={v => setNewExpense(p => ({ ...p, description: v }))} placeholder="What was done" />
            <FormField label="Amount" prefix="$" value={newExpense.amount} onChange={v => setNewExpense(p => ({ ...p, amount: v }))} />
            <FormField label="Category" type="select" value={newExpense.category} onChange={v => setNewExpense(p => ({ ...p, category: v }))} options={categories} />
          </div>
          <button onClick={addExpense} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
            <Plus size={16} /> Add Expense
          </button>
        </div>

        {expenses.length > 0 && (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700">
                  <th className="text-left py-2 text-slate-600 dark:text-slate-400 font-medium">Date</th>
                  <th className="text-left py-2 text-slate-600 dark:text-slate-400 font-medium">Description</th>
                  <th className="text-left py-2 text-slate-600 dark:text-slate-400 font-medium">Category</th>
                  <th className="text-right py-2 text-slate-600 dark:text-slate-400 font-medium">Amount</th>
                  <th className="py-2"></th>
                </tr>
              </thead>
              <tbody>
                {expenses.map((exp, i) => (
                  <tr key={exp.id || i} className="border-b border-slate-50 dark:border-slate-700/50">
                    <td className="py-2 text-slate-700 dark:text-slate-300">{exp.date}</td>
                    <td className="py-2 text-slate-700 dark:text-slate-300">{exp.description}</td>
                    <td className="py-2"><StatusBadge status="blue">{exp.category}</StatusBadge></td>
                    <td className="py-2 text-right font-medium text-slate-900 dark:text-slate-100">{formatCurrency(exp.amount)}</td>
                    <td className="py-2 text-right">
                      <button onClick={() => removeExpense(i)} className="text-slate-400 hover:text-red-500"><Trash2 size={14} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Category Summary */}
      <Card title="Expense Summary by Category">
        <div className="space-y-2">
          {categories.filter(c => totalByCategory[c] > 0).map(cat => (
            <div key={cat} className="flex justify-between py-1 border-b border-slate-50 dark:border-slate-700/50 text-sm">
              <span className="text-slate-600 dark:text-slate-400 capitalize">{cat}</span>
              <span className="font-medium text-slate-900 dark:text-slate-100">{formatCurrency(totalByCategory[cat])}</span>
            </div>
          ))}
          <div className="flex justify-between py-2 text-sm font-bold border-t border-slate-200 dark:border-slate-700">
            <span className="text-slate-900 dark:text-slate-100">Total Tracked Expenses</span>
            <span className="text-slate-900 dark:text-slate-100">{formatCurrency(totalExpenses)}</span>
          </div>
        </div>
      </Card>

      {/* Schedule E Preview */}
      <Card title="Schedule E Preview (Estimated)">
        <div className="space-y-2">
          {[
            ['Gross Rental Income', annualRent, false],
            ['Mortgage Interest (est.)', annualMortgageInterest, true],
            ['Property Taxes', annualTaxes, true],
            ['Insurance', annualInsurance, true],
            ['Depreciation', annualDepreciation, true],
            ['Other Expenses (tracked)', totalExpenses, true],
          ].map(([label, value, isExpense]) => (
            <div key={label} className="flex justify-between py-1 border-b border-slate-50 dark:border-slate-700/50 text-sm">
              <span className="text-slate-600 dark:text-slate-400">{isExpense ? `− ${label}` : label}</span>
              <span className={`font-medium ${isExpense ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                {value > 0 ? formatCurrency(value) : '—'}
              </span>
            </div>
          ))}
          <div className="flex justify-between py-2 text-sm font-bold border-t border-slate-200 dark:border-slate-700">
            <span className="text-slate-900 dark:text-slate-100">Net Rental Income (Tax)</span>
            <span className={`${annualRent - annualMortgageInterest - annualTaxes - annualInsurance - annualDepreciation - totalExpenses >= 0 ? 'text-slate-900 dark:text-slate-100' : 'text-green-600 dark:text-green-400'}`}>
              {annualRent > 0 ? formatCurrency(annualRent - annualMortgageInterest - annualTaxes - annualInsurance - annualDepreciation - totalExpenses) : '—'}
            </span>
          </div>
          {annualRent > 0 && annualRent - annualMortgageInterest - annualTaxes - annualInsurance - annualDepreciation - totalExpenses < 0 && (
            <div className="bg-green-50 dark:bg-green-900/30 rounded-lg p-3 text-xs text-green-800 dark:text-green-300">
              Paper loss — depreciation may offset taxable income. This rental may generate a tax benefit. Consult your CPA.
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
