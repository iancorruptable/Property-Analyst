export default function StatusBadge({ status, children }) {
  const colors = {
    green: 'bg-green-100 text-green-800 border border-green-300',
    yellow: 'bg-yellow-100 text-yellow-800 border border-yellow-300',
    red: 'bg-red-100 text-red-800 border border-red-300',
    gray: 'bg-gray-100 text-gray-600 border border-gray-300',
    blue: 'bg-blue-100 text-blue-800 border border-blue-300',
  };

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${colors[status] || colors.gray}`}>
      {status === 'green' && '●'} {status === 'yellow' && '●'} {status === 'red' && '●'} {children}
    </span>
  );
}

export function StatusDot({ status }) {
  const colors = {
    green: 'bg-green-500',
    yellow: 'bg-yellow-500',
    red: 'bg-red-500',
    gray: 'bg-gray-400',
  };

  return <span className={`inline-block w-2.5 h-2.5 rounded-full ${colors[status] || colors.gray}`} />;
}
