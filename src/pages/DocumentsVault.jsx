import { useProperty } from '../store/PropertyContext';
import Card from '../components/Card';
import { CheckCircle2, Circle, FileText, Download, Upload } from 'lucide-react';
import { useRef } from 'react';

const documentCategories = [
  { category: 'Purchase & Closing', items: [
    { key: 'closingDisclosure', label: 'Closing Disclosure (CD)' },
    { key: 'deedRecorded', label: 'Recorded Warranty Deed' },
    { key: 'titlePolicy', label: 'Title Insurance Policy' },
    { key: 'appraisal', label: 'Purchase Appraisal' },
    { key: 'survey', label: 'Property Survey' },
    { key: 'homeInspection', label: 'Home Inspection Report' },
    { key: 'purchaseContract', label: 'Purchase Contract' },
  ]},
  { category: 'Mortgage & VA', items: [
    { key: 'promissoryNote', label: 'Promissory Note' },
    { key: 'mortgageDeed', label: 'Mortgage / Deed of Trust' },
    { key: 'vaLoanCert', label: 'VA Loan Certificate' },
    { key: 'coe', label: 'Certificate of Eligibility (COE)' },
    { key: 'amortizationSchedule', label: 'Amortization Schedule' },
    { key: 'loanStatements', label: 'Recent Loan Statements' },
  ]},
  { category: 'Insurance', items: [
    { key: 'homeownerPolicy', label: 'Homeowner / Landlord Policy (Declarations Page)' },
    { key: 'floodPolicy', label: 'Flood Insurance Policy' },
    { key: 'umbrellaPolicy', label: 'Umbrella Policy' },
    { key: 'windstormPolicy', label: 'Windstorm Policy (if separate)' },
    { key: 'windMitigation', label: 'Wind Mitigation Inspection Report' },
    { key: 'fourPoint', label: '4-Point Inspection Report' },
  ]},
  { category: 'Tax & Financial', items: [
    { key: 'taxBill', label: 'Property Tax Bill (current year)' },
    { key: 'assessorRecord', label: 'County Assessor Record / Value Notice' },
    { key: 'scheduleE', label: 'Schedule E (prior year if applicable)' },
    { key: 'depreciationSchedule', label: 'Depreciation Schedule' },
    { key: 'bankStatements', label: 'Rental Account Bank Statements' },
  ]},
  { category: 'HOA', items: [
    { key: 'hoaCcrs', label: 'CC&Rs (Covenants, Conditions, Restrictions)' },
    { key: 'hoaBylaws', label: 'Bylaws' },
    { key: 'hoaRules', label: 'Rules & Regulations' },
    { key: 'hoaRentalApp', label: 'Rental Application / Approval Letter' },
    { key: 'hoaFinancials', label: 'HOA Financial Statements' },
    { key: 'hoaContact', label: 'HOA Management Contact Info' },
  ]},
  { category: 'Rental & Tenant', items: [
    { key: 'leaseTemplate', label: 'Lease Agreement Template' },
    { key: 'currentLease', label: 'Current Signed Lease' },
    { key: 'tenantApp', label: 'Tenant Application & Screening Results' },
    { key: 'moveInInspection', label: 'Move-In Inspection Report (with photos)' },
    { key: 'moveOutInspection', label: 'Move-Out Inspection Report' },
    { key: 'securityDepositReceipt', label: 'Security Deposit Receipt' },
    { key: 'flDisclosures', label: 'FL Required Disclosures (signed)' },
  ]},
  { category: 'Property Management', items: [
    { key: 'pmAgreement', label: 'Property Management Agreement' },
    { key: 'pmStatements', label: 'Monthly Owner Statements' },
    { key: 'vendorContracts', label: 'Vendor Contracts (lawn, pest, etc.)' },
    { key: 'maintenanceRecords', label: 'Maintenance Records & Receipts' },
  ]},
  { category: 'Maintenance & Improvements', items: [
    { key: 'warrantyDocs', label: 'Appliance / System Warranties' },
    { key: 'renovationReceipts', label: 'Renovation Receipts (for cost basis)' },
    { key: 'permitRecords', label: 'Building Permits (if applicable)' },
    { key: 'termiteBond', label: 'Termite Bond / Inspection' },
  ]},
];

export default function DocumentsVault() {
  const { state, dispatch } = useProperty();
  const docs = state.documents?.vault || {};
  const fileInputRef = useRef(null);

  const toggleDoc = (key) => {
    dispatch({
      type: 'SET_FIELD',
      section: 'documents',
      field: 'vault',
      value: { ...docs, [key]: docs[key] ? null : { onFile: true, date: new Date().toISOString().split('T')[0] } },
    });
  };

  const totalDocs = documentCategories.reduce((sum, cat) => sum + cat.items.length, 0);
  const completedDocs = Object.values(docs).filter(v => v?.onFile).length;
  const percent = Math.round((completedDocs / totalDocs) * 100);

  const handleExport = () => {
    const data = JSON.stringify(state, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `property-analyst-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result);
        if (data && data.property) {
          dispatch({ type: 'IMPORT_DATA', data });
        }
      } catch {
        alert('Invalid file. Please select a valid Property Analyst backup file.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Documents Vault</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Module 16 — Document index, checklist, and data backup</p>
        </div>
        <div className="flex gap-2">
          <button onClick={handleExport} className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors">
            <Download size={16} /> Export Data
          </button>
          <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
            <Upload size={16} /> Import Data
          </button>
          <input ref={fileInputRef} type="file" accept=".json" onChange={handleImport} className="hidden" />
        </div>
      </div>

      {/* Progress */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Documents on File</span>
          <span className="text-sm font-bold text-slate-900 dark:text-slate-100">{completedDocs}/{totalDocs} ({percent}%)</span>
        </div>
        <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
          <div className={`h-2 rounded-full transition-all duration-500 ${percent === 100 ? 'bg-green-500' : percent > 50 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ width: `${percent}%` }} />
        </div>
      </div>

      {/* Data Backup Info */}
      <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-xl p-4 text-sm text-blue-800 dark:text-blue-300">
        <strong>Data Backup:</strong> Your data is stored in browser localStorage. Use the Export button above to download a JSON backup. You can restore it anytime with Import — even on a different device or browser.
      </div>

      {/* Document Checklists */}
      {documentCategories.map(category => {
        const catComplete = category.items.filter(item => docs[item.key]?.onFile).length;
        return (
          <Card key={category.category} title={`${category.category} (${catComplete}/${category.items.length})`}
            status={catComplete === category.items.length ? 'green' : catComplete > 0 ? 'yellow' : 'red'}>
            <div className="space-y-1">
              {category.items.map(item => {
                const isDone = docs[item.key]?.onFile;
                return (
                  <button key={item.key} onClick={() => toggleDoc(item.key)}
                    className="w-full flex items-center gap-3 py-2 px-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors text-left">
                    {isDone ? <CheckCircle2 size={20} className="text-green-500 flex-shrink-0" /> : <Circle size={20} className="text-slate-300 dark:text-slate-600 flex-shrink-0" />}
                    <FileText size={16} className="text-slate-400 dark:text-slate-500 flex-shrink-0" />
                    <span className={`text-sm flex-1 ${isDone ? 'text-slate-400 dark:text-slate-500 line-through' : 'text-slate-700 dark:text-slate-300'}`}>{item.label}</span>
                    {isDone && docs[item.key]?.date && <span className="text-xs text-slate-400 dark:text-slate-500">{docs[item.key].date}</span>}
                  </button>
                );
              })}
            </div>
          </Card>
        );
      })}
    </div>
  );
}
