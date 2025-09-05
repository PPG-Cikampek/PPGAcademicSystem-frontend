import { useState, useContext, useRef } from "react";
import { AuthContext } from "../../shared/Components/Context/auth-context";
import { QrCode, Undo2, ArrowDownToLine } from "lucide-react";
import { QRCodeCanvas } from "qrcode.react";
import { pdf } from "@react-pdf/renderer";
import IDCardDocument from "../id-card/IDCardDocument";
import api, { getImageDataUrl } from "../../shared/queries/api";

import LoadingCircle from "../../shared/Components/UIElements/LoadingCircle";
import useNewModal from "../../shared/hooks/useNewModal";
import NewModal from "../../shared/Components/Modal/NewModal";

const StudentProfileCard = ({ studentInfo, studentData, studentDetails }) => {
    const [showQRCode, setShowQRCode] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);
    const auth = useContext(AuthContext);

    const { modalState, openModal, closeModal } = useNewModal();
    const imgRef = useRef(null);

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
        // Try to read the already-rendered <img /> first (via ref) and convert it
        // to a data URL. This avoids duplicate network requests and helps with
        // auth/CORS when the browser already has access to the image.
        // If that fails, fall back to the existing fetch helper (getImageDataUrl).
        const buildImageDataUrl = async (imagePath) => {
            if (!imagePath) return null;

            // Prefer the DOM image's resolved src if available
            const imgSrc = imgRef?.current?.src || imagePath;

            // If it's already a data URL, we're done
            if (/^data:/i.test(imgSrc)) return imgSrc;

            // Try to fetch the image (include auth header if present) and convert to data URL
            try {
                const headers = auth?.token ? { Authorization: `Bearer ${auth.token}` } : {};
                const resp = await fetch(imgSrc, { headers });
                if (resp.ok) {
                    const blob = await resp.blob();
                    const dataUrl = await new Promise((resolve, reject) => {
                        const reader = new FileReader();
                        reader.onloadend = () => resolve(reader.result);
                        reader.onerror = reject;
                        reader.readAsDataURL(blob);
                    });
                    return dataUrl;
                }
            } catch (err) {
                // ignore and try canvas fallback
            }

            // Canvas fallback: draw the existing img element into a canvas and read data URL
            try {
                const imgEl = imgRef?.current;
                if (imgEl && imgEl.naturalWidth && imgEl.naturalHeight) {
                    const canvas = document.createElement("canvas");
                    canvas.width = imgEl.naturalWidth;
                    canvas.height = imgEl.naturalHeight;
                    const ctx = canvas.getContext("2d");
                    ctx.drawImage(imgEl, 0, 0);
                    return canvas.toDataURL("image/png");
                }
            } catch (err) {
                // drawing may fail due to cross-origin tainting; fall back below
            }

            // Final fallback: try the original helper which uses axios and the configured baseURL
            const isAbsolute = /^https?:\/\//i.test(imagePath);
            const base = (import.meta.env.VITE_BACKEND_URL || "").replace(/\/+$/, "");
            const normalized = isAbsolute ? imagePath : `${base}/${imagePath.replace(/^\/+/, "")}`;
            try {
                const headers = auth?.token ? { Authorization: `Bearer ${auth.token}` } : undefined;
                return await getImageDataUrl(normalized, { headers });
            } catch (err) {
                return isAbsolute ? normalized : null;
            }
        };

        const embeddedImage = await buildImageDataUrl(studentInfo?.image);

        const studentForPdf = {
            name: studentInfo.name || "",
            nis: studentInfo.nis || "",
            image: embeddedImage,
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
            openModal(
                "ID Card berhasil diunduh!\nCek folder unduhan Anda.",
                "success",
                null,
                "Berhasil!"
            );
        } catch (err) {
            // Fallback: if PDF generation fails, try to download QR image only
            if (qrDataUrl) {
                const link = document.createElement("a");
                link.href = qrDataUrl;
                link.download = `${fileName}_QRCode.png`;
                link.click();
                openModal(
                    "ID Card berhasil diunduh!\nCek folder unduhan Anda.",
                    "success",
                    null,
                    "Berhasil!"
                );
            } else {
                // Nothing to download
                openModal(
                    "Gagal mengunduh ID Card. Silakan coba lagi.",
                    "error",
                    null,
                    "Gagal"
                );
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
            <NewModal modalState={modalState} onClose={closeModal} />
        </div>
    );
};

export default StudentProfileCard;
