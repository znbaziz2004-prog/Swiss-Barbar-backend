import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, Store } from 'lucide-react'
import PageHeader from '../../components/layout/PageHeader'
import DataTable from '../../components/ui/DataTable'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import SearchBar from '../../components/ui/SearchBar'
import Notice from '../../components/ui/Notice'
import { getRegistrations } from '../../services/adminService'
import { getErrorMessage } from '../../services/api'
import { formatDate } from '../../services/format'

const tabs = [
  { value: 'all', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
]

export default function Registrations() {
  const navigate = useNavigate()
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [status, setStatus] = useState('all')
  const [search, setSearch] = useState('')

  useEffect(() => {
    let active = true
    ;(async () => {
      try {
        const data = await getRegistrations()
        if (active) setRows(data)
      } catch (err) {
        if (active) setError(getErrorMessage(err, 'Could not load registrations.'))
      } finally {
        if (active) setLoading(false)
      }
    })()
    return () => {
      active = false
    }
  }, [])

  const counts = useMemo(() => {
    const c = { all: rows.length, pending: 0, approved: 0, rejected: 0 }
    rows.forEach((r) => {
      const s = String(r.status || '').toLowerCase()
      if (c[s] !== undefined) c[s] += 1
    })
    return c
  }, [rows])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return rows.filter((r) => {
      const matchStatus = status === 'all' || String(r.status).toLowerCase() === status
      const matchSearch =
        !q ||
        [r.shop_name, r.owner_name, r.owner_email, r.city]
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
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#e6eee8] text-[#39725a] flex items-center justify-center shrink-0">
            <Store size={16} />
          </div>
          <div className="min-w-0">
            <p className="font-bold truncate">{r.shop_name || 'New barber shop'}</p>
            <p className="text-[11px] text-[#8d9790] truncate mt-0.5">
              {[r.city, r.canton].filter(Boolean).join(', ') || '—'}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: 'owner',
      header: 'Owner',
      render: (r) => (
        <div>
          <p className="font-semibold">{r.owner_name || '—'}</p>
          <p className="text-[11px] text-[#8d9790] mt-0.5">{r.owner_email || '—'}</p>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (r) => <Badge status={r.status} />,
    },
    {
      key: 'created_at',
      header: 'Applied',
      render: (r) => <span className="text-[#6b776f]">{formatDate(r.created_at)}</span>,
    },
    {
      key: 'actions',
      header: '',
      align: 'right',
      render: (r) => (
        <Button
          size="sm"
          variant="soft"
          icon={Eye}
          onClick={(e) => {
            e.stopPropagation()
            navigate(`/admin/registrations/${r.id}`)
          }}
        >
          Review
        </Button>
      ),
    },
  ]

  return (
    <div className="space-y-6 pb-10">
      <PageHeader
        title="Registrations"
        description="Review new barber shop applications and decide who joins the platform."
      />

      <Notice>{error}</Notice>

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
                <span className={`ml-1.5 ${status === t.value ? 'text-white/60' : 'text-[#a0a8a3]'}`}>
                  {counts[t.value]}
                </span>
              </button>
            ))}
          </div>

          <SearchBar value={search} onChange={setSearch} placeholder="Search by shop, owner or city" />
        </div>

        <DataTable
          columns={columns}
          rows={filtered}
          loading={loading}
          onRowClick={(r) => navigate(`/admin/registrations/${r.id}`)}
          emptyTitle="No registrations found"
          emptyText={
            rows.length === 0
              ? 'New barber applications will appear here.'
              : 'Try a different filter or search term.'
          }
        />
      </div>
    </div>
  )
}
