import { AlertCircle, CheckCircle2 } from 'lucide-react'

export default function Notice({ type = 'error', children, className = '' }) {
  if (!children) return null
  const isError = type === 'error'

  return (
    <div
      role={isError ? 'alert' : 'status'}
      className={`flex items-start gap-2.5 px-4 py-3 rounded-[14px] text-xs leading-5 ${
        isError ? 'bg-[#f3e3df] text-[#9a5f52]' : 'bg-[#e5eee8] text-[#39725a]'
      } ${className}`}
    >
      {isError ? (
        <AlertCircle size={15} className="mt-0.5 shrink-0" />
      ) : (
        <CheckCircle2 size={15} className="mt-0.5 shrink-0" />
      )}
      <span>{children}</span>
    </div>
  )
}
