document.addEventListener('DOMContentLoaded', function() {
    let currentUser = JSON.parse(localStorage.getItem('currentUser')) || {};
    const users = JSON.parse(localStorage.getItem('users')) || [];

    // ✅ FIXED HERE: Find full user from 'users' by email to keep the correct version
    const fullUser = users.find(u => u.email === currentUser.email);
    if (fullUser) currentUser = fullUser;

    // ✅ Ensure expense data exists
    if (!currentUser.expenses) {
        currentUser.expenses = {
            transactions: [],
            monthlyData: {}
        };
    }

    // DOM Elements
    const expenseForm = document.getElementById('expenseForm');
    const expenseTable = document.getElementById('expensesTable').querySelector('tbody');
    const savingsMessage = document.getElementById('savingsMessage');
    const reportType = document.getElementById('expenseReportType');
    const customRange = document.getElementById('expenseCustomRange');

    // Form Submission
    expenseForm.addEventListener('submit', function(e) {
        e.preventDefault();

        const category = document.getElementById('expenseItem').value;
        const amount = parseFloat(document.getElementById('expenseCost').value);
        const today = new Date().toISOString().split('T')[0];
        const currentMonth = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });

        // Add transaction
        currentUser.expenses.transactions.push({
            date: today,
            category,
            amount
        });

        // Update monthly data
        if (!currentUser.expenses.monthlyData[currentMonth]) {
            currentUser.expenses.monthlyData[currentMonth] = {};
        }

        if (!currentUser.expenses.monthlyData[currentMonth][category]) {
            currentUser.expenses.monthlyData[currentMonth][category] = 0;
        }

        currentUser.expenses.monthlyData[currentMonth][category] += amount;

        // ✅ FIXED HERE: Update user in users array and save
        const userIndex = users.findIndex(u => u.email === currentUser.email);
        if (userIndex !== -1) {
            users[userIndex] = currentUser;
        }

        localStorage.setItem('currentUser', JSON.stringify(currentUser)); // optional but good for next use
        localStorage.setItem('users', JSON.stringify(users)); // ✅ This now contains updated data

        // Update UI
        renderExpenseTable();
        checkSavingsProgress();

        // Reset form
        expenseForm.reset();
    });

    // Report Type Change
    reportType.addEventListener('change', function() {
        customRange.classList.toggle('hidden', this.value !== 'custom');
    });

    // Download Report
    document.getElementById('downloadExpenseReport').addEventListener('click', function() {
        const type = reportType.value;
        let startDate, endDate = new Date();

        if (type === 'custom') {
            startDate = new Date(document.getElementById('expenseStartDate').value);
            endDate = new Date(document.getElementById('expenseEndDate').value);
        } else {
            startDate = new Date();
            if (type === 'weekly') {
                startDate.setDate(endDate.getDate() - 7);
            } else if (type === 'monthly') {
                startDate.setMonth(endDate.getMonth() - 1);
            } else {
                startDate.setDate(endDate.getDate());
                endDate.setDate(endDate.getDate());
            }
        }

        const reportData = currentUser.expenses.transactions.filter(entry => {
            const entryDate = new Date(entry.date);
            return entryDate >= startDate && entryDate <= endDate;
        });

        generateExpenseReport(reportData, startDate, endDate);
    });

    // Render Expense Table
    function renderExpenseTable() {
        const categories = {};

        currentUser.expenses.transactions.forEach(transaction => {
            if (!categories[transaction.category]) {
                categories[transaction.category] = 0;
            }
            categories[transaction.category] += transaction.amount;
        });

        expenseTable.innerHTML = '';

        for (const [category, total] of Object.entries(categories)) {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${category}</td>
                <td>₹${total.toFixed(2)}</td>
            `;
            expenseTable.appendChild(row);
        }
    }

    // Check Savings Progress
    function checkSavingsProgress() {
        const months = Object.keys(currentUser.expenses.monthlyData);
        if (months.length < 2) return;

        const currentMonth = months[months.length - 1];
        const prevMonth = months[months.length - 2];

        const currentTotal = Object.values(currentUser.expenses.monthlyData[currentMonth]).reduce((a, b) => a + b, 0);
        const prevTotal = Object.values(currentUser.expenses.monthlyData[prevMonth]).reduce((a, b) => a + b, 0);

        if (currentTotal < prevTotal) {
            const savingsPercent = ((prevTotal - currentTotal) / prevTotal * 100).toFixed(2);
            savingsMessage.textContent = ` Congratulations! You've saved ${savingsPercent}% more than last month!`;
            savingsMessage.classList.remove('hidden');
        }
    }

    // Generate Excel Report
    function generateExpenseReport(data, startDate, endDate) {
        let csv = 'Date,Category,Amount (₹)\n';

        data.forEach(entry => {
            csv +=` ${entry.date},${entry.category},${entry.amount}\n`;
        });

        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Expense_Report_${startDate.toISOString().split('T')[0]}_to_${endDate.toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }

    // Initial render
    renderExpenseTable();
    checkSavingsProgress();
});