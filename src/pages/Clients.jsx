import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Users, Plus, Trash2, Mail, Phone, MapPin } from 'lucide-react'
import AppLayout from '../components/layout/AppLayout'
import { supabase } from '../lib/supabase'

export default function Clients() {
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', phone: '', address: '' })
  const navigate = useNavigate()

  useEffect(() => { loadClients() }, [])

  const loadClients = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { navigate('/auth'); return }
    const { data } = await supabase.from('clients').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
    setClients(data || [])
    setLoading(false)
  }

  const saveClient = async () => {
    if (!form.name.trim()) { alert('Client name is required'); return }
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    const { data, error } = await supabase.from('clients').insert({ ...form, user_id: user.id }).select().single()
    if (!error) {
      setClients(prev => [data, ...prev])
      setForm({ name: '', email: '', phone: '', address: '' })
      setShowForm(false)
    }
    setSaving(false)
  }

  const deleteClient = async (id) => {
    if (!confirm('Delete this client?')) return
    await supabase.from('clients').delete().eq('id', id)
    setClients(prev => prev.filter(c => c.id !== id))
  }

  const inputCls = "w-full h-9 px-3 text-sm border border-[##EDE9FE] rounded-lg outline-none focus:border-[#6D28D9] transition-all"

  return (
    <AppLayout>
      <div className="flex items-center justify-between mb-6 mt-8 lg:mt-0">
        <div>
          <h1 className="text-xl font-bold text-ink" style={{ fontFamily: 'Sora, sans-serif' }}>Clients</h1>
          <p className="text-sm text-ink-secondary mt-0.5">{clients.length} saved clients</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold text-white hover:opacity-90 transition-all"
          style={{ background: '#6D28D9' }}
        >
          <Plus size={16} />
          Add Client
        </button>
      </div>

      {/* Add Client Form */}
      {showForm && (
        <div className="bg-white border border-[#6D28D9] rounded-xl p-6 mb-6">
          <h2 className="font-semibold text-ink mb-4 text-sm">New Client</h2>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-[11px] font-bold text-ink-secondary uppercase tracking-wider mb-1">Name *</label>
              <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Client or company name" className={inputCls} />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-ink-secondary uppercase tracking-wider mb-1">Email</label>
              <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="client@example.com" className={inputCls} />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-ink-secondary uppercase tracking-wider mb-1">Phone</label>
              <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="+234 800 000 0000" className={inputCls} />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-ink-secondary uppercase tracking-wider mb-1">Address</label>
              <input value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} placeholder="Client address" className={inputCls} />
            </div>
          </div>
          <div className="flex w-full gap-3">
            <button onClick={saveClient} disabled={saving}
              className="px-4 w-full lg:w-[200px] py-2 rounded-lg text-sm font-semibold text-white hover:opacity-90 transition-all"
              style={{ background: '#6D28D9' }}>
              {saving ? 'Saving...' : 'Save Client'}
            </button>
            <button onClick={() => setShowForm(false)}
              className="px-4 w-full lg:w-[200px] border py-2 rounded-lg text-sm font-medium text-ink-secondary hover:text-ink transition-colors">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Clients Grid */}
      {loading ? (
        <div className="py-16 text-center text-sm text-ink-secondary">Loading clients...</div>
      ) : clients.length === 0 ? (
        <div className="bg-white border border-[##EDE9FE] rounded-xl py-16 text-center">
          <Users size={36} className="mx-auto text-ink-muted mb-3" />
          <p className="font-semibold text-ink text-sm">No clients yet</p>
          <p className="text-xs text-ink-secondary mt-1 mb-4">Save client info to reuse across invoices</p>
          <button onClick={() => setShowForm(true)}
            className="px-4 py-2 rounded-lg text-sm font-semibold text-white"
            style={{ background: '#6D28D9' }}>
            Add Your First Client
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {clients.map(client => (
            <div key={client.id} className="bg-white border border-[##EDE9FE] rounded-xl p-5 hover:border-[#6D28D930] hover:shadow-sm transition-all group">
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-lg bg-primary-light flex items-center justify-center">
                  <span className="text-sm font-bold" style={{ color: '#6D28D9' }}>
                    {client.name[0].toUpperCase()}
                  </span>
                </div>
                <button
                  onClick={() => deleteClient(client.id)}
                  className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-red-50 text-ink-muted hover:text-red-400 transition-all"
                >
                  <Trash2 size={13} />
                </button>
              </div>
              <p className="font-semibold text-ink text-sm">{client.name}</p>
              {client.email && (
                <div className="flex items-center gap-1.5 mt-1.5">
                  <Mail size={11} className="text-ink-muted shrink-0" />
                  <p className="text-xs text-ink-secondary truncate">{client.email}</p>
                </div>
              )}
              {client.phone && (
                <div className="flex items-center gap-1.5 mt-1">
                  <Phone size={11} className="text-ink-muted shrink-0" />
                  <p className="text-xs text-ink-secondary">{client.phone}</p>
                </div>
              )}
              {client.address && (
                <div className="flex items-center gap-1.5 mt-1">
                  <MapPin size={11} className="text-ink-muted shrink-0" />
                  <p className="text-xs text-ink-secondary truncate">{client.address}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </AppLayout>
  )
}