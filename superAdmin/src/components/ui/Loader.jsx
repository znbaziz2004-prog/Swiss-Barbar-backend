export default function Loader({ label = 'Loading...', fullPage = false }) {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-3 ${
        fullPage ? 'min-h-screen bg-[#f3f1e9]' : 'py-16'
      }`}
      role="status"
      aria-live="polite"
    >
      <div className="w-9 h-9 rounded-full border-[3px] border-[#d8e6dd] border-t-[#21483a] animate-spin" />
      <p className="text-[11px] text-[#8b958e] font-medium">{label}</p>
    </div>
  )
}
