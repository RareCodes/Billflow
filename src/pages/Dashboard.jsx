import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Plus, FileText, Clock, AlertCircle, CheckCircle,
  ChevronRight, Users, Settings, ArrowRight,
  TrendingUp, Zap
} from 'lucide-react'
import AppLayout from '../components/layout/AppLayout'
import { supabase } from '../lib/supabase'

function StatusBadge({ status }) {
  const styles = {
    draft:   { bg: '#F3F4F6', color: '#6B7280' },
    sent:    { bg: '#EFF6FF', color: '#2563EB' },
    paid:    { bg: '#F0FDF4', color: '#16A34A' },
    overdue: { bg: '#FEF2F2', color: '#DC2626' },
  }
  const s = styles[status] || styles.draft
  return (
    <span className="px-2.5 py-1 rounded-full text-xs font-semibold capitalize"
      style={{ background: s.bg, color: s.color }}>
      {status}
    </span>
  )
}

function MiniBarChart({ data }) {
  const max = Math.max(...data.map(d => d.value), 1)
  return (
    <div className="flex items-end gap-1.5 h-16">
      {data.map((d, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1">
          <div
            className="w-full rounded-t-sm transition-all duration-500"
            style={{
              height: `${Math.max((d.value / max) * 52, d.value > 0 ? 6 : 2)}px`,
              background: d.isCurrentMonth ? '#6D28D9' : '#E4E7EE',
            }}
          />
          <span className="text-[9px] text-ink-muted">{d.label}</span>
        </div>
      ))}
    </div>
  )
}

function OnboardingStep({ done, label, description, onClick }) {
  return (
    <div
      onClick={!done ? onClick : undefined}
      className={`flex items-start gap-3 p-3 rounded-lg transition-all ${
        done ? 'opacity-60' : 'hover:bg-bg cursor-pointer group'
      }`}
    >
      <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 transition-all ${
        done ? 'bg-green-100' : 'bg-[#E8E4F0] group-hover:bg-[#EDE9FE]'
      }`}>
        {done
          ? <CheckCircle size={14} className="text-green-600" />
          : <span className="w-2 h-2 rounded-full bg-ink-muted group-hover:bg-[#6D28D9]" style={{ display: 'block' }} />
        }
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-semibold ${done ? 'line-through text-ink-muted' : 'text-ink'}`}>{label}</p>
        <p className="text-xs text-ink-secondary mt-0.5">{description}</p>
      </div>
      {!done && (
        <ArrowRight size={14} className="text-ink-muted group-hover:text-[#6D28D9] shrink-0 mt-1 transition-colors" />
      )}
    </div>
  )
}

