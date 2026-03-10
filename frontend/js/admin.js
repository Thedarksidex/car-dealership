// ============================================
// Admin Panel JS
// ============================================

document.addEventListener('DOMContentLoaded', async () => {
    // Auth guard – admin only
    if (!isLoggedIn()) { window.location.href = 'login.html'; return; }
    const user = getCurrentUser();
    if (user.role !== 'admin') { window.location.href = '../index.html'; return; }
    document.getElementById('adminUserNameDisplay').textContent = user.name;

    initSidebar();
    initModal();
    loadDashboard();
    bindTabLinks();

    // Bind add buttons immediately (they exist in HTML from page load)
    document.getElementById('addCarBtn').addEventListener('click', openAddCarModal);
    document.getElementById('addOfferBtn').addEventListener('click', openAddOfferModal);
    document.getElementById('addFaqBtn').addEventListener('click', openAddFaqModal);
});

// ── Sidebar ──────────────────────────────────
function initSidebar() {
    const sidebar = document.getElementById('adminSidebar');
    document.getElementById('sidebarToggle').addEventListener('click', () => sidebar.classList.toggle('open'));
    document.getElementById('sidebarClose').addEventListener('click', () => sidebar.classList.remove('open'));
    document.getElementById('adminLogoutBtn').addEventListener('click', (e) => { e.preventDefault(); logout(); });
}

// ── Tabs ─────────────────────────────────────
function bindTabLinks() {
    document.querySelectorAll('.sidebar-link[data-tab]').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const tab = link.dataset.tab;
            switchTab(tab, link);
        });
    });
}

function switchTab(tabName, linkEl) {
    document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.sidebar-link').forEach(l => l.classList.remove('active'));
    document.getElementById('tab-' + tabName).classList.add('active');
    if (linkEl) linkEl.classList.add('active');
    document.getElementById('adminPageTitle').textContent = linkEl ? linkEl.textContent.trim() : tabName;

    const loaders = { cars: loadAdminCars, testdrives: loadAdminTestDrives, enquiries: loadAdminEnquiries, offers: loadAdminOffers, users: loadAdminUsers, faqs: loadAdminFaqs };
    if (loaders[tabName]) loaders[tabName]();
}

// ── Modal ────────────────────────────────────
function initModal() {
    document.getElementById('modalClose').addEventListener('click', closeModal);
    document.getElementById('modalOverlay').addEventListener('click', (e) => {
        if (e.target === document.getElementById('modalOverlay')) closeModal();
    });
}

function openModal(title, bodyHTML) {
    document.getElementById('modalTitle').textContent = title;
    document.getElementById('modalBody').innerHTML = bodyHTML;
    document.getElementById('modalOverlay').classList.remove('hidden');
}

function closeModal() {
    document.getElementById('modalOverlay').classList.add('hidden');
}

// ── Dashboard ────────────────────────────────
async function loadDashboard() {
    try {
        const data = await api.get('/admin/dashboard');
        if (!data.success) return;
        document.getElementById('statUsers').textContent = data.stats.totalUsers;
        document.getElementById('statCars').textContent = data.stats.totalCars;
        document.getElementById('statTestDrives').textContent = data.stats.pendingTestDrives;
        document.getElementById('statEnquiries').textContent = data.stats.pendingEnquiries;

        document.getElementById('recentBookingsTable').innerHTML = buildMiniTable(
            ['User', 'Car', 'Date', 'Status'],
            data.recentBookings.map(b => [b.user_name, b.car_name, formatDate(b.booking_date), statusBadge(b.status)])
        );
        document.getElementById('recentEnquiriesTable').innerHTML = buildMiniTable(
            ['Name', 'Car', 'Type', 'Status'],
            data.recentEnquiries.map(e => [e.name, e.car_name, e.type, statusBadge(e.status)])
        );
    } catch (err) {}
}

function buildMiniTable(headers, rows) {
    if (!rows.length) return '<p style="color:#6c757d;font-size:0.9rem">No records found.</p>';
    return `<div class="table-wrapper"><table class="data-table">
        <thead><tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr></thead>
        <tbody>${rows.map(r => `<tr>${r.map(c => `<td>${c}</td>`).join('')}</tr>`).join('')}</tbody>
    </table></div>`;
}

