// ============================================
// Cars Listing Page
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    loadCars();

    document.getElementById('applyFilters').addEventListener('click', loadCars);
    document.getElementById('clearFilters').addEventListener('click', () => {
        document.getElementById('searchInput').value = '';
        document.getElementById('fuelFilter').value = '';
        document.getElementById('transmissionFilter').value = '';
        document.getElementById('minPrice').value = '';
        document.getElementById('maxPrice').value = '';
        loadCars();
    });

    document.getElementById('searchInput').addEventListener('keyup', (e) => {
        if (e.key === 'Enter') loadCars();
    });
});

async function loadCars() {
    const container = document.getElementById('carsGrid');
    container.innerHTML = '<div class="loading-spinner"><i class="fas fa-circle-notch fa-spin"></i> Loading cars...</div>';

    const search = document.getElementById('searchInput').value.trim();
    const fuel_type = document.getElementById('fuelFilter').value;
    const transmission = document.getElementById('transmissionFilter').value;
    const min_price = document.getElementById('minPrice').value;
    const max_price = document.getElementById('maxPrice').value;

    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (fuel_type) params.append('fuel_type', fuel_type);
    if (transmission) params.append('transmission', transmission);
    if (min_price) params.append('min_price', min_price);
    if (max_price) params.append('max_price', max_price);

    try {
        const data = await api.get('/cars?' + params.toString());
        if (!data.success || !data.cars.length) {
            container.innerHTML = `
            <div class="empty-state" style="grid-column:1/-1">
                <i class="fas fa-car"></i>
                <h3>No Cars Found</h3>
                <p>Try adjusting your filters.</p>
            </div>`;
            return;
        }
        container.innerHTML = data.cars.map(car => buildCarCard(car)).join('');
    } catch (err) {
        container.innerHTML = '<p class="text-center" style="color:#dc3545;padding:40px">Failed to load cars. Please try again.</p>';
    }
}

function buildCarCard(car) {
    const stock = parseInt(car.stock);
    let stockBadge = stock > 3
        ? '<span class="stock-badge stock-in">In Stock</span>'
        : stock > 0
            ? `<span class="stock-badge stock-low">Only ${stock} left</span>`
            : '<span class="stock-badge stock-out">Out of Stock</span>';

    return `
    <div class="car-card">
        <div class="car-card-img">
            <img src="${car.image_url || '/images/car-placeholder.jpg'}" alt="${car.name}"
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
                <a href="car-detail.html?id=${car.id}" class="btn btn-primary btn-sm">View Details</a>
                <a href="test-drive.html?car=${car.id}" class="btn btn-outline btn-sm">Test Drive</a>
                <button class="wishlist-btn" onclick="toggleWishlist(${car.id}, this)" title="Add to Wishlist">
                    <i class="fas fa-heart"></i>
                </button>
            </div>
        </div>
    </div>`;
}

async function toggleWishlist(carId, btn) {
    if (!isLoggedIn()) {
        window.location.href = 'login.html';
        return;
    }
    btn.disabled = true;
    try {
        if (btn.classList.contains('active')) {
            const data = await api.delete(`/wishlist/${carId}`);
            if (data.success) btn.classList.remove('active');
        } else {
            const data = await api.post('/wishlist', { car_id: carId });
            if (data.success) btn.classList.add('active');
        }
    } catch (err) {}
    btn.disabled = false;
}
