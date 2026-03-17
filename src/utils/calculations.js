// Parse a currency string or number into a float
export function parseCurrency(val) {
  if (!val && val !== 0) return 0;
  if (typeof val === 'number') return val;
  return parseFloat(String(val).replace(/[^0-9.-]/g, '')) || 0;
}

// Format number as currency
export function formatCurrency(val) {
  const num = parseCurrency(val);
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(num);
}

// Format as percentage
export function formatPercent(val, decimals = 1) {
  const num = typeof val === 'number' ? val : parseFloat(val) || 0;
  return `${num.toFixed(decimals)}%`;
}

// Calculate monthly mortgage P&I
export function calcMonthlyPI(principal, annualRate, termYears) {
  const r = annualRate / 100 / 12;
  const n = termYears * 12;
  if (r === 0) return principal / n;
  return principal * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
}

// Calculate equity
export function calcEquity(estimatedValue, loanBalance) {
  return parseCurrency(estimatedValue) - parseCurrency(loanBalance);
}

// Calculate LTV
export function calcLTV(loanBalance, estimatedValue) {
  const value = parseCurrency(estimatedValue);
  if (value === 0) return 0;
  return (parseCurrency(loanBalance) / value) * 100;
}

// Cash flow analysis
export function calcCashFlow(state) {
  const rent = parseCurrency(state.rental?.targetRent);
  const vacancyRate = parseFloat(state.rental?.vacancyRatePercent || 8) / 100;
  const mgmtFeeRate = parseFloat(state.rental?.managementFeePercent || 10) / 100;
  const maintRate = parseFloat(state.rental?.maintenanceReservePercent || 8) / 100;
  const capexRate = parseFloat(state.rental?.capexReservePercent || 5) / 100;

  const grossRent = rent;
  const vacancyLoss = grossRent * vacancyRate;
  const effectiveGross = grossRent - vacancyLoss;
  const mgmtFee = effectiveGross * mgmtFeeRate;
  const maintenance = grossRent * maintRate;
  const capex = grossRent * capexRate;

  const taxes = parseCurrency(state.taxesInsurance?.annualPropertyTax) / 12;
  const insurance = parseCurrency(state.taxesInsurance?.insurancePremium) / 12;
  const flood = parseCurrency(state.taxesInsurance?.floodPremium) / 12;
  const hoa = parseCurrency(state.property?.hoaDues);

  const totalOpEx = mgmtFee + maintenance + capex + taxes + insurance + flood + hoa;
  const noi = effectiveGross - totalOpEx;

  const debtService = parseCurrency(state.mortgage?.monthlyPI);
  const cashFlow = noi - debtService;

  return {
    grossRent,
    vacancyLoss,
    effectiveGross,
    mgmtFee,
    maintenance,
    capex,
    taxes,
    insurance,
    flood,
    hoa,
    totalOpEx,
    noi,
    debtService,
    cashFlow,
  };
}

// Break-even rent
export function calcBreakEvenRent(state) {
  const taxes = parseCurrency(state.taxesInsurance?.annualPropertyTax) / 12;
  const insurance = parseCurrency(state.taxesInsurance?.insurancePremium) / 12;
  const flood = parseCurrency(state.taxesInsurance?.floodPremium) / 12;
  const hoa = parseCurrency(state.property?.hoaDues);
  const debtService = parseCurrency(state.mortgage?.monthlyPI);

  const fixedCosts = taxes + insurance + flood + hoa + debtService;

  const vacancyRate = parseFloat(state.rental?.vacancyRatePercent || 8) / 100;
  const mgmtRate = parseFloat(state.rental?.managementFeePercent || 10) / 100;
  const maintRate = parseFloat(state.rental?.maintenanceReservePercent || 8) / 100;
  const capexRate = parseFloat(state.rental?.capexReservePercent || 5) / 100;

  // Management fee is on effective gross (post-vacancy), so the correct
  // algebraic break-even divisor is: (1-vacancy)*(1-mgmt) - maint - capex
  const divisor = (1 - vacancyRate) * (1 - mgmtRate) - maintRate - capexRate;
  if (divisor <= 0) return fixedCosts * 3;
  return fixedCosts / divisor;
}

// VA entitlement calculation
export function calcVAEntitlement(originalLoanAmount, countyLoanLimit = 766550) {
  const loan = parseCurrency(originalLoanAmount);
  const entitlementCharged = loan * 0.25;
  const maxGuaranty = countyLoanLimit * 0.25;
  const remaining = Math.max(0, maxGuaranty - entitlementCharged);
  const zeroDownPower = remaining * 4;

  return {
    entitlementCharged,
    maxGuaranty,
    remaining,
    zeroDownPower,
  };
}

// Calculate down payment for future purchase
export function calcDownPayment(futurePrice, zeroDownPower) {
  if (futurePrice <= zeroDownPower) return 0;
  return (futurePrice - zeroDownPower) * 0.25;
}

