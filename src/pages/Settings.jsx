import { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Save, Building2, Palette, CreditCard, FileText, Upload, Check } from 'lucide-react'
import AppLayout from '../components/layout/AppLayout'
import { supabase } from '../lib/supabase'

const CURRENCIES = ['NGN', 'USD', 'GBP', 'EUR', 'CAD']
const inputCls = "w-full h-9 px-3 text-sm border border-[#E8E4F0] rounded-lg outline-none focus:border-[#6D28D9] focus:ring-2 focus:ring-[#6D28D915] transition-all"

const TEMPLATES = [
  { id: 'classic',  label: 'Classic',  desc: 'Clean white, professional' },
  { id: 'bold',     label: 'Bold',     desc: 'Left column, architectural' },
  { id: 'minimal',  label: 'Minimal',  desc: 'Ultra clean, whitespace' },
  { id: 'creative', label: 'Creative', desc: 'Wave header, modern' },
]

const BRAND_COLORS = [
  '#6D28D9', '#1B4FFF', '#0EA5E9', '#16A34A',
  '#DC2626', '#EA580C', '#D97706', '#DB2777',
  '#0F1117', '#475569',
]

export default function Settings() {
  const [form, setForm] = useState({
    business_name: '', business_email: '', business_phone: '',
    business_address: '', default_currency: 'NGN', default_tax_rate: 0,
    default_notes: '', invoice_template: 'classic', brand_color: '#6D28D9',
    bank_name: '', bank_account_name: '', bank_account_number: '', logo_url: '',
  })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [userId, setUserId] = useState(null)
  const fileRef = useRef()
  const navigate = useNavigate()

  useEffect(() => { loadProfile() }, [])

  const loadProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { navigate('/auth'); return }
    setUserId(user.id)
    const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
    if (data) setForm({
      business_name: data.business_name || '',
      business_email: data.business_email || '',
      business_phone: data.business_phone || '',
      business_address: data.business_address || '',
      default_currency: data.default_currency || 'NGN',
      default_tax_rate: data.default_tax_rate || 0,
      default_notes: data.default_notes || '',
      invoice_template: data.invoice_template || 'classic',
      brand_color: data.brand_color || '#6D28D9',
      bank_name: data.bank_name || '',
      bank_account_name: data.bank_account_name || '',
      bank_account_number: data.bank_account_number || '',
      logo_url: data.logo_url || '',
    })
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

  const uploadLogo = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 2 * 1024 * 1024) { alert('Logo must be under 2MB'); return }
    setUploading(true)
    const ext = file.name.split('.').pop()
    const path = `${userId}/logo.${ext}`
    const { error } = await supabase.storage.from('logos').upload(path, file, { upsert: true })
    if (!error) {
      const { data: { publicUrl } } = supabase.storage.from('logos').getPublicUrl(path)
      setForm(f => ({ ...f, logo_url: publicUrl }))
    } else {
      alert('Upload failed: ' + error.message)
    }
    setUploading(false)
  }

  const SectionHeader = ({ icon: Icon, title, desc }) => (
    <div className="flex items-center gap-3 mb-5 pb-4 border-b border-[#E8E4F0]">
      <div className="w-9 h-9 rounded-lg bg-[#EDE9FE] flex items-center justify-center shrink-0">
        <Icon size={17} style={{ color: '#6D28D9' }} />
      </div>
      <div>
        <h2 className="font-semibold text-ink text-sm">{title}</h2>
        <p className="text-xs text-ink-secondary">{desc}</p>
      </div>
    </div>
  )

  if (loading) return (
    <AppLayout>
      <div className="py-16 text-center text-sm text-ink-secondary">Loading settings...</div>
    </AppLayout>
  )

  return (
    <AppLayout>
      {/* Header */}
      <div className="flex flex-col justify-start lg:flex-row lg:items-center lg:justify-between mb-6 mt-8 lg:mt-0">
        <div>
          <h1 className="text-xl font-bold text-ink" style={{ fontFamily: 'Outfit, sans-serif' }}>Settings</h1>
          <p className="text-sm text-ink-secondary mt-0.5">Manage your business profile and invoice preferences</p>
        </div>
        <button onClick={saveProfile} disabled={saving}
          className="flex items-center w-fit lg:mt-0 mt-4 gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold text-white hover:opacity-90 transition-all"
          style={{ background: saved ? '#16A34A' : '#6D28D9' }}>
          {saved ? <Check size={14} /> : <Save size={14} />}
          {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Changes'}
        </button>
      </div>

      {/* Two-column layout on desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">

        {/* ── Left column ──────────────────────────────────── */}
        <div className="space-y-6">

          {/* Business Profile */}
          <div className="bg-white border border-[#E8E4F0] rounded-xl p-6">
            <SectionHeader icon={Building2} title="Business Profile" desc="Appears on all your invoices" />

            {/* Logo upload */}
            <div className="flex items-center gap-4 mb-5 pb-5 border-b border-[#E8E4F0]">
              <div
                className="w-20 h-20 rounded-xl border-2 border-dashed border-[#DDD6FE] flex items-center justify-center cursor-pointer hover:border-[#6D28D9] transition-colors overflow-hidden bg-[#F5F3FF] shrink-0"
                onClick={() => fileRef.current?.click()}
              >
                {form.logo_url ? (
                  <img src={form.logo_url} alt="Logo" className="w-full h-full object-cover" />
                ) : (
                  <div className="text-center">
                    <Upload size={18} style={{ color: '#6D28D9' }} className="mx-auto mb-1" />
                    <p className="text-[10px] text-[#6D28D9] font-semibold">Upload</p>
                  </div>
                )}
              </div>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={uploadLogo} />
              <div>
                <p className="text-sm font-semibold text-ink">
                  {form.logo_url ? 'Logo uploaded ✓' : 'Upload your logo'}
                </p>
                <p className="text-xs text-ink-secondary mt-0.5">PNG, JPG or SVG · Max 2MB</p>
                {uploading && <p className="text-xs text-[#6D28D9] mt-1">Uploading...</p>}
                {form.logo_url && (
                  <button onClick={() => setForm(f => ({ ...f, logo_url: '' }))}
                    className="text-xs text-red-400 hover:text-red-600 mt-1 transition-colors">
                    Remove
                  </button>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-ink-secondary uppercase tracking-wider mb-1">Business Name</label>
                <input value={form.business_name} onChange={e => setForm({ ...form, business_name: e.target.value })} placeholder="Acme Ltd" className={inputCls} />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-ink-secondary uppercase tracking-wider mb-1">Business Email</label>
                <input type="email" value={form.business_email} onChange={e => setForm({ ...form, business_email: e.target.value })} placeholder="hello@yourbusiness.com" className={inputCls} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-ink-secondary uppercase tracking-wider mb-1">Phone</label>
                  <input value={form.business_phone} onChange={e => setForm({ ...form, business_phone: e.target.value })} placeholder="+234 800 000 0000" className={inputCls} />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-ink-secondary uppercase tracking-wider mb-1">Currency</label>
                  <select value={form.default_currency} onChange={e => setForm({ ...form, default_currency: e.target.value })} className={inputCls}>
                    {CURRENCIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-bold text-ink-secondary uppercase tracking-wider mb-1">Business Address</label>
                <textarea value={form.business_address} onChange={e => setForm({ ...form, business_address: e.target.value })} placeholder="123 Main Street, Lagos, Nigeria" rows={2} className="w-full px-3 py-2 text-sm border border-[#E8E4F0] rounded-lg outline-none focus:border-[#6D28D9] transition-all resize-none" />
              </div>
            </div>
          </div>

          {/* Bank Account */}
          <div className="bg-white border border-[#E8E4F0] rounded-xl p-6">
            <SectionHeader icon={CreditCard} title="Bank Account" desc="Shown on invoices so clients know where to pay" />
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-ink-secondary uppercase tracking-wider mb-1">Bank Name</label>
                  <input value={form.bank_name} onChange={e => setForm({ ...form, bank_name: e.target.value })} placeholder="First Bank" className={inputCls} />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-ink-secondary uppercase tracking-wider mb-1">Account Name</label>
                  <input value={form.bank_account_name} onChange={e => setForm({ ...form, bank_account_name: e.target.value })} placeholder="Acme Ltd" className={inputCls} />
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-bold text-ink-secondary uppercase tracking-wider mb-1">Account Number</label>
                <input value={form.bank_account_number} onChange={e => setForm({ ...form, bank_account_number: e.target.value })} placeholder="0123456789" className={inputCls} />
              </div>
            </div>
          </div>

          {/* Invoice Defaults */}
          <div className="bg-white border border-[#E8E4F0] rounded-xl p-6">
            <SectionHeader icon={FileText} title="Invoice Defaults" desc="Pre-filled on every new invoice" />
            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-ink-secondary uppercase tracking-wider mb-1">Default Tax Rate (%)</label>
                <input type="number" min="0" max="100" value={form.default_tax_rate}
                  onChange={e => setForm({ ...form, default_tax_rate: e.target.value })}
                  placeholder="0" className={`${inputCls} w-28`} />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-ink-secondary uppercase tracking-wider mb-1">Default Notes / Payment Terms</label>
                <textarea value={form.default_notes} onChange={e => setForm({ ...form, default_notes: e.target.value })}
                  placeholder="Payment is due within 14 days. Thank you for your business."
                  rows={3} className="w-full px-3 py-2 text-sm border border-[#E8E4F0] rounded-lg outline-none focus:border-[#6D28D9] transition-all resize-none" />
              </div>
            </div>
          </div>
        </div>

        {/* ── Right column ─────────────────────────────────── */}
        <div className="space-y-6">

          {/* Brand Color */}
          <div className="bg-white border border-[#E8E4F0] rounded-xl p-6">
            <SectionHeader icon={Palette} title="Brand Color" desc="Accent color used across your invoices" />
            <div className="flex flex-wrap gap-3 mb-4">
              {BRAND_COLORS.map(color => (
                <button key={color} onClick={() => setForm({ ...form, brand_color: color })}
                  className="w-9 h-9 rounded-lg transition-all hover:scale-110"
                  style={{
                    background: color,
                    border: form.brand_color === color ? '3px solid #0F1117' : '3px solid transparent',
                    boxShadow: form.brand_color === color ? '0 0 0 1px white inset' : 'none',
                  }} />
              ))}
              {/* Custom color picker */}
              <div className="relative w-9 h-9 rounded-lg overflow-hidden border-2 border-dashed border-[#DDD6FE] cursor-pointer hover:border-[#6D28D9] transition-colors">
                <input type="color" value={form.brand_color}
                  onChange={e => setForm({ ...form, brand_color: e.target.value })}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                <div className="w-full h-full flex items-center justify-center">
                  <Palette size={14} style={{ color: '#6D28D9' }} />
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-[#F8F7FF] rounded-lg">
              <div className="w-8 h-8 rounded-lg shrink-0" style={{ background: form.brand_color }} />
              <div>
                <p className="text-sm font-mono font-bold text-ink">{form.brand_color}</p>
                <p className="text-xs text-ink-muted">Your invoices will use this color</p>
              </div>
            </div>
          </div>

          {/* Invoice Template */}
          <div className="bg-white border border-[#E8E4F0] rounded-xl p-6">
            <SectionHeader icon={FileText} title="Invoice Template" desc="Applied to all your invoices and PDF exports" />
            <div className="grid grid-cols-2 gap-3">
              {TEMPLATES.map(({ id, label, desc }) => (
                <button key={id} onClick={() => setForm({ ...form, invoice_template: id })}
                  className="p-3 rounded-xl text-left transition-all border-2"
                  style={{
                    background: form.invoice_template === id ? '#EDE9FE' : '#F8F7FF',
                    borderColor: form.invoice_template === id ? '#6D28D9' : '#E8E4F0',
                  }}>
                  {/* Mini preview */}
                  <div className="w-full h-14 rounded-lg mb-2 overflow-hidden border border-[#E8E4F0]"
                    style={{ background: id === 'bold' ? '#F5F3FF' : 'white' }}>
                    {id === 'classic' && (
                      <div className="p-2">
                        <div className="flex justify-between items-start mb-1.5">
                          <div className="w-5 h-5 rounded" style={{ background: form.brand_color, opacity: 0.2 }} />
                          <div className="h-1.5 w-10 rounded" style={{ background: form.brand_color }} />
                        </div>
                        <div className="h-px bg-gray-100 mb-1.5" />
                        <div className="space-y-0.5">
                          <div className="h-1 w-full rounded bg-gray-100" />
                          <div className="h-1 w-4/5 rounded bg-gray-100" />
                        </div>
                      </div>
                    )}
                    {id === 'bold' && (
                      <div className="flex h-full">
                        <div className="w-4 h-full flex flex-col items-center justify-between py-1.5" style={{ borderRight: `2px solid ${form.brand_color}` }}>
                          <div className="w-2.5 h-2.5 rounded-sm border" style={{ borderColor: form.brand_color }} />
                          <div className="flex flex-col gap-px">
                            {['I','N','V'].map(l => <span key={l} style={{ fontSize: 4, fontWeight: 900, color: form.brand_color, lineHeight: 1.2 }}>{l}</span>)}
                          </div>
                        </div>
                        <div className="flex-1 p-1.5 space-y-0.5">
                          <div className="h-1 w-full rounded bg-gray-200" />
                          <div className="h-0.5 w-4/5 rounded bg-gray-100" />
                          <div className="h-0.5 w-full rounded bg-gray-100" />
                        </div>
                      </div>
                    )}
                    {id === 'minimal' && (
                      <div className="p-2.5">
                        <div className="flex justify-between mb-1.5">
                          <div className="h-1.5 w-10 rounded bg-gray-800" />
                          <div className="h-1.5 w-6 rounded bg-gray-300" />
                        </div>
                        <div className="h-px mb-1.5" style={{ background: form.brand_color }} />
                        <div className="space-y-0.5">
                          <div className="h-1 w-full rounded bg-gray-100" />
                          <div className="h-1 w-3/4 rounded bg-gray-100" />
                        </div>
                      </div>
                    )}
                    {id === 'creative' && (
                      <div className="relative overflow-hidden h-full">
                        <div className="absolute top-0 left-0 right-0 h-5 overflow-hidden">
                          <svg viewBox="0 0 100 20" preserveAspectRatio="none" style={{ width: '100%', height: '100%' }}>
                            <path d="M0 0 L100 0 L100 10 Q70 20 50 12 Q30 4 0 16 Z" fill={form.brand_color} />
                          </svg>
                        </div>
                        <div className="pt-6 px-2 space-y-0.5">
                          <div className="h-1 w-full rounded bg-gray-100" />
                          <div className="h-1 w-3/4 rounded bg-gray-100" />
                        </div>
                      </div>
                    )}
                  </div>
                  <p className="text-xs font-bold text-ink">{label}</p>
                  <p className="text-[10px] text-ink-secondary mt-0.5">{desc}</p>
                  {form.invoice_template === id && (
                    <div className="flex items-center gap-1 mt-1.5">
                      <Check size={10} style={{ color: '#6D28D9' }} />
                      <span className="text-[10px] font-semibold" style={{ color: '#6D28D9' }}>Selected</span>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Demo credentials */}
          <div className="bg-[#EDE9FE] border border-[#DDD6FE] rounded-xl p-4">
            <p className="text-xs font-semibold text-[#6D28D9] mb-1">Demo Credentials</p>
            <p className="text-xs text-ink-secondary">
              Email: <span className="font-mono font-semibold text-ink">demo@billit.app</span>
              &nbsp;·&nbsp;
              Password: <span className="font-mono font-semibold text-ink">Demo@2026!</span>
            </p>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}