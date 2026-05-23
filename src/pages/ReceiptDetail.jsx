import { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Download, Printer, CheckCircle } from 'lucide-react'
import { supabase } from '../lib/supabase'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

export default function ReceiptDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const printRef = useRef()
  const [receipt, setReceipt] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [downloading, setDownloading] = useState(false)

  useEffect(() => { loadData() }, [id])

  const loadData = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { navigate('/auth'); return }

    const [{ data: rec }, { data: prof }] = await Promise.all([
      supabase.from('receipts').select('*').eq('id', id).single(),
      supabase.from('profiles').select('*').eq('id', user.id).single(),
    ])

    setReceipt(rec)
    setProfile(prof)
    setLoading(false)
  }

  const downloadPDF = async () => {
    setDownloading(true)
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
    pdf.save(`${receipt.receipt_number}.pdf`)
    setDownloading(false)
  }

  const fmt = (n) => Number(n).toLocaleString('en-NG', { minimumFractionDigits: 2 })

  if (loading) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-[#16A34A] border-t-transparent animate-spin" />
          <p className="text-sm text-ink-secondary">Loading receipt...</p>
        </div>
      </div>
    )
  }

  if (!receipt) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <p className="text-sm text-ink-secondary">Receipt not found.</p>
      </div>
    )
  }

  const inv = receipt.invoice_snapshot
  const currencySymbol = { NGN: '₦', USD: '$', GBP: '£', EUR: '€', CAD: 'CA$' }[inv?.currency] || '₦'

  return (
    <div className="min-h-screen bg-bg">
      {/* Toolbar */}
      <div className="bg-white border-b border-[#E4E7EE] sticky top-0 z-20">
        <div className="max-w-3xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/receipts')}
              className="flex items-center gap-1.5 text-sm text-ink-secondary hover:text-ink transition-colors"
            >
              <ArrowLeft size={16} />
              Receipts
            </button>
            <span className="text-[#E4E7EE]">|</span>
            <span className="text-sm font-semibold text-ink">{receipt.receipt_number}</span>
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-green-50 text-green-700">
              Paid
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold border border-[#E4E7EE] bg-white text-ink hover:bg-bg transition-all"
            >
              <Printer size={14} />
              Print
            </button>
            <button
              onClick={downloadPDF}
              disabled={downloading}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white hover:opacity-90 transition-all"
              style={{ background: '#16A34A' }}
            >
              <Download size={14} />
              {downloading ? 'Generating...' : 'Download PDF'}
            </button>
          </div>
        </div>
      </div>

      {/* Receipt Document */}
      <div className="max-w-3xl mx-auto px-6 py-8">
        <div
          ref={printRef}
          className="bg-white border border-[#E4E7EE] rounded-xl overflow-hidden shadow-sm"
        >
          {/* Green paid header bar */}
          <div className="h-2 w-full" style={{ background: 'linear-gradient(90deg, #16A34A, #22C55E)' }} />

          {/* Header */}
          <div className="grid grid-cols-2 gap-8 px-10 pt-8 pb-6 border-b border-[#E4E7EE]">
            {/* Business */}
            <div>
              <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center mb-3">
                <span className="text-base font-bold text-green-700" style={{ fontFamily: 'Sora, sans-serif' }}>
                  {profile?.business_name?.[0]?.toUpperCase() || 'B'}
                </span>
              </div>
              <p className="font-bold text-ink" style={{ fontFamily: 'Sora, sans-serif' }}>
                {profile?.business_name || 'Your Business'}
              </p>
              {profile?.business_email && (
                <p className="text-xs text-ink-secondary mt-0.5">{profile.business_email}</p>
              )}
              {profile?.business_address && (
                <p className="text-xs text-ink-secondary mt-0.5">{profile.business_address}</p>
              )}
              {profile?.business_phone && (
                <p className="text-xs text-ink-secondary mt-0.5">{profile.business_phone}</p>
              )}
            </div>

            {/* Receipt Meta */}
            <div className="text-right">
              <p className="text-3xl font-bold mb-1" style={{ fontFamily: 'Sora, sans-serif', color: '#16A34A' }}>
                RECEIPT
              </p>
              <p className="text-sm font-bold text-ink" style={{ fontFamily: 'DM Mono, monospace' }}>
                {receipt.receipt_number}
              </p>
              <div className="mt-3 space-y-1.5">
                <div className="flex justify-end gap-8 text-xs">
                  <span className="text-ink-secondary">Date Paid</span>
                  <span className="font-medium text-ink w-28 text-left">
                    {new Date(receipt.paid_at).toLocaleDateString('en-NG', {
                      year: 'numeric', month: 'long', day: 'numeric'
                    })}
                  </span>
                </div>
                <div className="flex justify-end gap-8 text-xs">
                  <span className="text-ink-secondary">Invoice Ref</span>
                  <span className="font-medium text-ink w-28 text-left" style={{ fontFamily: 'DM Mono, monospace' }}>
                    {inv?.invoice_number || '—'}
                  </span>
                </div>
                {inv?.payment_method && (
                  <div className="flex justify-end gap-8 text-xs">
                    <span className="text-ink-secondary">Payment Via</span>
                    <span className="font-medium text-ink w-28 text-left">{inv.payment_method}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Received From */}
          <div className="px-10 py-5 border-b border-[#E4E7EE]">
            <p className="text-[10px] font-bold text-ink-muted uppercase tracking-wider mb-2">
              Received From
            </p>
            <p className="font-bold text-ink">{inv?.client_snapshot?.name || '—'}</p>
            {inv?.client_snapshot?.email && (
              <p className="text-sm text-ink-secondary mt-0.5">{inv.client_snapshot.email}</p>
            )}
            {inv?.client_snapshot?.phone && (
              <p className="text-sm text-ink-secondary mt-0.5">{inv.client_snapshot.phone}</p>
            )}
            {inv?.client_snapshot?.address && (
              <p className="text-sm text-ink-secondary mt-0.5">{inv.client_snapshot.address}</p>
            )}
          </div>

          {/* Line Items */}
          <div className="px-10 py-6 border-b border-[#E4E7EE]">
            <table className="w-full">
              <thead>
                <tr style={{ background: '#F0FDF4' }}>
                  <th className="text-left px-4 py-3 text-[10px] font-bold text-green-700 uppercase tracking-wider rounded-l-lg">
                    Description
                  </th>
                  <th className="text-center px-4 py-3 text-[10px] font-bold text-green-700 uppercase tracking-wider">
                    Qty
                  </th>
                  <th className="text-right px-4 py-3 text-[10px] font-bold text-green-700 uppercase tracking-wider">
                    Rate
                  </th>
                  <th className="text-right px-4 py-3 text-[10px] font-bold text-green-700 uppercase tracking-wider rounded-r-lg">
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody>
                {(inv?.items || []).map((item, i) => (
                  <tr key={i} className="border-b border-[#F5F6FA]">
                    <td className="px-4 py-3 text-sm text-ink">{item.description}</td>
                    <td className="px-4 py-3 text-sm text-ink-secondary text-center">{item.quantity}</td>
                    <td className="px-4 py-3 text-sm text-ink-secondary text-right" style={{ fontFamily: 'DM Mono, monospace' }}>
                      {currencySymbol}{fmt(item.unit_price)}
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold text-ink text-right" style={{ fontFamily: 'DM Mono, monospace' }}>
                      {currencySymbol}{fmt(item.total)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="grid grid-cols-2 gap-8 px-10 py-8">
            {/* Left — Notes */}
            <div className="flex flex-col justify-between">
              {inv?.notes && (
                <div>
                  <p className="text-[10px] font-bold text-ink-muted uppercase tracking-wider mb-1.5">Notes</p>
                  <p className="text-sm text-ink-secondary leading-relaxed">{inv.notes}</p>
                </div>
              )}
              <div className="flex items-center gap-2 mt-4">
                <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center">
                  <CheckCircle size={12} className="text-green-600" />
                </div>
                <p className="text-xs font-semibold text-green-700">Payment Confirmed</p>
              </div>
            </div>

            {/* Right — Amounts */}
            <div className="space-y-2.5">
              <div className="flex justify-between text-sm">
                <span className="text-ink-secondary">Subtotal</span>
                <span className="font-medium text-ink" style={{ fontFamily: 'DM Mono, monospace' }}>
                  {currencySymbol}{fmt(inv?.subtotal || 0)}
                </span>
              </div>
              {inv?.tax_amount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-ink-secondary">Tax ({inv.tax_rate}%)</span>
                  <span className="font-medium text-ink" style={{ fontFamily: 'DM Mono, monospace' }}>
                    {currencySymbol}{fmt(inv.tax_amount)}
                  </span>
                </div>
              )}
              {inv?.discount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-ink-secondary">Discount</span>
                  <span className="font-medium text-red-500" style={{ fontFamily: 'DM Mono, monospace' }}>
                    − {currencySymbol}{fmt(inv.discount)}
                  </span>
                </div>
              )}
              <div className="border-t-2 border-[#16A34A] pt-3 flex justify-between items-center">
                <span className="font-bold text-ink">Total Paid</span>
                <span className="font-bold text-2xl" style={{ fontFamily: 'DM Mono, monospace', color: '#16A34A' }}>
                  {currencySymbol}{fmt(inv?.total || 0)}
                </span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-10 py-4 border-t border-[#E4E7EE] bg-green-50 flex items-center justify-between">
            <p className="text-xs text-green-700 font-medium">
              Thank you for your payment. This is your official receipt.
            </p>
            <p className="text-xs text-ink-muted">Generated by BillFlow</p>
          </div>
        </div>
      </div>
    </div>
  )
}