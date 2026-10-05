import { useEffect, useState } from 'react'
import { CalendarDays, Store, TrendingUp, Wallet } from 'lucide-react'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import PageHeader from '../../components/layout/PageHeader'
import StatCard from '../../components/ui/StatCard'
import DataTable from '../../components/ui/DataTable'
import Notice from '../../components/ui/Notice'
import { getReports } from '../../services/adminService'
import { getErrorMessage } from '../../services/api'
import { formatCurrency } from '../../services/format'

const ranges = [
  { value: '7d', label: 'Last 7 days' },
  { value: '30d', label: 'Last 30 days' },
  { value: '90d', label: 'Last 90 days' },
]

const tooltipStyle = {
  border: '1px solid rgba(36,49,43,0.08)',
  borderRadius: '12px',
  background: '#faf9f4',
  boxShadow: '0 12px 30px rgba(37,55,46,0.10)',
  fontSize: 12,
}

const shortDate = (v) => {
  const d = new Date(v)
  return Number.isNaN(d.getTime())
    ? v
    : d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })
}

export default function Reports() {
  const [range, setRange] = useState('30d')
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    setLoading(true)
    setError('')
    ;(async () => {
      try {
        const res = await getReports({ range })
        if (active) setData(res)
      } catch (err) {
        if (active) setError(getErrorMessage(err, 'Could not load reports.'))
      } finally {
        if (active) setLoading(false)
      }
    })()
    return () => {
      active = false
    }
  }, [range])

  const totals = data?.totals || {}
  const series = Array.isArray(data?.series) ? data.series : []
  const topShops = Array.isArray(data?.top_shops) ? data.top_shops : []

  const topColumns = [
    { key: 'name', header: 'Shop', render: (s) => <span className="font-bold">{s.name || s.shop_name}</span> },
    { key: 'appointments', header: 'Appointments', render: (s) => s.appointments ?? 0 },
    {
      key: 'revenue',
      header: 'Revenue',
      align: 'right',
      render: (s) => <span className="font-bold">{formatCurrency(s.revenue)}</span>,
    },
  ]

  return (
    <div className="space-y-6 pb-10">
      <PageHeader
        title="Reports"
        description="How the platform is performing across all shops."
        actions={
          <select
            value={range}
            onChange={(e) => setRange(e.target.value)}
            aria-label="Report range"
            className="h-10 px-3.5 rounded-[12px] bg-[#faf9f4] border border-black/[0.07] text-xs font-semibold text-[#24312b] focus:outline-none focus:ring-4 focus:ring-[#39725a]/10"
          >
            {ranges.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>
        }
      />

      <Notice>{error}</Notice>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard title="Appointments" value={totals.appointments ?? 0} subtitle="Booked in this period" icon={CalendarDays} iconClass="bg-[#e3ebe8] text-[#21483a]" loading={loading} />
        <StatCard title="Shop revenue" value={formatCurrency(totals.revenue)} subtitle="Completed bookings" icon={TrendingUp} loading={loading} />
        <StatCard title="Subscription income" value={formatCurrency(totals.subscription_revenue)} subtitle="Plans paid by shops" icon={Wallet} iconClass="bg-[#e8eee5] text-[#39725a]" loading={loading} />
        <StatCard title="New shops" value={totals.new_shops ?? 0} subtitle="Joined in this period" icon={Store} iconClass="bg-[#ece8df] text-[#806d59]" loading={loading} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        <section className="soft-card p-5 sm:p-6">
          <h2 className="font-display text-xl font-bold">Revenue</h2>
          <p className="text-xs text-[#8b958e] mt-1">Completed bookings per day, in CHF</p>

          <div className="h-[260px] mt-5">
            {series.length === 0 ? (
              <p className="h-full flex items-center justify-center text-xs text-[#9aa39d]">
                {loading ? 'Loading chart...' : 'No data for this period.'}
              </p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={series} margin={{ top: 10, right: 5, left: -15, bottom: 0 }}>
                  <defs>
                    <linearGradient id="repRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#39725a" stopOpacity={0.24} />
                      <stop offset="100%" stopColor="#39725a" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="rgba(36,49,43,0.06)" vertical={false} />
                  <XAxis dataKey="date" tickFormatter={shortDate} axisLine={false} tickLine={false} tick={{ fill: '#9aa39d', fontSize: 10 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9aa39d', fontSize: 10 }} />
                  <Tooltip contentStyle={tooltipStyle} labelFormatter={shortDate} formatter={(v) => [`CHF ${v}`, 'Revenue']} />
                  <Area type="monotone" dataKey="revenue" stroke="#39725a" strokeWidth={2.5} fill="url(#repRevenue)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </section>

        <section className="soft-card p-5 sm:p-6">
          <h2 className="font-display text-xl font-bold">Appointments</h2>
          <p className="text-xs text-[#8b958e] mt-1">Bookings per day across all shops</p>

          <div className="h-[260px] mt-5">
            {series.length === 0 ? (
              <p className="h-full flex items-center justify-center text-xs text-[#9aa39d]">
                {loading ? 'Loading chart...' : 'No data for this period.'}
              </p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={series} margin={{ top: 10, right: 5, left: -15, bottom: 0 }}>
                  <CartesianGrid stroke="rgba(36,49,43,0.06)" vertical={false} />
                  <XAxis dataKey="date" tickFormatter={shortDate} axisLine={false} tickLine={false} tick={{ fill: '#9aa39d', fontSize: 10 }} />
                  <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{ fill: '#9aa39d', fontSize: 10 }} />
                  <Tooltip contentStyle={tooltipStyle} labelFormatter={shortDate} formatter={(v) => [v, 'Appointments']} cursor={{ fill: 'rgba(57,114,90,0.06)' }} />
                  <Bar dataKey="appointments" fill="#21483a" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </section>
      </div>

      <section className="soft-card overflow-hidden">
        <div className="px-6 py-5">
          <h2 className="font-display text-xl font-bold">Top shops</h2>
          <p className="text-xs text-[#8b958e] mt-1">Ranked by revenue in this period</p>
        </div>
        <DataTable
          columns={topColumns}
          rows={topShops}
          loading={loading}
          rowKey="name"
          pageSize={5}
          emptyTitle="No shop activity yet"
          emptyText="Top shops will show up once bookings are completed."
        />
      </section>
    </div>
  )
}
