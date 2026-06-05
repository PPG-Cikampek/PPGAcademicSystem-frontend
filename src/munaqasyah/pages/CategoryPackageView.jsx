import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

import useHttp from "../../shared/hooks/http-hook";

import { generateCategoryPDF } from "../utilities/generateCategoryPDF";

const CategoryPackageView = () => {
    const [pdfUrl, setPdfUrl] = useState("");
    const [questionsData, setQuestionsData] = useState(null);
    const { isLoading, error, sendRequest, setError } = useHttp();

    const navigate = useNavigate();
    const location = useLocation();
    const { state } = location;

    const generatePDF = () => {
        if (!questionsData || !questionsData.classes) return;

        const doc = generateCategoryPDF(state.semester, state.category, questionsData);
        const pdfDataUri = doc.output("datauristring");
        setPdfUrl(pdfDataUri);
    };

    useEffect(() => {
        const fetchQuestions = async () => {
            const baseUrl = `${
                import.meta.env.VITE_BACKEND_URL
            }/munaqasyahs/examination/questions/package?semester=${state.semester.slice(
                -1
            )}&category=${state.category}`;
            const url = state.seed ? `${baseUrl}&seed=${state.seed}` : baseUrl;
            try {
                const responseData = await sendRequest(url);
                console.log(responseData);
                setQuestionsData(responseData);
            } catch (err) {
                // Error is handled by useHttp
            }
        };
        fetchQuestions();
    }, [state]);

    useEffect(() => {
        if (questionsData) {
            generatePDF();
        }
    }, [questionsData]);

    return (
        <div className="mx-auto p-4 container">
            <div className="flex flex-col gap-4">
                <div className="flex gap-4">
                    <button
                        onClick={generatePDF}
                        className="bg-blue-500 px-4 py-2 rounded-sm text-white"
                    >
                        Preview PDF
                    </button>
                </div>

                <div className="p-4 border rounded-sm">
                    {pdfUrl && (
                        <iframe
                            src={pdfUrl}
                            width="100%"
                            height="1080px"
                            title="PDF Preview"
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

export default CategoryPackageView;
