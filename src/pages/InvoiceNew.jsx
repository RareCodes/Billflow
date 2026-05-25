import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Trash2, Minus, ChevronDown, Save, Send, ArrowLeft } from 'lucide-react'
import { supabase } from '../lib/supabase'

const CURRENCIES = ['NGN', 'USD', 'GBP', 'EUR', 'CAD']
const PAYMENT_TERMS = ['Due on Receipt', 'Net 7', 'Net 15', 'Net 30', 'Net 45', 'Net 60', 'Custom']
const PAYMENT_METHODS = ['Bank Transfer', 'Cash', 'POS', 'PayPal', 'Stripe', 'Other']

function generateInvoiceNumber(count) {
  return `INV-${String(count + 1).padStart(3, '0')}`
}

function FieldLabel({ children, required }) {
  return (
    <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#6B5B8A', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>
      {children}{required && <span style={{ color: '#EF4444', marginLeft: 2 }}>*</span>}
    </label>
  )
}

const iStyle = {
  width: '100%', height: 36, padding: '0 12px', fontSize: 14,
  border: '1px solid #E8E4F0', borderRadius: 8, outline: 'none',
  background: 'white', boxSizing: 'border-box',
  fontFamily: 'Nunito Sans, sans-serif',
}

const selStyle = {
  ...iStyle, appearance: 'none', paddingRight: 32,
}

