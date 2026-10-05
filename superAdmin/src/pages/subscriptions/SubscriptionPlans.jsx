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

const featureLabels = {
  appointments: 'Appointments',
  online_booking: 'Online booking',
  customer_management: 'Customer management',
  featured_badge: 'Featured badge',
  homepage_featured: 'Homepage featured',
  priority_listing: 'Priority listing',
  higher_search_visibility: 'Higher search visibility',
}

const parseFeaturesObject = (value) => {
  if (!value) return {}

  if (typeof value === 'object' && !Array.isArray(value)) {
    return value
  }

  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value)

      if (
        parsed &&
        typeof parsed === 'object' &&
        !Array.isArray(parsed)
      ) {
        return parsed
      }
    } catch {
      return {}
    }
  }

  return {}
}

const featureObjectToText = (features) => {
  const parsed = parseFeaturesObject(features)

  return Object.entries(parsed)
    .filter(([key]) => key !== 'staff' && key !== 'branches')
    .filter(([, value]) => value === true)
    .map(([key]) => featureLabels[key] || key)
    .join('\n')
}

const featureTextToObject = (text) => {
  const lines = String(text || '')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)

  const features = {}

  lines.forEach((line) => {
    const normalized = line.toLowerCase()

    if (normalized === 'appointments') {
      features.appointments = true
    } else if (normalized === 'online booking') {
      features.online_booking = true
    } else if (normalized === 'customer management') {
      features.customer_management = true
    } else if (normalized === 'featured badge') {
      features.featured_badge = true
    } else if (normalized === 'homepage featured') {
      features.homepage_featured = true
    } else if (normalized === 'priority listing') {
      features.priority_listing = true
    } else if (normalized === 'higher search visibility') {
      features.higher_search_visibility = true
    } else {
      const key = normalized
        .replace(/\s+/g, '_')
        .replace(/[^a-z0-9_]/g, '')

      if (key) {
        features[key] = true
      }
    }
  })

  return features
}

