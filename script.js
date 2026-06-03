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
        hIndex: "インデックス",
        hNo: "番号",
        hZone: "地域",
        hLocation: "場所",
        hCoords: "座標",
        hAddress: "住所",
        hLink: "リンク",
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

const prefectureMap = {
    '北海道': 'Hokkaido', '青森県': 'Aomori', '岩手県': 'Iwate', '宮城県': 'Miyagi',
    '秋田県': 'Akita', '山形県': 'Yamagata', '福島県': 'Fukushima', '茨城県': 'Ibaraki',
    '栃木県': 'Tochigi', '群馬県': 'Gunma', '埼玉県': 'Saitama', '千葉県': 'Chiba',
    '東京都': 'Tokyo', '神奈川県': 'Kanagawa', '新潟県': 'Niigata', '富山県': 'Toyama',
    '石川県': 'Ishikawa', '福井県': 'Fukui', '山梨県': 'Yamanashi', '長野県': 'Nagano',
    '岐阜県': 'Gifu', '静岡県': 'Shizuoka', '愛知県': 'Aichi', '三重県': 'Mie',
    '滋賀県': 'Shiga', '京都府': 'Kyoto', '大阪府': 'Osaka', '兵庫県': 'Hyogo',
    '奈良県': 'Nara', '和歌山県': 'Wakayama', '鳥取県': 'Tottori', '島根県': 'Shimane',
    '岡山県': 'Okayama', '広島県': 'Hiroshima', '山口県': 'Yamaguchi', '徳島県': 'Tokushima',
    '香川県': 'Kagawa', '愛媛県': 'Ehime', '高知県': 'Kochi', '福岡県': 'Fukuoka',
    '佐賀県': 'Saga', '長崎県': 'Nagasaki', '熊本県': 'Kumamoto', '大分県': 'Oita',
    '宮崎県': 'Miyazaki', '鹿児島県': 'Kagoshima', '沖縄県': 'Okinawa'
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
        btn.classList.toggle('active', btn.textContent.toLowerCase() === lang);
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

function getZoneDisplay(zone) {
    if (currentLang === 'en') {
        return prefectureMap[zone] || zone;
    }
    return zone;
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
        const color = getZoneColor(item.zone);
        tr.style.backgroundColor = color.replace('40%)', '97%)');
        
        const zoneDisplay = getZoneDisplay(item.zone);
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
            <td>${item.location}</td>
            <td class="coord-cell" onclick="copyCoords(event, '${item.coordinates}')">${item.coordinates}</td>
            <td>${item.address}</td>
            <td><a href="${langLink}" target="_blank" class="link-btn">${linkText}</a></td>
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
        const zoneEn = prefectureMap[item.zone] || "";
        return item.name.toLowerCase().includes(query) || 
               item.address.toLowerCase().includes(query) ||
               item.zone.toLowerCase().includes(query) ||
               item.location.toLowerCase().includes(query) ||
               zoneEn.toLowerCase().includes(query);
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
