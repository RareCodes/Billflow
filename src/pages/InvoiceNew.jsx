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
    <label className="block text-[11px] font-semibold text-ink-secondary uppercase tracking-wider mb-1">
      {children}{required && <span className="text-red-400 ml-0.5">*</span>}
    </label>
  )
}

function Field({ children }) {
  return <div className="mb-4">{children}</div>
}

const inputCls = "w-full h-9 px-3 text-sm border border-[#E4E7EE] rounded-lg outline-none focus:border-[#1B4FFF] focus:ring-2 focus:ring-[#1B4FFF15] transition-all bg-white"
const selectCls = "w-full h-9 px-3 text-sm border border-[#E4E7EE] rounded-lg outline-none focus:border-[#1B4FFF] transition-all bg-white appearance-none"

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
    clientName: '',
    clientEmail: '',
    clientAddress: '',
    clientPhone: '',
    currency: 'NGN',
    invoiceDate: today,
    dueDate: '',
    paymentMethod: 'Bank Transfer',
    notes: '',
    terms: '',
    taxRate: 0,
    discount: 0,
    items: [
      { description: '', quantity: 1, unit_price: 0 }
    ],
  })

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    // Auto-calculate due date from payment terms
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

  const addItem = () => {
    setForm({ ...form, items: [...form.items, { description: '', quantity: 1, unit_price: 0 }] })
  }

  const removeItem = (index) => {
    if (form.items.length === 1) return
    setForm({ ...form, items: form.items.filter((_, i) => i !== index) })
  }

  const fillFromClient = (clientId) => {
    const client = clients.find(c => c.id === clientId)
    if (client) {
      setForm(f => ({
        ...f,
        clientName: client.name,
        clientEmail: client.email || '',
        clientAddress: client.address || '',
        clientPhone: client.phone || '',
      }))
    }
  }

  const subtotal = form.items.reduce((sum, item) => sum + (Number(item.quantity) * Number(item.unit_price)), 0)
  const taxAmount = (subtotal * Number(form.taxRate)) / 100
  const discountAmount = Number(form.discount)
  const total = subtotal + taxAmount - discountAmount

  const fmt = (n) => Number(n).toLocaleString('en-NG', { minimumFractionDigits: 2 })
  const currencySymbol = { NGN: '₦', USD: '$', GBP: '£', EUR: '€', CAD: 'CA$' }[form.currency] || form.currency

  const handleSave = async (status) => {
    if (!form.clientName.trim()) { alert('Please enter a customer name'); return }
    if (form.items.some(i => !i.description.trim())) { alert('Please fill in all item descriptions'); return }

    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    const invoiceNumber = generateInvoiceNumber(invoiceCount)

    const payload = {
      user_id: user.id,
      invoice_number: invoiceNumber,
      status,
      currency: form.currency,
      client_snapshot: {
        name: form.clientName,
        email: form.clientEmail,
        address: form.clientAddress,
        phone: form.clientPhone,
      },
      items: form.items.map(item => ({
        description: item.description,
        quantity: Number(item.quantity),
        unit_price: Number(item.unit_price),
        total: Number(item.quantity) * Number(item.unit_price),
      })),
      subtotal,
      tax_rate: Number(form.taxRate),
      tax_amount: taxAmount,
      discount: discountAmount,
      total,
      due_date: form.dueDate || null,
      payment_method: form.paymentMethod,
      notes: form.notes,
      issued_date: form.invoiceDate,
    }

    const { data, error } = await supabase.from('invoices').insert(payload).select().single()
    setSaving(false)

    if (error) {
      alert('Error: ' + error.message)
    } else {
      navigate(`/invoices/${data.id}`)
    }
  }

  const invoiceNumber = generateInvoiceNumber(invoiceCount)

  return (
    <div className="min-h-screen bg-bg">
      {/* Top Toolbar — Zoho style */}
      <div className="bg-white border-b border-[#E4E7EE] sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/invoices')}
              className="flex items-center gap-1.5 text-sm text-ink-secondary hover:text-ink transition-colors"
            >
              <ArrowLeft size={16} />
              Invoices
            </button>
            <span className="text-[#E4E7EE]">|</span>
            <span className="text-sm font-semibold text-ink">New Invoice</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleSave('draft')}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold border border-[#E4E7EE] bg-white text-ink hover:bg-bg transition-all"
            >
              <Save size={14} />
              Save as Draft
            </button>
            <button
              onClick={() => handleSave('sent')}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white hover:opacity-90 transition-all"
              style={{ background: '#1B4FFF' }}
            >
              <Send size={14} />
              {saving ? 'Saving...' : 'Save and Send'}
            </button>
          </div>
        </div>
      </div>

      {/* Invoice Document */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="bg-white border border-[#E4E7EE] rounded-xl overflow-hidden shadow-sm">

          {/* Invoice Header — Business + Invoice Meta */}
          <div className="grid grid-cols-2 gap-8 px-8 pt-8 pb-6 border-b border-[#E4E7EE]">
            {/* Left — Business Info */}
            <div>
              <div className="w-16 h-16 rounded-xl bg-primary-light flex items-center justify-center mb-3">
                <span className="text-xl font-bold" style={{ color: '#1B4FFF', fontFamily: 'Sora, sans-serif' }}>
                  {profile?.business_name?.[0] || 'B'}
                </span>
              </div>
              <p className="font-bold text-ink text-base" style={{ fontFamily: 'Sora, sans-serif' }}>
                {profile?.business_name || 'Your Business Name'}
              </p>
              {profile?.business_email && (
                <p className="text-xs text-ink-secondary mt-0.5">{profile.business_email}</p>
              )}
              {profile?.business_address && (
                <p className="text-xs text-ink-secondary mt-0.5">{profile.business_address}</p>
              )}
              {!profile?.business_name && (
                <button
                  onClick={() => navigate('/settings')}
                  className="text-xs text-[#1B4FFF] mt-1 hover:underline"
                >
                  + Add business details
                </button>
              )}
            </div>

            {/* Right — Invoice Meta */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <FieldLabel>Invoice #</FieldLabel>
                <p className="text-sm font-bold text-ink" style={{ fontFamily: 'DM Mono, monospace' }}>
                  {invoiceNumber}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <FieldLabel>Invoice Date</FieldLabel>
                  <input
                    type="date"
                    value={form.invoiceDate}
                    onChange={(e) => setForm({ ...form, invoiceDate: e.target.value })}
                    className={inputCls}
                  />
                </div>
                <div className="flex-1">
                  <FieldLabel>Currency</FieldLabel>
                  <div className="relative">
                    <select
                      value={form.currency}
                      onChange={(e) => setForm({ ...form, currency: e.target.value })}
                      className={selectCls}
                    >
                      {CURRENCIES.map(c => <option key={c}>{c}</option>)}
                    </select>
                    <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-muted pointer-events-none" />
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <FieldLabel>Payment Terms</FieldLabel>
                  <div className="relative">
                    <select
                      value={paymentTerms}
                      onChange={(e) => setPaymentTerms(e.target.value)}
                      className={selectCls}
                    >
                      {PAYMENT_TERMS.map(t => <option key={t}>{t}</option>)}
                    </select>
                    <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-muted pointer-events-none" />
                  </div>
                </div>
                <div className="flex-1">
                  <FieldLabel>Due Date</FieldLabel>
                  <input
                    type="date"
                    value={form.dueDate}
                    onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                    className={inputCls}
                  />
                </div>
              </div>
            </div>
          </div>

         {/* Bill To */}
<div className="grid grid-cols-2 gap-8 px-8 py-6 border-b border-[#E4E7EE]">
  <div>
    <FieldLabel required>Bill To</FieldLabel>

    {clients.length > 0 && (
      <div className="mb-3">
        <div className="relative">
          <select
            onChange={(e) => fillFromClient(e.target.value)}
            className={selectCls}
          >
            <option value="">Select existing customer...</option>
            {clients.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-muted pointer-events-none" />
        </div>
        <p className="text-[11px] text-ink-muted mt-1">Or fill in manually below</p>
      </div>
    )}

    <Field>
      <input
        type="text"
        value={form.clientName}
        onChange={(e) => setForm({ ...form, clientName: e.target.value })}
        placeholder="Customer / Company Name *"
        className={inputCls}
      />
    </Field>
    <Field>
      <input
        type="email"
        value={form.clientEmail}
        onChange={(e) => setForm({ ...form, clientEmail: e.target.value })}
        placeholder="Email address"
        className={inputCls}
      />
    </Field>
    <Field>
      <input
        type="text"
        value={form.clientPhone}
        onChange={(e) => setForm({ ...form, clientPhone: e.target.value })}
        placeholder="Phone number"
        className={inputCls}
      />
    </Field>
    <Field>
      <textarea
        value={form.clientAddress}
        onChange={(e) => setForm({ ...form, clientAddress: e.target.value })}
        placeholder="Billing address"
        rows={2}
        className="w-full px-3 py-2 text-sm border border-[#E4E7EE] rounded-lg outline-none focus:border-[#1B4FFF] transition-all resize-none"
      />
    </Field>
  </div>

  {/* Right column — Payment Method + Live Summary */}
  <div className="space-y-4">
    <div>
      <FieldLabel>Payment Method</FieldLabel>
      <div className="relative">
        <select
          value={form.paymentMethod}
          onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })}
          className={selectCls}
        >
          {PAYMENT_METHODS.map(m => <option key={m}>{m}</option>)}
        </select>
        <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-muted pointer-events-none" />
      </div>
    </div>

    {/* Live Invoice Summary */}
    <div className="bg-bg rounded-xl p-4 border border-[#E4E7EE]">
      <p className="text-[10px] font-bold text-ink-muted uppercase tracking-wider mb-3">
        Invoice Summary
      </p>
      <div className="space-y-2">
        <div className="flex justify-between text-xs">
          <span className="text-ink-secondary">Invoice #</span>
          <span className="font-semibold text-ink" style={{ fontFamily: 'DM Mono, monospace' }}>
            {invoiceNumber}
          </span>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-ink-secondary">Customer</span>
          <span className="font-medium text-ink truncate ml-4 max-w-[140px] text-right">
            {form.clientName || '—'}
          </span>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-ink-secondary">Items</span>
          <span className="font-medium text-ink">
            {form.items.filter(i => i.description).length} line item{form.items.filter(i => i.description).length !== 1 ? 's' : ''}
          </span>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-ink-secondary">Due Date</span>
          <span className="font-medium text-ink">{form.dueDate || '—'}</span>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-ink-secondary">Payment</span>
          <span className="font-medium text-ink">{form.paymentMethod}</span>
        </div>
      </div>

      <div className="border-t border-[#E4E7EE] mt-3 pt-3">
        <div className="flex justify-between items-center">
          <span className="text-xs font-semibold text-ink">Total Amount</span>
          <span
            className="text-lg font-bold"
            style={{ fontFamily: 'DM Mono, monospace', color: '#1B4FFF' }}
          >
            {currencySymbol}{fmt(total)}
          </span>
        </div>
        {Number(form.taxRate) > 0 && (
          <p className="text-[10px] text-ink-muted mt-1">
            Includes {form.taxRate}% tax ({currencySymbol}{fmt(taxAmount)})
          </p>
        )}
      </div>
    </div>
  </div>
</div>

          {/* Line Items Table */}
          <div className="px-8 py-6 border-b border-[#E4E7EE]">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#E4E7EE]">
                  <th className="text-left pb-3 text-[10px] font-bold text-ink-muted uppercase tracking-wider w-[40%]">
                    Item / Description
                  </th>
                  <th className="text-center pb-3 text-[10px] font-bold text-ink-muted uppercase tracking-wider w-[12%]">
                    Qty
                  </th>
                  <th className="text-right pb-3 text-[10px] font-bold text-ink-muted uppercase tracking-wider w-[18%]">
                    Rate
                  </th>
                  <th className="text-right pb-3 text-[10px] font-bold text-ink-muted uppercase tracking-wider w-[22%]">
                    Amount
                  </th>
                  <th className="w-[8%]"></th>
                </tr>
              </thead>
              <tbody>
                {form.items.map((item, index) => (
                  <tr key={index} className="border-b border-[#F5F6FA] group">
                    <td className="py-2 pr-3">
                      <input
                        value={item.description}
                        onChange={(e) => updateItem(index, 'description', e.target.value)}
                        placeholder="Description of service or product"
                        className="w-full h-9 px-3 text-sm border border-transparent rounded-lg outline-none focus:border-[#1B4FFF] hover:border-[#E4E7EE] transition-all"
                      />
                    </td>
                    <td className="py-2 px-2">
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                        className="w-full h-9 px-2 text-sm text-center border border-transparent rounded-lg outline-none focus:border-[#1B4FFF] hover:border-[#E4E7EE] transition-all"
                      />
                    </td>
                    <td className="py-2 px-2">
                      <input
                        type="number"
                        min="0"
                        value={item.unit_price}
                        onChange={(e) => updateItem(index, 'unit_price', e.target.value)}
                        className="w-full h-9 px-3 text-sm text-right border border-transparent rounded-lg outline-none focus:border-[#1B4FFF] hover:border-[#E4E7EE] transition-all"
                      />
                    </td>
                    <td className="py-2 pl-2 text-right">
                      <span className="text-sm font-semibold text-ink" style={{ fontFamily: 'DM Mono, monospace' }}>
                        {currencySymbol}{fmt(Number(item.quantity) * Number(item.unit_price))}
                      </span>
                    </td>
                    <td className="py-2 pl-2 text-center">
                      <button
                        onClick={() => removeItem(index)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded hover:bg-red-50 text-ink-muted hover:text-red-400"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <button
              onClick={addItem}
              className="mt-3 flex items-center gap-1.5 text-sm font-medium text-[#1B4FFF] hover:opacity-80 transition-all"
            >
              <Plus size={14} />
              Add Line Item
            </button>
          </div>

          {/* Totals + Notes */}
          <div className="grid grid-cols-2 gap-8 px-8 py-6">
            {/* Left — Notes */}
            <div>
              <button
  onClick={() => setShowNotes(!showNotes)}
  className="flex items-center gap-1.5 text-sm font-medium text-ink-secondary hover:text-ink transition-colors mb-2"
>
  {showNotes ? <Minus size={14} /> : <Plus size={14} />}
  {showNotes ? 'Hide' : 'Add'} Notes & Terms
</button>
              {showNotes && (
                <div className="space-y-3">
                  <div>
                    <FieldLabel>Customer Notes</FieldLabel>
                    <textarea
                      value={form.notes}
                      onChange={(e) => setForm({ ...form, notes: e.target.value })}
                      placeholder="Thank you for your business. We appreciate the opportunity to serve you."
                      rows={3}
                      className="w-full px-3 py-2 text-sm border border-[#E4E7EE] rounded-lg outline-none focus:border-[#1B4FFF] transition-all resize-none"
                    />
                  </div>
                  <div>
                    <FieldLabel>Terms & Conditions</FieldLabel>
                    <textarea
                      value={form.terms}
                      onChange={(e) => setForm({ ...form, terms: e.target.value })}
                      placeholder="Payment is due within the agreed terms. Late payments may incur additional charges."
                      rows={3}
                      className="w-full px-3 py-2 text-sm border border-[#E4E7EE] rounded-lg outline-none focus:border-[#1B4FFF] transition-all resize-none"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Right — Totals */}
            <div>
              <div className="space-y-2.5">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-ink-secondary">Subtotal</span>
                  <span className="font-medium text-ink" style={{ fontFamily: 'DM Mono, monospace' }}>
                    {currencySymbol}{fmt(subtotal)}
                  </span>
                </div>

                {/* Tax row */}
                <div className="flex justify-between items-center text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-ink-secondary">Tax (%)</span>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={form.taxRate}
                      onChange={(e) => setForm({ ...form, taxRate: e.target.value })}
                      className="w-16 h-7 px-2 text-xs text-center border border-[#E4E7EE] rounded outline-none focus:border-[#1B4FFF]"
                    />
                  </div>
                  <span className="font-medium text-ink" style={{ fontFamily: 'DM Mono, monospace' }}>
                    {currencySymbol}{fmt(taxAmount)}
                  </span>
                </div>

                {/* Discount row */}
                <div className="flex justify-between items-center text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-ink-secondary">Discount</span>
                    <input
                      type="number"
                      min="0"
                      value={form.discount}
                      onChange={(e) => setForm({ ...form, discount: e.target.value })}
                      className="w-24 h-7 px-2 text-xs border border-[#E4E7EE] rounded outline-none focus:border-[#1B4FFF]"
                    />
                  </div>
                  <span className="font-medium text-red-500" style={{ fontFamily: 'DM Mono, monospace' }}>
                    {discountAmount > 0 ? `− ${currencySymbol}${fmt(discountAmount)}` : `${currencySymbol}0.00`}
                  </span>
                </div>

                <div className="border-t-2 border-[#0F1117] pt-3 flex justify-between items-center">
                  <span className="font-bold text-ink">Total</span>
                  <span className="font-bold text-2xl" style={{ fontFamily: 'DM Mono, monospace', color: '#1B4FFF' }}>
                    {currencySymbol}{fmt(total)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom action bar */}
          <div className="px-8 py-4 bg-bg border-t border-[#E4E7EE] flex items-center justify-end gap-3">
            <button
              onClick={() => navigate('/invoices')}
              className="px-4 py-2 rounded-lg text-sm font-medium text-ink-secondary hover:text-ink transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => handleSave('draft')}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold border border-[#E4E7EE] bg-white text-ink hover:bg-white transition-all"
            >
              <Save size={14} />
              Save as Draft
            </button>
            <button
              onClick={() => handleSave('sent')}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white hover:opacity-90 transition-all"
              style={{ background: '#1B4FFF' }}
            >
              <Send size={14} />
              {saving ? 'Saving...' : 'Save and Send'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}