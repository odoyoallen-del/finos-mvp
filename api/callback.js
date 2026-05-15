export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  console.log('M-Pesa Callback:', JSON.stringify(req.body, null, 2));
  
  // Wallet update code goes here once you tell me your database
  
  res.status(200).json({ ResultCode: 0, ResultDesc: "Success" });
}
