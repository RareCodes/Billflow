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
import { ClassicTemplate, BoldTemplate, MinimalTemplate, CreativeTemplate } from '../components/invoice/InvoiceTemplates'

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
  const template = profile?.invoice_template || 'classic'
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
    alert('This client has no email address.')
    return
  }
  setSending(true)
  try {
    await sendInvoiceEmail({ invoice, profile })
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
          <div className="w-8 h-8 rounded-full border-2 border-[#6D28D9] border-t-transparent animate-spin" />
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
                style={{ background: '#6D28D9' }}
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
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold border border-[##EDE9FE] bg-white text-ink hover:bg-bg transition-all"
              >
                <Mail size={14} />
                {sending ? 'Sending...' : 'Email Invoice'}
              </button>
            )}

            {/* Download PDF */}
            <button
              onClick={downloadPDF}
              disabled={downloading}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold border border-[##EDE9FE] bg-white text-ink hover:bg-bg transition-all"
            >
              <Download size={14} />
              {downloading ? 'Generating...' : 'Download PDF'}
            </button>

            {/* More menu */}
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-2 rounded-lg border border-[##EDE9FE] hover:bg-bg transition-all"
              >
                <MoreHorizontal size={16} className="text-ink-secondary" />
              </button>
              {showMenu && (
                <div className="absolute right-0 top-10 bg-white border border-[##EDE9FE] rounded-xl shadow-lg py-1 w-44 z-30">
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
       


                {/* Template Selector */}
            <div className="bg-white border border-[#E4E7EE] rounded-xl px-5 py-4 mb-4 flex items-center gap-3 flex-wrap">
            <p className="text-xs font-bold text-ink-secondary uppercase tracking-wider shrink-0">Template:</p>
            {[
                { id: 'classic', label: 'Classic' },
                { id: 'bold', label: 'Bold' },
                { id: 'minimal', label: 'Minimal' },
                { id: 'creative', label: 'Creative' },
            ].map(({ id, label }) => (
                <button
                key={id}
                onClick={() => setTemplate(id)}
                className="px-4 py-1.5 rounded-lg text-xs font-bold transition-all"
                style={{
                    background: template === id ? '#6D28D9' : '#F8F7FF',
                    color: template === id ? 'white' : '#5C6070',
                    border: `1px solid ${template === id ? '#6D28D9' : '#E4E7EE'}`,
                }}
                >
                {label}
                </button>
            ))}
            </div>



        {/* Printable Invoice */}
      <div ref={printRef} className="bg-white border border-[#E8E4F0] rounded-xl overflow-hidden shadow-sm">
  {(profile?.invoice_template || 'classic') === 'classic' && <ClassicTemplate invoice={invoice} profile={profile} />}
  {(profile?.invoice_template || 'classic') === 'bold' && <BoldTemplate invoice={invoice} profile={profile} />}
  {(profile?.invoice_template || 'classic') === 'minimal' && <MinimalTemplate invoice={invoice} profile={profile} />}
  {(profile?.invoice_template || 'classic') === 'creative' && <CreativeTemplate invoice={invoice} profile={profile} />}
</div>

         
        </div>
      </div>
    
  )
}