import React, { useState, useMemo, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';
import { generatePDFContent } from '../components/StudentReportPDF';
import useHttp from '../../shared/hooks/http-hook';

const MunaqasyahByClassView = () => {
    const [expandedCards, setExpandedCards] = useState({});
    const location = useLocation();
    const navigate = useNavigate();
    const { isLoading, error, sendRequest } = useHttp();
    const [teachingGroupYearId, setteachingGroupYearId] = useState(location.state?.teachingGroupYearId || []);
    const [rawScores, setRawScores] = useState([]);
    const classId = useParams().classId;


    // Periodically fetch latest scores
    useEffect(() => {
        let intervalId;
        const fetchScores = async () => {
            try {
                const responseData = await sendRequest(`${import.meta.env.VITE_BACKEND_URL}/scores/teachingGroupYear/${teachingGroupYearId}?classId=${classId}`);
                const matchedClass = responseData.classes.find(cls => cls.classId._id === classId);
                if (matchedClass) {
                    setRawScores(matchedClass.scores);
                }
            } catch (err) {
                // Error handled by useHttp
            }
        };
        fetchScores();
        intervalId = setInterval(fetchScores, 3000); // every 10 seconds
        return () => clearInterval(intervalId);
    }, [sendRequest, classId]);

    const scoreCategories = [
        { key: 'reciting', label: "Membaca Al-Qur'an/Tilawati" },
        { key: 'writing', label: 'Menulis Arab' },
        { key: 'quranTafsir', label: 'Tafsir Al-Quran' },
        { key: 'hadithTafsir', label: 'Tafsir Hadits' },
        { key: 'practice', label: 'Praktik Ibadah' },
        { key: 'moralManner', label: 'Akhlak dan Tata Krama' },
        { key: 'memorizingSurah', label: 'Hafalan Surat-surat Al-Quran' },
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
                    score: (score[category.key]?.score < 60 && score[category.key]?.score > 0)
                        ? 60
                        : score[category.key]?.score === 0
                            ? null
                            : score[category.key]?.score,
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

    // Use rawScores for display and average calculation
    const calculateAverage = (score) => {
        const values = scoreCategories.map(category => score[category.key]?.score ?? 0);
        const sum = values.reduce((a, b) => a + b, 0);
        return (sum / values.length).toFixed(1);
    };

    const downloadReport = (studentName, studentScores, studentNis, grade, academicYearName) => {
        const doc = generatePDFContent(studentName, studentScores, scoreCategories, studentNis, grade, academicYearName);
        const safeYear = academicYearName.replace(/[/\\:*?"<>|]/g, '-');
        doc.save(`Raport_${studentName}_${safeYear}.pdf`);
    };

    const previewReport = (studentName, studentScores, studentNis, grade, academicYearName) => {
        const doc = generatePDFContent(studentName, studentScores, scoreCategories, studentNis, grade, academicYearName);
        const pdfBlob = doc.output('blob');
        const pdfUrl = URL.createObjectURL(pdfBlob);
        navigate('/munaqasyah/student/score', { state: { pdfUrl, studentName, academicYearName } });
    };

    return (
        <div className="min-h-screen bg-gray-50 px-4 py-8 md:p-8">
            <div className="max-w-6xl mx-auto">
                <div className="flex justify-between items-center mb-6 h-9">
                    <h1 className="text-2xl font-semibold text-gray-900">{rawScores[0]?.classId.name}</h1>
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
                    {rawScores.map((score, idx) => (
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
                                        <div className="flex flex-col md:flex-row gap-2 my-2 md:my-0">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    // Use normalized score for PDF
                                                    downloadReport(score.studentId.name, scores[idx], score.studentNis, score.classId.name, score.teachingGroupYearId.academicYearId.name);
                                                }}
                                                className='btn-primary-outline m-0 text-gray-700'>
                                                Unduh Raport Orang Tua
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    // Use normalized score for PDF
                                                    previewReport(score.studentId.name, scores[idx], score.studentNis, score.classId.name, score.teachingGroupYearId.academicYearId.name);
                                                }}
                                                className='btn-primary-outline m-0 text-gray-700 hidden md:block'>
                                                Lihat Raport Orang Tua
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    // Use raw score for PDF
                                                    downloadReport(score.studentId.name, rawScores[idx], score.studentNis, score.classId.name, score.teachingGroupYearId.academicYearId.name);
                                                }}
                                                className='btn-primary-outline m-0 text-gray-700'>
                                                Unduh Raport Pengurus
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    // Use raw score for PDF
                                                    previewReport(score.studentId.name, rawScores[idx], score.studentNis, score.classId.name, score.teachingGroupYearId.academicYearId.name);
                                                }}
                                                className='btn-primary-outline m-0 text-gray-700 hidden md:block'>
                                                Lihat Raport Pengurus
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
                                                <span className="font-medium text-gray-800">
                                                    {score[category.key]?.score > 0 ? score[category.key]?.score : '-'}
                                                </span>
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