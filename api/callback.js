export default async function handler(req, res) {
  // Always respond 200 OK to Daraja immediately
  res.status(200).json({ ResultCode: 0, ResultDesc: "Accepted" });

  try {
    const callbackData = req.body.Body.stkCallback;
    
    if (callbackData.ResultCode !== 0) {
      console.log('Payment failed:', callbackData.ResultDesc);
      return;
    }

    const metadata = callbackData.CallbackMetadata.Item;
    const amount = metadata.find(i => i.Name === 'Amount').Value;
    const mpesaReceipt = metadata.find(i => i.Name === 'MpesaReceiptNumber').Value;
    const phone = metadata.find(i => i.Name === 'PhoneNumber').Value;

    console.log(`Payment success: ${amount} KES from ${phone}, Receipt: ${mpesaReceipt}`);

    // TODO: Update your database here to credit the wallet
    // Example for Firebase: 
    // await db.collection('wallets').doc(phone).update({ balance: increment(amount) });

  } catch (err) {
    console.error('Callback error:', err);
  }
}
