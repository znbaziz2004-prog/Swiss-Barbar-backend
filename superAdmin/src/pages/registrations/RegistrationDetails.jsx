import { useCallback, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { CheckCircle2, XCircle } from 'lucide-react'
import PageHeader from '../../components/layout/PageHeader'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import Loader from '../../components/ui/Loader'
import Modal from '../../components/ui/Modal'
import Notice from '../../components/ui/Notice'
import {
  approveRegistration,
  getRegistration,
  rejectRegistration,
} from '../../services/adminService'
import { getErrorMessage } from '../../services/api'
import { formatDateTime } from '../../services/format'

function Field({ label, value }) {
  return (
    <div>
      <p className="text-[11px] font-semibold text-[#929c95]">{label}</p>
      <p className="text-sm text-[#24312b] mt-1 break-words">{value || '—'}</p>
    </div>
  )
}

export default function RegistrationDetails() {
  const { id } = useParams()
  const [item, setItem] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [busy, setBusy] = useState(false)
  const [rejectOpen, setRejectOpen] = useState(false)
  const [reason, setReason] = useState('')

  const load = useCallback(async () => {
    try {
      setItem(await getRegistration(id))
    } catch (err) {
      setError(getErrorMessage(err, 'Could not load this registration.'))
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    load()
  }, [load])

  const handleApprove = async () => {
    setBusy(true)
    setError('')
    setSuccess('')
    try {
      await approveRegistration(id)
      setSuccess('Registration approved. The shop owner can now sign in.')
      await load()
    } catch (err) {
      setError(getErrorMessage(err, 'Could not approve this registration.'))
    } finally {
      setBusy(false)
    }
  }

  const handleReject = async () => {
    setBusy(true)
    setError('')
    setSuccess('')
    try {
      await rejectRegistration(id, reason.trim())
      setRejectOpen(false)
      setReason('')
      setSuccess('Registration rejected.')
      await load()
    } catch (err) {
      setError(getErrorMessage(err, 'Could not reject this registration.'))
    } finally {
      setBusy(false)
    }
  }

  if (loading) return <Loader label="Loading registration..." />

  if (!item) {
    return (
      <div className="space-y-6">
        <PageHeader title="Registration" backTo="/admin/registrations" backLabel="All registrations" />
        <Notice>{error || 'Registration not found.'}</Notice>
      </div>
    )
  }

  const isPending = String(item.status).toLowerCase() === 'pending'

  console.log('REGISTRATION ITEM:', item)
console.log('REGISTRATION STATUS:', item.status)

  return (
    <div className="space-y-6 pb-10">
      <PageHeader
        title={item.shop_name || 'Registration'}
        description={`Applied ${formatDateTime(item.created_at)}`}
        backTo="/admin/registrations"
        backLabel="All registrations"
        actions={
          isPending && (
            <>
              <Button variant="secondary" icon={XCircle} onClick={() => setRejectOpen(true)} disabled={busy}>
                Reject
              </Button>
              <Button icon={CheckCircle2} onClick={handleApprove} loading={busy}>
                Approve shop
              </Button>
            </>
          )
        }
      />

      <Notice>{error}</Notice>
      <Notice type="success">{success}</Notice>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        <section className="soft-card p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-display text-xl font-bold">Shop</h2>
            <Badge status={item.status} />
          </div>

          <div className="grid sm:grid-cols-2 gap-5">
            <Field label="Shop name" value={item.shop_name} />
            <Field label="Shop phone" value={item.shop_phone || item.phone} />
            <Field label="Address" value={item.address} />
            <Field label="Postal code" value={item.postal_code} />
            <Field label="City" value={item.city} />
            <Field label="Canton" value={item.canton} />
          </div>
        </section>

        <section className="soft-card p-6">
          <h2 className="font-display text-xl font-bold mb-5">Owner</h2>

          <div className="grid sm:grid-cols-2 gap-5">
            <Field label="Name" value={item.owner_name} />
            <Field label="Email" value={item.owner_email} />
            <Field label="Phone" value={item.owner_phone} />
            <Field label="Selected plan" value={item.plan_name} />
          </div>
        </section>
      </div>

      {item.rejection_reason && (
        <section className="soft-card p-6">
          <h2 className="font-display text-xl font-bold mb-3">Rejection reason</h2>
          <p className="text-sm text-[#536059] leading-6">{item.rejection_reason}</p>
        </section>
      )}

      <Modal
        open={rejectOpen}
        onClose={() => setRejectOpen(false)}
        title="Reject this registration?"
        description="Add a short reason. It helps the applicant understand the decision."
        footer={
          <>
            <Button variant="ghost" onClick={() => setRejectOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleReject} loading={busy}>
              Reject registration
            </Button>
          </>
        }
      >
        <label htmlFor="reason" className="block text-xs font-semibold text-[#536059] mb-1.5">
          Reason
        </label>
        <textarea
          id="reason"
          rows={4}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="For example: address could not be verified."
          className="w-full rounded-[14px] bg-white border border-black/[0.07] p-3.5 text-sm placeholder:text-[#a2aaa4] focus:outline-none focus:border-[#39725a]/40 focus:ring-4 focus:ring-[#39725a]/10 mb-4"
        />
      </Modal>
    </div>
  )
}
