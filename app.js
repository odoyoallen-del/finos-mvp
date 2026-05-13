console.log('FINOS initializing...');

// Load data from localStorage or start with empty arrays
let wallets = JSON.parse(localStorage.getItem('wallets')) || [];
let goals = JSON.parse(localStorage.getItem('goals')) || [];
let transactions = JSON.parse(localStorage.getItem('transactions')) || [];

// DOM elements
const addWalletBtn = document.getElementById('addWalletBtn');
const addGoalBtn = document.getElementById('addGoalBtn');
const transactionModal = document.getElementById('transactionModal');
const closeModal = document.getElementById('closeModal');
const transactionForm = document.getElementById('transactionForm');

// Init
document.addEventListener('DOMContentLoaded', () => {
  init();
});

function init() {
  renderAll();
  setupEventListeners();
}

function setupEventListeners() {
  if (addWalletBtn) {
    addWalletBtn.addEventListener('click', addWallet);
  }
  if (addGoalBtn) {
    addGoalBtn.addEventListener('click', addGoal);
  }
  if (closeModal) {
    closeModal.addEventListener('click', () => {
      transactionModal.style.display = 'none';
    });
  }
  if (transactionForm) {
    transactionForm.addEventListener('submit', handleTransaction);
  }
}

// Wallets
function addWallet() {
  const name = prompt('Wallet name:');
  if (!name) return;
  
  wallets.push({
    id: Date.now(),
    name: name,
    balance: 0
  });
  saveData();
  renderAll();
}

function renderWallets() {
  const container = document.getElementById('walletsContainer');
  if (!container) return;
  
  container.innerHTML = '';
  wallets.map(wallet => {
    container.innerHTML += `
      <div class="wallet-card">
        <h3>${wallet.name}</h3>
        <p>KES ${wallet.balance.toFixed(2)}</p>
        <button onclick="openTransactionModal(${wallet.id})">+ Transaction</button>
      </div>
    `;
  });
}

// Goals
function addGoal() {
  const name = prompt('Goal name:');
  if (!name) return;
  
  const amount = prompt('Target amount (KES):');
  if (!amount) return;
  
  goals.push({
    id: Date.now(),
    name: name,
    target: parseFloat(amount),
    saved: 0
  });
  saveData();
  renderAll();
}

function renderGoals() {
  const container = document.getElementById('goalsContainer');
  if (!container) return;
  
  container.innerHTML = '';
  goals.map(goal => {
    const progress = (goal.saved / goal.target) * 100;
    container.innerHTML += `
      <div class="goal-card">
        <h3>${goal.name}</h3>
        <p>KES ${goal.saved} / KES ${goal.target}</p>
        <div class="progress-bar" style="width: ${progress}%"></div>
      </div>
    `;
  });
}

// Transactions
function openTransactionModal(walletId) {
  transactionModal.style.display = 'block';
  document.getElementById('txWallet').value = walletId;
}

function handleTransaction(e) {
  e.preventDefault();
  
  const type = document.getElementById('txType').value;
  const amount = parseFloat(document.getElementById('txAmount').value);
  const walletId = parseInt(document.getElementById('txWallet').value);
  const category = document.getElementById('txCategory').value;
  
  const wallet = wallets.find(w => w.id === walletId);
  if (!wallet) return;
  
  if (type === 'expense') {
    wallet.balance -= amount;
  } else {
    wallet.balance += amount;
  }
  
  transactions.push({
    id: Date.now(),
    walletId,
    type,
    amount,
    category,
    date: new Date().toISOString()
  });
  
  saveData();
  renderAll();
  transactionModal.style.display = 'none';
  transactionForm.reset();
}

// Utility
function renderAll() {
  renderWallets();
  renderGoals();
  populateWalletSelect();
}

function populateWalletSelect() {
  const select = document.getElementById('txWallet');
  if (!select) return;
  
  select.innerHTML = '';
  wallets.map(wallet => {
    select.innerHTML += `<option value="${wallet.id}">${wallet.name}</option>`;
  });
}

function saveData() {
  localStorage.setItem('wallets', JSON.stringify(wallets));
  localStorage.setItem('goals', JSON.stringify(goals));
  localStorage.setItem('transactions', JSON.stringify(transactions));
}
