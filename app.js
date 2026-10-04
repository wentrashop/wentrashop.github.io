// FLEXY DUI FRONTEND RENDER ENGINE (DRIVEN 100% BY LUA ENGINE STATE)
let currentMenuState = {
    title: "Main Menu",
    counterText: "1 / 5",
    options: []
};

const THEMES = {
    red: {
        color: '#dc2626',
        gradient: 'linear-gradient(180deg, #dc2626 0%, #991b1b 100%)',
        dark: '#7f1d1d',
        darker: '#450a0a',
        border: '#b91c1c',
        glow: 'rgba(220, 38, 38, 0.6)'
    },
    blue: {
        color: '#2563eb',
        gradient: 'linear-gradient(180deg, #2563eb 0%, #1e3a8a 100%)',
        dark: '#1e3a8a',
        darker: '#0f172a',
        border: '#3b82f6',
        glow: 'rgba(37, 99, 235, 0.6)'
    },
    purple: {
        color: '#9333ea',
        gradient: 'linear-gradient(180deg, #9333ea 0%, #581c87 100%)',
        dark: '#581c87',
        darker: '#1e1b4b',
        border: '#a855f7',
        glow: 'rgba(147, 51, 234, 0.6)'
    },
    green: {
        color: '#16a34a',
        gradient: 'linear-gradient(180deg, #16a34a 0%, #14532d 100%)',
        dark: '#14532d',
        darker: '#052e16',
        border: '#22c55e',
        glow: 'rgba(22, 163, 74, 0.6)'
    },
    gold: {
        color: '#eab308',
        gradient: 'linear-gradient(180deg, #eab308 0%, #713f12 100%)',
        dark: '#713f12',
        darker: '#451a03',
        border: '#facc15',
        glow: 'rgba(234, 179, 8, 0.6)'
    },
    cyan: {
        color: '#06b6d4',
        gradient: 'linear-gradient(180deg, #06b6d4 0%, #164e63 100%)',
        dark: '#164e63',
        darker: '#083344',
        border: '#0891b2',
        glow: 'rgba(6, 182, 212, 0.6)'
    }
};

function applyTheme(themeKey) {
    const theme = THEMES[themeKey] || THEMES.red;
    const root = document.documentElement;
    root.style.setProperty('--accent-color', theme.color);
    root.style.setProperty('--accent-gradient', theme.gradient);
    root.style.setProperty('--accent-dark', theme.dark);
    root.style.setProperty('--accent-darker', theme.darker);
    root.style.setProperty('--accent-border', theme.border);
    root.style.setProperty('--accent-glow', theme.glow);
}

// LOADING SCREEN ANIMATION ENGINE
let loadingInterval = null;
function startLoadingScreen(callback) {
    const overlay = document.getElementById('loadingOverlay');
    const fill = document.getElementById('progressFill');
    const statusText = document.getElementById('loadingStatus');

    overlay.classList.add('active');
    fill.style.width = '0%';

    const statuses = [
        "Loading Addon Vehicles...",
        "Initializing Direct DUI Engine...",
        "Hooking Control Interceptors...",
        "FLEXY Core Synced!"
    ];

    let progress = 0;
    if (loadingInterval) clearInterval(loadingInterval);

    loadingInterval = setInterval(() => {
        progress += 4;
        if (progress > 100) progress = 100;
        fill.style.width = progress + '%';

        if (progress < 30) {
            statusText.innerText = statuses[0];
        } else if (progress < 60) {
            statusText.innerText = statuses[1];
        } else if (progress < 90) {
            statusText.innerText = statuses[2];
        } else {
            statusText.innerText = statuses[3];
        }

        if (progress >= 100) {
            clearInterval(loadingInterval);
            setTimeout(() => {
                overlay.classList.remove('active');
                if (callback) callback();
            }, 300);
        }
    }, 50);
}

function renderMenu() {
    const listEl = document.getElementById('menuList');
    const catTitleEl = document.getElementById('currentCategoryTitle');
    const counterEl = document.getElementById('itemCounter');
    listEl.innerHTML = '';

    catTitleEl.innerText = currentMenuState.title || "Main Menu";
    counterEl.innerText = currentMenuState.counterText || "1 / 1";

    (currentMenuState.options || []).forEach((opt, index) => {
        const item = document.createElement('div');
        const isSelected = (index + 1) === currentMenuState.selectedIndex;
        item.className = `menu-item ${isSelected ? 'selected' : ''}`;

        let rightBadge = '';
        if (opt.type === 'submenu' || opt.type === 'submenu_dynamic' || opt.type === 'target_player_submenu' || opt.type === 'target_vehicle_submenu') {
            rightBadge = `<span class="item-arrow">❯</span>`;
        } else if (opt.type === 'toggle') {
            rightBadge = `
                <div class="toggle-switch ${opt.active ? 'on' : 'off'}">
                    <div class="toggle-knob"></div>
                </div>
            `;
        } else {
            rightBadge = `<span class="item-arrow">❯</span>`;
        }

        item.innerHTML = `
            <span>${opt.label}</span>
            ${rightBadge}
        `;
        listEl.appendChild(item);
    });

    const selectedEl = listEl.children[(currentMenuState.selectedIndex - 1) || 0];
    if (selectedEl) {
        selectedEl.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
}

// LISTEN TO MESSAGES FROM FIVE M LUA ENGINE
window.addEventListener('message', (event) => {
    const data = event.data;
    const menu = document.getElementById('menu');

    if (data.action === 'startLoading') {
        startLoadingScreen();
    } else if (data.action === 'showKeyModal') {
        const modal = document.getElementById('keySelectModal');
        modal.classList.add('active');
        if (data.keyName) {
            document.getElementById('candidateKeyDisplay').innerText = data.keyName;
        }
    } else if (data.action === 'setCandidateKey') {
        document.getElementById('candidateKeyDisplay').innerText = data.keyName || "INSERT";
    } else if (data.action === 'hideKeyModal') {
        document.getElementById('keySelectModal').classList.remove('active');
    } else if (data.action === 'toggleMenu') {
        if (data.state) {
            menu.classList.add('open');
        } else {
            menu.classList.remove('open');
        }
    } else if (data.action === 'renderMenu') {
        currentMenuState = data.data;
        renderMenu();
    } else if (data.action === 'updateNoclipHud') {
        const noclipHud = document.getElementById('noclipHud');
        if (data.active) {
            noclipHud.classList.add('active');
            document.getElementById('noclipSpeedText').innerText = `Speed: ${data.speed.toFixed(1)}x | WASD: Move | Shift: Boost | Space/Ctrl: Z`;
        } else {
            noclipHud.classList.remove('active');
        }
    } else if (data.action === 'updateErpHud') {
        const erpHud = document.getElementById('erpHud');
        if (data.active) {
            erpHud.classList.add('active');
            document.getElementById('erpTitle').innerText = data.title || "ERP BOSTU";
            document.getElementById('erpTarget').innerText = data.target || "Bekleniyor";
        } else {
            erpHud.classList.remove('active');
        }
    } else if (data.action === 'setTheme') {
        applyTheme(data.theme);
    } else if (data.action === 'setHeaderTitle') {
        const titleEl = document.querySelector('.brand-title');
        if (titleEl && data.title) {
            titleEl.innerText = data.title;
        }
    }
});

// AUTO-START LOADING ANIMATION ON FIRST LOAD
startLoadingScreen();
renderMenu();
