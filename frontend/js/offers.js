// ============================================
// Offers Page
// ============================================

document.addEventListener('DOMContentLoaded', async () => {
    const container = document.getElementById('offersGrid');
    try {
        const data = await api.get('/offers');
        if (!data.success || !data.offers.length) {
            container.innerHTML = `<div class="empty-state" style="grid-column:1/-1">
                <i class="fas fa-tag"></i><h3>No Offers Right Now</h3>
                <p>Check back soon for exciting deals!</p>
            </div>`;
            return;
        }
        container.innerHTML = data.offers.map(offer => `
            <div class="offer-card">
                <div class="offer-discount">${offer.discount_percent}% OFF</div>
                <div class="offer-title">${offer.title}</div>
                <div class="offer-desc">${offer.description || ''}</div>
                <div class="offer-validity"><i class="fas fa-calendar-alt"></i> Valid: ${formatDate(offer.valid_from)} – ${formatDate(offer.valid_till)}</div>
                ${offer.applicable_cars ? `<div class="offer-cars"><i class="fas fa-car"></i> ${offer.applicable_cars}</div>` : ''}
                <div style="margin-top:16px">
                    <a href="cars.html" class="btn btn-white btn-sm">Explore Cars</a>
                </div>
            </div>
        `).join('');
    } catch {
        container.innerHTML = '<p style="color:#dc3545;text-align:center;padding:40px">Failed to load offers.</p>';
    }
});
