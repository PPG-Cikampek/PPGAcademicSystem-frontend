import { useState, useEffect } from "react";

const PWAInstallPrompt = () => {
    const [supportsPWA, setSupportsPWA] = useState(false);
    const [promptInstall, setPromptInstall] = useState(null);
    const [showInstallButton, setShowInstallButton] = useState(false);

    useEffect(() => {
        const handler = (e) => {
            e.preventDefault();
            setSupportsPWA(true);
            setPromptInstall(e);
            setShowInstallButton(true);
        };

        window.addEventListener("beforeinstallprompt", handler);

        // Check if app is already installed
        if (
            window.matchMedia &&
            window.matchMedia("(display-mode: standalone)").matches
        ) {
            setShowInstallButton(false);
        }

        return () => window.removeEventListener("beforeinstallprompt", handler);
    }, []);

    const onClick = (evt) => {
        evt.preventDefault();
        if (!promptInstall) {
            return;
        }
        promptInstall.prompt();
        promptInstall.userChoice.then((result) => {
            if (result.outcome === "accepted") {
                console.log("User accepted the install prompt");
                setShowInstallButton(false);
            } else {
                console.log("User dismissed the install prompt");
            }
            setPromptInstall(null);
        });
    };

    if (!supportsPWA || !showInstallButton) {
        return null;
    }

    return (
        <div className="fixed bottom-4 right-4 z-50">
            <div className="bg-blue-600 text-white p-4 rounded-lg shadow-lg max-w-sm">
                <div className="flex items-start gap-3">
                    <div className="flex-1">
                        <h3 className="font-semibold text-sm">
                            Install Aplikasi
                        </h3>
                        <p className="text-xs mt-1 opacity-90">
                            Install E-Siakad PPG?
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setShowInstallButton(false)}
                            className="text-white/70 hover:text-white text-sm"
                        >
                            ✕
                        </button>
                    </div>
                </div>
                <div className="flex gap-2 mt-3">
                    <button
                        onClick={onClick}
                        className="bg-white text-blue-600 px-3 py-1 rounded text-sm font-medium hover:bg-gray-100"
                    >
                        Install
                    </button>
                    <button
                        onClick={() => setShowInstallButton(false)}
                        className="text-white/70 hover:text-white text-sm px-2"
                    >
                        Tutup
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PWAInstallPrompt;
