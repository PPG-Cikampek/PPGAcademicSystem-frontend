let CACHE_NAME = "ppg-academic-v1";
const urlsToCache = [
    "/",
    "/index.html",
    "/manifest.json",
    "/version.json",
    "/icons/icon-192x192.png",
    "/icons/icon-512x512.png",
];

let currentVersion = null;

// Install event
self.addEventListener("install", (event) => {
    self.skipWaiting(); // Force activation
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(urlsToCache);
        })
    );
});

// Fetch event
self.addEventListener("fetch", (event) => {
    event.respondWith(
        caches.match(event.request).then((response) => {
            // Return cached version or fetch from network
            return response || fetch(event.request);
        })
    );
});

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    self.clients.claim(); // Take control of all clients

    // Start checking for version updates
    checkForUpdates();
});

// Function to check for version updates
function checkForUpdates() {
    fetch("/version.json?t=" + Date.now())
        .then((response) => response.json())
        .then((data) => {
            if (currentVersion === null) {
                currentVersion = data.version;
                CACHE_NAME = `ppg-academic-v${data.version}`;
            } else if (currentVersion !== data.version) {
                console.log("New version detected in SW:", data.version);
                currentVersion = data.version;
                CACHE_NAME = `ppg-academic-v${data.version}`;
                // Update cache with new version
                caches.open(CACHE_NAME).then((cache) => {
                    return cache.addAll(urlsToCache);
                });
                // Notify clients about the update
                self.clients.matchAll().then((clients) => {
                    clients.forEach((client) => {
                        client.postMessage({
                            type: "UPDATE_AVAILABLE",
                            newVersion: data.version,
                        });
                    });
                });
            }
        })
        .catch((err) => console.error("Version check failed in SW:", err));
}

// Check for updates every minute
setInterval(checkForUpdates, 60 * 1000);

// Listen for messages from the main thread
self.addEventListener("message", (event) => {
    if (event.data && event.data.type === "SKIP_WAITING") {
        self.skipWaiting();
    }
});
