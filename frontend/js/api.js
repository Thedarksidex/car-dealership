// ============================================
// API Helper - Centralised fetch calls
// ============================================
// When running locally, the Vite/live-server proxies nothing,
// so fall back to localhost.  On Netlify, /api is proxied to
// the Render backend via netlify.toml redirect.
const API_BASE = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:5000/api'
    : '/api';

const api = {
    getToken() {
        return localStorage.getItem('maruti_token');
    },

    getAuthHeaders() {
        const token = this.getToken();
        return token ? { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' };
    },

    async get(endpoint) {
        const res = await fetch(`${API_BASE}${endpoint}`, {
            headers: this.getAuthHeaders(),
        });
        return res.json();
    },

    async post(endpoint, body) {
        const res = await fetch(`${API_BASE}${endpoint}`, {
            method: 'POST',
            headers: this.getAuthHeaders(),
            body: JSON.stringify(body),
        });
        return res.json();
    },

    async put(endpoint, body) {
        const res = await fetch(`${API_BASE}${endpoint}`, {
            method: 'PUT',
            headers: this.getAuthHeaders(),
            body: JSON.stringify(body),
        });
        return res.json();
    },

    async delete(endpoint) {
        const res = await fetch(`${API_BASE}${endpoint}`, {
            method: 'DELETE',
            headers: this.getAuthHeaders(),
        });
        return res.json();
    },
};

// Utility helpers
function formatPrice(price) {
    const num = parseFloat(price);
    if (num >= 100000) {
        return '₹' + (num / 100000).toFixed(2) + ' Lakh';
    }
    return '₹' + num.toLocaleString('en-IN');
}

function formatDate(dateStr) {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

function formatTime(timeStr) {
    if (!timeStr) return '-';
    const [h, m] = timeStr.split(':');
    const hour = parseInt(h);
    return (hour > 12 ? hour - 12 : hour) + ':' + m + ' ' + (hour >= 12 ? 'PM' : 'AM');
}

function showAlert(containerId, type, message) {
    const box = document.getElementById(containerId);
    if (!box) return;
    box.innerHTML = `<div class="alert alert-${type}"><i class="fas fa-${type === 'success' ? 'check-circle' : type === 'danger' ? 'exclamation-circle' : 'info-circle'}"></i> ${message}</div>`;
    setTimeout(() => { box.innerHTML = ''; }, 5000);
}

function statusBadge(status) {
    const map = {
        pending: 'badge-pending', confirmed: 'badge-confirmed',
        completed: 'badge-completed', cancelled: 'badge-cancelled',
        'in-progress': 'badge-progress', resolved: 'badge-resolved',
        closed: 'badge-closed', admin: 'badge-admin', user: 'badge-user',
    };
    return `<span class="badge ${map[status] || 'badge-pending'}">${status}</span>`;
}

function getCarImagePlaceholder(carName) {
    const icons = { Swift: '🚗', Baleno: '🚙', Brezza: '🚕', Fronx: '🚐', Ertiga: '🚌', 'Grand Vitara': '🚓' };
    return icons[carName] || '🚗';
}
