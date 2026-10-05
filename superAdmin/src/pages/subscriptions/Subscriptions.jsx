import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Layers } from 'lucide-react'
import PageHeader from '../../components/layout/PageHeader'
import DataTable from '../../components/ui/DataTable'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import SearchBar from '../../components/ui/SearchBar'
import Notice from '../../components/ui/Notice'
import {
  getSubscriptions,
  updateSubscriptionStatus,
} from '../../services/adminService'
import { getErrorMessage } from '../../services/api'
import { formatCurrency, formatDate } from '../../services/format'

const tabs = [
  { value: 'all', label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'trial', label: 'Trial' },
  { value: 'expired', label: 'Expired' },
  { value: 'cancelled', label: 'Cancelled' },
]

export default function Subscriptions() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [status, setStatus] = useState('all')
  const [search, setSearch] = useState('')

  const load = useCallback(async () => {
    try {
      setRows(await getSubscriptions())
    } catch (err) {
      setError(getErrorMessage(err, 'Could not load subscriptions.'))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const changeStatus = async (row, next) => {
    setError('')
    setSuccess('')
    try {
      await updateSubscriptionStatus(row.id, next)
      setSuccess(`Subscription for ${row.shop_name || 'shop'} is now ${next}.`)
      await load()
    } catch (err) {
      setError(getErrorMessage(err, 'Could not update subscription.'))
    }
  }

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return rows.filter((r) => {
      const matchStatus = status === 'all' || String(r.status).toLowerCase() === status
      const matchSearch =
        !q ||
        [r.shop_name, r.plan_name, r.owner_email]
          .filter(Boolean)
          .some((v) => String(v).toLowerCase().includes(q))
      return matchStatus && matchSearch
    })
  }, [rows, status, search])

  const columns = [
    {
      key: 'shop',
      header: 'Shop',
      render: (r) => (
        <div>
          <p className="font-bold">{r.shop_name || '—'}</p>
          <p className="text-[11px] text-[#8d9790] mt-0.5">{r.owner_email || ''}</p>
        </div>
      ),
    },
    { key: 'plan', header: 'Plan', render: (r) => <span className="font-semibold">{r.plan_name || '—'}</span> },
    {
      key: 'price',
      header: 'Price',
      render: (r) => formatCurrency(r.price ?? r.amount),
    },
    { key: 'status', header: 'Status', render: (r) => <Badge status={r.status} /> },
    {
      key: 'ends',
      header: 'Renews / ends',
      render: (r) => (
        <span className="text-[#6b776f]">{formatDate(r.ends_at || r.end_date)}</span>
      ),
    },
    {
      key: 'actions',
      header: '',
      align: 'right',
      render: (r) => {
        const s = String(r.status).toLowerCase()
        return s === 'active' ? (
          <Button size="sm" variant="ghost" onClick={() => changeStatus(r, 'cancelled')}>
            Cancel
          </Button>
        ) : (
          <Button size="sm" variant="soft" onClick={() => changeStatus(r, 'active')}>
            Activate
          </Button>
        )
      },
    },
  ]

  return (
    <div className="space-y-6 pb-10">
      <PageHeader
        title="Subscriptions"
        description="Which shops are on which plan, and whether they are in good standing."
        actions={
          <Link to="/admin/subscription-plans">
            <Button variant="secondary" icon={Layers}>
              Manage plans
            </Button>
          </Link>
        }
      />

      <Notice>{error}</Notice>
      <Notice type="success">{success}</Notice>

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

          <SearchBar value={search} onChange={setSearch} placeholder="Search by shop or plan" />
        </div>

        <DataTable
          columns={columns}
          rows={filtered}
          loading={loading}
          emptyTitle="No subscriptions found"
          emptyText={rows.length === 0 ? 'Subscriptions appear when a shop picks a plan.' : 'Try a different filter or search term.'}
        />
      </div>
    </div>
  )
}
