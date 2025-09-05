import { useEffect } from "react";
import { registerSW } from "virtual:pwa-register";
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

        // Hook up vite-plugin-pwa update flow to show a prompt
        const updateSW = registerSW({
            immediate: true,
            onNeedRefresh() {
                openModal(
                    "Versi baru aplikasi tersedia. Muat ulang untuk memperbarui?",
                    "confirmation",
                    async () => {
                        updateSW(true);
                    },
                    "Versi Baru Tersedia",
                    true,
                    "md"
                );
            },
            onOfflineReady() {
                // Optional: notify offline ready
            },
        });

        // We also keep polling version.json for explicit checks.

        // Initial check
        checkVersion();

        // Periodic check
        const interval = setInterval(checkVersion, CHECK_INTERVAL);

        return () => {
            clearInterval(interval);
            // no-op
        };
    }, [openModal]);

    return { modalState, closeModal };
}
