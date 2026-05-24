import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { Eye, EyeOff, CheckCircle } from 'lucide-react'

export default function ResetPassword() {
  const [password, setPassword]       = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading]         = useState(false)
  const [error, setError]             = useState('')
  const [success, setSuccess]         = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    // Supabase puts the token in the URL hash — this handles it automatically
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        // User is now in password recovery mode — ready to set new password
      }
    })
    return () => subscription.unsubscribe()
  }, [])

  const handleReset = async (e) => {
    e.preventDefault()
    if (password.length < 8) { setError('Password must be at least 8 characters.'); return }
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.updateUser({ password })
    setLoading(false)
    if (error) setError(error.message)
    else { setSuccess(true); setTimeout(() => navigate('/auth'), 3000) }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#F8F7FF', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, fontFamily: 'Nunito Sans, sans-serif' }}>
      <div style={{ background: 'white', borderRadius: 20, padding: '40px 36px', width: '100%', maxWidth: 420, boxShadow: '0 24px 64px rgba(109,40,217,0.10)' }}>
        <h1 style={{ fontFamily: 'Outfit, sans-serif', fontSize: 24, fontWeight: 900, color: '#1E0A3C', margin: '0 0 6px' }}>
          Set new password
        </h1>
        <p style={{ fontSize: 13, color: '#9EA3B0', margin: '0 0 28px' }}>
          Choose a strong password for your Billit account.
        </p>

        {success ? (
          <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: 10, padding: '16px 20px', display: 'flex', gap: 10, alignItems: 'flex-start' }}>
            <CheckCircle size={18} color="#16A34A" style={{ flexShrink: 0, marginTop: 1 }} />
            <div>
              <p style={{ fontSize: 14, fontWeight: 700, color: '#16A34A', margin: '0 0 2px' }}>Password updated!</p>
              <p style={{ fontSize: 12, color: '#16A34A', margin: 0 }}>Redirecting you to login...</p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleReset} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 800, color: '#5C6070', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>
                New Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Min. 8 characters"
                  style={{
                    width: '100%', height: 44, padding: '0 44px 0 14px',
                    fontSize: 14, borderRadius: 10,
                    border: '1px solid #E8E4F0', outline: 'none',
                    boxSizing: 'border-box', fontFamily: 'Nunito Sans, sans-serif',
                  }}
                />
                <button type="button" onClick={() => setShowPassword(s => !s)}
                  style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9EA3B0', display: 'flex' }}>
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#DC2626' }}>
                ⚠ {error}
              </div>
            )}

            <button type="submit" disabled={loading} style={{
              width: '100%', height: 44, borderRadius: 10,
              fontSize: 14, fontWeight: 800, color: 'white',
              background: loading ? '#9EA3B0' : '#6D28D9',
              border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
              fontFamily: 'Nunito Sans, sans-serif',
            }}>
              {loading ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}