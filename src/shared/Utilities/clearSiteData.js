// Utility function to clear site data (cookies, localStorage, sessionStorage, caches)
const clearSiteData = () => {
    console.log("Clearing site data...");
    // 🔹 Clear cookies
    document.cookie.split(";").forEach((cookie) => {
        document.cookie = cookie
            .replace(/^ +/, "")
            .replace(/=.*/, "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/");
    });

    // 🔹 Clear localStorage & sessionStorage
    localStorage.clear();
    sessionStorage.clear();

    // 🔹 Clear caches (if using service workers / PWA)
    if ("caches" in window) {
        caches.keys().then((names) => {
            names.forEach((name) => caches.delete(name));
        });
    }
    console.log("Site data cleared successfully. Redirecting to login page...");
};

export default clearSiteData;
