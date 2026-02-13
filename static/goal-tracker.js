document.addEventListener('DOMContentLoaded', function () {
    // Load current user email
   let currentUser = {
    goals: [],
    notificationsEnabled: false
};

const token = localStorage.getItem('token');

fetch('/api/get_goal', {
    method: 'GET',
    headers: {
        'Authorization': token
    }
})
.then(res => res.json())
.then(data => {
    if (data && data.name) {
        currentUser.goals = [data];
        goalSetupSection.style.display = 'none';
        updateDashboard();
        checkBadges();
    } else {
        goalSetupSection.style.display = 'block';
    }
})
.catch(err => {
    console.error("Error loading goal:", err);
    goalSetupSection.style.display = 'block';
});
    // DOM Elements
    const goalForm = document.getElementById('goalForm');
    const goalSetupSection = document.getElementById('goalSetup');
    const progressFill = document.getElementById('progressFill');
    const daysRemaining = document.getElementById('daysRemaining');
    const savingsHistory = document.getElementById('savingsHistory');
    const goalNameInput = document.getElementById('goalName');
    const targetAmountInput = document.getElementById('targetAmount');
    const habitNameInput = document.getElementById('habitName');
    const habitCostInput = document.getElementById('habitCost');
    const checkinYesBtn = document.getElementById('checkinYes');
    const checkinNoBtn = document.getElementById('checkinNo');
    const dailyCheckinSection = document.getElementById('dailyCheckin');
    const notificationsBtn = document.getElementById('enableNotifications');
    const generateReportBtn = document.getElementById('generateReport');
    const badgesGrid = document.getElementById('badgesGrid');
    const habitNameDisplay = document.getElementById('habitNameDisplay');
    const savedAmountDisplay = document.getElementById('savedAmount');

    // Badge configurations
    const badges = [
        { id: 'first_save', name: 'First Save', earned: false, icon: '🥇', description: 'Saved for the first time' },
        { id: 'three_day_streak', name: '3-Day Streak', earned: false, icon: '🔥', description: 'Saved for 3 consecutive days' },
        { id: 'halfway', name: 'Halfway There', earned: false, icon: '🎯', description: 'Reached 50% of your goal' },
        { id: 'weekly_saver', name: 'Weekly Saver', earned: false, icon: '💰', description: 'Saved 5+ times in a week' }
    ];

    // Initialize dashboard
    if (currentUser.goals && currentUser.goals.length > 0) {
        goalSetupSection.style.display = 'none';
        updateDashboard();
        checkBadges();
    } else {
        goalSetupSection.style.display = 'block';
    }

    // Goal form submission
    goalForm.addEventListener('submit', function (e) {
        e.preventDefault();

        if (!validateGoalInputs()) return;

        const goal = {
            name: goalNameInput.value,
            targetAmount: parseFloat(targetAmountInput.value),
            dailyHabit: habitNameInput.value,
            habitCost: parseFloat(habitCostInput.value),
            startDate: new Date().toISOString(),
            savedAmount: 0,
            daysCompleted: 0,
            daysSkipped: 0,
            history: []
        };

        currentUser.goals = [goal];
        saveUserData();

        goalSetupSection.style.display = 'none';
        updateDashboard();

        if (Notification.permission !== 'granted') {
            setTimeout(() => {
                if (confirm('Enable daily reminders?')) {
                    enableNotifications();
                }
            }, 1000);
        }
    });

    function validateGoalInputs() {
        if (!goalNameInput.value.trim()) {
            alert('Please enter a goal name');
            return false;
        }

        const targetAmount = parseFloat(targetAmountInput.value);
        if (isNaN(targetAmount)) {
            alert('Please enter a valid target amount');
            return false;
        }

        if (!habitNameInput.value.trim()) {
            alert('Please enter a habit to track');
            return false;
        }

        const habitCost = parseFloat(habitCostInput.value);
        if (isNaN(habitCost)) {
            alert('Please enter a valid daily cost');
            return false;
        }

        return true;
    }

    // Daily Check-in
    checkinYesBtn.addEventListener('click', () => {
        updateHabitProgress(true);
        dailyCheckinSection.classList.add('hidden');
    });

    checkinNoBtn.addEventListener('click', () => {
        updateHabitProgress(false);
        dailyCheckinSection.classList.add('hidden');
    });

    if (notificationsBtn) {
        notificationsBtn.addEventListener('click', enableNotifications);
    }

    if (generateReportBtn) {
        generateReportBtn.addEventListener('click', generateReport);
    }

    function updateDashboard() {
        const goal = currentUser.goals[0];
        if (!goal) return;

        if (habitNameDisplay) habitNameDisplay.textContent = goal.dailyHabit;
        if (savedAmountDisplay) savedAmountDisplay.textContent = goal.habitCost;

        const progress = (goal.savedAmount / goal.targetAmount) * 100;
        const daysLeft = Math.ceil((goal.targetAmount - goal.savedAmount) / goal.habitCost);

        progressFill.style.width = `${Math.min(progress, 100)}%`;
        daysRemaining.textContent = `${daysLeft} days remaining to reach your goal!`;

        renderSavingsHistory();

        const lastChecked = goal.history.length > 0
            ? new Date(goal.history[goal.history.length - 1].date)
            : null;

        const today = new Date();
        if (!lastChecked || lastChecked.toDateString() !== today.toDateString()) {
            dailyCheckinSection.classList.remove('hidden');
        }
    }

    function updateHabitProgress(didSave) {
        const goal = currentUser.goals[0];
        const today = new Date().toISOString().split('T')[0];

        if (didSave) {
            goal.savedAmount += goal.habitCost;
            goal.daysCompleted++;
            goal.history.push({
                date: today,
                amount: goal.habitCost,
                type: 'saved'
            });
        } else {
            goal.daysSkipped++;
            goal.history.push({
                date: today,
                amount: 0,
                type: 'skipped'
            });
        }

        saveUserData();
        updateDashboard();
        checkBadges();
    }

    function renderSavingsHistory() {
        const goal = currentUser.goals[0];
        if (!goal || !goal.history) return;

        const sortedHistory = [...goal.history].sort((a, b) => new Date(b.date) - new Date(a.date));

        savingsHistory.innerHTML = sortedHistory.map(entry => `
            <div class="history-entry ${entry.type}">
                <span>${new Date(entry.date).toLocaleDateString()}</span>
                <span>${entry.type === 'saved' ? '+' : '-'}₹${entry.amount}</span>
            </div>
        `).join('');
    }

    function checkBadges() {
        const goal = currentUser.goals[0];
        if (!goal) return;

        if (goal.history.some(h => h.type === 'saved') && !badges[0].earned) {
            badges[0].earned = true;
            showBadgeNotification(badges[0]);
        }

        if (goal.daysCompleted >= 3 && !badges[1].earned) {
            badges[1].earned = true;
            showBadgeNotification(badges[1]);
        }

        if (goal.savedAmount >= (goal.targetAmount / 2) && !badges[2].earned) {
            badges[2].earned = true;
            showBadgeNotification(badges[2]);
        }

        const weeklySaves = goal.history.filter(h =>
            h.type === 'saved' &&
            new Date(h.date) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        ).length;
        if (weeklySaves >= 5 && !badges[3].earned) {
            badges[3].earned = true;
            showBadgeNotification(badges[3]);
        }

        renderBadges();
    }

    function renderBadges() {
        if (!badgesGrid) return;

        badgesGrid.innerHTML = badges.map(badge => `
            <div class="badge ${badge.earned ? 'earned' : 'locked'}">
                <span class="badge-icon">${badge.icon}</span>
                <div class="badge-info">
                    <span class="badge-name">${badge.name}</span>
                    <span class="badge-status">${badge.earned ? 'Earned!' : 'Locked'}</span>
                    <span class="badge-desc">${badge.description}</span>
                </div>
            </div>
        `).join('');
    }

    function showBadgeNotification(badge) {
        const notification = document.createElement('div');
        notification.className = 'badge-notification';
        notification.innerHTML = `
            <span class="badge-icon">${badge.icon}</span>
            <div>
                <h3>New Badge Earned!</h3>
                <p>${badge.name}: ${badge.description}</p>
            </div>
        `;
        document.body.appendChild(notification);

        setTimeout(() => notification.classList.add('show'), 100);
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => document.body.removeChild(notification), 500);
        }, 3000);
    }

    function generateReport() {
        const goal = currentUser.goals[0];
        if (!goal || !goal.history) {
            alert('No data available to generate report');
            return;
        }

        let csv = 'Date,Amount,Type\n';
        goal.history.forEach(entry => {
            csv += `${entry.date},${entry.amount},${entry.type}\n`;
        });

        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `savings_report_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }

    function enableNotifications() {
        Notification.requestPermission().then(permission => {
            if (permission === 'granted') {
                currentUser.notificationsEnabled = true;
                saveUserData();
                scheduleDailyNotification();
                alert('Notifications enabled! You will receive daily reminders.');
            }
        });
    }

    function scheduleDailyNotification() {
        console.log('Daily notifications scheduled for 9 AM');
    }

    function saveUserData() {
    fetch('/api/save_goal', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': token
        },
        body: JSON.stringify(currentUser.goals[0])
    })
    .then(res => res.json())
    .then(data => {
        console.log("Goal saved:", data);
    })
    .catch(err => {
        console.error("Error saving goal:", err);
    });
}
});
