import React, { useRef, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import QrScanner from 'qr-scanner';
import beep from '../../assets/audios/store-scanner-beep-90395.mp3';
import ErrorCard from '../../shared/Components/UIElements/ErrorCard';

const isIOS = () => {
    return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
};

const QRCodeScanner = ({ errorMessage }) => {
    const videoRef = useRef(null);
    const beepRef = useRef(null);
    const navigate = useNavigate();
    const [scanning, setScanning] = useState(false);
    const [cooldown, setCooldown] = useState(false);
    const [status, setStatus] = useState('Initializing...');
    const [error, setError] = useState(false);
    const [instruction, setInstruction] = useState('');
    const [retryCount, setRetryCount] = useState(0);
    const [err, setErr] = useState(errorMessage || "");
    const [audioUnlocked, setAudioUnlocked] = useState(false);

    // Unlock audio on user gesture (for iOS/Safari)
    useEffect(() => {
        const unlockAudio = () => {
            if (beepRef.current && !audioUnlocked) {
                beepRef.current.play().then(() => {
                    beepRef.current.pause();
                    beepRef.current.currentTime = 0;
                    setAudioUnlocked(true);
                }).catch(() => { });
            }
        };
        window.addEventListener('touchstart', unlockAudio, { once: true });
        window.addEventListener('click', unlockAudio, { once: true });
        return () => {
            window.removeEventListener('touchstart', unlockAudio);
            window.removeEventListener('click', unlockAudio);
        };
    }, [audioUnlocked]);

    useEffect(() => {
        let qrScanner;

        const setupScanner = async () => {
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                setError(true);
                setStatus('Camera API tidak didukung di browser ini.');
                setInstruction('Coba gunakan browser terbaru seperti Chrome, Firefox, atau Safari.');
                return;
            }

            if (videoRef.current) {
                qrScanner = new QrScanner(
                    videoRef.current,
                    async result => {
                        if (!cooldown) {
                            await handleScan(result.data);
                        }
                    },
                    {
                        returnDetailedScanResult: true,
                        highlightScanRegion: true,
                        highlightCodeOutline: true,
                    }
                );

                try {
                    setStatus('Sedang mengakses kamera...');
                    // iOS/Safari: force environment camera if possible
                    await qrScanner.start({ facingMode: { ideal: 'environment' } });
                    setStatus('Membaca kode QR...');
                    setScanning(true);
                    setError(false);
                } catch (error) {
                    setError(true);
                    setStatus('Camera error: ' + error.message);
                    setInstruction(
                        'Langkah Penyelesaian:\n' +
                        '1. Pastikan akses kamera diizinkan.\n' +
                        '2. Lakukan refresh halaman.\n' +
                        '3. Jika masih error, login menggunakan browser yang berbeda.\n' +
                        (isIOS() ? '4. Untuk iPhone/iPad: Pastikan akses kamera diaktifkan di Pengaturan > Safari.' : '')
                    );
                    // Retry up to 5 times if error occurs, with proper delay
                    if (retryCount < 5) {
                        setStatus(`Sedang mencoba ulang... (${retryCount + 1}/5)`);
                        setTimeout(() => {
                            setRetryCount(prev => prev + 1);
                        }, 2000);
                    } else {
                        qrScanner?.destroy();
                        setStatus('Gagal mengakses kamera setelah 5 percobaan. Silakan cek pengaturan kamera atau gunakan browser lain.');
                    }
                }
            } else {
                setError(true);
                setStatus('Error: Element video tidak ditemukan!');
                setInstruction('Langkah Penyelesaian: Login menggunakan browser yang berbeda.');
            }
        };

        setupScanner();

        return () => {
            setError(false);
            setScanning(false);
            qrScanner?.destroy();
        };
    }, [cooldown, retryCount]);

    const handleScan = async (data) => {
        if (!data) return;
        setCooldown(true);

        // Play beep sound (ensure audio is unlocked)
        if (beepRef.current) {
            try {
                await beepRef.current.play();
            } catch (e) {
                // iOS/Safari: fallback, audio will play on next user gesture
            }
        }

        setErr(null);
        // Navigate to verification page with scanned data
        navigate('/munaqasyah/student', {
            state: {
                scannedData: data
            }
        });

        // Add cooldown to prevent multiple scans
        setTimeout(() => {
            setCooldown(false);
        }, 1000);
    };

    return (
        <div className="flex flex-col items-center justify-center h-full w-full p-4">
            {err && (
                <div className="mb-4">
                    <ErrorCard error={err} />
                </div>
            )}
            <div className="relative w-72 h-72 border-2 border-gray-700 shadow-md rounded-md overflow-hidden">
                <video
                    ref={videoRef}
                    className="absolute inset-0 w-full h-full object-cover"
                    playsInline={true}
                    muted={true}
                    autoPlay={true}
                    // iOS/Safari compatibility
                    style={{ WebkitTransform: 'scaleX(-1)' }}
                />
                {cooldown || !scanning ? (
                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
                        <p className="text-white text-center px-4 whitespace-pre-line" >{status}</p>
                    </div>
                ) : (
                    <div className="absolute inset-[8.25%] w-5/6 h-5/6 pointer-events-none">
                        <div className="absolute top-0 left-0 w-12 h-12 border-t-4 border-l-4 border-white"></div>
                        <div className="absolute top-0 right-0 w-12 h-12 border-t-4 border-r-4 border-white"></div>
                        <div className="absolute bottom-0 left-0 w-12 h-12 border-b-4 border-l-4 border-white"></div>
                        <div className="absolute bottom-0 right-0 w-12 h-12 border-b-4 border-r-4 border-white"></div>
                    </div>
                )}
            </div>
            <div>
                {instruction && (
                    <div className='mt-6 px-4 italic text-gray-600 whitespace-pre-line'>{instruction}</div>
                )}
            </div>
            <audio ref={beepRef} src={beep} preload="auto" />
        </div>
    );
};

export default QRCodeScanner;