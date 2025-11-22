import { Link, useNavigate, useParams } from "react-router-dom";
import LoadingCircle from "../../shared/Components/UIElements/LoadingCircle";
import DataTable from "../../shared/Components/UIElements/DataTable";
import ErrorCard from "../../shared/Components/UIElements/ErrorCard";
import NewModal from "../../shared/Components/Modal/NewModal";
import useModal from "../../shared/hooks/useNewModal";

import getCategoryName from "../utilities/getCategoryName";
import { Pencil, Trash, PlusIcon } from "lucide-react";
import {
    useDeleteQuestionMutation,
    useQuestionBank,
} from "../../shared/queries/useQuestionBank";

// Styling logic outsourced to this function
const getTypeStyle = (type) => {
    switch (type) {
        case "multipleChoices":
            return "bg-blue-100 text-blue-700";
        case "shortAnswer":
            return "bg-green-100 text-green-700";
        case "practice":
            return "bg-purple-100 text-purple-700";
        default:
            return "";
    }
};

const getStatusStyle = (type) => {
    switch (type) {
        case "active":
            return "text-green-500";
        case "inactive":
            return "text-gray-500";
        case "checkNeeded":
            return "text-red-500";
        default:
            return "text-red-500";
    }
};

const getTypeName = (type) =>
    ({
        multipleChoices: "Pilihan Ganda",
        shortAnswer: "Jawab Cermat",
        practice: "Praktik",
    }[type]);

const getStatusName = (status) => {
    const statusMap = {
        active: "Aktif",
        inactive: "Non-aktif",
        checkneeded: "Periksa!",
    };
    return statusMap[status] || "Periksa!";
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
        12: "Desember",
    };
    return monthMap[month] || "kosong";
};

