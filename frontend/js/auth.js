// ============================================
// Auth State Management (shared across pages)
// ============================================

function getCurrentUser() {
    try {
        const userStr = localStorage.getItem('maruti_user');
        return userStr ? JSON.parse(userStr) : null;
    } catch {
        return null;
    }
}

function isLoggedIn() {
    return !!api.getToken() && !!getCurrentUser();
}

function logout() {
    localStorage.removeItem('maruti_token');
    localStorage.removeItem('maruti_user');
    window.location.href = getBasePath() + 'index.html';
}

function getBasePath() {
    // Detect if we're in the /pages/ subdirectory
    return window.location.pathname.includes('/pages/') ? '../' : '';
}

function initNavbar() {
    const user = getCurrentUser();
    const navAuthLinks = document.getElementById('navAuthLinks');
    const navUserMenu = document.getElementById('navUserMenu');
    const navUserName = document.getElementById('navUserName');
    const adminLink = document.getElementById('adminLink');
    const logoutBtn = document.getElementById('logoutBtn');

    if (user && isLoggedIn()) {
        if (navAuthLinks) navAuthLinks.classList.add('hidden');
        if (navUserMenu) navUserMenu.classList.remove('hidden');
        if (navUserName) navUserName.textContent = user.name.split(' ')[0];
        if (adminLink && user.role === 'admin') adminLink.classList.remove('hidden');
    } else {
        if (navAuthLinks) navAuthLinks.classList.remove('hidden');
        if (navUserMenu) navUserMenu.classList.add('hidden');
    }

    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            logout();
        });
    }

    // Dropdown toggle
    const dropdownBtn = document.getElementById('userDropdownBtn');
    const dropdownMenu = document.getElementById('userDropdown');
    if (dropdownBtn && dropdownMenu) {
        dropdownBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            dropdownMenu.classList.toggle('show');
        });
        document.addEventListener('click', () => dropdownMenu.classList.remove('show'));
    }

    // Hamburger menu
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('navMenu');
    if (hamburger && navMenu) {
        hamburger.addEventListener('click', () => navMenu.classList.toggle('open'));
    }
}

// Run navbar init on DOM ready
document.addEventListener('DOMContentLoaded', initNavbar);
