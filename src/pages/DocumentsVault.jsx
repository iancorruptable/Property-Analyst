import { useProperty } from '../store/PropertyContext';
import Card from '../components/Card';
import { CheckCircle2, Circle, FileText, Download, Upload, Trash2, Eye, Paperclip, FolderPlus, File, Image, FileSpreadsheet, X } from 'lucide-react';
import { useRef, useState, useEffect, useCallback } from 'react';
import { saveFile, getFile, deleteFile, getAllKeys, getStorageUsage, formatFileSize, readFileAsDataURL } from '../utils/fileStore';

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

const ACCEPTED_TYPES = '.pdf,.doc,.docx,.xls,.xlsx,.csv,.txt,.rtf,.jpg,.jpeg,.png,.gif,.webp,.heic,.tiff,.bmp,.svg';

function getFileIcon(mimeType) {
  if (!mimeType) return File;
  if (mimeType.startsWith('image/')) return Image;
  if (mimeType.includes('spreadsheet') || mimeType.includes('excel') || mimeType.includes('csv')) return FileSpreadsheet;
  return FileText;
}

export default function DocumentsVault() {
  const { state, dispatch } = useProperty();
  const docs = state.documents?.vault || {};
  const customDocs = state.documents?.customUploads || [];
  const fileInputRef = useRef(null);
  const [uploadingKey, setUploadingKey] = useState(null);
  const [fileKeys, setFileKeys] = useState([]);
  const [storageUsed, setStorageUsed] = useState(0);
  const [previewFile, setPreviewFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customCategory, setCustomCategory] = useState('');
  const customFileRef = useRef(null);
  const docUploadRef = useRef(null);

  const refreshFileKeys = useCallback(async () => {
    const keys = await getAllKeys();
    setFileKeys(keys);
    const usage = await getStorageUsage();
    setStorageUsed(usage);
  }, []);

  useEffect(() => { refreshFileKeys(); }, [refreshFileKeys]);

  const updateVault = (key, data) => {
    dispatch({
      type: 'SET_FIELD',
      section: 'documents',
      field: 'vault',
      value: { ...docs, [key]: data },
    });
  };

  const handleFileUpload = async (key, file) => {
    if (!file) return;
    const dataURL = await readFileAsDataURL(file);
    await saveFile(key, { data: dataURL, name: file.name, type: file.type, size: file.size });
    updateVault(key, { onFile: true, date: new Date().toISOString().split('T')[0], fileName: file.name, fileType: file.type, fileSize: file.size });
    await refreshFileKeys();
    setUploadingKey(null);
  };

  const handleRemoveFile = async (key) => {
    await deleteFile(key);
    updateVault(key, null);
    await refreshFileKeys();
  };

  const handleViewFile = async (key, fileName) => {
    const fileData = await getFile(key);
    if (fileData?.data) {
      setPreviewFile({ data: fileData.data, name: fileName || fileData.name, type: fileData.type });
    }
  };

  const handleDownloadFile = async (key, fileName) => {
    const fileData = await getFile(key);
    if (fileData?.data) {
      const a = document.createElement('a');
      a.href = fileData.data;
      a.download = fileName || fileData.name || 'document';
      a.click();
    }
  };

  // Custom uploads
  const handleCustomUpload = async (file) => {
    if (!file) return;
    const id = `custom_${Date.now()}`;
    const dataURL = await readFileAsDataURL(file);
    await saveFile(id, { data: dataURL, name: file.name, type: file.type, size: file.size });
    const newUpload = {
      id,
      name: customName || file.name,
      category: customCategory || 'general',
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size,
      date: new Date().toISOString().split('T')[0],
    };
    dispatch({ type: 'ADD_TO_ARRAY', section: 'documents', field: 'customUploads', item: newUpload });
    // Since ADD_TO_ARRAY uses section as the array key, handle custom uploads in documents object
    dispatch({
      type: 'SET_FIELD',
      section: 'documents',
      field: 'customUploads',
      value: [...customDocs, newUpload],
    });
    setCustomName('');
    setCustomCategory('');
    await refreshFileKeys();
  };

  const handleRemoveCustom = async (index, id) => {
    await deleteFile(id);
    dispatch({
      type: 'SET_FIELD',
      section: 'documents',
      field: 'customUploads',
      value: customDocs.filter((_, i) => i !== index),
    });
    await refreshFileKeys();
  };

  // Drag and drop for custom area
  const handleDrop = async (e) => {
    e.preventDefault();
    setDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    for (const file of files) {
      const id = `custom_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
      const dataURL = await readFileAsDataURL(file);
      await saveFile(id, { data: dataURL, name: file.name, type: file.type, size: file.size });
      const newUpload = {
        id,
        name: file.name,
        category: customCategory || 'general',
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
        date: new Date().toISOString().split('T')[0],
      };
      dispatch({
        type: 'SET_FIELD',
        section: 'documents',
        field: 'customUploads',
        value: [...(state.documents?.customUploads || []), newUpload],
      });
    }
    await refreshFileKeys();
  };

  // Data export/import
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
    e.target.value = '';
  };

  const totalDocs = documentCategories.reduce((sum, cat) => sum + cat.items.length, 0);
  const completedDocs = Object.values(docs).filter(v => v?.onFile).length;
  const percent = Math.round((completedDocs / totalDocs) * 100);
  const customCategories = ['general', 'photos', 'receipts', 'correspondence', 'legal', 'financial', 'inspection', 'other'];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Documents Vault</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Module 16 — Upload, organize, and track every property document</p>
        </div>
        <div className="flex flex-col xs:flex-row gap-2 w-full sm:w-auto">
          <button onClick={handleExport} className="flex items-center justify-center gap-2 px-4 py-2.5 min-h-[44px] bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors">
            <Download size={16} /> Export Data
          </button>
          <button onClick={() => fileInputRef.current?.click()} className="flex items-center justify-center gap-2 px-4 py-2.5 min-h-[44px] bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
            <Upload size={16} /> Import Data
          </button>
          <input ref={fileInputRef} type="file" accept=".json" onChange={handleImport} className="hidden" />
        </div>
      </div>

      {/* Progress + Storage */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Documents on File</span>
            <span className="text-sm font-bold text-slate-900 dark:text-slate-100">{completedDocs}/{totalDocs} ({percent}%)</span>
          </div>
          <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
            <div className={`h-2 rounded-full transition-all duration-500 ${percent === 100 ? 'bg-green-500' : percent > 50 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ width: `${percent}%` }} />
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Files Stored</span>
            <span className="text-sm font-bold text-slate-900 dark:text-slate-100">{fileKeys.length} files &middot; {formatFileSize(storageUsed)}</span>
          </div>
          <p className="text-xs text-slate-400 dark:text-slate-500">Stored locally in your browser (IndexedDB). Files stay on your device.</p>
        </div>
      </div>

      {/* Supported formats info */}
      <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-xl p-4 text-sm text-blue-800 dark:text-blue-300">
        <strong>Supported uploads:</strong> PDF, Word (.doc/.docx), Excel (.xls/.xlsx), CSV, images (JPG, PNG, GIF, WebP, HEIC, TIFF), text files, and more. Click any document row to upload a file, or use the drag-and-drop area below for bulk uploads.
      </div>

      {/* Document Checklists with Upload */}
      {documentCategories.map(category => {
        const catComplete = category.items.filter(item => docs[item.key]?.onFile).length;
        return (
          <Card key={category.category} title={`${category.category} (${catComplete}/${category.items.length})`}
            status={catComplete === category.items.length ? 'green' : catComplete > 0 ? 'yellow' : 'red'}>
            <div className="space-y-1">
              {category.items.map(item => {
                const doc = docs[item.key];
                const hasFile = doc?.onFile;
                const hasUploadedFile = hasFile && doc?.fileName;
                const Icon = hasUploadedFile ? getFileIcon(doc.fileType) : FileText;

                return (
                  <div key={item.key} className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 py-2.5 px-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors border-b border-slate-50 dark:border-slate-700/30 last:border-0">
                    {/* Top row: status icon, file icon, label */}
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      {/* Status icon */}
                      <button onClick={() => {
                        if (hasFile && !hasUploadedFile) {
                          handleRemoveFile(item.key);
                        } else if (!hasFile) {
                          updateVault(item.key, { onFile: true, date: new Date().toISOString().split('T')[0] });
                        }
                      }} className="flex-shrink-0 min-h-[44px] min-w-[44px] flex items-center justify-center">
                        {hasFile ? <CheckCircle2 size={20} className="text-green-500" /> : <Circle size={20} className="text-slate-300 dark:text-slate-600" />}
                      </button>

                      {/* File icon */}
                      <Icon size={16} className={`flex-shrink-0 ${hasUploadedFile ? 'text-blue-500' : 'text-slate-400 dark:text-slate-500'}`} />

                      {/* Label and file info */}
                      <div className="flex-1 min-w-0">
                        <span className={`text-sm block ${hasFile ? 'text-slate-500 dark:text-slate-400' : 'text-slate-700 dark:text-slate-300'}`}>
                          {item.label}
                        </span>
                        {hasUploadedFile && (
                          <span className="text-xs text-slate-400 dark:text-slate-500 block truncate">
                            {doc.fileName} &middot; {formatFileSize(doc.fileSize)} &middot; {doc.date}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Action buttons - stacked on mobile */}
                    <div className="flex items-center gap-1.5 flex-shrink-0 sm:ml-0 ml-[44px]">
                      {hasUploadedFile ? (
                        <div className="flex items-center gap-1 sm:gap-1.5">
                          <button onClick={() => handleViewFile(item.key, doc.fileName)} className="p-2.5 sm:p-1.5 rounded-md text-slate-500 sm:text-slate-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30 min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0 flex items-center justify-center gap-1.5" title="Preview">
                            <Eye size={16} />
                            <span className="text-xs sm:hidden">View</span>
                          </button>
                          <button onClick={() => handleDownloadFile(item.key, doc.fileName)} className="p-2.5 sm:p-1.5 rounded-md text-slate-500 sm:text-slate-400 hover:text-green-500 hover:bg-green-50 dark:hover:bg-green-900/30 min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0 flex items-center justify-center gap-1.5" title="Download">
                            <Download size={16} />
                            <span className="text-xs sm:hidden">Save</span>
                          </button>
                          <button onClick={() => {
                            setUploadingKey(item.key);
                            docUploadRef.current?.click();
                          }} className="p-2.5 sm:p-1.5 rounded-md text-slate-500 sm:text-slate-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30 min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0 flex items-center justify-center gap-1.5" title="Replace file">
                            <Paperclip size={16} />
                            <span className="text-xs sm:hidden">Replace</span>
                          </button>
                          <button onClick={() => handleRemoveFile(item.key)} className="p-2.5 sm:p-1.5 rounded-md text-slate-500 sm:text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0 flex items-center justify-center gap-1.5" title="Remove">
                            <Trash2 size={16} />
                            <span className="text-xs sm:hidden">Delete</span>
                          </button>
                        </div>
                      ) : (
                        <button onClick={() => {
                          setUploadingKey(item.key);
                          docUploadRef.current?.click();
                        }} className="flex items-center justify-center gap-1.5 w-full sm:w-auto px-3 py-2.5 sm:py-1.5 min-h-[44px] sm:min-h-0 text-xs font-medium rounded-lg border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-400 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600 dark:hover:bg-blue-900/30 dark:hover:border-blue-600 dark:hover:text-blue-400 transition-colors">
                          <Upload size={14} /> Upload
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        );
      })}

      {/* Hidden file input for document uploads */}
      <input
        ref={docUploadRef}
        type="file"
        accept={ACCEPTED_TYPES}
        onChange={(e) => {
          if (uploadingKey && e.target.files[0]) {
            handleFileUpload(uploadingKey, e.target.files[0]);
          }
          e.target.value = '';
        }}
        className="hidden"
      />

      {/* Custom / General Document Upload */}
      <Card title={`Other Documents (${customDocs.length})`}>
        <div className="space-y-4">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Upload any documents not covered above — photos, correspondence, receipts, notes, etc.
          </p>

          {/* Drag and drop zone */}
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-xl p-4 sm:p-8 text-center transition-colors ${
              dragOver
                ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-500'
                : 'border-slate-300 dark:border-slate-600 hover:border-slate-400 dark:hover:border-slate-500'
            }`}
          >
            <Upload size={32} className="mx-auto text-slate-400 dark:text-slate-500 mb-3" />
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-1 hidden sm:block">Drag and drop files here</p>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-1 sm:hidden">Upload files</p>
            <p className="text-xs text-slate-400 dark:text-slate-500 mb-3 hidden sm:block">or</p>
            <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center justify-center gap-3 mb-3">
              <input
                type="text"
                value={customName}
                onChange={e => setCustomName(e.target.value)}
                placeholder="Document name (optional)"
                className="px-3 py-2.5 sm:py-1.5 min-h-[44px] sm:min-h-0 text-sm border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400"
              />
              <select
                value={customCategory}
                onChange={e => setCustomCategory(e.target.value)}
                className="px-3 py-2.5 sm:py-1.5 min-h-[44px] sm:min-h-0 text-sm border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
              >
                <option value="">Category...</option>
                {customCategories.map(c => (
                  <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                ))}
              </select>
              <button
                onClick={() => customFileRef.current?.click()}
                className="flex items-center justify-center gap-2 px-4 py-2.5 sm:py-1.5 min-h-[44px] sm:min-h-0 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                <FolderPlus size={16} /> Choose Files
              </button>
            </div>
            <input
              ref={customFileRef}
              type="file"
              accept={ACCEPTED_TYPES}
              multiple
              onChange={async (e) => {
                for (const file of Array.from(e.target.files)) {
                  await handleCustomUpload(file);
                }
                e.target.value = '';
              }}
              className="hidden"
            />
          </div>

          {/* Custom uploads list - Mobile cards */}
          {customDocs.length > 0 && (
            <div className="block sm:hidden space-y-3">
              {customDocs.map((doc, i) => {
                const Icon = getFileIcon(doc.fileType);
                return (
                  <div key={doc.id} className="border border-slate-200 dark:border-slate-700 rounded-xl p-4 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-slate-700 dark:text-slate-300 truncate">{doc.name}</p>
                        <span className="inline-block mt-1 text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 capitalize">
                          {doc.category}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                      <Icon size={12} className="flex-shrink-0" />
                      <span className="truncate">{doc.fileName}</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-400 dark:text-slate-500">
                      <span>{formatFileSize(doc.fileSize)}</span>
                      <span>{doc.date}</span>
                    </div>
                    <div className="flex items-center gap-1 pt-1 border-t border-slate-100 dark:border-slate-700/50">
                      <button onClick={() => handleViewFile(doc.id, doc.fileName)} className="flex items-center gap-1.5 p-2.5 min-h-[44px] min-w-[44px] rounded-md text-slate-500 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30" title="Preview">
                        <Eye size={16} />
                        <span className="text-xs">View</span>
                      </button>
                      <button onClick={() => handleDownloadFile(doc.id, doc.fileName)} className="flex items-center gap-1.5 p-2.5 min-h-[44px] min-w-[44px] rounded-md text-slate-500 hover:text-green-500 hover:bg-green-50 dark:hover:bg-green-900/30" title="Download">
                        <Download size={16} />
                        <span className="text-xs">Save</span>
                      </button>
                      <button onClick={() => handleRemoveCustom(i, doc.id)} className="flex items-center gap-1.5 p-2.5 min-h-[44px] min-w-[44px] rounded-md text-slate-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 ml-auto" title="Delete">
                        <Trash2 size={16} />
                        <span className="text-xs">Delete</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Custom uploads list - Desktop table */}
          {customDocs.length > 0 && (
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-700">
                    <th className="text-left py-2 text-slate-600 dark:text-slate-400 font-medium">Document</th>
                    <th className="text-left py-2 text-slate-600 dark:text-slate-400 font-medium">Category</th>
                    <th className="text-left py-2 text-slate-600 dark:text-slate-400 font-medium">File</th>
                    <th className="text-right py-2 text-slate-600 dark:text-slate-400 font-medium">Size</th>
                    <th className="text-left py-2 text-slate-600 dark:text-slate-400 font-medium">Date</th>
                    <th className="py-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {customDocs.map((doc, i) => {
                    const Icon = getFileIcon(doc.fileType);
                    return (
                      <tr key={doc.id} className="border-b border-slate-50 dark:border-slate-700/50 group">
                        <td className="py-2 text-slate-700 dark:text-slate-300 font-medium">{doc.name}</td>
                        <td className="py-2">
                          <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 capitalize">
                            {doc.category}
                          </span>
                        </td>
                        <td className="py-2">
                          <span className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                            <Icon size={12} />
                            <span className="truncate max-w-[150px]">{doc.fileName}</span>
                          </span>
                        </td>
                        <td className="py-2 text-right text-xs text-slate-500 dark:text-slate-400">{formatFileSize(doc.fileSize)}</td>
                        <td className="py-2 text-xs text-slate-500 dark:text-slate-400">{doc.date}</td>
                        <td className="py-2 text-right">
                          <div className="flex items-center gap-1 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => handleViewFile(doc.id, doc.fileName)} className="p-1 text-slate-400 hover:text-blue-500" title="Preview">
                              <Eye size={14} />
                            </button>
                            <button onClick={() => handleDownloadFile(doc.id, doc.fileName)} className="p-1 text-slate-400 hover:text-green-500" title="Download">
                              <Download size={14} />
                            </button>
                            <button onClick={() => handleRemoveCustom(i, doc.id)} className="p-1 text-slate-400 hover:text-red-500" title="Delete">
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </Card>

      {/* File Preview Modal */}
      {previewFile && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-0 sm:p-4" onClick={() => setPreviewFile(null)}>
          <div className="bg-white dark:bg-slate-800 rounded-none sm:rounded-2xl shadow-2xl max-w-full sm:max-w-4xl w-full max-h-full sm:max-h-[90vh] h-full sm:h-auto overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-2 min-w-0">
                <FileText size={16} className="text-slate-400 flex-shrink-0" />
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300 truncate">{previewFile.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => {
                  const a = document.createElement('a');
                  a.href = previewFile.data;
                  a.download = previewFile.name;
                  a.click();
                }} className="text-xs sm:text-xs px-4 sm:px-3 py-2.5 sm:py-1.5 min-h-[44px] sm:min-h-0 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-1.5 sm:gap-1">
                  <Download size={16} className="sm:hidden" /><Download size={12} className="hidden sm:block" /> Download
                </button>
                <button onClick={() => setPreviewFile(null)} className="p-2.5 sm:p-1 min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0 flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-white">
                  <X size={24} className="sm:hidden" /><X size={20} className="hidden sm:block" />
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-auto p-4 flex items-center justify-center bg-slate-50 dark:bg-slate-900">
              {previewFile.type?.startsWith('image/') ? (
                <img src={previewFile.data} alt={previewFile.name} className="max-w-full max-h-[70vh] object-contain rounded-lg" />
              ) : previewFile.type === 'application/pdf' ? (
                <iframe src={previewFile.data} className="w-full h-[70vh] rounded-lg" title={previewFile.name} />
              ) : (
                <div className="text-center py-12">
                  <FileText size={48} className="mx-auto text-slate-300 dark:text-slate-600 mb-4" />
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">Preview not available for this file type</p>
                  <p className="text-xs text-slate-400 dark:text-slate-500">{previewFile.type || 'Unknown type'}</p>
                  <button onClick={() => {
                    const a = document.createElement('a');
                    a.href = previewFile.data;
                    a.download = previewFile.name;
                    a.click();
                  }} className="mt-4 text-sm px-6 sm:px-4 py-3 sm:py-2 min-h-[44px] bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 mx-auto">
                    <Download size={16} className="sm:hidden" /><Download size={14} className="hidden sm:block" /> Download to View
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
