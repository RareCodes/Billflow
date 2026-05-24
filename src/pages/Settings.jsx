import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Save, Building2 } from 'lucide-react'
import AppLayout from '../components/layout/AppLayout'
import { supabase } from '../lib/supabase'

const CURRENCIES = ['NGN', 'USD', 'GBP', 'EUR', 'CAD']
const inputCls = "w-full h-9 px-3 text-sm border border-[##EDE9FE] rounded-lg outline-none focus:border-[#6D28D9] focus:ring-2 focus:ring-[#6D28D915] transition-all"

export default function Settings() {
  const [form, setForm] = useState({
    business_name: '',
    business_email: '',
    business_phone: '',
    business_address: '',
    default_currency: 'NGN',
    default_tax_rate: 0,
    default_notes: '',
  })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => { loadProfile() }, [])

  const loadProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { navigate('/auth'); return }
    const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
    if (data) {
      setForm({
        business_name: data.business_name || '',
        business_email: data.business_email || '',
        business_phone: data.business_phone || '',
        business_address: data.business_address || '',
        default_currency: data.default_currency || 'NGN',
        default_tax_rate: data.default_tax_rate || 0,
        default_notes: data.default_notes || '',
      })
    }
    setLoading(false)
  }

  const saveProfile = async () => {
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    await supabase.from('profiles').upsert({ id: user.id, ...form })
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  if (loading) return (
    <AppLayout>
      <div className="py-16 text-center text-sm text-ink-secondary">Loading settings...</div>
    </AppLayout>
  )

  return (
    <AppLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-ink" style={{ fontFamily: 'Sora, sans-serif' }}>Settings</h1>
          <p className="text-sm text-ink-secondary mt-0.5">Manage your business profile and preferences</p>
        </div>
        <button
          onClick={saveProfile}
          disabled={saving}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold text-white hover:opacity-90 transition-all"
          style={{ background: saved ? '#16A34A' : '#6D28D9' }}
        >
          <Save size={14} />
          {saving ? 'Saving...' : saved ? 'Saved ✓' : 'Save Changes'}
        </button>
      </div>

      <div className="max-w-2xl space-y-6">
        {/* Business Profile */}
        <div className="bg-white border border-[##EDE9FE] rounded-xl p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 rounded-lg bg-primary-light flex items-center justify-center">
              <Building2 size={17} style={{ color: '#6D28D9' }} />
            </div>
            <div>
              <h2 className="font-semibold text-ink text-sm">Business Profile</h2>
              <p className="text-xs text-ink-secondary">This info appears on all your invoices</p>
            </div>
          </div>

          {/* Avatar preview */}
          <div className="flex items-center gap-4 mb-5 pb-5 border-b border-[#E4E7EE]">
            <div className="w-16 h-16 rounded-xl bg-primary-light flex items-center justify-center">
              <span className="text-2xl font-bold" style={{ color: '#6D28D9', fontFamily: 'Sora, sans-serif' }}>
                {form.business_name?.[0]?.toUpperCase() || '?'}
              </span>
            </div>
            <div>
              <p className="font-semibold text-ink text-sm">{form.business_name || 'Your Business'}</p>
              <p className="text-xs text-ink-secondary mt-0.5">{form.business_email || 'No email set'}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 sm:col-span-1">
              <label className="block text-[11px] font-bold text-ink-secondary uppercase tracking-wider mb-1">Business Name</label>
              <input value={form.business_name} onChange={e => setForm({ ...form, business_name: e.target.value })} placeholder="Acme Ltd" className={inputCls} />
            </div>
            <div className="col-span-2 sm:col-span-1">
              <label className="block text-[11px] font-bold text-ink-secondary uppercase tracking-wider mb-1">Business Email</label>
              <input type="email" value={form.business_email} onChange={e => setForm({ ...form, business_email: e.target.value })} placeholder="hello@yourbusiness.com" className={inputCls} />
            </div>
            <div className="col-span-2 sm:col-span-1">
              <label className="block text-[11px] font-bold text-ink-secondary uppercase tracking-wider mb-1">Phone</label>
              <input value={form.business_phone} onChange={e => setForm({ ...form, business_phone: e.target.value })} placeholder="+234 800 000 0000" className={inputCls} />
            </div>
            <div className="col-span-2 sm:col-span-1">
              <label className="block text-[11px] font-bold text-ink-secondary uppercase tracking-wider mb-1">Default Currency</label>
              <select value={form.default_currency} onChange={e => setForm({ ...form, default_currency: e.target.value })} className={inputCls}>
                {CURRENCIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="col-span-2">
              <label className="block text-[11px] font-bold text-ink-secondary uppercase tracking-wider mb-1">Business Address</label>
              <textarea value={form.business_address} onChange={e => setForm({ ...form, business_address: e.target.value })} placeholder="123 Main Street, Lagos, Nigeria" rows={2} className="w-full px-3 py-2 text-sm border border-[##EDE9FE] rounded-lg outline-none focus:border-[#6D28D9] transition-all resize-none" />
            </div>
          </div>
        </div>

        {/* Invoice Defaults */}
        <div className="bg-white border border-[##EDE9FE] rounded-xl p-6">
          <h2 className="font-semibold text-ink text-sm mb-1">Invoice Defaults</h2>
          <p className="text-xs text-ink-secondary mb-5">Pre-filled on every new invoice</p>
          <div className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold text-ink-secondary uppercase tracking-wider mb-1">Default Tax Rate (%)</label>
              <input type="number" min="0" max="100" value={form.default_tax_rate} onChange={e => setForm({ ...form, default_tax_rate: e.target.value })} placeholder="0" className={`${inputCls} w-32`} />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-ink-secondary uppercase tracking-wider mb-1">Default Notes / Payment Terms</label>
              <textarea value={form.default_notes} onChange={e => setForm({ ...form, default_notes: e.target.value })} placeholder="Payment is due within 14 days. Thank you for your business." rows={3} className="w-full px-3 py-2 text-sm border border-[##EDE9FE] rounded-lg outline-none focus:border-[#6D28D9] transition-all resize-none" />
            </div>
          </div>
        </div>

        {/* Demo credentials reminder */}
        <div className="bg-[#EDE9FE] border border-[#6D28D930] rounded-xl p-4">
          <p className="text-xs font-semibold text-[#6D28D9] mb-1">Demo Credentials</p>
          <p className="text-xs text-ink-secondary">
            Email: <span className="font-mono font-semibold text-ink">demo@billflow.app</span> &nbsp;·&nbsp;
            Password: <span className="font-mono font-semibold text-ink">Demo@2026!</span>
          </p>
        </div>
      </div>
    </AppLayout>
  )
}