// ── Cars ─────────────────────────────────────
async function loadAdminCars() {
    const container = document.getElementById('adminCarsTable');
    container.innerHTML = '<div class="loading-spinner"><i class="fas fa-circle-notch fa-spin"></i> Loading...</div>';
    try {
        const data = await api.get('/cars');
        if (!data.success) { container.innerHTML = '<p>Error loading cars.</p>'; return; }
        if (!data.cars.length) { container.innerHTML = '<div class="empty-state"><i class="fas fa-car"></i><h3>No Cars</h3></div>'; return; }
        container.innerHTML = `<div class="table-wrapper"><table class="data-table">
            <thead><tr><th>ID</th><th>Name</th><th>Model</th><th>Price</th><th>Fuel</th><th>Stock</th><th>Actions</th></tr></thead>
            <tbody>${data.cars.map(c => `<tr>
                <td>${c.id}</td><td>${c.name}</td><td>${c.model}</td>
                <td>${formatPrice(c.price)}</td><td>${c.fuel_type}</td>
                <td>${c.stock}</td>
                <td>
                    <button class="btn btn-outline btn-sm" onclick="openEditCarModal(${JSON.stringify(c).replace(/"/g, '&quot;')})">Edit</button>
                    <button class="btn btn-danger btn-sm" onclick="deleteCar(${c.id})">Delete</button>
                </td>
            </tr>`).join('')}</tbody>
        </table></div>`;
    } catch { container.innerHTML = '<p style="color:#dc3545">Failed to load.</p>'; }
}

function carFormHTML(car = {}) {
    return `<form id="carModalForm">
        <div class="form-row">
            <div class="form-group"><label class="form-label">Name *</label><input class="form-control" id="mCarName" value="${car.name || ''}" required></div>
            <div class="form-group"><label class="form-label">Model *</label><input class="form-control" id="mCarModel" value="${car.model || ''}" required></div>
        </div>
        <div class="form-row">
            <div class="form-group"><label class="form-label">Price (₹) *</label><input type="number" class="form-control" id="mCarPrice" value="${car.price || ''}" required></div>
            <div class="form-group"><label class="form-label">Stock</label><input type="number" class="form-control" id="mCarStock" value="${car.stock || 0}"></div>
        </div>
        <div class="form-row">
            <div class="form-group"><label class="form-label">Fuel Type *</label>
                <select class="form-control" id="mCarFuel">
                    ${['Petrol','Diesel','Hybrid','CNG'].map(f => `<option ${car.fuel_type === f ? 'selected' : ''}>${f}</option>`).join('')}
                </select>
            </div>
            <div class="form-group"><label class="form-label">Transmission *</label>
                <select class="form-control" id="mCarTrans">
                    ${['Manual','Automatic'].map(t => `<option ${car.transmission === t ? 'selected' : ''}>${t}</option>`).join('')}
                </select>
            </div>
        </div>
        <div class="form-row">
            <div class="form-group"><label class="form-label">Mileage *</label><input class="form-control" id="mCarMileage" value="${car.mileage || ''}" placeholder="e.g. 22 km/l" required></div>
            <div class="form-group"><label class="form-label">Engine CC</label><input class="form-control" id="mCarEngine" value="${car.engine_cc || ''}" placeholder="e.g. 1200cc"></div>
        </div>
        <div class="form-row">
            <div class="form-group"><label class="form-label">Seating Capacity</label><input type="number" class="form-control" id="mCarSeats" value="${car.seating_capacity || ''}"></div>
            <div class="form-group"><label class="form-label">Image URL</label><input class="form-control" id="mCarImage" value="${car.image_url || ''}"></div>
        </div>
        <div class="form-group"><label class="form-label">Color Options</label><input class="form-control" id="mCarColors" value="${car.color_options || ''}" placeholder="Silver, Black, White"></div>
        <div class="form-group"><label class="form-label">Features</label><input class="form-control" id="mCarFeatures" value="${car.features || ''}" placeholder="ABS, Airbags, Touchscreen"></div>
        <div class="form-group"><label class="form-label">Description</label><textarea class="form-control" id="mCarDesc" rows="2">${car.description || ''}</textarea></div>
        <div id="carModalAlert"></div>
        <button type="submit" class="btn btn-primary btn-full">Save Car</button>
    </form>`;
}

function openAddCarModal() {
    openModal('Add New Car', carFormHTML());
    document.getElementById('carModalForm').onsubmit = async (e) => {
        e.preventDefault();
        const body = getCarFormData();
        const data = await api.post('/cars', body);
        if (data.success) { closeModal(); loadAdminCars(); }
        else showAlert('carModalAlert', 'danger', data.message);
    };
}

