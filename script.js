// Lấy dữ liệu từ LocalStorage
let transactions = JSON.parse(localStorage.getItem('transactions')) || [];

const form = document.getElementById('transaction-form');
const list = document.getElementById('transaction-list');
const balanceEl = document.getElementById('total-balance');
const incomeEl = document.getElementById('total-income');
const expenseEl = document.getElementById('total-expense');
const incomeBar = document.getElementById('income-bar');
const expenseBar = document.getElementById('expense-bar');

// Hàm chống XSS (Escape HTML)
function escapeHTML(str) {
    return str.replace(/[&<>'"]/g, function(tag) {
        const charsToReplace = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            "'": '&#39;',
            '"': '&quot;'
        };
        return charsToReplace[tag] || tag;
    });
}

// Định dạng tiền tệ VND
function formatCurrency(amount) {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
}

// Cập nhật giao diện (Bảng, Thẻ tổng quan, Progress Bar)
function updateUI() {
    list.innerHTML = '';
    let income = 0;
    let expense = 0;

    transactions.forEach((t, index) => {
        if (t.type === 'income') income += t.amount;
        if (t.type === 'expense') expense += t.amount;

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${t.date}</td>
            <td>${t.category}</td>
            <td class="${t.type === 'income' ? 'text-income' : 'text-expense'}">
                ${t.type === 'income' ? 'Thu' : 'Chi'}
            </td>
            <td>${formatCurrency(t.amount)}</td>
            <td><button class="delete-btn" onclick="removeTransaction(${index})">Xóa</button></td>
        `;
        list.appendChild(tr);
    });

    const balance = income - expense;
    incomeEl.innerText = formatCurrency(income);
    expenseEl.innerText = formatCurrency(expense);
    balanceEl.innerText = formatCurrency(balance);

    // Tính toán Progress Bar
    const total = income + expense;
    if (total === 0) {
        incomeBar.style.width = '50%';
        expenseBar.style.width = '50%';
        incomeBar.innerText = '';
        expenseBar.innerText = '';
    } else {
        const incomePercent = (income / total) * 100;
        const expensePercent = (expense / total) * 100;
        incomeBar.style.width = `${incomePercent}%`;
        expenseBar.style.width = `${expensePercent}%`;
        incomeBar.innerText = incomePercent > 10 ? Math.round(incomePercent) + '%' : '';
        expenseBar.innerText = expensePercent > 10 ? Math.round(expensePercent) + '%' : '';
    }
}

// Xóa giao dịch
function removeTransaction(index) {
    transactions.splice(index, 1);
    saveData();
    updateUI();
}

// Lưu vào LocalStorage
function saveData() {
    localStorage.setItem('transactions', JSON.stringify(transactions));
}

// Xử lý Form Submit
form.addEventListener('submit', function(e) {
    e.preventDefault();

    const type = document.getElementById('type').value;
    const amount = parseFloat(document.getElementById('amount').value);
    const categoryRaw = document.getElementById('category').value;
    const date = document.getElementById('date').value;

    // Validation
    if (categoryRaw.trim() === '' || isNaN(amount) || amount <= 0 || date === '') {
        alert('Vui lòng nhập đầy đủ thông tin và số tiền phải lớn hơn 0!');
        return;
    }

    // Escape HTML chống XSS
    const category = escapeHTML(categoryRaw);

    const transaction = { type, amount, category, date };
    transactions.push(transaction);
    
    saveData();
    updateUI();
    form.reset();
});

// Khởi tạo
updateUI();