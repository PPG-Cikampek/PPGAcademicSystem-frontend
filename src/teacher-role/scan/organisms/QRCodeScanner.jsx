// QRCodeScanner.jsx
// Refactored to use overlay pattern - scanner stays mounted to prevent
// DOM reconciliation issues and camera re-initialization
import { useState, useContext, memo, useCallback, useRef, useEffect } from "react";
import { StudentAttendanceLookupContext } from "../context/StudentAttendanceContext";
import { QRScanner } from "../../../shared/Components/Scanner";

// Scan result overlay component - displays over the scanner without unmounting it
const ScanResultOverlay = memo(({ scannedData, isError }) => {
    return (
        <div
            className="z-10 absolute inset-0 flex justify-center items-center bg-black animate-fade-in"
            style={{ backdropFilter: "blur(2px)" }}
        >
            <div
                className={`text-center p-4 rounded-lg ${
                    isError ? "animate-shake" : "animate-scale-in"
                }`}
            >
                {isError ? (
                    <p className="drop-shadow-lg font-semibold text-red-400 text-base">
                        {scannedData}
                    </p>
                ) : (
                    <div className="flex flex-col items-center gap-1">
                        <p className="drop-shadow-lg font-medium text-white text-lg">
                            {scannedData.name}
                        </p>
                        <p className="drop-shadow-lg text-gray-200 text-sm">
                            {scannedData.nis}
                        </p>
                        <p
                            className={`font-bold text-2xl drop-shadow-lg ${
                                scannedData.status === "Hadir"
                                    ? "text-green-400"
                                    : "text-yellow-400"
                            }`}
                        >
                            {scannedData.status}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
});

ScanResultOverlay.displayName = "ScanResultOverlay";

const QRCodeScanner = memo(() => {
    const [scannedData, setScannedData] = useState(null);
    const [showOverlay, setShowOverlay] = useState(false);

    // Use ref to track timeout for cleanup
    const overlayTimeoutRef = useRef(null);

    // Track mounted state
    const isMountedRef = useRef(true);

    // Slim lookup + status marking context (stable identity unless classStartTime changes)
    const { classStartTime, getStudent, hasStudent, markStatus } = useContext(
        StudentAttendanceLookupContext,
    );

    // Cleanup on unmount
    useEffect(() => {
        isMountedRef.current = true;
        return () => {
            isMountedRef.current = false;
            if (overlayTimeoutRef.current) {
                clearTimeout(overlayTimeoutRef.current);
            }
        };
    }, []);

    const getPresenceStatus = useCallback((timeString) => {
        // Guard against null/undefined timeString
        if (!timeString || typeof timeString !== "string") {
            return "Hadir"; // Default to present if no time configured
        }

        // Get the current time
        const now = new Date();

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

        // Allow a 15-minute grace period after the scheduled time.
        // Calculate the difference in minutes between now and the scheduled time.
        const scheduled = new Date();
        scheduled.setHours(inputHours, inputMinutes, 0, 0);
        const diffMinutes = Math.floor((now - scheduled) / (60 * 1000));

        // If more than 15 minutes late, mark as late; otherwise still "Hadir".
        if (diffMinutes > 15) {
            return "Terlambat"; // More than 15 minutes late
        }
        return "Hadir"; // Within 15 minutes or earlier
    }, []);

    const dataHandler = useCallback(
        (data) => {
            // Delegate to stable markStatus (keeps scanner independent of full context churn)
            markStatus(data.id, data.newStatus);
        },
        [markStatus],
    );

    const handleScan = useCallback(
        async (data) => {
            if (!classStartTime) {
                console.warn("Class start time not available, skipping scan");
                return;
            }

            // Clear any pending timeout
            if (overlayTimeoutRef.current) {
                clearTimeout(overlayTimeoutRef.current);
            }

            const isFound = hasStudent(data);
            if (!isFound) {
                setScannedData("Kode QR tidak dikenali!");
            } else {
                const student = getStudent(data);
                const status = getPresenceStatus(classStartTime);
                setScannedData({
                    nis: data,
                    status,
                    name: student.studentId.name,
                });

                const attendanceData = {
                    id: data,
                    newStatus: status,
                    timestamp: Date.now(),
                };
                dataHandler(attendanceData);
                console.log("Attendance recorded:", attendanceData);
            }

            // Show overlay
            setShowOverlay(true);

            // Hide overlay after delay - scanner stays active underneath
            overlayTimeoutRef.current = setTimeout(() => {
                if (isMountedRef.current) {
                    setShowOverlay(false);
                    setScannedData(null);
                }
            }, 1200);
        },
        [classStartTime, hasStudent, getStudent, getPresenceStatus, dataHandler],
    );

    const handleError = useCallback((error, instruction) => {
        console.error("QR Scanner error:", error);
        // Handle errors if needed
    }, []);

    const isError = typeof scannedData === "string";

    return (
        <div className="flex flex-col justify-center items-center px-4 w-full h-full">
            {/* Container for scanner with overlay */}
            <div className="relative rounded-md w-72 h-72 overflow-hidden">
                {/* QRScanner always mounted - prevents camera re-initialization issues */}
                <QRScanner
                    onScan={handleScan}
                    onError={handleError}
                    scannerOptions={{
                        returnDetailedScanResult: true,
                    }}
                    cooldownDuration={1200}
                    enableBeep={true}
                />

                {/* Overlay displayed on top of scanner when scan occurs */}
                {showOverlay && scannedData && (
                    <div className="mt-72">
                        <ScanResultOverlay scannedData={scannedData} isError={isError} />
                    </div>
                )}
            </div>
        </div>
    );
});

// Add display name for debugging
QRCodeScanner.displayName = "QRCodeScanner";

export default QRCodeScanner;
