import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import useHttp from '../../shared/hooks/http-hook';
import LoadingCircle from '../../shared/Components/UIElements/LoadingCircle';
import ErrorCard from '../../shared/Components/UIElements/ErrorCard';

import { Pencil, Trash } from 'lucide-react';
import Modal from '../../shared/Components/UIElements/ModalBottomClose';
import { AuthContext } from '../../shared/Components/Context/auth-context';

const QuestionDetailView = () => {
    const [question, setQuestion] = useState(null);
    const { isLoading, error, sendRequest } = useHttp();
    const [modal, setModal] = useState({ title: '', message: '', onConfirm: null });
    const [modalIsOpen, setModalIsOpen] = useState(false);

    const { questionId } = useParams();
    const navigate = useNavigate();
    const auth = useContext(AuthContext)

    const getStatusStyle = (type) => {
        switch (type) {
            case 'active':
                return 'text-green-500';
            case 'inactive':
                return 'text-gray-500';
            case 'checkNeeded':
                return 'text-red-500';
            default:
                return 'text-red-500';
        }
    };

    const getStatusName = (status) => {
        const statusMap = {
            active: "Aktif",
            inactive: "Non-aktif",
            checkneeded: "Periksa!",
        };
        return statusMap[status] || 'Periksa!';
    };

    const getTypeName = (type) => ({
        multipleChoices: 'Pilihan Ganda',
        shortAnswer: 'Jawab Cermat',
        practice: 'Praktik',
    }[type]);

    const getCategoryName = (category) => {
        const categoryMap = {
            reciting: "Membaca Al-Qur'an/Tilawati",
            writing: "Menulis Arab",
            quranTafsir: "Tafsir Al-Qur'an",
            hadithTafsir: "Tafsir Hadits",
            practice: "Praktek Ibadah",
            moralManner: "Akhlak dan Tata Krama",
            memorizingSurah: "Hafalan Surat-surat Al-Quran",
            memorizingHadith: "Hafalan Hadist",
            memorizingDua: "Hafalan Do'a",
            memorizingBeautifulName: "Hafalan Asmaul Husna",
            knowledge: "Keilmuan dan Kefahaman Agama",
            independence: "Kemandirian",
        };
        return categoryMap[category] || 'kosong';
    };

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
        let isActive = true;

        const fetchQuestion = async () => {
            try {
                const responseData = await sendRequest(
                    `${import.meta.env.VITE_BACKEND_URL}/munaqasyahs/questions/${questionId}`
                );
                if (isActive) {
                    setQuestion(responseData.question);
                }
            } catch (err) {
                // Error handled by useHttp
            }
        };
        fetchQuestion();

        return () => {
            isActive = false;
        };
    }, [sendRequest, questionId]);

    const handleDeleteQuestion = (questionId) => {
        const confirmDelete = async () => {
            try {
                const responseData = await sendRequest(`${import.meta.env.VITE_BACKEND_URL}/munaqasyahs/questions/${questionId}`, 'DELETE', null, {
                    'Content-Type': 'application/json',
                    Authorization: 'Bearer ' + auth.token
                });
                setModal({
                    title: 'Berhasil!',
                    message: responseData.message,
                    onConfirm: null
                });
            } catch (err) {
                // Error handled by useHttp
            }
        };
        setModal({
            title: 'Peringatan!',
            message: 'Hapus Soal?',
            onConfirm: confirmDelete,
        });
        setModalIsOpen(true);
    };

    const handleUpdateQuestionStatus = (questionId, status) => {
        const confirmDelete = async () => {
            const body = JSON.stringify({ status: status });
            try {
                const responseData = await sendRequest(`${import.meta.env.VITE_BACKEND_URL}/munaqasyahs/questions/${questionId}/status`, 'PATCH', body, {
                    'Content-Type': 'application/json',
                    Authorization: 'Bearer ' + auth.token
                });
                setQuestion({ ...question, status: status });
                setModal({
                    title: 'Berhasil!',
                    message: responseData.message,
                    onConfirm: null
                });
            } catch (err) {
                // Error handled by useHttp
            }
        };
        setModal({
            title: 'Peringatan!',
            message: 'Ubah Status Soal?',
            onConfirm: confirmDelete,
        });
        setModalIsOpen(true);
    };

    const ModalFooter = () => (
        <div className="flex gap-2 items-center">
            <button
                onClick={() => {
                    setModalIsOpen(false)
                    // !error && navigate(-1);
                }}
                className={`${modal.onConfirm ? 'btn-danger-outline' : 'button-primary mt-0 '}`}
            >
                {modal.onConfirm ? 'Batal' : 'Tutup'}
            </button>
            {modal.onConfirm && (
                <button onClick={modal.onConfirm} className="button-primary mt-0 ">
                    Ya
                </button>
            )}
        </div>
    );

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
                <Modal
                    isOpen={modalIsOpen}
                    onClose={() => setModalIsOpen(false)}
                    title={modal.title}
                    footer={<ModalFooter />}
                >
                    {isLoading && (
                        <div className="flex justify-center mt-16">
                            <LoadingCircle size={32} />
                        </div>
                    )}
                    {!isLoading && (
                        modal.message
                    )}
                </Modal>

                <div className="flex flex-col md:flex-row  gap-2 mb-6 md:items-center">
                    <h1 className="text-2xl font-semibold text-gray-900">Detail Soal</h1>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/munaqasyah/question-bank/${question.classGrade}/${questionId}/update`);
                        }}
                        className="button-primary m-0 pl-3 gap-1"
                    >
                        <Pencil className="w-4 h-4" />
                        Edit
                    </button>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteQuestion(questionId);
                        }}
                        className="button-danger m-0 pl-3 gap-1"
                    >
                        <Trash className="w-4 h-4" />
                        Hapus
                    </button>
                    {
                        question.status !== 'active' &&
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                handleUpdateQuestionStatus(questionId, 'active');
                            }}
                            className="button-danger border-green-600 hover:bg-green-600 focus:ring-green-600 m-0 pl-3 gap-1"
                        >
                            Aktifkan
                        </button>
                    }
                    {
                        question.status !== 'inactive' && question.status !== 'checkneeded' &&
                        < button
                            onClick={(e) => {
                                e.stopPropagation();
                                handleUpdateQuestionStatus(questionId, 'inactive');
                            }}
                            className="button-danger border-gray-600 hover:bg-gray-600 focus:ring-gray-600 m-0 pl-3 gap-1"
                        >
                            Nonaktifkan
                        </button>
                    }
                    {
                        question.status !== 'checkneeded' &&
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                handleUpdateQuestionStatus(questionId, 'checkneeded');
                            }}
                            className="button-danger border-yellow-600 hover:bg-yellow-600 focus:ring-yellow-600 m-0 pl-3 gap-1"
                        >
                            Tandai Periksa
                        </button>
                    }
                </div>

                <div className="space-y-6">
                    <div className="flex flex-col gap-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <h3 className="text-sm font-medium text-gray-500">Status</h3>
                                <p className={`${getStatusStyle(question.status)}`}>{getStatusName(question.status)}</p>
                            </div>
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
        </div >
    );
};

export default QuestionDetailView;