import { useProperty } from '../store/PropertyContext';
import Card from '../components/Card';
import FormField from '../components/FormField';

export default function PropertyProfile() {
  const { state, dispatch } = useProperty();
  const update = (section, field, value) => dispatch({ type: 'SET_FIELD', section, field, value });
  const p = state.property;
  const m = state.mortgage;
  const t = state.taxesInsurance;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Property Profile</h1>
        <p className="text-sm text-slate-500 mt-1">Module 2 — Permanent property record</p>
      </div>

      <Card title="Property Identification">
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <div className="text-sm text-slate-600">Address</div>
            <div className="text-lg font-semibold text-slate-900">{p.address}</div>
          </div>
          <div><span className="text-xs text-slate-500">County:</span> <span className="text-sm font-medium">{p.county}</span></div>
          <div><span className="text-xs text-slate-500">Status:</span> <span className="text-sm font-medium capitalize">{p.status?.replace(/-/g, ' ') || 'Not set'}</span></div>
        </div>
      </Card>

      <Card title="Property Details">
        <div className="grid sm:grid-cols-3 gap-4">
          <FormField label="Type" type="select" value={p.propertyType} onChange={v => update('property', 'propertyType', v)} options={['single-family', 'townhome', 'condo', 'duplex']} />
          <FormField label="Year Built" value={p.yearBuilt} onChange={v => update('property', 'yearBuilt', v)} />
          <FormField label="Sq Ft" value={p.sqft} onChange={v => update('property', 'sqft', v)} />
          <FormField label="Beds" value={p.beds} onChange={v => update('property', 'beds', v)} />
          <FormField label="Baths" value={p.baths} onChange={v => update('property', 'baths', v)} />
          <FormField label="Garage" type="select" value={p.garage} onChange={v => update('property', 'garage', v)} options={['none', '1-car', '2-car', '3-car']} />
          <FormField label="Pool" type="checkbox" value={p.pool} onChange={v => update('property', 'pool', v)} />
          <FormField label="Condition" type="select" value={p.condition} onChange={v => update('property', 'condition', v)} options={['excellent', 'good', 'fair', 'needs-work']} />
          <FormField label="Flood Zone" value={p.floodZone || t.floodZoneDesignation} onChange={v => update('property', 'floodZone', v)} placeholder="A, AE, X, VE..." />
        </div>
      </Card>

      <Card title="Systems & Components">
        <div className="grid sm:grid-cols-2 gap-4">
          <FormField label="Roof Type & Age" value={p.roofType} onChange={v => update('property', 'roofType', v)} placeholder="Shingle, ~10 years" />
          <FormField label="HVAC Type & Age" value={p.hvacType} onChange={v => update('property', 'hvacType', v)} />
          <FormField label="Water Heater" value={p.waterHeaterType} onChange={v => update('property', 'waterHeaterType', v)} />
          <FormField label="Known Repairs" type="textarea" value={p.knownRepairs} onChange={v => update('property', 'knownRepairs', v)} />
          <FormField label="Renovations Since Purchase" type="textarea" value={p.renovations} onChange={v => update('property', 'renovations', v)} />
        </div>
      </Card>

      <Card title="HOA Information">
        <div className="grid sm:grid-cols-2 gap-4">
          <FormField label="HOA Name" value={p.hoaName} onChange={v => update('property', 'hoaName', v)} />
          <FormField label="Monthly Dues" prefix="$" value={p.hoaDues} onChange={v => update('property', 'hoaDues', v)} />
          <FormField label="Rental Restrictions" type="textarea" value={p.hoaRentalRestrictions} onChange={v => update('property', 'hoaRentalRestrictions', v)} />
          <FormField label="HOA Approval Required?" type="select" value={p.hoaApprovalRequired} onChange={v => update('property', 'hoaApprovalRequired', v)} options={['yes', 'no', 'unknown']} />
          <FormField label="Min Lease Term" value={p.hoaMinLeaseTerm} onChange={v => update('property', 'hoaMinLeaseTerm', v)} placeholder="e.g., 12 months" />
        </div>
      </Card>

      <Card title="Loan Summary">
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-2 text-sm">
            {[
              ['Loan Type', m.loanType],
              ['Original Amount', m.originalLoanAmount ? `$${m.originalLoanAmount}` : '—'],
              ['Current Balance', m.currentBalance ? `$${m.currentBalance}` : '—'],
              ['Rate', m.interestRate ? `${m.interestRate}%` : '—'],
              ['Term', m.loanTerm ? `${m.loanTerm} years` : '—'],
              ['Monthly P&I', m.monthlyPI ? `$${m.monthlyPI}` : '—'],
              ['Servicer', m.servicer || '—'],
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-600">{label}</span>
                <span className="font-medium text-slate-900">{value}</span>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
}
