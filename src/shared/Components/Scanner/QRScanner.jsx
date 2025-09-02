import { useRef, useEffect, useState } from "react";
import QrScanner from "qr-scanner";
import beep from "../../../assets/audios/store-scanner-beep-90395.mp3";

const isIOS = () => {
    return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
};

/**
 * Reusable QR Code Scanner Component
 *
 * @param {Object} props - Component props
 * @param {Function} props.onScan - Callback function called when QR code is successfully scanned
 * @param {Function} props.onError - Optional callback function called when an error occurs
 * @param {string} props.errorMessage - Optional error message to display
 * @param {number} props.cooldownDuration - Cooldown duration in milliseconds (default: 1000)
 * @param {boolean} props.enableBeep - Whether to play beep sound on scan (default: true)
 * @param {Object} props.scannerOptions - QR scanner configuration options
 * @param {string} props.className - Additional CSS classes for the container
 * @param {Object} props.style - Inline styles for the container
 * @param {string} props.videoClassName - CSS classes for the video element
 * @param {Object} props.videoStyle - Inline styles for the video element
 * @param {number} props.maxRetries - Maximum number of retry attempts (default: 5)
 * @param {number} props.retryDelay - Delay between retries in milliseconds (default: 2000)
 * @param {Object} props.overlayConfig - Configuration for the scanning overlay
 * @param {boolean} props.showOverlay - Whether to show the scanning frame overlay (default: true)
 * @param {string} props.initialMessage - Initial status message (default: "Initializing...")
 * @param {string} props.accessingCameraMessage - Message while accessing camera (default: "Sedang mengakses kamera...")
 * @param {string} props.scanningMessage - Message while scanning (default: "Membaca kode QR...")
 */
