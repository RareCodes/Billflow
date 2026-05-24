import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Receipt, Download, CheckCircle } from 'lucide-react'
import AppLayout from '../components/layout/AppLayout'
import { supabase } from '../lib/supabase'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

export default function Receipts() {
  const [receipts, setReceipts] = useState([])
  const [loading, setLoading] = useState(true)
  const [downloading, setDownloading] = useState(null)
  const [profile, setProfile] = useState(null)
  const navigate = useNavigate()

  useEffect(() => { loadData() }, [])

  const loadData = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { navigate('/auth'); return }
    const [{ data: rec }, { data: prof }] = await Promise.all([
      supabase.from('receipts').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
      supabase.from('profiles').select('*').eq('id', user.id).single(),
    ])
    setReceipts(rec || [])
    setProfile(prof)
    setLoading(false)
  }

  const fmt = (n) => Number(n).toLocaleString('en-NG', { minimumFractionDigits: 2 })

  const downloadReceiptPDF = async (receipt) => {
    setDownloading(receipt.id)
    const inv = receipt.invoice_snapshot
    const currencySymbol = { NGN: '₦', USD: '$', GBP: '£', EUR: '€', CAD: 'CA$' }[inv?.currency] || '₦'

    // Build a temporary DOM element to capture
    const el = document.createElement('div')
    el.style.cssText = 'position:fixed;top:-9999px;left:-9999px;width:794px;background:white;padding:48px;font-family:DM Sans,sans-serif;'
    el.innerHTML = `
      <div style="border-bottom:2px solid #6D28D9;padding-bottom:24px;margin-bottom:24px;display:flex;justify-content:space-between;align-items:flex-start;">
        <div>
          <div style="width:48px;height:48px;background:#EDE9FE;border-radius:10px;display:flex;align-items:center;justify-content:center;margin-bottom:12px;">
            <span style="color:#6D28D9;font-weight:700;font-size:20px;">${profile?.business_name?.[0] || 'B'}</span>
          </div>
          <p style="font-weight:700;font-size:15px;color:##EDE9FE;">${profile?.business_name || 'Business'}</p>
          <p style="font-size:12px;color:#5C6070;margin-top:2px;">${profile?.business_email || ''}</p>
        </div>
        <div style="text-align:right;">
          <p style="font-size:28px;font-weight:700;color:#16A34A;letter-spacing:-0.5px;">RECEIPT</p>
          <p style="font-size:13px;font-weight:600;color:##EDE9FE;margin-top:4px;font-family:DM Mono,monospace;">${receipt.receipt_number}</p>
          <p style="font-size:11px;color:#5C6070;margin-top:8px;">Invoice: ${inv?.invoice_number}</p>
          <p style="font-size:11px;color:#5C6070;">Paid: ${new Date(receipt.paid_at).toLocaleDateString('en-NG')}</p>
        </div>
      </div>
      <div style="margin-bottom:24px;">
        <p style="font-size:10px;font-weight:700;color:#9EA3B0;text-transform:uppercase;letter-spacing:1px;margin-bottom:8px;">Received From</p>
        <p style="font-weight:700;font-size:15px;color:##EDE9FE;">${inv?.client_snapshot?.name || '—'}</p>
        <p style="font-size:12px;color:#5C6070;">${inv?.client_snapshot?.email || ''}</p>
      </div>
      <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
        <thead>
          <tr style="background:#F5F6FA;">
            <th style="text-align:left;padding:10px 12px;font-size:10px;color:#9EA3B0;text-transform:uppercase;letter-spacing:1px;">Description</th>
            <th style="text-align:center;padding:10px 12px;font-size:10px;color:#9EA3B0;text-transform:uppercase;letter-spacing:1px;">Qty</th>
            <th style="text-align:right;padding:10px 12px;font-size:10px;color:#9EA3B0;text-transform:uppercase;letter-spacing:1px;">Amount</th>
          </tr>
        </thead>
        <tbody>
          ${(inv?.items || []).map(item => `
            <tr style="border-bottom:1px solid #F5F6FA;">
              <td style="padding:10px 12px;font-size:13px;color:##EDE9FE;">${item.description}</td>
              <td style="padding:10px 12px;font-size:13px;color:#5C6070;text-align:center;">${item.quantity}</td>
              <td style="padding:10px 12px;font-size:13px;font-weight:600;color:##EDE9FE;text-align:right;font-family:DM Mono,monospace;">${currencySymbol}${fmt(item.total)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      <div style="display:flex;justify-content:flex-end;">
        <div style="width:240px;">
          <div style="display:flex;justify-content:space-between;margin-bottom:8px;">
            <span style="font-size:13px;color:#5C6070;">Subtotal</span>
            <span style="font-size:13px;font-family:DM Mono,monospace;">${currencySymbol}${fmt(inv?.subtotal || 0)}</span>
          </div>
          ${inv?.tax_amount > 0 ? `<div style="display:flex;justify-content:space-between;margin-bottom:8px;">
            <span style="font-size:13px;color:#5C6070;">Tax</span>
            <span style="font-size:13px;font-family:DM Mono,monospace;">${currencySymbol}${fmt(inv?.tax_amount || 0)}</span>
          </div>` : ''}
          <div style="border-top:2px solid ##EDE9FE;padding-top:10px;display:flex;justify-content:space-between;align-items:center;">
            <span style="font-weight:700;font-size:15px;">Total Paid</span>
            <span style="font-weight:700;font-size:22px;color:#16A34A;font-family:DM Mono,monospace;">${currencySymbol}${fmt(inv?.total || 0)}</span>
          </div>
        </div>
      </div>
      <div style="margin-top:32px;padding-top:16px;border-top:1px solid #E4E7EE;display:flex;justify-content:space-between;align-items:center;">
        <div style="display:flex;align-items:center;gap:8px;">
          <div style="width:20px;height:20px;background:#F0FDF4;border-radius:50%;display:flex;align-items:center;justify-content:center;">
            <span style="color:#16A34A;font-size:12px;">✓</span>
          </div>
          <span style="font-size:12px;color:#16A34A;font-weight:600;">Payment Confirmed</span>
        </div>
        <p style="font-size:11px;color:#9EA3B0;">Generated by Billit</p>
      </div>
    `
    document.body.appendChild(el)
    const canvas = await html2canvas(el, { scale: 2, backgroundColor: '#ffffff' })
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
    const imgData = canvas.toDataURL('image/png')
    const pageWidth = pdf.internal.pageSize.getWidth()
    const pageHeight = (canvas.height * pageWidth) / canvas.width
    pdf.addImage(imgData, 'PNG', 0, 0, pageWidth, pageHeight)
    pdf.save(`${receipt.receipt_number}.pdf`)
    document.body.removeChild(el)
    setDownloading(null)
  }

  return (
    <AppLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-ink" style={{ fontFamily: 'Sora, sans-serif' }}>Receipts</h1>
          <p className="text-sm text-ink-secondary mt-0.5">{receipts.length} receipts generated</p>
        </div>
      </div>

      <div className="bg-white border border-[##EDE9FE] rounded-xl overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-sm text-ink-secondary">Loading receipts...</div>
        ) : receipts.length === 0 ? (
          <div className="py-16 text-center">
            <Receipt size={36} className="mx-auto text-ink-muted mb-3" />
            <p className="font-semibold text-ink text-sm">No receipts yet</p>
            <p className="text-xs text-ink-secondary mt-1">
              Receipts are auto-generated when you mark an invoice as paid
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-12 px-6 py-2.5 border-b border-[#E4E7EE] bg-bg">
              {['Receipt #', 'Invoice #', 'Customer', 'Date Paid', 'Amount', ''].map((h, i) => (
                <p key={i} className={`text-[10px] font-bold text-ink-muted tracking-wider ${
                  i === 0 ? 'col-span-2' :
                  i === 1 ? 'col-span-2' :
                  i === 2 ? 'col-span-3' :
                  i === 3 ? 'col-span-2' :
                  i === 4 ? 'col-span-2' :
                  'col-span-1'
                }`}>{h}</p>
              ))}
            </div>
            {receipts.map((rec) => {
              const inv = rec.invoice_snapshot
              const currencySymbol = { NGN: '₦', USD: '$', GBP: '£', EUR: '€', CAD: 'CA$' }[inv?.currency] || '₦'
              return (
                <div
  key={rec.id}
  onClick={() => navigate(`/receipts/${rec.id}`)}
  className="grid grid-cols-12 px-6 py-3.5 border-b border-[#E4E7EE] last:border-0 hover:bg-bg transition-colors items-center cursor-pointer"
>
                  <div className="col-span-2 flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-green-50 flex items-center justify-center shrink-0">
                      <CheckCircle size={12} className="text-green-600" />
                    </div>
                    <p className="text-xs font-bold text-ink" style={{ fontFamily: 'DM Mono, monospace' }}>
                      {rec.receipt_number}
                    </p>
                  </div>
                  <p className="col-span-2 text-xs text-ink-secondary" style={{ fontFamily: 'DM Mono, monospace' }}>
                    {inv?.invoice_number || '—'}
                  </p>
                  <p className="col-span-3 text-xs text-ink truncate">
                    {inv?.client_snapshot?.name || '—'}
                  </p>
                  <p className="col-span-2 text-xs text-ink-secondary">
                    {new Date(rec.paid_at).toLocaleDateString('en-NG')}
                  </p>
                  <p className="col-span-2 text-xs font-bold text-ink" style={{ fontFamily: 'DM Mono, monospace' }}>
                    {currencySymbol}{fmt(inv?.total || 0)}
                  </p>
                  <div className="col-span-1 flex justify-end">
                    <button
                      onClick={() => downloadReceiptPDF(rec)}
                      disabled={downloading === rec.id}
                      className="p-1.5 rounded-lg hover:bg-bg border border-transparent hover:border-[#E4E7EE] transition-all text-ink-secondary hover:text-ink"
                    >
                      <Download size={14} />
                    </button>
                  </div>
                </div>
              )
            })}
          </>
        )}
      </div>
    </AppLayout>
  )
}