import { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft, Download, Send, CheckCircle, Clock,
  Printer, MoreHorizontal, Trash2, Mail
} from 'lucide-react'
import { supabase } from '../lib/supabase'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import { sendInvoiceEmail } from '../lib/email'

function StatusBadge({ status }) {
  const styles = {
    draft:   { bg: '#F3F4F6', color: '#6B7280' },
    sent:    { bg: '#EFF6FF', color: '#2563EB' },
    paid:    { bg: '#F0FDF4', color: '#16A34A' },
    overdue: { bg: '#FEF2F2', color: '#DC2626' },
  }
  const s = styles[status] || styles.draft
  return (
    <span className="px-3 py-1.5 rounded-full text-xs font-bold capitalize"
      style={{ background: s.bg, color: s.color }}>
      {status}
    </span>
  )
}

export default function InvoiceDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const printRef = useRef()
  const [invoice, setInvoice] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [downloading, setDownloading] = useState(false)
  const [sending, setSending] = useState(false)
  const [showMenu, setShowMenu] = useState(false)

  useEffect(() => { loadInvoice() }, [id])

  const loadInvoice = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { navigate('/auth'); return }
    const [{ data: inv }, { data: prof }] = await Promise.all([
      supabase.from('invoices').select('*').eq('id', id).single(),
      supabase.from('profiles').select('*').eq('id', user.id).single(),
    ])
    setInvoice(inv)
    setProfile(prof)
    setLoading(false)
  }

  const updateStatus = async (status) => {
    setUpdating(true)
    await supabase.from('invoices').update({ status, updated_at: new Date().toISOString() }).eq('id', id)
    if (status === 'paid') {
      const { data: { user } } = await supabase.auth.getUser()
      const { count } = await supabase
        .from('receipts')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
      const receiptNumber = `REC-${String((count || 0) + 1).padStart(3, '0')}`
      await supabase.from('receipts').insert({
        user_id: user.id,
        receipt_number: receiptNumber,
        invoice_id: id,
        invoice_snapshot: invoice,
        paid_at: new Date().toISOString(),
      })
    }
    setInvoice(prev => ({ ...prev, status }))
    setUpdating(false)
  }

  const deleteInvoice = async () => {
    if (!confirm('Delete this invoice? This cannot be undone.')) return
    await supabase.from('invoices').delete().eq('id', id)
    navigate('/invoices')
  }

  const generatePDFBase64 = async () => {
    const canvas = await html2canvas(printRef.current, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff',
    })
    const imgData = canvas.toDataURL('image/png')
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
    const pageWidth = pdf.internal.pageSize.getWidth()
    const pageHeight = (canvas.height * pageWidth) / canvas.width
    pdf.addImage(imgData, 'PNG', 0, 0, pageWidth, pageHeight)
    return { pdf, imgData, pageWidth, pageHeight }
  }

  const downloadPDF = async () => {
    setDownloading(true)
    const { pdf } = await generatePDFBase64()
    pdf.save(`${invoice.invoice_number}_${invoice.client_snapshot?.name || 'invoice'}.pdf`)
    setDownloading(false)
  }

  const handleSendEmail = async () => {
    if (!invoice.client_snapshot?.email) {
      alert('This client has no email address. Add one to the invoice to send via email.')
      return
    }
    setSending(true)
    try {
      const { pdf } = await generatePDFBase64()
      const pdfBase64 = pdf.output('datauristring').split(',')[1]
      await sendInvoiceEmail({ invoice, profile, pdfBase64 })
      alert(`Invoice sent to ${invoice.client_snapshot.email} ✓`)
      if (invoice.status === 'draft') {
        await updateStatus('sent')
      }
    } catch (err) {
      alert('Failed to send: ' + err.message)
    }
    setSending(false)
  }

  const fmt = (n) => Number(n).toLocaleString('en-NG', { minimumFractionDigits: 2 })
  const currencySymbol = { NGN: '₦', USD: '$', GBP: '£', EUR: '€', CAD: 'CA$' }[invoice?.currency] || ''
  const mono = { fontFamily: 'IBM Plex Mono, monospace' }
  const display = { fontFamily: 'Outfit, sans-serif' }

  if (loading) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-[#1B4FFF] border-t-transparent animate-spin" />
          <p className="text-sm text-ink-secondary">Loading invoice...</p>
        </div>
      </div>
    )
  }

  if (!invoice) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <p className="text-ink-secondary text-sm">Invoice not found.</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-bg">
      {/* Toolbar */}
      <div className="bg-white border-b border-[#E4E7EE] sticky top-0 z-20">
        <div className="max-w-4xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/invoices')}
              className="flex items-center gap-1.5 text-sm text-ink-secondary hover:text-ink transition-colors"
            >
              <ArrowLeft size={16} />
              Invoices
            </button>
            <span className="text-[#E4E7EE]">|</span>
            <span className="text-sm font-semibold text-ink">{invoice.invoice_number}</span>
            <StatusBadge status={invoice.status} />
          </div>

          <div className="flex items-center gap-2">
            {/* Context-aware primary action */}
            {invoice.status === 'draft' && (
              <button
                onClick={() => updateStatus('sent')}
                disabled={updating}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white hover:opacity-90 transition-all"
                style={{ background: '#1B4FFF' }}
              >
                <Send size={14} />
                Mark as Sent
              </button>
            )}
            {invoice.status === 'sent' && (
              <button
                onClick={() => updateStatus('paid')}
                disabled={updating}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white hover:opacity-90 transition-all"
                style={{ background: '#16A34A' }}
              >
                <CheckCircle size={14} />
                {updating ? 'Updating...' : 'Mark as Paid'}
              </button>
            )}
            {invoice.status === 'overdue' && (
              <button
                onClick={() => updateStatus('paid')}
                disabled={updating}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white hover:opacity-90 transition-all"
                style={{ background: '#16A34A' }}
              >
                <CheckCircle size={14} />
                {updating ? 'Updating...' : 'Mark as Paid'}
              </button>
            )}
            {invoice.status === 'paid' && (
              <button
                onClick={() => navigate('/receipts')}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white hover:opacity-90 transition-all"
                style={{ background: '#16A34A' }}
              >
                <CheckCircle size={14} />
                View Receipt
              </button>
            )}

            {/* Email Invoice */}
            {invoice.client_snapshot?.email && (
              <button
                onClick={handleSendEmail}
                disabled={sending}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold border border-[#E4E7EE] bg-white text-ink hover:bg-bg transition-all"
              >
                <Mail size={14} />
                {sending ? 'Sending...' : 'Email Invoice'}
              </button>
            )}

            {/* Download PDF */}
            <button
              onClick={downloadPDF}
              disabled={downloading}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold border border-[#E4E7EE] bg-white text-ink hover:bg-bg transition-all"
            >
              <Download size={14} />
              {downloading ? 'Generating...' : 'Download PDF'}
            </button>

            {/* More menu */}
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-2 rounded-lg border border-[#E4E7EE] hover:bg-bg transition-all"
              >
                <MoreHorizontal size={16} className="text-ink-secondary" />
              </button>
              {showMenu && (
                <div className="absolute right-0 top-10 bg-white border border-[#E4E7EE] rounded-xl shadow-lg py-1 w-44 z-30">
                  {invoice.status === 'sent' && (
                    <button
                      onClick={() => { updateStatus('overdue'); setShowMenu(false) }}
                      className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-ink hover:bg-bg transition-colors"
                    >
                      <Clock size={14} className="text-orange-500" />
                      Mark as Overdue
                    </button>
                  )}
                  <button
                    onClick={() => { window.print(); setShowMenu(false) }}
                    className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-ink hover:bg-bg transition-colors"
                  >
                    <Printer size={14} className="text-ink-secondary" />
                    Print
                  </button>
                  <div className="border-t border-[#E4E7EE] my-1" />
                  <button
                    onClick={() => { deleteInvoice(); setShowMenu(false) }}
                    className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors"
                  >
                    <Trash2 size={14} />
                    Delete Invoice
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Invoice Document */}
      <div className="max-w-4xl mx-auto px-6 py-8">

        {/* Paid banner */}
        {invoice.status === 'paid' && (
          <div className="mb-4 bg-green-50 border border-green-200 rounded-xl px-5 py-3 flex items-center gap-3">
            <CheckCircle size={18} className="text-green-600 shrink-0" />
            <p className="text-sm text-green-700 font-medium">
              This invoice has been paid. A receipt has been automatically generated.
            </p>
            <button
              onClick={() => navigate('/receipts')}
              className="ml-auto text-sm font-semibold text-green-700 hover:underline shrink-0"
            >
              View Receipt →
            </button>
          </div>
        )}

        {/* Overdue banner */}
        {invoice.status === 'overdue' && (
          <div className="mb-4 bg-red-50 border border-red-200 rounded-xl px-5 py-3 flex items-center gap-3">
            <Clock size={18} className="text-red-500 shrink-0" />
            <p className="text-sm text-red-600 font-medium">
              This invoice is overdue. Due date was {invoice.due_date}.
            </p>
          </div>
        )}

        {/* Printable Invoice */}
        <div ref={printRef} className="bg-white border border-[#E4E7EE] rounded-xl overflow-hidden shadow-sm">

          {/* Header */}
          <div className="grid grid-cols-2 gap-8 px-10 pt-10 pb-8 border-b border-[#E4E7EE]">
            <div>
              <div className="w-14 h-14 rounded-xl bg-primary-light flex items-center justify-center mb-3">
                <span className="text-lg font-bold" style={{ color: '#1B4FFF', ...display }}>
                  {profile?.business_name?.[0]?.toUpperCase() || 'B'}
                </span>
              </div>
              <p className="font-bold text-ink text-base" style={display}>
                {profile?.business_name || 'Business Name'}
              </p>
              {profile?.business_email && <p className="text-xs text-ink-secondary mt-0.5">{profile.business_email}</p>}
              {profile?.business_address && <p className="text-xs text-ink-secondary mt-0.5">{profile.business_address}</p>}
              {profile?.business_phone && <p className="text-xs text-ink-secondary mt-0.5">{profile.business_phone}</p>}
            </div>

            <div className="text-right">
              <p className="text-3xl font-bold mb-3" style={{ ...display, color: '#1B4FFF' }}>
                INVOICE
              </p>
              <p className="text-sm font-bold text-ink" style={mono}>
                {invoice.invoice_number}
              </p>
              <div className="mt-3 space-y-1">
                <div className="flex justify-end gap-6 text-xs">
                  <span className="text-ink-secondary">Invoice Date</span>
                  <span className="font-medium text-ink w-24">{invoice.issued_date}</span>
                </div>
                <div className="flex justify-end gap-6 text-xs">
                  <span className="text-ink-secondary">Due Date</span>
                  <span className="font-medium text-ink w-24">{invoice.due_date || '—'}</span>
                </div>
                <div className="flex justify-end gap-6 text-xs">
                  <span className="text-ink-secondary">Payment</span>
                  <span className="font-medium text-ink w-24">{invoice.payment_method}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bill To */}
          <div className="px-10 py-6 border-b border-[#E4E7EE]">
            <p className="text-[10px] font-bold text-ink-muted uppercase tracking-wider mb-2">Bill To</p>
            <p className="font-bold text-ink">{invoice.client_snapshot?.name}</p>
            {invoice.client_snapshot?.email && <p className="text-sm text-ink-secondary mt-0.5">{invoice.client_snapshot.email}</p>}
            {invoice.client_snapshot?.phone && <p className="text-sm text-ink-secondary mt-0.5">{invoice.client_snapshot.phone}</p>}
            {invoice.client_snapshot?.address && <p className="text-sm text-ink-secondary mt-0.5">{invoice.client_snapshot.address}</p>}
          </div>

          {/* Line Items */}
          <div className="px-10 py-6 border-b border-[#E4E7EE]">
            <table className="w-full">
              <thead>
                <tr style={{ background: '#F5F6FA' }}>
                  <th className="text-left px-4 py-3 text-[10px] font-bold text-ink-muted uppercase tracking-wider rounded-l-lg">Item / Description</th>
                  <th className="text-center px-4 py-3 text-[10px] font-bold text-ink-muted uppercase tracking-wider">Qty</th>
                  <th className="text-right px-4 py-3 text-[10px] font-bold text-ink-muted uppercase tracking-wider">Rate</th>
                  <th className="text-right px-4 py-3 text-[10px] font-bold text-ink-muted uppercase tracking-wider rounded-r-lg">Amount</th>
                </tr>
              </thead>
              <tbody>
                {(invoice.items || []).map((item, i) => (
                  <tr key={i} className="border-b border-[#F5F6FA]">
                    <td className="px-4 py-3 text-sm text-ink">{item.description}</td>
                    <td className="px-4 py-3 text-sm text-ink-secondary text-center">{item.quantity}</td>
                    <td className="px-4 py-3 text-sm text-ink-secondary text-right" style={mono}>
                      {currencySymbol}{fmt(item.unit_price)}
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold text-ink text-right" style={mono}>
                      {currencySymbol}{fmt(item.total)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals + Notes */}
          <div className="grid grid-cols-2 gap-8 px-10 py-8">
            <div>
              {invoice.notes && (
                <div className="mb-4">
                  <p className="text-[10px] font-bold text-ink-muted uppercase tracking-wider mb-1.5">Notes</p>
                  <p className="text-sm text-ink-secondary leading-relaxed">{invoice.notes}</p>
                </div>
              )}
              <p className="text-xs text-ink-muted mt-auto">Thank you for your business.</p>
            </div>

            <div className="space-y-2.5">
              <div className="flex justify-between text-sm">
                <span className="text-ink-secondary">Subtotal</span>
                <span className="font-medium text-ink" style={mono}>{currencySymbol}{fmt(invoice.subtotal)}</span>
              </div>
              {invoice.tax_rate > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-ink-secondary">Tax ({invoice.tax_rate}%)</span>
                  <span className="font-medium text-ink" style={mono}>{currencySymbol}{fmt(invoice.tax_amount)}</span>
                </div>
              )}
              {invoice.discount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-ink-secondary">Discount</span>
                  <span className="font-medium text-red-500" style={mono}>− {currencySymbol}{fmt(invoice.discount)}</span>
                </div>
              )}
              <div className="border-t-2 border-ink pt-3 flex justify-between items-center">
                <span className="font-bold text-ink">Total</span>
                <span className="font-bold text-2xl" style={{ ...mono, color: '#1B4FFF' }}>
                  {currencySymbol}{fmt(invoice.total)}
                </span>
              </div>
              {invoice.status === 'paid' && (
                <div className="flex justify-between items-center mt-2">
                  <span className="text-sm font-semibold text-green-600">Amount Paid</span>
                  <span className="font-bold text-lg text-green-600" style={mono}>
                    {currencySymbol}{fmt(invoice.total)}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="px-10 py-4 border-t border-[#E4E7EE] bg-bg flex items-center justify-between">
            <p className="text-xs text-ink-muted" style={mono}>{invoice.invoice_number}</p>
            <p className="text-xs text-ink-muted">Generated by BillFlow</p>
          </div>
        </div>
      </div>
    </div>
  )
}