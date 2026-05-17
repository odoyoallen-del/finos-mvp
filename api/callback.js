export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const callbackData = req.body.Body.stkCallback;
    
    // Check if payment was successful
    if (callbackData.ResultCode !== 0) {
      console.log('Payment failed:', callbackData.ResultDesc);
      return res.status(200).json({ ResultCode: 0, ResultDesc: 'Accepted' });
    }

    // Extract Amount, MpesaReceiptNumber, PhoneNumber
    const items = callbackData.CallbackMetadata.Item;
    const getValue = (name) => {
      const item = items.find(i => i.Name === name);
      return item ? item.Value : null;
    };

    const amount = getValue('Amount');
    const receiptNumber = getValue('MpesaReceiptNumber');
    const phoneNumber = getValue('PhoneNumber');

    console.log('Payment Success!');
    console.log('Amount:', amount);
    console.log('Receipt:', receiptNumber);
    console.log('Phone:', phoneNumber);

    // TODO: Save these to your database here
    // await db.payments.create({ amount, receiptNumber, phoneNumber });

    // M-Pesa expects a 200 response quickly
    res.status(200).json({ ResultCode: 0, ResultDesc: 'Accepted' });

  } catch (error) {
    console.error('Callback error:', error);
    res.status(200).json({ ResultCode: 0, ResultDesc: 'Accepted' });
  }
}
