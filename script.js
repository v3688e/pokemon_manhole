let allData = [];
let filteredData = [];
let sortCol = 'id';
let sortDesc = false;
let currentLang = 'ja';

const translations = {
    ja: {
        title: "ポケふた エクスプローラ",
        subtitle: "日本全国でポケモン柄のユーティリティホールカバーを見つけよう",
        searchPlaceholder: "名前、地域、住所で検索...",
        stats: "全 {total} 件中 {count} 件を表示",
        hIndex: "順",
        hNo: "番号",
        hZone: "地域",
        hLocation: "場所",
        hCoords: "座標",
        hAddress: "住所",
        hLink: "詳細",
        officialPage: "公式ページ",
        copied: "コピーしました！"
    },
    en: {
        title: "Poké Lids Explorer",
        subtitle: "Discover Pokémon Utility Hole Covers across Japan",
        searchPlaceholder: "Search by name, zone, or address...",
        stats: "Showing {count} of {total} manholes",
        hIndex: "Index",
        hNo: "No",
        hZone: "Zone",
        hLocation: "Location",
        hCoords: "Coordinates",
        hAddress: "Address",
        hLink: "Link",
        officialPage: "Official Page",
        copied: "Copied!"
    }
};

const tooltip = document.getElementById('tooltip');

async function init() {
    try {
        const response = await fetch('manhole_data.json');
        allData = await response.json();
        filteredData = [...allData];
        updateUILanguage();
        renderTable();
        updateStats();
    } catch (e) {
        console.error('Failed to load data:', e);
        document.getElementById('table-body').innerHTML = '<tr><td colspan="7" style="text-align:center; color:red;">Failed to load data.</td></tr>';
    }
}

function setLanguage(lang) {
    currentLang = lang;
    
    // Update active button
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.classList.toggle('active', btn.textContent.trim().toLowerCase() === lang);
    });

    updateUILanguage();
    renderTable();
    updateStats();
}

function updateUILanguage() {
    const t = translations[currentLang];
    document.getElementById('title').textContent = t.title;
    document.getElementById('subtitle').textContent = t.subtitle;
    document.getElementById('search').placeholder = t.searchPlaceholder;
    document.getElementById('h-index').textContent = t.hIndex;
    document.getElementById('h-no').textContent = t.hNo;
    document.getElementById('h-zone').textContent = t.hZone;
    document.getElementById('h-location').textContent = t.hLocation;
    document.getElementById('h-coords').textContent = t.hCoords;
    document.getElementById('h-address').textContent = t.hAddress;
    document.getElementById('h-link').textContent = t.hLink;
}

function getZoneDisplay(item) {
    if (currentLang === 'ja') {
        return item.zone_ja || item.zone;
    }
    return item.zone_en || item.zone;
}

function getLocationDisplay(item) {
    if (currentLang === 'ja') {
        return item.location_ja || item.location;
    }
    return item.location_en || item.location;
}

function getZoneColor(zone) {
    let hash = 0;
    for (let i = 0; i < zone.length; i++) {
        hash = zone.charCodeAt(i) + ((hash << 5) - hash);
    }
    const h = Math.abs(hash) % 360;
    return `hsl(${h}, 65%, 40%)`;
}

function getLanguageLink(link) {
    if (currentLang === 'en') {
        return link.replace('local.pokemon.jp/manhole/', 'local.pokemon.jp/en/manhole/');
    }
    return link;
}

