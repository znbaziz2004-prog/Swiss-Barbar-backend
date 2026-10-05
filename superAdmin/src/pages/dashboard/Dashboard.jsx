import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowUpRight,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  ClipboardCheck,
  CreditCard,
  DollarSign,
  Scissors,
  Store,
  TrendingUp,
  Users,
  Sparkles,
  Clock3,
  MoreHorizontal,
} from 'lucide-react'
import { motion } from 'framer-motion'
import { AreaChart, Area, ResponsiveContainer, Tooltip, XAxis } from 'recharts'

import StatCard from '../../components/ui/StatCard'
import Badge from '../../components/ui/Badge'
import { useAdminAuth } from '../../context/AdminAuthContext'
import { getDashboardStats } from '../../services/adminService'
import { formatCurrency, formatDate } from '../../services/format'

const chartData = [
  { name: 'Mon', revenue: 320 },
  { name: 'Tue', revenue: 480 },
  { name: 'Wed', revenue: 410 },
  { name: 'Thu', revenue: 620 },
  { name: 'Fri', revenue: 560 },
  { name: 'Sat', revenue: 740 },
  { name: 'Sun', revenue: 680 },
]

const quickActions = [
  { title: 'Registrations', description: 'Review new barber applications', icon: ClipboardCheck, path: '/admin/registrations' },
  { title: 'Shops', description: 'Manage barber shops', icon: Store, path: '/admin/shops' },
  { title: 'Owners', description: 'View platform owners', icon: Users, path: '/admin/owners' },
  { title: 'Subscriptions', description: 'Manage plans & subscriptions', icon: CreditCard, path: '/admin/subscriptions' },
]

const initialStats = {
  total_shops: 0,
  active_shops: 0,
  pending_registrations: 0,
  active_subscriptions: 0,
  featured_shops: 0,
  total_owners: 0,
  today_appointments: 0,
  today_revenue: 0,
}

const greeting = () => {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 18) return 'Good afternoon'
  return 'Good evening'
}

