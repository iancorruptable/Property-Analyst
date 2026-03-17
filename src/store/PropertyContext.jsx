import { createContext, useContext, useReducer, useEffect } from 'react';

const PropertyContext = createContext();

const defaultState = {
  // Module 2 - Property Profile
  property: {
    address: '9577 Naples Lane, Navarre, FL 32566',
    county: 'Santa Rosa County, FL',
    status: '', // owner-occupied, preparing-for-rent, listed, tenant-occupied, vacant, under-repair, for-sale
    purchaseDate: '',
    purchasePrice: '',
    propertyType: '',
    yearBuilt: '',
    sqft: '',
    beds: '',
    baths: '',
    garage: '',
    pool: false,
    roofType: '',
    roofAge: '',
    hvacType: '',
    hvacAge: '',
    waterHeaterType: '',
    waterHeaterAge: '',
    condition: '',
    knownRepairs: '',
    renovations: '',
    floodZone: '',
    hoaName: '',
    hoaDues: '',
    hoaDuesFrequency: 'monthly',
    hoaRentalRestrictions: '',
    hoaApprovalRequired: '',
    hoaMinLeaseTerm: '',
  },

  // Module 4 - Mortgage
  mortgage: {
    loanType: 'VA',
    isVaLoan: true,
    originalLoanAmount: '',
    currentBalance: '',
    interestRate: '',
    rateType: 'fixed',
    loanTerm: '30',
    monthlyPI: '',
    monthlyEscrow: '',
    totalMonthlyPayment: '',
    servicer: '',
    vaFundingFee: '',
    vaFundingFeeFinanced: false,
    downPayment: '',
    refinanceHistory: '',
  },

  // Module B - Taxes & Insurance
  taxesInsurance: {
    annualPropertyTax: '',
    homesteadExemption: '',
    countyAssessedValue: '',
    countyLandValue: '',
    insurancePremium: '',
    insuranceCarrier: '',
    insuranceRenewalDate: '',
    hurricaneDeductible: '',
    hasFloodInsurance: '',
    floodPremium: '',
    floodCarrier: '',
    floodZoneDesignation: '',
    hasSeparateWindstorm: '',
    hasUmbrella: '',
    umbrellaAmount: '',
  },

  // Module D - Rental assumptions
  rental: {
    targetRent: '',
    rentalCompsReviewed: false,
    managementFeePercent: '10',
    leasingFeePercent: '75',
    vacancyRatePercent: '8',
    maintenanceReservePercent: '8',
    capexReservePercent: '5',
    ownerPaidUtilities: '',
    desiredLeaseStart: '',
    allowPets: '',
    minLeaseTerm: '12',
    furnished: false,
    lawnPestVendor: '',
    reserveCash: '',
    rentEscalationPercent: '3',
    expenseGrowthPercent: '2',
    currentMarketRate: '6.5',
    inflationRate: '3.2',
  },

  // Module E - VA / Future Purchase
  vaBenefit: {
    hasCOE: '',
    entitlementCharged: '',
    previousRestoration: '',
    disabilityRating: '',
    disabilityPercent: '',
    targetState: '',
    targetCounty: '',
    targetPriceRange: '',
    downPaymentBudget: '',
    creditScore: '',
    dtiConcerns: '',
    grossMonthlyIncome: '',
    buyBeforeOrAfterPCS: '',
  },

  // Module F - Operations
  operations: {
    currentlyOccupied: '',
    currentDutyStation: '',
    expectedPCSDate: '',
    nextDutyStation: '',
    oconusOrConus: '',
    propertyManager: '',
    cpa: '',
    attorney: '',
    localEmergencyContact: '',
    updateFrequency: 'monthly',
    hoaRentalRestrictions: '',
    militaryConsiderations: '',
  },

  // Module G - Goals
  goals: {
    primaryGoal: '',
    sellIfNoBreakEven: '',
    holdDuration: '',
    openToPropertyManager: '',
    riskTolerance: 'conservative',
    otherProperties: '',
    otherNotes: '',
  },

  // Module 5 - Value estimates
  valueEstimates: [],

  // Module 6 - Rent readiness checklist
  rentReadiness: {},

  // Module 7 - Cash flow entries
  cashFlowEntries: [],

  // Module 8 - Tax expenses
  taxExpenses: [],

  // Module 11 - Tenant info
  tenant: {
    name: '',
    phone: '',
    email: '',
    leaseStart: '',
    leaseEnd: '',
    monthlyRent: '',
    securityDeposit: '',
    petDeposit: '',
    petRent: '',
    status: '', // none, screening, active, notice-given, moved-out
  },

  // Module 12 - Maintenance log
  maintenanceLog: [],

  // Module 13 - Insurance policies
  insurancePolicies: [],

  // Module 15 - Custom alerts
  customAlerts: [],

  // Module 16 - Documents
  documents: {},

  // Module 10 - Property Manager
  propertyManager: {
    companyName: '',
    contactPerson: '',
    phone: '',
    email: '',
    website: '',
    contractStart: '',
    contractEnd: '',
    managementFee: '',
    leasingFee: '',
    renewalFee: '',
    maintenanceMarkup: '',
    approvalThreshold: '',
    minimumReserve: '',
    cancellationTerms: '',
    scores: {
      responsiveness: 0,
      accuracy: 0,
      costControl: 0,
      tenantQuality: 0,
      turnSpeed: 0,
      inspectionQuality: 0,
      communicationClarity: 0,
      compliance: 0,
      technology: 0,
    },
  },

  // Global filters
  analysisYear: new Date().getFullYear(),

  // Metadata
  lastUpdated: new Date().toISOString(),
};

