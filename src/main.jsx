import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

import "./index.css";
import App from "./App.jsx";
import MaintenanceView from "./maintenance/pages/MaintenanceView.jsx";
import { useVersionCheck } from "./shared/hooks/useVersionCheck.js";
import NewModal from "./shared/Components/Modal/NewModal.jsx";

// Register service worker
if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
        navigator.serviceWorker
            .register("/sw.js")
            .then((registration) => {
                console.log("SW registered: ", registration);
            })
            .catch((registrationError) => {
                console.log("SW registration failed: ", registrationError);
            });
    });
}

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
                <NewModal modalState={modalState} onClose={closeModal} />
            </QueryClientProvider>
        </StrictMode>
    );
};

createRoot(document.getElementById("root")).render(<AppWrapper />);
