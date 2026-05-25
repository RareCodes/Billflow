const fmt = (n) => Number(n).toLocaleString('en-NG', { minimumFractionDigits: 2 })
const getSymbol = (currency) => ({ NGN: '₦', USD: '$', GBP: '£', EUR: '€', CAD: 'CA$' }[currency] || '₦')
const getColor = (profile) => profile?.brand_color || '#6D28D9'

const LogoOrInitial = ({ profile, size = 52, radius = 12 }) => {
  const color = getColor(profile)
  if (profile?.logo_url) {
    return (
      <img
        src={profile.logo_url}
        alt="Logo"
        style={{ width: size, height: size, borderRadius: radius, objectFit: 'cover' }}
      />
    )
  }
  return (
    <div style={{
      width: size, height: size, borderRadius: radius,
      background: color + '22',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <span style={{ fontSize: size * 0.42, fontWeight: 900, color, fontFamily: 'Outfit, sans-serif' }}>
        {profile?.business_name?.[0]?.toUpperCase() || 'B'}
      </span>
    </div>
  )
}

const BankDetails = ({ profile }) => {
  if (!profile?.bank_account_number) return null
  return (
    <div style={{ marginTop: 8 }}>
      <p style={{ fontSize: 10, fontWeight: 800, color: '#9EA3B0', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4, margin: '0 0 4px' }}>
        Payment Details
      </p>
      {profile.bank_name && (
        <p style={{ fontSize: 12, margin: '0 0 1px', color: '#5C6070' }}>
          Bank: <strong style={{ color: '#0F1117' }}>{profile.bank_name}</strong>
        </p>
      )}
      {profile.bank_account_name && (
        <p style={{ fontSize: 12, margin: '0 0 1px', color: '#5C6070' }}>
          Acct Name: <strong style={{ color: '#0F1117' }}>{profile.bank_account_name}</strong>
        </p>
      )}
      {profile.bank_account_number && (
        <p style={{ fontSize: 12, margin: 0, color: '#5C6070' }}>
          Acct No: <strong style={{ color: '#0F1117', fontFamily: 'IBM Plex Mono, monospace' }}>{profile.bank_account_number}</strong>
        </p>
      )}
    </div>
  )
}

// ── TEMPLATE 1 — Classic ─────────────────────────────────────
export function ClassicTemplate({ invoice, profile }) {
  const sym = getSymbol(invoice?.currency)
  const color = getColor(profile)
  return (
    <div style={{ background: 'white', fontFamily: 'Nunito Sans, sans-serif', color: '#0F1117' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '40px 48px 32px', borderBottom: '1px solid #E4E7EE' }}>
        <div>
          <div style={{ marginBottom: 12 }}>
            <LogoOrInitial profile={profile} size={52} radius={12} />
          </div>
          <p style={{ fontWeight: 800, fontSize: 15, margin: '0 0 2px', fontFamily: 'Outfit, sans-serif' }}>{profile?.business_name || 'Your Business'}</p>
          {profile?.business_email && <p style={{ fontSize: 12, color: '#5C6070', margin: '0 0 1px' }}>{profile.business_email}</p>}
          {profile?.business_phone && <p style={{ fontSize: 12, color: '#5C6070', margin: '0 0 1px' }}>{profile.business_phone}</p>}
          {profile?.business_address && <p style={{ fontSize: 12, color: '#5C6070', margin: 0 }}>{profile.business_address}</p>}
        </div>
        <div style={{ textAlign: 'right' }}>
          <p style={{ fontSize: 32, fontWeight: 900, color, fontFamily: 'Outfit, sans-serif', margin: '0 0 6px', letterSpacing: '-0.02em' }}>INVOICE</p>
          <p style={{ fontSize: 13, fontWeight: 700, color: '#0F1117', margin: '0 0 12px', fontFamily: 'IBM Plex Mono, monospace' }}>{invoice?.invoice_number}</p>
          {[
            { label: 'Invoice Date', value: invoice?.issued_date },
            { label: 'Due Date', value: invoice?.due_date || '—' },
            { label: 'Payment', value: invoice?.payment_method },
          ].map(({ label, value }) => (
            <div key={label} style={{ display: 'flex', justifyContent: 'flex-end', gap: 16, marginBottom: 3 }}>
              <span style={{ fontSize: 11, color: '#5C6070' }}>{label}</span>
              <span style={{ fontSize: 11, fontWeight: 600, width: 96, textAlign: 'left' }}>{value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Bill To */}
      <div style={{ padding: '24px 48px', borderBottom: '1px solid #E4E7EE' }}>
        <p style={{ fontSize: 10, fontWeight: 800, color: '#9EA3B0', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>Bill To</p>
        <p style={{ fontWeight: 800, fontSize: 15, margin: '0 0 3px' }}>{invoice?.client_snapshot?.name}</p>
        {invoice?.client_snapshot?.email && <p style={{ fontSize: 12, color: '#5C6070', margin: '0 0 2px' }}>{invoice.client_snapshot.email}</p>}
        {invoice?.client_snapshot?.phone && <p style={{ fontSize: 12, color: '#5C6070', margin: '0 0 2px' }}>{invoice.client_snapshot.phone}</p>}
        {invoice?.client_snapshot?.address && <p style={{ fontSize: 12, color: '#5C6070', margin: 0 }}>{invoice.client_snapshot.address}</p>}
      </div>

      {/* Items */}
      <div style={{ padding: '24px 48px', borderBottom: '1px solid #E4E7EE' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: color + '11' }}>
              {['Item / Description', 'Qty', 'Rate', 'Amount'].map((h, i) => (
                <th key={h} style={{ padding: '10px 12px', fontSize: 10, fontWeight: 800, color: '#9EA3B0', textTransform: 'uppercase', letterSpacing: '0.08em', textAlign: i === 0 ? 'left' : i === 1 ? 'center' : 'right' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {(invoice?.items || []).map((item, i) => (
              <tr key={i} style={{ borderBottom: '1px solid #F0EEF8' }}>
                <td style={{ padding: '12px', fontSize: 13, color: '#0F1117' }}>{item.description}</td>
                <td style={{ padding: '12px', fontSize: 13, color: '#5C6070', textAlign: 'center' }}>{item.quantity}</td>
                <td style={{ padding: '12px', fontSize: 13, color: '#5C6070', textAlign: 'right', fontFamily: 'IBM Plex Mono, monospace' }}>{sym}{fmt(item.unit_price)}</td>
                <td style={{ padding: '12px', fontSize: 13, fontWeight: 700, textAlign: 'right', fontFamily: 'IBM Plex Mono, monospace' }}>{sym}{fmt(item.total)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Totals + Notes */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32, padding: '24px 48px 32px' }}>
        <div>
          {invoice?.notes && (
            <div style={{ marginBottom: 12 }}>
              <p style={{ fontSize: 10, fontWeight: 800, color: '#9EA3B0', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>Notes</p>
              <p style={{ fontSize: 12, color: '#5C6070', lineHeight: 1.6, margin: 0 }}>{invoice.notes}</p>
            </div>
          )}
          <BankDetails profile={profile} />
          <p style={{ fontSize: 11, color: '#9EA3B0', margin: '12px 0 0' }}>Thank you for your business.</p>
        </div>
        <div>
          {[
            { label: 'Subtotal', value: fmt(invoice?.subtotal || 0), show: true },
            { label: `Tax (${invoice?.tax_rate}%)`, value: fmt(invoice?.tax_amount || 0), show: invoice?.tax_rate > 0 },
            { label: 'Discount', value: `− ${sym}${fmt(invoice?.discount || 0)}`, show: invoice?.discount > 0, red: true },
          ].filter(r => r.show).map(({ label, value, red }) => (
            <div key={label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: 13, color: '#5C6070' }}>{label}</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: red ? '#DC2626' : '#0F1117', fontFamily: 'IBM Plex Mono, monospace' }}>{red ? value : `${sym}${value}`}</span>
            </div>
          ))}
          <div style={{ borderTop: `2px solid ${color}`, paddingTop: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
            <span style={{ fontWeight: 800, fontSize: 15 }}>Total</span>
            <span style={{ fontWeight: 900, fontSize: 22, color, fontFamily: 'IBM Plex Mono, monospace' }}>{sym}{fmt(invoice?.total || 0)}</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{ padding: '12px 48px', background: color + '0A', borderTop: '1px solid #E4E7EE', display: 'flex', justifyContent: 'space-between' }}>
        <p style={{ fontSize: 11, color: '#9EA3B0', margin: 0, fontFamily: 'IBM Plex Mono, monospace' }}>{invoice?.invoice_number}</p>
        <p style={{ fontSize: 11, color: '#9EA3B0', margin: 0 }}>Generated by Billit</p>
      </div>
    </div>
  )
}

// ── TEMPLATE 2 — Bold ────────────────────────────────────────
export function BoldTemplate({ invoice, profile }) {
  const sym = getSymbol(invoice?.currency)
  const color = getColor(profile)
  const letters = 'INVOICE'.split('')

  return (
    <div style={{ background: '#FFFFFF', fontFamily: 'Nunito Sans, sans-serif', color: '#1E0A3C', display: 'flex', minHeight: 680 }}>

      {/* Left column */}
      <div style={{ width: 68, flexShrink: 0, borderRight: `1.5px solid ${color}`, display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 24, paddingBottom: 24 }}>
        {/* Logo */}
        <div style={{ marginBottom: 8 }}>
          {profile?.logo_url ? (
            <img src={profile.logo_url} alt="Logo" style={{ width: 40, height: 40, borderRadius: 6, objectFit: 'cover' }} />
          ) : (
            <div style={{ width: 36, height: 36, border: `1.5px solid ${color}`, borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: 15, fontWeight: 900, color, fontFamily: 'Outfit, sans-serif' }}>
                {profile?.business_name?.[0]?.toUpperCase() || 'B'}
              </span>
            </div>
          )}
        </div>

        {/* Business name stacked */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 12 }}>
          {(profile?.business_name || 'BUSINESS').toUpperCase().slice(0, 8).split('').map((ch, i) => (
            <span key={i} style={{ fontSize: 6, fontWeight: 800, color, letterSpacing: '0.05em', lineHeight: 1.5 }}>{ch}</span>
          ))}
        </div>

        <div style={{ flex: 1 }} />

        {/* INVOICE stacked */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0 }}>
          {letters.map((letter, i) => (
            <span key={i} style={{ fontSize: 26, fontWeight: 900, color, fontFamily: 'Outfit, sans-serif', lineHeight: 1.05, display: 'block', letterSpacing: '-0.02em' }}>
              {letter}
            </span>
          ))}
        </div>
      </div>

      {/* Main content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>

        {/* Top meta */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '24px 32px 18px', borderBottom: `1px solid ${color}22` }}>
          <div>
            <p style={{ fontSize: 13, fontWeight: 700, color: '#1E0A3C', margin: '0 0 3px' }}>
              Invoice Number: <span style={{ fontFamily: 'IBM Plex Mono, monospace' }}>{invoice?.invoice_number}</span>
            </p>
            <p style={{ fontSize: 13, fontWeight: 700, color: '#1E0A3C', margin: 0 }}>Date: {invoice?.issued_date}</p>
            {invoice?.due_date && <p style={{ fontSize: 12, color: '#6B5B8A', margin: '5px 0 0' }}>Due: {invoice.due_date}</p>}
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: '#1E0A3C', margin: '0 0 2px' }}>{invoice?.client_snapshot?.name || 'Client Name'}</p>
            {invoice?.client_snapshot?.email && <p style={{ fontSize: 12, color: '#6B5B8A', margin: '0 0 2px' }}>{invoice.client_snapshot.email}</p>}
            {invoice?.client_snapshot?.phone && <p style={{ fontSize: 12, color: '#6B5B8A', margin: '0 0 2px' }}>{invoice.client_snapshot.phone}</p>}
            {invoice?.client_snapshot?.address && <p style={{ fontSize: 12, color: '#6B5B8A', margin: 0 }}>{invoice.client_snapshot.address}</p>}
          </div>
        </div>

        {/* Line items */}
        <div style={{ padding: '0 32px', flex: 1 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: `1.5px solid ${color}` }}>
                {['Description', 'Qty', 'Rate', 'Total'].map((h, i) => (
                  <th key={h} style={{ padding: '11px 6px', fontSize: 10, fontWeight: 800, color: '#1E0A3C', textTransform: 'uppercase', letterSpacing: '0.1em', textAlign: i === 0 ? 'left' : i === 1 ? 'center' : 'right' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(invoice?.items || []).map((item, i) => (
                <tr key={i} style={{ borderBottom: `1px solid ${color}22` }}>
                  <td style={{ padding: '11px 6px', fontSize: 13, fontWeight: 700, color: '#1E0A3C' }}>{item.description}</td>
                  <td style={{ padding: '11px 6px', fontSize: 13, color: '#6B5B8A', textAlign: 'center' }}>{item.quantity}</td>
                  <td style={{ padding: '11px 6px', fontSize: 13, color: '#6B5B8A', textAlign: 'right', fontFamily: 'IBM Plex Mono, monospace' }}>{sym}{fmt(item.unit_price)}</td>
                  <td style={{ padding: '11px 6px', fontSize: 13, fontWeight: 700, color: '#1E0A3C', textAlign: 'right', fontFamily: 'IBM Plex Mono, monospace' }}>{sym}{fmt(item.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div style={{ padding: '14px 32px 10px' }}>
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <div style={{ width: 250 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
                <span style={{ fontSize: 12, color: '#6B5B8A' }}>Subtotal</span>
                <span style={{ fontSize: 12, color: '#1E0A3C', fontFamily: 'IBM Plex Mono, monospace' }}>{sym}{fmt(invoice?.subtotal || 0)}</span>
              </div>
              {invoice?.tax_rate > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
                  <span style={{ fontSize: 12, color: '#6B5B8A' }}>Tax ({invoice.tax_rate}%)</span>
                  <span style={{ fontSize: 12, color: '#1E0A3C', fontFamily: 'IBM Plex Mono, monospace' }}>{sym}{fmt(invoice.tax_amount)}</span>
                </div>
              )}
              {invoice?.discount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
                  <span style={{ fontSize: 12, color: '#6B5B8A' }}>Discount</span>
                  <span style={{ fontSize: 12, color: '#DC2626', fontFamily: 'IBM Plex Mono, monospace' }}>− {sym}{fmt(invoice.discount)}</span>
                </div>
              )}
              <div style={{ borderTop: `1.5px solid ${color}`, marginTop: 6, paddingTop: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 13, fontWeight: 900, color: '#1E0A3C', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Total</span>
                <span style={{ fontSize: 18, fontWeight: 900, color, fontFamily: 'IBM Plex Mono, monospace' }}>{sym}{fmt(invoice?.total || 0)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Payment + due */}
        <div style={{ padding: '2px 32px 10px', textAlign: 'right' }}>
          {invoice?.due_date && <p style={{ fontSize: 11, color: '#6B5B8A', margin: '0 0 2px' }}>Payment due {invoice.due_date}</p>}
          {invoice?.payment_method && <p style={{ fontSize: 12, fontWeight: 700, color: '#1E0A3C', margin: 0 }}>Pay via {invoice.payment_method}</p>}
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', padding: '14px 32px 24px', borderTop: `1px solid ${color}22`, marginTop: 'auto' }}>
          <div>
            <p style={{ fontSize: 12, fontWeight: 700, color: '#1E0A3C', margin: '0 0 2px' }}>{profile?.business_name || 'Your Business'}</p>
            {profile?.business_address && <p style={{ fontSize: 11, color: '#6B5B8A', margin: '0 0 1px' }}>{profile.business_address}</p>}
            {profile?.business_email && <p style={{ fontSize: 11, color: '#6B5B8A', margin: 0 }}>{profile.business_email}</p>}
            <BankDetails profile={profile} />
          </div>
          <div style={{ textAlign: 'right', maxWidth: 220 }}>
            {invoice?.notes && <p style={{ fontSize: 11, color: '#6B5B8A', margin: '0 0 5px', lineHeight: 1.5 }}>{invoice.notes}</p>}
            <p style={{ fontSize: 10, color: '#9EA3B0', margin: 0, fontFamily: 'IBM Plex Mono, monospace' }}>{invoice?.invoice_number} · Billit</p>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── TEMPLATE 3 — Minimal ─────────────────────────────────────
export function MinimalTemplate({ invoice, profile }) {
  const sym = getSymbol(invoice?.currency)
  const color = getColor(profile)
  return (
    <div style={{ background: 'white', fontFamily: 'Nunito Sans, sans-serif', color: '#0F1117', padding: '48px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 40 }}>
        <div>
          <div style={{ marginBottom: 10 }}>
            <LogoOrInitial profile={profile} size={44} radius={8} />
          </div>
          <p style={{ fontWeight: 900, fontSize: 16, margin: '0 0 4px', fontFamily: 'Outfit, sans-serif' }}>{profile?.business_name || 'Your Business'}</p>
          {profile?.business_email && <p style={{ fontSize: 12, color: '#9EA3B0', margin: '0 0 1px' }}>{profile.business_email}</p>}
          {profile?.business_phone && <p style={{ fontSize: 12, color: '#9EA3B0', margin: '0 0 1px' }}>{profile.business_phone}</p>}
          {profile?.business_address && <p style={{ fontSize: 12, color: '#9EA3B0', margin: 0 }}>{profile.business_address}</p>}
        </div>
        <div style={{ textAlign: 'right' }}>
          <p style={{ fontSize: 11, fontWeight: 800, color: '#9EA3B0', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 4px' }}>Invoice</p>
          <p style={{ fontSize: 20, fontWeight: 900, color: '#0F1117', margin: '0 0 16px', fontFamily: 'IBM Plex Mono, monospace' }}>{invoice?.invoice_number}</p>
          <p style={{ fontSize: 12, color: '#9EA3B0', margin: '0 0 2px' }}>Issued: <span style={{ color: '#0F1117', fontWeight: 600 }}>{invoice?.issued_date}</span></p>
          <p style={{ fontSize: 12, color: '#9EA3B0', margin: 0 }}>Due: <span style={{ color: '#0F1117', fontWeight: 600 }}>{invoice?.due_date || '—'}</span></p>
        </div>
      </div>

      {/* Bill To */}
      <div style={{ marginBottom: 32 }}>
        <p style={{ fontSize: 10, fontWeight: 800, color: '#9EA3B0', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>Bill To</p>
        <p style={{ fontWeight: 800, fontSize: 15, margin: '0 0 2px' }}>{invoice?.client_snapshot?.name}</p>
        {invoice?.client_snapshot?.email && <p style={{ fontSize: 12, color: '#9EA3B0', margin: '0 0 1px' }}>{invoice.client_snapshot.email}</p>}
        {invoice?.client_snapshot?.phone && <p style={{ fontSize: 12, color: '#9EA3B0', margin: 0 }}>{invoice.client_snapshot.phone}</p>}
      </div>

      {/* Items */}
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 32 }}>
        <thead>
          <tr style={{ borderBottom: `1px solid ${color}` }}>
            {['Description', 'Qty', 'Rate', 'Amount'].map((h, i) => (
              <th key={h} style={{ padding: '8px 0', fontSize: 10, fontWeight: 800, color: '#9EA3B0', textTransform: 'uppercase', letterSpacing: '0.08em', textAlign: i === 0 ? 'left' : i === 1 ? 'center' : 'right' }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {(invoice?.items || []).map((item, i) => (
            <tr key={i} style={{ borderBottom: '1px solid #F0F0F0' }}>
              <td style={{ padding: '12px 0', fontSize: 13 }}>{item.description}</td>
              <td style={{ padding: '12px 0', fontSize: 13, color: '#9EA3B0', textAlign: 'center' }}>{item.quantity}</td>
              <td style={{ padding: '12px 0', fontSize: 13, color: '#9EA3B0', textAlign: 'right', fontFamily: 'IBM Plex Mono, monospace' }}>{sym}{fmt(item.unit_price)}</td>
              <td style={{ padding: '12px 0', fontSize: 13, fontWeight: 700, textAlign: 'right', fontFamily: 'IBM Plex Mono, monospace' }}>{sym}{fmt(item.total)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Totals */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 32 }}>
        <div style={{ width: 240 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ fontSize: 12, color: '#9EA3B0' }}>Subtotal</span>
            <span style={{ fontSize: 12, fontFamily: 'IBM Plex Mono, monospace' }}>{sym}{fmt(invoice?.subtotal || 0)}</span>
          </div>
          {invoice?.tax_rate > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontSize: 12, color: '#9EA3B0' }}>Tax ({invoice.tax_rate}%)</span>
              <span style={{ fontSize: 12, fontFamily: 'IBM Plex Mono, monospace' }}>{sym}{fmt(invoice.tax_amount)}</span>
            </div>
          )}
          {invoice?.discount > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontSize: 12, color: '#9EA3B0' }}>Discount</span>
              <span style={{ fontSize: 12, color: '#DC2626', fontFamily: 'IBM Plex Mono, monospace' }}>− {sym}{fmt(invoice.discount)}</span>
            </div>
          )}
          <div style={{ borderTop: `1px solid ${color}`, paddingTop: 10, marginTop: 6, display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 14, fontWeight: 800 }}>Total</span>
            <span style={{ fontSize: 20, fontWeight: 900, color, fontFamily: 'IBM Plex Mono, monospace' }}>{sym}{fmt(invoice?.total || 0)}</span>
          </div>
        </div>
      </div>

      {/* Notes + Bank */}
      <div style={{ borderTop: '1px solid #F0F0F0', paddingTop: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 32 }}>
        <div>
          {invoice?.notes && (
            <p style={{ fontSize: 12, color: '#9EA3B0', lineHeight: 1.6, margin: '0 0 8px' }}>{invoice.notes}</p>
          )}
          <BankDetails profile={profile} />
        </div>
        <div style={{ textAlign: 'right' }}>
          <p style={{ fontSize: 10, color: '#CCCCCC', margin: 0, fontFamily: 'IBM Plex Mono, monospace' }}>{invoice?.invoice_number} · Billit</p>
        </div>
      </div>
    </div>
  )
}

// ── TEMPLATE 4 — Creative ────────────────────────────────────
export function CreativeTemplate({ invoice, profile }) {
  const sym = getSymbol(invoice?.currency)
  const color = getColor(profile)
  return (
    <div style={{ background: 'white', fontFamily: 'Nunito Sans, sans-serif', color: '#1E0A3C', overflow: 'hidden', position: 'relative' }}>

      {/* Wave header */}
      <div style={{ position: 'relative', height: 130, overflow: 'hidden' }}>
        <svg viewBox="0 0 800 130" preserveAspectRatio="none" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}>
          <path d="M0 0 L800 0 L800 60 Q600 130 400 80 Q200 30 0 100 Z" fill={color} />
        </svg>

        {/* Logo top left */}
        <div style={{ position: 'absolute', top: 18, left: 36, zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 4 }}>
          {profile?.logo_url ? (
            <img src={profile.logo_url} alt="Logo" style={{ width: 40, height: 40, borderRadius: 8, objectFit: 'cover', border: '1.5px solid rgba(255,255,255,0.5)' }} />
          ) : (
            <div style={{ width: 36, height: 36, borderRadius: 8, background: 'rgba(255,255,255,0.2)', border: '1.5px solid rgba(255,255,255,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: 15, fontWeight: 900, color: 'white', fontFamily: 'Outfit, sans-serif' }}>
                {profile?.business_name?.[0]?.toUpperCase() || 'B'}
              </span>
            </div>
          )}
          <p style={{ fontSize: 8, fontWeight: 800, color: 'rgba(255,255,255,0.85)', textTransform: 'uppercase', letterSpacing: '0.12em', margin: 0 }}>
            {profile?.business_name || 'Business'}
          </p>
        </div>

        {/* Invoice title top right */}
        <div style={{ position: 'absolute', top: 24, right: 36, zIndex: 2 }}>
          <p style={{ fontSize: 38, fontWeight: 900, fontFamily: 'Outfit, sans-serif', color: 'white', margin: 0, letterSpacing: '-0.03em', lineHeight: 1 }}>Invoice</p>
        </div>

        {/* Dot overlay */}
        <div style={{ position: 'absolute', top: 0, right: 0, width: '60%', height: '100%', backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.08) 1px, transparent 1px)', backgroundSize: '16px 16px', zIndex: 1 }} />
      </div>

      {/* Bill To + Invoice meta */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '20px 36px 16px', borderBottom: `1px solid ${color}33` }}>
        <div>
          <p style={{ fontSize: 11, color: '#6B5B8A', margin: '0 0 4px', fontWeight: 500 }}>Invoice to</p>
          <p style={{ fontSize: 16, fontWeight: 900, color: '#1E0A3C', margin: '0 0 4px', fontFamily: 'Outfit, sans-serif' }}>{invoice?.client_snapshot?.name || 'Client Name'}</p>
          {invoice?.client_snapshot?.address && <p style={{ fontSize: 12, color: '#6B5B8A', margin: '0 0 1px' }}>{invoice.client_snapshot.address}</p>}
          {invoice?.client_snapshot?.email && <p style={{ fontSize: 12, color: '#6B5B8A', margin: '0 0 1px' }}>{invoice.client_snapshot.email}</p>}
          {invoice?.client_snapshot?.phone && <p style={{ fontSize: 12, color: '#6B5B8A', margin: 0 }}>{invoice.client_snapshot.phone}</p>}
        </div>
        <div style={{ textAlign: 'right' }}>
          {[
            { label: 'Invoice #', value: invoice?.invoice_number, mono: true },
            { label: 'Date', value: invoice?.issued_date },
            { label: 'Due Date', value: invoice?.due_date },
          ].filter(r => r.value).map(({ label, value, mono }) => (
            <div key={label} style={{ display: 'flex', gap: 20, justifyContent: 'flex-end', marginBottom: 4 }}>
              <span style={{ fontSize: 12, color: '#6B5B8A' }}>{label}</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: '#1E0A3C', minWidth: 80, fontFamily: mono ? 'IBM Plex Mono, monospace' : 'inherit' }}>{value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Line items */}
      <div style={{ padding: '16px 36px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: color }}>
              <th style={{ padding: '10px 12px', fontSize: 10, fontWeight: 800, color: 'white', textTransform: 'uppercase', letterSpacing: '0.08em', textAlign: 'center', width: 36 }}>SL.</th>
              <th style={{ padding: '10px 12px', fontSize: 10, fontWeight: 800, color: 'white', textTransform: 'uppercase', letterSpacing: '0.08em', textAlign: 'left' }}>Item Description</th>
              <th style={{ padding: '10px 12px', fontSize: 10, fontWeight: 800, color: 'white', textTransform: 'uppercase', letterSpacing: '0.08em', textAlign: 'right' }}>Price</th>
              <th style={{ padding: '10px 12px', fontSize: 10, fontWeight: 800, color: 'white', textTransform: 'uppercase', letterSpacing: '0.08em', textAlign: 'center' }}>Qty.</th>
              <th style={{ padding: '10px 12px', fontSize: 10, fontWeight: 800, color: 'white', textTransform: 'uppercase', letterSpacing: '0.08em', textAlign: 'right' }}>Total</th>
            </tr>
          </thead>
          <tbody>
            {(invoice?.items || []).map((item, i) => (
              <tr key={i} style={{ borderBottom: `1px solid ${color}22` }}>
                <td style={{ padding: '11px 12px', fontSize: 12, color: '#6B5B8A', textAlign: 'center' }}>{i + 1}</td>
                <td style={{ padding: '11px 12px', fontSize: 13, color: '#1E0A3C' }}>{item.description}</td>
                <td style={{ padding: '11px 12px', fontSize: 13, color: '#6B5B8A', textAlign: 'right', fontFamily: 'IBM Plex Mono, monospace' }}>{sym}{fmt(item.unit_price)}</td>
                <td style={{ padding: '11px 12px', fontSize: 13, color: '#6B5B8A', textAlign: 'center' }}>{item.quantity}</td>
                <td style={{ padding: '11px 12px', fontSize: 13, fontWeight: 700, color: '#1E0A3C', textAlign: 'right', fontFamily: 'IBM Plex Mono, monospace' }}>{sym}{fmt(item.total)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Payment info + Totals */}
      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '16px 36px 20px', borderTop: `1px solid ${color}22`, gap: 24 }}>
        <div>
          <p style={{ fontSize: 12, fontWeight: 800, color: '#1E0A3C', margin: '0 0 8px' }}>Payment info:</p>
          {invoice?.payment_method && <p style={{ fontSize: 11, color: '#6B5B8A', margin: '0 0 3px' }}>Method: <strong style={{ color: '#1E0A3C' }}>{invoice.payment_method}</strong></p>}
          <BankDetails profile={profile} />
        </div>
        <div style={{ width: 220 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ fontSize: 12, color: '#6B5B8A' }}>Sub Total:</span>
            <span style={{ fontSize: 12, color: '#1E0A3C', fontFamily: 'IBM Plex Mono, monospace' }}>{sym}{fmt(invoice?.subtotal || 0)}</span>
          </div>
          {invoice?.tax_rate > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontSize: 12, color: '#6B5B8A' }}>Tax:</span>
              <span style={{ fontSize: 12, color: '#1E0A3C', fontFamily: 'IBM Plex Mono, monospace' }}>{invoice.tax_rate}% — {sym}{fmt(invoice.tax_amount)}</span>
            </div>
          )}
          {invoice?.discount > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontSize: 12, color: '#6B5B8A' }}>Discount:</span>
              <span style={{ fontSize: 12, color: '#DC2626', fontFamily: 'IBM Plex Mono, monospace' }}>− {sym}{fmt(invoice.discount)}</span>
            </div>
          )}
          <div style={{ borderTop: `1.5px solid ${color}`, paddingTop: 8, marginTop: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 14, fontWeight: 900, color: '#1E0A3C', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total:</span>
            <span style={{ fontSize: 16, fontWeight: 900, color, fontFamily: 'IBM Plex Mono, monospace' }}>{sym}{fmt(invoice?.total || 0)}</span>
          </div>
        </div>
      </div>

      {/* Terms + Sign */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', padding: '12px 36px 28px', borderTop: `1px solid ${color}22` }}>
        <div style={{ maxWidth: 280 }}>
          {invoice?.notes && (
            <>
              <p style={{ fontSize: 12, fontWeight: 800, color: '#1E0A3C', margin: '0 0 4px' }}>Terms <span style={{ color }}>& </span>Conditions</p>
              <p style={{ fontSize: 11, color: '#6B5B8A', lineHeight: 1.6, margin: 0 }}>{invoice.notes}</p>
            </>
          )}
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ borderBottom: '1px solid #1E0A3C', width: 160, marginBottom: 6, marginLeft: 'auto' }} />
          <p style={{ fontSize: 11, color: '#6B5B8A', margin: 0 }}>Authorised Sign</p>
          <p style={{ fontSize: 10, color: '#9EA3B0', margin: '4px 0 0', fontFamily: 'IBM Plex Mono, monospace' }}>{invoice?.invoice_number} · Billit</p>
        </div>
      </div>
    </div>
  )
}