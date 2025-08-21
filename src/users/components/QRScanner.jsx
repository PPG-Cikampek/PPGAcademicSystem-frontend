import { useRef, useEffect, useState, useContext } from "react";
import QrScanner from "qr-scanner";

import beep from "../../assets/audios/store-scanner-beep-90395.mp3";
import useHttp from "../../shared/hooks/http-hook";
import LoadingCircle from "../../shared/Components/UIElements/LoadingCircle";

const QRScanner = ({ setStudentLoginField, setNis }) => {
    const videoRef = useRef(null);
    const beepRef = useRef(null);
    const [scannedData, setScannedData] = useState(null);

    const { isLoading, error, sendRequest, setError, setIsLoading } = useHttp();

    useEffect(() => {
        setIsLoading(true);
        let qrScanner;
        const setupScanner = async () => {
            if (videoRef.current) {
                qrScanner = new QrScanner(
                    videoRef.current,
                    async (result) => {
                        await handleScan(result.data);
                    },
                    { returnDetailedScanResult: true }
                );

                // Start scanning
                try {
                    setIsLoading(false);
                    await qrScanner.start();
                } catch (error) {
                    console.error(
                        "Camera access denied or unavailable:",
                        error
                    );
                }
            } else {
                console.error("Video element not found");
            }
        };
        setupScanner();
        return () => {
            qrScanner?.destroy();
        };
    }, []);

    const handleScan = async (data) => {
        const fetchUser = async () => {
            const url = `${
                import.meta.env.VITE_BACKEND_URL
            }/students/login/${data}`;
            try {
                const responseData = await sendRequest(url);
                setNis(responseData.student.nis);
                setScannedData(responseData.student); // Update scannedData with fetched user data
                console.log(responseData.student);
                setStudentLoginField([
                    {
                        name: "nis",
                        label: "nis",
                        type: "text",
                        required: false,
                        value: responseData.student.nis,
                        disabled: true,
                    },
                    {
                        name: "name",
                        label: "name",
                        type: "text",
                        required: false,
                        value: responseData.student.name,
                        disabled: true,
                    },
                    {
                        name: "password",
                        label: "Password",
                        placeholder: "Password",
                        type: "password",
                        required: true,
                    },
                ]);
            } catch (err) {
                // Error is handled by useHttp
            }
        };
        fetchUser();

        if (beepRef.current) {
            beepRef.current.play();
        }
    };

    return (
        <div className="flex flex-col items-center justify-center h-full w-full p-4">
            <div className="relative w-72 h-72 border-2 border-gray-700 shadow-md rounded-md overflow-hidden">
                {isLoading === true ? (
                    <div className=" absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                        <LoadingCircle size={32} />
                    </div>
                ) : (
                    <video
                        ref={videoRef}
                        className="absolute inset-0 w-full h-full object-cover"
                        playsInline
                    />
                )}
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

export default QRScanner;
