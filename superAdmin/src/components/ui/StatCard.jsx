export default function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  iconClass = 'bg-[#e4eee7] text-[#39725a]',
  loading = false,
}) {
  return (
    <div className="soft-card p-5">
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-semibold text-[#929c95]">{title}</p>

        {Icon && (
          <div
            className={`w-10 h-10 rounded-[13px] flex items-center justify-center ${iconClass}`}
          >
            <Icon size={18} />
          </div>
        )}
      </div>

      <h3 className="font-display text-[28px] font-bold text-[#24312b] mt-3 leading-none">
        {loading ? (
          <span className="inline-block w-20 h-7 rounded-lg bg-[#e7e5dd] animate-pulse" />
        ) : (
          value
        )}
      </h3>

      {subtitle && <p className="text-[11px] text-[#929c95] mt-2">{subtitle}</p>}
    </div>
  )
}
