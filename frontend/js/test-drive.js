// ============================================
// Test Drive Booking Page
// ============================================

document.addEventListener('DOMContentLoaded', async () => {
    // Set minimum date to today
    const dateInput = document.getElementById('tdDate');
    if (dateInput) {
        const today = new Date().toISOString().split('T')[0];
        dateInput.min = today;
    }

    await loadCarsDropdown();

    // Pre-select car if passed in URL
    const params = new URLSearchParams(window.location.search);
    const preCarId = params.get('car');
    if (preCarId) {
        const sel = document.getElementById('tdCarId');
        if (sel) sel.value = preCarId;
    }

    const form = document.getElementById('testDriveForm');
    const loginPrompt = document.getElementById('loginPrompt');

    if (!isLoggedIn()) {
        if (form) form.classList.add('hidden');
        if (loginPrompt) loginPrompt.classList.remove('hidden');
        return;
    }

    if (form) form.addEventListener('submit', handleTestDriveSubmit);
});

async function loadCarsDropdown() {
    const sel = document.getElementById('tdCarId');
    if (!sel) return;
    try {
        const data = await api.get('/cars');
        if (data.success && data.cars.length) {
            sel.innerHTML = '<option value="">Select a car</option>' +
                data.cars.map(c => `<option value="${c.id}">${c.name} – ${c.model}</option>`).join('');
        }
    } catch {}
}

async function handleTestDriveSubmit(e) {
    e.preventDefault();
    const car_id = document.getElementById('tdCarId').value;
    const booking_date = document.getElementById('tdDate').value;
    const booking_time = document.getElementById('tdTime').value;
    const preferred_location = document.getElementById('tdLocation').value.trim();
    const notes = document.getElementById('tdNotes').value.trim();
    const btn = document.getElementById('tdSubmitBtn');

    if (!car_id || !booking_date || !booking_time) {
        showAlert('alertBox', 'danger', 'Please fill in all required fields.');
        return;
    }

    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i> Booking...';

    try {
        const data = await api.post('/test-drives', { car_id, booking_date, booking_time, preferred_location, notes });
        if (data.success) {
            showAlert('alertBox', 'success', 'Test drive booked successfully! Our team will confirm shortly.');
            document.getElementById('testDriveForm').reset();
        } else {
            showAlert('alertBox', 'danger', data.message || 'Booking failed. Please try again.');
        }
    } catch (err) {
        showAlert('alertBox', 'danger', 'Connection error. Please try again.');
    } finally {
        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-calendar-check"></i> Book Test Drive';
    }
}
