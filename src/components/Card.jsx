export default function Card({ title, children, className = '', action, status }) {
  const borderColor = status === 'red' ? 'border-l-red-500' : status === 'yellow' ? 'border-l-yellow-500' : status === 'green' ? 'border-l-green-500' : 'border-l-transparent';

  return (
    <div className={`bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 border-l-4 ${borderColor} ${className}`}>
      {(title || action) && (
        <div className="px-5 py-3 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
          {title && <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">{title}</h3>}
          {action}
        </div>
      )}
      <div className="p-5">
        {children}
      </div>
    </div>
  );
}
