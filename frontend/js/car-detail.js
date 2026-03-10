// ============================================
// Car Detail Page
// ============================================

document.addEventListener('DOMContentLoaded', async () => {
    const params = new URLSearchParams(window.location.search);
    const carId = params.get('id');
    const container = document.getElementById('carDetailContainer');

    if (!carId) {
        container.innerHTML = '<div class="empty-state"><i class="fas fa-car"></i><h3>No car selected</h3><a href="cars.html" class="btn btn-primary">Browse Cars</a></div>';
        return;
    }

    try {
        const data = await api.get(`/cars/${carId}`);
        if (!data.success) {
            container.innerHTML = '<div class="empty-state"><i class="fas fa-exclamation-circle"></i><h3>Car not found</h3><a href="cars.html" class="btn btn-primary">Browse Cars</a></div>';
            return;
        }
        const car = data.car;
        const faqs = data.faqs || [];

        const stock = parseInt(car.stock);
        let stockBadge = stock > 3
            ? '<span class="stock-badge stock-in">In Stock</span>'
            : stock > 0
                ? `<span class="stock-badge stock-low">Only ${stock} left</span>`
                : '<span class="stock-badge stock-out">Out of Stock</span>';

        const features = car.features ? car.features.split(',').map(f => `<li><i class="fas fa-check-circle" style="color:#28a745;margin-right:6px"></i>${f.trim()}</li>`).join('') : '';
        const colors = car.color_options ? car.color_options.split(',').map(c => `<span style="display:inline-block;background:#f0f0f0;border-radius:20px;padding:3px 12px;font-size:0.82rem;margin:3px">${c.trim()}</span>`).join('') : '-';

        const faqsHTML = faqs.length ? faqs.map((faq, i) => `
            <div class="faq-item">
                <div class="faq-question" onclick="toggleFaq(${i})">
                    ${faq.question}
                    <i class="fas fa-chevron-down" id="faqIcon${i}"></i>
                </div>
                <div class="faq-answer" id="faqAnswer${i}">${faq.answer}</div>
            </div>
        `).join('') : '<p style="color:#6c757d">No FAQs available for this car.</p>';

        container.innerHTML = `
        <div style="margin-bottom:16px">
            <a href="cars.html" style="color:#6c757d;font-size:0.9rem"><i class="fas fa-arrow-left"></i> Back to Cars</a>
        </div>
        <div class="car-detail-layout">
            <div>
                <div class="car-card-img" style="height:350px;border-radius:10px;overflow:hidden">
                    <img src="${car.image_url || '/images/car-placeholder.jpg'}" alt="${car.name}"
                         style="width:100%;height:350px;object-fit:cover"
                         onerror="this.parentElement.innerHTML='<span style=font-size:6rem;display:flex;align-items:center;justify-content:center;height:350px>${getCarImagePlaceholder(car.name)}</span>'">
                </div>
                ${features ? `<div style="margin-top:24px"><h3 style="margin-bottom:14px">Key Features</h3><ul style="list-style:none;columns:2;gap:16px">${features}</ul></div>` : ''}
                <div style="margin-top:24px"><h3 style="margin-bottom:10px">Available Colors</h3>${colors}</div>
                <div style="margin-top:30px"><p style="color:#6c757d;font-size:0.95rem">${car.description || ''}</p></div>
            </div>
            <div>
                <div class="car-detail-specs">
                    ${stockBadge}
                    <h2 style="margin:12px 0 4px;font-size:1.6rem">${car.name}</h2>
                    <p style="color:#6c757d;margin-bottom:12px">${car.model}</p>
                    <div class="car-detail-price">${formatPrice(car.price)}</div>
                    <table>
                        <tr><td>Fuel Type</td><td>${car.fuel_type}</td></tr>
                        <tr><td>Transmission</td><td>${car.transmission}</td></tr>
                        <tr><td>Engine</td><td>${car.engine_cc || '-'}</td></tr>
                        <tr><td>Mileage</td><td>${car.mileage}</td></tr>
                        <tr><td>Seating</td><td>${car.seating_capacity} Persons</td></tr>
                        <tr><td>Stock</td><td>${car.stock} units</td></tr>
                    </table>
                    <div class="car-detail-actions">
                        <a href="test-drive.html?car=${car.id}" class="btn btn-primary"><i class="fas fa-calendar-check"></i> Book Test Drive</a>
                        <a href="contact.html?car=${car.id}" class="btn btn-outline"><i class="fas fa-envelope"></i> Enquire</a>
                        <button class="wishlist-btn" id="wishlistBtn" onclick="toggleWishlistDetail(${car.id})"><i class="fas fa-heart"></i></button>
                    </div>
                </div>
            </div>
        </div>
        <div class="faqs-section">
            <h3 style="margin-bottom:20px">Frequently Asked Questions</h3>
            ${faqsHTML}
        </div>`;

        document.title = `${car.name} – Maruti Suzuki Showroom`;
    } catch (err) {
        container.innerHTML = '<p style="color:#dc3545;text-align:center">Failed to load car details.</p>';
    }
});

function toggleFaq(i) {
    const answer = document.getElementById('faqAnswer' + i);
    const icon = document.getElementById('faqIcon' + i);
    answer.classList.toggle('open');
    if (icon) icon.style.transform = answer.classList.contains('open') ? 'rotate(180deg)' : '';
}

async function toggleWishlistDetail(carId) {
    if (!isLoggedIn()) { window.location.href = 'login.html'; return; }
    const btn = document.getElementById('wishlistBtn');
    btn.disabled = true;
    try {
        if (btn.classList.contains('active')) {
            const data = await api.delete(`/wishlist/${carId}`);
            if (data.success) btn.classList.remove('active');
        } else {
            const data = await api.post('/wishlist', { car_id: carId });
            if (data.success) btn.classList.add('active');
        }
    } catch {}
    btn.disabled = false;
}