export default function InvoiceNew() {
  const navigate = useNavigate()
  const [saving, setSaving] = useState(false)
  const [clients, setClients] = useState([])
  const [invoiceCount, setInvoiceCount] = useState(0)
  const [profile, setProfile] = useState(null)
  const [paymentTerms, setPaymentTerms] = useState('Net 30')
  const [showNotes, setShowNotes] = useState(false)

  const today = new Date().toISOString().split('T')[0]

  const [form, setForm] = useState({
    clientName: '', clientEmail: '', clientAddress: '', clientPhone: '',
    currency: 'NGN', invoiceDate: today, dueDate: '',
    paymentMethod: 'Bank Transfer', notes: '', terms: '', taxRate: 0, discount: 0,
    items: [{ description: '', quantity: 1, unit_price: 0 }],
  })

  useEffect(() => { loadData() }, [])

  useEffect(() => {
    if (paymentTerms === 'Due on Receipt') {
      setForm(f => ({ ...f, dueDate: today }))
    } else if (paymentTerms.startsWith('Net ')) {
      const days = parseInt(paymentTerms.replace('Net ', ''))
      const due = new Date()
      due.setDate(due.getDate() + days)
      setForm(f => ({ ...f, dueDate: due.toISOString().split('T')[0] }))
    }
  }, [paymentTerms])

  const loadData = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { navigate('/auth'); return }
    const [{ data: clientData }, { count }, { data: prof }] = await Promise.all([
      supabase.from('clients').select('*').eq('user_id', user.id),
      supabase.from('invoices').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
      supabase.from('profiles').select('*').eq('id', user.id).single(),
    ])
    setClients(clientData || [])
    setInvoiceCount(count || 0)
    setProfile(prof)
  }

  const updateItem = (index, field, value) => {
    const updated = [...form.items]
    updated[index][field] = value
    setForm({ ...form, items: updated })
  }

  const addItem = () => setForm({ ...form, items: [...form.items, { description: '', quantity: 1, unit_price: 0 }] })
  const removeItem = (index) => {
    if (form.items.length === 1) return
    setForm({ ...form, items: form.items.filter((_, i) => i !== index) })
  }

  const fillFromClient = (clientId) => {
    const client = clients.find(c => c.id === clientId)
    if (client) setForm(f => ({ ...f, clientName: client.name, clientEmail: client.email || '', clientAddress: client.address || '', clientPhone: client.phone || '' }))
  }

  const subtotal = form.items.reduce((sum, item) => sum + (Number(item.quantity) * Number(item.unit_price)), 0)
  const taxAmount = (subtotal * Number(form.taxRate)) / 100
  const discountAmount = Number(form.discount)
  const total = subtotal + taxAmount - discountAmount
  const fmt = (n) => Number(n).toLocaleString('en-NG', { minimumFractionDigits: 2 })
  const sym = { NGN: '₦', USD: '$', GBP: '£', EUR: '€', CAD: 'CA$' }[form.currency] || form.currency
  const invoiceNumber = generateInvoiceNumber(invoiceCount)

  const handleSave = async (status) => {
    if (!form.clientName.trim()) { alert('Please enter a customer name'); return }
    if (form.items.some(i => !i.description.trim())) { alert('Please fill in all item descriptions'); return }
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    const payload = {
      user_id: user.id, invoice_number: invoiceNumber, status,
      currency: form.currency,
      client_snapshot: { name: form.clientName, email: form.clientEmail, address: form.clientAddress, phone: form.clientPhone },
      items: form.items.map(item => ({ description: item.description, quantity: Number(item.quantity), unit_price: Number(item.unit_price), total: Number(item.quantity) * Number(item.unit_price) })),
      subtotal, tax_rate: Number(form.taxRate), tax_amount: taxAmount,
      discount: discountAmount, total, due_date: form.dueDate || null,
      payment_method: form.paymentMethod, notes: form.notes, issued_date: form.invoiceDate,
    }
    const { data, error } = await supabase.from('invoices').insert(payload).select().single()
    setSaving(false)
    if (error) alert('Error: ' + error.message)
    else navigate(`/invoices/${data.id}`)
  }

  return (
    <div style={{ minHeight: '100vh', background: '#F8F7FF', fontFamily: 'Nunito Sans, sans-serif' }}>
      <style>{`
        .inv-toolbar { position: sticky; top: 0; z-index: 20; background: white; border-bottom: 1px solid #E8E4F0; }
        .inv-toolbar-inner { max-width: 800px; margin: 0 auto; padding: 10px 16px; display: flex; align-items: center; justify-content: space-between; gap: 8px; flex-wrap: nowrap; }
        .inv-toolbar-left { display: flex; align-items: center; gap: 10px; }
        .inv-toolbar-right { display: flex; align-items: center; gap: 8px; }
        .inv-btn-draft { display: flex; align-items: center; gap: 6px; padding: 8px 14px; border-radius: 8px; font-size: 13px; font-weight: 700; border: 1px solid #E8E4F0; background: white; color: #1E0A3C; cursor: pointer; white-space: nowrap; }
        .inv-btn-send { display: flex; align-items: center; gap: 6px; padding: 8px 14px; border-radius: 8px; font-size: 13px; font-weight: 700; border: none; background: #6D28D9; color: white; cursor: pointer; white-space: nowrap; }
        .inv-card { max-width: 800px; margin: 0 auto; padding: 16px; }
        .inv-section { background: white; border: 1px solid #E8E4F0; border-radius: 16px; overflow: hidden; box-shadow: 0 2px 12px rgba(109,40,217,0.06); }
        .inv-grid-2 { display: grid; grid-template-columns: 1fr; gap: 20px; padding: 24px; border-bottom: 1px solid #E8E4F0; }
        @media (min-width: 640px) {
          .inv-grid-2 { grid-template-columns: 1fr 1fr; padding: 32px; }
          .inv-card { padding: 24px; }
        }
        .inv-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        .inv-field { margin-bottom: 12px; }
        .inv-select-wrap { position: relative; }
        .inv-select-wrap svg { position: absolute; right: 10px; top: 50%; transform: translateY(-50%); pointer-events: none; color: #9EA3B0; }
        .inv-table-wrap { overflow-x: auto; padding: 0 16px; }
        @media (min-width: 640px) { .inv-table-wrap { padding: 0 32px; } }
        .inv-table { width: 100%; border-collapse: collapse; min-width: 500px; }
        .inv-summary { background: #F8F7FF; border: 1px solid #E8E4F0; border-radius: 12px; padding: 16px; }
        .inv-totals-grid { display: grid; grid-template-columns: 1fr; gap: 20px; padding: 20px 16px; }
        @media (min-width: 640px) { .inv-totals-grid { grid-template-columns: 1fr 1fr; padding: 24px 32px; } }
        .inv-input { width: 100%; height: 36px; padding: 0 12px; font-size: 14px; border: 1px solid #E8E4F0; border-radius: 8px; outline: none; background: white; box-sizing: border-box; font-family: Nunito Sans, sans-serif; }
        .inv-input:focus { border-color: #6D28D9; }
        .inv-textarea { width: 100%; padding: 8px 12px; font-size: 13px; border: 1px solid #E8E4F0; border-radius: 8px; outline: none; background: white; box-sizing: border-box; resize: none; font-family: Nunito Sans, sans-serif; }
        .inv-textarea:focus { border-color: #6D28D9; }
      `}</style>

      {/* Toolbar */}
      <div className="inv-toolbar">
        <div className="inv-toolbar-inner">
          <div className="inv-toolbar-left">
            <button onClick={() => navigate('/invoices')} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#6B5B8A', background: 'none', border: 'none', cursor: 'pointer' }}>
              <ArrowLeft size={15} /> Invoices
            </button>
            <span style={{ color: '#E8E4F0' }}>|</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#1E0A3C' }}>New Invoice</span>
          </div>
          <div className="inv-toolbar-right">
            <button className="inv-btn-draft" onClick={() => handleSave('draft')} disabled={saving}>
              <Save size={13} /> Draft
            </button>
            <button className="inv-btn-send" onClick={() => handleSave('sent')} disabled={saving}>
              <Send size={13} /> {saving ? 'Saving...' : 'Send'}
            </button>
          </div>
        </div>
      </div>

      {/* Card */}
      <div className="inv-card">
        <div className="inv-section">

          {/* Header — Business info + Invoice meta */}
          <div className="inv-grid-2">
            {/* Business info */}
            <div>
              <div style={{ width: 52, height: 52, borderRadius: 12, background: '#EDE9FE', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 10, overflow: 'hidden' }}>
                {profile?.logo_url
                  ? <img src={profile.logo_url} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : <span style={{ fontSize: 20, fontWeight: 900, color: '#6D28D9', fontFamily: 'Outfit, sans-serif' }}>{profile?.business_name?.[0]?.toUpperCase() || 'B'}</span>
                }
              </div>
              <p style={{ fontWeight: 800, fontSize: 15, margin: '0 0 3px', color: '#1E0A3C', fontFamily: 'Outfit, sans-serif' }}>{profile?.business_name || 'Your Business'}</p>
              {profile?.business_email && <p style={{ fontSize: 12, color: '#6B5B8A', margin: '0 0 2px' }}>{profile.business_email}</p>}
              {profile?.business_address && <p style={{ fontSize: 12, color: '#6B5B8A', margin: 0 }}>{profile.business_address}</p>}
              {!profile?.business_name && (
                <button onClick={() => navigate('/settings')} style={{ fontSize: 12, color: '#6D28D9', background: 'none', border: 'none', cursor: 'pointer', padding: 0, marginTop: 4 }}>
                  + Add business details
                </button>
              )}
            </div>

            {/* Invoice meta */}
            {/* <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#6B5B8A', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Invoice #</span>
                <span style={{ fontSize: 14, fontWeight: 800, color: '#1E0A3C', fontFamily: 'IBM Plex Mono, monospace' }}>{invoiceNumber}</span>
              </div>

              <div className="inv-row" style={{ marginBottom: 12 }}>
                <div>
                  <FieldLabel>Invoice Date</FieldLabel>
                  <input type="date" value={form.invoiceDate} onChange={e => setForm({ ...form, invoiceDate: e.target.value })} className="inv-input" />
                </div>
                <div>
                  <FieldLabel>Currency</FieldLabel>
                  <div className="inv-select-wrap">
                    <select value={form.currency} onChange={e => setForm({ ...form, currency: e.target.value })} className="inv-input" style={{ appearance: 'none', paddingRight: 28 }}>
                      {CURRENCIES.map(c => <option key={c}>{c}</option>)}
                    </select>
                    <ChevronDown size={13} />
                  </div>
                </div>
              </div>

              <div className="inv-row">
                <div>
                  <FieldLabel>Payment Terms</FieldLabel>
                  <div className="inv-select-wrap">
                    <select value={paymentTerms} onChange={e => setPaymentTerms(e.target.value)} className="inv-input" style={{ appearance: 'none', paddingRight: 28 }}>
                      {PAYMENT_TERMS.map(t => <option key={t}>{t}</option>)}
                    </select>
                    <ChevronDown size={13} />
                  </div>
                </div>
                <div>
                  <FieldLabel>Due Date</FieldLabel>
                  <input type="date" value={form.dueDate} onChange={e => setForm({ ...form, dueDate: e.target.value })} className="inv-input" />
                </div>
              </div>

            </div> */}

            <div
  style={{
    width: '100%',
  }}
>
  <div
    style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12,
      flexWrap: 'wrap',
      gap: 8,
    }}
  >
    <span
      style={{
        fontSize: 11,
        fontWeight: 700,
        color: '#6B5B8A',
        textTransform: 'uppercase',
        letterSpacing: '0.08em',
      }}
    >
      Invoice #
    </span>

    <span
      style={{
        fontSize: 14,
        fontWeight: 800,
        color: '#1E0A3C',
        fontFamily: 'IBM Plex Mono, monospace',
        wordBreak: 'break-word',
      }}
    >
      {invoiceNumber}
    </span>
  </div>

  {/* Invoice Date + Currency */}
  <div
    style={{
      display: 'flex',
      gap: 12,
      marginBottom: 12,
      flexWrap: 'wrap',
    }}
  >
    <div
      style={{
        flex: '1 1 240px',
        minWidth: 0,
      }}
    >
      <FieldLabel>Invoice Date</FieldLabel>

      <input
        type="date"
        value={form.invoiceDate}
        onChange={e =>
          setForm({ ...form, invoiceDate: e.target.value })
        }
        className="inv-input"
        style={{
          width: '100%',
          boxSizing: 'border-box',
        }}
      />
    </div>

    <div
      style={{
        flex: '1 1 240px',
        minWidth: 0,
      }}
    >
      <FieldLabel>Currency</FieldLabel>

      <div
        style={{
          position: 'relative',
          width: '100%',
        }}
      >
        <select
          value={form.currency}
          onChange={e =>
            setForm({ ...form, currency: e.target.value })
          }
          className="inv-input"
          style={{
            appearance: 'none',
            paddingRight: 28,
            width: '100%',
            boxSizing: 'border-box',
          }}
        >
          {CURRENCIES.map(c => (
            <option key={c}>{c}</option>
          ))}
        </select>

        <div
          style={{
            position: 'absolute',
            right: 10,
            top: '50%',
            transform: 'translateY(-50%)',
            pointerEvents: 'none',
          }}
        >
          <ChevronDown size={13} />
        </div>
      </div>
    </div>
  </div>

  {/* Payment Terms + Due Date */}
  <div
    style={{
      display: 'flex',
      gap: 12,
      flexWrap: 'wrap',
    }}
  >
    <div
      style={{
        flex: '1 1 240px',
        minWidth: 0,
      }}
    >
      <FieldLabel>Payment Terms</FieldLabel>

      <div
        style={{
          position: 'relative',
          width: '100%',
        }}
      >
        <select
          value={paymentTerms}
          onChange={e => setPaymentTerms(e.target.value)}
          className="inv-input"
          style={{
            appearance: 'none',
            paddingRight: 28,
            width: '100%',
            boxSizing: 'border-box',
          }}
        >
          {PAYMENT_TERMS.map(t => (
            <option key={t}>{t}</option>
          ))}
        </select>

        <div
          style={{
            position: 'absolute',
            right: 10,
            top: '50%',
            transform: 'translateY(-50%)',
            pointerEvents: 'none',
          }}
        >
          <ChevronDown size={13} />
        </div>
      </div>
    </div>

    <div
      style={{
        flex: '1 1 240px',
        minWidth: 0,
      }}
    >
      <FieldLabel>Due Date</FieldLabel>

      <input
        type="date"
        value={form.dueDate}
        onChange={e =>
          setForm({ ...form, dueDate: e.target.value })
        }
        className="inv-input"
        style={{
          width: '100%',
          boxSizing: 'border-box',
        }}
      />
    </div>
  </div>