function openEditCarModal(car) {
    openModal('Edit Car', carFormHTML(car));
    document.getElementById('carModalForm').onsubmit = async (e) => {
        e.preventDefault();
        const body = getCarFormData();
        const data = await api.put(`/cars/${car.id}`, body);
        if (data.success) { closeModal(); loadAdminCars(); }
        else showAlert('carModalAlert', 'danger', data.message);
    };
}

function getCarFormData() {
    return {
        name: document.getElementById('mCarName').value,
        model: document.getElementById('mCarModel').value,
        price: document.getElementById('mCarPrice').value,
        mileage: document.getElementById('mCarMileage').value,
        fuel_type: document.getElementById('mCarFuel').value,
        transmission: document.getElementById('mCarTrans').value,
        engine_cc: document.getElementById('mCarEngine').value,
        seating_capacity: document.getElementById('mCarSeats').value,
        description: document.getElementById('mCarDesc').value,
        image_url: document.getElementById('mCarImage').value,
        color_options: document.getElementById('mCarColors').value,
        features: document.getElementById('mCarFeatures').value,
        stock: document.getElementById('mCarStock').value,
    };
}

async function deleteCar(id) {
    if (!confirm('Delete this car? This cannot be undone.')) return;
    const data = await api.delete(`/cars/${id}`);
    if (data.success) loadAdminCars();
    else showAlert('alertBox', 'danger', data.message);
}

// ── Test Drives ──────────────────────────────
async function loadAdminTestDrives() {
    const container = document.getElementById('adminTestDrivesTable');
    container.innerHTML = '<div class="loading-spinner"><i class="fas fa-circle-notch fa-spin"></i> Loading...</div>';
    try {
        const data = await api.get('/test-drives');
        if (!data.success || !data.bookings.length) { container.innerHTML = '<div class="empty-state"><i class="fas fa-calendar"></i><h3>No Bookings</h3></div>'; return; }
        container.innerHTML = `<div class="table-wrapper"><table class="data-table">
            <thead><tr><th>ID</th><th>User</th><th>Car</th><th>Date</th><th>Time</th><th>Location</th><th>Status</th><th>Action</th></tr></thead>
            <tbody>${data.bookings.map(b => `<tr>
                <td>${b.id}</td>
                <td>${b.user_name}<br><small style="color:#6c757d">${b.user_email}</small></td>
                <td>${b.car_name}</td>
                <td>${formatDate(b.booking_date)}</td>
                <td>${formatTime(b.booking_time)}</td>
                <td>${b.preferred_location || '-'}</td>
                <td>${statusBadge(b.status)}</td>
                <td>
                    <select class="form-control" style="width:120px;padding:4px 8px;font-size:0.8rem" onchange="updateTDStatus(${b.id}, this.value)">
                        ${['pending','confirmed','completed','cancelled'].map(s => `<option ${b.status === s ? 'selected' : ''} value="${s}">${s}</option>`).join('')}
                    </select>
                </td>
            </tr>`).join('')}</tbody>
        </table></div>`;
    } catch { container.innerHTML = '<p style="color:#dc3545">Failed to load.</p>'; }
}

async function updateTDStatus(id, status) {
    const data = await api.put(`/test-drives/${id}/status`, { status });
    if (!data.success) showAlert('alertBox', 'danger', data.message);
    else showAlert('alertBox', 'success', 'Status updated.');
}

// ── Enquiries ────────────────────────────────
async function loadAdminEnquiries() {
    const container = document.getElementById('adminEnquiriesTable');
    container.innerHTML = '<div class="loading-spinner"><i class="fas fa-circle-notch fa-spin"></i> Loading...</div>';
    try {
        const data = await api.get('/enquiries');
        if (!data.success || !data.enquiries.length) { container.innerHTML = '<div class="empty-state"><i class="fas fa-envelope"></i><h3>No Enquiries</h3></div>'; return; }
        container.innerHTML = `<div class="table-wrapper"><table class="data-table">
            <thead><tr><th>ID</th><th>Name</th><th>Phone</th><th>Car</th><th>Type</th><th>Message</th><th>Status</th><th>Action</th></tr></thead>
            <tbody>${data.enquiries.map(e => `<tr>
                <td>${e.id}</td>
                <td>${e.name}<br><small style="color:#6c757d">${e.email}</small></td>
                <td>${e.phone}</td>
                <td>${e.car_name}</td>
                <td>${e.type}</td>
                <td style="max-width:180px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${e.message || '-'}</td>
                <td>${statusBadge(e.status)}</td>
                <td>
                    <select class="form-control" style="width:130px;padding:4px 8px;font-size:0.8rem" onchange="updateEnqStatus(${e.id}, this.value)">
                        ${['pending','in-progress','resolved','closed'].map(s => `<option ${e.status === s ? 'selected' : ''} value="${s}">${s}</option>`).join('')}
                    </select>
                </td>
            </tr>`).join('')}</tbody>
        </table></div>`;
    } catch { container.innerHTML = '<p style="color:#dc3545">Failed to load.</p>'; }
}

