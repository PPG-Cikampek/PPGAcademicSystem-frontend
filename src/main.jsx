import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

import "./index.css";
import App from "./App.jsx";
import MaintenanceView from "./maintenance/pages/MaintenanceView.jsx";
import { useVersionCheck } from "./shared/hooks/useVersionCheck.js";

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
    useVersionCheck();
    const isMaintenance = false;

    return (
        <StrictMode>
            <QueryClientProvider client={queryClient}>
                {isMaintenance ? <MaintenanceView /> : <App />}
                <ReactQueryDevtools initialIsOpen={false} />
            </QueryClientProvider>
        </StrictMode>
    );
};

createRoot(document.getElementById("root")).render(<AppWrapper />);
