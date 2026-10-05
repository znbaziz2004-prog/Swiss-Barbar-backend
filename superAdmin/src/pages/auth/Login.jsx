import { useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Lock, Mail, Scissors } from 'lucide-react'
import { useAdminAuth } from '../../context/AdminAuthContext'
import { getErrorMessage } from '../../services/api'
import Button from '../../components/ui/Button'
import Notice from '../../components/ui/Notice'

export default function Login() {
  const { login, isAuthenticated } = useAdminAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const redirectTo = location.state?.from?.pathname || '/admin/dashboard'

  if (isAuthenticated) return <Navigate to={redirectTo} replace />

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!email.trim() || !password) {
      setError('Enter your email and password to continue.')
      return
    }

    setLoading(true)
    try {
      await login(email.trim(), password)
      navigate(redirectTo, { replace: true })
    } catch (err) {
      setError(getErrorMessage(err, 'Could not sign in. Check your details and try again.'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-[1.05fr_1fr] bg-[#f3f1e9]">
      {/* BRAND PANEL */}
      <div className="relative hidden lg:flex flex-col justify-between overflow-hidden bg-[#17352b] text-white p-12">
        <div className="absolute -right-24 -top-24 w-[360px] h-[360px] rounded-full bg-[#a9cbb6]/10 blur-3xl" />
        <div className="absolute -left-20 bottom-0 w-[300px] h-[300px] rounded-full bg-[#806d59]/15 blur-3xl" />
        <Scissors
          size={420}
          strokeWidth={0.6}
          className="absolute -right-24 -bottom-16 opacity-[0.05] -rotate-12"
        />

        <div className="relative flex items-center gap-3">
          <div className="w-11 h-11 rounded-[15px] bg-[#f3f1e9] text-[#21483a] flex items-center justify-center">
            <Scissors size={21} strokeWidth={2.2} />
          </div>
          <span className="font-display text-xl font-bold">Swiss Barber</span>
        </div>

        <div className="relative max-w-md">
          <h2 className="font-display text-[44px] leading-[1.08] font-bold tracking-tight">
            Run every barber shop in Switzerland from one place.
          </h2>
          <p className="mt-5 text-[15px] leading-7 text-white/55">
            Approve new shops, manage owners and subscriptions, and keep an eye
            on bookings across the platform.
          </p>
        </div>

        <p className="relative text-xs text-white/35">
          Super Admin Console
        </p>
      </div>

      {/* FORM */}
      <div className="flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-[400px]">
          <div className="lg:hidden flex items-center gap-3 mb-10">
            <div className="w-10 h-10 rounded-[14px] bg-[#21483a] text-white flex items-center justify-center">
              <Scissors size={19} />
            </div>
            <span className="font-display text-lg font-bold text-[#21483a]">
              Swiss Barber
            </span>
          </div>

          <h1 className="font-display text-3xl font-bold text-[#24312b]">
            Sign in
          </h1>
          <p className="text-[13px] text-[#8b958e] mt-2">
            Use your Super Admin account to open the console.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4" noValidate>
            <Notice>{error}</Notice>

            <div>
              <label htmlFor="email" className="block text-xs font-semibold text-[#536059] mb-1.5">
                Email
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9aa39d]" />
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@swissbarber.ch"
                  className="w-full h-12 pl-11 pr-4 rounded-[14px] bg-[#faf9f4] border border-black/[0.07] text-sm placeholder:text-[#a2aaa4] focus:outline-none focus:border-[#39725a]/40 focus:ring-4 focus:ring-[#39725a]/10 transition-all"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-semibold text-[#536059] mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9aa39d]" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full h-12 pl-11 pr-12 rounded-[14px] bg-[#faf9f4] border border-black/[0.07] text-sm placeholder:text-[#a2aaa4] focus:outline-none focus:border-[#39725a]/40 focus:ring-4 focus:ring-[#39725a]/10 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg text-[#8b958e] hover:text-[#21483a] flex items-center justify-center"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <Button type="submit" size="lg" loading={loading} className="w-full mt-2">
              Sign in
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
