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
    },
    // Trump - Amerikan bayragi renkleri: vivid kirmizi + lacivert navy
    // Trump - Klasik Amerikan Bordo Kirmizisi & Gece Mavisi (Goz yormayan yumusak gecis)
    trump: {
        color: '#b91c1c',
        gradient: 'linear-gradient(180deg, #b91c1c 0%, #7f1d1d 55%, #0f172a 100%)',
        dark: '#7f1d1d',
        darker: '#090d16',
        border: '#dc2626',
        glow: 'rgba(185, 28, 28, 0.45)'
    },
    // Pepee - Gok Mavisi & Okyanus Azure (Ferah, pastel, goz yormayan)
    pepee: {
        color: '#0ea5e9',
        gradient: 'linear-gradient(180deg, #0284c7 0%, #0369a1 60%, #075985 100%)',
        dark: '#075985',
        darker: '#082f49',
        border: '#38bdf8',
        glow: 'rgba(14, 165, 233, 0.4)'
    },
    // Keloglan - Sicak Bal / Amber Turuncusu (Goz yormayan dogal gunbatimi tonlari)
    keloglan: {
        color: '#ea580c',
        gradient: 'linear-gradient(180deg, #ea580c 0%, #c2410c 60%, #7c2d12 100%)',
        dark: '#7c2d12',
        darker: '#431407',
        border: '#fb923c',
        glow: 'rgba(234, 88, 12, 0.45)'
    },
    // Netenyahu - Kraliyet Safir Mavisi & Metalik Derin Gece (Asil, goz yormayan derin safir tonlari)
    netenyahu: {
        color: '#0284c7',
        gradient: 'linear-gradient(180deg, #0284c7 0%, #034f77 55%, #011d2e 100%)',
        dark: '#034f77',
        darker: '#011420',
        border: '#38bdf8',
        glow: 'rgba(2, 132, 199, 0.45)'
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

// REAL PRELOAD & LOADING SCREEN ENGINE
const PRELOADED_SKINS = {};
const SKIN_URLS = {
    trump: 'https://wentrashop.github.io/trump_v2.png',
    pepee: 'https://wentrashop.github.io/pepee.png',
    keloglan: 'https://wentrashop.github.io/keloglan.png',
    netenyahu: 'https://wentrashop.github.io/netenyahu.png'
};
const SKIN_LIST = [
    { key: 'trump',     name: 'MAGA Skin',      url: SKIN_URLS.trump },
    { key: 'pepee',     name: 'Pepee Skin',     url: SKIN_URLS.pepee },
    { key: 'keloglan',  name: 'Keloglan Skin',  url: SKIN_URLS.keloglan },
    { key: 'netenyahu', name: 'Netenyahu Skin', url: SKIN_URLS.netenyahu }
];

let loadingStarted = false;

function startLoadingScreen(callback) {
    if (loadingStarted) return;
    loadingStarted = true;

    const overlay = document.getElementById('loadingOverlay');
    const fill = document.getElementById('progressFill');
    const statusText = document.getElementById('loadingStatus');

    if (overlay) {
        overlay.style.display = 'flex';
        overlay.classList.add('active');
    }
    if (fill) fill.style.width = '15%';
    if (statusText) statusText.innerText = 'Downloading FLEXY Resources (0/4)...';

    let loadedCount = 0;
    const total = SKIN_LIST.length;
    let finished = false;

    function finishLoading() {
        if (finished) return;
        finished = true;
        if (fill) fill.style.width = '100%';
        if (statusText) statusText.innerText = 'All Resources Synchronized!';
        setTimeout(() => {
            if (overlay) {
                overlay.classList.remove('active');
                setTimeout(() => { overlay.style.display = 'none'; }, 350);
            }
            if (callback) callback();
        }, 350);
    }

    // Safety timeout: max 2.2s so user is NEVER stuck under any condition
    const safetyTimer = setTimeout(() => {
        finishLoading();
    }, 2200);

    // Download real resources
    SKIN_LIST.forEach((skin) => {
        const img = new Image();
        const onDone = (imageObj) => {
            PRELOADED_SKINS[skin.key] = imageObj || img;
            loadedCount++;
            const pct = Math.min(100, Math.round(15 + (loadedCount / total) * 85));
            if (fill) fill.style.width = pct + '%';
            if (statusText) statusText.innerText = `Downloaded ${skin.name} (${loadedCount}/${total})...`;

            if (loadedCount >= total) {
                clearTimeout(safetyTimer);
                setTimeout(finishLoading, 150);
            }
        };

        img.onload = () => onDone(img);
        img.onerror = () => {
            if (skin.key === 'trump') {
                const fallbackImg = new Image();
                fallbackImg.onload = () => onDone(fallbackImg);
                fallbackImg.onerror = () => onDone(img);
                fallbackImg.src = 'https://wentrashop.github.io/trump.png';
            } else {
                onDone(img);
            }
        };
        img.src = skin.url;
    });
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
            rightBadge = `<span class="item-arrow">\u276F</span>`;
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
                    <span class="slider-hint">\u25C4</span>
                    <div class="slider-track">
                        <div class="slider-fill" style="width:${pct}%"></div>
                        <div class="slider-thumb" style="left:${pct}%"></div>
                    </div>
                    <span class="slider-hint">\u25BA</span>
                    <span class="slider-value"">${lbl}</span>
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
    success: '\u2713',
    error:   '\u2715',
    warn:    '\u26A0',
    info:    '\u25C8'
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
                <span class="notif-icon">${NOTIF_ICONS[type] || '\u25C8'}</span>
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
        startLoadingScreen();
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
        // Renk Temasi secildiginde: Banner'i kaldir, default FLEXY basligini goster
        const banner = document.getElementById('headerBanner');
        const titleEl = document.querySelector('.brand-title');
        const smokeBg = document.querySelector('.smoke-bg');
        const overlay = document.querySelector('.header-overlay');
        if (banner) banner.style.display = 'none';
        if (titleEl) titleEl.style.display = '';
        if (smokeBg) smokeBg.style.display = '';
        if (overlay) overlay.style.display = '';
        applyTheme(data.theme);
    } else if (data.action === 'setHeaderTitle') {
        const titleEl = document.querySelector('.brand-title');
        if (titleEl && data.title) {
            titleEl.innerText = data.title;
        }
    } else if (data.action === 'setPhotoTheme') {
        const banner = document.getElementById('headerBanner');
        const titleEl = document.querySelector('.brand-title');
        const smokeBg = document.querySelector('.smoke-bg');
        const overlay = document.querySelector('.header-overlay');
        if (data.theme && data.theme !== 'default') {
            applyTheme(data.theme);
            if (banner) {
                const targetUrl = data.url || SKIN_URLS[data.theme] || '';
                banner.onerror = function() {
                    if (data.theme === 'trump' && banner.src.indexOf('trump_v2') !== -1) {
                        banner.src = 'https://wentrashop.github.io/trump.png';
                    }
                };
                banner.src = targetUrl;
                banner.style.display = 'block';
            }
            if (titleEl) titleEl.style.display = 'none';
            if (smokeBg) smokeBg.style.display = 'none';
            if (overlay) overlay.style.display = 'none';
        } else {
            applyTheme('red');
            if (banner) banner.style.display = 'none';
            if (titleEl) titleEl.style.display = '';
            if (smokeBg) smokeBg.style.display = '';
            if (overlay) overlay.style.display = '';
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
startLoadingScreen();
renderMenu();
