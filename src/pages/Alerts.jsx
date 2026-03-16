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
    if (!state.taxesInsurance.homesteadExemption) add('yellow', 'Homestead exemption status unknown', '/tax', 'Before conversion');
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
    { month: 'Jan–Mar', item: 'Homestead exemption filing window', deadline: 'March 1' },
    { month: 'Feb', item: 'Tax document preparation', deadline: 'April 15' },
    { month: 'May', item: 'Hurricane prep review', deadline: 'June 1' },
    { month: 'Nov', item: 'FL property tax (4% discount)', deadline: 'Nov 30' },
    { month: 'Dec', item: 'Year-end financial review', deadline: 'Dec 31' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Alerts & Deadlines</h1>
        <p className="text-sm text-slate-500 mt-1">Module 15 — Consolidated alert center</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-red-700">{red.length}</p>
          <p className="text-xs text-red-600">Urgent</p>
        </div>
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-yellow-700">{yellow.length}</p>
          <p className="text-xs text-yellow-600">Watch</p>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-green-700">{green.length}</p>
          <p className="text-xs text-green-600">On Track</p>
        </div>
      </div>

      {red.length > 0 && (
        <Card title="Urgent — Immediate Action Required" status="red">
          <div className="space-y-2">
            {red.map((a, i) => (
              <Link key={i} to={a.link} className="flex items-center gap-3 p-2 rounded-lg hover:bg-red-50 transition-colors">
                <StatusDot status="red" />
                <span className="text-sm text-slate-700 flex-1">{a.message}</span>
                <span className="text-xs text-slate-400">{a.deadline}</span>
                <ArrowRight size={14} className="text-slate-400" />
              </Link>
            ))}
          </div>
        </Card>
      )}

      {yellow.length > 0 && (
        <Card title="Watch — Action Needed Soon" status="yellow">
          <div className="space-y-2">
            {yellow.map((a, i) => (
              <Link key={i} to={a.link} className="flex items-center gap-3 p-2 rounded-lg hover:bg-yellow-50 transition-colors">
                <StatusDot status="yellow" />
                <span className="text-sm text-slate-700 flex-1">{a.message}</span>
                <span className="text-xs text-slate-400">{a.deadline}</span>
                <ArrowRight size={14} className="text-slate-400" />
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
                <span className="text-sm text-slate-600">{a.message}</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        <Card title="Monthly Recurring">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-slate-200">
                <th className="text-left py-2 text-slate-600 font-medium">Day</th>
                <th className="text-left py-2 text-slate-600 font-medium">Item</th>
                <th className="text-left py-2 text-slate-600 font-medium">Responsible</th>
              </tr></thead>
              <tbody>
                {recurringMonthly.map((r, i) => (
                  <tr key={i} className="border-b border-slate-50">
                    <td className="py-2 text-slate-700 font-medium">{r.day}</td>
                    <td className="py-2 text-slate-700">{r.item}</td>
                    <td className="py-2 text-slate-500">{r.responsible}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card title="Annual Deadlines">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-slate-200">
                <th className="text-left py-2 text-slate-600 font-medium">Timing</th>
                <th className="text-left py-2 text-slate-600 font-medium">Item</th>
                <th className="text-left py-2 text-slate-600 font-medium">Deadline</th>
              </tr></thead>
              <tbody>
                {annualDeadlines.map((d, i) => (
                  <tr key={i} className="border-b border-slate-50">
                    <td className="py-2 text-slate-700 font-medium">{d.month}</td>
                    <td className="py-2 text-slate-700">{d.item}</td>
                    <td className="py-2 text-slate-500">{d.deadline}</td>
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
