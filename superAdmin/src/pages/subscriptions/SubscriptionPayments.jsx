import { useEffect, useMemo, useState } from 'react'
import {
  CreditCard,
  ReceiptText,
  TrendingUp,
  Plus,
  X,
} from 'lucide-react'

import PageHeader from '../../components/layout/PageHeader'
import DataTable from '../../components/ui/DataTable'
import Badge from '../../components/ui/Badge'
import SearchBar from '../../components/ui/SearchBar'
import Notice from '../../components/ui/Notice'
import StatCard from '../../components/ui/StatCard'
import Button from '../../components/ui/Button'
import Modal from '../../components/ui/Modal'

import {
  getSubscriptionPayments,
  getSubscriptions,
  createSubscriptionPayment,
} from '../../services/adminService'

import { getErrorMessage } from '../../services/api'
import { formatCurrency, formatDateTime } from '../../services/format'

const tabs = [
  { value: 'all', label: 'All' },
  { value: 'paid', label: 'Paid' },
  { value: 'pending', label: 'Pending' },
  { value: 'failed', label: 'Failed' },
]

const isPaid = (p) =>
  ['paid', 'succeeded', 'completed'].includes(
    String(p.status).toLowerCase()
  )

export default function SubscriptionPayments() {
  const [rows, setRows] = useState([])
  const [subscriptions, setSubscriptions] = useState([])

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [error, setError] = useState('')
  const [formError, setFormError] = useState('')

  const [status, setStatus] = useState('all')
  const [search, setSearch] = useState('')

  const [showModal, setShowModal] = useState(false)

  const [form, setForm] = useState({
    subscriptionId: '',
    amount: '',
    currency: 'CHF',
    paymentMethod: 'bank_transfer',
    transactionReference: '',
    invoiceNumber: '',
    status: 'paid',
  })

  const loadData = async () => {
    try {
      setLoading(true)
      setError('')

      const [paymentsData, subscriptionsData] = await Promise.all([
        getSubscriptionPayments(),
        getSubscriptions(),
      ])

      setRows(paymentsData)
      setSubscriptions(subscriptionsData)
    } catch (err) {
      setError(
        getErrorMessage(err, 'Could not load subscription payments.')
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const totals = useMemo(() => {
    const paid = rows.filter(isPaid)

    return {
      revenue: paid.reduce(
        (sum, p) => sum + Number(p.amount || 0),
        0
      ),
      paid: paid.length,
      pending: rows.filter(
        (p) => String(p.status).toLowerCase() === 'pending'
      ).length,
    }
  }, [rows])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()

    return rows.filter((p) => {
      const s = String(p.status).toLowerCase()

      const matchStatus =
        status === 'all' ||
        s === status ||
        (status === 'paid' && isPaid(p))

      const matchSearch =
        !q ||
        [p.shop_name, p.plan_name, p.reference, p.transaction_id]
          .filter(Boolean)
          .some((v) =>
            String(v).toLowerCase().includes(q)
          )

      return matchStatus && matchSearch
    })
  }, [rows, status, search])

  const selectedSubscription = useMemo(() => {
    return subscriptions.find(
      (s) => String(s.id) === String(form.subscriptionId)
    )
  }, [subscriptions, form.subscriptionId])

  const handleSubscriptionChange = (value) => {
    const subscription = subscriptions.find(
      (s) => String(s.id) === String(value)
    )

    setForm((prev) => ({
      ...prev,
      subscriptionId: value,
      amount:
        subscription?.amount ??
        subscription?.monthly_price ??
        subscription?.price ??
        '',
      currency: subscription?.currency || 'CHF',
    }))
  }

  const handleChange = (e) => {
    const { name, value } = e.target

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const openModal = () => {
    setFormError('')

    setForm({
      subscriptionId: '',
      amount: '',
      currency: 'CHF',
      paymentMethod: 'bank_transfer',
      transactionReference: '',
      invoiceNumber: '',
      status: 'paid',
    })

    setShowModal(true)
  }

  const closeModal = () => {
    if (saving) return

    setShowModal(false)
    setFormError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      setFormError('')

      if (!form.subscriptionId) {
        setFormError('Please select a subscription.')
        return
      }

      if (!form.amount || Number(form.amount) <= 0) {
        setFormError('Please enter a valid payment amount.')
        return
      }

      setSaving(true)

      await createSubscriptionPayment({
        subscriptionId: Number(form.subscriptionId),
        amount: Number(form.amount),
        currency: form.currency,
        paymentMethod: form.paymentMethod,
        transactionReference:
          form.transactionReference.trim() || null,
        invoiceNumber:
          form.invoiceNumber.trim() || null,
        status: form.status,
      })

      await loadData()

      setShowModal(false)
    } catch (err) {
      setFormError(
        getErrorMessage(err, 'Could not create payment.')
      )
    } finally {
      setSaving(false)
    }
  }

  const columns = [
    {
      key: 'shop',
      header: 'Shop',
      render: (p) => (
        <div>
          <p className="font-bold">{p.shop_name || '—'}</p>
          <p className="text-[11px] text-[#8d9790] mt-0.5">
            {p.plan_name || ''}
          </p>
        </div>
      ),
    },
    {
      key: 'amount',
      header: 'Amount',
      render: (p) => (
        <span className="font-bold">
          {formatCurrency(
            p.amount,
            p.currency || 'CHF'
          )}
        </span>
      ),
    },
    {
      key: 'method',
      header: 'Method',
      render: (p) => (
        <span className="capitalize">
          {p.payment_method ||
            p.method ||
            '—'}
        </span>
      ),
    },
    {
      key: 'reference',
      header: 'Reference',
      render: (p) => (
        <span className="text-[#6b776f]">
          {p.reference ||
            p.transaction_id ||
            '—'}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (p) => (
        <Badge status={p.status} />
      ),
    },
    {
      key: 'date',
      header: 'Date',
      render: (p) => (
        <span className="text-[#6b776f]">
          {formatDateTime(
            p.paid_at || p.created_at
          )}
        </span>
      ),
    },
  ]

  return (
    <div className="space-y-6 pb-10">
      <PageHeader
  title="Payments"
  description="Subscription payments received from barber shops."
  actions={
    <Button
      icon={Plus}
      onClick={openModal}
    >
      Add Payment
    </Button>
  }
/>

      <Notice>{error}</Notice>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Total received"
          value={formatCurrency(totals.revenue)}
          subtitle="Paid subscription payments"
          icon={TrendingUp}
          loading={loading}
        />

        <StatCard
          title="Paid"
          value={totals.paid}
          subtitle="Successful payments"
          icon={ReceiptText}
          iconClass="bg-[#e3ebe8] text-[#21483a]"
          loading={loading}
        />

        <StatCard
          title="Pending"
          value={totals.pending}
          subtitle="Waiting for confirmation"
          icon={CreditCard}
          iconClass="bg-[#ece8df] text-[#806d59]"
          loading={loading}
        />
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

          <SearchBar
            value={search}
            onChange={setSearch}
            placeholder="Search by shop or reference"
          />
        </div>

        <DataTable
          columns={columns}
          rows={filtered}
          loading={loading}
          emptyTitle="No payments found"
          emptyText={
            rows.length === 0
              ? 'Payments appear after shops pay for a plan.'
              : 'Try a different filter or search term.'
          }
        />
      </div>

      {showModal && (
        <Modal
          open={showModal}
          onClose={closeModal}
          title="Add Subscription Payment"
        >
          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >
            <Notice>{formError}</Notice>

            <div>
              <label className="block text-sm font-semibold mb-2">
                Subscription
              </label>

              <select
                value={form.subscriptionId}
                onChange={(e) =>
                  handleSubscriptionChange(
                    e.target.value
                  )
                }
                className="w-full h-11 rounded-xl border border-black/10 bg-white px-3 text-sm outline-none focus:border-[#21483a]"
                required
              >
                <option value="">
                  Select subscription
                </option>

                {subscriptions.map((subscription) => (
                  <option
                    key={subscription.id}
                    value={subscription.id}
                  >
                    {subscription.shop_name ||
                      `Shop #${subscription.shop_id}`}
                    {' — '}
                    {subscription.plan_name || 'Plan'}
                    {' — '}
                    {formatCurrency(
                      subscription.amount ??
                        subscription.monthly_price ??
                        subscription.price ??
                        0,
                      subscription.currency || 'CHF'
                    )}
                  </option>
                ))}
              </select>
            </div>

            {selectedSubscription && (
              <div className="rounded-xl bg-[#f3f1e9] p-3 text-sm">
                <p className="font-semibold">
                  {selectedSubscription.shop_name ||
                    `Shop #${selectedSubscription.shop_id}`}
                </p>

                <p className="text-[#6b776f] mt-1">
                  {selectedSubscription.plan_name ||
                    'Subscription'}
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-2">
                  Amount
                </label>

                <input
                  type="number"
                  name="amount"
                  value={form.amount}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  className="w-full h-11 rounded-xl border border-black/10 bg-white px-3 text-sm outline-none focus:border-[#21483a]"
                  placeholder="49.00"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">
                  Currency
                </label>

                <input
                  type="text"
                  name="currency"
                  value={form.currency}
                  onChange={handleChange}
                  className="w-full h-11 rounded-xl border border-black/10 bg-white px-3 text-sm outline-none focus:border-[#21483a]"
                  placeholder="CHF"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">
                Payment Method
              </label>

              <select
                name="paymentMethod"
                value={form.paymentMethod}
                onChange={handleChange}
                className="w-full h-11 rounded-xl border border-black/10 bg-white px-3 text-sm outline-none focus:border-[#21483a]"
              >
                <option value="bank_transfer">
                  Bank Transfer
                </option>
                <option value="cash">
                  Cash
                </option>
                <option value="card">
                  Card
                </option>
                <option value="other">
                  Other
                </option>
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-2">
                  Transaction Reference
                </label>

                <input
                  type="text"
                  name="transactionReference"
                  value={form.transactionReference}
                  onChange={handleChange}
                  className="w-full h-11 rounded-xl border border-black/10 bg-white px-3 text-sm outline-none focus:border-[#21483a]"
                  placeholder="TXN-0001"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">
                  Invoice Number
                </label>

                <input
                  type="text"
                  name="invoiceNumber"
                  value={form.invoiceNumber}
                  onChange={handleChange}
                  className="w-full h-11 rounded-xl border border-black/10 bg-white px-3 text-sm outline-none focus:border-[#21483a]"
                  placeholder="INV-0001"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">
                Payment Status
              </label>

              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                className="w-full h-11 rounded-xl border border-black/10 bg-white px-3 text-sm outline-none focus:border-[#21483a]"
              >
                <option value="paid">
                  Paid
                </option>
                <option value="pending">
                  Pending
                </option>
                <option value="failed">
                  Failed
                </option>
              </select>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="secondary"
                icon={X}
                onClick={closeModal}
                disabled={saving}
              >
                Cancel
              </Button>

              <Button
                type="submit"
                loading={saving}
              >
                Add Payment
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}