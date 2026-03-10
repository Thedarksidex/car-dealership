// ============================================
// Wishlist Page
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    if (!isLoggedIn()) {
        window.location.href = 'login.html';
        return;
    }
    loadWishlist();
});

async function loadWishlist() {
    const container = document.getElementById('wishlistContainer');
    try {
        const data = await api.get('/wishlist');
        if (!data.success || !data.wishlist.length) {
            container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-heart"></i>
                <h3>Your Wishlist is Empty</h3>
                <p>Browse cars and add your favourites here.</p>
                <a href="cars.html" class="btn btn-primary">Browse Cars</a>
            </div>`;
            return;
        }
        container.innerHTML = `<div class="cars-grid">` +
            data.wishlist.map(car => `
            <div class="car-card" id="wl-${car.car_id || car.id}">
                <div class="car-card-img">
                    <img src="${car.image_url || '/images/car-placeholder.jpg'}" alt="${car.name}"
                         onerror="this.parentElement.innerHTML='<span style=font-size:3rem>${getCarImagePlaceholder(car.name)}</span>'">
                </div>
                <div class="car-card-body">
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
                        <a href="car-detail.html?id=${car.car_id || car.id}" class="btn btn-primary btn-sm">View Details</a>
                        <button class="btn btn-danger btn-sm" onclick="removeFromWishlist(${car.car_id || car.id})">
                            <i class="fas fa-heart-broken"></i> Remove
                        </button>
                    </div>
                </div>
            </div>
        `).join('') + '</div>';
    } catch {
        container.innerHTML = '<p style="color:#dc3545;text-align:center">Failed to load wishlist.</p>';
    }
}

async function removeFromWishlist(carId) {
    try {
        const data = await api.delete(`/wishlist/${carId}`);
        if (data.success) loadWishlist();
    } catch {}
}
