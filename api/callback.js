import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const callbackData = req.body.Body.stkCallback;
    
    if (callbackData.ResultCode !== 0) {
      console.log('Payment failed:', callbackData.ResultDesc);
      return res.status(200).json({ ResultCode: 0, ResultDesc: 'Accepted' });
    }

    const items = callbackData.CallbackMetadata.Item;
    const getValue = (name) => {
      const item = items.find(i => i.Name === name);
      return item ? item.Value : null;
    };

    const amount = getValue('Amount');
    const receiptNumber = getValue('MpesaReceiptNumber');
    const phoneNumber = getValue('PhoneNumber');
    const transactionDate = getValue('TransactionDate');

    console.log('Payment Success:', { amount, receiptNumber, phoneNumber });

    // Save to Postgres
    await sql`
      INSERT INTO payments (phone_number, amount, receipt_number, transaction_date, status)
      VALUES (${phoneNumber}, ${amount}, ${receiptNumber}, ${transactionDate}, 'success')
      ON CONFLICT (receipt_number) DO NOTHING;
    `;

    // Respond to M-Pesa within 5s
    res.status(200).json({ ResultCode: 0, ResultDesc: 'Accepted' });

  } catch (error) {
    console.error('Callback error:', error);
    res.status(200).json({ ResultCode: 0, ResultDesc: 'Accepted' });
  }
}