async function updateEnqStatus(id, status) {
    const data = await api.put(`/enquiries/${id}/status`, { status });
    if (!data.success) showAlert('alertBox', 'danger', data.message);
    else showAlert('alertBox', 'success', 'Status updated.');
}

// ── Offers ───────────────────────────────────
async function loadAdminOffers() {
    const container = document.getElementById('adminOffersTable');
    container.innerHTML = '<div class="loading-spinner"><i class="fas fa-circle-notch fa-spin"></i> Loading...</div>';
    try {
        const data = await api.get('/offers/all');
        if (!data.success || !data.offers.length) { container.innerHTML = '<div class="empty-state"><i class="fas fa-tag"></i><h3>No Offers</h3></div>'; return; }
        container.innerHTML = `<div class="table-wrapper"><table class="data-table">
            <thead><tr><th>ID</th><th>Title</th><th>Discount</th><th>Valid From</th><th>Valid Till</th><th>Cars</th><th>Actions</th></tr></thead>
            <tbody>${data.offers.map(o => `<tr>
                <td>${o.id}</td><td>${o.title}</td><td>${o.discount_percent}%</td>
                <td>${formatDate(o.valid_from)}</td><td>${formatDate(o.valid_till)}</td>
                <td>${o.applicable_cars || 'All'}</td>
                <td>
                    <button class="btn btn-outline btn-sm" onclick="openEditOfferModal(${JSON.stringify(o).replace(/"/g, '&quot;')})">Edit</button>
                    <button class="btn btn-danger btn-sm" onclick="deleteOffer(${o.id})">Delete</button>
                </td>
            </tr>`).join('')}</tbody>
        </table></div>`;
    } catch { container.innerHTML = '<p style="color:#dc3545">Failed to load.</p>'; }
}

function offerFormHTML(o = {}) {
    return `<form id="offerModalForm">
        <div class="form-group"><label class="form-label">Title *</label><input class="form-control" id="mOfferTitle" value="${o.title || ''}" required></div>
        <div class="form-group"><label class="form-label">Description</label><textarea class="form-control" id="mOfferDesc" rows="2">${o.description || ''}</textarea></div>
        <div class="form-row">
            <div class="form-group"><label class="form-label">Discount %</label><input type="number" class="form-control" id="mOfferDiscount" value="${o.discount_percent || ''}" step="0.01"></div>
            <div class="form-group"><label class="form-label">Applicable Cars</label><input class="form-control" id="mOfferCars" value="${o.applicable_cars || 'All'}"></div>
        </div>
        <div class="form-row">
            <div class="form-group"><label class="form-label">Valid From *</label><input type="date" class="form-control" id="mOfferFrom" value="${o.valid_from ? o.valid_from.split('T')[0] : ''}" required></div>
            <div class="form-group"><label class="form-label">Valid Till *</label><input type="date" class="form-control" id="mOfferTill" value="${o.valid_till ? o.valid_till.split('T')[0] : ''}" required></div>
        </div>
        <div id="offerModalAlert"></div>
        <button type="submit" class="btn btn-primary btn-full">Save Offer</button>
    </form>`;
}

function getOfferFormData() {
    return {
        title: document.getElementById('mOfferTitle').value,
        description: document.getElementById('mOfferDesc').value,
        discount_percent: document.getElementById('mOfferDiscount').value,
        applicable_cars: document.getElementById('mOfferCars').value,
        valid_from: document.getElementById('mOfferFrom').value,
        valid_till: document.getElementById('mOfferTill').value,
    };
}

function openAddOfferModal() {
    openModal('Add Offer', offerFormHTML());
    document.getElementById('offerModalForm').onsubmit = async (e) => {
        e.preventDefault();
        const data = await api.post('/offers', getOfferFormData());
        if (data.success) { closeModal(); loadAdminOffers(); }
        else showAlert('offerModalAlert', 'danger', data.message);
    };
}

function openEditOfferModal(offer) {
    openModal('Edit Offer', offerFormHTML(offer));
    document.getElementById('offerModalForm').onsubmit = async (e) => {
        e.preventDefault();
        const data = await api.put(`/offers/${offer.id}`, getOfferFormData());
        if (data.success) { closeModal(); loadAdminOffers(); }
        else showAlert('offerModalAlert', 'danger', data.message);
    };
}

