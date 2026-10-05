import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, Star, Store } from 'lucide-react'
import PageHeader from '../../components/layout/PageHeader'
import DataTable from '../../components/ui/DataTable'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import SearchBar from '../../components/ui/SearchBar'
import Notice from '../../components/ui/Notice'
import { getShops, toggleShopFeatured } from '../../services/adminService'
import { getErrorMessage } from '../../services/api'
import { formatDate } from '../../services/format'

const tabs = [
  { value: 'all', label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'pending', label: 'Pending' },
  { value: 'suspended', label: 'Suspended' },
]

export default function Shops() {
  const navigate = useNavigate()
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [status, setStatus] = useState('all')
  const [search, setSearch] = useState('')

  const load = useCallback(async () => {
    try {
      setRows(await getShops())
    } catch (err) {
      setError(getErrorMessage(err, 'Could not load shops.'))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const handleFeatured = async (shop) => {
    setError('')
    const next = !Number(shop.is_featured)
    try {
      await toggleShopFeatured(shop.id, next)
      setRows((prev) =>
        prev.map((s) => (s.id === shop.id ? { ...s, is_featured: next ? 1 : 0 } : s)),
      )
    } catch (err) {
      setError(getErrorMessage(err, 'Could not update featured status.'))
    }
  }

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return rows.filter((s) => {
      const matchStatus = status === 'all' || String(s.status).toLowerCase() === status
      const matchSearch =
        !q ||
        [s.name, s.city, s.canton, s.owner_name, s.owner_email]
          .filter(Boolean)
          .some((v) => String(v).toLowerCase().includes(q))
      return matchStatus && matchSearch
    })
  }, [rows, status, search])

  const columns = [
    {
      key: 'name',
      header: 'Shop',
      render: (s) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#ece8df] text-[#806d59] flex items-center justify-center shrink-0">
            <Store size={16} />
          </div>
          <div className="min-w-0">
            <p className="font-bold truncate flex items-center gap-1.5">
              {s.name}
              {Number(s.is_featured) === 1 && (
                <Star size={12} className="text-[#806d59] fill-[#806d59]" />
              )}
            </p>
            <p className="text-[11px] text-[#8d9790] truncate mt-0.5">
              {[s.city, s.canton].filter(Boolean).join(', ') || '—'}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: 'owner',
      header: 'Owner',
      render: (s) => (
        <div>
          <p className="font-semibold">{s.owner_name || '—'}</p>
          <p className="text-[11px] text-[#8d9790] mt-0.5">{s.owner_email || '—'}</p>
        </div>
      ),
    },
    { key: 'status', header: 'Status', render: (s) => <Badge status={s.status} /> },
    {
      key: 'created_at',
      header: 'Joined',
      render: (s) => <span className="text-[#6b776f]">{formatDate(s.created_at)}</span>,
    },
    {
      key: 'actions',
      header: '',
      align: 'right',
      render: (s) => (
        <div className="flex items-center justify-end gap-1.5">
          <Button
            size="sm"
            variant="ghost"
            icon={Star}
            onClick={(e) => {
              e.stopPropagation()
              handleFeatured(s)
            }}
          >
            {Number(s.is_featured) === 1 ? 'Unfeature' : 'Feature'}
          </Button>
          <Button
            size="sm"
            variant="soft"
            icon={Eye}
            onClick={(e) => {
              e.stopPropagation()
              navigate(`/admin/shops/${s.id}`)
            }}
          >
            View
          </Button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6 pb-10">
      <PageHeader
        title="Shops"
        description="Every barber shop on the platform. Activate, suspend or feature them."
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
              </button>
            ))}
          </div>

          <SearchBar value={search} onChange={setSearch} placeholder="Search by shop, owner or city" />
        </div>

        <DataTable
          columns={columns}
          rows={filtered}
          loading={loading}
          onRowClick={(s) => navigate(`/admin/shops/${s.id}`)}
          emptyTitle="No shops found"
          emptyText={
            rows.length === 0
              ? 'Approved shops will appear here.'
              : 'Try a different filter or search term.'
          }
        />
      </div>
    </div>
  )
}
