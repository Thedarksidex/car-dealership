// ============================================
// Car Detail Page
// ============================================

let carouselImages = [];
let currentSlide = 0;

function buildCarouselHTML() {
    if (!carouselImages.length) {
        return `<div style="height:350px;border-radius:10px;background:#f8f9fa;display:flex;align-items:center;justify-content:center;font-size:5rem">🚗</div>`;
    }
    const slidesHTML = carouselImages.map(img =>
        `<div class="car-carousel-slide">
            <img src="${img.url}" alt="${img.color}" style="width:100%;height:350px;object-fit:cover;display:block"
                 onerror="this.src='/images/car-placeholder.jpg'">
        </div>`
    ).join('');

    const navHTML = carouselImages.length > 1
        ? `<button class="carousel-btn carousel-prev" onclick="carouselNav(-1)" aria-label="Previous">&#10094;</button>
           <button class="carousel-btn carousel-next" onclick="carouselNav(1)" aria-label="Next">&#10095;</button>`
        : '';

    const swatchesHTML = carouselImages.length > 1
        ? `<div class="car-color-swatches">
            ${carouselImages.map((img, i) =>
                `<button class="color-swatch-btn${i === 0 ? ' active' : ''}" id="swatch${i}" onclick="selectCarouselSlide(${i})">${img.color}</button>`
            ).join('')}
           </div>`
        : '';

    return `<div class="car-carousel">
                <div class="car-carousel-track" id="carouselTrack">${slidesHTML}</div>
                ${navHTML}
            </div>
            ${swatchesHTML}`;
}

function selectCarouselSlide(index) {
    currentSlide = index;
    const track = document.getElementById('carouselTrack');
    if (track) track.style.transform = `translateX(-${index * 100}%)`;
    document.querySelectorAll('.color-swatch-btn').forEach((btn, i) => {
        btn.classList.toggle('active', i === index);
    });
}

