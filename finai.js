document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.getElementById('finaiToggle');
  const bubble = document.getElementById('finaiBubble');
  const close = document.getElementById('closeFinai');
  const body = document.getElementById('finaiBody');
  
  // Toggle open/close
  toggle.addEventListener('click', () => {
    bubble.style.display = bubble.style.display === 'block' ? 'none' : 'block';
  });
  
  close.addEventListener('click', () => {
    bubble.style.display = 'none';
  });
  
  // Add input box
  body.innerHTML += `
    <div class="finai-input">
      <input type="text" id="finaiInput" placeholder="Ask FinAI something...">
      <button id="finaiSend">Send</button>
    </div>
    <div id="finaiResponse"></div>
  `;
  
  document.getElementById('finaiSend').addEventListener('click', handleFinAI);
  document.getElementById('finaiInput').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleFinAI();
  });
});

function handleFinAI() {
  const input = document.getElementById('finaiInput').value.toLowerCase();
  const responseDiv = document.getElementById('finaiResponse');
  
  const wallets = JSON.parse(localStorage.getItem('wallets')) || [];
  const goals = JSON.parse(localStorage.getItem('goals')) || [];
  const transactions = JSON.parse(localStorage.getItem('transactions')) || [];
  
  let response = "I didn’t get that. Try asking about your balance, goals, or spending.";
  
  if (input.includes('balance')) {
    const total = wallets.reduce((sum, w) => sum + w.balance, 0);
    response = `Your total balance across all wallets is KES ${total.toFixed(2)}.`;
  }
  
  if (input.includes('goal')) {
    if (goals.length === 0) {
      response = "You don’t have any goals yet. Add one with + New Goal.";
    } else {
      response = goals.map(g => {
        const pct = ((g.saved / g.target) * 100).toFixed(0);
        return `${g.name}: ${pct}% complete`;
      }).join('<br>');
    }
  }
  
  if (input.includes('spent') || input.includes('spending')) {
    const expenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    response = `You’ve spent KES ${expenses.toFixed(2)} total.`;
  }
  
  responseDiv.innerHTML = response;
  document.getElementById('finaiInput').value = '';
}