export default function Dashboard() {
  const { user } = useAdminAuth()
  const [stats, setStats] = useState(initialStats)
  const [recent, setRecent] = useState({ registrations: [], appointments: [] })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    ;(async () => {
      try {
        const data = await getDashboardStats()
        if (!active) return
        if (data?.platform) setStats(data.platform)
        if (data?.recent) {
          setRecent({
            registrations: data.recent.registrations || [],
            appointments: data.recent.appointments || [],
          })
        }
      } catch (error) {
        console.log('Dashboard API unavailable:', error?.response?.data?.message || error.message)
      } finally {
        if (active) setLoading(false)
      }
    })()
    return () => {
      active = false
    }
  }, [])

  return (
    <div className="space-y-7 pb-10">
      {/* HERO */}
      <motion.section
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-[28px] bg-[#21483a] text-white p-6 sm:p-8 lg:p-10 shadow-[0_18px_45px_rgba(33,72,58,0.14)]"
      >
        <div className="absolute right-[-80px] top-[-100px] w-[280px] h-[280px] rounded-full bg-[#a9cbb6]/10 blur-3xl" />
        <div className="absolute right-[15%] bottom-[-120px] w-[260px] h-[260px] rounded-full bg-[#806d59]/10 blur-3xl" />
        <div className="absolute right-8 bottom-5 opacity-[0.06]">
          <Scissors size={150} strokeWidth={1} />
        </div>

        <div className="relative max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.09] border border-white/[0.08] text-[11px] text-white/60 font-semibold">
            <Sparkles size={12} />
            Platform overview
          </div>

          <h1 className="font-display text-3xl sm:text-4xl lg:text-[46px] leading-[1.05] font-bold tracking-tight mt-5">
            {greeting()},
            <br />
            {user?.name || 'Super Admin'}.
          </h1>

          <p className="mt-4 text-sm sm:text-[15px] leading-6 text-white/55 max-w-xl">
            Monitor your Swiss Barber platform, keep track of barber businesses, and stay on top of registrations and subscriptions.
          </p>

          <div className="mt-7 flex flex-wrap items-center gap-3">
            <Link
              to="/admin/registrations"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#f3f1e9] text-[#21483a] text-xs font-bold hover:scale-[1.02] transition"
            >
              Review registrations
              <ArrowUpRight size={14} />
            </Link>

            <div className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-white/[0.06] border border-white/[0.08] text-xs text-white/55">
              <span className="w-2 h-2 rounded-full bg-[#a9cbb6]" />
              Platform operational
            </div>
          </div>
        </div>
      </motion.section>

      {/* STATS */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-[11px] font-semibold text-[#8b958e]">At a glance</p>
            <h2 className="font-display text-2xl font-bold text-[#24312b] mt-1">Platform health</h2>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-[11px] text-[#87918a]">
            <Clock3 size={13} />
            Updated just now
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <StatCard title="Barber owners" value={stats.total_owners} subtitle="Registered owners" icon={Users} iconClass="bg-[#e4eee7] text-[#39725a]" loading={loading} />
          <StatCard title="Active shops" value={stats.active_shops} subtitle={`${stats.total_shops} total shops`} icon={Store} iconClass="bg-[#ece8df] text-[#806d59]" loading={loading} />
          <StatCard title="Appointments" value={stats.today_appointments} subtitle="Across platform today" icon={CalendarDays} iconClass="bg-[#e3ebe8] text-[#21483a]" loading={loading} />
          <StatCard title="Today's revenue" value={formatCurrency(stats.today_revenue)} subtitle="Completed appointments" icon={DollarSign} iconClass="bg-[#e8eee5] text-[#39725a]" loading={loading} />
        </div>
      </section>

      {/* MAIN GRID */}
      <section className="grid grid-cols-1 xl:grid-cols-[1.55fr_0.9fr] gap-5">
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="soft-card overflow-hidden">
          <div className="p-5 sm:p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[11px] font-semibold text-[#909a93]">Revenue activity</p>
                <div className="flex items-end gap-3 mt-2">
                  <h3 className="font-display text-3xl font-bold text-[#24312b]">{formatCurrency(stats.today_revenue)}</h3>
                  <span className="mb-1 inline-flex items-center gap-1 text-[11px] font-bold text-[#39725a]">
                    <TrendingUp size={12} />
                    Today
                  </span>
                </div>
              </div>

              <Link
                to="/admin/reports"
                aria-label="Open reports"
                className="w-9 h-9 rounded-xl bg-[#f3f1e9] flex items-center justify-center text-[#7c8780] hover:text-[#21483a]"
              >
                <MoreHorizontal size={17} />
              </Link>
            </div>

            <div className="h-[230px] mt-5">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 5, left: -25, bottom: 0 }}>
                  <defs>
                    <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#39725a" stopOpacity={0.24} />
                      <stop offset="100%" stopColor="#39725a" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9aa39d', fontSize: 10 }} />
                  <Tooltip
                    cursor={{ stroke: '#39725a', strokeOpacity: 0.12 }}
                    contentStyle={{ border: '1px solid rgba(36,49,43,0.08)', borderRadius: '12px', background: '#faf9f4', boxShadow: '0 12px 30px rgba(37,55,46,0.10)' }}
                    formatter={(value) => [`CHF ${value}`, 'Revenue']}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="#39725a" strokeWidth={2.5} fill="url(#revenueGradient)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="soft-card p-5 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-semibold text-[#909a93]">Platform activity</p>
              <h3 className="font-display text-2xl font-bold text-[#24312b] mt-1">Current state</h3>
            </div>

            <div className="w-10 h-10 rounded-xl bg-[#e5eee7] text-[#39725a] flex items-center justify-center">
              <CheckCircle2 size={19} />
            </div>
          </div>

          <div className="mt-6 space-y-3">
            <ActivityRow label="Pending registrations" value={stats.pending_registrations} icon={ClipboardCheck} />
            <ActivityRow label="Active subscriptions" value={stats.active_subscriptions} icon={CreditCard} />
            <ActivityRow label="Featured shops" value={stats.featured_shops} icon={Sparkles} />
          </div>

          <div className="mt-5 p-4 rounded-2xl bg-[#21483a] text-white">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-white/[0.09] flex items-center justify-center">
                <CheckCircle2 size={16} />
              </div>
              <div>
                <p className="text-xs font-semibold">Swiss Barber is running smoothly</p>
                <p className="text-[11px] text-white/45 mt-0.5">All core platform services are operational.</p>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* LOWER GRID */}
      <section className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        <div className="soft-card overflow-hidden">
          <SectionHeader title="Recent registrations" eyebrow="Barber network" link="/admin/registrations" />

          <div className="divide-y divide-black/[0.045]">
            {recent.registrations.length === 0 ? (
              <EmptyState icon={ClipboardCheck} title="No recent registrations" text="New barber applications will appear here." />
            ) : (
              recent.registrations.map((item) => (
                <Link
                  key={item.id}
                  to={`/admin/registrations/${item.id}`}
                  className="px-5 sm:px-6 py-4 flex items-center gap-3 hover:bg-[#f3f1e9]/50 transition"
                >
                  <div className="w-10 h-10 rounded-xl bg-[#e6eee8] text-[#39725a] flex items-center justify-center">
                    <Store size={17} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-[#24312b] truncate">{item.shop_name || 'New Barber Shop'}</p>
                    <p className="text-[11px] text-[#8d9790] truncate mt-1">{item.owner_email || 'Owner registration'}</p>
                  </div>

                  <div className="text-right">
                    <Badge status={item.status} />
                    <p className="text-[10px] text-[#a0a8a3] mt-1.5">{formatDate(item.created_at)}</p>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>

        <div className="soft-card overflow-hidden">
          <SectionHeader title="Recent appointments" eyebrow="Activity" link="/admin/reports" />

          <div className="divide-y divide-black/[0.045]">
            {recent.appointments.length === 0 ? (
              <EmptyState icon={CalendarDays} title="No recent appointments" text="Appointment activity will appear here." />
            ) : (
              recent.appointments.map((item) => (
                <div key={item.id} className="px-5 sm:px-6 py-4 flex items-center gap-3 hover:bg-[#f3f1e9]/50 transition">
                  <div className="w-10 h-10 rounded-xl bg-[#eee9df] text-[#806d59] flex items-center justify-center">
                    <CalendarDays size={17} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-[#24312b] truncate">{item.customer_name || 'Customer'}</p>
                    <p className="text-[11px] text-[#8d9790] truncate mt-1">{item.shop_name || 'Barber shop'}</p>
                  </div>

                  <div className="text-right">
                    <p className="text-xs font-bold text-[#24312b]">{formatCurrency(item.total_amount, item.currency || 'CHF')}</p>
                    <p className="text-[10px] text-[#a0a8a3] mt-1">{formatDate(item.appointment_date)}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* QUICK ACTIONS */}
      <section>
        <div className="mb-4">
          <p className="text-[11px] font-semibold text-[#8b958e]">Administration</p>
          <h2 className="font-display text-2xl font-bold text-[#24312b] mt-1">Quick access</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {quickActions.map((action) => {
            const Icon = action.icon
            return (
              <Link key={action.path} to={action.path} className="group soft-card p-5 hover:-translate-y-0.5 transition-transform">
                <div className="flex items-start justify-between">
                  <div className="w-11 h-11 rounded-[14px] bg-[#e5eee8] text-[#39725a] flex items-center justify-center group-hover:bg-[#21483a] group-hover:text-white transition-colors">
                    <Icon size={19} />
                  </div>
                  <ArrowUpRight size={16} className="text-[#b1b8b3] group-hover:text-[#39725a] transition" />
                </div>

                <h3 className="text-sm font-bold text-[#24312b] mt-5">{action.title}</h3>
                <p className="text-[11px] leading-5 text-[#8b958e] mt-1">{action.description}</p>
              </Link>
            )
          })}
        </div>
      </section>
    </div>
  )
}

function ActivityRow({ label, value, icon: Icon }) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-2xl bg-[#f3f1e9]/65">
      <div className="w-9 h-9 rounded-xl bg-white text-[#39725a] flex items-center justify-center">
        <Icon size={15} />
      </div>
      <p className="flex-1 text-[12px] font-semibold text-[#536059]">{label}</p>
      <span className="text-sm font-bold text-[#24312b]">{value}</span>
    </div>
  )
}

function SectionHeader({ title, eyebrow, link }) {
  return (
    <div className="px-5 sm:px-6 py-5 flex items-center justify-between">
      <div>
        <p className="text-[11px] font-semibold text-[#929c95]">{eyebrow}</p>
        <h3 className="font-display text-xl font-bold text-[#24312b] mt-1">{title}</h3>
      </div>

      <Link to={link} className="flex items-center gap-1 text-[11px] font-bold text-[#39725a] hover:text-[#21483a]">
        View all
        <ChevronRight size={13} />
      </Link>
    </div>
  )
}

function EmptyState({ icon: Icon, title, text }) {
  return (
    <div className="px-6 py-10 text-center">
      <div className="mx-auto w-11 h-11 rounded-[14px] bg-[#f3f1e9] text-[#a0aaa3] flex items-center justify-center">
        <Icon size={18} />
      </div>
      <p className="text-xs font-bold text-[#536059] mt-3">{title}</p>
      <p className="text-[11px] text-[#9aa39d] mt-1">{text}</p>
    </div>
  )
}
