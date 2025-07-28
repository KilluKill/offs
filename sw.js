/**
 * Service Worker for 17yotk MC Server Donation System
 * Provides caching, offline support, and background sync
 */

const CACHE_NAME = '17yotk-donate-v2.0.0';
const STATIC_CACHE = `${CACHE_NAME}-static`;
const DYNAMIC_CACHE = `${CACHE_NAME}-dynamic`;

// Static resources to cache
const STATIC_RESOURCES = [
    '/',
    '/index.html',
    '/donate-styles.css',
    '/donate-script.js',
    '/manifest.json',
    '/images/logo.png',
    '/Logo/favicon.ico',
    // External resources
    'https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css'
];

// Dynamic resources patterns
const DYNAMIC_PATTERNS = [
    /^https:\/\/fonts\.googleapis\.com/,
    /^https:\/\/fonts\.gstatic\.com/,
    /^https:\/\/cdnjs\.cloudflare\.com/,
    /^https:\/\/js\.stripe\.com/,
    /^https:\/\/www\.paypal\.com/
];

// API endpoints that should not be cached
const NO_CACHE_PATTERNS = [
    /\/api\//,
    /\/ws/,
    /analytics/,
    /tracking/
];

/**
 * Install event - cache static resources
 */
self.addEventListener('install', event => {
    // Service Worker installing...
    
    event.waitUntil(
        caches.open(STATIC_CACHE)
            .then(cache => {
                // Caching static resources...
                return cache.addAll(STATIC_RESOURCES);
            })
            .then(() => {
                console.log('✅ Static resources cached successfully');
                return self.skipWaiting();
            })
            .catch(error => {
                console.error('❌ Failed to cache static resources:', error);
            })
    );
});

/**
 * Activate event - clean up old caches
 */
