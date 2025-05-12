import React, { useContext, useState, useEffect } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom';
import { AuthContext } from '../../shared/Components/Context/auth-context';
import useHttp from '../../shared/hooks/http-hook';
import LoadingCircle from '../../shared/Components/UIElements/LoadingCircle';
import DataTable from '../../shared/Components/UIElements/DataTable';
import Modal from '../../shared/Components/UIElements/ModalBottomClose';


import getCategoryName from '../utilities/getCategoryName';
import { Pencil, Trash, PlusIcon } from 'lucide-react';


const QuestionBankView = () => {
    const [questions, setQuestions] = useState([])
    const [modal, setModal] = useState({ title: '', message: '', onConfirm: null });
    const [modalIsOpen, setModalIsOpen] = useState(false);

    const { error, isLoading, sendRequest, setError } = useHttp();

    const navigate = useNavigate();
    const auth = useContext(AuthContext);
    const classGrade = useParams().classGrade;

    // Styling logic outsourced to this function
    const getTypeStyle = (type) => {
        switch (type) {
            case 'multipleChoices':
                return 'bg-blue-100 text-blue-700';
            case 'shortAnswer':
                return 'bg-green-100 text-green-700';
            case 'practice':
                return 'bg-purple-100 text-purple-700';
            default:
                return '';
        }
    };

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

    const getTypeName = (type) => ({
        multipleChoices: 'Pilihan Ganda',
        shortAnswer: 'Jawab Cermat',
        practice: 'Praktik',
    }[type]);

    const getStatusName = (status) => {
        const statusMap = {
            active: "Aktif",
            inactive: "Non-aktif",
            checkneeded: "Periksa!",
        };
        return statusMap[status] || 'Periksa!';
    };

    const getMothName = (month) => {
        const monthMap = {
            1: "Januari",
            2: "Februari",
            3: "Maret",
            4: "April",
            5: "Mei",
            6: "Juni",
            7: "Juli",
            8: "Agustus",
            9: "September",
            10: "Oktober",
            11: "November",
            12: "Desember"
        };
        return monthMap[month] || 'kosong';
    };

    useEffect(() => {
        const url = `${import.meta.env.VITE_BACKEND_URL}/munaqasyahs/questions/class/${classGrade}`;

        const fetchQuestions = async () => {
            try {
                const responseData = await sendRequest(url);
                setQuestions(responseData.questions);
                console.log(responseData);
            } catch (err) {
                // Error is handled by useHttp
            }
        };
        fetchQuestions();
    }, [sendRequest]);

    const columns = [
        {
            key: 'status',
            label: 'Status',
            sortable: true,
            cellStyle: (question) => `text-sm ${getStatusStyle(question.status)}`,
            render: (question) => getStatusName(question.status)
        },
        {
            key: 'type',
            label: 'Tipe Soal',
            sortable: true,
            cellStyle: (question) => `px-2 py-1 rounded-full text-sm ${getTypeStyle(question.type)}`,
            render: (question) => getTypeName(question.type)
        },
        {
            key: 'category',
            label: 'Kategori Materi',
            sortable: true,
            render: (question) => getCategoryName(question.category)
        },
        {
            key: 'semester',
            label: 'Semester',
            sortable: true,
            render: (question) => question.semester === '1' ? 'Ganjil' : 'Genap'
        },
        {
            key: 'curriculumMonth',
            label: 'Bulan Materi',
            sortable: true,
            render: (question) => getMothName(question.curriculumMonth)
        },
        {
            key: 'maxScore',
            label: 'Bobot Nilai',
            sortable: true,
            cellStyle: () => 'font-medium text-blue-600 font-lpmq',
            render: (question) => `${question.maxScore} Poin`
        },
        {
            key: 'question',
            label: 'Pertanyaan',
            sortable: true,
            render: (question) => (
                <div className="max-w-md truncate font-lpmq">
                    {question.question}
                </div>
            )
        },
        {
            key: 'answer',
            label: 'Jawaban',
            sortable: true,
            render: (question) => (
                <div className="max-w-md truncate text-gray-600 font-lpmq">
                    {question.answers[0]}
                </div>
            )
        },
        {
            key: 'actions',
            label: 'Aksi',
            render: (question) => (
                <div className="flex gap-2">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/munaqasyah/question-bank/${classGrade}/${question._id}/update`);
                        }}
                        className="p-2 hover:bg-gray-100 rounded-full"
                    >
                        <Pencil className="w-4 h-4" />
                    </button>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteQuestion(question._id);
                        }}
                        className="p-2 hover:bg-gray-100 rounded-full text-red-500"
                    >
                        <Trash className="w-4 h-4" />
                    </button>
                </div>
            )
        }
    ];

    const filterOptions = [
        {
            key: 'semester',
            label: 'Semester',
            options: ['Ganjil', 'Genap']
        }
    ];
    // console.log(filterOptions)

    if (questions?.length > 0) {
        // console.log(JSON.stringify(questions))
        const types = [...new Set(questions.map(t => getTypeName(t?.type)).filter(Boolean))];
        const categories = [...new Set(questions.map(t => getCategoryName(t?.category)).filter(Boolean))];

        const maxScores = [...new Set(questions.map(t => t?.maxScore + ' Poin').filter(Boolean))];

        filterOptions.unshift(
            {
                key: 'status',
                label: 'Status',
                options: ['Aktif', 'Non-aktif', 'Periksa!']
            },
            {
                key: 'type',
                label: 'Tipe Soal',
                options: types
            },
            {
                key: 'category',
                label: 'Kategori Materi',
                options: categories
            }
        );

        filterOptions.push(
            {
                key: 'maxScore',
                label: 'Bobot Nilai',
                options: maxScores
            }
        )

        // console.log(filterOptions)
    }

    const handleDeleteQuestion = (questionId) => {
        const confirmDelete = async () => {
            try {
                const responseData = await sendRequest(`${import.meta.env.VITE_BACKEND_URL}/munaqasyahs/questions/${questionId}`, 'DELETE', null, {
                    'Content-Type': 'application/json',
                    Authorization: 'Bearer ' + auth.token
                });
                console.log(responseData)
                setModal({ title: 'Berhasil!', message: responseData.message, onConfirm: null });
                setQuestions(prevQuestions => prevQuestions.filter(question => question._id !== questionId));
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

    const ModalFooter = () => (
        <div className="flex gap-2 items-center">
            <button
                onClick={() => {
                    setModalIsOpen(false)
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

    return (
        <div className="min-h-screen px-4 py-8 md:p-8">
            <div className='max-w-6xl mx-auto'>
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

                <div className="flex flex-col justify-between items-stretch gap-2 mb-4">
                    <div className="flex items-center mb-6 gap-4">
                        <h1 className="text-2xl font-semibold text-gray-900">Bank Soal Kelas {classGrade.charAt(0).toUpperCase() + classGrade.slice(1)}</h1>
                        <Link to={`/munaqasyah/question-bank/${classGrade}/new`}>
                            <button className="inline-flex items-center pr-4 pl-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md transition-colors duration-200">
                                <PlusIcon className="w-4 h-4 mr-2" />
                                Tambah
                            </button>
                        </Link>
                    </div>
                </div>
                {isLoading && (
                    <div className="flex justify-center mt-16">
                        <LoadingCircle size={32} />
                    </div>
                )}
                {questions && (
                    <DataTable
                        data={questions}
                        columns={columns}
                        onRowClick={(question) => navigate(`/munaqasyah/question-bank/${classGrade}/${question._id}`)}
                        searchableColumns={['question', 'answer', 'semester', 'category', 'type']}
                        initialSort={{ key: 'type', direction: 'ascending' }}
                        isLoading={isLoading}
                        filterOptions={filterOptions}
                        tableId={`questionsBank-table-${classGrade}`} // <-- Add unique tableId
                    />
                )}
            </div>
        </div>
    );
};

export default QuestionBankView