</div>
          </div>

          {/* Bill To */}
          <div className="inv-grid-2">
            <div>
              <FieldLabel required>Bill To</FieldLabel>
              {clients.length > 0 && (
                <div style={{ marginBottom: 12 }}>
                  <div className="inv-select-wrap">
                    <select onChange={e => fillFromClient(e.target.value)} className="inv-input" style={{ appearance: 'none', paddingRight: 28 }}>
                      <option value="">Select existing customer...</option>
                      {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                    <ChevronDown size={13} />
                  </div>
                  <p style={{ fontSize: 11, color: '#9EA3B0', marginTop: 4 }}>Or fill in manually below</p>
                </div>
              )}
              <div className="inv-field">
                <input className="inv-input" value={form.clientName} onChange={e => setForm({ ...form, clientName: e.target.value })} placeholder="Customer / Company Name *" />
              </div>
              <div className="inv-field">
                <input className="inv-input" type="email" value={form.clientEmail} onChange={e => setForm({ ...form, clientEmail: e.target.value })} placeholder="Email address" />
              </div>
              <div className="inv-field">
                <input className="inv-input" value={form.clientPhone} onChange={e => setForm({ ...form, clientPhone: e.target.value })} placeholder="Phone number" />
              </div>
              <div className="inv-field">
                <textarea className="inv-textarea" value={form.clientAddress} onChange={e => setForm({ ...form, clientAddress: e.target.value })} placeholder="Billing address" rows={2} />
              </div>
            </div>

            <div>
              <div style={{ marginBottom: 16 }}>
                <FieldLabel>Payment Method</FieldLabel>
                <div className="inv-select-wrap">
                  <select value={form.paymentMethod} onChange={e => setForm({ ...form, paymentMethod: e.target.value })} className="inv-input" style={{ appearance: 'none', paddingRight: 28 }}>
                    {PAYMENT_METHODS.map(m => <option key={m}>{m}</option>)}
                  </select>
                  <ChevronDown size={13} />
                </div>
              </div>

              {/* Live summary */}
              <div className="inv-summary">
                <p style={{ fontSize: 10, fontWeight: 800, color: '#9EA3B0', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10 }}>Invoice Summary</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {[
                    { label: 'Invoice #', value: invoiceNumber, mono: true },
                    { label: 'Customer', value: form.clientName || '—' },
                    { label: 'Items', value: `${form.items.filter(i => i.description).length} line item(s)` },
                    { label: 'Due Date', value: form.dueDate || '—' },
                    { label: 'Payment', value: form.paymentMethod },
                  ].map(({ label, value, mono }) => (
                    <div key={label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                      <span style={{ color: '#6B5B8A' }}>{label}</span>
                      <span style={{ fontWeight: 600, color: '#1E0A3C', fontFamily: mono ? 'IBM Plex Mono, monospace' : 'inherit', maxWidth: 140, textAlign: 'right', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{value}</span>
                    </div>
                  ))}
                </div>
                <div style={{ borderTop: '1px solid #E8E4F0', marginTop: 10, paddingTop: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#1E0A3C' }}>Total</span>
                  <span style={{ fontSize: 18, fontWeight: 900, color: '#6D28D9', fontFamily: 'IBM Plex Mono, monospace' }}>{sym}{fmt(total)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Line items */}
          <div style={{ borderBottom: '1px solid #E8E4F0', padding: '20px 0' }}>
            <div className="inv-table-wrap">
              <table className="inv-table">
                <thead>
                  <tr style={{ borderBottom: '1.5px solid #E8E4F0' }}>
                    {['Item / Description', 'Qty', 'Rate', 'Amount', ''].map((h, i) => (
                      <th key={i} style={{ padding: '8px 6px', fontSize: 10, fontWeight: 800, color: '#9EA3B0', textTransform: 'uppercase', letterSpacing: '0.08em', textAlign: i === 0 ? 'left' : i === 3 ? 'right' : i === 4 ? 'center' : 'center', width: i === 0 ? '40%' : i === 1 ? '10%' : i === 2 ? '18%' : i === 3 ? '22%' : '10%' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {form.items.map((item, index) => (
                    <tr key={index} style={{ borderBottom: '1px solid #F5F3FF' }}>
                      <td style={{ padding: '6px 4px' }}>
                        <input value={item.description} onChange={e => updateItem(index, 'description', e.target.value)} placeholder="Description" className="inv-input" />
                      </td>
                      <td style={{ padding: '6px 4px' }}>
                        <input type="number" min="1" value={item.quantity} onChange={e => updateItem(index, 'quantity', e.target.value)} className="inv-input" style={{ textAlign: 'center' }} />
                      </td>
                      <td style={{ padding: '6px 4px' }}>
                        <input type="number" min="0" value={item.unit_price} onChange={e => updateItem(index, 'unit_price', e.target.value)} className="inv-input" style={{ textAlign: 'right' }} />
                      </td>
                      <td style={{ padding: '6px 4px', textAlign: 'right' }}>
                        <span style={{ fontSize: 13, fontWeight: 700, color: '#1E0A3C', fontFamily: 'IBM Plex Mono, monospace' }}>{sym}{fmt(Number(item.quantity) * Number(item.unit_price))}</span>
                      </td>
                      <td style={{ padding: '6px 4px', textAlign: 'center' }}>
                        <button onClick={() => removeItem(index)} style={{ padding: 6, borderRadius: 6, border: 'none', background: 'none', cursor: 'pointer', color: '#9EA3B0' }}
                          onMouseEnter={e => { e.currentTarget.style.background = '#FEF2F2'; e.currentTarget.style.color = '#EF4444' }}
                          onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = '#9EA3B0' }}>
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div style={{ padding: '12px 16px 0' }}>
              <button onClick={addItem} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 700, color: '#6D28D9', background: 'none', border: 'none', cursor: 'pointer' }}>
                <Plus size={14} /> Add Line Item
              </button>
            </div>
          </div>

          {/* Totals + Notes */}
          <div className="inv-totals-grid">
            {/* Notes */}
            <div>
              <button onClick={() => setShowNotes(!showNotes)} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: '#6B5B8A', background: 'none', border: 'none', cursor: 'pointer', marginBottom: 8 }}>
                {showNotes ? <Minus size={14} /> : <Plus size={14} />}
                {showNotes ? 'Hide' : 'Add'} Notes & Terms
              </button>
              {showNotes && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div>
                    <FieldLabel>Customer Notes</FieldLabel>
                    <textarea className="inv-textarea" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="Thank you for your business." rows={3} />
                  </div>
                  <div>
                    <FieldLabel>Terms & Conditions</FieldLabel>
                    <textarea className="inv-textarea" value={form.terms} onChange={e => setForm({ ...form, terms: e.target.value })} placeholder="Payment due within agreed terms." rows={3} />
                  </div>
                </div>
              )}
            </div>

            {/* Totals */}
            <div>
              {[
                { label: 'Subtotal', value: `${sym}${fmt(subtotal)}` },
              ].map(({ label, value }) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 10 }}>
                  <span style={{ color: '#6B5B8A' }}>{label}</span>
                  <span style={{ fontWeight: 600, fontFamily: 'IBM Plex Mono, monospace' }}>{value}</span>
                </div>
              ))}

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13, marginBottom: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ color: '#6B5B8A' }}>Tax (%)</span>
                  <input type="number" min="0" max="100" value={form.taxRate} onChange={e => setForm({ ...form, taxRate: e.target.value })}
                    style={{ width: 56, height: 28, padding: '0 8px', fontSize: 12, textAlign: 'center', border: '1px solid #E8E4F0', borderRadius: 6, outline: 'none' }} />
                </div>
                <span style={{ fontWeight: 600, fontFamily: 'IBM Plex Mono, monospace' }}>{sym}{fmt(taxAmount)}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13, marginBottom: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ color: '#6B5B8A' }}>Discount</span>
                  <input type="number" min="0" value={form.discount} onChange={e => setForm({ ...form, discount: e.target.value })}
                    style={{ width: 80, height: 28, padding: '0 8px', fontSize: 12, border: '1px solid #E8E4F0', borderRadius: 6, outline: 'none' }} />
                </div>
                <span style={{ fontWeight: 600, color: discountAmount > 0 ? '#EF4444' : '#1E0A3C', fontFamily: 'IBM Plex Mono, monospace' }}>
                  {discountAmount > 0 ? `− ${sym}${fmt(discountAmount)}` : `${sym}0.00`}
                </span>
              </div>

              <div style={{ borderTop: '2px solid #6D28D9', paddingTop: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 800, fontSize: 15, color: '#1E0A3C' }}>Total</span>
                <span style={{ fontWeight: 900, fontSize: 22, color: '#6D28D9', fontFamily: 'IBM Plex Mono, monospace' }}>{sym}{fmt(total)}</span>
              </div>
            </div>
          </div>

         
        </div>
      </div>
    </div>
  )
}