self.addEventListener('activate', event => {
    console.log('🚀 Service Worker activating...');
    
    event.waitUntil(
        caches.keys()
            .then(cacheNames => {
                return Promise.all(
                    cacheNames.map(cacheName => {
                        if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
                            console.log('🗑️ Deleting old cache:', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
            .then(() => {
                console.log('✅ Service Worker activated');
                return self.clients.claim();
            })
    );
});

/**
 * Fetch event - handle all network requests
 */
self.addEventListener('fetch', event => {
    const { request } = event;
    const url = new URL(request.url);
    
    // Skip non-GET requests and chrome-extension requests
    if (request.method !== 'GET' || url.protocol === 'chrome-extension:') {
        return;
    }
    
    // Don't cache API endpoints
    if (NO_CACHE_PATTERNS.some(pattern => pattern.test(request.url))) {
        event.respondWith(fetch(request));
        return;
    }
    
    // Handle different types of requests
    if (isStaticResource(request.url)) {
        event.respondWith(handleStaticResource(request));
    } else if (isDynamicResource(request.url)) {
        event.respondWith(handleDynamicResource(request));
    } else {
        event.respondWith(handleGenericRequest(request));
    }
});

/**
 * Check if URL is a static resource
 */
function isStaticResource(url) {
    return STATIC_RESOURCES.some(resource => url.includes(resource));
}

/**
 * Check if URL is a dynamic resource
 */
function isDynamicResource(url) {
    return DYNAMIC_PATTERNS.some(pattern => pattern.test(url));
}

/**
 * Handle static resources - cache first strategy
 */
async function handleStaticResource(request) {
    try {
        const cache = await caches.open(STATIC_CACHE);
        const cachedResponse = await cache.match(request);
        
        if (cachedResponse) {
            // Update cache in background
            updateCacheInBackground(request, cache);
            return cachedResponse;
        }
        
        const networkResponse = await fetch(request);
        if (networkResponse.status === 200) {
            cache.put(request, networkResponse.clone());
        }
        return networkResponse;
        
    } catch (error) {
        console.error('Failed to handle static resource:', error);
        return await getOfflineFallback(request);
    }
}

/**
 * Handle dynamic resources - network first strategy
 */
async function handleDynamicResource(request) {
    try {
        const networkResponse = await fetch(request);
        
        if (networkResponse.status === 200) {
            const cache = await caches.open(DYNAMIC_CACHE);
            cache.put(request, networkResponse.clone());
        }
        
        return networkResponse;
        
    } catch (error) {
        console.log('Network failed, trying cache for:', request.url);
        
        const cache = await caches.open(DYNAMIC_CACHE);
        const cachedResponse = await cache.match(request);
        
        if (cachedResponse) {
            return cachedResponse;
        }
        
        return await getOfflineFallback(request);
    }
}

/**
 * Handle generic requests - stale while revalidate strategy
 */
async function handleGenericRequest(request) {
    try {
        const cache = await caches.open(DYNAMIC_CACHE);
        const cachedResponse = await cache.match(request);
        
        const fetchPromise = fetch(request).then(networkResponse => {
            if (networkResponse.status === 200) {
                cache.put(request, networkResponse.clone());
            }
            return networkResponse;
        }).catch(() => null);
        
        return cachedResponse || await fetchPromise || await getOfflineFallback(request);
        
    } catch (error) {
        console.error('Failed to handle generic request:', error);
        return await getOfflineFallback(request);
    }
}

/**
 * Update cache in background
 */
async function updateCacheInBackground(request, cache) {
    try {
        const networkResponse = await fetch(request);
        if (networkResponse.status === 200) {
            cache.put(request, networkResponse.clone());
        }
    } catch (error) {
        // Silent fail for background updates
    }
}

/**
 * Get offline fallback response
 */
async function getOfflineFallback(request) {
    const url = new URL(request.url);
    
    // For HTML pages, return the main page
    if (request.headers.get('accept')?.includes('text/html')) {
        const cache = await caches.open(STATIC_CACHE);
        return await cache.match('/index.html') || createOfflinePage();
    }
    
    // For images, return a placeholder
    if (request.headers.get('accept')?.includes('image/')) {
        return createImagePlaceholder();
    }
    
    // For CSS/JS, return empty response
    if (url.pathname.endsWith('.css') || url.pathname.endsWith('.js')) {
        return new Response('', { 
            status: 200, 
            headers: { 'Content-Type': getContentType(url.pathname) }
        });
    }
    
    // Default fallback
    return new Response('Offline', { status: 503 });
}

/**
 * Create offline page
 */
function createOfflinePage() {
    const html = `
        <!DOCTYPE html>
        <html lang="ru">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Офлайн - 17yotk MC Server</title>
            <style>
                body {
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                    background: linear-gradient(135deg, #0c0c0c 0%, #1a1a2e 50%, #16213e 100%);
                    color: white;
                    margin: 0;
                    padding: 0;
                    min-height: 100vh;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    text-align: center;
                }
                .offline-content {
                    max-width: 400px;
                    padding: 2rem;
                }
                .offline-icon {
                    font-size: 4rem;
                    margin-bottom: 1rem;
                    opacity: 0.7;
                }
                .offline-title {
                    font-size: 2rem;
                    margin-bottom: 1rem;
                    color: #6c5ce7;
                }
                .offline-message {
                    font-size: 1.1rem;
                    margin-bottom: 2rem;
                    opacity: 0.8;
                    line-height: 1.6;
                }
                .retry-button {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    border: none;
                    padding: 1rem 2rem;
                    border-radius: 50px;
                    font-size: 1rem;
                    font-weight: 600;
                    cursor: pointer;
                    transition: transform 0.3s ease;
                }
                .retry-button:hover {
                    transform: translateY(-2px);
                }
            </style>
        </head>
        <body>
            <div class="offline-content">
                <div class="offline-icon">📶</div>
                <h1 class="offline-title">Нет подключения</h1>
                <p class="offline-message">
                    Проверьте подключение к интернету и попробуйте снова. 
                    Некоторые функции могут быть доступны в офлайн режиме.
                </p>
                <button class="retry-button" onclick="window.location.reload()">
                    Попробовать снова
                </button>
            </div>
        </body>
        </html>
    `;
    
    return new Response(html, {
        status: 200,
        headers: { 'Content-Type': 'text/html; charset=utf-8' }
    });
}

/**
 * Create image placeholder
 */
function createImagePlaceholder() {
    // Simple 1x1 transparent PNG
    const imageData = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
    const buffer = Uint8Array.from(atob(imageData), c => c.charCodeAt(0));
    
    return new Response(buffer, {
        status: 200,
        headers: { 'Content-Type': 'image/png' }
    });
}

/**
 * Get content type for file extension
 */
function getContentType(pathname) {
    if (pathname.endsWith('.css')) return 'text/css';
    if (pathname.endsWith('.js')) return 'application/javascript';
    if (pathname.endsWith('.json')) return 'application/json';
    return 'text/plain';
}

/**
 * Background sync for failed purchases
 */
self.addEventListener('sync', event => {
    console.log('🔄 Background sync triggered:', event.tag);
    
    if (event.tag === 'retry-purchase') {
        event.waitUntil(retryFailedPurchases());
    }
});

/**
 * Retry failed purchases when connection is restored
 */
async function retryFailedPurchases() {
    try {
        const requests = await getStoredRequests('failed-purchases');
        
        for (const requestData of requests) {
            try {
                const response = await fetch(requestData.url, {
                    method: requestData.method,
                    headers: requestData.headers,
                    body: requestData.body
                });
                
                if (response.ok) {
                    await removeStoredRequest('failed-purchases', requestData.id);
                    await notifyClient('purchase-retry-success', requestData);
                }
            } catch (error) {
                console.error('Failed to retry purchase:', error);
            }
        }
    } catch (error) {
        console.error('Background sync failed:', error);
    }
}

/**
 * Push notification handler
 */
self.addEventListener('push', event => {
    console.log('📱 Push notification received');
    
    if (!event.data) return;
    
    try {
        const data = event.data.json();
        const options = {
            body: data.body || 'Новое уведомление от 17yotk MC Server',
            icon: '/images/logo.png',
            badge: '/images/logo.png',
            image: data.image,
            tag: data.tag || 'donation-notification',
            vibrate: [100, 50, 100],
            data: data.data || {},
            actions: [
                {
                    action: 'view',
                    title: 'Открыть',
                    icon: '/images/logo.png'
                },
                {
                    action: 'close',
                    title: 'Закрыть'
                }
            ]
        };
        
        event.waitUntil(
            self.registration.showNotification(data.title || '17yotk MC Server', options)
        );
    } catch (error) {
        console.error('Failed to show notification:', error);
    }
});

/**
 * Notification click handler
 */
self.addEventListener('notificationclick', event => {
    console.log('🔔 Notification clicked:', event.action);
    
    event.notification.close();
    
    if (event.action === 'view' || !event.action) {
        event.waitUntil(
            clients.matchAll({ type: 'window' }).then(clientList => {
                // Try to focus existing window
                for (const client of clientList) {
                    if (client.url.includes('/') && 'focus' in client) {
                        return client.focus();
                    }
                }
                
                // Open new window
                if (clients.openWindow) {
                    return clients.openWindow('/');
                }
            })
        );
    }
});

/**
 * Message handler for client communication
 */
self.addEventListener('message', event => {
    console.log('💬 Message received from client:', event.data);
    
    const { type, data } = event.data;
    
    switch (type) {
        case 'STORE_FAILED_PURCHASE':
            storeFailedPurchase(data);
            break;
        case 'GET_CACHE_STATUS':
            getCacheStatus().then(status => {
                event.ports[0].postMessage(status);
            });
            break;
        case 'CLEAR_CACHE':
            clearCache().then(() => {
                event.ports[0].postMessage({ success: true });
            });
            break;
        default:
            console.log('Unknown message type:', type);
    }
});

/**
 * Store failed purchase for retry
 */
async function storeFailedPurchase(purchaseData) {
    try {
        const storage = await caches.open('failed-purchases');
        const requests = await getStoredRequests('failed-purchases') || [];
        
        requests.push({
            id: Date.now(),
            timestamp: new Date().toISOString(),
            ...purchaseData
        });
        
        await storage.put(
            new Request('failed-purchases'),
            new Response(JSON.stringify(requests), {
                headers: { 'Content-Type': 'application/json' }
            })
        );
        
        // Register for background sync
        await self.registration.sync.register('retry-purchase');
        
    } catch (error) {
        console.error('Failed to store purchase data:', error);
    }
}

/**
 * Get stored requests from cache
 */
async function getStoredRequests(cacheName) {
    try {
        const cache = await caches.open(cacheName);
        const response = await cache.match(cacheName);
        
        if (response) {
            return await response.json();
        }
        
        return [];
    } catch (error) {
        console.error('Failed to get stored requests:', error);
        return [];
    }
}

/**
 * Remove stored request
 */
async function removeStoredRequest(cacheName, requestId) {
    try {
        const requests = await getStoredRequests(cacheName);
        const updatedRequests = requests.filter(req => req.id !== requestId);
        
        const cache = await caches.open(cacheName);
        await cache.put(
            new Request(cacheName),
            new Response(JSON.stringify(updatedRequests), {
                headers: { 'Content-Type': 'application/json' }
            })
        );
    } catch (error) {
        console.error('Failed to remove stored request:', error);
    }
}

/**
 * Notify client about events
 */
async function notifyClient(type, data) {
    try {
        const clientList = await clients.matchAll();
        
        clientList.forEach(client => {
            client.postMessage({ type, data });
        });
    } catch (error) {
        console.error('Failed to notify client:', error);
    }
}

/**
 * Get cache status
 */
async function getCacheStatus() {
    try {
        const cacheNames = await caches.keys();
        const status = {};
        
        for (const cacheName of cacheNames) {
            const cache = await caches.open(cacheName);
            const requests = await cache.keys();
            status[cacheName] = requests.length;
        }
        
        return status;
    } catch (error) {
        console.error('Failed to get cache status:', error);
        return {};
    }
}

/**
 * Clear all caches
 */
async function clearCache() {
    try {
        const cacheNames = await caches.keys();
        
        await Promise.all(
            cacheNames.map(cacheName => caches.delete(cacheName))
        );
        
        console.log('✅ All caches cleared');
    } catch (error) {
        console.error('❌ Failed to clear cache:', error);
    }
}

// Log service worker status
console.log('🎮 17yotk MC Server Service Worker loaded successfully');