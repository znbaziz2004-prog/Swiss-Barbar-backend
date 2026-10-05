import { useCallback, useEffect, useState } from 'react'
import { Check, Pencil, Plus, Trash2 } from 'lucide-react'
import PageHeader from '../../components/layout/PageHeader'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import Loader from '../../components/ui/Loader'
import Modal from '../../components/ui/Modal'
import Notice from '../../components/ui/Notice'
import {
  createPlan,
  deletePlan,
  getPlans,
  updatePlan,
} from '../../services/adminService'
import { getErrorMessage } from '../../services/api'
import { formatCurrency } from '../../services/format'

const emptyForm = {
  name: '',
  price: '',
  billing_cycle: 'monthly',
  max_staff: '',
  max_branches: '',
  features: '',
  status: 'active',
}

const inputClass =
  'w-full h-11 px-3.5 rounded-[12px] bg-white border border-black/[0.07] text-sm placeholder:text-[#a2aaa4] focus:outline-none focus:border-[#39725a]/40 focus:ring-4 focus:ring-[#39725a]/10'

const parseFeatures = (value) => {
  if (Array.isArray(value)) return value
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value)
      if (Array.isArray(parsed)) return parsed
    } catch {
      return value.split('\n').filter(Boolean)
    }
  }
  return []
}

