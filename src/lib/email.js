const RESEND_API_KEY = import.meta.env.VITE_RESEND_API_KEY

export async function sendInvoiceEmail({ invoice, profile, pdfBase64 }) {
  const clientEmail = invoice.client_snapshot?.email
  if (!clientEmail) throw new Error('Client has no email address')

  const currencySymbol = { NGN: '₦', USD: '$', GBP: '£', EUR: '€', CAD: 'CA$' }[invoice.currency] || '₦'
  const fmt = (n) => Number(n).toLocaleString('en-NG', { minimumFractionDigits: 2 })

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <title>Invoice ${invoice.invoice_number}</title>
    </head>
    <body style="margin:0;padding:0;background:#F5F6FA;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
      <div style="max-width:600px;margin:40px auto;background:white;border-radius:12px;overflow:hidden;border:1px solid #E4E7EE;">
        
        <!-- Header -->
        <div style="background:#1B4FFF;padding:32px 40px;">
          <h1 style="margin:0;color:white;font-size:24px;font-weight:700;letter-spacing:-0.5px;">
            BillFlow
          </h1>
          <p style="margin:8px 0 0;color:rgba(255,255,255,0.8);font-size:14px;">
            Invoice from ${profile?.business_name || 'Your Business'}
          </p>
        </div>

        <!-- Body -->
        <div style="padding:40px;">
          <p style="margin:0 0 8px;font-size:15px;color:#0F1117;font-weight:600;">
            Hi ${invoice.client_snapshot?.name || 'there'},
          </p>
          <p style="margin:0 0 24px;font-size:14px;color:#5C6070;line-height:1.6;">
            Please find your invoice from <strong>${profile?.business_name || 'us'}</strong> attached to this email. 
            Here's a summary:
          </p>

          <!-- Invoice Summary Card -->
          <div style="background:#F5F6FA;border-radius:8px;padding:24px;margin-bottom:24px;">
            <div style="display:flex;justify-content:space-between;margin-bottom:12px;">
              <span style="font-size:12px;color:#9EA3B0;text-transform:uppercase;letter-spacing:0.05em;font-weight:700;">Invoice Number</span>
              <span style="font-size:13px;color:#0F1117;font-weight:600;font-family:monospace;">${invoice.invoice_number}</span>
            </div>
            <div style="display:flex;justify-content:space-between;margin-bottom:12px;">
              <span style="font-size:12px;color:#9EA3B0;text-transform:uppercase;letter-spacing:0.05em;font-weight:700;">Invoice Date</span>
              <span style="font-size:13px;color:#0F1117;">${invoice.issued_date}</span>
            </div>
            <div style="display:flex;justify-content:space-between;margin-bottom:12px;">
              <span style="font-size:12px;color:#9EA3B0;text-transform:uppercase;letter-spacing:0.05em;font-weight:700;">Due Date</span>
              <span style="font-size:13px;color:#0F1117;">${invoice.due_date || 'On receipt'}</span>
            </div>
            <div style="display:flex;justify-content:space-between;margin-bottom:12px;">
              <span style="font-size:12px;color:#9EA3B0;text-transform:uppercase;letter-spacing:0.05em;font-weight:700;">Payment Method</span>
              <span style="font-size:13px;color:#0F1117;">${invoice.payment_method || '—'}</span>
            </div>
            <div style="border-top:2px solid #E4E7EE;margin-top:16px;padding-top:16px;display:flex;justify-content:space-between;align-items:center;">
              <span style="font-size:14px;color:#0F1117;font-weight:700;">Total Amount</span>
              <span style="font-size:22px;color:#1B4FFF;font-weight:700;font-family:monospace;">${currencySymbol}${fmt(invoice.total)}</span>
            </div>
          </div>

          <!-- Items -->
          <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
            <thead>
              <tr style="background:#F5F6FA;">
                <th style="text-align:left;padding:10px 12px;font-size:11px;color:#9EA3B0;text-transform:uppercase;letter-spacing:0.05em;">Description</th>
                <th style="text-align:center;padding:10px 12px;font-size:11px;color:#9EA3B0;text-transform:uppercase;letter-spacing:0.05em;">Qty</th>
                <th style="text-align:right;padding:10px 12px;font-size:11px;color:#9EA3B0;text-transform:uppercase;letter-spacing:0.05em;">Amount</th>
              </tr>
            </thead>
            <tbody>
              ${(invoice.items || []).map(item => `
                <tr style="border-bottom:1px solid #F5F6FA;">
                  <td style="padding:10px 12px;font-size:13px;color:#0F1117;">${item.description}</td>
                  <td style="padding:10px 12px;font-size:13px;color:#5C6070;text-align:center;">${item.quantity}</td>
                  <td style="padding:10px 12px;font-size:13px;font-weight:600;color:#0F1117;text-align:right;font-family:monospace;">${currencySymbol}${fmt(item.total)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          ${invoice.notes ? `
          <div style="background:#EEF2FF;border-radius:8px;padding:16px;margin-bottom:24px;">
            <p style="margin:0 0 4px;font-size:11px;font-weight:700;color:#1B4FFF;text-transform:uppercase;letter-spacing:0.05em;">Notes</p>
            <p style="margin:0;font-size:13px;color:#5C6070;line-height:1.6;">${invoice.notes}</p>
          </div>
          ` : ''}

          <p style="margin:0;font-size:13px;color:#5C6070;line-height:1.6;">
            If you have any questions about this invoice, please don't hesitate to reach out.
          </p>
        </div>

        <!-- Footer -->
        <div style="background:#F5F6FA;padding:24px 40px;border-top:1px solid #E4E7EE;">
          <p style="margin:0;font-size:12px;color:#9EA3B0;text-align:center;">
            Sent by <strong>${profile?.business_name || 'BillFlow'}</strong> via BillFlow
            ${profile?.business_email ? `· <a href="mailto:${profile.business_email}" style="color:#1B4FFF;text-decoration:none;">${profile.business_email}</a>` : ''}
          </p>
        </div>
      </div>
    </body>
    </html>
  `

  const payload = {
    from: 'BillFlow <onboarding@resend.dev>',
    to: [clientEmail],
    subject: `Invoice ${invoice.invoice_number} from ${profile?.business_name || 'BillFlow'} — ${currencySymbol}${fmt(invoice.total)}`,
    html,
  }

  if (pdfBase64) {
    payload.attachments = [{
      filename: `${invoice.invoice_number}.pdf`,
      content: pdfBase64,
    }]
  }

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  const data = await response.json()
  if (!response.ok) throw new Error(data.message || 'Failed to send email')
  return data
}