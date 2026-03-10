// ============================================
// My Test Drive Bookings Page
// ============================================

document.addEventListener('DOMContentLoaded', async () => {
    if (!isLoggedIn()) {
        window.location.href = 'login.html';
        return;
    }
    loadBookings();
});

async function loadBookings() {
    const container = document.getElementById('bookingsContainer');
    try {
        const data = await api.get('/test-drives/my');
        if (!data.success || !data.bookings.length) {
            container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-calendar-times"></i>
                <h3>No Bookings Yet</h3>
                <p>You haven't booked any test drives.</p>
                <a href="test-drive.html" class="btn btn-primary">Book a Test Drive</a>
            </div>`;
            return;
        }
        container.innerHTML = data.bookings.map(b => `
            <div class="booking-card" id="booking-${b.id}">
                <img class="booking-card-img" src="${b.image_url || '/images/car-placeholder.jpg'}" alt="${b.car_name}"
                     onerror="this.src='/images/car-placeholder.jpg'">
                <div class="booking-info" style="flex:1">
                    <h4>${b.car_name} – ${b.car_model}</h4>
                    <div class="booking-meta">
                        <span><i class="fas fa-calendar"></i> ${formatDate(b.booking_date)}</span>
                        <span><i class="fas fa-clock"></i> ${formatTime(b.booking_time)}</span>
                        ${b.preferred_location ? `<span><i class="fas fa-map-marker-alt"></i> ${b.preferred_location}</span>` : ''}
                    </div>
                    <div>${statusBadge(b.status)}</div>
                    ${b.notes ? `<p style="font-size:0.85rem;color:#6c757d;margin-top:6px">${b.notes}</p>` : ''}
                </div>
                <div style="display:flex;flex-direction:column;gap:8px;align-items:flex-end">
                    ${b.status === 'pending' ? `<button class="btn btn-danger btn-sm" onclick="cancelBooking(${b.id})">Cancel</button>` : ''}
                </div>
            </div>
        `).join('');
    } catch {
        container.innerHTML = '<p style="color:#dc3545;text-align:center">Failed to load bookings.</p>';
    }
}

async function cancelBooking(id) {
    if (!confirm('Are you sure you want to cancel this booking?')) return;
    try {
        const data = await api.delete(`/test-drives/${id}`);
        if (data.success) {
            showAlert('alertBox', 'success', 'Booking cancelled successfully.');
            loadBookings();
        } else {
            showAlert('alertBox', 'danger', data.message || 'Failed to cancel booking.');
        }
    } catch {
        showAlert('alertBox', 'danger', 'Connection error.');
    }
}