export default function SubscriptionPlans() {
  const [plans, setPlans] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState('')

  const [toDelete, setToDelete] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const load = useCallback(async () => {
    try {
      setPlans(await getPlans())
    } catch (err) {
      setError(getErrorMessage(err, 'Could not load plans.'))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const openCreate = () => {
    setEditing(null)
    setForm(emptyForm)
    setFormError('')
    setModalOpen(true)
  }

  const openEdit = (plan) => {
    setEditing(plan)
    setForm({
      name: plan.name || '',
      price: plan.price ?? '',
      billing_cycle: plan.billing_cycle || 'monthly',
      max_staff: plan.max_staff ?? '',
      max_branches: plan.max_branches ?? '',
      features: parseFeatures(plan.features).join('\n'),
      status: plan.status || 'active',
    })
    setFormError('')
    setModalOpen(true)
  }

  const setField = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  const handleSave = async () => {
    if (!form.name.trim()) return setFormError('Enter a plan name.')
    if (form.price === '' || Number(form.price) < 0) return setFormError('Enter a valid price.')

    const payload = {
      name: form.name.trim(),
      price: Number(form.price),
      billing_cycle: form.billing_cycle,
      max_staff: form.max_staff === '' ? null : Number(form.max_staff),
      max_branches: form.max_branches === '' ? null : Number(form.max_branches),
      features: form.features.split('\n').map((f) => f.trim()).filter(Boolean),
      status: form.status,
    }

    setSaving(true)
    setFormError('')
    try {
      if (editing) await updatePlan(editing.id, payload)
      else await createPlan(payload)
      setModalOpen(false)
      setSuccess(editing ? 'Plan updated.' : 'Plan created.')
      await load()
    } catch (err) {
      setFormError(getErrorMessage(err, 'Could not save this plan.'))
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await deletePlan(toDelete.id)
      setToDelete(null)
      setSuccess('Plan deleted.')
      await load()
    } catch (err) {
      setToDelete(null)
      setError(getErrorMessage(err, 'Could not delete this plan. It may have active subscribers.'))
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="space-y-6 pb-10">
      <PageHeader
        title="Subscription plans"
        description="Plans that barber shops can subscribe to."
        backTo="/admin/subscriptions"
        backLabel="Subscriptions"
        actions={
          <Button icon={Plus} onClick={openCreate}>
            New plan
          </Button>
        }
      />

      <Notice>{error}</Notice>
      <Notice type="success">{success}</Notice>

      {loading ? (
        <Loader />
      ) : plans.length === 0 ? (
        <div className="soft-card px-6 py-14 text-center">
          <p className="text-sm font-bold text-[#536059]">No plans yet</p>
          <p className="text-xs text-[#9aa39d] mt-1 mb-5">
            Create your first plan so new shops can subscribe.
          </p>
          <Button icon={Plus} onClick={openCreate}>
            New plan
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {plans.map((plan) => (
            <div key={plan.id} className="soft-card p-6 flex flex-col">
              <div className="flex items-start justify-between gap-3">
                <h3 className="font-display text-xl font-bold">{plan.name}</h3>
                <Badge status={plan.status || 'active'} />
              </div>

              <p className="mt-4">
                <span className="font-display text-3xl font-bold">
                  {formatCurrency(plan.price)}
                </span>
                <span className="text-xs text-[#8b958e] ml-1.5">
                  / {plan.billing_cycle === 'yearly' ? 'year' : 'month'}
                </span>
              </p>

              <p className="text-xs text-[#6b776f] mt-3">
                {plan.max_staff ? `Up to ${plan.max_staff} staff` : 'Unlimited staff'}
                {' · '}
                {plan.max_branches ? `${plan.max_branches} branches` : 'Unlimited branches'}
              </p>

              <ul className="mt-4 space-y-2 flex-1">
                {parseFeatures(plan.features).map((f) => (
                  <li key={f} className="flex items-start gap-2 text-xs text-[#536059]">
                    <Check size={14} className="text-[#39725a] mt-0.5 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>

              <div className="flex items-center gap-2 mt-6 pt-4 border-t border-black/[0.05]">
                <Button size="sm" variant="soft" icon={Pencil} onClick={() => openEdit(plan)}>
                  Edit
                </Button>
                <Button size="sm" variant="ghost" icon={Trash2} onClick={() => setToDelete(plan)}>
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CREATE / EDIT */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Edit plan' : 'New plan'}
        footer={
          <>
            <Button variant="ghost" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} loading={saving}>
              {editing ? 'Save changes' : 'Create plan'}
            </Button>
          </>
        }
      >
        <div className="space-y-4 pb-4">
          <Notice>{formError}</Notice>

          <div>
            <label htmlFor="plan-name" className="block text-xs font-semibold text-[#536059] mb-1.5">Plan name</label>
            <input id="plan-name" className={inputClass} value={form.name} onChange={setField('name')} placeholder="Professional" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="plan-price" className="block text-xs font-semibold text-[#536059] mb-1.5">Price (CHF)</label>
              <input id="plan-price" type="number" min="0" step="0.05" className={inputClass} value={form.price} onChange={setField('price')} placeholder="49" />
            </div>
            <div>
              <label htmlFor="plan-cycle" className="block text-xs font-semibold text-[#536059] mb-1.5">Billing</label>
              <select id="plan-cycle" className={inputClass} value={form.billing_cycle} onChange={setField('billing_cycle')}>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="plan-staff" className="block text-xs font-semibold text-[#536059] mb-1.5">Max staff</label>
              <input id="plan-staff" type="number" min="1" className={inputClass} value={form.max_staff} onChange={setField('max_staff')} placeholder="Unlimited" />
            </div>
            <div>
              <label htmlFor="plan-branches" className="block text-xs font-semibold text-[#536059] mb-1.5">Max branches</label>
              <input id="plan-branches" type="number" min="1" className={inputClass} value={form.max_branches} onChange={setField('max_branches')} placeholder="Unlimited" />
            </div>
          </div>

          <div>
            <label htmlFor="plan-features" className="block text-xs font-semibold text-[#536059] mb-1.5">Features (one per line)</label>
            <textarea
              id="plan-features"
              rows={4}
              value={form.features}
              onChange={setField('features')}
              placeholder={'Online booking\nEmail reminders\nReports'}
              className="w-full rounded-[12px] bg-white border border-black/[0.07] p-3.5 text-sm placeholder:text-[#a2aaa4] focus:outline-none focus:border-[#39725a]/40 focus:ring-4 focus:ring-[#39725a]/10"
            />
          </div>

          <div>
            <label htmlFor="plan-status" className="block text-xs font-semibold text-[#536059] mb-1.5">Status</label>
            <select id="plan-status" className={inputClass} value={form.status} onChange={setField('status')}>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
      </Modal>

      {/* DELETE */}
      <Modal
        open={Boolean(toDelete)}
        onClose={() => setToDelete(null)}
        size="sm"
        title={`Delete ${toDelete?.name || 'plan'}?`}
        description="Shops already on this plan may be affected. This cannot be undone."
        footer={
          <>
            <Button variant="ghost" onClick={() => setToDelete(null)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDelete} loading={deleting}>
              Delete plan
            </Button>
          </>
        }
      />
    </div>
  )
}
