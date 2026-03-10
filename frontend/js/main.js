// ============================================
// Home Page JS
// ============================================

document.addEventListener('DOMContentLoaded', async () => {
    loadFeaturedCars();
    loadHomeOffers();
});

async function loadFeaturedCars() {
    const container = document.getElementById('featuredCars');
    try {
        const data = await api.get('/cars');
        if (!data.success || !data.cars.length) {
            container.innerHTML = '<p class="text-center" style="color:#6c757d">No cars available.</p>';
            return;
        }
        // Show first 3 cars on home page
        const featured = data.cars.slice(0, 3);
        container.innerHTML = featured.map(car => buildCarCard(car, false)).join('');
    } catch (err) {
        container.innerHTML = '<p class="text-center" style="color:#dc3545">Failed to load cars.</p>';
    }
}

async function loadHomeOffers() {
    const container = document.getElementById('homeOffers');
    try {
        const data = await api.get('/offers');
        if (!data.success || !data.offers.length) {
            container.innerHTML = '<p class="text-center" style="color:#6c757d">No active offers.</p>';
            return;
        }
        container.innerHTML = data.offers.slice(0, 3).map(buildOfferCard).join('');
    } catch (err) {
        container.innerHTML = '<p class="text-center" style="color:#dc3545">Failed to load offers.</p>';
    }
}

function buildCarCard(car, inPages = false) {
    const base = inPages ? '' : 'pages/';
    const stock = parseInt(car.stock);
    let stockBadge = stock > 3
        ? '<span class="stock-badge stock-in">In Stock</span>'
        : stock > 0
            ? `<span class="stock-badge stock-low">Only ${stock} left</span>`
            : '<span class="stock-badge stock-out">Out of Stock</span>';

    return `
    <div class="car-card">
        <div class="car-card-img">
            <img src="${car.image_url || '/images/car-placeholder.jpg'}"
                 alt="${car.name}"
                 onerror="this.parentElement.innerHTML='<span style=font-size:3rem>${getCarImagePlaceholder(car.name)}</span>'">
        </div>
        <div class="car-card-body">
            ${stockBadge}
            <h3>${car.name}</h3>
            <div class="car-card-model">${car.model}</div>
            <div class="car-specs">
                <div class="spec-item"><i class="fas fa-gas-pump"></i> ${car.fuel_type}</div>
                <div class="spec-item"><i class="fas fa-cog"></i> ${car.transmission}</div>
                <div class="spec-item"><i class="fas fa-tachometer-alt"></i> ${car.mileage}</div>
                <div class="spec-item"><i class="fas fa-users"></i> ${car.seating_capacity} Seater</div>
            </div>
            <div class="car-price">${formatPrice(car.price)}</div>
            <div class="car-card-actions">
                <a href="${base}car-detail.html?id=${car.id}" class="btn btn-primary btn-sm">View Details</a>
                <a href="${base}test-drive.html?car=${car.id}" class="btn btn-outline btn-sm">Test Drive</a>
            </div>
        </div>
    </div>`;
}

function buildOfferCard(offer) {
    return `
    <div class="offer-card">
        <div class="offer-discount">${offer.discount_percent}% OFF</div>
        <div class="offer-title">${offer.title}</div>
        <div class="offer-desc">${offer.description || ''}</div>
        <div class="offer-validity">Valid: ${formatDate(offer.valid_from)} – ${formatDate(offer.valid_till)}</div>
        ${offer.applicable_cars ? `<div class="offer-cars"><i class="fas fa-car"></i> ${offer.applicable_cars}</div>` : ''}
    </div>`;
}
