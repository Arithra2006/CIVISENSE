// job-dashboard.js
document.addEventListener('DOMContentLoaded', async () => {
    try {
        await loadJobCriticalContent();
        requestIdleCallback(loadJobSecondaryContent, { timeout: 2000 });
        setupJobEventDelegation();
    } catch (error) {
        console.error('Dashboard init failed:', error);
        showJobErrorUI();
    }
});

// ========== CORE FUNCTIONS ========== //

async function loadJobCriticalContent() {
    if (!await verifyAuth()) return;

    const [user, jobData] = await Promise.all([
        loadUserProfile(),
        fetchJobCriticalData()
    ]);

    renderJobAboveFoldContent(user, jobData);
}

function loadJobSecondaryContent() {
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

// ========== JOB-SPECIFIC FUNCTIONS ========== //

async function fetchJobCriticalData() {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    try {
        const response = await fetch('/api/job-critical-data', {
            signal: controller.signal,
            priority: 'high'
        });
        return await response.json();
    } finally {
        clearTimeout(timeout);
    }
}

function renderJobAboveFoldContent(user, data) {
    const container = document.getElementById('main-content');
    const fragment = document.createDocumentFragment();

    // Render first 10 items relevant to job seekers
    data.slice(0, 10).forEach(item => {
        fragment.appendChild(createJobItemElement(item));
    });

    container.appendChild(fragment);

    // Load rest of the data during idle time
    requestIdleCallback(() => {
        renderRemainingItems(data.slice(10));
    }, { timeout: 1000 });
}

function createJobItemElement(item) {
    const div = document.createElement('div');
    div.className = 'job-item clickable';
    div.innerHTML = `
        <h4>${item.title}</h4>
        <p>${item.description}</p>
    `;
    return div;
}

// ========== PERFORMANCE UTILITIES (shared) ========== //

const verifyAuth = memoize(async () => {
    const token = localStorage.getItem('authToken');
    if (!token) return false;

    try {
        const response = await fetch('/api/verify', {
            headers: { 'Authorization': `Bearer ${token}`}
        });
        return response.ok;
    } catch {
        return false;
    }
});

function memoize(fn) {
    const cache = new Map();
    return (...args) => {
        const key = JSON.stringify(args);
        if (cache.has(key)) return cache.get(key);
        const result = fn(...args);
        cache.set(key, result);
        return result;
    };
}

function setupJobEventDelegation() {
    document.addEventListener('click', debounce((e) => {
        const target = e.target.closest('.clickable');
        if (target) handleJobInteraction(target);
    }, 100));
}

function debounce(func, wait) {
    let timeout;
    return (...args) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait);
    };
}

// ========== LAZY LOADING (same as student) ========== //

async function loadLazyContent(element) {
    try {
        const response = await fetch(element.dataset.src);
        element.innerHTML = await response.text();

        requestIdleCallback(() => {
            const images = element.querySelectorAll('img[data-src]');
            images.forEach(img => {
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
            });
        });
    } catch (error) {
        console.warn('Lazy loading failed:', error);
    }
}

// ========== INTERACTION HANDLING ========== //

function handleJobInteraction(element) {
    const sectionId = element.dataset.section;
    if (sectionId) {
        document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
    }
}

// ========== ERROR UI ========== //

function showJobErrorUI() {
    const errorEl = document.createElement('div');
    errorEl.className = 'error-overlay';
    errorEl.innerHTML = `
        <h3>Something went wrong</h3>
        <button id="retry-btn">Retry</button>
    `;
    document.body.prepend(errorEl);

    document.getElementById('retry-btn').addEventListener('click', () => {
        window.location.reload();
    }, { once: true });
}