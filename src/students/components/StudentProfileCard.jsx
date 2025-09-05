import { useState, useContext } from "react";
import { AuthContext } from "../../shared/Components/Context/auth-context";
import { QrCode, Undo2, ArrowDownToLine } from "lucide-react";
import { QRCodeCanvas } from "qrcode.react";
import { pdf } from "@react-pdf/renderer";
import IDCardDocument from "../id-card/IDCardDocument";

import LoadingCircle from "../../shared/Components/UIElements/LoadingCircle";

const StudentProfileCard = ({ studentInfo, studentData, studentDetails }) => {
    const [showQRCode, setShowQRCode] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);
    const auth = useContext(AuthContext);

    const downloadQRCode = async () => {
        setIsDownloading(true);
        // Build filename
        const fileName =
            studentInfo.name.replace(/\s+/g, "") +
            "_" +
            studentInfo.subBranch.replace(/\s+/g, "");

        // Try to read the existing rendered QR canvas (only present when showQRCode is true)
        const canvas = document.querySelector("canvas");
        const qrDataUrl = canvas ? canvas.toDataURL("image/png") : null;

        // Build the student object expected by IDCardDocument
        const studentForPdf = {
            name: studentInfo.name || "",
            nis: studentInfo.nis || "",
            image: studentInfo?.image
                ? `${import.meta.env.VITE_BACKEND_URL}/${studentInfo.image}`
                : null,
            qrCode: qrDataUrl,
        };

        try {
            // Render the PDF document to a blob and trigger download
            const doc = <IDCardDocument student={studentForPdf} />;
            const asPdf = pdf([]);
            asPdf.updateContainer(doc);
            const blob = await asPdf.toBlob();
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = `${fileName}_IDCard.pdf`;
            document.body.appendChild(link);
            link.click();
            link.remove();
            URL.revokeObjectURL(url);
        } catch (err) {
            // Fallback: if PDF generation fails, try to download QR image only
            if (qrDataUrl) {
                const link = document.createElement("a");
                link.href = qrDataUrl;
                link.download = `${fileName}_QRCode.png`;
                link.click();
            } else {
                // Nothing to download
                // eslint-disable-next-line no-console
                console.error("No QR canvas or PDF generation failed.", err);
            }
        } finally {
            setIsDownloading(false);
        }
    };

    return (
        <div className="card-basic rounded-md border mx-0 py-12 flex flex-col items-center flex-1 h-full basis-96 min-w-80 md:max-w-96">
            <div className="relative">
                {showQRCode ? (
                    <QRCodeCanvas
                        value={
                            studentDetails.find(
                                (detail) => detail.label === "NIS"
                            ).value
                        }
                        size={256}
                        level={"H"}
                        className="mt-2 rounded-md size-48 md:size-64 shrink-0"
                    />
                ) : (
                    <img
                        src={
                            studentInfo?.image
                                ? `${import.meta.env.VITE_BACKEND_URL}/${
                                      studentInfo.image
                                  }`
                                : "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png?20150327203541"
                        }
                        alt="Profile"
                        className="mt-2 rounded-md size-48 md:size-64 shrink-0 bg-white"
                    />
                )}
                {auth.userRole !== "teacher" &&
                    auth.userRole !== "student" &&
                    studentData.isProfileComplete === true && (
                        <div className="p-2">
                            <button
                                className="absolute -bottom-12 right-1 btn-icon-white text-gray-800 border"
                                onClick={() => setShowQRCode((prev) => !prev)}
                                disabled={isDownloading}
                            >
                                {showQRCode ? (
                                    <Undo2 className="w-6 h-6" />
                                ) : (
                                    <QrCode className="w-6 h-6" />
                                )}
                            </button>
                            <button
                                className="absolute -bottom-12 right-14 btn-round-primary flex items-center m-0 mr-2 p-2 pr-3"
                                hidden={!showQRCode}
                                onClick={downloadQRCode}
                                disabled={isDownloading}
                            >
                                {isDownloading ? (
                                    <>
                                        <LoadingCircle size={18} />
                                        <span className="ml-1">Memproses...</span>
                                    </>
                                ) : (
                                    <>
                                        <ArrowDownToLine size={18} />
                                        <span className="ml-1">Unduh ID Card</span>
                                    </>
                                )}
                            </button>
                        </div>
                    )}
            </div>
            <p className="mt-16 text-lg font-normal">{studentInfo.name}</p>
            <p className="mt-2 text-gray-600">{studentInfo.nis}</p>
            <div className="mt-4 flex flex-col md:flex-row gap-2 text-center">
                <span className="badge-primary">{studentInfo.branch}</span>
                <span className="badge-primary">{studentInfo.subBranch}</span>
            </div>
        </div>
    );
};

export default StudentProfileCard;
