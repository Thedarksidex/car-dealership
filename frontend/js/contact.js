// ============================================
// Contact / Enquiry Page
// ============================================

document.addEventListener('DOMContentLoaded', async () => {
    await loadCarsDropdown();

    // Pre-select from URL
    const params = new URLSearchParams(window.location.search);
    const carId = params.get('car');
    if (carId) {
        const sel = document.getElementById('enqCarId');
        if (sel) sel.value = carId;
    }

    // Pre-fill if logged in
    const user = getCurrentUser();
    if (user) {
        const nameEl = document.getElementById('enqName');
        const emailEl = document.getElementById('enqEmail');
        if (nameEl) nameEl.value = user.name;
        if (emailEl) emailEl.value = user.email;
    }

    document.getElementById('enquiryForm').addEventListener('submit', handleEnquirySubmit);
});

async function loadCarsDropdown() {
    const sel = document.getElementById('enqCarId');
    if (!sel) return;
    try {
        const data = await api.get('/cars');
        if (data.success && data.cars.length) {
            sel.innerHTML = '<option value="">Select a car</option>' +
                data.cars.map(c => `<option value="${c.id}">${c.name} – ${c.model}</option>`).join('');
        }
    } catch {}
}

async function handleEnquirySubmit(e) {
    e.preventDefault();
    const name = document.getElementById('enqName').value.trim();
    const email = document.getElementById('enqEmail').value.trim();
    const phone = document.getElementById('enqPhone').value.trim();
    const car_id = document.getElementById('enqCarId').value;
    const type = document.getElementById('enqType').value;
    const message = document.getElementById('enqMessage').value.trim();

    if (!name || !email || !phone || !car_id) {
        showAlert('alertBox', 'danger', 'Please fill in all required fields.');
        return;
    }

    if (!/^[0-9]{10}$/.test(phone)) {
        showAlert('alertBox', 'danger', 'Phone number must be 10 digits.');
        return;
    }

    try {
        const data = await api.post('/enquiries', { name, email, phone, car_id, type, message });
        if (data.success) {
            showAlert('alertBox', 'success', 'Enquiry submitted! Our team will contact you shortly.');
            document.getElementById('enquiryForm').reset();
        } else {
            showAlert('alertBox', 'danger', data.message || 'Failed to submit enquiry.');
        }
    } catch {
        showAlert('alertBox', 'danger', 'Connection error. Please try again.');
    }
}
