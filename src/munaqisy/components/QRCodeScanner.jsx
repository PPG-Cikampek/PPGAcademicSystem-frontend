import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { QRScanner } from "../../shared/Components/Scanner";
import ErrorCard from "../../shared/Components/UIElements/ErrorCard";

const QRCodeScanner = ({ errorMessage }) => {
    const navigate = useNavigate();
    const [err, setErr] = useState(errorMessage || "");

    const handleScan = async (data) => {
        if (!data) return;

        setErr(null);
        // Navigate to verification page with scanned data
        navigate("/munaqasyah/student", {
            state: {
                scannedData: data,
            },
        });
    };

    const handleError = (error, instruction) => {
        console.error("QR Scanner error:", error);
        setErr(error.message);
    };

    return (
        <div className="flex flex-col items-center justify-center h-full w-full p-4">
            {err && (
                <div className="mb-4">
                    <ErrorCard error={err} />
                </div>
            )}
            <QRScanner
                onScan={handleScan}
                onError={handleError}
                errorMessage={err}
                scannerOptions={{
                    returnDetailedScanResult: true,
                    highlightScanRegion: true,
                    highlightCodeOutline: true,
                }}
                cooldownDuration={1000}
                enableBeep={true}
                maxRetries={5}
                retryDelay={2000}
            />
        </div>
    );
};

export default QRCodeScanner;
