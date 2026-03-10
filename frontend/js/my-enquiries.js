// ============================================
// My Enquiries Page
// ============================================

document.addEventListener('DOMContentLoaded', async () => {
    if (!isLoggedIn()) {
        window.location.href = 'login.html';
        return;
    }
    loadEnquiries();
});

async function loadEnquiries() {
    const container = document.getElementById('enquiriesContainer');
    try {
        const data = await api.get('/enquiries/my');
        if (!data.success || !data.enquiries.length) {
            container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-envelope-open"></i>
                <h3>No Enquiries Yet</h3>
                <p>You haven't submitted any enquiries.</p>
                <a href="contact.html" class="btn btn-primary">Submit an Enquiry</a>
            </div>`;
            return;
        }
        container.innerHTML = data.enquiries.map(e => `
            <div class="enquiry-card">
                <div class="booking-info" style="flex:1">
                    <h4>${e.car_name}</h4>
                    <div class="booking-meta">
                        <span><i class="fas fa-tag"></i> ${e.type}</span>
                        <span><i class="fas fa-calendar"></i> ${formatDate(e.created_at)}</span>
                    </div>
                    <div>${statusBadge(e.status)}</div>
                    ${e.message ? `<p style="font-size:0.85rem;color:#6c757d;margin-top:8px">${e.message}</p>` : ''}
                </div>
            </div>
        `).join('');
    } catch {
        container.innerHTML = '<p style="color:#dc3545;text-align:center">Failed to load enquiries.</p>';
    }
}
