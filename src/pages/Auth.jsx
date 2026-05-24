import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { Eye, EyeOff, ArrowLeft, CheckCircle, Mail } from 'lucide-react'

const passwordRules = [
  { label: 'At least 8 characters',        test: (p) => p.length >= 8 },
  { label: 'One uppercase letter',          test: (p) => /[A-Z]/.test(p) },
  { label: 'One number',                    test: (p) => /[0-9]/.test(p) },
  { label: 'One special character',         test: (p) => /[^A-Za-z0-9]/.test(p) },
]

const FRIENDLY_ERRORS = {
  'Invalid login credentials':           'Incorrect email or password. Please try again.',
  'Email not confirmed':                 'Please confirm your email before logging in.',
  'User already registered':             'An account with this email already exists. Try logging in.',
  'Password should be at least 6':       'Password must be at least 8 characters.',
  'Unable to validate email address':    'Please enter a valid email address.',
}

function getFriendly(msg) {
  for (const key of Object.keys(FRIENDLY_ERRORS)) {
    if (msg?.includes(key)) return FRIENDLY_ERRORS[key]
  }
  return 'Something went wrong. Please try again.'
}

// ── Left panel — brand visual ─────────────────────────────────
function LeftPanel() {
  return (
    <div style={{
      background: 'linear-gradient(135deg, #3B0764',
      display: 'flex', flexDirection: 'column',
      justifyContent: 'space-between',
      padding: '40px',
      position: 'relative',
      overflow: 'hidden',
      minHeight: 500,
    }}>
      {/* Dot grid */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.07) 1px, transparent 1px)',
        backgroundSize: '24px 24px',
        pointerEvents: 'none',
      }} />

      {/* Floating blobs */}
      <div style={{
        position: 'absolute', top: -80, right: -80,
        width: 300, height: 300, borderRadius: '50%',
        background: 'rgba(255,255,255,0.06)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', bottom: -60, left: -60,
        width: 240, height: 240, borderRadius: '50%',
        background: 'rgba(255,107,74,0.15)',
        pointerEvents: 'none',
      }} />

      {/* Logo */}
      <div style={{ position: 'relative', zIndex: 1 }}>
        <h1 style={{
          fontFamily: 'Outfit, sans-serif',
          fontSize: 28, fontWeight: 900,
          color: 'white', margin: 0,
          letterSpacing: '-0.02em',
        }}>
          Billit
        </h1>
      </div>

      {/* Centre content */}
      <div style={{ position: 'relative', zIndex: 1, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '40px 0' }}>
        <p style={{
          fontSize: 36, fontWeight: 900,
          color: 'white', lineHeight: 1.1,
          fontFamily: 'Outfit, sans-serif',
          letterSpacing: '-0.03em',
          margin: '0 0 16px',
        }}>
          Get paid like
          <br />a professional.
        </p>
        <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.65)', lineHeight: 1.7, margin: '0 0 32px', maxWidth: 280 }}>
          Create invoices, track payments, and auto-generate receipts — all in one clean workspace.
        </p>

        {/* Feature pills */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[
            '✦ Invoice in under 2 minutes',
            '✦ Auto-receipts when paid',
            '✦ PDF export & email sharing',
            '✦ Free forever',
          ].map(f => (
            <div key={f} style={{
              display: 'inline-flex', alignItems: 'center',
              background: 'rgba(255,255,255,0.1)',
              backdropFilter: 'blur(8px)',
              borderRadius: 999,
              padding: '7px 14px',
              width: 'fit-content',
            }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: 'white' }}>{f}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom testimonial */}
      <div style={{
        position: 'relative', zIndex: 1,
        background: 'rgba(255,255,255,0.08)',
        borderRadius: 16, padding: '16px 20px',
      }}>
        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.85)', lineHeight: 1.6, margin: '0 0 10px' }}>
          "Billit makes me look 10x more professional. My clients actually pay on time now."
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 32, height: 32, borderRadius: '50%',
            background: 'rgba(255,255,255,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <span style={{ fontSize: 14, fontWeight: 900, color: 'white' }}>T</span>
          </div>
          <div>
            <p style={{ fontSize: 12, fontWeight: 700, color: 'white', margin: 0 }}>Tolu Adeyemi</p>
            <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', margin: 0 }}>Brand Designer · Lagos</p>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Main Auth component ───────────────────────────────────────
