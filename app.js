// FINOS Core Logic
const FINOS = {
    data: {
        wallets: [],
        transactions: [],
        limits: { daily: 5000, weekly: 20000, monthly: 50000 }
    },

    init() {
        this.loadData();
        this.renderWallets();
        this.renderLimits();
        this.updateNetWorth();
        this.initChart();
        this.bindEvents();
        FinAI.show("Welcome to FINOS! Click '+ New Wallet' to create your Daily Wallet.");
    },

    loadData() {
        const saved = localStorage.getItem('finos-data');
        if (saved) this.data = JSON.parse(saved);
        if (this.data.wallets.length === 0) this.createDefaultWallets();
    },

    saveData() {
        localStorage.setItem('finos-data', JSON.stringify(this.data));
        this.updateNetWorth();
    },

    createDefaultWallets() {
        this.data.wallets = [
            { id: 1, name: 'Daily Wallet', balance: 0, color: '#3b82f6', icon: '💳' },
            { id: 2, name: 'Emergency Fund', balance: 0, color: '#ef4444', icon: '🚨' },
            { id: 3, name: 'Savings', balance: 0, color: '#10b981', icon: '🏦' }
        ];
        this.saveData();
    },

    renderWallets() {
        const grid = document.getElementById('walletsGrid');
        grid.innerHTML = this.data.wallets.map(wallet => `
            <div class="wallet-card" style="background: linear-gradient(135deg, ${wallet.color}20, ${wallet.color}10); border: 1px solid ${wallet.color}40;">
                <div class="wallet-header">
                    <span class="wallet-icon">${wallet.icon}</span>
                    <h4>${wallet.name}</h4>
                </div>
                <div class="wallet-balance">KES ${wallet.balance.toLocaleString()}</div>
                <button class="btn-small" onclick="FINOS.addTransaction(${wallet.id})">+ Add Money</button>
            </div>
        `).join('');
    },

    renderLimits() {
        const container = document.getElementById('limitsContainer');
        const spent = this.getSpentAmount('daily');
        const percent = (spent / this.data.limits.daily) * 100;
        
        container.innerHTML = `
            <div class="limit-card">
                <div class="limit-header">
                    <span>Daily Limit</span>
                    <span>KES ${spent} / ${this.data.limits.daily}</span>
                </div>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${Math.min(percent, 100)}%; background: ${percent > 80 ? '#ef4444' : '#3b82f6'}"></div>
                </div>
            </div>
        `;
    },

    getSpentAmount(period) {
        // Simplified: sum of all expenses today
        return this.data.transactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + t.amount, 0);
    },

    updateNetWorth() {
        const total = this.data.wallets.reduce((sum, w) => sum + w.balance, 0);
        document.getElementById('netWorth').textContent = `KES ${total.toLocaleString()}`;
    },

    addTransaction(walletId) {
        const amount = parseFloat(prompt('Enter amount to add:'));
        if (!amount || amount <= 0) return;
        
        const wallet = this.data.wallets.find(w => w.id === walletId);
        wallet.balance += amount;
        this.data.transactions.push({
            id: Date.now(),
            walletId,
            amount,
            type: 'income',
            date: new Date().toISOString()
        });
        this.saveData();
        this.renderWallets();
        this.renderLimits();
        FinAI.show(`Added KES ${amount} to ${wallet.name}. Your new balance is KES ${wallet.balance}.`);
    },

    addNewWallet() {
        const name = prompt('Wallet name: e.g. School Fees, Business');
        if (!name) return;
        const newWallet = {
            id: Date.now(),
            name,
            balance: 0,
            color: '#8b5cf6',
            icon: '💼'
        };
        this.data.wallets.push(newWallet);
        this.saveData();
        this.renderWallets();
        FinAI.show(`Created ${name} wallet. You can now add money to it.`);
    },

    initChart() {
        const ctx = document.getElementById('netWorthChart');
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                datasets: [{
                    data: [0, 0, 0, 0, 0, 0, this.data.wallets.reduce((s, w) => s + w.balance, 0)],
                    borderColor: '#fff',
                    borderWidth: 2,
                    tension: 0.4,
                    fill: false
                }]
            },
            options: {
                plugins: { legend: { display: false } },
                scales: { x: { display: false }, y: { display: false } }
            }
        });
    },

    bindEvents() {
        document.getElementById('addWalletBtn').onclick = () => this.addNewWallet();
    }
};

// Start FINOS when page loads
document.addEventListener('DOMContentLoaded', () => FINOS.init());
