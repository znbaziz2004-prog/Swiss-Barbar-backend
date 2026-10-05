import { useEffect, useMemo, useState } from 'react'
import { CreditCard, ReceiptText, TrendingUp } from 'lucide-react'
import PageHeader from '../../components/layout/PageHeader'
import DataTable from '../../components/ui/DataTable'
import Badge from '../../components/ui/Badge'
import SearchBar from '../../components/ui/SearchBar'
import Notice from '../../components/ui/Notice'
import StatCard from '../../components/ui/StatCard'
import { getSubscriptionPayments } from '../../services/adminService'
import { getErrorMessage } from '../../services/api'
import { formatCurrency, formatDateTime } from '../../services/format'

const tabs = [
  { value: 'all', label: 'All' },
  { value: 'paid', label: 'Paid' },
  { value: 'pending', label: 'Pending' },
  { value: 'failed', label: 'Failed' },
]

const isPaid = (p) => ['paid', 'succeeded', 'completed'].includes(String(p.status).toLowerCase())

export default function SubscriptionPayments() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [status, setStatus] = useState('all')
  const [search, setSearch] = useState('')

  useEffect(() => {
    let active = true
    ;(async () => {
      try {
        const data = await getSubscriptionPayments()
        if (active) setRows(data)
      } catch (err) {
        if (active) setError(getErrorMessage(err, 'Could not load payments.'))
      } finally {
        if (active) setLoading(false)
      }
    })()
    return () => {
      active = false
    }
  }, [])

  const totals = useMemo(() => {
    const paid = rows.filter(isPaid)
    return {
      revenue: paid.reduce((sum, p) => sum + Number(p.amount || 0), 0),
      paid: paid.length,
      pending: rows.filter((p) => String(p.status).toLowerCase() === 'pending').length,
    }
  }, [rows])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return rows.filter((p) => {
      const s = String(p.status).toLowerCase()
      const matchStatus =
        status === 'all' || s === status || (status === 'paid' && isPaid(p))
      const matchSearch =
        !q ||
        [p.shop_name, p.plan_name, p.reference, p.transaction_id]
          .filter(Boolean)
          .some((v) => String(v).toLowerCase().includes(q))
      return matchStatus && matchSearch
    })
  }, [rows, status, search])

  const columns = [
    {
      key: 'shop',
      header: 'Shop',
      render: (p) => (
        <div>
          <p className="font-bold">{p.shop_name || '—'}</p>
          <p className="text-[11px] text-[#8d9790] mt-0.5">{p.plan_name || ''}</p>
        </div>
      ),
    },
    {
      key: 'amount',
      header: 'Amount',
      render: (p) => <span className="font-bold">{formatCurrency(p.amount, p.currency || 'CHF')}</span>,
    },
    { key: 'method', header: 'Method', render: (p) => <span className="capitalize">{p.payment_method || p.method || '—'}</span> },
    {
      key: 'reference',
      header: 'Reference',
      render: (p) => <span className="text-[#6b776f]">{p.reference || p.transaction_id || '—'}</span>,
    },
    { key: 'status', header: 'Status', render: (p) => <Badge status={p.status} /> },
    {
      key: 'date',
      header: 'Date',
      render: (p) => <span className="text-[#6b776f]">{formatDateTime(p.paid_at || p.created_at)}</span>,
    },
  ]

  return (
    <div className="space-y-6 pb-10">
      <PageHeader
        title="Payments"
        description="Subscription payments received from barber shops."
      />

      <Notice>{error}</Notice>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard title="Total received" value={formatCurrency(totals.revenue)} subtitle="Paid subscription payments" icon={TrendingUp} loading={loading} />
        <StatCard title="Paid" value={totals.paid} subtitle="Successful payments" icon={ReceiptText} iconClass="bg-[#e3ebe8] text-[#21483a]" loading={loading} />
        <StatCard title="Pending" value={totals.pending} subtitle="Waiting for confirmation" icon={CreditCard} iconClass="bg-[#ece8df] text-[#806d59]" loading={loading} />
      </div>

      <div className="soft-card overflow-hidden">
        <div className="p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 border-b border-black/[0.05]">
          <div className="flex items-center gap-1.5 flex-wrap">
            {tabs.map((t) => (
              <button
                key={t.value}
                type="button"
                onClick={() => setStatus(t.value)}
                className={`h-9 px-3.5 rounded-[11px] text-xs font-semibold transition-colors ${
                  status === t.value
                    ? 'bg-[#21483a] text-white'
                    : 'text-[#6b776f] hover:bg-[#f3f1e9]'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <SearchBar value={search} onChange={setSearch} placeholder="Search by shop or reference" />
        </div>

        <DataTable
          columns={columns}
          rows={filtered}
          loading={loading}
          emptyTitle="No payments found"
          emptyText={rows.length === 0 ? 'Payments appear after shops pay for a plan.' : 'Try a different filter or search term.'}
        />
      </div>
    </div>
  )
}