const QRScanner = ({
    onScan,
    onError,
    errorMessage,
    cooldownDuration = 1000,
    enableBeep = true,
    scannerOptions = {
        returnDetailedScanResult: true,
        highlightScanRegion: true,
        highlightCodeOutline: true,
    },
    className = "",
    style = {},
    videoClassName = "",
    videoStyle = {},
    maxRetries = 5,
    retryDelay = 2000,
    overlayConfig = {
        cornerSize: "w-12 h-12",
        borderWidth: "border-4",
        borderColor: "border-white",
        inset: "inset-[8.25%]",
        size: "w-5/6 h-5/6",
    },
    showOverlay = true,
    initialMessage = "Initializing...",
    accessingCameraMessage = "Sedang mengakses kamera...",
    scanningMessage = "Membaca kode QR...",
}) => {
    const videoRef = useRef(null);
    const beepRef = useRef(null);
    const [scanning, setScanning] = useState(false);
    const [cooldown, setCooldown] = useState(false);
    const [status, setStatus] = useState(initialMessage);
    const [error, setError] = useState(false);
    const [instruction, setInstruction] = useState("");
    const [retryCount, setRetryCount] = useState(0);
    const [currentError, setCurrentError] = useState(errorMessage || "");
    const [audioUnlocked, setAudioUnlocked] = useState(false);

    // Unlock audio on user gesture (for iOS/Safari)
    useEffect(() => {
        if (!enableBeep) return;

        const unlockAudio = () => {
            if (beepRef.current && !audioUnlocked) {
                beepRef.current
                    .play()
                    .then(() => {
                        beepRef.current.pause();
                        beepRef.current.currentTime = 0;
                        setAudioUnlocked(true);
                    })
                    .catch(() => {});
            }
        };

        window.addEventListener("touchstart", unlockAudio, { once: true });
        window.addEventListener("click", unlockAudio, { once: true });

        return () => {
            window.removeEventListener("touchstart", unlockAudio);
            window.removeEventListener("click", unlockAudio);
        };
    }, [audioUnlocked, enableBeep]);

    useEffect(() => {
        let qrScanner;

        const setupScanner = async () => {
            if (
                !navigator.mediaDevices ||
                !navigator.mediaDevices.getUserMedia
            ) {
                const errorMsg = "Camera API tidak didukung di browser ini.";
                const instructionMsg =
                    "Coba gunakan browser terbaru seperti Chrome, Firefox, atau Safari.";

                setError(true);
                setStatus(errorMsg);
                setInstruction(instructionMsg);
                setCurrentError(errorMsg);

                if (onError) {
                    onError(new Error(errorMsg), instructionMsg);
                }
                return;
            }

            if (videoRef.current) {
                qrScanner = new QrScanner(
                    videoRef.current,
                    async (result) => {
                        if (!cooldown && onScan) {
                            await handleScan(result.data);
                        }
                    },
                    scannerOptions
                );

                try {
                    setStatus(accessingCameraMessage);

                    // iOS/Safari: force environment camera if possible
                    await qrScanner.start({
                        facingMode: { ideal: "environment" },
                    });

                    setStatus(scanningMessage);
                    setScanning(true);
                    setError(false);
                    setCurrentError("");
                } catch (error) {
                    const errorMsg = "Camera error: " + error.message;
                    const instructionMsg =
                        "Terjadi kesalahan perangkat!\n" +
                        "Langkah Penyelesaian:\n" +
                        "1. Pastikan akses kamera diizinkan.\n" +
                        "2. Lakukan refresh halaman.\n" +
                        "3. Jika masih error, login menggunakan browser yang berbeda.\n" +
                        (isIOS()
                            ? "4. Untuk iPhone/iPad: Pastikan akses kamera diaktifkan di Pengaturan > Safari."
                            : "");

                    setError(true);
                    setStatus(errorMsg);
                    setInstruction(instructionMsg);
                    setCurrentError(errorMsg);

                    if (onError) {
                        onError(error, instructionMsg);
                    }

                    // Retry logic
                    if (retryCount < maxRetries) {
                        setStatus(
                            `Sedang mencoba ulang... (${
                                retryCount + 1
                            }/${maxRetries})`
                        );
                        setTimeout(() => {
                            setRetryCount((prev) => prev + 1);
                        }, retryDelay);
                    } else {
                        qrScanner?.destroy();
                        const finalErrorMsg = `Gagal mengakses kamera setelah ${maxRetries}x percobaan. Mohon cek pengaturan kamera atau gunakan browser lain.`;
                        setStatus(finalErrorMsg);
                        if (onError) {
                            onError(new Error(finalErrorMsg), instructionMsg);
                        }
                    }
                }
            } else {
                const errorMsg = "Error: Element video tidak ditemukan!";
                const instructionMsg =
                    "Terjadi kesalahan perangkat!\nLangkah Penyelesaian: Login menggunakan browser yang berbeda.";

                setError(true);
                setStatus(errorMsg);
                setInstruction(instructionMsg);
                setCurrentError(errorMsg);

                if (onError) {
                    onError(new Error(errorMsg), instructionMsg);
                }
            }
        };

        setupScanner();

        return () => {
            setError(false);
            setScanning(false);
            qrScanner?.destroy();
        };
    }, [
        cooldown,
        retryCount,
        onError,
        maxRetries,
        retryDelay,
        scannerOptions,
        accessingCameraMessage,
        scanningMessage,
    ]);

    const handleScan = async (data) => {
        if (!data) return;

        setCooldown(true);

        // Play beep sound if enabled
        if (enableBeep && beepRef.current) {
            try {
                await beepRef.current.play();
            } catch (e) {
                // iOS/Safari: fallback, audio will play on next user gesture
                console.warn("Audio playback failed:", e);
            }
        }

        setCurrentError("");

        // Call the onScan callback
        if (onScan) {
            try {
                await onScan(data);
            } catch (error) {
                console.error("Error in onScan callback:", error);
                if (onError) {
                    onError(error);
                }
            }
        }

        // Add cooldown to prevent multiple scans
        setTimeout(() => {
            setCooldown(false);
        }, cooldownDuration);
    };

    const defaultContainerStyles =
        "relative w-72 h-72 border-2 border-gray-700 shadow-md rounded-md overflow-hidden";
    const defaultVideoStyles = "absolute inset-0 w-full h-full object-cover";

    return (
        <div
            className={`flex flex-col items-center justify-center h-full w-full p-4 ${className}`}
            style={style}
        >
            <div className={defaultContainerStyles}>
                <video
                    ref={videoRef}
                    className={`${defaultVideoStyles} ${videoClassName}`}
                    style={{
                        WebkitTransform: "scaleX(-1)", // iOS/Safari compatibility
                        ...videoStyle,
                    }}
                    playsInline={true}
                    muted={true}
                    autoPlay={true}
                />

                {(cooldown || !scanning || error) && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
                        <p className="text-white text-center px-4 whitespace-pre-line">
                            {status}
                        </p>
                    </div>
                )}

                {showOverlay && scanning && !cooldown && !error && (
                    <div
                        className={`absolute ${overlayConfig.inset} ${overlayConfig.size} pointer-events-none`}
                    >
                        <div
                            className={`absolute top-0 left-0 ${overlayConfig.cornerSize} border-t-4 border-l-4 ${overlayConfig.borderColor}`}
                        ></div>
                        <div
                            className={`absolute top-0 right-0 ${overlayConfig.cornerSize} border-t-4 border-r-4 ${overlayConfig.borderColor}`}
                        ></div>
                        <div
                            className={`absolute bottom-0 left-0 ${overlayConfig.cornerSize} border-b-4 border-l-4 ${overlayConfig.borderColor}`}
                        ></div>
                        <div
                            className={`absolute bottom-0 right-0 ${overlayConfig.cornerSize} border-b-4 border-r-4 ${overlayConfig.borderColor}`}
                        ></div>
                    </div>
                )}
            </div>

            {instruction && (
                <div className="mt-6 px-4 italic text-gray-600 whitespace-pre-line">
                    {instruction}
                </div>
            )}

            {enableBeep && <audio ref={beepRef} src={beep} preload="auto" />}
        </div>
    );
};

export default QRScanner;
