import { useEffect } from "react";
import useModal from "./useNewModal";

const CHECK_INTERVAL = 1000 * 60; // Check every minute

const clearCacheAndReload = async () => {
    if ("caches" in window) {
        try {
            // Delete all caches
            const cacheKeys = await caches.keys();
            await Promise.all(cacheKeys.map((key) => caches.delete(key)));

            // Reload the page
            window.location.reload(true);
        } catch (err) {
            console.error("Cache clearing failed:", err);
            // Fallback to normal reload
            window.location.reload(true);
        }
    } else {
        window.location.reload(true);
    }
};

export function useVersionCheck() {
    const { modalState, openModal, closeModal } = useModal();

    useEffect(() => {
        let currentVersion = null;

        const checkVersion = async () => {
            try {
                const response = await fetch(
                    "/version.json?t=" + new Date().getTime()
                );
                const data = await response.json();

                if (currentVersion === null) {
                    currentVersion = data.version;
                    console.log("App version:", currentVersion);
                } else {
                    console.log("Current version:", currentVersion);
                    console.log("Server version:", data.version);

                    if (currentVersion !== data.version) {
                        console.log(
                            "New version detected. Showing confirmation modal..."
                        );
                        openModal(
                            "Versi baru aplikasi tersedia. Apakah Anda ingin memuat ulang untuk memperbarui?",
                            "confirmation",
                            async () => {
                                await clearCacheAndReload();
                            },
                            "Versi Baru Tersedia",
                            true,
                            "md"
                        );
                    }
                }
            } catch (error) {
                console.error("Version check failed:", error);
            }
        };

        // Listen for service worker messages
        const handleSWMessage = (event) => {
            if (event.data && event.data.type === "UPDATE_AVAILABLE") {
                console.log("SW detected update:", event.data.newVersion);
                // Optionally, show update prompt or auto-update
                openModal(
                    "Versi baru aplikasi tersedia. Apakah Anda ingin memperbarui sekarang?",
                    "confirmation",
                    async () => {
                        await clearCacheAndReload();
                    },
                    "Versi Baru Tersedia",
                    true,
                    "md"
                );
            }
        };

        if ("serviceWorker" in navigator) {
            navigator.serviceWorker.addEventListener(
                "message",
                handleSWMessage
            );
        }

        // Initial check
        checkVersion();

        // Periodic check
        const interval = setInterval(checkVersion, CHECK_INTERVAL);

        return () => {
            clearInterval(interval);
            if ("serviceWorker" in navigator) {
                navigator.serviceWorker.removeEventListener(
                    "message",
                    handleSWMessage
                );
            }
        };
    }, [openModal]);

    return { modalState, closeModal };
}
