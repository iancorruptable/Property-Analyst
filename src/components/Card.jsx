export default function Card({ title, children, className = '', action, status }) {
  const borderColor = status === 'red' ? 'border-l-red-500' : status === 'yellow' ? 'border-l-yellow-500' : status === 'green' ? 'border-l-green-500' : 'border-l-transparent';

  return (
    <div className={`bg-white rounded-xl shadow-sm border border-slate-200 border-l-4 ${borderColor} ${className}`}>
      {(title || action) && (
        <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between">
          {title && <h3 className="text-sm font-semibold text-slate-800">{title}</h3>}
          {action}
        </div>
      )}
      <div className="p-5">
        {children}
      </div>
    </div>
  );
}