const getDisplayFeatures = (plan) => {
  const features = parseFeaturesObject(plan.features)
  const items = []

  if (features.staff !== undefined && features.staff !== null) {
    items.push(
      features.staff > 0
        ? `Up to ${features.staff} staff`
        : 'Unlimited staff',
    )
  }

  if (
    features.branches !== undefined &&
    features.branches !== null
  ) {
    items.push(
      features.branches > 0
        ? `Up to ${features.branches} branches`
        : 'Unlimited branches',
    )
  }

  Object.entries(features).forEach(([key, value]) => {
    if (
      key === 'staff' ||
      key === 'branches' ||
      value !== true
    ) {
      return
    }

    items.push(featureLabels[key] || key)
  })

  return items
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
      setError('')
      setPlans(await getPlans())
    } catch (err) {
      setError(
        getErrorMessage(
          err,
          'Could not load subscription plans.',
        ),
      )
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
    const features = parseFeaturesObject(plan.features)

    setEditing(plan)

    setForm({
      name: plan.name || '',
      price: plan.price ?? plan.monthly_price ?? '',
      billing_cycle:
        plan.billing_cycle ||
        plan.billing_interval ||
        'monthly',
      max_staff:
        features.staff !== undefined
          ? features.staff
          : '',
      max_branches:
        features.branches !== undefined
          ? features.branches
          : '',
      features: featureObjectToText(plan.features),
      status: plan.status || 'active',
    })

    setFormError('')
    setModalOpen(true)
  }

  const setField = (key) => (e) => {
    setForm((current) => ({
      ...current,
      [key]: e.target.value,
    }))
  }

  const handleSave = async () => {
    if (!form.name.trim()) {
      return setFormError('Enter a plan name.')
    }

    if (
      form.price === '' ||
      Number.isNaN(Number(form.price)) ||
      Number(form.price) < 0
    ) {
      return setFormError('Enter a valid price.')
    }

    const features = featureTextToObject(form.features)

    if (form.max_staff !== '') {
      const staff = Number(form.max_staff)

      if (
        Number.isNaN(staff) ||
        staff < 1
      ) {
        return setFormError(
          'Enter a valid maximum staff number.',
        )
      }

      features.staff = staff
    }

    if (form.max_branches !== '') {
      const branches = Number(form.max_branches)

      if (
        Number.isNaN(branches) ||
        branches < 1
      ) {
        return setFormError(
          'Enter a valid maximum branches number.',
        )
      }

      features.branches = branches
    }

    const payload = {
      name: form.name.trim(),
      price: Number(form.price),
      billing_cycle: form.billing_cycle,
      features,
      status: form.status,
    }

    setSaving(true)
    setFormError('')
    setError('')

    try {
      if (editing) {
        await updatePlan(editing.id, payload)
        setSuccess('Plan updated successfully.')
      } else {
        await createPlan(payload)
        setSuccess('Plan created successfully.')
      }

      setModalOpen(false)
      await load()
    } catch (err) {
      setFormError(
        getErrorMessage(
          err,
          'Could not save this plan.',
        ),
      )
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!toDelete) return

    setDeleting(true)
    setError('')

    try {
      await deletePlan(toDelete.id)

      setToDelete(null)
      setSuccess('Plan deleted successfully.')

      await load()
    } catch (err) {
      setToDelete(null)

      setError(
        getErrorMessage(
          err,
          'Could not delete this plan. It may have active subscribers.',
        ),
      )
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
          <Button
            icon={Plus}
            onClick={openCreate}
          >
            New plan
          </Button>
        }
      />

      <Notice>{error}</Notice>

      <Notice type="success">
        {success}
      </Notice>

      {loading ? (
        <Loader />
      ) : plans.length === 0 ? (
        <div className="soft-card px-6 py-14 text-center">
          <p className="text-sm font-bold text-[#536059]">
            No plans yet
          </p>

          <p className="text-xs text-[#9aa39d] mt-1 mb-5">
            Create your first plan so new shops can subscribe.
          </p>

          <Button
            icon={Plus}
            onClick={openCreate}
          >
            New plan
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {plans.map((plan) => {
            const displayFeatures =
              getDisplayFeatures(plan)

            return (
              <div
                key={plan.id}
                className="soft-card p-6 flex flex-col"
              >
                <div className="flex items-start justify-between gap-3">
                  <h3 className="font-display text-xl font-bold">
                    {plan.name}
                  </h3>

                  <Badge
                    status={
                      plan.status || 'active'
                    }
                  />
                </div>

                <p className="mt-4">
                  <span className="font-display text-3xl font-bold">
                    {formatCurrency(plan.price)}
                  </span>

                  <span className="text-xs text-[#8b958e] ml-1.5">
                    /{' '}
                    {plan.billing_cycle === 'yearly'
                      ? 'year'
                      : 'month'}
                  </span>
                </p>

                <ul className="mt-5 space-y-2 flex-1">
                  {displayFeatures.map(
                    (feature) => (
                      <li
                        key={feature}
                        className="flex items-start gap-2 text-xs text-[#536059]"
                      >
                        <Check
                          size={14}
                          className="text-[#39725a] mt-0.5 shrink-0"
                        />

                        <span>
                          {feature}
                        </span>
                      </li>
                    ),
                  )}

                  {displayFeatures.length === 0 && (
                    <li className="text-xs text-[#9aa39d]">
                      No additional features
                    </li>
                  )}
                </ul>

                <div className="flex items-center gap-2 mt-6 pt-4 border-t border-black/[0.05]">
                  <Button
                    size="sm"
                    variant="soft"
                    icon={Pencil}
                    onClick={() =>
                      openEdit(plan)
                    }
                  >
                    Edit
                  </Button>

                  <Button
                    size="sm"
                    variant="ghost"
                    icon={Trash2}
                    onClick={() =>
                      setToDelete(plan)
                    }
                  >
                    Delete
                  </Button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* CREATE / EDIT */}
      <Modal
        open={modalOpen}
        onClose={() =>
          setModalOpen(false)
        }
        title={
          editing
            ? 'Edit plan'
            : 'New plan'
        }
        footer={
          <>
            <Button
              variant="ghost"
              onClick={() =>
                setModalOpen(false)
              }
            >
              Cancel
            </Button>

            <Button
              onClick={handleSave}
              loading={saving}
            >
              {editing
                ? 'Save changes'
                : 'Create plan'}
            </Button>
          </>
        }
      >
        <div className="space-y-4 pb-4">
          <Notice>{formError}</Notice>

          <div>
            <label
              htmlFor="plan-name"
              className="block text-xs font-semibold text-[#536059] mb-1.5"
            >
              Plan name
            </label>

            <input
              id="plan-name"
              className={inputClass}
              value={form.name}
              onChange={setField('name')}
              placeholder="Professional"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label
                htmlFor="plan-price"
                className="block text-xs font-semibold text-[#536059] mb-1.5"
              >
                Price (CHF)
              </label>

              <input
                id="plan-price"
                type="number"
                min="0"
                step="0.05"
                className={inputClass}
                value={form.price}
                onChange={setField('price')}
                placeholder="49"
              />
            </div>

            <div>
              <label
                htmlFor="plan-cycle"
                className="block text-xs font-semibold text-[#536059] mb-1.5"
              >
                Billing
              </label>

              <select
                id="plan-cycle"
                className={inputClass}
                value={form.billing_cycle}
                onChange={setField(
                  'billing_cycle',
                )}
              >
                <option value="monthly">
                  Monthly
                </option>

                <option value="yearly">
                  Yearly
                </option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label
                htmlFor="plan-staff"
                className="block text-xs font-semibold text-[#536059] mb-1.5"
              >
                Max staff
              </label>

              <input
                id="plan-staff"
                type="number"
                min="1"
                className={inputClass}
                value={form.max_staff}
                onChange={setField(
                  'max_staff',
                )}
                placeholder="Unlimited"
              />
            </div>

            <div>
              <label
                htmlFor="plan-branches"
                className="block text-xs font-semibold text-[#536059] mb-1.5"
              >
                Max branches
              </label>

              <input
                id="plan-branches"
                type="number"
                min="1"
                className={inputClass}
                value={form.max_branches}
                onChange={setField(
                  'max_branches',
                )}
                placeholder="Unlimited"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="plan-features"
              className="block text-xs font-semibold text-[#536059] mb-1.5"
            >
              Features (one per line)
            </label>

            <textarea
              id="plan-features"
              rows={7}
              value={form.features}
              onChange={setField('features')}
              placeholder={
                'Online booking\nCustomer management\nFeatured badge\nHomepage featured\nPriority listing\nHigher search visibility'
              }
              className="w-full rounded-[12px] bg-white border border-black/[0.07] p-3.5 text-sm placeholder:text-[#a2aaa4] focus:outline-none focus:border-[#39725a]/40 focus:ring-4 focus:ring-[#39725a]/10"
            />

            <p className="text-[11px] text-[#929c95] mt-1.5">
              Use the feature names shown in the
              existing plans. One feature per line.
            </p>
          </div>

          <div>
            <label
              htmlFor="plan-status"
              className="block text-xs font-semibold text-[#536059] mb-1.5"
            >
              Status
            </label>

            <select
              id="plan-status"
              className={inputClass}
              value={form.status}
              onChange={setField('status')}
            >
              <option value="active">
                Active
              </option>

              <option value="inactive">
                Inactive
              </option>
            </select>
          </div>
        </div>
      </Modal>

      {/* DELETE */}
      <Modal
        open={Boolean(toDelete)}
        onClose={() =>
          setToDelete(null)
        }
        size="sm"
        title={`Delete ${
          toDelete?.name || 'plan'
        }?`}
        description="Shops already on this plan may be affected. This cannot be undone."
        footer={
          <>
            <Button
              variant="ghost"
              onClick={() =>
                setToDelete(null)
              }
            >
              Cancel
            </Button>

            <Button
              variant="danger"
              onClick={handleDelete}
              loading={deleting}
            >
              Delete plan
            </Button>
          </>
        }
      />
    </div>
  )
}