export default function FormField({ label, type = 'text', value, onChange, placeholder, options, prefix, suffix, helpText, required }) {
  const baseClass = 'w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500';

  if (type === 'select') {
    return (
      <div>
        <label className="block text-xs font-medium text-slate-600 mb-1">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        <select value={value || ''} onChange={e => onChange(e.target.value)} className={baseClass}>
          <option value="">Select...</option>
          {options?.map(opt => (
            <option key={opt.value || opt} value={opt.value || opt}>
              {opt.label || opt}
            </option>
          ))}
        </select>
        {helpText && <p className="text-xs text-slate-400 mt-1">{helpText}</p>}
      </div>
    );
  }

  if (type === 'textarea') {
    return (
      <div>
        <label className="block text-xs font-medium text-slate-600 mb-1">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        <textarea
          value={value || ''}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          rows={3}
          className={baseClass}
        />
        {helpText && <p className="text-xs text-slate-400 mt-1">{helpText}</p>}
      </div>
    );
  }

  if (type === 'checkbox') {
    return (
      <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
        <input
          type="checkbox"
          checked={!!value}
          onChange={e => onChange(e.target.checked)}
          className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
        />
        {label}
      </label>
    );
  }

  return (
    <div>
      <label className="block text-xs font-medium text-slate-600 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="relative">
        {prefix && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">{prefix}</span>
        )}
        <input
          type={type}
          value={value || ''}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          className={`${baseClass} ${prefix ? 'pl-7' : ''} ${suffix ? 'pr-10' : ''}`}
        />
        {suffix && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">{suffix}</span>
        )}
      </div>
      {helpText && <p className="text-xs text-slate-400 mt-1">{helpText}</p>}
    </div>
  );
}
