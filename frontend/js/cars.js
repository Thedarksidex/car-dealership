// ============================================
// Cars Listing Page
// ============================================

// ── Compare helpers ───────────────────────────
function getCompareList() {
    try { return JSON.parse(localStorage.getItem('compareList') || '[]'); } catch { return []; }
}
function setCompareList(list) { localStorage.setItem('compareList', JSON.stringify(list)); }

function toggleCompare(id, name, imageUrl) {
    let list = getCompareList();
    const idx = list.findIndex(c => c.id === id);
    if (idx > -1) {
        list.splice(idx, 1);
    } else {
        if (list.length >= 3) {
            alert('You can compare up to 3 cars at a time.');
            return;
        }
        list.push({ id, name, image_url: imageUrl });
    }
    setCompareList(list);
    const btn = document.getElementById('comparebtn' + id);
    if (btn) btn.classList.toggle('active', list.some(c => c.id === id));
    renderCompareBar();
}

function renderCompareBar() {
    const list = getCompareList();
    let bar = document.getElementById('compareFloatBar');
    if (!bar) {
        bar = document.createElement('div');
        bar.id = 'compareFloatBar';
        bar.className = 'compare-float-bar';
        document.body.appendChild(bar);
    }
    if (!list.length) {
        bar.classList.remove('visible');
        return;
    }
    bar.classList.add('visible');
    const placeholders = Array.from({ length: Math.max(0, 2 - list.length) },
        (_, i) => `<div class="compare-bar-placeholder"><i class="fas fa-plus"></i> Add car ${list.length + i + 1}</div>`);
    bar.innerHTML = `
        <div class="compare-bar-inner">
            <div class="compare-bar-label"><i class="fas fa-balance-scale"></i> Compare</div>
            <div class="compare-bar-cars">
                ${list.map(c => `
                    <div class="compare-bar-item">
                        <img src="${c.image_url || '/images/car-placeholder.jpg'}" alt="${c.name}"
                             onerror="this.src='/images/car-placeholder.jpg'">
                        <span>${c.name}</span>
                        <button class="compare-bar-remove" onclick="toggleCompare(${c.id}, '${(c.name||'').replace(/'/g,"\\'")}',' ${(c.image_url||'').replace(/'/g,"\\'")}')" title="Remove">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>`).join('')}
                ${placeholders.join('')}
            </div>
            <div class="compare-bar-actions">
                <a href="compare.html" class="btn btn-primary btn-sm ${list.length < 2 ? 'disabled-btn' : ''}">
                    <i class="fas fa-balance-scale"></i> Compare Now
                </a>
                <button class="btn btn-outline btn-sm compare-clear" onclick="clearCompare()">Clear</button>
            </div>
        </div>`;
}

function clearCompare() {
    setCompareList([]);
    document.querySelectorAll('.compare-btn').forEach(b => b.classList.remove('active'));
    renderCompareBar();
}

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
    renderCompareBar();
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
        renderCompareBar();
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

    const inCompare = getCompareList().some(c => c.id === car.id);
    const safeName = (car.name || '').replace(/\\/g, '\\\\').replace(/'/g, "\\'");
    const safeImg  = (car.image_url || '').replace(/\\/g, '\\\\').replace(/'/g, "\\'");

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
                <button class="compare-btn${inCompare ? ' active' : ''}" id="comparebtn${car.id}"
                        onclick="toggleCompare(${car.id}, '${safeName}', '${safeImg}')"
                        title="Add to Compare">
                    <i class="fas fa-balance-scale"></i>
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
