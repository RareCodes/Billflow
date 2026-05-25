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
import { toast } from 'sonner'

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
  const element = printRef.current

  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    backgroundColor: '#ffffff',
    scrollY: -window.scrollY,
  })

  const imgData = canvas.toDataURL('image/png')

  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  })

  const pdfWidth = pdf.internal.pageSize.getWidth()
  const pdfHeight = pdf.internal.pageSize.getHeight()

  const imgWidth = pdfWidth

  const imgHeight =
    (canvas.height * imgWidth) / canvas.width

  let heightLeft = imgHeight
  let position = 0

  // First page
  pdf.addImage(
    imgData,
    'PNG',
    0,
    position,
    imgWidth,
    imgHeight
  )

  heightLeft -= pdfHeight

  // Extra pages
  while (heightLeft > 0) {
    position = heightLeft - imgHeight

    pdf.addPage()

    pdf.addImage(
      imgData,
      'PNG',
      0,
      position,
      imgWidth,
      imgHeight
    )

    heightLeft -= pdfHeight
  }

  return {
    pdf,
    imgData,
  }
}

const downloadPDF = async () => {
  try {
    setDownloading(true)

    const { pdf } = await generatePDFBase64()

    pdf.save(
      `${invoice.invoice_number}_${
        invoice.client_snapshot?.name || 'invoice'
      }.pdf`
    )
  } finally {
    setDownloading(false)
  }
}

  const handleSendEmail = async () => {
  if (!invoice.client_snapshot?.email) {
    alert('This client has no email address.')
    return
  }
  setSending(true)
  try {
    await sendInvoiceEmail({ invoice, profile })
    toast.success(`Invoice sent to ${invoice.client_snapshot.email}`, {
  description: 'Your client will receive it in their inbox shortly.',
  duration: 5000,
})
    if (invoice.status === 'draft') {
      await updateStatus('sent')
    }
  } catch (err) {
    toast.error('Failed to send invoice', {
  description: err.message,
  duration: 6000,
})
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
     

      {/* Toolbar */}
<div className="bg-white border-b border-[#E4E7EE] sticky top-0 z-20">
  <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3">

    {/* Top row */}
    <div className="flex flex-row sm:flex-row sm:items-center sm:justify-between gap-4">

      {/* Left */}
      <div className="flex flex-wrap items-center gap-2 sm:gap-4 min-w-0">
        <button
          onClick={() => navigate('/invoices')}
          className="flex items-center gap-1.5 text-sm text-ink-secondary hover:text-ink transition-colors"
        >
          <ArrowLeft size={16} />
          <span className="hidden xs:inline">
            Invoices
          </span>
        </button>

        <span className="hidden sm:block text-[#E4E7EE]">
          |
        </span>

        <span className="text-sm font-semibold text-ink truncate">
          {invoice.invoice_number}
        </span>

        <StatusBadge status={invoice.status} />
      </div>

      {/* Right actions */}
      <div className="
        flex
        items-center
        gap-2
        overflow-x-auto
        pb-1
        scrollbar-hide
      ">

        {/* Draft */}
        {invoice.status === 'draft' && (
          <button
            onClick={() => updateStatus('sent')}
            disabled={updating}
            className="
              flex-shrink-0
              flex items-center gap-2
              px-3 py-2
              rounded-lg
              text-sm font-semibold
              text-white
            "
            style={{ background:'#6D28D9' }}
          >
            <Send size={14}/>
            <span className="hidden sm:inline">
              Mark as Sent
            </span>
          </button>
        )}

        {/* Sent / Overdue */}
        {(invoice.status === 'sent' ||
          invoice.status === 'overdue') && (
          <button
            onClick={() => updateStatus('paid')}
            disabled={updating}
            className="
              flex-shrink-0
              flex items-center gap-2
              px-3 py-2
              rounded-lg
              text-sm font-semibold
              text-white
            "
            style={{ background:'#16A34A' }}
          >
            <CheckCircle size={14}/>
            <span className="hidden sm:inline">
              {updating
                ? 'Updating...'
                : 'Mark as Paid'}
            </span>
          </button>
        )}

        {/* Paid */}
        {invoice.status === 'paid' && (
          <button
            onClick={() => navigate('/receipts')}
            className="
              flex-shrink-0
              flex items-center gap-2
              px-3 py-2
              rounded-lg
              text-sm font-semibold
              text-white
            "
            style={{ background:'#16A34A' }}
          >
            <CheckCircle size={14}/>
            <span className="hidden sm:inline">
              View Receipt
            </span>
          </button>
        )}

        {/* Email */}
        {invoice.client_snapshot?.email && (
          <button
            onClick={handleSendEmail}
            disabled={sending}
            className="
              flex-shrink-0
              flex items-center gap-2
              px-3 py-2
              rounded-lg
              text-sm
              font-semibold
              border
              bg-white
            "
          >
            <Mail size={14}/>
            <span className="hidden sm:inline">
              {sending
                ? 'Sending...'
                : 'Email Invoice'}
            </span>
          </button>
        )}

        {/* PDF */}
        <button
          onClick={downloadPDF}
          disabled={downloading}
          className="
            flex-shrink-0
            flex items-center gap-2
            px-3 py-2
            rounded-lg
            text-sm
            font-semibold
            border
            bg-white
          "
        >
          <Download size={14}/>
          <span className="hidden sm:inline">
            {downloading
              ? 'Generating...'
              : 'Download PDF'}
          </span>
        </button>

        {/* Menu */}
        <div className="relative flex-shrink-0">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-2 rounded-lg border hover:bg-bg"
          >
            <MoreHorizontal
              size={16}
              className="text-ink-secondary"
            />
          </button>

          {showMenu && (
            <div className="
              absolute
              right-0
              top-10
              w-44
              bg-white
              border
              rounded-xl
              shadow-lg
              z-30
            ">
              {/* existing menu items */}
            </div>
          )}
        </div>

      </div>
    </div>
  </div>
</div>



      {/* Invoice Document */}
      <div className="max-w-4xl mx-auto px-6 py-8">

        {/* Paid banner */}
        {invoice.status === 'paid' && (
          <div className="mb-4 bg-green-50 border border-green-400 rounded-xl px-2 py-3 flex items-center gap-3">
            <CheckCircle size={18} className="text-green-600 shrink-0" />
            <p className="text-sm text-green-700 font-regular">
              This invoice has been paid.
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