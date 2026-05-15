// app.js - Finos M-Pesa Topup

// Wait for DOM to load before attaching events
document.addEventListener('DOMContentLoaded', () => {
  const btn = document.getElementById('topup-btn');
  if (btn) {
    btn.addEventListener('click', handleTopUp);
  }
});

// Handle topup button click
async function handleTopUp() {
  const phoneInput = document.getElementById('phone');
  const amountInput = document.getElementById('amount');
  
  const phone = phoneInput.value.trim();
  const amount = amountInput.value.trim();
  
  // Basic validation
  if (!phone || !amount) {
    showMessage('Please enter phone number and amount', 'error');
    return;
  }
  
  if (!phone.startsWith('254')) {
    showMessage('Phone must start with 254. Example: 254708374149', 'error');
    return;
  }
  
  if (parseInt(amount) < 1) {
    showMessage('Amount must be at least 1', 'error');
    return;
  }
  
  showMessage('Initiating M-Pesa payment...', 'info');
  await topUp(phone, parseInt(amount));
}

// Call backend STK Push endpoint
async function topUp(phone, amount) {
  try {
    const res = await fetch('/api/stkpush', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, amount })
    });
    
    const data = await res.json();
    console.log('STK Response:', data);
    
    if (data.ResponseCode === '0') {
      showMessage('Check your phone for M-Pesa prompt. Enter PIN to pay.', 'success');
    } else {
      showMessage('Error: ' + (data.errorMessage || data.ResponseDescription || 'Request failed'), 'error');
    }
  } catch (err) {
    console.error('TopUp Error:', err);
    showMessage('Network error. Check console for details.', 'error');
  }
}

// Simple message display function
function showMessage(msg, type) {
  let msgBox = document.getElementById('message-box');
  
  // Create message box if it doesn't exist
  if (!msgBox) {
    msgBox = document.createElement('div');
    msgBox.id = 'message-box';
    msgBox.style.padding = '12px';
    msgBox.style.marginTop = '10px';
    msgBox.style.borderRadius = '6px';
    msgBox.style.fontWeight = '500';
    document.body.appendChild(msgBox);
  }
  
  msgBox.textContent = msg;
  
  // Set color based on type
  if (type === 'success') {
