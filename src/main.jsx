import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

import "./index.css";
import App from "./App.jsx";
import MaintenanceView from "./maintenance/pages/MaintenanceView.jsx";
import { useVersionCheck } from "./shared/hooks/useVersionCheck.js";
import NewModal from "./shared/Components/Modal/NewModal.jsx";
import PWAInstallPrompt from "./shared/Components/PWA/PWAInstallPrompt.jsx";

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

// Create a client
const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 5 * 60 * 1000, // 5 minutes
            cacheTime: 10 * 60 * 1000, // 10 minutes
            refetchOnWindowFocus: false,
            retry: 3,
        },
    },
});

const AppWrapper = () => {
    const { modalState, closeModal } = useVersionCheck();
    const isMaintenance = false;

    return (
        <StrictMode>
            <QueryClientProvider client={queryClient}>
                {isMaintenance ? <MaintenanceView /> : <App />}
                <ReactQueryDevtools initialIsOpen={false} />
                <PWAInstallPrompt />
                <NewModal modalState={modalState} onClose={closeModal} />
            </QueryClientProvider>
        </StrictMode>
    );
};

createRoot(document.getElementById("root")).render(<AppWrapper />);
