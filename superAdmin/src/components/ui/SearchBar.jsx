import { Search } from 'lucide-react'

export default function SearchBar({ value, onChange, placeholder = 'Search...' }) {
  return (
    <div className="relative w-full sm:max-w-xs">
      <Search
        size={15}
        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9aa39d]"
      />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className="w-full h-10 pl-10 pr-4 rounded-[12px] bg-[#f3f1e9]/70 border border-black/[0.045] text-xs text-[#24312b] placeholder:text-[#a2aaa4] focus:outline-none focus:bg-white focus:border-[#39725a]/30 focus:ring-4 focus:ring-[#39725a]/10 transition-all"
      />
    </div>
  )
}
