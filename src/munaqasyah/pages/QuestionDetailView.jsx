import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import useHttp from '../../shared/hooks/http-hook';
import LoadingCircle from '../../shared/Components/UIElements/LoadingCircle';
import ErrorCard from '../../shared/Components/UIElements/ErrorCard';

const QuestionDetailView = () => {
    const [question, setQuestion] = useState(null);
    const { isLoading, error, sendRequest } = useHttp();
    const { questionId } = useParams();

    const getTypeName = (type) => ({
        multipleChoices: 'Pilihan Ganda',
        shortAnswer: 'Jawab Cermat',
        practice: 'Praktik',
    }[type]);

    const getCategoryName = (category) => ({
        reciting: "Membaca Al-Qur'an/Tilawati",
        writing: "Menulis Arab",
        quranTafsir: "Tafsir Al-Qur'an",
        hadithTafsir: "Tafsir Hadits",
        practice: "Praktek Ibadah",
        moralManner: "Akhlak dan Tata Krama",
        memorizing: "Hafalan",
        knowledge: "Keilmuan dan Kefahaman Agama",
        independence: "Kemandirian",
    }[category]);

    const getClassGrade = (grade) => ({
        'pra-paud': 'Kelas Pra-Paud',
        'paud': 'Kelas Paud',
        '1': 'Kelas 1',
        '2': 'Kelas 2',
        '3': 'Kelas 3',
        '4': 'Kelas 4',
        '5': 'Kelas 5',
        '6': 'Kelas 6',
    }[grade]);

    useEffect(() => {
        const fetchQuestion = async () => {
            try {
                const responseData = await sendRequest(
                    `${import.meta.env.VITE_BACKEND_URL}/munaqasyah/questions/${questionId}`
                );
                setQuestion(responseData.question);
            } catch (err) {
                // Error handled by useHttp
            }
        };
        fetchQuestion();
    }, [sendRequest, questionId]);

    if (isLoading) {
        return (
            <div className="flex justify-center mt-16">
                <LoadingCircle size={32} />
            </div>
        );
    }

    if (error) {
        return <ErrorCard error={error} />;
    }

    if (!question) {
        return null;
    }

    return (
        <div className="min-h-screen px-4 py-8 md:p-8">
            <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-sm p-6">
                <h1 className="text-2xl font-semibold text-gray-900 mb-6">Detail Soal</h1>

                <div className="space-y-6">
                    <div className="flex flex-col gap-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <h3 className="text-sm font-medium text-gray-500">Tipe Soal</h3>
                                <p className="mt-1 text-gray-900">{getTypeName(question.type)}</p>
                            </div>
                            <div>
                                <h3 className="text-sm font-medium text-gray-500">Kategori</h3>
                                <p className="mt-1 text-gray-900">{getCategoryName(question.category)}</p>
                            </div>
                            <div>
                                <h3 className="text-sm font-medium text-gray-500">Semester</h3>
                                <p className="mt-1 text-gray-900">{question.semester === '1' ? 'Ganjil' : 'Genap'}</p>
                            </div>
                            <div>
                                <h3 className="text-sm font-medium text-gray-500">Bobot Nilai Maksimal</h3>
                                <p className="mt-1 text-blue-600 font-medium">{question.maxScore} Poin</p>
                            </div>
                            <div>
                                <h3 className="text-sm font-medium text-gray-500">Kelas</h3>
                                <p className="mt-1 text-gray-900 font-medium">{getClassGrade(question.classGrade)}</p>
                            </div>
                        </div>

                        <div className="border-t pt-4">
                            <h3 className="text-sm font-medium text-gray-500">Pertanyaan</h3>
                            <p className="mt-1 text-gray-900 whitespace-pre-line">{question.question}</p>
                        </div>

                        <div className="border-t pt-4">
                            <h3 className="text-sm font-medium text-gray-500">Jawaban</h3>
                            {question.answers.map((answer, index) => (
                                <p key={index} className="mt-1 text-gray-900">{answer}</p>
                            ))}
                        </div>

                        {question.instruction && (
                            <div className="border-t pt-4">
                                <h3 className="text-sm font-medium text-gray-500">Petunjuk Penilaian</h3>
                                <pre className="mt-1 text-gray-900 whitespace-pre-wrap font-sans">
                                    {question.instruction}
                                </pre>
                            </div>
                        )}

                        {question.scoreOptions && question.scoreOptions.length > 0 && (
                            <div className="border-t pt-4">
                                <h3 className="text-sm font-medium text-gray-500">Opsi Nilai</h3>
                                <div className="mt-1 flex gap-2 flex-wrap">
                                    {question.scoreOptions.map((score, index) => (
                                        <span
                                            key={index}
                                            className="px-2 py-1 bg-gray-100 text-gray-700 rounded-md"
                                        >
                                            {score}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default QuestionDetailView;