function renderTable() {
    const tbody = document.getElementById('table-body');
    tbody.innerHTML = '';

    filteredData.forEach(item => {
        const tr = document.createElement('tr');
        const color = getZoneColor(item.zone_en || item.zone);
        tr.style.backgroundColor = color.replace('40%)', '97%)');
        
        const zoneDisplay = getZoneDisplay(item);
        const locDisplayFull = getLocationDisplay(item);
        
        // Truncate to 10 chars if longer
        const locDisplayShort = locDisplayFull.length > 10 
            ? locDisplayFull.substring(0, 10) + '...' 
            : locDisplayFull;

        const linkText = translations[currentLang].officialPage;
        const langLink = getLanguageLink(item.link);
        
        const imgHtml = item.image 
            ? `<img src="${item.image}" style="width: 40px; height: 40px; object-fit: contain; border-radius: 50%; border: 1px solid #ddd; background: white;">`
            : `<div style="width: 40px; height: 40px; background: #eee; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 14px; color: #999;">Poké</div>`;

        tr.innerHTML = `
            <td>${item.index}</td>
            <td>${item.id}</td>
            <td>
                <div style="display: flex; align-items: center; gap: 10px;">
                    ${imgHtml}
                    <span class="zone-badge" style="background-color: ${color}">${zoneDisplay}</span>
                </div>
            </td>
            <td class="loc-cell" title="${locDisplayFull}">${locDisplayShort}</td>
            <td class="coord-cell" onclick="copyCoords(event, '${item.coordinates}')">${item.coordinates}</td>
            <td>${item.address}</td>
            <td>
                <a href="${langLink}" target="_blank" class="link-btn" title="${linkText}">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display: block;"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
                </a>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function updateStats() {
    const t = translations[currentLang];
    const statsText = t.stats
        .replace('{count}', filteredData.length)
        .replace('{total}', allData.length);
    document.getElementById('stats').textContent = statsText;
}

function filterData() {
    const query = document.getElementById('search').value.toLowerCase();
    filteredData = allData.filter(item => {
        return (item.name && item.name.toLowerCase().includes(query)) || 
               (item.address && item.address.toLowerCase().includes(query)) ||
               (item.zone && item.zone.toLowerCase().includes(query)) ||
               (item.location && item.location.toLowerCase().includes(query)) ||
               (item.zone_en && item.zone_en.toLowerCase().includes(query)) ||
               (item.location_en && item.location_en.toLowerCase().includes(query)) ||
               (item.zone_ja && item.zone_ja.toLowerCase().includes(query)) ||
               (item.location_ja && item.location_ja.toLowerCase().includes(query));
    });
    renderTable();
    updateStats();
}

function handleSort(col) {
    if (sortCol === col) {
        sortDesc = !sortDesc;
    } else {
        sortCol = col;
        sortDesc = false;
    }

    if (col === 'coordinates') {
        filteredData.sort((a, b) => {
            // Northeast (High Lat/Long) to Southwest (Low Lat/Long) when ascending (sortDesc=false)
            if (a.latitude !== b.latitude) {
                return sortDesc ? (a.latitude - b.latitude) : (b.latitude - a.latitude);
            }
            return sortDesc ? (a.longitude - b.longitude) : (b.longitude - a.longitude);
        });
    } else {
        filteredData.sort((a, b) => {
            let valA = a[col];
            let valB = b[col];
            
            if (typeof valA === 'string') {
                valA = valA.toLowerCase();
                valB = valB.toLowerCase();
            }

            if (valA < valB) return sortDesc ? 1 : -1;
            if (valA > valB) return sortDesc ? -1 : 1;
            return 0;
        });
    }
    
    renderTable();
}

window.copyCoords = function(event, text) {
    navigator.clipboard.writeText(text).then(() => {
        showTooltip(event.clientX, event.clientY, translations[currentLang].copied);
    }).catch(err => {
        console.error('Could not copy text: ', err);
    });
};

function showTooltip(x, y, text) {
    tooltip.textContent = text;
    tooltip.style.left = (x + 10) + 'px';
    tooltip.style.top = (y + 10) + 'px';
    tooltip.style.display = 'block';
    setTimeout(() => {
        tooltip.style.display = 'none';
    }, 1500);
}

document.getElementById('search').addEventListener('input', filterData);

document.querySelectorAll('th[data-sort]').forEach(th => {
    th.addEventListener('click', () => handleSort(th.dataset.sort));
});

window.setLanguage = setLanguage;

init();