function loadState() {
  try {
    const saved = localStorage.getItem('property-analyst-data');
    if (saved) {
      const parsed = JSON.parse(saved);
      return { ...defaultState, ...parsed };
    }
  } catch (e) {
    console.error('Failed to load state:', e);
  }
  return defaultState;
}

function reducer(state, action) {
  switch (action.type) {
    case 'UPDATE_SECTION':
      return {
        ...state,
        [action.section]: { ...state[action.section], ...action.data },
        lastUpdated: new Date().toISOString(),
      };
    case 'SET_FIELD':
      return {
        ...state,
        [action.section]: { ...state[action.section], [action.field]: action.value },
        lastUpdated: new Date().toISOString(),
      };
    case 'ADD_TO_ARRAY':
      return {
        ...state,
        [action.section]: [...(state[action.section] || []), action.item],
        lastUpdated: new Date().toISOString(),
      };
    case 'UPDATE_ARRAY_ITEM':
      return {
        ...state,
        [action.section]: state[action.section].map((item, i) =>
          i === action.index ? { ...item, ...action.data } : item
        ),
        lastUpdated: new Date().toISOString(),
      };
    case 'REMOVE_FROM_ARRAY':
      return {
        ...state,
        [action.section]: state[action.section].filter((_, i) => i !== action.index),
        lastUpdated: new Date().toISOString(),
      };
    case 'SET_RENT_READINESS':
      return {
        ...state,
        rentReadiness: { ...state.rentReadiness, [action.key]: action.value },
        lastUpdated: new Date().toISOString(),
      };
    case 'SET_ANALYSIS_YEAR':
      return { ...state, analysisYear: action.year };
    case 'IMPORT_DATA':
      return {
        ...defaultState,
        ...action.data,
        lastUpdated: new Date().toISOString(),
      };
    case 'RESET':
      return defaultState;
    default:
      return state;
  }
}

export function PropertyProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, null, loadState);

  useEffect(() => {
    localStorage.setItem('property-analyst-data', JSON.stringify(state));
  }, [state]);

  return (
    <PropertyContext.Provider value={{ state, dispatch }}>
      {children}
    </PropertyContext.Provider>
  );
}

export function useProperty() {
  const context = useContext(PropertyContext);
  if (!context) throw new Error('useProperty must be used within PropertyProvider');
  return context;
}

export { defaultState };
