import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  ClipboardCheck,
  Store,
  Users,
  CreditCard,
  ReceiptText,
  BarChart3,
  Settings,
  Scissors,
  LogOut,
  X,
  Sparkles,
  Menu,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAdminAuth } from '../../context/AdminAuthContext'
import { initials } from '../../services/format'

const menuItems = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/admin/dashboard' },
  { label: 'Registrations', icon: ClipboardCheck, path: '/admin/registrations' },
  { label: 'Shops', icon: Store, path: '/admin/shops' },
  { label: 'Owners', icon: Users, path: '/admin/owners' },
  { label: 'Subscriptions', icon: CreditCard, path: '/admin/subscriptions' },
  { label: 'Payments', icon: ReceiptText, path: '/admin/payments' },
  { label: 'Reports', icon: BarChart3, path: '/admin/reports' },
]

const bottomItems = [
  { label: 'Settings', icon: Settings, path: '/admin/settings' },
]

function SidebarContent({ onNavigate }) {
  const { user, logout } = useAdminAuth()
  const name = user?.name || 'Super Admin'

  return (
    <div className="h-full flex flex-col">
      {/* BRAND */}
      <div className="px-5 pt-5">
        <div className="relative overflow-hidden rounded-[22px] bg-white/[0.07] border border-white/[0.09] p-4">
          <div className="absolute -right-8 -top-8 w-24 h-24 rounded-full bg-[#a9cbb6]/10 blur-2xl" />

          <div className="relative flex items-center gap-3">
            <div className="w-11 h-11 rounded-[15px] bg-[#f3f1e9] text-[#21483a] flex items-center justify-center shadow-lg shrink-0">
              <Scissors size={21} strokeWidth={2.2} />
            </div>

            <div>
              <h1 className="font-display text-[19px] leading-none font-bold tracking-tight text-white">
                Swiss Barber
              </h1>

              <div className="flex items-center gap-1.5 mt-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#a9cbb6]" />
                <p className="text-[10px] text-white/50 font-semibold">
                  Admin Console
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* NAVIGATION */}
      <div className="flex-1 px-4 py-7 overflow-y-auto">
        <p className="px-3 mb-3 text-[10px] text-white/35 font-bold">
          Workspace
        </p>

        <nav className="space-y-1.5">
          {menuItems.map((item) => {
            const Icon = item.icon

            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onNavigate}
                className={({ isActive }) =>
                  `relative group flex items-center gap-3 px-3 py-3 rounded-[14px] text-[13px] font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-[#f3f1e9] text-[#21483a] shadow-[0_8px_20px_rgba(0,0,0,0.10)]'
                      : 'text-white/60 hover:text-white hover:bg-white/[0.06]'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    {isActive && (
                      <motion.div
                        layoutId="active-sidebar-item"
                        className="absolute left-0 top-2.5 bottom-2.5 w-1 rounded-r-full bg-[#6e9d82]"
                        transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                      />
                    )}

                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
                        isActive
                          ? 'bg-[#21483a]/[0.08] text-[#21483a]'
                          : 'bg-white/[0.05] text-white/50 group-hover:text-white'
                      }`}
                    >
                      <Icon size={17} strokeWidth={isActive ? 2.1 : 1.8} />
                    </div>

                    <span>{item.label}</span>

                    {item.label === 'Registrations' && (
                      <span className="ml-auto text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-[#a9cbb6]/20 text-[#bcd7c5]">
                        NEW
                      </span>
                    )}
                  </>
                )}
              </NavLink>
            )
          })}
        </nav>

        <div className="mt-8 mb-3 px-3 flex items-center justify-between">
          <p className="text-[10px] text-white/35 font-bold">System</p>
          <Sparkles size={12} className="text-white/25" />
        </div>

        <nav className="space-y-1.5">
          {bottomItems.map((item) => {
            const Icon = item.icon

            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onNavigate}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-3 rounded-[14px] text-[13px] font-medium transition-all ${
                    isActive
                      ? 'bg-[#f3f1e9] text-[#21483a]'
                      : 'text-white/60 hover:text-white hover:bg-white/[0.06]'
                  }`
                }
              >
                <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-white/[0.05]">
                  <Icon size={17} strokeWidth={1.8} />
                </div>

                <span>{item.label}</span>
              </NavLink>
            )
          })}
        </nav>
      </div>

      {/* ADMIN PROFILE */}
      <div className="p-4">
        <div className="relative overflow-hidden rounded-[20px] bg-white/[0.06] border border-white/[0.08] p-3.5">
          <div className="absolute -right-8 -bottom-8 w-24 h-24 rounded-full bg-[#a9cbb6]/10 blur-2xl" />

          <div className="relative flex items-center gap-3">
            <div className="w-10 h-10 rounded-[13px] bg-[#a9cbb6] text-[#21483a] flex items-center justify-center font-bold text-xs shadow-lg shrink-0">
              {initials(name)}
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-[13px] font-semibold text-white truncate">{name}</p>
              <p className="text-[11px] text-white/45 truncate mt-0.5">
                Platform administrator
              </p>
            </div>

            <div className="w-2 h-2 rounded-full bg-[#a9cbb6] shadow-[0_0_10px_rgba(169,203,182,0.7)]" />
          </div>

          <button
            type="button"
            onClick={logout}
            className="relative w-full mt-3 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white/[0.05] hover:bg-red-400/[0.12] border border-white/[0.06] text-white/55 hover:text-red-200 text-[12px] font-medium transition-all"
          >
            <LogOut size={14} />
            Sign out
          </button>
        </div>
      </div>
    </div>
  )
}

export default function Sidebar() {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <>
      {/* DESKTOP SIDEBAR */}
      <aside className="hidden lg:block fixed left-0 top-0 bottom-0 z-40 w-[278px] p-3">
        <div className="h-full overflow-hidden rounded-[28px] bg-[#17352b] shadow-[0_20px_60px_rgba(23,53,43,0.18)] border border-white/[0.06]">
          <SidebarContent />
        </div>
      </aside>

      {/* MOBILE DRAWER */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 z-50 bg-[#17352b]/35 backdrop-blur-sm lg:hidden"
            />

            <motion.aside
              initial={{ x: -320 }}
              animate={{ x: 0 }}
              exit={{ x: -320 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed left-3 top-3 bottom-3 z-[60] w-[278px] overflow-hidden rounded-[28px] bg-[#17352b] shadow-2xl lg:hidden"
            >
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                aria-label="Close menu"
                className="absolute right-4 top-5 z-10 w-8 h-8 rounded-xl bg-white/[0.08] text-white/60 hover:text-white flex items-center justify-center"
              >
                <X size={16} />
              </button>

              <SidebarContent onNavigate={() => setMobileOpen(false)} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* MOBILE MENU BUTTON */}
      <button
        type="button"
        onClick={() => setMobileOpen(true)}
        aria-label="Open menu"
        className="fixed bottom-5 right-5 z-40 lg:hidden w-12 h-12 rounded-2xl bg-[#17352b] text-white shadow-[0_12px_30px_rgba(23,53,43,0.25)] flex items-center justify-center border border-white/10"
      >
        <Menu size={20} />
      </button>
    </>
  )
}