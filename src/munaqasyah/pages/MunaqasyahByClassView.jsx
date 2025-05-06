import React, { useState, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';
import jsPDF from 'jspdf';
import { applyPlugin } from 'jspdf-autotable';
import IndonesianNumberConverter from '../../shared/Utilities/numberToWordConverter';
applyPlugin(jsPDF);

const MunaqasyahByClassView = () => {
    const [expandedCards, setExpandedCards] = useState({});
    const location = useLocation();
    const navigate = useNavigate();
    const { scores: rawScores } = location.state || { scores: [] };

    const scoreCategories = [
        { key: 'reciting', label: "Membaca Al-Qur'an/Tilawati" },
        { key: 'writing', label: 'Menulis Arab' },
        { key: 'quranTafsir', label: 'Tafsir Al-Quran' },
        { key: 'hadithTafsir', label: 'Tafsir Hadits' },
        { key: 'practice', label: 'Praktik Ibadah' },
        { key: 'moralManner', label: 'Akhlak dan Tata Krama' },
        { key: 'memorizingSurah', label: 'Surat-surat Al-Quran' },
        { key: 'memorizingHadith', label: 'Hafalan Hadits' },
        { key: 'memorizingDua', label: "Hafalan Do'a" },
        { key: 'memorizingBeautifulName', label: 'Hafalan Asmaul Husna' },
        { key: 'knowledge', label: 'Keilmuan dan Kefahaman Agama' },
        { key: 'independence', label: 'Kemandirian' }
    ];

    // Normalize scores to minimum 60
    const scores = useMemo(() => {
        return rawScores.map(score => ({
            ...score,
            ...scoreCategories.reduce((acc, category) => ({
                ...acc,
                [category.key]: {
                    ...score[category.key],
                    score: score[category.key].score < 60 ? 60 : score[category.key].score
                }
            }), {})
        }));
    }, [rawScores]);

    const expandedCount = useMemo(() =>
        Object.values(expandedCards).filter(Boolean).length,
        [expandedCards]
    );

    const toggleCard = (id) => {
        setExpandedCards(prev => ({
            ...prev,
            [id]: !prev[id]
        }));
    };

    const collapseAll = () => {
        setExpandedCards({});
    };

    const calculateAverage = (score) => {
        const values = scoreCategories.map(category => score[category.key].score);
        const sum = values.reduce((a, b) => a + b, 0);
        return (sum / values.length).toFixed(1);
    };

    const generatePDFContent = (studentName, studentScores) => {
        const doc = new jsPDF();

        const pageHeight =
            doc.internal.pageSize.height || doc.internal.pageSize.getHeight();
        const pageWidth =
            doc.internal.pageSize.width || doc.internal.pageSize.getWidth();
        console.log(pageHeight + "," + pageWidth);

        doc.setFont("Calibri", "bold");
        doc.setFontSize(14);
        doc.text("LAPORAN PENILAIAN HASIL BELAJAR SISWA", pageWidth / 2, 16, {
            align: "center"
        });

        doc.setFont("Calibri", "normal");
        doc.setFontSize(12);
        doc.text(`Nama Siswa  : ${studentName}`, pageWidth / 10, 25);
        doc.text("Nomor Induk :", pageWidth / 10, 30);
        doc.text("Kelas/Semester:", pageWidth / 10 * 6, 25);
        doc.text("Tahun Pelajaran:", pageWidth / 10 * 6, 30);

        const tableData = scoreCategories.map((category, index) => [
            index + 1,
            category.label,
            studentScores[category.key]?.score || '-',
            IndonesianNumberConverter(studentScores[category.key]?.score) || '-'
        ]);

        doc.autoTable({
            head: [['No', 'Mata Pelajaran', 'Angka', 'Huruf']],
            body: tableData,
            startY: 35,
            styles: {
                cellPadding: 2,
                headStyles: {
                    halign: 'center'
                }
            },
            zebra: true,
            zebraColor: [245, 245, 245],
            columnStyles: {
                0: { cellWidth: 15, halign: 'center' },
                1: { cellWidth: 75 },
                2: { cellWidth: 20 },
                3: { cellWidth: 75, halign: 'center' }
            }
        });

        return doc;
    };

    const downloadReport = (studentName, studentScores) => {
        const doc = generatePDFContent(studentName, studentScores);
        doc.save(`${studentName}_Raport.pdf`);
    };

    const previewReport = (studentName, studentScores) => {
        const doc = generatePDFContent(studentName, studentScores);
        const pdfBlob = doc.output('blob');
        const pdfUrl = URL.createObjectURL(pdfBlob);
        navigate('/munaqasyah/student/score', { state: { pdfUrl, studentName } });
    };

    return (
        <div className="min-h-screen bg-gray-50 px-4 py-8 md:p-8">
            <div className="max-w-6xl mx-auto">
                <div className="flex justify-between items-center mb-6 h-9">
                    <h1 className="text-2xl font-semibold text-gray-900">{scores[0]?.classId.name}</h1>
                    {expandedCount >= 2 && (
                        <button
                            onClick={collapseAll}
                            className="btn-neutral-outline mt-0"
                        >
                            Tutup Semua
                        </button>
                    )}
                </div>
                <div className="flex flex-col gap-4">
                    {scores.map((score) => (
                        <div
                            key={score._id}
                            className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200"
                        >
                            <div
                                onClick={() => toggleCard(score._id)}
                                className="cursor-pointer p-6 hover:bg-gray-50 transition-colors duration-200"
                            >
                                <div className="flex justify-between items-center">
                                    <div className="flex flex-col gap-2 items-start">
                                        <h2 className="text-lg font-medium text-gray-800">
                                            {score.studentId.name}
                                        </h2>
                                        <span className="text-base text-gray-500">
                                            Rata-rata: {calculateAverage(score)}
                                        </span>
                                        <div className="flex gap-2 my-2 md:my-0">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    downloadReport(score.studentId.name, score);
                                                }}
                                                className='btn-primary-outline m-0 text-gray-700'>
                                                Unduh Raport
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    previewReport(score.studentId.name, score);
                                                }}
                                                className='btn-primary-outline m-0 text-gray-700 hidden md:block'>
                                                Lihat Raport
                                            </button>
                                        </div>
                                    </div>
                                    <ChevronDown
                                        className={`w-5 h-5 text-gray-500 transition-transform duration-200
                                        ${expandedCards[score._id] ? 'transform rotate-180' : ''}`}
                                    />
                                </div>
                            </div>

                            <div className={`overflow-hidden transition-all duration-300 
                                ${expandedCards[score._id] ? 'max-h-[800px]' : 'max-h-0'}`}>
                                <div className="px-4 py-4 bg-gray-50 border-t border-gray-200">
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-1 md:gap-4">
                                        {scoreCategories.map(category => (
                                            <div key={category.key} className="flex justify-between items-center p-2 bg-white rounded border">
                                                <span className="text-gray-600">{category.label}</span>
                                                <span className="font-medium text-gray-800">{score[category.key].score}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default MunaqasyahByClassView;