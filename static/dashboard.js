// dashboard-optimized.js
document.addEventListener('DOMContentLoaded', async () => {
    try {
        // 1. Critical Rendering Path (Load visible content first)
        await loadCriticalContent();
        
        // 2. Non-critical resources (load after initial render)
        requestIdleCallback(loadSecondaryContent, { timeout: 2000 });
        
        // 3. Setup optimized event listeners
        setupEventDelegation();
        
    } catch (error) {
        console.error('Initialization failed:', error);
        showErrorUI();
    }
});

// ========== CORE FUNCTIONS ========== //

async function loadCriticalContent() {
    // 1. Check auth (non-blocking)
    if (!await verifyAuth()) return;
    
    // 2. Load above-the-fold data
    const [user, criticalData] = await Promise.all([
        loadUserProfile(),
        fetchCriticalData()
    ]);
    
    // 3. Render visible elements first
    renderAboveFoldContent(user, criticalData);
}

function loadSecondaryContent() {
    // 1. Lazy load below-fold content
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                loadLazyContent(entry.target);
                observer.unobserve(entry.target);
            }
        });
    }, { rootMargin: '200px' });
    
    document.querySelectorAll('.lazy').forEach(el => observer.observe(el));
}

// ========== OPTIMIZED SUBSYSTEMS ========== //

// 1. Authentication (with memoization)
const verifyAuth = memoize(async () => {
    const token = localStorage.getItem('authToken');
    if (!token) return false;
    
    try {
        const response = await fetch('/api/verify', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        return response.ok;
    } catch {
        return false;
    }
});

// 2. Data Loading (with chunking)
async function fetchCriticalData() {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    
    try {
        const response = await fetch('/api/critical-data', {
            signal: controller.signal,
            priority: 'high'
        });
        return await response.json();
    } finally {
        clearTimeout(timeout);
    }
}

// 3. Rendering (with virtualization)
function renderAboveFoldContent(user, data) {
    const container = document.getElementById('main-content');
    const fragment = document.createDocumentFragment();
    
    // Virtualized render for first 20 items
    data.slice(0, 20).forEach(item => {
        fragment.appendChild(createItemElement(item));
    });
    
    container.appendChild(fragment);
    
    // Schedule remaining items
    requestIdleCallback(() => {
        renderRemainingItems(data.slice(20));
    }, { timeout: 1000 });
}

// ========== PERFORMANCE UTILITIES ========== //

// 1. Memoization
function memoize(fn) {
    const cache = new Map();
    return (...args) => {
        const key = JSON.stringify(args);
        return cache.has(key) ? cache.get(key) : (cache.set(key, fn(...args)), cache.get(key));
    };
}

// 2. Event Delegation
function setupEventDelegation() {
    document.addEventListener('click', debounce((e) => {
        if (e.target.closest('.clickable')) {
            handleInteraction(e.target.closest('.clickable'));
        }
    }, 100));
}

// 3. Debouncing
function debounce(func, wait) {
    let timeout;
    return (...args) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait);
    };
}

// ========== ERROR HANDLING ========== //

function showErrorUI() {
    const errorEl = document.createElement('div');
    errorEl.className = 'error-overlay';
    errorEl.innerHTML = `
        <h3>Loading Error</h3>
        <button id="retry-btn">Retry</button>
    `;
    document.body.prepend(errorEl);
    
    // Optimized retry handler
    document.getElementById('retry-btn').addEventListener('click', () => {
        window.location.reload();
    }, { once: true });
}

// ========== LAZY LOADING ========== //

async function loadLazyContent(element) {
    try {
        const data = await fetch(element.dataset.src);
        element.innerHTML = await data.text();
        
        // Load images after content
        requestIdleCallback(() => {
            const images = element.querySelectorAll('img[data-src]');
            images.forEach(img => {
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
            });
        });
    } catch (error) {
        console.warn('Lazy load failed:', error);
    }
}