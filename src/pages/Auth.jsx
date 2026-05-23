import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { Eye, EyeOff } from 'lucide-react'

const passwordRules = [
  { label: 'At least 8 characters', test: (p) => p.length >= 8 },
  { label: 'One uppercase letter', test: (p) => /[A-Z]/.test(p) },
  { label: 'One number', test: (p) => /[0-9]/.test(p) },
  { label: 'One special character (!@#$...)', test: (p) => /[^A-Za-z0-9]/.test(p) },
]

const ERROR_MESSAGES = {
  'Invalid login credentials': 'Incorrect email or password. Please try again.',
  'Email not confirmed': 'Please confirm your email before logging in. Check your inbox.',
  'User already registered': 'An account with this email already exists. Try logging in instead.',
  'Password should be at least 6 characters': 'Password must be at least 8 characters long.',
}

function getFriendlyError(msg) {
  for (const key of Object.keys(ERROR_MESSAGES)) {
    if (msg.includes(key)) return ERROR_MESSAGES[key]
  }
  return 'Something went wrong. Please try again.'
}

export default function Auth() {
  const [tab, setTab] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [touched, setTouched] = useState({ email: false, password: false })
  const navigate = useNavigate()

  const passwordStrength = passwordRules.filter(r => r.test(password)).length
  const isStrongEnough = passwordStrength === 4
  const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)

  const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong'][passwordStrength]
  const strengthColor = ['', '#DC2626', '#F59E0B', '#3B82F6', '#16A34A'][passwordStrength]

  const handleSubmit = async (e) => {
    e.preventDefault()
    setTouched({ email: true, password: true })
    setError('')
    setMessage('')

    if (!isValidEmail) return
    if (tab === 'signup' && !isStrongEnough) return

    setLoading(true)

    if (tab === 'login') {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        setError(getFriendlyError(error.message))
      } else {
        navigate('/dashboard')
      }
    } else {
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) {
        setError(error.message)
      } else {
        setMessage("You're in! We sent a confirmation link to your email. Click it to activate your account.")
      }
    }

    setLoading(false)
  }

  const switchTab = (t) => {
    setTab(t)
    setError('')
    setMessage('')
    setTouched({ email: false, password: false })
  }

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center px-4">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-ink" style={{ fontFamily: 'Sora, sans-serif' }}>
            Bill<span style={{ color: '#1B4FFF' }}>Flow</span>
          </h1>
          <p className="text-ink-secondary text-sm mt-2">
            {tab === 'login' ? 'Welcome back — log in to your workspace' : 'Create your free account in seconds'}
          </p>
        </div>

        {/* Card */}
        <div className="bg-white border border-[#E4E7EE] rounded-xl p-8 shadow-sm">

          {/* Tabs */}
          <div className="flex bg-bg rounded-lg p-1 mb-6">
            {['login', 'signup'].map((t) => (
              <button
                key={t}
                onClick={() => switchTab(t)}
                className="flex-1 py-2 text-sm font-medium rounded-md transition-all"
                style={{
                  background: tab === t ? 'white' : 'transparent',
                  color: tab === t ? '#0F1117' : '#5C6070',
                  boxShadow: tab === t ? '0 1px 4px rgba(15,17,23,0.08)' : 'none',
                }}
              >
                {t === 'login' ? 'Log In' : 'Sign Up'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-ink mb-1">Email address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={() => setTouched(t => ({ ...t, email: true }))}
                placeholder="you@example.com"
                className="w-full h-10 px-3 text-sm border rounded-lg outline-none transition-all"
                style={{
                  borderColor: touched.email && !isValidEmail ? '#DC2626' : '#E4E7EE',
                  boxShadow: touched.email && !isValidEmail ? '0 0 0 2px #FEE2E2' : 'none',
                }}
              />
              {touched.email && !isValidEmail && (
                <p className="text-xs text-red-500 mt-1">Please enter a valid email address.</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-ink mb-1">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onBlur={() => setTouched(t => ({ ...t, password: true }))}
                  placeholder="Create a strong password"
                  className="w-full h-10 px-3 pr-10 text-sm border rounded-lg outline-none transition-all"
                  style={{
                    borderColor: touched.password && tab === 'signup' && !isStrongEnough && password
                      ? '#F59E0B' : '#E4E7EE',
                  }}
                />
                <button
  type="button"
  onClick={() => setShowPassword(s => !s)}
  className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-muted hover:text-ink transition-colors"
>
  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
</button>
              </div>

              {/* Strength bar — only on signup */}
              {tab === 'signup' && password.length > 0 && (
                <div className="mt-2">
                  <div className="flex gap-1 mb-1">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className="h-1 flex-1 rounded-full transition-all duration-300"
                        style={{ background: i <= passwordStrength ? strengthColor : '#E4E7EE' }}
                      />
                    ))}
                  </div>
                  <p className="text-xs font-medium" style={{ color: strengthColor }}>
                    {strengthLabel} password
                  </p>
                </div>
              )}

              {/* Rules checklist — only on signup */}
              {tab === 'signup' && touched.password && password.length > 0 && (
                <ul className="mt-2 space-y-1">
                  {passwordRules.map((rule) => (
                    <li key={rule.label} className="flex items-center gap-2 text-xs"
                      style={{ color: rule.test(password) ? '#16A34A' : '#9EA3B0' }}>
                      <span>{rule.test(password) ? '✓' : '○'}</span>
                      {rule.label}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Error */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-3 py-2.5 rounded-lg flex items-start gap-2">
                <span className="mt-0.5">⚠</span>
                <span>{error}</span>
              </div>
            )}

            {/* Success */}
            {message && (
              <div className="bg-green-50 border border-green-200 text-green-700 text-sm px-3 py-2.5 rounded-lg flex items-start gap-2">
                <span className="mt-0.5">✓</span>
                <span>{message}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full h-10 rounded-lg text-sm font-semibold text-white transition-all"
              style={{
                background: loading ? '#9EA3B0' : '#1B4FFF',
                cursor: loading ? 'not-allowed' : 'pointer',
              }}
            >
              {loading
                ? 'Please wait...'
                : tab === 'login' ? 'Log In to BillFlow' : 'Create My Account'}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-ink-muted mt-6">
          Your financial data is private and encrypted.
        </p>
      </div>
    </div>
  )
}