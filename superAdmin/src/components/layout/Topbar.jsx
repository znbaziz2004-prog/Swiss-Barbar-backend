import { useEffect, useRef, useState } from 'react'
import { Bell, ChevronDown, LogOut, Search } from 'lucide-react'
import { useAdminAuth } from '../../context/AdminAuthContext'
import { initials } from '../../services/format'

export default function Topbar() {
  const { user, logout } = useAdminAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef(null)

  const name = user?.name || 'Super Admin'

  useEffect(() => {
    const onClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  return (
    <header className="sticky top-0 z-30 h-[82px] px-3 sm:px-5 lg:px-7 pt-3">
      <div className="h-full rounded-[22px] bg-[#faf9f4]/85 backdrop-blur-xl border border-white/70 shadow-[0_8px_30px_rgba(37,55,46,0.05)]">
        <div className="h-full px-4 sm:px-5 lg:px-6 flex items-center justify-between gap-5">
          {/* SEARCH */}
          <div className="hidden md:flex items-center w-full max-w-[430px]">
            <div className="relative w-full group">
              <Search
                size={16}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9aa39d] group-focus-within:text-[#39725a] transition"
              />

              <input
                type="text"
                placeholder="Search shops, owners, registrations..."
                aria-label="Search"
                className="w-full h-11 pl-11 pr-4 rounded-[14px] bg-[#f3f1e9]/70 border border-black/[0.045] text-[12px] text-[#24312b] placeholder:text-[#a2aaa4] focus:outline-none focus:bg-white focus:border-[#39725a]/25 focus:ring-4 focus:ring-[#39725a]/10 transition-all"
              />
            </div>
          </div>

          {/* MOBILE TITLE */}
          <div className="md:hidden">
            <p className="font-display text-[17px] font-bold text-[#21483a] leading-none">
              Swiss Barber
            </p>
            <p className="text-[10px] text-[#8a948d] mt-1">Admin Console</p>
          </div>

          {/* RIGHT */}
          <div className="ml-auto flex items-center gap-2.5">
            <button
              type="button"
              aria-label="Notifications"
              className="relative w-10 h-10 rounded-[13px] bg-[#f3f1e9]/70 border border-black/[0.045] flex items-center justify-center text-[#718078] hover:text-[#21483a] hover:bg-white hover:shadow-sm transition-all"
            >
              <Bell size={17} strokeWidth={1.8} />
              <span className="absolute top-[9px] right-[9px] w-1.5 h-1.5 rounded-full bg-[#806d59] ring-2 ring-[#faf9f4]" />
            </button>

            <div className="hidden sm:block h-8 w-px bg-black/[0.06] mx-1" />

            {/* ADMIN MENU */}
            <div className="relative" ref={menuRef}>
              <button
                type="button"
                onClick={() => setMenuOpen((o) => !o)}
                aria-haspopup="menu"
                aria-expanded={menuOpen}
                className="flex items-center gap-2.5 px-2 py-1.5 rounded-[14px] hover:bg-white transition-all"
              >
                <div className="w-9 h-9 rounded-[12px] bg-[#21483a] text-white flex items-center justify-center text-[11px] font-bold shadow-sm">
                  {initials(name)}
                </div>

                <div className="hidden sm:block text-left">
                  <p className="text-[12px] font-semibold text-[#24312b] leading-none">{name}</p>
                  <p className="text-[11px] text-[#8a948d] mt-1">Administrator</p>
                </div>

                <ChevronDown
                  size={14}
                  className={`text-[#8a948d] hidden sm:block transition-transform ${menuOpen ? 'rotate-180' : ''}`}
                />
              </button>

              {menuOpen && (
                <div
                  role="menu"
                  className="absolute right-0 top-[calc(100%+8px)] w-48 rounded-[16px] bg-[#faf9f4] border border-black/[0.06] shadow-[0_16px_40px_rgba(37,55,46,0.14)] p-1.5"
                >
                  <button
                    type="button"
                    role="menuitem"
                    onClick={logout}
                    className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-[12px] font-medium text-[#9a5f52] hover:bg-[#f3e3df] transition-colors"
                  >
                    <LogOut size={15} />
                    Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}