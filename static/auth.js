document.addEventListener('DOMContentLoaded', function() {
    // Initialize storage
    if (!localStorage.getItem('users')) {
        localStorage.setItem('users', JSON.stringify([]));
    }

    // DOM Elements
    const roleSelection = document.getElementById('roleSelection');
    const authForms = document.getElementById('authForms');


    // Role buttons
    document.getElementById('studentBtn').addEventListener('click', () => showAuthScreen('Student'));
    document.getElementById('jobSeekerBtn').addEventListener('click', () => showAuthScreen('Job Seeker'));
    document.getElementById('govtBtn').addEventListener('click', () => showAuthScreen('Government Employee'));
     

    function showAuthScreen(role) {
        roleSelection.classList.add('hidden');
        renderLoginForm(role);
    }

    function renderLoginForm(role) {
        authForms.innerHTML = `
            <div class="auth-form">
                <h2>${role} Login</h2>
                <form id="loginForm">
                    <div class="form-group">
                        <label>Email:</label>
                        <input type="email" id="loginEmail" required class="form-input">
                    </div>
                    <div class="form-group password-group">
                        <label>Password:</label>
                        <div class="password-input-wrapper">
                            <input type="password" id="loginPassword" required class="form-input">
                            <button type="button" class="show-password">👁️</button>
                        </div>
                    </div>
                    <button type="submit" class="auth-btn">Login</button>
                </form>
                <p class="auth-switch">Don't have an account? <a href="#" id="switchToRegister">Register</a></p>
            </div>
        `;
        authForms.classList.remove('hidden');

        // Password visibility toggle
        document.querySelector('.show-password').addEventListener('click', function() {
            const passwordField = document.getElementById('loginPassword');
            passwordField.type = passwordField.type === 'password' ? 'text' : 'password';
            this.textContent = passwordField.type === 'password' ? '👁️' : '👁️‍🗨️';
        });

        // Form submission - ALWAYS requires password
        document.getElementById('loginForm').addEventListener('submit', function(e) {
            e.preventDefault();
            const email = document.getElementById('loginEmail').value.trim();
            const password = document.getElementById('loginPassword').value;
            
            if (!email || !password) {
                alert('Please enter both email and password');
                return;
            }
            
            handleLogin(email, password, role);
        });

        document.getElementById('switchToRegister').addEventListener('click', function(e) {
            e.preventDefault();
            renderRegisterForm(role);
        });
    }

    function renderRegisterForm(role) {
        authForms.innerHTML = `
            <div class="auth-form">
                <h2>${role} Registration</h2>
                <form id="registerForm">
                    <div class="form-group">
                        <label>Full Name:</label>
                        <input type="text" id="regName" required class="form-input">
                    </div>
                    <div class="form-group">
                        <label>Email:</label>
                        <input type="email" id="regEmail" required class="form-input">
                    </div>
                    <div class="form-group password-group">
                        <label>Password:</label>
                        <div class="password-input-wrapper">
                            <input type="password" id="regPassword" required class="form-input">
                            <button type="button" class="show-password">👁️</button>
                        </div>
                    </div>
                    <div class="form-group">
                        <label>Confirm Password:</label>
                        <input type="password" id="regConfirm" required class="form-input">
                    </div>
                    <button type="submit" class="auth-btn">Register</button>
                </form>
                <p class="auth-switch">Already have an account? <a href="#" id="switchToLogin">Login</a></p>
            </div>
        `;

        // Password visibility toggle
        document.querySelector('.show-password').addEventListener('click', function() {
            const passwordField = document.getElementById('regPassword');
            passwordField.type = passwordField.type === 'password' ? 'text' : 'password';
            this.textContent = passwordField.type === 'password' ? '👁️' : '👁️‍🗨️';
        });

        document.getElementById('registerForm').addEventListener('submit', function(e) {
            e.preventDefault();
            const name = document.getElementById('regName').value.trim();
            const email = document.getElementById('regEmail').value.trim();
            const password = document.getElementById('regPassword').value;
            const confirmPassword = document.getElementById('regConfirm').value;
            
            if (password !== confirmPassword) {
                alert('Passwords do not match!');
                return;
            }
            
            handleRegistration(name, email, password, role);
        });

        document.getElementById('switchToLogin').addEventListener('click', function(e) {
            e.preventDefault();
            renderLoginForm(role);
        });
    }

    function handleRegistration(name, email, password, role) {
    fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, role })
    })
    .then(res => res.json())
    .then(data => {
        if (data.message === 'Registration successful') {
            // ✅ Add user to localStorage users[]
            const users = JSON.parse(localStorage.getItem('users')) || [];

            users.push({
                name,
                email,
                password,
                role,
                expenses: {
                    transactions: [],
                    monthlyData: {}
                }
            });

            localStorage.setItem('users', JSON.stringify(users));

            alert('Registration successful! Now logging in...');
            handleLogin(email, password, role); // Auto-login
        } else {
            alert(data.error || 'Registration failed');
        }
    })
    .catch(err => {
        console.error('Registration error:', err);
        alert('Server error. Please try again.');
    });
}

    function handleLogin(email, password, role) {
    fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, role })
    })
    .then(res => res.json())
    .then(data => {
        if (data.token) {
            localStorage.setItem('token', data.token);

            const users = JSON.parse(localStorage.getItem('users')) || [];
            let fullUser = users.find(u => u.email === email && u.role === role);

            // ✅ If user exists but no expenses, add it
            if (fullUser) {
                if (!fullUser.expenses) {
                    fullUser.expenses = { transactions: [], monthlyData: {} };
                }
            } else {
                // ✅ If user not found in local users[], fallback with full data
                fullUser = {
                    name: data.name,
                    email,
                    role,
                    expenses: { transactions: [], monthlyData: {} }
                };
                users.push(fullUser); // Optional: push to users[] if new
                localStorage.setItem('users', JSON.stringify(users));
            }

            localStorage.setItem('currentUser', JSON.stringify(fullUser));

            // Redirect
            if (role === 'Student') {
                window.location.href = '/dashboard';
            } else if (role === 'Job Seeker') {
                window.location.href = '/job-dashboard';
            } else if (role === 'Government Employee') {
                window.location.href = '/gov-dashboard';
            }
        } else {
            alert(data.error || 'Login failed');
        }
    })
    .catch(err => {
        console.error('Login error:', err);
        alert('Server error. Please try again.');
    });
}

    // Optional: Add this at the bottom of auth.js
function logoutUser() {
    // ✅ Update current user back into users[]
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));

    const index = users.findIndex(u => u.email === currentUser.email && u.role === currentUser.role);
    if (index !== -1) {
        users[index] = currentUser; // Save current state (with expenses etc.)
        localStorage.setItem('users', JSON.stringify(users));
    }

    // Now clear session
    localStorage.removeItem('token');
    localStorage.removeItem('currentUser');

    alert("Logged out successfully!");
    window.location.href = "/";
}

});




