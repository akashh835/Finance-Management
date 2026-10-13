const STORAGE_KEY = 'expense-budget-analyzer-data';

const incomeCategories = ['Salary', 'Freelance', 'Investment', 'Other Income'];
const expenseCategories = ['Food', 'Transport', 'Rent', 'Utilities', 'Shopping', 'Healthcare', 'Entertainment', 'Education', 'Other'];

function getStoredTransactions() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveTransactions(transactions) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
}

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

function formatCurrency(amount) {
  return '₹ ' + Math.abs(amount).toFixed(2);
}

function getCurrentMonthYear() {
  const now = new Date();
  return { month: now.getMonth() + 1, year: now.getFullYear() };
}

function initDateInput() {
  const dateInput = document.getElementById('date');
  if (dateInput) {
    const today = new Date().toISOString().slice(0, 10);
    dateInput.value = today;
  }
}

function updateCategoryOptions() {
  const type = document.querySelector('input[name="type"]:checked')?.value || 'income';
  const select = document.getElementById('category');
  if (!select) return;

  const incomeGroup = document.getElementById('income-categories');
  const expenseGroup = document.getElementById('expense-categories');

  if (type === 'income') {
    select.innerHTML = '';
    incomeCategories.forEach(cat => {
      const opt = document.createElement('option');
      opt.value = cat;
      opt.textContent = cat;
      select.appendChild(opt);
    });
  } else {
    select.innerHTML = '';
    expenseCategories.forEach(cat => {
      const opt = document.createElement('option');
      opt.value = cat;
      opt.textContent = cat;
      select.appendChild(opt);
    });
  }
}

function addTransaction(transaction) {
  const list = getStoredTransactions();
  list.push({ ...transaction, id: generateId() });
  saveTransactions(list);
  renderAll();
}

function deleteTransaction(id) {
  const list = getStoredTransactions().filter(t => t.id !== id);
  saveTransactions(list);
  renderAll();
}

function renderBalance() {
  const transactions = getStoredTransactions();
  let totalIncome = 0;
  let totalExpense = 0;
  transactions.forEach(t => {
    if (t.type === 'income') totalIncome += t.amount;
    else totalExpense += t.amount;
  });
  const balance = totalIncome - totalExpense;

  const balanceEl = document.getElementById('balance-display');
  const incomeEl = document.getElementById('total-income');
  const expenseEl = document.getElementById('total-expense');

  if (balanceEl) {
    balanceEl.textContent = formatCurrency(balance);
    balanceEl.className = 'balance-display ' + (balance >= 0 ? 'positive' : 'negative');
  }
  if (incomeEl) incomeEl.textContent = formatCurrency(totalIncome);
  if (expenseEl) expenseEl.textContent = formatCurrency(totalExpense);
}

function getTransactionsForMonth(month, year) {
  return getStoredTransactions().filter(t => {
    const d = new Date(t.date);
    return d.getMonth() + 1 === month && d.getFullYear() === year;
  });
}

function populateMonthYearSelects() {
  const transactions = getStoredTransactions();
  const years = new Set();
  transactions.forEach(t => {
    years.add(new Date(t.date).getFullYear());
  });
  const { year: currentYear } = getCurrentMonthYear();
  if (!years.has(currentYear)) years.add(currentYear);

  const monthSelect = document.getElementById('summary-month');
  const yearSelect = document.getElementById('summary-year');
  if (!monthSelect || !yearSelect) return;

  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  monthSelect.innerHTML = months.map((m, i) => `<option value="${i + 1}">${m}</option>`).join('');
  yearSelect.innerHTML = [...years].sort((a, b) => b - a).map(y => `<option value="${y}">${y}</option>`).join('');

  const { month, year } = getCurrentMonthYear();
  monthSelect.value = month;
  yearSelect.value = year;
}

