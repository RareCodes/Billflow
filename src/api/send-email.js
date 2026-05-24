module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') return res.status(200).json({ ok: true })
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const RESEND_API_KEY = process.env.RESEND_API_KEY
  if (!RESEND_API_KEY) return res.status(500).json({ error: 'Resend API key not configured' })

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body

    if (!body) return res.status(400).json({ error: 'Empty request body' })

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    const text = await response.text()

    let data
    try {
      data = JSON.parse(text)
    } catch {
      data = { raw: text }
    }

    if (!response.ok) {
      return res.status(response.status).json({ error: data?.message || data?.raw || 'Resend API error' })
    }

    return res.status(200).json(data)

  } catch (error) {
    return res.status(500).json({ error: error.message || 'Internal server error' })
  }
}