import {
    PDFDownloadLink,
    PDFViewer,
} from "@react-pdf/renderer";

import IDCardDocument from "./IDCardDocument";

import sampleProfilePic from "../../assets/images/sample-profile.jpg";
import sampleQRCode from "../../assets/images/sample-qr.jpg";

const StudentIDCard = () => {
    const studentData = {
        name: "John Doe",
        nis: "123456789",
        image: sampleProfilePic,
        qrCode: sampleQRCode,
    };

    return (
        <div className="container mx-auto p-8">
            <h1 className="text-3xl font-bold mb-8">ID Card Preview</h1>

            <div className="mb-8 flex flex-col items-center space-y-4">
                <div className="w-full h-[540px] border border-gray-300"
                >
                    <PDFViewer style={{ width: "100%", height: "100%" }}>
                        <IDCardDocument student={studentData} />
                    </PDFViewer>
                </div>
                <br />
                <PDFDownloadLink
                    document={<IDCardDocument student={studentData} />}
                    fileName="id-card.pdf"
                >
                    {({ loading }) => (
                        <button className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">
                            {loading ? "Preparing PDF..." : "Download PDF"}
                        </button>
                    )}
                </PDFDownloadLink>
            </div>

            <div className="bg-gray-100 p-4 rounded">
                <h2 className="text-xl font-semibold mb-4">
                    Features Demonstrated:
                </h2>
                <ul className="list-disc list-inside space-y-2">
                    <li>Custom page size (CR80)</li>
                    <li>Background image</li>
                    <li>Centered student data</li>
                    <li>PDF preview (react-pdf)</li>
                    <li>Download functionality</li>
                </ul>
            </div>
        </div>
    );
};

export default StudentIDCard;
