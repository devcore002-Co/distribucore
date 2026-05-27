export function Table({ children }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
      <table className="w-full text-sm">{children}</table>
    </div>
  )
}

export function Th({ children, className = '' }) {
  return (
    <th className={`px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide border-b border-gray-100 bg-gray-50 ${className}`}>
      {children}
    </th>
  )
}

export function Td({ children, className = '' }) {
  return <td className={`px-4 py-3 text-gray-700 ${className}`}>{children}</td>
}

export function Tr({ children, onClick, className = '' }) {
  return (
    <tr
      onClick={onClick}
      className={`border-b border-gray-50 last:border-0 ${onClick ? 'cursor-pointer hover:bg-gray-50' : ''} ${className}`}
    >
      {children}
    </tr>
  )
}