export default function Auth() {
  const [tab, setTab]               = useState('login')
  const [email, setEmail]           = useState('')
  const [password, setPassword]     = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading]       = useState(false)
  const [error, setError]           = useState('')
  const [message, setMessage]       = useState('')
  const [touched, setTouched]       = useState({ email: false, password: false })
  const navigate = useNavigate()

  const passwordStrength  = passwordRules.filter(r => r.test(password)).length
  const isStrongEnough    = passwordStrength === 4
  const isValidEmail      = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  const strengthLabel     = ['', 'Weak', 'Fair', 'Good', 'Strong'][passwordStrength]
  const strengthColor     = ['', '#EF4444', '#F59E0B', '#3B82F6', '#16A34A'][passwordStrength]

  const reset = (newTab) => {
    setTab(newTab)
    setError('')
    setMessage('')
    setTouched({ email: false, password: false })
    setPassword('')
  }

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
      if (error) setError(getFriendly(error.message))
      else navigate('/dashboard')
    } else {
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) setError(getFriendly(error.message))
      else setMessage("Account created! Check your email to confirm, then log in.")
    }
    setLoading(false)
  }

  const handleForgotPassword = async (e) => {
    e.preventDefault()
    setError('')
    setMessage('')
    if (!isValidEmail) { setTouched(t => ({ ...t, email: true })); return }
    setLoading(true)
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })
    setLoading(false)
    if (error) setError(getFriendly(error.message))
    else setMessage(`Password reset link sent to ${email}. Check your inbox.`)
  }

  const inputStyle = (hasError) => ({
    width: '100%', height: 44, padding: '0 14px',
    fontSize: 14, borderRadius: 10,
    border: `1px solid ${hasError ? '#EF4444' : '#E8E4F0'}`,
    outline: 'none', background: 'white',
    boxSizing: 'border-box',
    fontFamily: 'Nunito Sans, sans-serif',
    transition: 'border-color 0.15s',
  })

  const labelStyle = {
    display: 'block', fontSize: 11, fontWeight: 800,
    color: '#5C6070', textTransform: 'uppercase',
    letterSpacing: '0.08em', marginBottom: 6,
  }

  return (
    <div style={{ minHeight: '100vh', background: '#F8F7FF', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>

      <style>{`
        .auth-card { display: grid; grid-template-columns: 1fr; max-width: 460px; width: 100%; }
        @media (min-width: 900px) {
          .auth-card { grid-template-columns: 1fr 1fr; max-width: 900px; }
          .auth-left-panel { display: flex !important; }
        }
        .auth-left-panel { display: none; }
      `}</style>

      <div className="auth-card" style={{ background: 'white', borderRadius: 24, overflow: 'hidden', boxShadow: '0 24px 64px rgba(109,40,217,0.12)' }}>

        {/* Left panel */}
        <div className="auth-left-panel">
          <LeftPanel />
        </div>

        {/* Right panel — form */}
        <div style={{ padding: '40px 36px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>

          {/* Back to home */}
          <button
            onClick={() => navigate('/')}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              fontSize: 13, fontWeight: 600, color: '#9EA3B0',
              background: 'none', border: 'none', cursor: 'pointer',
              padding: 0, marginBottom: 28,
              fontFamily: 'Nunito Sans, sans-serif',
            }}
          >
            <ArrowLeft size={14} />
            Back to home
          </button>

          {tab !== 'forgot' ? (
            <>
              {/* Tabs */}
              <div style={{ marginBottom: 28 }}>
                <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: 24, fontWeight: 900, color: '#1E0A3C', margin: '0 0 6px', letterSpacing: '-0.02em' }}>
                  {tab === 'login' ? 'Welcome back' : 'Create account'}
                </h2>
                <p style={{ fontSize: 13, color: '#9EA3B0', margin: '0 0 20px' }}>
                  {tab === 'login' ? 'Log in to your Billit workspace' : 'Start billing professionally — free forever'}
                </p>
                <div style={{ display: 'flex', background: '#F8F7FF', borderRadius: 10, padding: 4 }}>
                  {['login', 'signup'].map(t => (
                    <button key={t} onClick={() => reset(t)} style={{
                      flex: 1, padding: '8px 0', borderRadius: 8,
                      fontSize: 13, fontWeight: 700,
                      border: 'none', cursor: 'pointer',
                      background: tab === t ? 'white' : 'transparent',
                      color: tab === t ? '#1E0A3C' : '#9EA3B0',
                      boxShadow: tab === t ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
                      transition: 'all 0.15s',
                      fontFamily: 'Nunito Sans, sans-serif',
                    }}>
                      {t === 'login' ? 'Log In' : 'Sign Up'}
                    </button>
                  ))}
                </div>
              </div>

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {/* Email */}
                <div>
                  <label style={labelStyle}>Email address</label>
                  <input
                    type="email" value={email}
                    onChange={e => setEmail(e.target.value)}
                    onBlur={() => setTouched(t => ({ ...t, email: true }))}
                    placeholder="you@example.com"
                    style={inputStyle(touched.email && !isValidEmail)}
                    onFocus={e => e.target.style.borderColor = '#6D28D9'}
                    onBlurCapture={e => e.target.style.borderColor = touched.email && !isValidEmail ? '#EF4444' : '#E8E4F0'}
                  />
                  {touched.email && !isValidEmail && (
                    <p style={{ fontSize: 11, color: '#EF4444', marginTop: 4 }}>Please enter a valid email address.</p>
                  )}
                </div>

                {/* Password */}
                <div>
                  <label style={labelStyle}>Password</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      onBlur={() => setTouched(t => ({ ...t, password: true }))}
                      placeholder={tab === 'signup' ? 'Create a strong password' : '••••••••'}
                      style={{ ...inputStyle(false), paddingRight: 44 }}
                      onFocus={e => e.target.style.borderColor = '#6D28D9'}
                      onBlurCapture={e => e.target.style.borderColor = '#E8E4F0'}
                    />
                    <button type="button" onClick={() => setShowPassword(s => !s)} style={{
                      position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                      background: 'none', border: 'none', cursor: 'pointer', color: '#9EA3B0',
                      display: 'flex', alignItems: 'center',
                    }}>
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>

                  {/* Strength bar — signup only */}
                  {tab === 'signup' && password.length > 0 && (
                    <div style={{ marginTop: 8 }}>
                      <div style={{ display: 'flex', gap: 4, marginBottom: 4 }}>
                        {[1,2,3,4].map(i => (
                          <div key={i} style={{
                            height: 3, flex: 1, borderRadius: 999,
                            background: i <= passwordStrength ? strengthColor : '#E8E4F0',
                            transition: 'background 0.3s',
                          }} />
                        ))}
                      </div>
                      <p style={{ fontSize: 11, fontWeight: 700, color: strengthColor }}>{strengthLabel} password</p>
                    </div>
                  )}

                  {/* Rules — signup only */}
                  {tab === 'signup' && touched.password && password.length > 0 && (
                    <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 3 }}>
                      {passwordRules.map(rule => (
                        <div key={rule.label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span style={{ fontSize: 11, color: rule.test(password) ? '#16A34A' : '#9EA3B0', fontWeight: 700 }}>
                            {rule.test(password) ? '✓' : '○'}
                          </span>
                          <span style={{ fontSize: 11, color: rule.test(password) ? '#16A34A' : '#9EA3B0' }}>
                            {rule.label}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Forgot password link */}
                {tab === 'login' && (
                  <div style={{ textAlign: 'right', marginTop: -8 }}>
                    <button type="button" onClick={() => { setTab('forgot'); setError(''); setMessage('') }}
                      style={{ fontSize: 12, fontWeight: 600, color: '#6D28D9', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Nunito Sans, sans-serif' }}>
                      Forgot password?
                    </button>
                  </div>
                )}

                {/* Error / success */}
                {error && (
                  <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#DC2626', display: 'flex', gap: 8 }}>
                    ⚠ {error}
                  </div>
                )}
                {message && (
                  <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#16A34A', display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                    <CheckCircle size={15} style={{ flexShrink: 0, marginTop: 1 }} />
                    {message}
                  </div>
                )}

                <button type="submit" disabled={loading} style={{
                  width: '100%', height: 44, borderRadius: 10,
                  fontSize: 14, fontWeight: 800,
                  color: 'white', background: loading ? '#9EA3B0' : '#6D28D9',
                  border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
                  fontFamily: 'Nunito Sans, sans-serif',
                  transition: 'background 0.15s',
                }}>
                  {loading ? 'Please wait...' : tab === 'login' ? 'Log In to Billit' : 'Create My Account'}
                </button>
              </form>
            </>
          ) : (
            /* ── Forgot password view ──────────────────────── */
            <>
              <div style={{ marginBottom: 28 }}>
                <div style={{ width: 48, height: 48, borderRadius: 12, background: '#EDE9FE', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                  <Mail size={22} color="#6D28D9" />
                </div>
                <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: 24, fontWeight: 900, color: '#1E0A3C', margin: '0 0 6px' }}>
                  Reset password
                </h2>
                <p style={{ fontSize: 13, color: '#9EA3B0', margin: 0 }}>
                  Enter your email and we'll send you a reset link.
                </p>
              </div>

              <form onSubmit={handleForgotPassword} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <label style={labelStyle}>Email address</label>
                  <input
                    type="email" value={email}
                    onChange={e => setEmail(e.target.value)}
                    onBlur={() => setTouched(t => ({ ...t, email: true }))}
                    placeholder="you@example.com"
                    style={inputStyle(touched.email && !isValidEmail)}
                    onFocus={e => e.target.style.borderColor = '#6D28D9'}
                  />
                  {touched.email && !isValidEmail && (
                    <p style={{ fontSize: 11, color: '#EF4444', marginTop: 4 }}>Please enter a valid email address.</p>
                  )}
                </div>

                {error && (
                  <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#DC2626' }}>
                    ⚠ {error}
                  </div>
                )}
                {message && (
                  <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#16A34A', display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                    <CheckCircle size={15} style={{ flexShrink: 0, marginTop: 1 }} />
                    {message}
                  </div>
                )}

                <button type="submit" disabled={loading} style={{
                  width: '100%', height: 44, borderRadius: 10,
                  fontSize: 14, fontWeight: 800,
                  color: 'white', background: loading ? '#9EA3B0' : '#6D28D9',
                  border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
                  fontFamily: 'Nunito Sans, sans-serif',
                }}>
                  {loading ? 'Sending...' : 'Send Reset Link'}
                </button>

                <button type="button" onClick={() => reset('login')} style={{
                  width: '100%', height: 44, borderRadius: 10,
                  fontSize: 14, fontWeight: 700,
                  color: '#5C6070', background: '#F8F7FF',
                  border: '1px solid #E8E4F0', cursor: 'pointer',
                  fontFamily: 'Nunito Sans, sans-serif',
                }}>
                  Back to Log In
                </button>
              </form>
            </>
          )}

          <p style={{ fontSize: 11, color: '#C4B5FD', textAlign: 'center', marginTop: 24 }}>
            Your financial data is private and encrypted.
          </p>
        </div>
      </div>
    </div>
  )
}