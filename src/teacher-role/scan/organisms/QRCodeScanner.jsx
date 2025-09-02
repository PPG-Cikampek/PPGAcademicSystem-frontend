import { useRef, useEffect, useState, useContext } from "react";
import QrScanner from "qr-scanner";

import { StudentAttendanceContext } from "../context/StudentAttendanceContext";

import beep from "../../../assets/audios/store-scanner-beep-90395.mp3";
import SequentialAnimation from "../../shared/Components/Animation/SequentialAnimation";

const QRCodeScanner = () => {
    const videoRef = useRef(null);
    const beepRef = useRef(null);
    const [scanning, setScanning] = useState(false);
    const [scannedData, setScannedData] = useState(null);
    const [cooldown, setCooldown] = useState(false);
    const [scanSuccess, setScanSuccess] = useState(false);
    const { state, dispatch, getStudent, hasStudent } = useContext(
        StudentAttendanceContext
    );
    const [status, setStatus] = useState("Initializing...");
    const [retryCount, setRetryCount] = useState(0);

    useEffect(() => {
        let qrScanner;

        const setupScanner = async () => {
            if (videoRef.current) {
                qrScanner = new QrScanner(
                    videoRef.current,
                    async (result) => {
                        if (!cooldown) {
                            await handleScan(result.data);
                        }
                    },
                    { returnDetailedScanResult: true }
                );

                // Start scanning
                try {
                    setStatus("Sedang mengakses kamera...");
                    await qrScanner.start();
                    setStatus("Membaca kode QR...");
                    setScanning(true);
                } catch (error) {
                    console.error(
                        "Camera access denied or unavailable:",
                        error
                    );
                    setStatus("Camera error: " + error.message);

                    // Retry once if error occurs
                    if (retryCount === 0) {
                        setStatus("Sedang mencoba ulang...");
                        setRetryCount(1);
                        setTimeout(setupScanner, 2000);
                    }
                }
            } else {
                setStatus("Error: Element video tidak ditemukan!");
            }
        };

        setupScanner();

        return () => {
            qrScanner?.destroy();
            setScanning(false);
        };
    }, [retryCount]); // Removed cooldown dependency - scanner stays alive

    const getPresenceStatus = (timeString) => {
        // Guard against null/undefined timeString
        if (!timeString || typeof timeString !== "string") {
            return "Hadir"; // Default to present if no time configured
        }

        // Get the current time
        const now = new Date();
        const currentHours = now.getHours();
        const currentMinutes = now.getMinutes();

        // Parse the input time string safely
        const timeParts = timeString.split(":");
        if (timeParts.length !== 2) {
            return "Hadir"; // Default if time format is invalid
        }

        const [inputHours, inputMinutes] = timeParts.map(Number);

        // Validate parsed numbers
        if (isNaN(inputHours) || isNaN(inputMinutes)) {
            return "Hadir"; // Default if parsing failed
        }

        // Compare the times
        if (
            currentHours > inputHours ||
            (currentHours === inputHours && currentMinutes > inputMinutes)
        ) {
            return "Terlambat"; // Current time is later
        }
        if (
            currentHours < inputHours ||
            (currentHours === inputHours && currentMinutes < inputMinutes)
        ) {
            return "Hadir"; // Current time is earlier
        }
        return "Hadir"; // Times are equal
    };

    const dataHandler = (data) => {
        dispatch({
            type: "SET_STATUS",
            payload: data,
        });
    };

    const handleScan = async (data) => {
        // Guard against scanning when classStartTime is not available
        if (!state.classStartTime) {
            console.warn("Class start time not available, skipping scan");
            return;
        }

        setScanSuccess(true);
        setCooldown(true); // Enable cooldown to prevent rapid re-scanning

        const isFound = hasStudent(data);
        if (!isFound) {
            setScannedData("Kode QR tidak dikenali!");
        } else {
            const student = getStudent(data);
            setScannedData({
                nis: data,
                status: getPresenceStatus(state.classStartTime),
                name: student.studentId.name,
            });
        }

        // Play beep sound
        if (beepRef.current) {
            beepRef.current.play();
        }

        // LOGIC TO PROCESS DATA HERE
        const attendanceData = {
            id: data,
            newStatus: getPresenceStatus(state.classStartTime),
            timestamp: Date.now(),
        };
        dataHandler(attendanceData);
        console.log(attendanceData);

        // Wait for beep sound to finish and add a brief cooldown before resuming scanning
        if (beepRef.current) {
            await new Promise((resolve) => {
                beepRef.current.onended = resolve;
            });
        }

        // Set a short delay to avoid immediate re-scanning after the beep
        setTimeout(() => {
            setCooldown(false); // Re-enable scanning after cooldown period
            setScanSuccess(false);
        }, 1000); // Adjust delay as needed (500ms is often sufficient)
    };

    return (
        <div className="flex flex-col items-center justify-center h-full w-full p-4">
            <div className="relative w-72 h-72 border-2 border-gray-700 shadow-md rounded-md overflow-hidden">
                {cooldown === true ? (
                    <div className=" absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                        <SequentialAnimation
                            variant={typeof scannedData === "string" ? 6 : 2}
                        >
                            {scannedData && (
                                <div className="flex-col text-center">
                                    {typeof scannedData === "string" ? (
                                        <p className="text-red-500 font-semibold text-base">
                                            {scannedData}
                                        </p>
                                    ) : (
                                        <>
                                            <p className="text-gray-700 text-lg">
                                                {scannedData.name}
                                            </p>
                                            <p className="text-gray-700 text-lg">
                                                {scannedData.nis}
                                            </p>
                                            <p className="text-green-500 font-bold text-2xl">
                                                {scannedData.status}
                                            </p>
                                        </>
                                    )}
                                </div>
                            )}
                        </SequentialAnimation>
                    </div>
                ) : (
                    <video
                        ref={videoRef}
                        className="absolute inset-0 w-full h-full object-cover"
                        playsInline
                    />
                )}
                {!scanning && !scanSuccess ? (
                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
                        <p className="text-white text-center px-4">{status}</p>
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

            <audio ref={beepRef} src={beep} preload="auto" />
        </div>
    );
};

export default QRCodeScanner;
