const tones = {
  green: 'bg-[#e5eee8] text-[#39725a]',
  amber: 'bg-[#f4ead8] text-[#806d59]',
  red: 'bg-[#f3e3df] text-[#9a5f52]',
  blue: 'bg-[#e1eaf0] text-[#42667f]',
  gray: 'bg-[#eceae2] text-[#7f8982]',
}

const statusTone = {
  active: 'green',
  approved: 'green',
  completed: 'green',
  paid: 'green',
  succeeded: 'green',
  pending: 'amber',
  trial: 'amber',
  trialing: 'amber',
  past_due: 'amber',
  rejected: 'red',
  cancelled: 'red',
  canceled: 'red',
  failed: 'red',
  suspended: 'red',
  expired: 'red',
  inactive: 'gray',
  refunded: 'blue',
}

export default function Badge({ children, tone, status, className = '' }) {
  const key = String(status || '').toLowerCase()
  const resolved = tone || statusTone[key] || 'gray'
  const label = children ?? (status ? String(status).replace(/_/g, ' ') : 'Unknown')

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold capitalize whitespace-nowrap ${tones[resolved]} ${className}`}
    >
      {label}
    </span>
  )
}
