import { Link } from 'react-router-dom';

const moduleInfo = {
  '/appreciation': { num: 5, title: 'Appreciation & Value Tracker', desc: 'Track property value estimates, comparable sales, and market drivers.' },
  '/tax': { num: 8, title: 'Tax Tracker', desc: 'Depreciation, deductions, repair vs improvement classification, and sale planning.' },
  '/compliance': { num: 9, title: 'Florida Compliance', desc: 'FL landlord-tenant law requirements, required disclosures, security deposit handling.' },
  '/tenant': { num: 11, title: 'Tenant Lifecycle', desc: 'Track screening, lease, move-in, payments, maintenance, renewal, and move-out.' },
  '/maintenance': { num: 12, title: 'Maintenance & CapEx', desc: 'Maintenance log, preventive schedule, hurricane readiness, system replacement planning.' },
  '/insurance': { num: 13, title: 'Insurance & Risk', desc: 'Policy tracker, coverage gap analysis, risk register with 15+ risk categories.' },
  '/pm-oversight': { num: 10, title: 'Property Manager Oversight', desc: 'PM scorecard, interview questions, red flags, monthly review checklist.' },
  '/pcs': { num: 14, title: 'PCS Readiness', desc: '30-day PCS prep checklist, 7-day handoff, remote owner monthly review template.' },
  '/decisions': { num: 17, title: 'Decision Engine', desc: 'Keep/sell/rent analysis, break-even, reserve sizing, VA buying power, risk assessment.' },
  '/documents': { num: 16, title: 'Documents Vault', desc: 'Document index and checklist for all property records.' },
};

export default function Placeholder({ path }) {
  const info = moduleInfo[path] || { num: '?', title: 'Module', desc: 'This module is available.' };

  return (
    <div className="max-w-2xl mx-auto text-center py-12">
      <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/40 rounded-2xl flex items-center justify-center mx-auto mb-4">
        <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">{info.num}</span>
      </div>
      <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">{info.title}</h1>
      <p className="text-slate-500 dark:text-slate-400 mb-6">{info.desc}</p>
      <div className="bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 text-left">
        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">This module is ready for expansion. Priority modules currently active:</h3>
        <div className="space-y-2">
          {[
            { label: 'Executive Dashboard', path: '/', active: true },
            { label: 'Data Intake Form', path: '/intake', active: true },
            { label: 'Cash Flow Analysis', path: '/cashflow', active: true },
            { label: 'VA Entitlement Tracker', path: '/va-tracker', active: true },
            { label: 'Property Profile', path: '/property', active: true },
            { label: 'Mortgage & Equity', path: '/mortgage', active: true },
            { label: 'Rent-Readiness Checklist', path: '/rent-readiness', active: true },
            { label: 'Alerts & Deadlines', path: '/alerts', active: true },
          ].map(item => (
            <Link key={item.path} to={item.path} className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300">
              <span className="w-2 h-2 rounded-full bg-green-500" />
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
