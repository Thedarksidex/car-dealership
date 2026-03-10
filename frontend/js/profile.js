// ============================================
// Profile Page
// ============================================

document.addEventListener('DOMContentLoaded', async () => {
    if (!isLoggedIn()) {
        window.location.href = 'login.html';
        return;
    }
    loadProfile();
    document.getElementById('profileForm').addEventListener('submit', handleProfileUpdate);
});

async function loadProfile() {
    try {
        const data = await api.get('/auth/me');
        if (data.success) {
            const user = data.user;
            document.getElementById('profileName').textContent = user.name;
            document.getElementById('profileNameInput').value = user.name;
            document.getElementById('profileEmail').value = user.email;
            document.getElementById('profilePhone').value = user.phone;
            document.getElementById('profileRole').value = user.role.charAt(0).toUpperCase() + user.role.slice(1);
        }
    } catch {
        showAlert('alertBox', 'danger', 'Failed to load profile.');
    }
}

async function handleProfileUpdate(e) {
    e.preventDefault();
    const name = document.getElementById('profileNameInput').value.trim();
    const phone = document.getElementById('profilePhone').value.trim();

    if (!/^[0-9]{10}$/.test(phone)) {
        showAlert('alertBox', 'danger', 'Phone must be 10 digits.');
        return;
    }

    try {
        const data = await api.put('/auth/profile', { name, phone });
        if (data.success) {
            // Update local storage
            const user = getCurrentUser();
            user.name = data.user.name;
            user.phone = data.user.phone;
            localStorage.setItem('maruti_user', JSON.stringify(user));
            document.getElementById('profileName').textContent = data.user.name;
            showAlert('alertBox', 'success', 'Profile updated successfully!');
        } else {
            showAlert('alertBox', 'danger', data.message || 'Update failed.');
        }
    } catch {
        showAlert('alertBox', 'danger', 'Connection error.');
    }
}
