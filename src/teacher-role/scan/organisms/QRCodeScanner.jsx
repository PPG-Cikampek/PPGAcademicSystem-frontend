import { useState, useContext, memo, useCallback } from "react";
import { StudentAttendanceLookupContext } from "../context/StudentAttendanceContext";
import { QRScanner } from "../../../shared/Components/Scanner";
import SequentialAnimation from "../../shared/Components/Animation/SequentialAnimation";

const QRCodeScanner = memo(() => {
    const [scannedData, setScannedData] = useState(null);
    const [scanSuccess, setScanSuccess] = useState(false);

    // Slim lookup + status marking context (stable identity unless classStartTime changes)
    const { classStartTime, getStudent, hasStudent, markStatus } = useContext(
        StudentAttendanceLookupContext
    );

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

    const dataHandler = useCallback(
        (data) => {
            // Delegate to stable markStatus (keeps scanner independent of full context churn)
            markStatus(data.id, data.newStatus);
        },
        [markStatus]
    );

    const handleScan = useCallback(
        async (data) => {
            if (!classStartTime) {
                console.warn("Class start time not available, skipping scan");
                return;
            }

            setScanSuccess(true);

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
                console.log(attendanceData);
            }

            // Delay to show result then allow new scan
            setTimeout(() => {
                setScanSuccess(false);
            }, 1000);
        },
        [classStartTime, hasStudent, getStudent, getPresenceStatus, dataHandler]
    );

    const handleError = useCallback((error, instruction) => {
        console.error("QR Scanner error:", error);
        // Handle errors if needed
    }, []);

    return (
        <div className="flex flex-col items-center justify-center h-full w-full p-4">
            {scanSuccess ? (
                <div className="relative w-72 h-72 border-2 border-gray-700 shadow-md rounded-md overflow-hidden">
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
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
                </div>
            ) : (
                <QRScanner
                    onScan={handleScan}
                    onError={handleError}
                    scannerOptions={{
                        returnDetailedScanResult: true,
                    }}
                    cooldownDuration={1000}
                    enableBeep={true}
                />
            )}
        </div>
    );
});

// Add display name for debugging
QRCodeScanner.displayName = "QRCodeScanner - for debugging";

export default QRCodeScanner;
