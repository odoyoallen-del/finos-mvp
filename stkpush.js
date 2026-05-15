export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { phone, amount } = req.body;
  
  const consumerKey = process.env.DARAJA_KEY;
  const consumerSecret = process.env.DARAJA_SECRET;
  const shortcode = process.env.DARAJA_SHORTCODE;
  const passkey = process.env.DARAJA_PASSKEY;
  
  const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64');
  
  try {
    // Get OAuth token
    const tokenRes = await fetch('https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials', {
      headers: { 'Authorization': `Basic ${auth}` }
    });
    const tokenData = await tokenRes.json();
    
    // Generate timestamp and password
    const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, 14);
    const password = Buffer.from(shortcode + passkey + timestamp).toString('base64');
    
    // STK Push request
    const stkRes = await fetch('https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        BusinessShortCode: shortcode,
        Password: password,
        Timestamp: timestamp,
        TransactionType: 'CustomerPayBillOnline',
        Amount: amount,
        PartyA: phone,
        PartyB: shortcode,
        PhoneNumber: phone,
        CallBackURL: 'https://your-vercel-url.vercel.app/api/callback',
        AccountReference: 'Finos',
        TransactionDesc: 'Wallet Topup'
      })
    });
    
    const stkData = await stkRes.json();
    res.json(stkData);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