function carouselNav(direction) {
    if (!carouselImages.length) return;
    selectCarouselSlide((currentSlide + direction + carouselImages.length) % carouselImages.length);
}

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

        // Build carousel images from color_images map (or fall back to image_url)
        const colorImages = car.color_images;
        if (colorImages && typeof colorImages === 'object' && Object.keys(colorImages).length > 0) {
            carouselImages = Object.entries(colorImages).map(([color, url]) => ({ color, url }));
        } else if (car.image_url) {
            carouselImages = [{ color: 'Default', url: car.image_url }];
        } else {
            carouselImages = [];
        }
        currentSlide = 0;

        const stock = parseInt(car.stock);
        let stockBadge = stock > 3
            ? '<span class="stock-badge stock-in">In Stock</span>'
            : stock > 0
                ? `<span class="stock-badge stock-low">Only ${stock} left</span>`
                : '<span class="stock-badge stock-out">Out of Stock</span>';

        const features = car.features ? car.features.split(',').map(f => `<li><i class="fas fa-check-circle" style="color:#28a745;margin-right:6px"></i>${f.trim()}</li>`).join('') : '';

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
                ${buildCarouselHTML()}
                ${features ? `<div style="margin-top:24px"><h3 style="margin-bottom:14px">Key Features</h3><ul style="list-style:none;columns:2;gap:16px">${features}</ul></div>` : ''}
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
                        <button class="compare-btn" id="compareDetailBtn"
                                onclick="toggleCompareDetail(${car.id}, '${(car.name||'').replace(/'/g,"\\'").replace(/"/g,'&quot;')}', '${(car.image_url||'').replace(/'/g,"\\'")}')"
                                title="Add to Compare">
                            <i class="fas fa-balance-scale"></i>
                        </button>
                    </div>
                </div>
            </div>
        </div>
        <div class="faqs-section">
            <h3 style="margin-bottom:20px">Frequently Asked Questions</h3>
            ${faqsHTML}
        </div>
        ${buildEmiCalculatorHTML(car.price)}`;

        document.title = `${car.name} – Maruti Suzuki Showroom`;
        calcEMI(car.price);
        updateAllSliderFills();
        // Set compare button initial state
        const compareBtn = document.getElementById('compareDetailBtn');
        if (compareBtn && getCompareList().some(c => c.id === car.id)) {
            compareBtn.classList.add('active');
            compareBtn.title = 'Remove from Compare';
        }
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

// ── Compare helpers ───────────────────────────
function getCompareList() {
    try { return JSON.parse(localStorage.getItem('compareList') || '[]'); } catch { return []; }
}
function setCompareList(list) { localStorage.setItem('compareList', JSON.stringify(list)); }

function toggleCompareDetail(id, name, imageUrl) {
    let list = getCompareList();
    const idx = list.findIndex(c => c.id === id);
    if (idx > -1) {
        list.splice(idx, 1);
    } else {
        if (list.length >= 3) { alert('You can compare up to 3 cars at a time.'); return; }
        list.push({ id, name, image_url: imageUrl });
    }
    setCompareList(list);
    const btn = document.getElementById('compareDetailBtn');
    const inCompare = list.some(c => c.id === id);
    if (btn) {
        btn.classList.toggle('active', inCompare);
        btn.title = inCompare ? 'Remove from Compare' : 'Add to Compare';
    }
}

// ── Carousel ───────────────────────────────────────
function buildEmiCalculatorHTML(carPrice) {
    const maxDown = Math.floor(carPrice * 0.9);
    const defaultDown = Math.floor(carPrice * 0.2 / 5000) * 5000;
    return `
    <div class="emi-calculator">
        <h3><i class="fas fa-calculator"></i> EMI Calculator</h3>
        <div class="emi-grid">
            <div class="emi-inputs">
                <div class="emi-field">
                    <div class="emi-label-row">
                        <label>Car Price</label>
                        <span class="emi-value-badge">${formatPrice(carPrice)}</span>
                    </div>
                </div>
                <div class="emi-field">
                    <div class="emi-label-row">
                        <label for="emiDown">Down Payment</label>
                        <div class="emi-input-wrap">
                            <span class="emi-input-prefix">&#8377;</span>
                            <input type="number" id="emiDownInput" class="emi-number-input" value="${defaultDown}" min="0" max="${maxDown}" step="5000"
                                oninput="syncSlider('emiDown','emiDownInput'); calcEMI(${carPrice})">
                        </div>
                    </div>
                    <input type="range" id="emiDown" class="emi-slider" min="0" max="${maxDown}" step="5000" value="${defaultDown}"
                        oninput="syncInput('emiDown','emiDownInput'); calcEMI(${carPrice})">
                    <div class="emi-range-labels"><span>&#8377;0</span><span>${formatPrice(maxDown)}</span></div>
                </div>
                <div class="emi-field">
                    <div class="emi-label-row">
                        <label for="emiRate">Annual Interest Rate</label>
                        <div class="emi-input-wrap">
                            <input type="number" id="emiRateInput" class="emi-number-input" value="9" min="1" max="30" step="0.1"
                                oninput="syncSlider('emiRate','emiRateInput'); calcEMI(${carPrice})">
                            <span class="emi-input-suffix">%</span>
                        </div>
                    </div>
                    <input type="range" id="emiRate" class="emi-slider" min="1" max="30" step="0.1" value="9"
                        oninput="syncInput('emiRate','emiRateInput'); calcEMI(${carPrice})">
                    <div class="emi-range-labels"><span>1%</span><span>30%</span></div>
                </div>
                <div class="emi-field">
                    <div class="emi-label-row">
                        <label for="emiTenure">Loan Tenure</label>
                        <div class="emi-input-wrap">
                            <input type="number" id="emiTenureInput" class="emi-number-input" value="60" min="6" max="84" step="6"
                                oninput="syncSlider('emiTenure','emiTenureInput'); calcEMI(${carPrice})">
                            <span class="emi-input-suffix">mo</span>
                        </div>
                    </div>
                    <input type="range" id="emiTenure" class="emi-slider" min="6" max="84" step="6" value="60"
                        oninput="syncInput('emiTenure','emiTenureInput'); calcEMI(${carPrice})">
                    <div class="emi-range-labels"><span>6 mo</span><span>84 mo</span></div>
                </div>
            </div>
            <div class="emi-result" id="emiResult"></div>
        </div>
    </div>`;
}

function updateSliderFill(slider) {
    const min = parseFloat(slider.min), max = parseFloat(slider.max), val = parseFloat(slider.value);
    const pct = max === min ? 0 : ((val - min) / (max - min)) * 100;
    slider.style.setProperty('--pct', pct.toFixed(2) + '%');
}

function updateAllSliderFills() {
    ['emiDown', 'emiRate', 'emiTenure'].forEach(id => {
        const el = document.getElementById(id);
        if (el) updateSliderFill(el);
    });
}

function syncSlider(sliderId, inputId) {
    const val = parseFloat(document.getElementById(inputId).value) || 0;
    const slider = document.getElementById(sliderId);
    if (val >= parseFloat(slider.min) && val <= parseFloat(slider.max)) {
        slider.value = val;
        updateSliderFill(slider);
    }
}

function syncInput(sliderId, inputId) {
    const slider = document.getElementById(sliderId);
    document.getElementById(inputId).value = slider.value;
    updateSliderFill(slider);
}

function calcEMI(carPrice) {
    const down = Math.max(0, parseFloat(document.getElementById('emiDownInput').value) || 0);
    const rate = Math.max(0.01, parseFloat(document.getElementById('emiRateInput').value) || 9);
    const tenure = Math.max(1, parseInt(document.getElementById('emiTenureInput').value) || 60);
    const principal = Math.max(0, carPrice - down);
    const r = rate / 12 / 100;
    const emi = r === 0 ? principal / tenure
        : principal * r * Math.pow(1 + r, tenure) / (Math.pow(1 + r, tenure) - 1);
    const totalAmt = emi * tenure;
    const totalInterest = totalAmt - principal;
    const downPct = carPrice > 0 ? ((down / carPrice) * 100).toFixed(1) : 0;

    document.getElementById('emiResult').innerHTML = `
        <div class="emi-monthly">
            <div class="emi-monthly-label">Monthly EMI</div>
            <div class="emi-monthly-value">${formatPrice(Math.round(emi))}</div>
            <div class="emi-monthly-sub">for ${tenure} months @ ${rate}% p.a.</div>
        </div>
        <div class="emi-breakdown">
            <div class="emi-breakdown-row"><span>Loan Amount</span><span>${formatPrice(Math.round(principal))}</span></div>
            <div class="emi-breakdown-row"><span>Down Payment</span><span>${formatPrice(Math.round(down))} <small style="color:#6c757d">(${downPct}%)</small></span></div>
            <div class="emi-breakdown-row"><span>Total Interest</span><span style="color:var(--primary)">${formatPrice(Math.round(totalInterest))}</span></div>
            <div class="emi-breakdown-row emi-total"><span>Total Payable</span><span>${formatPrice(Math.round(totalAmt + down))}</span></div>
        </div>
        <div class="emi-donut-wrap">
            ${buildDonut(principal, totalInterest)}
            <div class="emi-legend">
                <span class="emi-legend-dot" style="background:var(--primary)"></span>Principal&nbsp;&nbsp;
                <span class="emi-legend-dot" style="background:var(--accent)"></span>Interest
            </div>
        </div>`;
}

function buildDonut(principal, interest) {
    const total = principal + interest;
    if (total <= 0) return '';
    const r = 46, cx = 60, cy = 60, circ = 2 * Math.PI * r;
    const pDash = circ * (principal / total);
    const iDash = circ - pDash;
    return `<svg viewBox="0 0 120 120" class="emi-donut" aria-hidden="true">
        <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="var(--accent)" stroke-width="20"/>
        <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="var(--primary)" stroke-width="20"
            stroke-dasharray="${pDash.toFixed(2)} ${iDash.toFixed(2)}" stroke-dashoffset="${(circ * 0.25).toFixed(2)}"/>
        <text x="60" y="56" text-anchor="middle" font-size="10" fill="var(--grey)" font-weight="600">Principal</text>
        <text x="60" y="70" text-anchor="middle" font-size="11" fill="var(--primary)" font-weight="800">${((principal/total)*100).toFixed(0)}%</text>
    </svg>`;
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
