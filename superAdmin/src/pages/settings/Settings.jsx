import { useEffect, useState } from 'react'
import { Save } from 'lucide-react'
import PageHeader from '../../components/layout/PageHeader'
import Button from '../../components/ui/Button'
import Loader from '../../components/ui/Loader'
import Notice from '../../components/ui/Notice'
import { getSettings, saveSettings } from '../../services/adminService'
import { getErrorMessage } from '../../services/api'

const defaults = {
  site_name: 'Swiss Barber',
  support_email: '',
  support_phone: '',
  default_language: 'de',
  default_currency: 'CHF',
  default_timezone: 'Europe/Zurich',
  booking_enabled: true,
  maintenance_mode: false,
}

const inputClass =
  'w-full h-11 px-3.5 rounded-[12px] bg-white border border-black/[0.07] text-sm placeholder:text-[#a2aaa4] focus:outline-none focus:border-[#39725a]/40 focus:ring-4 focus:ring-[#39725a]/10'

const toBoolean = (value, fallback = false) => {
  if (typeof value === 'boolean') return value

  if (typeof value === 'string') {
    return value === 'true' || value === '1'
  }

  if (typeof value === 'number') {
    return value === 1
  }

  return fallback
}

function Toggle({ id, checked, onChange, label, hint }) {
  return (
    <div className="flex items-center justify-between gap-6 py-4">
      <div>
        <label
          htmlFor={id}
          className="text-sm font-semibold text-[#24312b] cursor-pointer"
        >
          {label}
        </label>

        <p className="text-xs text-[#8b958e] mt-1 leading-5">
          {hint}
        </p>
      </div>

      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative w-11 h-6 shrink-0 rounded-full transition-colors focus:outline-none focus-visible:ring-4 focus-visible:ring-[#39725a]/20 ${
          checked ? 'bg-[#21483a]' : 'bg-[#d6d4cb]'
        }`}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
            checked ? 'translate-x-5' : ''
          }`}
        />
      </button>
    </div>
  )
}

export default function Settings() {
  const [form, setForm] = useState(defaults)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    let active = true

    ;(async () => {
      try {
        const data = await getSettings()

        if (
          active &&
          data &&
          typeof data === 'object' &&
          !Array.isArray(data)
        ) {
          setForm((current) => ({
            ...current,
            ...data,
            booking_enabled: toBoolean(
              data.booking_enabled,
              current.booking_enabled
            ),
            maintenance_mode: toBoolean(
              data.maintenance_mode,
              current.maintenance_mode
            ),
          }))
        }
      } catch (err) {
        if (active) {
          setError(
            getErrorMessage(
              err,
              'Could not load settings. Showing defaults.'
            )
          )
        }
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    })()

    return () => {
      active = false
    }
  }, [])

  const setField = (key) => (e) => {
    setForm((current) => ({
      ...current,
      [key]: e.target.value,
    }))
  }

  const handleSave = async (e) => {
    e.preventDefault()

    setSaving(true)
    setError('')
    setSuccess('')

    try {
      await saveSettings({
        site_name: form.site_name,
        support_email: form.support_email,
        support_phone: form.support_phone,
        default_language: form.default_language,
        default_currency: form.default_currency,
        default_timezone: form.default_timezone,
        booking_enabled: form.booking_enabled,
        maintenance_mode: form.maintenance_mode,
      })

      setSuccess('Settings saved successfully.')
    } catch (err) {
      setError(getErrorMessage(err, 'Could not save settings.'))
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <Loader label="Loading settings..." />
  }

  return (
    <form
      onSubmit={handleSave}
      className="space-y-6 pb-10 max-w-3xl"
    >
      <PageHeader
        title="Settings"
        description="Platform-wide details and switches."
        actions={
          <Button type="submit" icon={Save} loading={saving}>
            Save changes
          </Button>
        }
      />

      <Notice>{error}</Notice>
      <Notice type="success">{success}</Notice>

      <section className="soft-card p-6">
        <h2 className="font-display text-xl font-bold mb-5">
          General
        </h2>

        <div className="grid sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label
              htmlFor="site_name"
              className="block text-xs font-semibold text-[#536059] mb-1.5"
            >
              Platform name
            </label>

            <input
              id="site_name"
              className={inputClass}
              value={form.site_name}
              onChange={setField('site_name')}
            />
          </div>

          <div>
            <label
              htmlFor="support_email"
              className="block text-xs font-semibold text-[#536059] mb-1.5"
            >
              Support email
            </label>

            <input
              id="support_email"
              type="email"
              className={inputClass}
              value={form.support_email || ''}
              onChange={setField('support_email')}
              placeholder="support@swissbarber.ch"
            />
          </div>

          <div>
            <label
              htmlFor="support_phone"
              className="block text-xs font-semibold text-[#536059] mb-1.5"
            >
              Support phone
            </label>

            <input
              id="support_phone"
              className={inputClass}
              value={form.support_phone || ''}
              onChange={setField('support_phone')}
              placeholder="+41 44 000 00 00"
            />
          </div>
        </div>
      </section>

      <section className="soft-card p-6">
        <h2 className="font-display text-xl font-bold mb-5">
          Region
        </h2>

        <div className="grid sm:grid-cols-3 gap-4">
          <div>
            <label
              htmlFor="default_language"
              className="block text-xs font-semibold text-[#536059] mb-1.5"
            >
              Default language
            </label>

            <select
              id="default_language"
              className={inputClass}
              value={form.default_language}
              onChange={setField('default_language')}
            >
              <option value="de">Deutsch</option>
              <option value="fr">Français</option>
              <option value="it">Italiano</option>
              <option value="en">English</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="default_currency"
              className="block text-xs font-semibold text-[#536059] mb-1.5"
            >
              Currency
            </label>

            <select
              id="default_currency"
              className={inputClass}
              value={form.default_currency}
              onChange={setField('default_currency')}
            >
              <option value="CHF">CHF</option>
              <option value="EUR">EUR</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="default_timezone"
              className="block text-xs font-semibold text-[#536059] mb-1.5"
            >
              Time zone
            </label>

            <select
              id="default_timezone"
              className={inputClass}
              value={form.default_timezone}
              onChange={setField('default_timezone')}
            >
              <option value="Europe/Zurich">Europe/Zurich</option>
              <option value="UTC">UTC</option>
            </select>
          </div>
        </div>
      </section>

      <section className="soft-card px-6 py-2 divide-y divide-black/[0.05]">
        <Toggle
          id="booking_enabled"
          checked={form.booking_enabled}
          onChange={(value) =>
            setForm((current) => ({
              ...current,
              booking_enabled: value,
            }))
          }
          label="Accept new shop registrations"
          hint="Turn this off to stop new barber shops from applying."
        />

        <Toggle
          id="maintenance_mode"
          checked={form.maintenance_mode}
          onChange={(value) =>
            setForm((current) => ({
              ...current,
              maintenance_mode: value,
            }))
          }
          label="Maintenance mode"
          hint="Customers will see a maintenance message instead of the booking site."
        />
      </section>
    </form>
  )
}