import { useProperty } from '../store/PropertyContext';
import Card from '../components/Card';
import FormField from '../components/FormField';
import { getCompleteness } from '../utils/calculations';
import { useState } from 'react';

const sections = [
  { id: 'purchase', label: 'A. Purchase & Loan', icon: '🏠' },
  { id: 'taxes', label: 'B. Taxes & Insurance', icon: '📋' },
  { id: 'details', label: 'C. Property Details', icon: '🔑' },
  { id: 'rental', label: 'D. Rental Assumptions', icon: '💰' },
  { id: 'va', label: 'E. VA / Future Purchase', icon: '🎖' },
  { id: 'operations', label: 'F. Operations', icon: '⚙' },
  { id: 'goals', label: 'G. Goals & Priorities', icon: '🎯' },
];

export default function IntakeForm() {
  const { state, dispatch } = useProperty();
  const [activeSection, setActiveSection] = useState('purchase');
  const completeness = getCompleteness(state);

  const update = (section, field, value) => {
    dispatch({ type: 'SET_FIELD', section, field, value });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Data Intake</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Fill in your property data to unlock all analysis modules. Critical fields: {completeness.filled}/{completeness.total} complete.
        </p>
      </div>

      {/* Progress Bar */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Overall Completeness</span>
          <span className="text-sm font-bold text-slate-900 dark:text-slate-100">{completeness.percent}%</span>
        </div>
        <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-500 ${completeness.percent === 100 ? 'bg-green-500' : completeness.percent > 50 ? 'bg-yellow-500' : 'bg-red-500'}`}
            style={{ width: `${completeness.percent}%` }}
          />
        </div>
      </div>

      {/* Section Tabs */}
      <div className="flex sm:flex-wrap gap-2 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 sm:overflow-visible">
        {sections.map(s => (
          <button
            key={s.id}
            onClick={() => setActiveSection(s.id)}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap min-h-[44px] flex-shrink-0 ${
              activeSection === s.id
                ? 'bg-blue-600 text-white'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Purchase & Loan */}
      {activeSection === 'purchase' && (
        <Card title="A. Purchase & Loan">
          <div className="grid sm:grid-cols-2 gap-4">
            <FormField label="Purchase Date" type="date" value={state.property.purchaseDate} onChange={v => update('property', 'purchaseDate', v)} required />
            <FormField label="Purchase Price" prefix="$" value={state.property.purchasePrice} onChange={v => update('property', 'purchasePrice', v)} placeholder="325,000" required />
            <FormField label="Original VA Loan Amount" prefix="$" value={state.mortgage.originalLoanAmount} onChange={v => update('mortgage', 'originalLoanAmount', v)} required />
            <FormField label="VA Funding Fee" prefix="$" value={state.mortgage.vaFundingFee} onChange={v => update('mortgage', 'vaFundingFee', v)} />
            <FormField label="Funding Fee Financed?" type="select" value={state.mortgage.vaFundingFeeFinanced ? 'yes' : 'no'} onChange={v => update('mortgage', 'vaFundingFeeFinanced', v === 'yes')} options={['yes', 'no']} />
            <FormField label="Down Payment" prefix="$" value={state.mortgage.downPayment} onChange={v => update('mortgage', 'downPayment', v)} />
            <FormField label="Current Loan Balance" prefix="$" value={state.mortgage.currentBalance} onChange={v => update('mortgage', 'currentBalance', v)} placeholder="Most recent statement" required />
            <FormField label="Interest Rate" suffix="%" value={state.mortgage.interestRate} onChange={v => update('mortgage', 'interestRate', v)} placeholder="3.25" required />
            <FormField label="Rate Type" type="select" value={state.mortgage.rateType} onChange={v => update('mortgage', 'rateType', v)} options={['fixed', 'adjustable']} />
            <FormField label="Loan Term" type="select" value={state.mortgage.loanTerm} onChange={v => update('mortgage', 'loanTerm', v)} options={['15', '20', '25', '30']} />
            <FormField label="Monthly P&I Payment" prefix="$" value={state.mortgage.monthlyPI} onChange={v => update('mortgage', 'monthlyPI', v)} required />
            <FormField label="Monthly Escrow Amount" prefix="$" value={state.mortgage.monthlyEscrow} onChange={v => update('mortgage', 'monthlyEscrow', v)} />
            <FormField label="Total Monthly Payment" prefix="$" value={state.mortgage.totalMonthlyPayment} onChange={v => update('mortgage', 'totalMonthlyPayment', v)} helpText="P&I + Escrow" />
            <FormField label="Mortgage Servicer" value={state.mortgage.servicer} onChange={v => update('mortgage', 'servicer', v)} placeholder="e.g., Freedom Mortgage" />
            <FormField label="Refinance History" type="textarea" value={state.mortgage.refinanceHistory} onChange={v => update('mortgage', 'refinanceHistory', v)} placeholder="Date, old rate, new rate, etc." />
          </div>
        </Card>
      )}

      {/* Taxes & Insurance */}
      {activeSection === 'taxes' && (
        <Card title="B. Taxes & Insurance">
          <div className="grid sm:grid-cols-2 gap-4">
            <FormField label="Annual Property Tax" prefix="$" value={state.taxesInsurance.annualPropertyTax} onChange={v => update('taxesInsurance', 'annualPropertyTax', v)} required />
            <FormField label="Homestead Exemption?" type="select" value={state.taxesInsurance.homesteadExemption} onChange={v => update('taxesInsurance', 'homesteadExemption', v)} options={['yes', 'no', 'unknown']} />
            <FormField label="County Assessed Value" prefix="$" value={state.taxesInsurance.countyAssessedValue} onChange={v => update('taxesInsurance', 'countyAssessedValue', v)} />
            <FormField label="County Land Value" prefix="$" value={state.taxesInsurance.countyLandValue} onChange={v => update('taxesInsurance', 'countyLandValue', v)} helpText="From property appraiser — needed for depreciation" />
            <FormField label="Insurance Annual Premium" prefix="$" value={state.taxesInsurance.insurancePremium} onChange={v => update('taxesInsurance', 'insurancePremium', v)} required />
            <FormField label="Insurance Carrier" value={state.taxesInsurance.insuranceCarrier} onChange={v => update('taxesInsurance', 'insuranceCarrier', v)} />
            <FormField label="Insurance Renewal Date" type="date" value={state.taxesInsurance.insuranceRenewalDate} onChange={v => update('taxesInsurance', 'insuranceRenewalDate', v)} />
            <FormField label="Hurricane Deductible" value={state.taxesInsurance.hurricaneDeductible} onChange={v => update('taxesInsurance', 'hurricaneDeductible', v)} placeholder="e.g., 2% or $5,000" />
            <FormField label="Flood Insurance?" type="select" value={state.taxesInsurance.hasFloodInsurance} onChange={v => update('taxesInsurance', 'hasFloodInsurance', v)} options={['yes', 'no', 'unknown']} />
            <FormField label="Flood Premium" prefix="$" value={state.taxesInsurance.floodPremium} onChange={v => update('taxesInsurance', 'floodPremium', v)} />
            <FormField label="Flood Carrier" value={state.taxesInsurance.floodCarrier} onChange={v => update('taxesInsurance', 'floodCarrier', v)} />
            <FormField label="Flood Zone" value={state.taxesInsurance.floodZoneDesignation} onChange={v => update('taxesInsurance', 'floodZoneDesignation', v)} placeholder="A, AE, X, VE, etc." />
            <FormField label="Separate Windstorm Policy?" type="select" value={state.taxesInsurance.hasSeparateWindstorm} onChange={v => update('taxesInsurance', 'hasSeparateWindstorm', v)} options={['yes', 'no', 'unknown']} />
            <FormField label="Umbrella Policy?" type="select" value={state.taxesInsurance.hasUmbrella} onChange={v => update('taxesInsurance', 'hasUmbrella', v)} options={['yes', 'no']} />
            <FormField label="Umbrella Coverage Amount" prefix="$" value={state.taxesInsurance.umbrellaAmount} onChange={v => update('taxesInsurance', 'umbrellaAmount', v)} />
            <FormField label="HOA Name" value={state.property.hoaName} onChange={v => update('property', 'hoaName', v)} />
            <FormField label="HOA Monthly Dues" prefix="$" value={state.property.hoaDues} onChange={v => update('property', 'hoaDues', v)} />
          </div>
        </Card>
      )}

      {/* Property Details */}
      {activeSection === 'details' && (
        <Card title="C. Property Details">
          <div className="grid sm:grid-cols-2 gap-4">
            <FormField label="Property Type" type="select" value={state.property.propertyType} onChange={v => update('property', 'propertyType', v)} options={['single-family', 'townhome', 'condo', 'duplex']} />
            <FormField label="Year Built" value={state.property.yearBuilt} onChange={v => update('property', 'yearBuilt', v)} placeholder="2005" />
            <FormField label="Square Footage" value={state.property.sqft} onChange={v => update('property', 'sqft', v)} placeholder="1,800" />
            <FormField label="Bedrooms" value={state.property.beds} onChange={v => update('property', 'beds', v)} />
            <FormField label="Bathrooms" value={state.property.baths} onChange={v => update('property', 'baths', v)} />
            <FormField label="Garage" type="select" value={state.property.garage} onChange={v => update('property', 'garage', v)} options={['none', '1-car', '2-car', '3-car']} />
            <FormField label="Pool" type="checkbox" value={state.property.pool} onChange={v => update('property', 'pool', v)} />
            <FormField label="Roof Type & Age" value={state.property.roofType} onChange={v => update('property', 'roofType', v)} placeholder="Shingle, ~10 years" />
            <FormField label="HVAC Type & Age" value={state.property.hvacType} onChange={v => update('property', 'hvacType', v)} placeholder="Central, ~8 years" />
            <FormField label="Water Heater Type & Age" value={state.property.waterHeaterType} onChange={v => update('property', 'waterHeaterType', v)} placeholder="Tank, ~5 years" />
            <FormField label="Current Condition" type="select" value={state.property.condition} onChange={v => update('property', 'condition', v)} options={['excellent', 'good', 'fair', 'needs-work']} />
            <FormField label="Known Repairs Needed" type="textarea" value={state.property.knownRepairs} onChange={v => update('property', 'knownRepairs', v)} />
            <FormField label="Major Renovations Since Purchase" type="textarea" value={state.property.renovations} onChange={v => update('property', 'renovations', v)} />
          </div>
        </Card>
      )}

      {/* Rental Assumptions */}
      {activeSection === 'rental' && (
        <Card title="D. Rental Assumptions">
          <div className="grid sm:grid-cols-2 gap-4">
            <FormField label="Target Monthly Rent" prefix="$" value={state.rental.targetRent} onChange={v => update('rental', 'targetRent', v)} placeholder="1,800" required />
            <FormField label="Rental Comps Reviewed?" type="checkbox" value={state.rental.rentalCompsReviewed} onChange={v => update('rental', 'rentalCompsReviewed', v)} />
            <FormField label="Management Fee %" suffix="%" value={state.rental.managementFeePercent} onChange={v => update('rental', 'managementFeePercent', v)} helpText="Typical: 8–10%" />
            <FormField label="Leasing Fee %" suffix="%" value={state.rental.leasingFeePercent} onChange={v => update('rental', 'leasingFeePercent', v)} helpText="% of first month rent. Typical: 50–100%" />
            <FormField label="Vacancy Allowance %" suffix="%" value={state.rental.vacancyRatePercent} onChange={v => update('rental', 'vacancyRatePercent', v)} helpText="Annualized budget estimate. 8% ≈ 1 month/yr, but actual vacancy is unpredictable" />
            <FormField label="Maintenance Reserve %" suffix="%" value={state.rental.maintenanceReservePercent} onChange={v => update('rental', 'maintenanceReservePercent', v)} helpText="Annual budget target (5–10%). Actual repairs are lumpy and irregular" />
            <FormField label="CapEx Reserve %" suffix="%" value={state.rental.capexReservePercent} onChange={v => update('rental', 'capexReservePercent', v)} helpText="Annual budget target (~5%). Covers big-ticket items: roof, HVAC, appliances over time" />
            <FormField label="Owner-Paid Utilities" value={state.rental.ownerPaidUtilities} onChange={v => update('rental', 'ownerPaidUtilities', v)} placeholder="None, or list: water, lawn..." />
            <FormField label="Desired Lease Start" type="date" value={state.rental.desiredLeaseStart} onChange={v => update('rental', 'desiredLeaseStart', v)} />
            <FormField label="Allow Pets?" type="select" value={state.rental.allowPets} onChange={v => update('rental', 'allowPets', v)} options={['yes', 'no', 'case-by-case']} />
            <FormField label="Min Lease Term (months)" value={state.rental.minLeaseTerm} onChange={v => update('rental', 'minLeaseTerm', v)} />
            <FormField label="Furnished?" type="checkbox" value={state.rental.furnished} onChange={v => update('rental', 'furnished', v)} />
            <FormField label="Lawn/Pest Vendor" value={state.rental.lawnPestVendor} onChange={v => update('rental', 'lawnPestVendor', v)} />
          </div>
          <div className="mt-4 pt-4 border-t-2 border-blue-200 dark:border-blue-700">
            <p className="text-sm font-semibold text-blue-800 dark:text-blue-300 mb-3">Cash Reserves</p>
            <div className="grid sm:grid-cols-2 gap-4">
            <FormField label="Reserve Cash on Hand" prefix="$" value={state.rental.reserveCash} onChange={v => update('rental', 'reserveCash', v)} placeholder="8,000" helpText="Actual cash set aside for this property" />
            </div>
          </div>
        </Card>
      )}

      {/* VA / Future Purchase */}
      {activeSection === 'va' && (
        <Card title="E. VA Benefit / Future Purchase">
          <div className="grid sm:grid-cols-2 gap-4">
            <FormField label="COE Available?" type="select" value={state.vaBenefit.hasCOE} onChange={v => update('vaBenefit', 'hasCOE', v)} options={['yes', 'no', 'need-to-request']} />
            <FormField label="Entitlement Charged (from COE)" prefix="$" value={state.vaBenefit.entitlementCharged} onChange={v => update('vaBenefit', 'entitlementCharged', v)} />
            <FormField label="Previous Restoration Used?" type="select" value={state.vaBenefit.previousRestoration} onChange={v => update('vaBenefit', 'previousRestoration', v)} options={['yes', 'no', 'unknown']} />
            <FormField label="VA Disability Rating?" type="select" value={state.vaBenefit.disabilityRating} onChange={v => update('vaBenefit', 'disabilityRating', v)} options={['yes', 'no']} />
            <FormField label="Disability %" suffix="%" value={state.vaBenefit.disabilityPercent} onChange={v => update('vaBenefit', 'disabilityPercent', v)} />
            <FormField label="Target State for Next Home" value={state.vaBenefit.targetState} onChange={v => update('vaBenefit', 'targetState', v)} />
            <FormField label="Target County for Next Home" value={state.vaBenefit.targetCounty} onChange={v => update('vaBenefit', 'targetCounty', v)} />
            <FormField label="Target Price Range" prefix="$" value={state.vaBenefit.targetPriceRange} onChange={v => update('vaBenefit', 'targetPriceRange', v)} placeholder="350,000 – 500,000" />
            <FormField label="Down Payment Budget" prefix="$" value={state.vaBenefit.downPaymentBudget} onChange={v => update('vaBenefit', 'downPaymentBudget', v)} />
            <FormField label="Approximate Credit Score" value={state.vaBenefit.creditScore} onChange={v => update('vaBenefit', 'creditScore', v)} />
            <FormField label="DTI Concerns?" type="textarea" value={state.vaBenefit.dtiConcerns} onChange={v => update('vaBenefit', 'dtiConcerns', v)} />
            <FormField label="Gross Monthly Income" prefix="$" value={state.vaBenefit.grossMonthlyIncome} onChange={v => update('vaBenefit', 'grossMonthlyIncome', v)} />
            <FormField label="Buy Before or After PCS?" type="select" value={state.vaBenefit.buyBeforeOrAfterPCS} onChange={v => update('vaBenefit', 'buyBeforeOrAfterPCS', v)} options={['before', 'after', 'undecided']} />
          </div>
        </Card>
      )}

      {/* Operations */}
      {activeSection === 'operations' && (
        <Card title="F. Operations & Timeline">
          <div className="grid sm:grid-cols-2 gap-4">
            <FormField label="Currently Living in Property?" type="select" value={state.operations.currentlyOccupied} onChange={v => update('operations', 'currentlyOccupied', v)} options={['yes', 'no', 'moving-out-soon']} />
            <FormField label="Property Status" type="select" value={state.property.status} onChange={v => update('property', 'status', v)} options={[
              { value: 'owner-occupied', label: 'Owner Occupied' },
              { value: 'preparing-for-rent', label: 'Preparing for Rent' },
              { value: 'listed', label: 'Listed for Rent' },
              { value: 'tenant-occupied', label: 'Tenant Occupied' },
              { value: 'vacant', label: 'Vacant' },
              { value: 'under-repair', label: 'Under Repair' },
              { value: 'for-sale', label: 'For Sale' },
            ]} />
            <FormField label="Current Duty Station" value={state.operations.currentDutyStation} onChange={v => update('operations', 'currentDutyStation', v)} />
            <FormField label="Expected PCS Date" type="date" value={state.operations.expectedPCSDate} onChange={v => update('operations', 'expectedPCSDate', v)} />
            <FormField label="Next Duty Station" value={state.operations.nextDutyStation} onChange={v => update('operations', 'nextDutyStation', v)} />
            <FormField label="OCONUS or CONUS?" type="select" value={state.operations.oconusOrConus} onChange={v => update('operations', 'oconusOrConus', v)} options={['CONUS', 'OCONUS', 'unknown']} />
            <FormField label="Property Manager" value={state.operations.propertyManager} onChange={v => update('operations', 'propertyManager', v)} placeholder="Name or company" />
            <FormField label="CPA / Tax Advisor" value={state.operations.cpa} onChange={v => update('operations', 'cpa', v)} />
            <FormField label="Real Estate Attorney" value={state.operations.attorney} onChange={v => update('operations', 'attorney', v)} />
            <FormField label="Local Emergency Contact" value={state.operations.localEmergencyContact} onChange={v => update('operations', 'localEmergencyContact', v)} />
            <FormField label="Dashboard Update Frequency" type="select" value={state.operations.updateFrequency} onChange={v => update('operations', 'updateFrequency', v)} options={['weekly', 'monthly']} />
            <FormField label="HOA Rental Restrictions" type="textarea" value={state.property.hoaRentalRestrictions} onChange={v => update('property', 'hoaRentalRestrictions', v)} placeholder="Describe any restrictions..." />
          </div>
        </Card>
      )}

      {/* Goals */}
      {activeSection === 'goals' && (
        <Card title="G. Goals & Priorities">
          <div className="grid sm:grid-cols-2 gap-4">
            <FormField label="Primary Goal" type="select" value={state.goals.primaryGoal} onChange={v => update('goals', 'primaryGoal', v)} options={[
              { value: 'cash-flow', label: 'Cash Flow' },
              { value: 'appreciation', label: 'Long-term Appreciation' },
              { value: 'both', label: 'Both Cash Flow + Appreciation' },
              { value: 'cover-costs', label: 'Just Cover Costs' },
            ]} />
            <FormField label="Sell If No Break-Even?" type="select" value={state.goals.sellIfNoBreakEven} onChange={v => update('goals', 'sellIfNoBreakEven', v)} options={['yes', 'no', 'depends']} />
            <FormField label="How Long to Hold?" type="select" value={state.goals.holdDuration} onChange={v => update('goals', 'holdDuration', v)} options={[
              { value: '1-3', label: '1–3 years' },
              { value: '3-5', label: '3–5 years' },
              { value: '5-10', label: '5–10 years' },
              { value: 'indefinite', label: 'Indefinitely' },
            ]} />
            <FormField label="Open to Property Manager?" type="select" value={state.goals.openToPropertyManager} onChange={v => update('goals', 'openToPropertyManager', v)} options={['yes', 'already-decided', 'no']} />
            <FormField label="Risk Tolerance" type="select" value={state.goals.riskTolerance} onChange={v => update('goals', 'riskTolerance', v)} options={['conservative', 'moderate', 'aggressive']} />
            <FormField label="Other Properties" type="textarea" value={state.goals.otherProperties} onChange={v => update('goals', 'otherProperties', v)} />
            <FormField label="Anything Else?" type="textarea" value={state.goals.otherNotes} onChange={v => update('goals', 'otherNotes', v)} />
          </div>
        </Card>
      )}
    </div>
  );
}
