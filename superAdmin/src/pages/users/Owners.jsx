import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye } from 'lucide-react'
import PageHeader from '../../components/layout/PageHeader'
import DataTable from '../../components/ui/DataTable'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import SearchBar from '../../components/ui/SearchBar'
import Notice from '../../components/ui/Notice'
import { getOwners } from '../../services/adminService'
import { getErrorMessage } from '../../services/api'
import { formatDate, initials } from '../../services/format'

export default function Owners() {
  const navigate = useNavigate()
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')

  useEffect(() => {
    let active = true
    ;(async () => {
      try {
        const data = await getOwners()
        if (active) setRows(data)
      } catch (err) {
        if (active) setError(getErrorMessage(err, 'Could not load owners.'))
      } finally {
        if (active) setLoading(false)
      }
    })()
    return () => {
      active = false
    }
  }, [])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return rows
    return rows.filter((o) =>
      [o.name, o.email, o.phone, o.shop_name]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q)),
    )
  }, [rows, search])

  const columns = [
    {
      key: 'name',
      header: 'Owner',
      render: (o) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#21483a] text-white flex items-center justify-center text-[11px] font-bold shrink-0">
            {initials(o.name)}
          </div>
          <div className="min-w-0">
            <p className="font-bold truncate">{o.name || '—'}</p>
            <p className="text-[11px] text-[#8d9790] truncate mt-0.5">{o.email}</p>
          </div>
        </div>
      ),
    },
    { key: 'phone', header: 'Phone', render: (o) => o.phone || '—' },
    {
      key: 'shops',
      header: 'Shops',
      render: (o) => <span className="font-semibold">{o.shops_count ?? o.shop_name ?? 0}</span>,
    },
    { key: 'status', header: 'Status', render: (o) => <Badge status={o.status || 'active'} /> },
    {
      key: 'created_at',
      header: 'Joined',
      render: (o) => <span className="text-[#6b776f]">{formatDate(o.created_at)}</span>,
    },
    {
      key: 'actions',
      header: '',
      align: 'right',
      render: (o) => (
        <Button
          size="sm"
          variant="soft"
          icon={Eye}
          onClick={(e) => {
            e.stopPropagation()
            navigate(`/admin/owners/${o.id}`)
          }}
        >
          View
        </Button>
      ),
    },
  ]

  return (
    <div className="space-y-6 pb-10">
      <PageHeader
        title="Owners"
        description="Barber shop owners registered on the platform."
      />

      <Notice>{error}</Notice>

      <div className="soft-card overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-black/[0.05]">
          <SearchBar value={search} onChange={setSearch} placeholder="Search by name, email or shop" />
        </div>

        <DataTable
          columns={columns}
          rows={filtered}
          loading={loading}
          onRowClick={(o) => navigate(`/admin/owners/${o.id}`)}
          emptyTitle="No owners found"
          emptyText={rows.length === 0 ? 'Owners appear here after their shop is approved.' : 'Try a different search term.'}
        />
      </div>
    </div>
  )
}