async function deleteOffer(id) {
    if (!confirm('Delete this offer?')) return;
    const data = await api.delete(`/offers/${id}`);
    if (data.success) loadAdminOffers();
}

// ── Users ─────────────────────────────────────
async function loadAdminUsers() {
    const container = document.getElementById('adminUsersTable');
    container.innerHTML = '<div class="loading-spinner"><i class="fas fa-circle-notch fa-spin"></i> Loading...</div>';
    try {
        const data = await api.get('/admin/users');
        if (!data.success || !data.users.length) { container.innerHTML = '<div class="empty-state"><i class="fas fa-users"></i><h3>No Users</h3></div>'; return; }
        container.innerHTML = `<div class="table-wrapper"><table class="data-table">
            <thead><tr><th>ID</th><th>Name</th><th>Email</th><th>Phone</th><th>Role</th><th>Joined</th><th>Action</th></tr></thead>
            <tbody>${data.users.map(u => `<tr>
                <td>${u.id}</td><td>${u.name}</td><td>${u.email}</td><td>${u.phone}</td>
                <td>${statusBadge(u.role)}</td>
                <td>${formatDate(u.created_at)}</td>
                <td>${u.role !== 'admin' ? `<button class="btn btn-danger btn-sm" onclick="deleteUser(${u.id})">Delete</button>` : '-'}</td>
            </tr>`).join('')}</tbody>
        </table></div>`;
    } catch { container.innerHTML = '<p style="color:#dc3545">Failed to load.</p>'; }
}

async function deleteUser(id) {
    if (!confirm('Delete this user and all their data?')) return;
    const data = await api.delete(`/admin/users/${id}`);
    if (data.success) loadAdminUsers();
    else showAlert('alertBox', 'danger', data.message);
}

// ── FAQs ──────────────────────────────────────
async function loadAdminFaqs() {
    const container = document.getElementById('adminFaqsTable');
    container.innerHTML = '<div class="loading-spinner"><i class="fas fa-circle-notch fa-spin"></i> Loading...</div>';
    try {
        const data = await api.get('/faqs');
        if (!data.success || !data.faqs.length) { container.innerHTML = '<div class="empty-state"><i class="fas fa-question-circle"></i><h3>No FAQs</h3></div>'; return; }
        container.innerHTML = `<div class="table-wrapper"><table class="data-table">
            <thead><tr><th>ID</th><th>Car</th><th>Question</th><th>Answer</th><th>Action</th></tr></thead>
            <tbody>${data.faqs.map(f => `<tr>
                <td>${f.id}</td>
                <td>${f.car_name || 'General'}</td>
                <td style="max-width:200px">${f.question}</td>
                <td style="max-width:200px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${f.answer}</td>
                <td><button class="btn btn-danger btn-sm" onclick="deleteFaq(${f.id})">Delete</button></td>
            </tr>`).join('')}</tbody>
        </table></div>`;
    } catch { container.innerHTML = '<p style="color:#dc3545">Failed to load.</p>'; }
}

async function openAddFaqModal() {
    const carsData = await api.get('/cars');
    const carOptions = carsData.success ? carsData.cars.map(c => `<option value="${c.id}">${c.name}</option>`).join('') : '';
    openModal('Add FAQ', `<form id="faqModalForm">
        <div class="form-group"><label class="form-label">Car (optional)</label>
            <select class="form-control" id="mFaqCar"><option value="">General</option>${carOptions}</select>
        </div>
        <div class="form-group"><label class="form-label">Question *</label><input class="form-control" id="mFaqQ" required></div>
        <div class="form-group"><label class="form-label">Answer *</label><textarea class="form-control" id="mFaqA" rows="3" required></textarea></div>
        <div id="faqModalAlert"></div>
        <button type="submit" class="btn btn-primary btn-full">Add FAQ</button>
    </form>`);
    document.getElementById('faqModalForm').onsubmit = async (e) => {
        e.preventDefault();
        const data = await api.post('/faqs', {
            car_id: document.getElementById('mFaqCar').value || null,
            question: document.getElementById('mFaqQ').value,
            answer: document.getElementById('mFaqA').value,
        });
        if (data.success) { closeModal(); loadAdminFaqs(); }
        else showAlert('faqModalAlert', 'danger', data.message);
    };
}

async function deleteFaq(id) {
    if (!confirm('Delete this FAQ?')) return;
    const data = await api.delete(`/faqs/${id}`);
    if (data.success) loadAdminFaqs();
}
