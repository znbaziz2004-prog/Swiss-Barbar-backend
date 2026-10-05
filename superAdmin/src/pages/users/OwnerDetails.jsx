import { useCallback, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Ban, CheckCircle2 } from 'lucide-react'
import PageHeader from '../../components/layout/PageHeader'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import Loader from '../../components/ui/Loader'
import Notice from '../../components/ui/Notice'
import DataTable from '../../components/ui/DataTable'
import { getOwner, updateOwnerStatus } from '../../services/adminService'
import { getErrorMessage } from '../../services/api'
import { formatDate } from '../../services/format'

function Field({ label, value }) {
  return (
    <div>
      <p className="text-[11px] font-semibold text-[#929c95]">{label}</p>
      <p className="text-sm text-[#24312b] mt-1 break-words">{value || '—'}</p>
    </div>
  )
}

export default function OwnerDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [owner, setOwner] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [busy, setBusy] = useState(false)

  const load = useCallback(async () => {
    try {
      setOwner(await getOwner(id))
    } catch (err) {
      setError(getErrorMessage(err, 'Could not load this owner.'))
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    load()
  }, [load])

  const changeStatus = async (status) => {
    setBusy(true)
    setError('')
    setSuccess('')
    try {
      await updateOwnerStatus(id, status)
      setSuccess(status === 'active' ? 'Owner account activated.' : 'Owner account suspended.')
      await load()
    } catch (err) {
      setError(getErrorMessage(err, 'Could not update owner status.'))
    } finally {
      setBusy(false)
    }
  }

  if (loading) return <Loader label="Loading owner..." />

  if (!owner) {
    return (
      <div className="space-y-6">
        <PageHeader title="Owner" backTo="/admin/owners" backLabel="All owners" />
        <Notice>{error || 'Owner not found.'}</Notice>
      </div>
    )
  }

  const status = owner.status || 'active'
  const isActive = String(status).toLowerCase() === 'active'
  const shops = Array.isArray(owner.shops) ? owner.shops : []

  const shopColumns = [
    { key: 'name', header: 'Shop', render: (s) => <span className="font-bold">{s.name}</span> },
    { key: 'city', header: 'City', render: (s) => s.city || '—' },
    { key: 'status', header: 'Status', render: (s) => <Badge status={s.status} /> },
    { key: 'created_at', header: 'Created', render: (s) => formatDate(s.created_at) },
  ]

  return (
    <div className="space-y-6 pb-10">
      <PageHeader
        title={owner.name || 'Owner'}
        description={owner.email}
        backTo="/admin/owners"
        backLabel="All owners"
        actions={
          isActive ? (
            <Button variant="danger" icon={Ban} onClick={() => changeStatus('suspended')} loading={busy}>
              Suspend account
            </Button>
          ) : (
            <Button icon={CheckCircle2} onClick={() => changeStatus('active')} loading={busy}>
              Activate account
            </Button>
          )
        }
      />

      <Notice>{error}</Notice>
      <Notice type="success">{success}</Notice>

      <section className="soft-card p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display text-xl font-bold">Account</h2>
          <Badge status={status} />
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <Field label="Name" value={owner.name} />
          <Field label="Email" value={owner.email} />
          <Field label="Phone" value={owner.phone} />
          <Field label="Joined" value={formatDate(owner.created_at)} />
        </div>
      </section>

      <section className="soft-card overflow-hidden">
        <div className="px-6 py-5">
          <h2 className="font-display text-xl font-bold">Shops</h2>
        </div>
        <DataTable
          columns={shopColumns}
          rows={shops}
          onRowClick={(s) => navigate(`/admin/shops/${s.id}`)}
          emptyTitle="No shops yet"
          emptyText="This owner has not been linked to a shop."
        />
      </section>
    </div>
  )
}
