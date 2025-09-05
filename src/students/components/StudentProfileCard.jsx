import { useState, useContext } from "react";
import { AuthContext } from "../../shared/Components/Context/auth-context";
import { QrCode, Undo2, ArrowDownToLine } from "lucide-react";
import { QRCodeCanvas } from "qrcode.react";

const StudentProfileCard = ({ studentInfo, studentData, studentDetails }) => {
    const [showQRCode, setShowQRCode] = useState(false);
    const auth = useContext(AuthContext);

    const downloadQRCode = () => {
        const canvas = document.querySelector("canvas");
        const url = canvas.toDataURL("image/png");
        const link = document.createElement("a");
        const fileName =
            studentInfo.name.replace(/\s+/g, "") +
            "_" +
            studentInfo.subBranch.replace(/\s+/g, "");
        link.href = url;
        link.download = `${fileName}_QRCode.png`;
        link.click();
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
                                ? `${
                                      import.meta.env.VITE_BACKEND_URL
                                  }/${studentInfo.image}`
                                : "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png?20150327203541"
                        }
                        alt="Profile"
                        className="mt-2 rounded-md size-48 md:size-64 shrink-0 bg-white"
                    />
                )}
                {auth.userRole !== "teacher" &&
                    auth.userRole !== "student" &&
                    studentData.isProfileComplete === true && (
                        <>
                            <button
                                className="absolute bottom-1 right-1 bg-white p-2 rounded-full border border-gray-300"
                                onClick={() =>
                                    setShowQRCode((prev) => !prev)
                                }
                            >
                                {showQRCode ? (
                                    <Undo2 className="w-6 h-6" />
                                ) : (
                                    <QrCode className="w-6 h-6" />
                                )}
                            </button>
                            <button
                                className="absolute bottom-1 right-14 bg-white p-2 rounded-full border border-gray-300"
                                hidden={!showQRCode}
                                onClick={downloadQRCode}
                            >
                                <ArrowDownToLine className="w-6 h-6" />
                            </button>
                        </>
                    )}
            </div>
            <h2 className="mt-4 text-lg font-normal">
                {studentInfo.name}
            </h2>
            <p className="mt-2 text-gray-600">{studentInfo.nis}</p>
            <div className="mt-4 flex flex-col md:flex-row gap-2 text-center">
                <span className="badge-primary">{studentInfo.branch}</span>
                <span className="badge-primary">{studentInfo.subBranch}</span>
            </div>
        </div>
    );
};

export default StudentProfileCard;