export default function Dashboard() {
  const [invoices, setInvoices]   = useState([])
  const [clients, setClients]     = useState([])
  const [profile, setProfile]     = useState(null)
  const [loading, setLoading]     = useState(true)
  const [dismissedOnboarding, setDismissedOnboarding] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    loadData()
    const dismissed = localStorage.getItem('billit_onboarding_dismissed')
    if (dismissed) setDismissedOnboarding(true)
  }, [])

  const loadData = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { navigate('/auth'); return }

    const [{ data: inv }, { data: cli }, { data: prof }] = await Promise.all([
      supabase.from('invoices').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
      supabase.from('clients').select('id').eq('user_id', user.id),
      supabase.from('profiles').select('*').eq('id', user.id).single(),
    ])

    setInvoices(inv || [])
    setClients(cli || [])
    setProfile(prof)
    setLoading(false)
  }

  const fmt = (n) => `₦${Number(n).toLocaleString('en-NG', { minimumFractionDigits: 2 })}`

  // ── Stats ──────────────────────────────────────────────────
  const totalReceivable = invoices
    .filter(i => ['sent', 'overdue'].includes(i.status))
    .reduce((s, i) => s + (i.total || 0), 0)

  const overdueInvoices = invoices.filter(i => i.status === 'overdue')
  const unpaidInvoices  = invoices.filter(i => i.status === 'sent')

  const now = new Date()
  const paidThisMonth = invoices.filter(i => {
    if (i.status !== 'paid') return false
    const d = new Date(i.updated_at)
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
  })

  // ── Monthly chart ──────────────────────────────────────────
  const monthlyData = Array.from({ length: 6 }, (_, i) => {
    const d = new Date()
    d.setMonth(d.getMonth() - (5 - i))
    const month = d.getMonth()
    const year  = d.getFullYear()
    const value = invoices
      .filter(inv => {
        if (inv.status !== 'paid') return false
        const pd = new Date(inv.updated_at)
        return pd.getMonth() === month && pd.getFullYear() === year
      })
      .reduce((s, inv) => s + (inv.total || 0), 0)
    return { label: d.toLocaleDateString('en', { month: 'short' }), value, isCurrentMonth: i === 5 }
  })

  // ── Onboarding ─────────────────────────────────────────────
  const hasProfile     = !!(profile?.business_name)
  const hasBankAccount = !!(profile?.bank_account_number)
  const hasLogo        = !!(profile?.logo_url)
  const hasClient      = clients.length > 0
  const hasInvoice     = invoices.length > 0

  const onboardingSteps = [
    {
      done: true,
      label: 'Create your account',
      description: "You're in. Welcome to Billit.",
    },
    {
      done: hasProfile,
      label: 'Set up your business profile',
      description: 'Add your business name, email, and address.',
      onClick: () => navigate('/settings'),
    },
    {
      done: hasBankAccount,
      label: 'Add your bank account',
      description: 'So clients know exactly where to send payment.',
      onClick: () => navigate('/settings'),
    },
    {
      done: hasLogo,
      label: 'Upload your logo',
      description: 'Make your invoices look professional and on-brand.',
      onClick: () => navigate('/settings'),
    },
    {
      done: hasClient,
      label: 'Add your first client',
      description: 'Save client info to reuse across invoices.',
      onClick: () => navigate('/clients'),
    },
    {
      done: hasInvoice,
      label: 'Create your first invoice',
      description: 'Generate a professional invoice in under 2 minutes.',
      onClick: () => navigate('/invoices/new'),
    },
  ]

  const stepsCompleted = onboardingSteps.filter(s => s.done).length
  const allDone        = stepsCompleted === onboardingSteps.length
  const showOnboarding = !dismissedOnboarding && !allDone
  const progressPct    = (stepsCompleted / onboardingSteps.length) * 100

  const dismissOnboarding = () => {
    localStorage.setItem('billit_onboarding_dismissed', '1')
    setDismissedOnboarding(true)
  }

  const isNewUser      = invoices.length === 0
  const recentInvoices = invoices.slice(0, 8)
  const brandColor     = profile?.brand_color || '#6D28D9'

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center py-32">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: `${brandColor} transparent transparent transparent` }} />
            <p className="text-sm text-ink-secondary">Loading your dashboard...</p>
          </div>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      {/* ── Header ────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-6 gap-4">
        <div className="min-w-0">
          <h1 className="text-xl font-bold text-ink truncate" style={{ fontFamily: 'Outfit, sans-serif' }}>
            {isNewUser
              ? 'Welcome to Billit 👋'
              : `Good ${now.getHours() < 12 ? 'morning' : now.getHours() < 17 ? 'afternoon' : 'evening'}${profile?.business_name ? `, ${profile.business_name}` : ''}`
            }
          </h1>
          <p className="text-sm text-ink-secondary mt-0.5">
            {now.toLocaleDateString('en-NG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <button
          onClick={() => navigate('/invoices/new')}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold text-white hover:opacity-90 transition-all shrink-0"
          style={{ background: brandColor }}
        >
          <Plus size={16} />
          <span className="hidden sm:inline">New Invoice</span>
          <span className="sm:hidden">New</span>
        </button>
      </div>

      {/* ── Onboarding checklist ──────────────────────────── */}
      {showOnboarding && (
        <div className="bg-white border rounded-xl p-5 mb-6 relative overflow-hidden" style={{ borderColor: `${brandColor}30` }}>
          <div className="absolute top-0 right-0 w-28 h-28 rounded-full opacity-5 blur-2xl pointer-events-none"
            style={{ background: brandColor, transform: 'translate(30%, -30%)' }} />

          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: brandColor + '20' }}>
                <Zap size={17} style={{ color: brandColor }} />
              </div>
              <div>
                <p className="font-semibold text-ink text-sm">Get started with Billit</p>
                <p className="text-xs text-ink-secondary">{stepsCompleted} of {onboardingSteps.length} steps completed</p>
              </div>
            </div>
            <button onClick={dismissOnboarding} className="text-xs text-ink-muted hover:text-ink transition-colors">Dismiss</button>
          </div>

          {/* Progress bar */}
          <div className="h-1.5 bg-[#E8E4F0] rounded-full mb-4 overflow-hidden">
            <div className="h-full rounded-full transition-all duration-700" style={{ width: `${progressPct}%`, background: brandColor }} />
          </div>

          <div className="space-y-1">
            {onboardingSteps.map((step, i) => (
              <OnboardingStep key={i} {...step} />
            ))}
          </div>
        </div>
      )}

      {/* ── All Done banner ───────────────────────────────── */}
      {allDone && !dismissedOnboarding && (
        <div className="bg-green-50 border border-green-200 rounded-xl px-5 py-4 mb-6 flex items-center gap-4">
          <div className="w-9 h-9 rounded-lg bg-green-100 flex items-center justify-center shrink-0">
            <CheckCircle size={18} className="text-green-600" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-green-800">You're all set!</p>
            <p className="text-xs text-green-600 mt-0.5">Your workspace is fully configured and ready to use.</p>
          </div>
          <button onClick={dismissOnboarding} className="text-xs text-green-600 hover:text-green-800 font-medium transition-colors shrink-0">Got it</button>
        </div>
      )}

      {/* ── Overdue alert ─────────────────────────────────── */}
      {overdueInvoices.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-5 py-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertCircle size={18} className="text-red-500 shrink-0" />
              <div>
                <p className="text-sm font-semibold text-red-700">
                  {overdueInvoices.length} overdue invoice{overdueInvoices.length > 1 ? 's' : ''}
                </p>
                <p className="text-xs text-red-500 mt-0.5">
                  {fmt(overdueInvoices.reduce((s, i) => s + i.total, 0))} outstanding
                </p>
              </div>
            </div>
            <button onClick={() => navigate('/invoices')}
              className="flex items-center gap-1 text-xs font-semibold text-red-600 hover:text-red-800 transition-colors shrink-0">
              Review <ChevronRight size={13} />
            </button>
          </div>
        </div>
      )}

      {isNewUser ? (
        /* ── Empty state ──────────────────────────────────── */
        <div className="space-y-6">
          <div className="bg-white border border-[#E8E4F0] rounded-xl p-8 text-center">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: brandColor + '20' }}>
              <FileText size={24} style={{ color: brandColor }} />
            </div>
            <h2 className="font-bold text-ink text-base mb-1" style={{ fontFamily: 'Outfit, sans-serif' }}>Your workspace is ready</h2>
            <p className="text-sm text-ink-secondary max-w-xs mx-auto mb-6">
              Create invoices, track payments, and generate receipts — all in one place.
            </p>
            <button onClick={() => navigate('/invoices/new')}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-white hover:opacity-90 transition-all"
              style={{ background: brandColor }}>
              <Plus size={16} />
              Create your first invoice
            </button>
          </div>

          {/* Quick actions */}
          <div>
            <p className="text-xs font-bold text-ink-muted uppercase tracking-wider mb-3">Quick Actions</p>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {[
                { icon: FileText, label: 'New Invoice',  desc: 'Bill a client',        path: '/invoices/new', color: brandColor,  bg: brandColor + '15' },
                { icon: Users,    label: 'Add Client',   desc: 'Save client info',      path: '/clients',      color: '#8B5CF6',   bg: '#F5F3FF'        },
                { icon: Clock,    label: 'My Invoices',  desc: 'View all invoices',     path: '/invoices',     color: '#F59E0B',   bg: '#FFFBEB'        },
                { icon: Settings, label: 'Settings',     desc: 'Setup your profile',    path: '/settings',     color: '#5C6070',   bg: '#F3F4F6'        },
              ].map(({ icon: Icon, label, desc, color, bg, path }) => (
                <button key={label} onClick={() => navigate(path)}
                  className="bg-white border border-[#E8E4F0] rounded-xl p-4 text-left hover:border-[#DDD6FE] hover:shadow-sm transition-all">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center mb-3" style={{ background: bg }}>
                    <Icon size={17} style={{ color }} />
                  </div>
                  <p className="text-sm font-semibold text-ink">{label}</p>
                  <p className="text-xs text-ink-secondary mt-0.5">{desc}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* ── Active dashboard ─────────────────────────────── */
        <div className="space-y-6">
          {/* Receivables strip */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-[#E8E4F0] rounded-xl overflow-hidden border border-[#E8E4F0]">
            {[
              { label: 'Total Receivables', value: fmt(totalReceivable), icon: TrendingUp, iconColor: brandColor, iconBg: brandColor + '20', sub: `${unpaidInvoices.length + overdueInvoices.length} invoices` },
              { label: 'Overdue',           value: fmt(overdueInvoices.reduce((s, i) => s + i.total, 0)), icon: AlertCircle, iconColor: '#DC2626', iconBg: '#FEF2F2', sub: `${overdueInvoices.length} invoices` },
              { label: 'Awaiting Payment',  value: fmt(unpaidInvoices.reduce((s, i) => s + i.total, 0)),  icon: Clock,       iconColor: '#F59E0B', iconBg: '#FFFBEB', sub: `${unpaidInvoices.length} invoices` },
              { label: 'Paid This Month',   value: fmt(paidThisMonth.reduce((s, i) => s + i.total, 0)),   icon: CheckCircle, iconColor: '#16A34A', iconBg: '#F0FDF4', sub: `${paidThisMonth.length} invoices` },
            ].map(({ label, value, icon: Icon, iconColor, iconBg, sub }) => (
              <div key={label} className="bg-white px-4 py-4 flex items-start gap-3">
                <div className="rounded-lg p-2 shrink-0" style={{ background: iconBg }}>
                  <Icon size={16} style={{ color: iconColor }} />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-medium text-ink-secondary truncate">{label}</p>
                  <p className="text-base font-bold text-ink mt-0.5 truncate" style={{ fontFamily: 'IBM Plex Mono, monospace' }}>{value}</p>
                  <p className="text-xs text-ink-muted mt-0.5">{sub}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Chart + Quick actions */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Revenue chart */}
            <div className="lg:col-span-2 bg-white border border-[#E8E4F0] rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm font-semibold text-ink">Revenue Overview</p>
                  <p className="text-xs text-ink-secondary mt-0.5">Paid invoices — last 6 months</p>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-sm" style={{ background: brandColor }} />
                  <span className="text-xs text-ink-secondary">Current month</span>
                </div>
              </div>
              <MiniBarChart data={monthlyData} />
              <div className="mt-4 pt-4 border-t border-[#E8E4F0] flex items-center justify-between">
                <p className="text-xs text-ink-secondary">
                  Total this month:{' '}
                  <span className="font-semibold text-ink">
                    {fmt(paidThisMonth.reduce((s, i) => s + i.total, 0))}
                  </span>
                </p>
                <button onClick={() => navigate('/invoices')}
                  className="flex items-center gap-1 text-xs font-medium hover:opacity-80 transition-all"
                  style={{ color: brandColor }}>
                  All invoices <ChevronRight size={12} />
                </button>
              </div>
            </div>

            {/* Quick actions */}
            <div className="bg-white border border-[#E8E4F0] rounded-xl p-5">
              <p className="text-sm font-semibold text-ink mb-4">Quick Actions</p>
              <div className="space-y-2">
                {[
                  { icon: Plus,     label: 'New Invoice',   desc: 'Bill a client now', path: '/invoices/new', primary: true },
                  { icon: Users,    label: 'Add Client',    desc: 'Save client info',  path: '/clients' },
                  { icon: FileText, label: 'View Invoices', desc: 'All your invoices', path: '/invoices' },
                  { icon: Settings, label: 'Settings',      desc: 'Business profile',  path: '/settings' },
                ].map(({ icon: Icon, label, desc, path, primary }) => (
                  <button key={label} onClick={() => navigate(path)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all"
                    style={{ background: primary ? brandColor + '15' : undefined }}
                    onMouseEnter={e => !primary && (e.currentTarget.style.background = '#F8F7FF')}
                    onMouseLeave={e => !primary && (e.currentTarget.style.background = 'transparent')}
                  >
                    <div className="w-7 h-7 rounded-md flex items-center justify-center shrink-0"
                      style={{ background: primary ? brandColor : '#F3F4F6' }}>
                      <Icon size={13} style={{ color: primary ? 'white' : '#5C6070' }} />
                    </div>
                    <div>
                      <p className="text-xs font-semibold" style={{ color: primary ? brandColor : '#0F1117' }}>{label}</p>
                      <p className="text-[11px] text-ink-muted">{desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Recent invoices */}
          <div className="bg-white border border-[#E8E4F0] rounded-xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#E8E4F0]">
              <h2 className="font-semibold text-ink text-sm">Recent Invoices</h2>
              <button onClick={() => navigate('/invoices')}
                className="flex items-center gap-1 text-xs font-medium hover:opacity-80 transition-all"
                style={{ color: brandColor }}>
                View All <ChevronRight size={13} />
              </button>
            </div>

            {/* Table headers — hidden on mobile */}
            <div className="hidden md:grid grid-cols-12 px-6 py-2.5 border-b border-[#E8E4F0] bg-bg">
              {[
                { label: 'DATE',      cls: 'col-span-2' },
                { label: 'INVOICE #', cls: 'col-span-2' },
                { label: 'CUSTOMER',  cls: 'col-span-3' },
                { label: 'DUE DATE',  cls: 'col-span-2' },
                { label: 'AMOUNT',    cls: 'col-span-2 text-right' },
                { label: 'STATUS',    cls: 'col-span-1 text-right' },
              ].map(({ label, cls }) => (
                <p key={label} className={`text-[10px] font-bold text-ink-muted tracking-wider ${cls}`}>{label}</p>
              ))}
            </div>

            {recentInvoices.map((inv) => (
              <div key={inv.id} onClick={() => navigate(`/invoices/${inv.id}`)}
                className="px-6 py-3.5 border-b border-[#E8E4F0] last:border-0 hover:bg-bg cursor-pointer transition-colors">
                {/* Desktop row */}
                <div className="hidden md:grid grid-cols-12 items-center">
                  <p className="col-span-2 text-xs text-ink-secondary">{inv.issued_date || '—'}</p>
                  <p className="col-span-2 text-xs font-semibold text-ink" style={{ fontFamily: 'IBM Plex Mono, monospace' }}>{inv.invoice_number}</p>
                  <p className="col-span-3 text-xs text-ink truncate">{inv.client_snapshot?.name || '—'}</p>
                  <p className="col-span-2 text-xs text-ink-secondary">{inv.due_date || '—'}</p>
                  <p className="col-span-2 text-xs font-bold text-ink text-right" style={{ fontFamily: 'IBM Plex Mono, monospace' }}>
                    ₦{Number(inv.total).toLocaleString()}
                  </p>
                  <div className="col-span-1 flex justify-end">
                    <StatusBadge status={inv.status} />
                  </div>
                </div>
                {/* Mobile row */}
                <div className="md:hidden flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-ink truncate">{inv.client_snapshot?.name || '—'}</p>
                    <p className="text-xs text-ink-secondary mt-0.5" style={{ fontFamily: 'IBM Plex Mono, monospace' }}>{inv.invoice_number}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-bold text-ink" style={{ fontFamily: 'IBM Plex Mono, monospace' }}>
                      ₦{Number(inv.total).toLocaleString()}
                    </p>
                    <div className="flex justify-end mt-0.5">
                      <StatusBadge status={inv.status} />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </AppLayout>
  )
}