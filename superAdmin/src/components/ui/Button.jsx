import { Loader2 } from 'lucide-react'

const variants = {
  primary: 'bg-[#21483a] text-white hover:bg-[#17352b] shadow-sm',
  secondary:
    'bg-[#f3f1e9] text-[#21483a] border border-black/[0.06] hover:bg-white',
  ghost: 'text-[#536059] hover:bg-[#f3f1e9]',
  danger: 'bg-[#9a5f52] text-white hover:bg-[#844c40]',
  soft: 'bg-[#e5eee8] text-[#39725a] hover:bg-[#d8e6dd]',
}

const sizes = {
  sm: 'h-8 px-3 text-[11px] rounded-[10px] gap-1.5',
  md: 'h-10 px-4 text-xs rounded-[12px] gap-2',
  lg: 'h-12 px-5 text-sm rounded-[14px] gap-2',
}

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  icon: Icon,
  loading = false,
  disabled = false,
  type = 'button',
  className = '',
  ...props
}) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center font-semibold transition-colors
        focus:outline-none focus-visible:ring-4 focus-visible:ring-[#39725a]/20
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {loading ? (
        <Loader2 size={14} className="animate-spin" />
      ) : (
        Icon && <Icon size={size === 'sm' ? 13 : 15} />
      )}
      {children}
    </button>
  )
}