// Depreciation calculator
export function calcDepreciation(costBasis, landValue) {
  const building = parseCurrency(costBasis) - parseCurrency(landValue);
  if (building <= 0) return { annual: 0, monthly: 0, buildingValue: 0 };
  const annual = building / 27.5;
  return { annual, monthly: annual / 12, buildingValue: building };
}

// Multi-year cash flow projection
export function calcMultiYearCashFlow(state, years = 10) {
  const rent = parseCurrency(state.rental?.targetRent);
  const vacancyRate = parseFloat(state.rental?.vacancyRatePercent || 8) / 100;
  const mgmtRate = parseFloat(state.rental?.managementFeePercent || 10) / 100;
  const maintRate = parseFloat(state.rental?.maintenanceReservePercent || 8) / 100;
  const capexRate = parseFloat(state.rental?.capexReservePercent || 5) / 100;
  const rentEscalation = parseFloat(state.rental?.rentEscalationPercent || 3) / 100;
  const expenseGrowth = parseFloat(state.rental?.expenseGrowthPercent || 2) / 100;

  const monthlyTaxes = parseCurrency(state.taxesInsurance?.annualPropertyTax) / 12;
  const monthlyInsurance = parseCurrency(state.taxesInsurance?.insurancePremium) / 12;
  const monthlyFlood = parseCurrency(state.taxesInsurance?.floodPremium) / 12;
  const hoa = parseCurrency(state.property?.hoaDues);
  const debtService = parseCurrency(state.mortgage?.monthlyPI);

  const purchasePrice = parseCurrency(state.property?.purchasePrice);
  const landValue = parseCurrency(state.taxesInsurance?.countyLandValue);
  const dep = purchasePrice > 0 ? calcDepreciation(purchasePrice, landValue) : null;
  const monthlyDepreciation = dep?.monthly || 0;
  const marginalTaxRate = parseFloat(state.rental?.marginalTaxRate || 22) / 100;

  const projections = [];
  for (let y = 0; y < years; y++) {
    const yearRent = rent * Math.pow(1 + rentEscalation, y);
    const expenseFactor = Math.pow(1 + expenseGrowth, y);

    const grossRent = yearRent * 12;
    const vacancyLoss = grossRent * vacancyRate;
    const effectiveGross = grossRent - vacancyLoss;
    const mgmtFee = effectiveGross * mgmtRate;
    const maintenance = grossRent * maintRate;
    const capex = grossRent * capexRate;
    const taxes = monthlyTaxes * 12 * expenseFactor;
    const insurance = (monthlyInsurance + monthlyFlood) * 12 * expenseFactor;
    const hoaAnnual = hoa * 12 * expenseFactor;

    const totalOpEx = mgmtFee + maintenance + capex + taxes + insurance + hoaAnnual;
    const noi = effectiveGross - totalOpEx;
    const annualDebt = debtService * 12;
    const preTaxCashFlow = noi - annualDebt;

    // Tax impact
    const annualDepreciation = monthlyDepreciation * 12;
    // Mortgage interest estimate declines over time (rough linear approximation)
    const interestRatio = Math.max(0.3, 0.7 - y * 0.015);
    const mortgageInterest = annualDebt * (parseFloat(state.mortgage?.interestRate || 0) / 100) * interestRatio;
    const taxableIncome = effectiveGross - totalOpEx - mortgageInterest - annualDepreciation;
    const taxImpact = taxableIncome * marginalTaxRate;
    const afterTaxCashFlow = preTaxCashFlow - taxImpact;

    projections.push({
      year: y + 1,
      monthlyRent: yearRent,
      grossRent,
      noi,
      preTaxCashFlow,
      afterTaxCashFlow,
      annualDepreciation,
      taxableIncome,
      taxImpact,
      cumulativePreTax: projections.reduce((s, p) => s + p.preTaxCashFlow, 0) + preTaxCashFlow,
      cumulativeAfterTax: projections.reduce((s, p) => s + p.afterTaxCashFlow, 0) + afterTaxCashFlow,
    });
  }
  return projections;
}

// Status color helper
export function getStatusColor(status) {
  switch (status) {
    case 'green': return 'bg-green-100 text-green-800 border-green-300';
    case 'yellow': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    case 'red': return 'bg-red-100 text-red-800 border-red-300';
    default: return 'bg-gray-100 text-gray-800 border-gray-300';
  }
}

// Determine data completeness
export function getCompleteness(state) {
  const critical = [
    state.property?.purchasePrice,
    state.mortgage?.currentBalance,
    state.mortgage?.interestRate,
    state.mortgage?.monthlyPI,
    state.taxesInsurance?.annualPropertyTax,
    state.taxesInsurance?.insurancePremium,
    state.rental?.targetRent,
  ];
  const filled = critical.filter(v => v && String(v).trim() !== '').length;
  return { filled, total: critical.length, percent: Math.round((filled / critical.length) * 100) };
}
