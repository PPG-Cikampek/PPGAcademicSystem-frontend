import React, { useRef, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import QrScanner from 'qr-scanner';
import beep from '../../assets/audios/store-scanner-beep-90395.mp3';

const QRCodeScanner = () => {
    const videoRef = useRef(null);
    const beepRef = useRef(null);
    const navigate = useNavigate();
    const [scannedData, setScannedData] = useState(null);
    const [scanning, setScanning] = useState(false);
    const [cooldown, setCooldown] = useState(false);

    useEffect(() => {
        let qrScanner;

        const setupScanner = async () => {
            if (videoRef.current) {
                qrScanner = new QrScanner(
                    videoRef.current,
                    async result => {
                        if (!cooldown) {
                            await handleScan(result.data);
                        }
                    },
                    { returnDetailedScanResult: true }
                );

                try {
                    await qrScanner.start();
                    setScanning(true);
                } catch (error) {
                    console.error('Camera access denied or unavailable:', error);
                }
            } else {
                console.error('Video element not found');
            }
        };

        setupScanner();

        return () => {
            qrScanner?.destroy();
            setScanning(false);
        };
    }, [cooldown]);

    const handleScan = async (data) => {
        if (!data) return;
        setCooldown(true);

        // Play beep sound
        if (beepRef.current) {
            beepRef.current.play();
            await new Promise(resolve => {
                beepRef.current.onended = resolve;
            });
        }

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
            <div className="relative w-72 h-72 border-2 border-gray-700 shadow-md rounded-md overflow-hidden">
                <video
                    ref={videoRef}
                    className="absolute inset-0 w-full h-full object-cover"
                    playsInline
                />
                <div className="absolute inset-[8.25%] w-5/6 h-5/6 pointer-events-none">
                    <div className="absolute top-0 left-0 w-12 h-12 border-t-4 border-l-4 border-white"></div>
                    <div className="absolute top-0 right-0 w-12 h-12 border-t-4 border-r-4 border-white"></div>
                    <div className="absolute bottom-0 left-0 w-12 h-12 border-b-4 border-l-4 border-white"></div>
                    <div className="absolute bottom-0 right-0 w-12 h-12 border-b-4 border-r-4 border-white"></div>
                </div>
            </div>
            <audio ref={beepRef} src={beep} preload="auto" />
        </div>
    );
};

export default QRCodeScanner;
