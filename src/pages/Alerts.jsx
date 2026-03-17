import { useProperty } from '../store/PropertyContext';
import Card from '../components/Card';
import { StatusDot } from '../components/StatusBadge';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export default function Alerts() {
  const { state } = useProperty();

  const generateAlerts = () => {
    const alerts = [];
    const add = (severity, message, link, deadline) => alerts.push({ severity, message, link, deadline });

    // RED alerts
    if (!state.property.purchasePrice) add('red', 'Complete property intake data', '/intake', 'ASAP');
    if (!state.taxesInsurance.floodZoneDesignation) add('red', 'Verify flood zone designation — Navarre coastal exposure', '/insurance', 'ASAP');
    if (state.vaBenefit.hasCOE !== 'yes') add('red', 'Obtain VA Certificate of Eligibility', '/va-tracker', '2 weeks');

    // YELLOW alerts
    if (!state.property.hoaRentalRestrictions) add('yellow', 'HOA rental restrictions unverified', '/property', 'Before listing');
    if (!state.taxesInsurance.homesteadExemption) {
      add('yellow', state.vaBenefit?.activeDutyStatus === 'yes'
        ? 'Homestead exemption status unknown — active duty can RETAIN homestead + 3% SOH cap'
        : 'Homestead exemption status unknown', '/tax', 'Before conversion');
    }
    if (!state.propertyManager.companyName) add('yellow', 'No property manager selected', '/pm-oversight', 'Before PCS');
    if (!state.taxesInsurance.hasUmbrella || state.taxesInsurance.hasUmbrella === 'no') add('yellow', 'No umbrella liability policy', '/insurance', 'Before tenant');
    add('yellow', 'Hurricane season prep review', '/maintenance', 'Before Jun 1');
    if (!state.rental.reserveCash) add('yellow', 'Reserve fund not established', '/cashflow', 'Before tenant');
    if (!state.operations.cpa) add('yellow', 'CPA not consulted on rental conversion', '/intake', 'Before conversion');

    // GREEN
    if (state.property.purchasePrice && state.mortgage.currentBalance && state.rental.targetRent) {
      add('green', 'Core financial data entered', '/cashflow', '—');
    }
    if (state.vaBenefit.hasCOE === 'yes') add('green', 'COE obtained', '/va-tracker', '—');

    return alerts;
  };

  const alerts = generateAlerts();
  const red = alerts.filter(a => a.severity === 'red');
  const yellow = alerts.filter(a => a.severity === 'yellow');
  const green = alerts.filter(a => a.severity === 'green');

  const recurringMonthly = [
    { day: '1st', item: 'Mortgage payment due', responsible: 'Auto-pay' },
    { day: '1st', item: 'Rent due (when tenant)', responsible: 'PM' },
    { day: '15th', item: 'Review PM owner statement', responsible: 'Owner' },
  ];

  const annualDeadlines = [
    { month: 'Jan–Mar', item: 'Homestead exemption filing window (active duty: retain, do not remove)', deadline: 'March 1' },
    { month: 'Feb', item: 'Tax document preparation', deadline: 'April 15' },
    { month: 'May', item: 'Hurricane prep review', deadline: 'June 1' },
    { month: 'Nov', item: 'FL property tax (4% discount)', deadline: 'Nov 30' },
    { month: 'Dec', item: 'Year-end financial review', deadline: 'Dec 31' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Alerts & Deadlines</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Module 15 — Consolidated alert center</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-red-700 dark:text-red-400">{red.length}</p>
          <p className="text-xs text-red-600 dark:text-red-400">Urgent</p>
        </div>
        <div className="bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-700 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-yellow-700 dark:text-yellow-400">{yellow.length}</p>
          <p className="text-xs text-yellow-600 dark:text-yellow-400">Watch</p>
        </div>
        <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-green-700 dark:text-green-400">{green.length}</p>
          <p className="text-xs text-green-600 dark:text-green-400">On Track</p>
        </div>
      </div>

      {red.length > 0 && (
        <Card title="Urgent — Immediate Action Required" status="red">
          <div className="space-y-2">
            {red.map((a, i) => (
              <Link key={i} to={a.link} className="flex items-center gap-3 p-2 min-h-[44px] rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                <StatusDot status="red" />
                <span className="text-sm text-slate-700 dark:text-slate-300 flex-1">{a.message}</span>
                <span className="text-xs text-slate-400 dark:text-slate-500">{a.deadline}</span>
                <ArrowRight size={14} className="text-slate-400 dark:text-slate-500" />
              </Link>
            ))}
          </div>
        </Card>
      )}

      {yellow.length > 0 && (
        <Card title="Watch — Action Needed Soon" status="yellow">
          <div className="space-y-2">
            {yellow.map((a, i) => (
              <Link key={i} to={a.link} className="flex items-center gap-3 p-2 min-h-[44px] rounded-lg hover:bg-yellow-50 dark:hover:bg-yellow-900/20 transition-colors">
                <StatusDot status="yellow" />
                <span className="text-sm text-slate-700 dark:text-slate-300 flex-1">{a.message}</span>
                <span className="text-xs text-slate-400 dark:text-slate-500">{a.deadline}</span>
                <ArrowRight size={14} className="text-slate-400 dark:text-slate-500" />
              </Link>
            ))}
          </div>
        </Card>
      )}

      {green.length > 0 && (
        <Card title="On Track" status="green">
          <div className="space-y-2">
            {green.map((a, i) => (
              <div key={i} className="flex items-center gap-3 p-2">
                <StatusDot status="green" />
                <span className="text-sm text-slate-600 dark:text-slate-400">{a.message}</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        <Card title="Monthly Recurring">
          {/* Mobile cards */}
          <div className="block sm:hidden space-y-3">
            {recurringMonthly.map((r, i) => (
              <div key={i} className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-3 space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-slate-900 dark:text-slate-100">{r.day}</span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">{r.responsible}</span>
                </div>
                <p className="text-sm text-slate-700 dark:text-slate-300">{r.item}</p>
              </div>
            ))}
          </div>
          {/* Desktop table */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left py-2 text-slate-600 dark:text-slate-400 font-medium">Day</th>
                <th className="text-left py-2 text-slate-600 dark:text-slate-400 font-medium">Item</th>
                <th className="text-left py-2 text-slate-600 dark:text-slate-400 font-medium">Responsible</th>
              </tr></thead>
              <tbody>
                {recurringMonthly.map((r, i) => (
                  <tr key={i} className="border-b border-slate-50 dark:border-slate-700/50">
                    <td className="py-2 text-slate-700 dark:text-slate-300 font-medium">{r.day}</td>
                    <td className="py-2 text-slate-700 dark:text-slate-300">{r.item}</td>
                    <td className="py-2 text-slate-500 dark:text-slate-400">{r.responsible}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card title="Annual Deadlines">
          {/* Mobile cards */}
          <div className="block sm:hidden space-y-3">
            {annualDeadlines.map((d, i) => (
              <div key={i} className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-3 space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-slate-900 dark:text-slate-100">{d.month}</span>
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Due: {d.deadline}</span>
                </div>
                <p className="text-sm text-slate-700 dark:text-slate-300">{d.item}</p>
              </div>
            ))}
          </div>
          {/* Desktop table */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left py-2 text-slate-600 dark:text-slate-400 font-medium">Timing</th>
                <th className="text-left py-2 text-slate-600 dark:text-slate-400 font-medium">Item</th>
                <th className="text-left py-2 text-slate-600 dark:text-slate-400 font-medium">Deadline</th>
              </tr></thead>
              <tbody>
                {annualDeadlines.map((d, i) => (
                  <tr key={i} className="border-b border-slate-50 dark:border-slate-700/50">
                    <td className="py-2 text-slate-700 dark:text-slate-300 font-medium">{d.month}</td>
                    <td className="py-2 text-slate-700 dark:text-slate-300">{d.item}</td>
                    <td className="py-2 text-slate-500 dark:text-slate-400">{d.deadline}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