const QuestionBankView = () => {
    const { modalState, openModal, closeModal } = useModal();
    const navigate = useNavigate();
    const classGrade = useParams().classGrade;

    const {
        data: questions = [],
        isLoading: isQuestionsLoading,
        error: questionsError,
    } = useQuestionBank(classGrade);

    const { mutateAsync: deleteQuestion, isLoading: isDeleting } =
        useDeleteQuestionMutation();

    const questionData = questions ?? [];

    const handleDeleteQuestion = (questionId) => {
        const confirmDelete = async () => {
            try {
                const responseData = await deleteQuestion({
                    questionId,
                    classGrade,
                });
                openModal(
                    responseData?.message,
                    "success",
                    null,
                    "Berhasil!",
                    false
                );
            } catch (err) {
                openModal(
                    err?.message || "Gagal menghapus soal",
                    "error",
                    null,
                    "Gagal!",
                    false
                );
            }
        };

        openModal(
            "Hapus Soal?",
            "confirmation",
            confirmDelete,
            "Peringatan!",
            true
        );
    };

    const columns = [
        {
            key: "status",
            label: "Status",
            sortable: true,
            cellStyle: (question) =>
                `text-sm ${getStatusStyle(question.status)}`,
            render: (question) => getStatusName(question.status),
        },
        {
            key: "type",
            label: "Tipe Soal",
            sortable: true,
            cellStyle: (question) =>
                `px-2 py-1 rounded-full text-sm ${getTypeStyle(question.type)}`,
            render: (question) => getTypeName(question.type),
        },
        {
            key: "category",
            label: "Kategori Materi",
            sortable: true,
            render: (question) => getCategoryName(question.category),
        },
        {
            key: "semester",
            label: "Semester",
            sortable: true,
            render: (question) =>
                question.semester === "1" ? "Ganjil" : "Genap",
        },
        {
            key: "curriculumMonth",
            label: "Bulan Materi",
            sortable: true,
            render: (question) => getMothName(question.curriculumMonth),
        },
        {
            key: "maxScore",
            label: "Bobot Nilai",
            sortable: true,
            cellStyle: () => "font-medium text-blue-600 font-lpmq",
            render: (question) => `${question.maxScore} Poin`,
        },
        {
            key: "question",
            label: "Pertanyaan",
            sortable: true,
            render: (question) => (
                <div className="max-w-md font-lpmq truncate">
                    {question.question}
                </div>
            ),
        },
        {
            key: "answer",
            label: "Jawaban",
            sortable: true,
            render: (question) => (
                <div className="max-w-md font-lpmq text-gray-600 truncate">
                    {question.answers[0]}
                </div>
            ),
        },
        {
            key: "actions",
            label: "Aksi",
            render: (question) => (
                <div className="flex gap-2">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            navigate(
                                `/munaqasyah/question-bank/${classGrade}/${question._id}/update`
                            );
                        }}
                        className="hover:bg-gray-100 p-2 rounded-full"
                    >
                        <Pencil className="w-4 h-4" />
                    </button>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteQuestion(question._id);
                        }}
                        className="hover:bg-gray-100 p-2 rounded-full text-red-500"
                    >
                        <Trash className="w-4 h-4" />
                    </button>
                </div>
            ),
        },
    ];

    const filterOptions = [
        {
            key: "semester",
            label: "Semester",
            options: ["Ganjil", "Genap"],
        },
    ];

    if (questionData.length > 0) {
        const types = [
            ...new Set(
                questionData.map((t) => getTypeName(t?.type)).filter(Boolean)
            ),
        ];
        const categories = [
            ...new Set(
                questionData
                    .map((t) => getCategoryName(t?.category))
                    .filter(Boolean)
            ),
        ];

        const maxScores = [
            ...new Set(
                questionData.map((t) => t?.maxScore + " Poin").filter(Boolean)
            ),
        ];

        filterOptions.unshift(
            {
                key: "status",
                label: "Status",
                options: ["Aktif", "Non-aktif", "Periksa!"],
            },
            {
                key: "type",
                label: "Tipe Soal",
                options: types,
            },
            {
                key: "category",
                label: "Kategori Materi",
                options: categories,
            }
        );

        filterOptions.push({
            key: "maxScore",
            label: "Bobot Nilai",
            options: maxScores,
        });
    }

    return (
        <div className="md:p-8 px-4 py-8 min-h-screen">
            <div className="mx-auto max-w-6xl">
                <NewModal
                    modalState={modalState}
                    onClose={closeModal}
                    isLoading={isDeleting}
                />

                <div className="flex flex-col justify-between items-stretch gap-2 mb-4">
                    <div className="flex items-center gap-4 mb-6">
                        <h1 className="font-semibold text-gray-900 text-2xl">
                            Bank Soal Kelas{" "}
                            {classGrade.charAt(0).toUpperCase() +
                                classGrade.slice(1)}
                        </h1>
                        <Link
                            to={`/munaqasyah/question-bank/${classGrade}/new`}
                        >
                            <button className="inline-flex items-center bg-blue-500 hover:bg-blue-600 py-2 pr-4 pl-3 rounded-md text-white transition-colors duration-200">
                                <PlusIcon className="mr-2 w-4 h-4" />
                                Tambah
                            </button>
                        </Link>
                    </div>
                </div>

                {questionsError && (
                    <ErrorCard
                        error={questionsError?.message || "Gagal memuat data"}
                    />
                )}

                {isQuestionsLoading && (
                    <div className="flex justify-center mt-16">
                        <LoadingCircle size={32} />
                    </div>
                )}

                <DataTable
                    data={questionData}
                    columns={columns}
                    onRowClick={(question) =>
                        navigate(
                            `/munaqasyah/question-bank/${classGrade}/${question._id}`
                        )
                    }
                    searchableColumns={[
                        "question",
                        "answer",
                        "semester",
                        "category",
                        "type",
                    ]}
                    initialSort={{ key: "type", direction: "ascending" }}
                    isLoading={isQuestionsLoading}
                    filterOptions={filterOptions}
                    tableId={`questionsBank-table-${classGrade}`}
                />
            </div>
        </div>
    );
};

export default QuestionBankView;
