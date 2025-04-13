import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const PreviewReport = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { pdfUrl, studentName } = location.state || {};

    useEffect(() => {
        return () => {
            // Revoke the blob URL when the component is unmounted
            if (pdfUrl) {
                URL.revokeObjectURL(pdfUrl);
            }
        };
    }, [pdfUrl]);

    if (!pdfUrl) {
        return <div className="text-center mt-16">No preview available.</div>;
    }

    const downloadPDF = () => {
        const link = document.createElement('a');
        link.href = pdfUrl;
        link.download = `${studentName}_Raport.pdf`;
        link.click();
    };

    return (
        <div className="min-h-screen bg-gray-50 px-4 py-8 md:p-8">
            <div className="max-w-6xl mx-auto">
                <h1 className="text-2xl font-semibold text-gray-900 mb-4">Preview Raport: {studentName}</h1>
                <div className="card-basic rounded-md mx-0">
                    <iframe
                        src={pdfUrl}
                        title="PDF Preview"
                        className="w-full h-[600px] border rounded"
                    ></iframe>
                </div>
                <div className="flex justify-end mt-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="btn-neutral-outline mr-2"
                    >
                        Kembali
                    </button>
                    <button
                        onClick={downloadPDF}
                        className="btn-primary-outline"
                    >
                        Unduh PDF
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PreviewReport;
