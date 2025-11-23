import { useEffect, useContext } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
    useQuestion,
    useDeleteQuestionMutation,
    useUpdateQuestionStatusMutation,
} from "../../shared/queries/useQuestionBank";
import LoadingCircle from "../../shared/Components/UIElements/LoadingCircle";
import ErrorCard from "../../shared/Components/UIElements/ErrorCard";

import getCategoryName from "../utilities/getCategoryName";
import { Pencil, Trash } from "lucide-react";
import NewModal from "../../shared/Components/Modal/NewModal";
import useModal from "../../shared/hooks/useNewModal";

const QuestionDetailView = () => {
    const { questionId } = useParams();
    const {
        data: question,
        isLoading: isLoadingQuestion,
        error: queryError,
    } = useQuestion(questionId);
    const { modalState, openModal, closeModal } = useModal();

    const navigate = useNavigate();
    const deleteQuestionMutation = useDeleteQuestionMutation();
    const updateQuestionStatusMutation = useUpdateQuestionStatusMutation();
    const isProcessing =
        isLoadingQuestion ||
        deleteQuestionMutation.isPending ||
        updateQuestionStatusMutation.isPending;

    const mutationErrorMessage =
        deleteQuestionMutation.error?.response?.data?.message ||
        deleteQuestionMutation.error?.message ||
        (deleteQuestionMutation.error
            ? String(deleteQuestionMutation.error)
            : null) ||
        updateQuestionStatusMutation.error?.response?.data?.message ||
        updateQuestionStatusMutation.error?.message ||
        (updateQuestionStatusMutation.error
            ? String(updateQuestionStatusMutation.error)
            : null) ||
        null;

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

    const getMonthName = (month) => {
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

    const getClassGrade = (grade) => {
        const gradeMap = {
            "pra-paud": "Kelas Pra-Paud",
            paud: "Kelas Paud",
            1: "Kelas 1",
            2: "Kelas 2",
            3: "Kelas 3",
            4: "Kelas 4",
            5: "Kelas 5",
            6: "Kelas 6",
            7: "Kelas 7",
            8: "Kelas 8",
            9: "Kelas 9",
            khusus: "Kelas Khusus",
        };
        return gradeMap[grade] || "kosong";
    };

    const handleDeleteQuestion = (questionId) => {
        const confirmDelete = async () => {
            try {
                const responseData = await deleteQuestionMutation.mutateAsync({
                    questionId,
                    classGrade: question?.classGrade,
                });
                openModal(
                    responseData.message,
                    "success",
                    () => {
                        navigate(-1);
                        return false;
                    },
                    "Berhasil!",
                    false
                );
            } catch (err) {
                // Error surfaced via React Query
            }
            // prevent modal from closing automatically; we close it manually above
            return false;
        };
        openModal(
            "Hapus Soal?",
            "confirmation",
            confirmDelete,
            "Peringatan!",
            true
        );
    };

    const handleUpdateQuestionStatus = (questionId, status) => {
        const confirmUpdate = async () => {
            try {
                const responseData =
                    await updateQuestionStatusMutation.mutateAsync({
                        questionId,
                        status,
                        classGrade: question?.classGrade,
                    });
                openModal(
                    responseData.message,
                    "success",
                    null,
                    "Berhasil!",
                    false
                );
            } catch (err) {
                // Error surfaced via React Query
            }
        };
        openModal(
            "Ubah Status Soal?",
            "confirmation",
            confirmUpdate,
            "Peringatan!",
            true
        );
    };

    if (isLoadingQuestion) {
        return (
            <div className="flex justify-center mt-16">
                <LoadingCircle size={32} />
            </div>
        );
    }

    if (queryError) {
        return <ErrorCard error={queryError} />;
    }

    if (!question) {
        return null;
    }

    return (
        <div className="md:p-8 px-4 py-8 min-h-screen">
            <div className="bg-white shadow-xs mx-auto p-6 rounded-lg max-w-4xl">
                <NewModal
                    modalState={modalState}
                    onClose={closeModal}
                    isLoading={isProcessing}
                />

                <div className="flex md:flex-row flex-col md:items-center gap-2 mb-6">
                    <h1 className="font-semibold text-gray-900 text-2xl">
                        Detail Soal
                    </h1>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            if (!isProcessing && question)
                                navigate(
                                    `/munaqasyah/question-bank/${question.classGrade}/${questionId}/update`
                                );
                        }}
                        className={`button-primary m-0 pl-3 gap-1 ${
                            isProcessing ? "opacity-50 cursor-not-allowed" : ""
                        }`}
                        disabled={isProcessing}
                    >
                        <Pencil className="w-4 h-4" />
                        Edit
                    </button>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            if (!isProcessing) handleDeleteQuestion(questionId);
                        }}
                        className={`button-danger m-0 pl-3 gap-1 ${
                            isProcessing ? "opacity-50 cursor-not-allowed" : ""
                        }`}
                        disabled={isProcessing}
                    >
                        <Trash className="w-4 h-4" />
                        Hapus
                    </button>
                    {question?.status !== "active" && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                if (!isProcessing)
                                    handleUpdateQuestionStatus(
                                        questionId,
                                        "active"
                                    );
                            }}
                            className={`button-danger border-green-600 hover:bg-green-600 focus:ring-green-600 m-0 pl-3 gap-1 ${
                                isProcessing
                                    ? "opacity-50 cursor-not-allowed"
                                    : ""
                            }`}
                            disabled={isProcessing}
                        >
                            Aktifkan
                        </button>
                    )}
                    {question?.status !== "inactive" &&
                        question?.status !== "checkneeded" && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    if (!isProcessing)
                                        handleUpdateQuestionStatus(
                                            questionId,
                                            "inactive"
                                        );
                                }}
                                className={`button-danger border-gray-600 hover:bg-gray-600 focus:ring-gray-600 m-0 pl-3 gap-1 ${
                                    isProcessing
                                        ? "opacity-50 cursor-not-allowed"
                                        : ""
                                }`}
                                disabled={isProcessing}
                            >
                                Nonaktifkan
                            </button>
                        )}
                    {question?.status !== "checkneeded" && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                if (!isProcessing)
                                    handleUpdateQuestionStatus(
                                        questionId,
                                        "checkneeded"
                                    );
                            }}
                            className={`button-danger border-yellow-600 hover:bg-yellow-600 focus:ring-yellow-600 m-0 pl-3 gap-1 ${
                                isProcessing
                                    ? "opacity-50 cursor-not-allowed"
                                    : ""
                            }`}
                            disabled={isProcessing}
                        >
                            Tandai Periksa
                        </button>
                    )}
                </div>

                {mutationErrorMessage && (
                    <div className="px-2">
                        <ErrorCard error={mutationErrorMessage} />
                    </div>
                )}
                <div className="space-y-6">
                    <div className="flex flex-col gap-4">
                        <div className="gap-4 grid grid-cols-1 md:grid-cols-2">
                            <div>
                                <h3 className="font-medium text-gray-500 text-sm">
                                    Status
                                </h3>
                                <p
                                    className={`${getStatusStyle(
                                        question?.status
                                    )}`}
                                >
                                    {getStatusName(question?.status)}
                                </p>
                            </div>
                            <div>
                                <h3 className="font-medium text-gray-500 text-sm">
                                    Tipe Soal
                                </h3>
                                <p className="mt-1 text-gray-900">
                                    {getTypeName(question?.type)}
                                </p>
                            </div>
                            <div>
                                <h3 className="font-medium text-gray-500 text-sm">
                                    Kategori
                                </h3>
                                <p className="mt-1 text-gray-900">
                                    {getCategoryName(question?.category)}
                                </p>
                            </div>
                            <div>
                                <h3 className="font-medium text-gray-500 text-sm">
                                    Semester
                                </h3>
                                <p className="mt-1 text-gray-900">
                                    {question?.semester === "1"
                                        ? "Ganjil"
                                        : "Genap"}
                                </p>
                            </div>
                            <div>
                                <h3 className="font-medium text-gray-500 text-sm">
                                    Bulan Materi
                                </h3>
                                <p className="mt-1 text-gray-900">
                                    {getMonthName(question?.curriculumMonth)}
                                </p>
                            </div>
                            <div>
                                <h3 className="font-medium text-gray-500 text-sm">
                                    Bobot Nilai Maksimal
                                </h3>
                                <p className="mt-1 font-medium text-blue-600">
                                    {question?.maxScore} Poin
                                </p>
                            </div>
                            <div>
                                <h3 className="font-medium text-gray-500 text-sm">
                                    Kelas
                                </h3>
                                <p className="mt-1 font-medium text-gray-900">
                                    {getClassGrade(question?.classGrade)}
                                </p>
                            </div>
                        </div>

                        <div className="pt-4 border-t">
                            <h3 className="font-medium text-gray-500 text-sm">
                                Pertanyaan
                            </h3>
                            <p className="mt-1 font-lpmq text-gray-900 whitespace-pre-line">
                                {question?.question}
                            </p>
                        </div>

                        <div className="pt-4 border-t">
                            <h3 className="font-medium text-gray-500 text-sm">
                                Jawaban
                            </h3>
                            {question?.answers?.map((answer, index) => (
                                <p
                                    key={index}
                                    className="mt-1 font-lpmq text-gray-900 whitespace-pre-line"
                                >
                                    {answer}
                                </p>
                            ))}
                        </div>

                        {question.instruction && (
                            <div className="pt-4 border-t">
                                <h3 className="font-medium text-gray-500 text-sm">
                                    Petunjuk Penilaian
                                </h3>
                                <pre className="mt-1 font-sans text-gray-900 whitespace-pre-line">
                                    {question?.instruction}
                                </pre>
                            </div>
                        )}

                        {question?.scoreOptions &&
                            question?.scoreOptions.length > 0 && (
                                <div className="pt-4 border-t">
                                    <h3 className="font-medium text-gray-500 text-sm">
                                        Opsi Nilai
                                    </h3>
                                    <div className="flex flex-wrap gap-2 mt-1">
                                        {question?.scoreOptions?.map(
                                            (score, index) => (
                                                <span
                                                    key={index}
                                                    className="bg-gray-100 px-2 py-1 rounded-md text-gray-700"
                                                >
                                                    {score}
                                                </span>
                                            )
                                        )}
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
