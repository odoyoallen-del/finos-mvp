const FINOS = {
    data: {
        wallets: [],
        transactions: [],
        goals: [],
        limits: { daily: 5000, weekly: 20000, monthly: 50000 }
    },

    init() {
        console.log('FINOS initializing...');
        this.loadData();
        this.renderAll();
        this.initChart();
        this.bindEvents();
        setTimeout(() => FinAI.show("Welcome to FINOS! Click '+ New Wallet' to get started."), 1000);
    },

    loadData() {
        const saved = localStorage.getItem('finos-data');
        if (saved) {
            try {
                this.data = JSON.parse(saved);
            } catch(e) {
                console.error('Failed to load data', e);
                this.createDefaults();
            }
        }
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
        this.renderCategoryBreakdown();
        this.updateNetWorth();
    },

    renderWallets() {
        const grid = document.getElementById('walletsGrid');
        if (!grid) return;
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
        if (!grid) return;
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
        if (!container) return;
        const spent = this.getSpentAmount('daily');
        const percent = (spent / this.data.limits.daily) * 100;
        container.innerHTML = `
            <div class="limit-card">
                <div class="limit-header">
                    <span>Daily Spending</span>
                    <span>KES ${spent} / ${this.data.limits.daily}</span>
                </div>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${Math.min(percent, 100)}%; background: ${percent > 80? '#ef4444' : '#3b82f6'}"></div>
                </div>
            </div>
        `;
    },

    renderCategoryBreakdown() {
        const expenses = this.data.transactions.filter(t => t.type === 'expense');
        if (expenses.length === 0) return;

        const categories = {};
        expenses.forEach(t => {
            categories[t.category] = (categories[t.category] || 0) + t.amount;
        });

        const totalSpent = Object.values(categories).reduce((a,b) => a+b, 0);
        if (totalSpent === 0) return;

        const topCategory = Object.keys(categories).reduce((a,b) => categories[a] > categories[b]? a : b);

        if (categories[topCategory] / totalSpent > 0.4) {
            FinAI.show(`📊 Insight: ${Math.round(categories[topCategory]/totalSpent*100)}% of spending is on "${topCategory}". Consider setting a limit for it.`, 'warn');
        }
    },

    autoSweep() {
        const daily = this.data.wallets.find(w => w.name === 'Daily Wallet');
        const savings = this.data.wallets.find(w => w.name === 'Savings');
        if (daily && savings && daily.balance > this.data.limits.daily) {
            const excess = daily.balance - this.data.limits.daily;
            daily.balance -= excess;
            savings.balance += excess;
            this.data.transactions.push({
                id: Date.now(), type: 'transfer', amount: excess,
                walletId: savings.id, category: 'Auto-Sweep', date: new Date().toISOString()
            });
            FinAI.show(`🔄 Auto-Sweep: Moved KES ${excess} from Daily Wallet to Savings. Daily Wallet capped at your limit.`, 'success');
            this.renderAll();
        }
    },

    getSpentAmount(period) {
        const today = new Date().toDateString();
        return this.data.transactions
            .filter(t => t.type === 'expense' && new Date(t.date).toDateString() === today)
            .reduce((sum, t) => sum + t.amount, 0);
    },

    updateNetWorth() {
        const total = this.data.wallets.reduce((sum, w) => sum + w.balance, 0);
        const el = document.getElementById('netWorth');
        if (el) el.textContent = `KES ${total.toLocaleString()}`;
    },

    openTransactionModal(walletId = null) {
        const modal = document.getElementById('transactionModal');
        const walletSelect = document.getElementById('txWallet');
        if (!modal || !walletSelect) return;
        walletSelect.innerHTML = this.data.wallets.map(w =>
            `<option value="${w.id}" ${w.id === walletId? 'selected' : ''}>${w.name}</option>`
        ).join('');
        modal.classList.add('active');
    },

    closeTransactionModal() {
        const modal = document.getElementById('transactionModal');
        const form = document.getElementById('transactionForm');
        if (modal) modal.classList.remove('active');
        if (form) form.reset();
    },

    saveTransaction(e) {
        e.preventDefault();
        const type = document.getElementById('txType').value;
        const amount = parseFloat(document.getElementById('txAmount').value);
        const walletId = parseInt(document.getElementById('txWallet').value);
        const category = document.getElementById('txCategory').value;

        const wallet = this.data.wallets.find(w => w.id === walletId);
        if (type === 'expense' && wallet.balance < amount) {
            FinAI.show(`Not enough in ${wallet.name}. Balance: KES ${wallet.balance}`, 'danger');
            return;
        }

        wallet.balance += type === 'income'? amount : -amount;
        this.data.transactions.push({
            id: Date.now(), type, amount, walletId, category, date: new Date().toISOString()
        });

        this.saveData();
        this.renderAll();
        this.autoSweep();
        this.closeTransactionModal();
        FinAI.show(`${type === 'income'? 'Added' : 'Spent'} KES ${amount} for ${category}. New balance: KES ${wallet.balance}`, 'success');
    },

    addNewWallet() {
        const name = prompt('Wallet name: e.g. School Fees, Business');
        if (!name) return;
        this.data.wallets.push({
            id: Date.now(), name, balance: 0, color: '#8b5cf6', icon: '💼'
        });
        this.saveData();
        this.renderWallets();
        FinAI.show(`Created ${name} wallet. You can now add transactions to it.`, 'success');
    },

    addNewGoal() {
        const name = prompt('Goal name: e.g. New Car, Home Deposit');
        if (!name) return;
        const target = parseFloat(prompt('Target amount KES:'));
        if (!target || target <= 0) return;
        this.data.goals.push({
            id: Date.now(), name, target, current: 0, deadline: '2026-12-31', icon: '🎯'
        });
        this.saveData();
        this.renderGoals();
        FinAI.show(`New goal set: ${name} for KES ${target.toLocaleString()}. Let’s start saving!`, 'success');
    },

    initChart() {
        const ctx = document.getElementById('netWorthChart');
        if (!ctx || typeof Chart === 'undefined') return;
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
        const addWalletBtn = document.getElementById('addWalletBtn');
        const addGoalBtn = document.getElementById('addGoalBtn');
        const closeModal = document.getElementById('closeModal');
        const txForm = document.getElementById('transactionForm');
        
        if (addWalletBtn) addWalletBtn.onclick = () => this.addNewWallet();
        if (addGoalBtn) addGoalBtn.onclick = () => this.addNewGoal();
        if (closeModal) closeModal.onclick = () => this.closeTransactionModal();
        if (txForm) txForm.onsubmit = (e) => this.saveTransaction(e);
    }
};

document.addEventListener('DOMContentLoaded', () => FINOS.init());
