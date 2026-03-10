// ============================================
// Login & Register Pages
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    // Redirect if already logged in
    if (isLoggedIn()) {
        window.location.href = '../index.html';
        return;
    }

    // Toggle password visibility
    const toggleBtn = document.getElementById('togglePassword');
    if (toggleBtn) {
        toggleBtn.addEventListener('click', () => {
            const input = toggleBtn.previousElementSibling;
            if (input.type === 'password') {
                input.type = 'text';
                toggleBtn.classList.replace('fa-eye', 'fa-eye-slash');
            } else {
                input.type = 'password';
                toggleBtn.classList.replace('fa-eye-slash', 'fa-eye');
            }
        });
    }

    // Login form
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    // Register form
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
    }
});

async function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;
    const btn = document.getElementById('loginBtn');
    const spinner = document.getElementById('loginSpinner');
    const btnText = document.getElementById('loginBtnText');

    btn.disabled = true;
    btnText.textContent = 'Signing in...';
    spinner.classList.remove('hidden');

    try {
        const data = await api.post('/auth/login', { email, password });
        if (data.success) {
            localStorage.setItem('maruti_token', data.token);
            localStorage.setItem('maruti_user', JSON.stringify(data.user));
            showAlert('alertBox', 'success', 'Login successful! Redirecting...');
            setTimeout(() => {
                window.location.href = data.user.role === 'admin' ? 'admin.html' : '../index.html';
            }, 800);
        } else {
            showAlert('alertBox', 'danger', data.message || 'Login failed');
        }
    } catch (err) {
        showAlert('alertBox', 'danger', 'Connection error. Please try again.');
    } finally {
        btn.disabled = false;
        btnText.textContent = 'Sign In';
        spinner.classList.add('hidden');
    }
}

async function handleRegister(e) {
    e.preventDefault();
    const name = document.getElementById('regName').value.trim();
    const email = document.getElementById('regEmail').value.trim();
    const phone = document.getElementById('regPhone').value.trim();
    const password = document.getElementById('regPassword').value;
    const confirmPass = document.getElementById('regConfirmPassword').value;
    const btn = document.getElementById('registerBtn');
    const spinner = document.getElementById('registerSpinner');
    const btnText = document.getElementById('registerBtnText');

    if (password !== confirmPass) {
        showAlert('alertBox', 'danger', 'Passwords do not match');
        return;
    }

    if (!/^[0-9]{10}$/.test(phone)) {
        showAlert('alertBox', 'danger', 'Phone must be 10 digits');
        return;
    }

    btn.disabled = true;
    btnText.textContent = 'Creating account...';
    spinner.classList.remove('hidden');

    try {
        const data = await api.post('/auth/register', { name, email, phone, password });
        if (data.success) {
            localStorage.setItem('maruti_token', data.token);
            localStorage.setItem('maruti_user', JSON.stringify(data.user));
            showAlert('alertBox', 'success', 'Account created! Redirecting...');
            setTimeout(() => { window.location.href = '../index.html'; }, 800);
        } else {
            showAlert('alertBox', 'danger', data.message || 'Registration failed');
        }
    } catch (err) {
        showAlert('alertBox', 'danger', 'Connection error. Please try again.');
    } finally {
        btn.disabled = false;
        btnText.textContent = 'Create Account';
        spinner.classList.add('hidden');
    }
}
