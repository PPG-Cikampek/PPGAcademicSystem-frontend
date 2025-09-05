import { StrictMode, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

import "./index.css";
import App from "./App.jsx";
import MaintenanceView from "./maintenance/pages/MaintenanceView.jsx";
import { useVersionCheck } from "./shared/hooks/useVersionCheck.js";
import NewModal from "./shared/Components/Modal/NewModal.jsx";
import PWAInstallPrompt from "./shared/Components/PWA/PWAInstallPrompt.jsx";
import { useMaintenanceFlag } from "./shared/hooks/useMaintenanceFlag.js";

// Register service worker
if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
        navigator.serviceWorker
            .register("/sw.js", {
                scope: "/",
                updateViaCache: "none",
            })
            .then((registration) => {
                console.log("SW registered: ", registration);

                // Check for updates
                registration.addEventListener("updatefound", () => {
                    const newWorker = registration.installing;
                    newWorker.addEventListener("statechange", () => {
                        if (
                            newWorker.state === "installed" &&
                            navigator.serviceWorker.controller
                        ) {
                            // New content is available
                            console.log(
                                "New content is available; please refresh."
                            );
                        }
                    });
                });
            })
            .catch((registrationError) => {
                console.log("SW registration failed: ", registrationError);
            });
    });
}

// PWA Install Detection
let deferredPrompt;
window.addEventListener("beforeinstallprompt", (e) => {
    console.log("PWA install prompt available");
    deferredPrompt = e;
});

window.addEventListener("appinstalled", (evt) => {
    console.log("PWA was installed");
});

// Buffer polyfill for libraries (eg. @react-pdf/renderer) that expect Node's Buffer
// Dynamically import the polyfill to avoid Vite externalizing `buffer` during static analysis.
if (typeof globalThis.Buffer === "undefined") {
    import("buffer")
        .then(({ Buffer: Buf }) => {
            globalThis.Buffer = Buf;
            // also set window for any libraries referencing window.Buffer
            try {
                window.Buffer = Buf;
            } catch (e) {
                // ignore on non-browser-like environments
            }
        })
        .catch(() => {
            // If import fails, leave it undefined — libraries should handle absence gracefully
        });
}

// Create a client
const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 5 * 60 * 1000, // 5 minutes
            cacheTime: 10 * 60 * 1000, // 10 minutes
            refetchOnMount: "always",
            refetchOnWindowFocus: true,
            retry: 3,
        },
    },
});

const AppWrapper = () => {
    const { modalState, closeModal } = useVersionCheck();
    const { maintenance: isMaintenance, targetDate, loading } = useMaintenanceFlag({
        defaultValue: false,
    });

    console.log("Maintenance mode:", isMaintenance, "targetDate:", targetDate);

    useEffect(() => {
        if (screen.orientation && screen.orientation.lock) {
            screen.orientation.lock("portrait").catch((err) => {
                console.warn("Orientation lock failed:", err);
            });
        }
    }, []);

    // Optionally, you can render nothing or a lightweight splash while we read the flag
    if (loading) return null;

    return (
        <StrictMode>
            <QueryClientProvider client={queryClient}>


                {/* {isMaintenance ? <MaintenanceView targetDate={targetDate} /> : <App />} */}
                <App />
                
                <ReactQueryDevtools initialIsOpen={false} />
                <PWAInstallPrompt />
                <NewModal
                    modalState={modalState}
                    onClose={closeModal}
                    cancelText="Nanti"
                />
            </QueryClientProvider>
        </StrictMode>
    );
};

createRoot(document.getElementById("root")).render(<AppWrapper />);