function renderMonthlySummary() {
  const month = parseInt(document.getElementById('summary-month')?.value || getCurrentMonthYear().month, 10);
  const year = parseInt(document.getElementById('summary-year')?.value || new Date().getFullYear(), 10);

  const list = getTransactionsForMonth(month, year);
  let monthIncome = 0;
  let monthExpense = 0;
  const byCategory = {};

  list.forEach(t => {
    if (t.type === 'income') monthIncome += t.amount;
    else {
      monthExpense += t.amount;
      byCategory[t.category] = (byCategory[t.category] || 0) + t.amount;
    }
  });

  const net = monthIncome - monthExpense;

  document.getElementById('month-income').textContent = formatCurrency(monthIncome);
  document.getElementById('month-expenses').textContent = formatCurrency(monthExpense);
  const netEl = document.getElementById('month-net');
  netEl.textContent = formatCurrency(net);
  netEl.className = 'summary-net ' + (net >= 0 ? 'positive' : 'negative');

  const maxCategoryAmount = Math.max(0, ...Object.values(byCategory));
  const barContainer = document.getElementById('category-bars-content');
  if (!barContainer) return;

  if (Object.keys(byCategory).length === 0) {
    barContainer.innerHTML = '<p class="empty-state">No expense data for this month.</p>';
    return;
  }

  barContainer.innerHTML = Object.entries(byCategory)
    .sort((a, b) => b[1] - a[1])
    .map(([category, amount]) => {
      const pct = maxCategoryAmount > 0 ? (amount / maxCategoryAmount) * 100 : 0;
      const barWidth = Math.max(2, Math.round(pct));
      return `
        <div class="bar-row">
          <div class="bar-label">
            <span>${category}</span>
            <span>${formatCurrency(amount)}</span>
          </div>
          <div class="bar-track" role="presentation">
            <div class="bar-fill" style="width: ${barWidth}%"></div>
          </div>
        </div>
      `;
    })
    .join('');
}

function renderTransactionsList() {
  const list = getStoredTransactions().slice().sort((a, b) => new Date(b.date) - new Date(a.date));
  const container = document.getElementById('transactions-list');
  const emptyState = document.getElementById('empty-state');
  if (!container) return;

  if (list.length === 0) {
    emptyState.style.display = 'block';
    container.querySelectorAll('.transaction-item').forEach(el => el.remove());
    return;
  }

  emptyState.style.display = 'none';
  const existing = container.querySelectorAll('.transaction-item');
  existing.forEach(el => el.remove());

  list.slice(0, 50).forEach(t => {
    const div = document.createElement('div');
    div.className = 'transaction-item';
    const dateStr = new Date(t.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    div.innerHTML = `
      <div class="transaction-left">
        <span class="transaction-desc">${t.description || t.category}</span>
        <span class="transaction-meta">${dateStr} · ${t.category}</span>
      </div>
      <span class="transaction-amount ${t.type}">${t.type === 'income' ? '+' : '-'} ${formatCurrency(t.amount)}</span>
      <button type="button" class="delete-btn" aria-label="Delete">×</button>
    `;
    div.querySelector('.delete-btn').addEventListener('click', () => deleteTransaction(t.id));
    container.appendChild(div);
  });
}

function renderAll() {
  renderBalance();
  populateMonthYearSelects();
  renderMonthlySummary();
  renderTransactionsList();
}

function initForm() {
  const form = document.getElementById('transaction-form');
  if (!form) return;

  document.querySelectorAll('input[name="type"]').forEach(radio => {
    radio.addEventListener('change', updateCategoryOptions);
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const type = document.querySelector('input[name="type"]:checked')?.value || 'income';
    const amount = parseFloat(document.getElementById('amount').value);
    const category = document.getElementById('category').value;
    const description = document.getElementById('description').value.trim();
    const date = document.getElementById('date').value;

    if (!category || isNaN(amount) || amount <= 0) return;

    addTransaction({
      type,
      amount: Math.abs(amount),
      category,
      description: description || category,
      date,
    });

    form.reset();
    initDateInput();
    updateCategoryOptions();
  });

  document.getElementById('summary-month')?.addEventListener('change', renderMonthlySummary);
  document.getElementById('summary-year')?.addEventListener('change', renderMonthlySummary);
}

function init() {
  initDateInput();
  updateCategoryOptions();
  initForm();
  renderAll();
}

init();
