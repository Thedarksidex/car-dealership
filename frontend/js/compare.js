// ============================================
// Car Comparison Page
// ============================================

function getCompareList() {
    try { return JSON.parse(localStorage.getItem('compareList') || '[]'); } catch { return []; }
}
function setCompareList(list) {
    localStorage.setItem('compareList', JSON.stringify(list));
}

document.addEventListener('DOMContentLoaded', async () => {
    const container = document.getElementById('compareContainer');
    const list = getCompareList();

    if (list.length < 2) {
        container.innerHTML = `
        <div class="empty-state" style="padding:60px 0">
            <i class="fas fa-balance-scale"></i>
            <h3>No cars selected for comparison</h3>
            <p>Go to the Cars page and click <strong><i class="fas fa-balance-scale"></i></strong> on at least 2 cars.</p>
            <a href="cars.html" class="btn btn-primary" style="margin-top:12px"><i class="fas fa-car"></i> Browse Cars</a>
        </div>`;
        return;
    }

    try {
        const results = await Promise.all(list.map(item => api.get(`/cars/${item.id}`)));
        const cars = results.map(r => r.success ? r.car : null).filter(Boolean);
        if (cars.length < 2) {
            container.innerHTML = '<p style="color:#dc3545;text-align:center;padding:40px">Failed to load car data. Please go back and re-select cars.</p>';
            return;
        }
        renderCompareTable(cars, container);
    } catch {
        container.innerHTML = '<p style="color:#dc3545;text-align:center;padding:40px">Failed to load comparison data.</p>';
    }
});

function removeCar(id) {
    const list = getCompareList().filter(c => c.id !== id);
    setCompareList(list);
    if (list.length < 2) {
        window.location.href = 'cars.html';
    } else {
        window.location.reload();
    }
}

function clearAll() {
    setCompareList([]);
    window.location.href = 'cars.html';
}

function parseMileage(str) {
    if (!str) return 0;
    const m = String(str).match(/[\d.]+/);
    return m ? parseFloat(m[0]) : 0;
}

function renderCompareTable(cars, container) {
    const rows = [
        { label: 'Price',        key: 'price',            format: v => formatPrice(v),         bestFn: vals => Math.min(...vals), bestLabel: 'Lowest' },
        { label: 'Fuel Type',    key: 'fuel_type' },
        { label: 'Transmission', key: 'transmission' },
        { label: 'Engine',       key: 'engine_cc',        fallback: '-' },
        { label: 'Mileage',      key: 'mileage',          mileageParse: true,                   bestLabel: 'Best' },
        { label: 'Seating',      key: 'seating_capacity', format: v => `${v} Persons`,          bestFn: vals => Math.max(...vals), bestLabel: 'Most' },
        { label: 'Stock',        key: 'stock',            format: v => `${v} units`,            bestFn: vals => Math.max(...vals), bestLabel: 'Most' },
        { label: 'Features',     key: 'features',         fallback: '-' },
    ];

    // Build header cells (car image + name + remove btn + link)
    const headerCells = cars.map(car => `
        <th class="compare-car-header">
            <button class="compare-remove-btn" onclick="removeCar(${car.id})" title="Remove from comparison">
                <i class="fas fa-times"></i>
            </button>
            <img src="${car.image_url || '/images/car-placeholder.jpg'}" alt="${car.name}"
                 onerror="this.src='/images/car-placeholder.jpg'">
            <div class="compare-car-name">${car.name}</div>
            <div class="compare-car-model">${car.model}</div>
            <div class="compare-car-price">${formatPrice(car.price)}</div>
            <a href="car-detail.html?id=${car.id}" class="btn btn-outline btn-sm" style="margin-top:10px">
                <i class="fas fa-eye"></i> View Details
            </a>
        </th>`).join('');

    // Build data rows with best-value highlighting
    const rowsHTML = rows.map(row => {
        const bestIdxs = new Set();

        if (row.bestFn) {
            const nums = cars.map(car => parseFloat(car[row.key])).filter(n => !isNaN(n));
            if (nums.length > 1) {
                const best = row.bestFn(nums);
                cars.forEach((car, i) => {
                    if (parseFloat(car[row.key]) === best) bestIdxs.add(i);
                });
            }
        }

        if (row.mileageParse) {
            const nums = cars.map(car => parseMileage(car[row.key]));
            if (nums.filter(n => n > 0).length > 1) {
                const best = Math.max(...nums);
                cars.forEach((car, i) => { if (parseMileage(car[row.key]) === best) bestIdxs.add(i); });
            }
        }

        const cells = cars.map((car, i) => {
            let v = car[row.key];
            v = (v !== undefined && v !== null && v !== '') ? v : (row.fallback || '-');
            const display = row.format ? row.format(v) : String(v);
            const isBest = bestIdxs.has(i);
            return `<td class="compare-cell${isBest ? ' compare-best' : ''}">
                ${display}
                ${isBest ? `<div class="compare-best-tag">${row.bestLabel || 'Best'}</div>` : ''}
            </td>`;
        }).join('');

        return `<tr>
            <td class="compare-label"><i class="fas fa-chevron-right compare-row-icon"></i>${row.label}</td>
            ${cells}
        </tr>`;
    }).join('');

    container.innerHTML = `
    <div class="compare-header-bar">
        <div>
            <h2 style="font-size:1.3rem;font-weight:700">
                Comparing ${cars.length} Cars
            </h2>
            <p style="color:var(--grey);font-size:0.85rem;margin-top:4px">
                <span class="compare-best-indicator"></span> Green highlight = best value in that spec
            </p>
        </div>
        <div style="display:flex;gap:10px;flex-wrap:wrap">
            <a href="cars.html" class="btn btn-outline btn-sm"><i class="fas fa-plus"></i> Add More</a>
            <button class="btn btn-danger btn-sm" onclick="clearAll()"><i class="fas fa-trash"></i> Clear All</button>
        </div>
    </div>
    <div class="compare-table-wrap">
        <table class="compare-table">
            <thead>
                <tr>
                    <th class="compare-label-header">Specification</th>
                    ${headerCells}
                </tr>
            </thead>
            <tbody>${rowsHTML}</tbody>
        </table>
    </div>`;
}
