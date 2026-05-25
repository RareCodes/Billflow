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
  try {
    setDownloading(true)

    const element = printRef.current

    const canvas = await html2canvas(element, {
      scale: 3,
      useCORS: true,
      backgroundColor: "#ffffff",
      scrollY: -window.scrollY,
      windowWidth: element.scrollWidth,
      windowHeight: element.scrollHeight,
    })

    const imgData = canvas.toDataURL("image/png")

    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4"
    })

    const pageWidth = pdf.internal.pageSize.getWidth()
    const pageHeight = pdf.internal.pageSize.getHeight()

    const imgWidth = pageWidth

    const imgHeight =
      (canvas.height * imgWidth) /
      canvas.width

    let heightLeft = imgHeight
    let position = 0

    // First page
    pdf.addImage(
      imgData,
      "PNG",
      0,
      position,
      imgWidth,
      imgHeight
    )

    heightLeft -= pageHeight

    // Additional pages if content is long
    while (heightLeft > 0) {
      position = heightLeft - imgHeight

      pdf.addPage()

      pdf.addImage(
        imgData,
        "PNG",
        0,
        position,
        imgWidth,
        imgHeight
      )

      heightLeft -= pageHeight
    }

    pdf.save(
      `${receipt.receipt_number}.pdf`
    )

  } catch (error) {
    console.error(
      "PDF generation failed:",
      error
    )
  } finally {
    setDownloading(false)
  }
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
  <div className="max-w-3xl mx-auto px-4 sm:px-6 py-3">

    <div className="flex flex-row items-center justify-between gap-4">

      {/* Left section */}
      <div className="flex flex-wrap items-center gap-2 sm:gap-4 min-w-0">

        <button
          onClick={() => navigate('/receipts')}
          className="flex items-center gap-1.5 text-sm text-ink-secondary hover:text-ink transition-colors"
        >
          <ArrowLeft size={16} />

          <span className="hidden sm:inline">
            Receipts
          </span>
        </button>

        <span className="hidden sm:block text-[#E4E7EE]">
          |
        </span>

        <span className="text-sm font-semibold text-ink truncate">
          {receipt.receipt_number}
        </span>

        <span className="
          px-2.5
          py-1
          rounded-full
          text-xs
          font-bold
          bg-green-50
          text-green-700
          whitespace-nowrap
        ">
          Paid
        </span>

      </div>


      {/* Right section */}
      <div className="
        flex
        items-center
        gap-2
        overflow-x-auto
        pb-1
      ">

        <button
          onClick={() => window.print()}
          className="
            flex-shrink-0
            flex items-center gap-2
            px-3 py-2
            rounded-lg
            text-sm
            font-semibold
            border border-[#EDE9FE]
            bg-white
            text-ink
            hover:bg-bg
            transition-all
          "
        >
          <Printer size={14} />

          <span className="hidden sm:inline">
            Print
          </span>

        </button>

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
            text-white
            hover:opacity-90
            transition-all
          "
          style={{ background:'#16A34A' }}
        >
          <Download size={14} />

          <span className="hidden sm:inline">
            {downloading
              ? 'Generating...'
              : 'Download PDF'}
          </span>

        </button>

      </div>

    </div>

  </div>
</div>

      {/* Receipt Document */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-5 sm:py-8">
  <div
    ref={printRef}
    className="bg-white border border-[#EDE9FE] rounded-xl overflow-hidden shadow-sm"
  >

    {/* Paid bar */}
    <div
      className="h-2 w-full"
      style={{
        background:
          'linear-gradient(90deg,#16A34A,#22C55E)'
      }}
    />

    {/* Header */}
    <div className="
      grid
      grid-cols-1
      sm:grid-cols-2
      gap-6
      px-4 sm:px-10
      pt-6
      sm:pt-8
      pb-6
      border-b
      border-[#E4E7EE]
    ">

      {/* Business */}
      <div>

        <div className="
          w-12 h-12
          rounded-xl
          bg-green-50
          flex items-center justify-center
          mb-3
        ">
          <span
            className="text-base font-bold text-green-700"
            style={{fontFamily:'Sora,sans-serif'}}
          >
            {profile?.business_name?.[0]?.toUpperCase() || 'B'}
          </span>
        </div>

        <p
          className="font-bold text-ink"
          style={{fontFamily:'Sora,sans-serif'}}
        >
          {profile?.business_name || 'Your Business'}
        </p>

        {profile?.business_email && (
          <p className="text-xs text-ink-secondary mt-1">
            {profile.business_email}
          </p>
        )}

        {profile?.business_address && (
          <p className="text-xs text-ink-secondary mt-1">
            {profile.business_address}
          </p>
        )}

        {profile?.business_phone && (
          <p className="text-xs text-ink-secondary mt-1">
            {profile.business_phone}
          </p>
        )}

      </div>


      {/* Receipt metadata */}
      <div className="sm:text-right">

        <p
          className="
          text-2xl
          sm:text-3xl
          font-bold
          text-green-600
          "
          style={{fontFamily:'Sora,sans-serif'}}
        >
          RECEIPT
        </p>

        <p
          className="text-sm font-bold"
          style={{fontFamily:'DM Mono'}}
        >
          {receipt.receipt_number}
        </p>

        <div className="
          mt-4
          space-y-2
        ">

          <div className="
            flex
            justify-between
            sm:justify-end
            sm:gap-8
            text-xs
          ">
            <span className="text-ink-secondary">
              Date Paid
            </span>

            <span className="font-medium">
              {new Date(receipt.paid_at)
              .toLocaleDateString('en-NG',{
                year:'numeric',
                month:'long',
                day:'numeric'
              })}
            </span>

          </div>


          <div className="
            flex
            justify-between
            sm:justify-end
            sm:gap-8
            text-xs
          ">

            <span className="text-ink-secondary">
              Invoice Ref
            </span>

            <span
              style={{
                fontFamily:'DM Mono'
              }}
            >
              {inv?.invoice_number || '—'}
            </span>

          </div>

        </div>

      </div>

    </div>


    {/* Client */}
    <div className="
      px-4 sm:px-10
      py-5
      border-b
      border-[#E4E7EE]
    ">

      <p className="
        text-[10px]
        font-bold
        uppercase
        tracking-wider
        mb-2
      ">
        Received From
      </p>

      <p className="font-bold">
        {inv?.client_snapshot?.name || '—'}
      </p>

      {inv?.client_snapshot?.email && (
        <p className="text-sm text-ink-secondary">
          {inv.client_snapshot.email}
        </p>
      )}

    </div>


    {/* Responsive table */}
    <div className="
      px-4 sm:px-10
      py-6
      border-b
      border-[#E4E7EE]
      overflow-x-auto
    ">

      <table className="min-w-[300px] w-full">

        <thead>
          <tr className="bg-[#F0FDF4] gap-8">

            <th className="
            text-left
            px-2 py-3
            text-[10px]
            uppercase
            ">
              Description
            </th>

            <th className="
            text-left
            px-0 py-3
            text-[10px]
            uppercase
            ">Qty</th>

            <th className="
            text-left
            pl-8 py-3
            text-[10px]
            uppercase
            ">
              Rate
            </th>

            <th className="
            text-left
            px-0 py-3
            text-[10px]
            uppercase
            ">
              Amount
            </th>

          </tr>
        </thead>

        <tbody>

          {(inv?.items || []).map((item,i)=>(
            <tr
              key={i}
              className="border-b"
            >
              <td className="px-2 py-3 text-sm">
                {item.description}
              </td>

              <td className="text-left text-sm">
                {item.quantity}
              </td>

              <td className="text-left pl-8 text-sm">
                {currencySymbol}
                {fmt(item.unit_price)}
              </td>

              <td className="
                text-left
                text-sm
              ">
                {currencySymbol}
                {fmt(item.total)}
              </td>

            </tr>
          ))}

        </tbody>
      </table>

    </div>


    {/* Totals */}
    <div className="
      grid
      grid-cols-1
      sm:grid-cols-2
      gap-8
      px-4 sm:px-10
      py-6 sm:py-8
    ">

      <div>
        {inv?.notes && (
          <>
            <p className="
            text-[10px]
            uppercase
            font-bold
            mb-2
            ">
              Notes
            </p>

            <p className="
            text-sm
            text-ink-secondary
            ">
              {inv.notes}
            </p>
          </>
        )}
      </div>


      <div className="space-y-2">

        <div className="
          border-t-2
          border-[#16A34A]
          pt-3
          flex
          justify-between
        ">
          <span className="font-bold">
            Total Paid
          </span>

          <span className="
          text-xl
          sm:text-2xl
          font-bold
          text-green-600
          ">
            {currencySymbol}
            {fmt(inv?.total || 0)}
          </span>

        </div>

      </div>

    </div>


    {/* Footer */}
    <div className="
      px-4 sm:px-10
      py-4
      bg-green-50
      border-t
      border-[#E4E7EE]

      flex
      flex-col
      sm:flex-row
      gap-2
      sm:justify-between
    ">

      <p className="
      text-xs
      text-green-700
      ">
        Thank you for your payment.
      </p>

      <p className="text-xs">
        Generated by Billit
      </p>

    </div>

  </div>
</div>
    </div>
  )
}