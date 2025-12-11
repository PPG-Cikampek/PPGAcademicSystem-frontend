import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

import { jsPDF } from "jspdf";
import { applyPlugin } from "jspdf-autotable";
import logo from "../../assets/logos/ppgcikampek-whitebg.jpg";
import useHttp from "../../shared/hooks/http-hook";

import getCategoryName from "../utilities/getCategoryName";

// Import pre-converted font files that auto-register with jsPDF
// These .js files contain base64-encoded fonts and register via jsPDF events
import "../../assets/fonts/Amiri-normal.js";
import "../../assets/fonts/lmpq.js";


applyPlugin(jsPDF);

/**
 * Strips HTML tags and decodes HTML entities from text
 * This fixes issues where source data contains HTML color/style tags
 * that cause distorted rendering in PDF
 */
const stripHtmlTags = (text) => {
    if (!text || typeof text !== 'string') return text;
    
    // Remove HTML tags (including color spans, font tags, etc.)
    let cleaned = text.replace(/<[^>]*>/g, '');
    
    // Decode common HTML entities
    cleaned = cleaned
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&apos;/g, "'");
    
    // Remove any remaining HTML numeric entities
    cleaned = cleaned.replace(/&#\d+;/g, '');
    
    return cleaned;
};

const CategoryPackageView = () => {
    const [pdfUrl, setPdfUrl] = useState("");
    const [questionsData, setQuestionsData] = useState(null);
    const { isLoading, error, sendRequest, setError } = useHttp();

    const navigate = useNavigate();
    const location = useLocation();
    const { state } = location;

    const generatePDF = () => {
        if (!questionsData || !questionsData.classes) return;

        const doc = new jsPDF();

        // Amiri font is auto-registered via the imported Amiri-normal.js file
        // No need to call doc.addFont() - the font is available as "Amiri" with style "normal"

        // Header and Footer function
        const addHeaderFooter = () => {
            doc.setFontSize(8);
            doc.setTextColor(100);
            doc.text(
                "PPG CIKAMPEK",
                doc.internal.pageSize.width - 28,
                doc.internal.pageSize.height - 10
            );
        };

        // Table headers
        const headers = [["No", "Pertanyaan", "Skor"]];

        // For each class from backend data
        questionsData.classes.forEach((kelasObj, idx) => {
            if (idx > 0) {
                doc.addPage();
            }

            // Add letterhead with imported logo
            doc.addImage(logo, "PNG", 25, 5, 32, 32, undefined, "NONE");

            // Institution details
            doc.setFont("times", "bold");
            doc.setFontSize(14);
            doc.text(
                "PENGGERAK PEMBINA GENERUS",
                doc.internal.pageSize.width / 2 + 10,
                15,
                { align: "center" }
            );

            doc.setFontSize(18);
            doc.text("(PPG)", doc.internal.pageSize.width / 2 + 10, 23, {
                align: "center",
            });

            doc.setFontSize(14);
            doc.text(
                "DAERAH CIKAMPEK",
                doc.internal.pageSize.width / 2 + 10,
                30,
                { align: "center" }
            );

            doc.setFont("times", "normal");
            doc.setFontSize(10);
            doc.text(
                "Jl. Ir. H. Juanda, Desa Jomin Barat, Kec. Kota Baru, Kab. Karawang",
                doc.internal.pageSize.width / 2 + 10,
                35,
                { align: "center" }
            );

            // Add horizontal lines
            doc.setLineWidth(0.5);
            doc.line(14, 42, doc.internal.pageSize.width - 14, 42);
            doc.setLineWidth(0.1);
            doc.line(14, 43, doc.internal.pageSize.width - 14, 43);

            // Title
            doc.setFont("times", "normal");
            doc.setFontSize(14);
            doc.text(
                `SOAL MUNAQOSAH SEMESTER ${
                    state.semester.toString().endsWith("1") ? "GANJIL" : "GENAP"
                }`,
                doc.internal.pageSize.width / 2,
                50,
                { align: "center" }
            );

            doc.setFontSize(14);
            doc.text(
                `TAHUN ${state.semester.toString().slice(0, 4)}/${
                    parseInt(state.semester.toString().slice(0, 4)) + 1
                }`,
                doc.internal.pageSize.width / 2,
                57,
                { align: "center" }
            );

            doc.setFontSize(12);
            doc.text(`Materi    : ${getCategoryName(state.category)}`, 14, 65);
            doc.text(`Kelas     : ${kelasObj.classGrade}`, 14, 70);

            // Table data for this class
            const QUESTION_COLUMN_INDEX = 1;

            const renderQuestionCellContent = (data) => {
                const sections = data.cell.raw?.sections;
                if (!Array.isArray(sections) || !sections.length) {
                    return;
                }

                const docInstance = data.doc;
                const cell = data.cell;
                const fontSize = cell.styles.fontSize || 12;
                const maxWidth = Math.max(1, cell.width - cell.padding('horizontal'));
                const lineHeight = fontSize * 0.4;
                let currentY = cell.y + cell.padding('top') + lineHeight;
                const startX = cell.x + cell.padding('left');

                sections.forEach((section, index) => {
                    const labelText = `${section.label}:`;
                    docInstance.setFont('times', 'bold');
                    docInstance.setFontSize(fontSize);
                    const labelLines = docInstance.splitTextToSize(
                        labelText,
                        maxWidth,
                    );
                    docInstance.text(labelLines, startX, currentY, {
                        align: 'left',
                    });
                    currentY += lineHeight * labelLines.length;

                    docInstance.setFont('Amiri', 'normal');
                    docInstance.setFontSize(fontSize);
                    const contentText = section.content || '';
                    const contentLines = contentText
                        .split(/\r?\n/)
                        .flatMap((line) =>
                            docInstance.splitTextToSize(line || ' ', maxWidth),
                        );
                    if (contentLines.length) {
                        docInstance.text(contentLines, startX, currentY, {
                            align: 'left',
                        });
                        currentY += lineHeight * contentLines.length;
                    }

                    if (index < sections.length - 1) {
                        currentY += lineHeight * 0.1;
                    }
                });

                docInstance.setFont('Amiri', 'normal');
                docInstance.setFontSize(fontSize);
            };

            const tableData = (kelasObj.questions || []).map((q, i) => {
                const answersText = q.answers && q.answers.length 
                    ? q.answers.map(answer => stripHtmlTags(answer)).join('\n') 
                    : '';
                const sections = [];

                if (q.instruction) {
                    sections.push({ label: 'Petunjuk penilaian', content: stripHtmlTags(q.instruction) });
                }
                sections.push({ label: '\nPertanyaan', content: stripHtmlTags(q.question) || '' });
                if (answersText && answersText.trim()) {
                    sections.push({ label: '\nKunci Jawaban', content: answersText + '\n' });
                }

                const cellContent = sections
                    .map((section) => {
                        const lines = [`${section.label}:`];
                        if (section.content) {
                            lines.push(section.content);
                        }
                        return lines.join('\n');
                    })
                    .join('\n');

                return [
                    (i + 1).toString(),
                    {
                        content: cellContent,
                        sections,
                    },
                    q.maxScore != null ? q.maxScore.toString() : '',
                ];
            });

            doc.autoTable({
                head: headers,
                body: tableData,
                startY: 75,
                margin: { top: 15 },
                theme: "grid",
                headStyles: {
                    textColor: [0, 0, 0],
                    fillColor: [255, 255, 255],
                    lineColor: 0,
                    lineWidth: 0.1,
                    font: "times",
                    fontSize: 12,
                    fontStyle: "bold",
                    halign: "center",
                },
                bodyStyles: {
                    textColor: [0, 0, 0],
                    lineColor: 0,
                    lineWidth: 0.1,
                    font: "Amiri",
                    fontSize: 12,
                    halign: "left",
                },
                tableWidth: "auto",
                columnStyles: {
                    0: { cellWidth: 10, halign: "center", valign: "middle", font: "times" },
                    1: { cellWidth: "auto", font: "Amiri", fontSize: 14 },
                    2: { cellWidth: 15, halign: "center", valign: "middle", font: "times" },
                },
                willDrawCell: (data) => {
                    if (data.section === "body" && data.column.index === QUESTION_COLUMN_INDEX) {
                        data.cell.text = [];
                    }
                },
                didDrawCell: (data) => {
                    if (data.section === "body" && data.column.index === QUESTION_COLUMN_INDEX) {
                        renderQuestionCellContent(data);
                    }
                },
            });
        });

        // Add header/footer to all pages
        const pageCount = doc.internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            addHeaderFooter();
        }

        // Preview the generated PDF
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
