const FINOS = {
    data: {
        wallets: [],
        transactions: [],
        goals: [],
        limits: { daily: 5000, weekly: 20000, monthly: 50000 }
    },

    init() {
        this.loadData();
        this.renderAll();
        this.initChart();
        this.bindEvents();
        FinAI.show("Welcome back! Ready to crush your financial goals today?");
    },

    loadData() {
        const saved = localStorage.getItem('finos-data');
        if (saved) this.data = JSON.parse(saved);
        if (this.data.wallets.length === 0) this.createDefaults();
    },

    saveData() {
        localStorage.setItem('finos-data', JSON.stringify(this.data));
        this.updateNetWorth();
    },

    createDefaults() {
        this.data.wallets = [
            { id: 1, name: 'Daily Wallet', balance: 0, color: '#3b82f6', icon: '💳' },
            { id: 2, name: 'Emergency Fund', balance: 0, color: '#ef4444', icon: '🚨' },
            { id: 3, name: 'Savings', balance: 0, color: '#10b981', icon: '🏦' }
        ];
        this.data.goals = [
            { id: 1, name: 'Dubai Trip', target: 150000, current: 0, deadline: '2026-12-01', icon: '✈️' }
        ];
        this.saveData();
    },

    renderAll() {
        this.renderWallets();
        this.renderLimits();
        this.renderGoals();
        this.updateNetWorth();
    },

    renderWallets() {
        const grid = document.getElementById('walletsGrid');
        grid.innerHTML = this.data.wallets.map(w => `
            <div class="wallet-card" style="background: linear-gradient(135deg, ${w.color}20, ${w.color}10); border: 1px solid ${w.color}40;">
                <div class="wallet-header">
                    <span class="wallet-icon">${w.icon}</span>
                    <h4>${w.name}</h4>
                </div>
                <div class="wallet-balance">KES ${w.balance.toLocaleString()}</div>
                <button class="btn-small" onclick="FINOS.openTransactionModal(${w.id})">+ Transaction</button>
            </div>
        `).join('');
    },

    renderGoals() {
        const grid = document.getElementById('goalsGrid');
        grid.innerHTML = this.data.goals.map(g => {
            const percent = (g.current / g.target) * 100;
            return `
            <div class="goal-card">
                <div class="goal-header">
                    <span>${g.icon} ${g.name}</span>
                    <span>${percent.toFixed(0)}%</span>
                </div>
                <div class="goal-progress">
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${Math.min(percent, 100)}%; background: #10b981"></div>
                    </div>
                </div>
                <div class="limit-header">
                    <span>KES ${g.current.toLocaleString()}</span>
                    <span>KES ${g.target.toLocaleString()}</span>
                </div>
            </div>
        `}).join('');
    },

    renderLimits() {
        const container = document.getElementById('limitsContainer');
        const spent = this.getSpentAmount('daily');
        const percent = (spent / this.data.limits.daily) * 100;
        container.innerHTML = `
            <div class="limit-card">
                <div class="limit-header">
                    <span>Daily Spending</span>
                    <span>KES ${spent} / ${this.data.limits.daily}</span>
                </div>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${Math.min(percent, 100)}%; background: ${percent > 80 ? '#ef4444' : '#3b82f6'}"></div>
                </div>
            </div>
        `;
    },

    getSpentAmount(period) {
        return this.data.transactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + t.amount, 0);
    },

    updateNetWorth() {
        const total = this.data.wallets.reduce((sum, w) => sum + w.balance, 0);
        document.getElementById('netWorth').textContent = `KES ${total.toLocaleString()}`;
    },

    openTransactionModal(walletId = null) {
        const modal = document.getElementById('transactionModal');
        const walletSelect = document.getElementById('txWallet');
        walletSelect.innerHTML = this.data.wallets.map(w => 
            `<option value="${w.id}" ${w.id === walletId ? 'selected' : ''}>${w.name}</option>`
        ).join('');
        modal.classList.add('active');
    },

    closeTransactionModal() {
        document.getElementById('transactionModal').classList.remove('active');
        document.getElementById('transactionForm').reset();
    },

    saveTransaction(e) {
        e.preventDefault();
        const type = document.getElementById('txType').value;
        const amount = parseFloat(document.getElementById('txAmount').value);
        const walletId = parseInt(document.getElementById('txWallet').value);
        const category = document.getElementById('txCategory').value;
        
        const wallet = this.data.wallets.find(w => w.id === walletId);
        if (type === 'expense' && wallet.balance < amount) {
            FinAI.show(`Not enough in ${wallet.name}. Balance: KES ${wallet.balance}`);
            return;
        }
        
        wallet.balance += type === 'income' ? amount : -amount;
        this.data.transactions.push({
            id: Date.now(), type, amount, walletId, category, date: new Date().toISOString()
        });
        
        this.saveData();
        this.renderAll();
        this.closeTransactionModal();
        FinAI.show(`${type === 'income' ? 'Added' : 'Spent'} KES ${amount} for ${category}. New balance: KES ${wallet.balance}`);
    },

    addNewWallet() {
        const name = prompt('Wallet name: e.g. School Fees, Business');
        if (!name) return;
        this.data.wallets.push({
            id: Date.now(), name, balance: 0, color: '#8b5cf6', icon: '💼'
        });
        this.saveData();
        this.renderWallets();
        FinAI.show(`Created ${name} wallet. You can now add transactions to it.`);
    },

    addNewGoal() {
        const name = prompt('Goal name: e.g. New Car, Home Deposit');
        const target = parseFloat(prompt('Target amount KES:'));
        if (!name || !target) return;
        this.data.goals.push({
            id: Date.now(), name, target, current: 0, deadline: '2026-12-31', icon: '🎯'
        });
        this.saveData();
        this.renderGoals();
        FinAI.show(`New goal set: ${name} for KES ${target.toLocaleString()}. Let’s start saving!`);
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
        document.getElementById('addGoalBtn').onclick = () => this.addNewGoal();
        document.getElementById('closeModal').onclick = () => this.closeTransactionModal();
        document.getElementById('transactionForm').onsubmit = (e) => this.saveTransaction(e);
    }
};

document.addEventListener('DOMContentLoaded', () => FINOS.init());
