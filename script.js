let allData = [];
let filteredData = [];
let sortCol = 'id';
let sortDesc = false;

const tooltip = document.getElementById('tooltip');

async function init() {
    try {
        const response = await fetch('manhole_data.json');
        allData = await response.json();
        filteredData = [...allData];
        renderTable();
        updateStats();
    } catch (e) {
        console.error('Failed to load data:', e);
        document.getElementById('table-body').innerHTML = '<tr><td colspan="7" style="text-align:center; color:red;">Failed to load data. Please make sure you are running this through a local server or that manhole_data.json exists.</td></tr>';
    }
}

function getZoneColor(zone) {
    let hash = 0;
    for (let i = 0; i < zone.length; i++) {
        hash = zone.charCodeAt(i) + ((hash << 5) - hash);
    }
    const h = Math.abs(hash) % 360;
    return `hsl(${h}, 65%, 40%)`;
}

function renderTable() {
    const tbody = document.getElementById('table-body');
    tbody.innerHTML = '';

    filteredData.forEach(item => {
        const tr = document.createElement('tr');
        const color = getZoneColor(item.zone);
        // Use a very faint background for the row based on the zone color
        tr.style.backgroundColor = color.replace('40%)', '97%)');
        
        tr.innerHTML = `
            <td>${item.index}</td>
            <td>${item.id}</td>
            <td><span class="zone-badge" style="background-color: ${color}">${item.zone}</span></td>
            <td>${item.location}</td>
            <td class="coord-cell" title="Click to copy" onclick="copyCoords(event, '${item.coordinates}')">${item.coordinates}</td>
            <td>${item.address}</td>
            <td><a href="${item.link}" target="_blank" class="link-btn">Official Page</a></td>
        `;
        tbody.appendChild(tr);
    });
}

function updateStats() {
    document.getElementById('stats').textContent = `Showing ${filteredData.length} of ${allData.length} manholes`;
}

function filterData() {
    const query = document.getElementById('search').value.toLowerCase();
    filteredData = allData.filter(item => 
        item.name.toLowerCase().includes(query) || 
        item.address.toLowerCase().includes(query) ||
        item.zone.toLowerCase().includes(query) ||
        item.location.toLowerCase().includes(query)
    );
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

    // Update UI headers
    document.querySelectorAll('th').forEach(th => {
        th.classList.remove('sort-asc', 'sort-desc');
    });
    
    renderTable();
}

window.copyCoords = function(event, text) {
    navigator.clipboard.writeText(text).then(() => {
        showTooltip(event.clientX, event.clientY, 'Copied!');
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

// Add click listeners to headers
document.querySelectorAll('th[data-sort]').forEach(th => {
    th.addEventListener('click', () => handleSort(th.dataset.sort));
});

init();
