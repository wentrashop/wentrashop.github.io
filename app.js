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
let duiReady = false; // tracks whether Lua has told us DUI is live

function startLoadingScreen(callback) {
    const overlay = document.getElementById('loadingOverlay');
    const fill = document.getElementById('progressFill');
    const statusText = document.getElementById('loadingStatus');

    // Reset first so a second call doesn't double-stack
    if (loadingInterval) { clearInterval(loadingInterval); loadingInterval = null; }
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
        // slider type gets an extra class for height; everything else stays original
        const sliderClass = opt.type === 'slider' ? ' item-type-slider' : '';
        item.className = `menu-item ${isSelected ? 'selected' : ''}${sliderClass}`;

        let rightBadge = '';
        if (opt.type === 'submenu' || opt.type === 'submenu_dynamic' || opt.type === 'target_player_submenu' || opt.type === 'target_vehicle_submenu') {
            rightBadge = `<span class="item-arrow">›</span>`;
        } else if (opt.type === 'toggle') {
            rightBadge = `
                <div class="toggle-switch ${opt.active ? 'on' : 'off'}">
                    <div class="toggle-knob"></div>
                </div>
            `;
        } else if (opt.type === 'slider') {
            const min = opt.min || 1;
            const max = opt.max || 10;
            const val = opt.value || min;
            const pct = ((val - min) / (max - min)) * 100;
            const lbl = (opt.valueLabels && opt.valueLabels[val - min]) ? opt.valueLabels[val - min] : val;
            rightBadge = `
                <div class="slider-wrap">
                    <span class="slider-hint">â—€</span>
                    <div class="slider-track">
                        <div class="slider-fill" style="width:${pct}%"></div>
                        <div class="slider-thumb" style="left:${pct}%"></div>
                    </div>
                    <span class="slider-hint">â–¶</span>
                    <span class="slider-value">${lbl}</span>
                </div>
            `;
        } else {
            rightBadge = ``;
        }

        // Keep original span structure â€” no extra class on the label
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

// FLEXY NOTIFICATION TOAST ENGINE
// Accepts: { action: "notify", message: "...", title: "FLEXY", type: "success|error|warn|info", duration: 4 }
const NOTIF_ICONS = {
    success: 'âœ“',
    error:   'âœ•',
    warn:    'âš ',
    info:    'â—ˆ'
};

let notifQueue = [];
let notifActive = 0;
const NOTIF_MAX_VISIBLE = 5;

function showNotification({ message = '', title = 'FLEXY', type = 'info', duration = 2 }) {
    if (notifActive >= NOTIF_MAX_VISIBLE) {
        // oldest visible gets force-dismissed to make room
        const container = document.getElementById('flexyNotifContainer');
        const oldest = container.lastElementChild;
        if (oldest) dismissNotif(oldest);
    }

    const container = document.getElementById('flexyNotifContainer');
    const durationMs = Math.max(1.0, Math.min(duration, 6)) * 1000;

    const el = document.createElement('div');
    el.className = `flexy-notif notif-${type}`;
    el.style.setProperty('--notif-duration', `${durationMs}ms`);

    el.innerHTML = `
        <div class="notif-stripe"></div>
        <div class="notif-body">
            <div class="notif-header">
                <span class="notif-icon">${NOTIF_ICONS[type] || 'â—ˆ'}</span>
                <span class="notif-title">${title}</span>
            </div>
            <div class="notif-message">${message}</div>
        </div>
    `;

    container.prepend(el);
    notifActive++;

    // Trigger slide-in on next frame
    requestAnimationFrame(() => {
        requestAnimationFrame(() => { el.classList.add('notif-show'); });
    });

    // Auto-dismiss
    const timer = setTimeout(() => dismissNotif(el), durationMs);
    el._notifTimer = timer;
}

function dismissNotif(el) {
    if (!el || el._dismissing) return;
    el._dismissing = true;
    clearTimeout(el._notifTimer);
    el.classList.remove('notif-show');
    el.classList.add('notif-hide');
    notifActive = Math.max(0, notifActive - 1);
    setTimeout(() => { if (el.parentNode) el.parentNode.removeChild(el); }, 320);
}

// Helper: strip Lua chat color codes like ^1 ^2 ^3 etc.
function stripLuaColors(str) {
    return String(str || '').replace(/\^[0-9]/g, '').trim();
}

// Map Lua color prefix to notification type
function luaColorToType(raw) {
    const m = String(raw || '').match(/^\^([0-9])/);
    if (!m) return 'info';
    const code = parseInt(m[1]);
    if (code === 2) return 'success'; // ^2 = green
    if (code === 1) return 'error';   // ^1 = red  (flexy prefix itself is ^1, check message)
    if (code === 3) return 'warn';    // ^3 = yellow
    return 'info';
}

// LISTEN TO MESSAGES FROM FIVE M LUA ENGINE
window.addEventListener('message', (event) => {
    const data = event.data;
    const menu = document.getElementById('menu');

    if (data.action === 'startLoading') {
        startLoadingScreen();
    } else if (data.action === 'notify') {
        showNotification({
            message:  stripLuaColors(data.message || ''),
            title:    stripLuaColors(data.title   || 'FLEXY'),
            type:     data.type     || 'info',
            duration: data.duration || 4
        });
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
    } else if (data.action === 'updateWatermark' || data.action === 'setWatermark') {
        const wmEl = document.getElementById('flexyWatermark');
        if (wmEl) {
            if (data.visible === false || data.active === false) {
                wmEl.classList.remove('active');
            } else {
                wmEl.classList.add('active');
            }
        }
        if (data.title) {
            const el = document.getElementById('wmTitle');
            if (el) el.innerText = data.title;
        }
        if (data.version) {
            const el = document.getElementById('wmVersion');
            if (el) el.innerText = data.version;
        }
        if (data.build) {
            const el = document.getElementById('wmBuild');
            if (el) el.innerText = data.build;
        }
        // FIX: Ignore Lua's GTA clock time â€” use real system time from JS Date instead.
        // Lua sends GetClockHours/GetClockMinutes which is the in-game GTA clock (wrong).
        // The watermark ticker below keeps it updated every second automatically.
    } else if (data.action === 'setTheme') {
        applyTheme(data.theme);
    } else if (data.action === 'setHeaderTitle') {
        const titleEl = document.querySelector('.brand-title');
        if (titleEl && data.title) {
            titleEl.innerText = data.title;
        }
    }
});

// REAL-TIME CLOCK TICKER â€” updates watermark time every second using system clock
// (replaces Lua's GTA in-game GetClockHours which shows wrong time)
function updateWatermarkClock() {
    const el = document.getElementById('wmTime');
    if (!el) return;
    const now = new Date();
    const hh = String(now.getHours()).padStart(2, '0');
    const mm = String(now.getMinutes()).padStart(2, '0');
    el.innerText = `${hh}:${mm}`;
}
updateWatermarkClock();
setInterval(updateWatermarkClock, 1000);

// DO NOT auto-start loading here â€” Lua engine drives the flow via postMessage.
// Calling startLoadingScreen() here causes a double-trigger / reset race when
// the Lua side sends "startLoading" 200ms after DUI creation. We just render
// the empty menu state so the DOM is ready.
renderMenu();
