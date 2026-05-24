import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, FileText, Search } from 'lucide-react'
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

const FILTERS = ['all', 'draft', 'sent', 'paid', 'overdue']

export default function Invoices() {
  const [invoices, setInvoices] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    fetchInvoices()
  }, [])

  const fetchInvoices = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { navigate('/auth'); return }
    const { data } = await supabase
      .from('invoices')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
    setInvoices(data || [])
    setLoading(false)
  }

  const filtered = invoices.filter(inv => {
    const matchesFilter = filter === 'all' || inv.status === filter
    const matchesSearch = !search ||
      inv.invoice_number?.toLowerCase().includes(search.toLowerCase()) ||
      inv.client_snapshot?.name?.toLowerCase().includes(search.toLowerCase())
    return matchesFilter && matchesSearch
  })

  const fmt = (n) => `₦${Number(n).toLocaleString()}`

  return (
    <AppLayout>
      {/* Header */}
      <div className="flex items-center mt-8 lg:mt-0 justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-ink" style={{ fontFamily: 'Sora, sans-serif' }}>Invoices</h1>
          <p className="text-ink-secondary text-sm mt-1">{invoices.length} total invoices</p>
        </div>
        <button
          onClick={() => navigate('/invoices/new')}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold text-white hover:opacity-90 transition-all"
          style={{ background: '#6D28D9' }}
        >
          <Plus size={16} />
          New Invoice
        </button>
      </div>

      {/* Search + Filter */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" />
          <input
            type="text"
            placeholder="Search by client or invoice number..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-10 pl-9 pr-3 text-sm border border-[##EDE9FE] rounded-lg outline-none focus:border-[#6D28D9] transition-all"
          />
        </div>
        <div className="flex gap-2">
          {FILTERS.map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className="px-3 py-2 rounded-lg text-xs font-semibold capitalize transition-all"
              style={{
                background: filter === f ? '#6D28D9' : 'white',
                color: filter === f ? 'white' : '#5C6070',
                border: `1px solid ${filter === f ? '#6D28D9' : '#E4E7EE'}`,
              }}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-[##EDE9FE] rounded-xl overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-ink-secondary text-sm">Loading invoices...</div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center">
            <FileText size={40} className="mx-auto text-ink-muted mb-3" />
            <p className="font-medium text-ink">No invoices found</p>
            <p className="text-ink-secondary text-sm mt-1">
              {search ? 'Try a different search term' : 'Create your first invoice to get started'}
            </p>
            {!search && (
              <button
                onClick={() => navigate('/invoices/new')}
                className="mt-4 px-4 py-2 rounded-lg text-sm font-semibold text-white"
                style={{ background: '#6D28D9' }}
              >
                Create Invoice
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Table Head */}
            <div className="grid grid-cols-5 px-6 py-3 border-b border-[#E4E7EE] bg-bg">
              {['Invoice', 'Client', 'Date', 'Status', 'Amount'].map(h => (
                <p key={h} className="text-xs font-semibold text-ink-secondary uppercase tracking-wide">{h}</p>
              ))}
            </div>
            {/* Rows */}
            {filtered.map((inv) => (
              <div
                key={inv.id}
                onClick={() => navigate(`/invoices/${inv.id}`)}
                className="grid grid-cols-5 px-6 py-4 border-b border-[#E4E7EE] last:border-0 hover:bg-bg cursor-pointer transition-colors items-center"
              >
                <p className="text-sm font-medium text-ink" style={{ fontFamily: 'DM Mono, monospace' }}>
                  {inv.invoice_number}
                </p>
                <p className="text-sm text-ink-secondary">{inv.client_snapshot?.name || '—'}</p>
                <p className="text-sm text-ink-secondary">{inv.issued_date || '—'}</p>
                <StatusBadge status={inv.status} />
                <p className="text-sm font-semibold text-ink" style={{ fontFamily: 'DM Mono, monospace' }}>
                  {fmt(inv.total)}
                </p>
              </div>
            ))}
          </>
        )}
      </div>
    </AppLayout>
  )
}