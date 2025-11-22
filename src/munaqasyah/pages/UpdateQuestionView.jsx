import { useNavigate, useParams } from "react-router-dom";

import DynamicForm from "../../shared/Components/UIElements/DynamicForm";

import ErrorCard from "../../shared/Components/UIElements/ErrorCard";
import LoadingCircle from "../../shared/Components/UIElements/LoadingCircle";

import NewModal from "../../shared/Components/Modal/NewModal";
import useModal from "../../shared/hooks/useNewModal";
import {
    useQuestion,
    useUpdateQuestionMutation,
} from "../../shared/queries/useQuestionBank";

const UpdateQuestionView = () => {
    const { modalState, openModal, closeModal } = useModal();
    const questionId = useParams().questionId;
    const navigate = useNavigate();
    const {
        data: loadedQuestion,
        isLoading: isQuestionLoading,
        error: queryError,
    } = useQuestion(questionId);
    const updateQuestionMutation = useUpdateQuestionMutation();

    const questionCategory = [
        { label: "Membaca Al-Qur'an/Tilawati", value: "reciting" },
        { label: "Menulis Arab", value: "writing" },
        { label: "Tafsir Al-Qur'an", value: "quranTafsir" },
        { label: "Tafsir Hadits", value: "hadithTafsir" },
        { label: "Praktek Ibadah", value: "practice" },
        { label: "Akhlak dan Tata Krama", value: "moralManner" },
        { label: "Hafalan Surat-surat Al-Quran", value: "memorizingSurah" },
        { label: "Hafalan Hadits", value: "memorizingHadith" },
        { label: "Hafalan Do'a", value: "memorizingDua" },
        { label: "Hafalan Asmaul Husna", value: "memorizingBeautifulName" },
        { label: "Keilmuan dan Kefahaman Agama", value: "knowledge" },
        { label: "Kemandirian", value: "independence" },
    ];

    const questionFields = [
        {
            name: "type",
            label: "Tipe Soal",
            type: "select",
            required: false,
            options: [
                { label: "Pilihan Ganda", value: "multipleChoices" },
                { label: "Jawab Cermat", value: "shortAnswer" },
                { label: "Praktik", value: "practice" },
            ],
            value: loadedQuestion?.type || "",
        },
        {
            name: "category",
            label: "Kategori Materi",
            type: "select",
            required: false,
            options: questionCategory.map(({ label, value }) => ({
                label,
                value,
            })),
            value: loadedQuestion?.category || "",
        },
        {
            name: "semester",
            label: "Semester",
            type: "radio",
            required: false,
            options: [
                { label: "Ganjil", value: "1" },
                { label: "Genap", value: "2" },
            ],
            value: loadedQuestion?.semester || "",
        },
        {
            name: "curriculumMonth",
            label: "Materi Bulan",
            type: "select",
            required: true,
            options: [
                { label: "Januari", value: "1" },
                { label: "Februari", value: "2" },
                { label: "Maret", value: "3" },
                { label: "April", value: "4" },
                { label: "Mei", value: "5" },
                { label: "Juni", value: "6" },
                { label: "Juli", value: "7" },
                { label: "Agustus", value: "8" },
                { label: "September", value: "9" },
                { label: "Oktober", value: "10" },
                { label: "November", value: "11" },
                { label: "Desember", value: "12" },
            ],
            value: loadedQuestion?.curriculumMonth || "",
        },
        {
            name: "question",
            label: "Pertanyaan",
            placeholder: "",
            type: "textarea",
            textAreaRows: 4,
            required: false,
            value: loadedQuestion?.question || "",
        },
        {
            name: "answers",
            label: "Jawaban (tambah utk pilihan ganda)",
            placeholder: "",
            type: "multi-input",
            inputType: "textarea",
            textAreaRows: 3,
            required: false,
            value: loadedQuestion?.answers ?? undefined,
        },
        {
            name: "maxScore",
            label: "Skor Maksimal",
            type: "number",
            required: false,
            value: loadedQuestion?.maxScore || "",
        },
        {
            name: "scoreOptions",
            label: "Opsi Skor",
            type: "multi-input",
            required: false,
            inputType: "number",
            value: loadedQuestion?.scoreOptions ?? undefined,
        },
        {
            name: "instruction",
            label: "Petunjuk Penilaian",
            placeholder: "",
            type: "textarea",
            textAreaRows: 5,
            required: false,
            value: loadedQuestion?.instruction || "",
        },
    ];

    const handleFormSubmit = async (data) => {
        try {
            const payload = {
                type: data.type,
                category: data.category,
                semester: data.semester,
                curriculumMonth: data.curriculumMonth,
                maxScore: data.maxScore,
                scoreOptions: data.scoreOptions,
                instruction: data.instruction,
                question: data.question,
                answers: data.answers,
            };
            const responseData = await updateQuestionMutation.mutateAsync({
                questionId,
                data: payload,
                classGrade: loadedQuestion?.classGrade,
            });
            openModal(
                responseData.message,
                "success",
                () => {
                    navigate(-1);
                    return false; // Prevent immediate redirect
                },
                "Berhasil!",
                false
            );
        } catch (err) {
            // Error state is exposed via React Query
        }
    };

    const mutationErrorMessage =
        updateQuestionMutation.error?.response?.data?.message ||
        updateQuestionMutation.error?.message ||
        (updateQuestionMutation.error
            ? String(updateQuestionMutation.error)
            : null) ||
        null;

    const queryErrorMessage =
        queryError?.response?.data?.message ||
        queryError?.message ||
        (queryError ? String(queryError) : null) ||
        null;

    const isSubmitting = updateQuestionMutation.isPending;
    const isProcessing = isQuestionLoading || isSubmitting;
    const isFormDisabled =
        isProcessing || Boolean(queryError) || !loadedQuestion;
    const showLoadingState = isProcessing || !loadedQuestion;
    const notFoundMessage =
        loadedQuestion === null && !isQuestionLoading && !queryError
            ? "Data soal tidak ditemukan."
            : null;

    return (
        <div className="m-auto mt-14 md:mt-8 max-w-md">
            <NewModal
                modalState={modalState}
                onClose={closeModal}
                isLoading={isSubmitting}
            />

            <div className={`pb-24 transition-opacity duration-300`}>
                {queryErrorMessage && (
                    <div className="px-2">
                        <ErrorCard error={queryErrorMessage} />
                    </div>
                )}
                {notFoundMessage && (
                    <div className="px-2">
                        <ErrorCard error={notFoundMessage} />
                    </div>
                )}
                <DynamicForm
                    subtitle={"Update Soal Munaqosah"}
                    fields={questionFields}
                    onSubmit={handleFormSubmit}
                    disabled={isFormDisabled}
                    reset={false}
                    footer={false}
                    button={
                        <div className="flex flex-col justify-stretch mt-4">
                            <button
                                type="submit"
                                className={`button-primary ${
                                    isFormDisabled
                                        ? "opacity-50 cursor-not-allowed"
                                        : ""
                                }`}
                                disabled={isFormDisabled}
                            >
                                {showLoadingState ? (
                                    <LoadingCircle>
                                        {isSubmitting
                                            ? "Processing..."
                                            : "Loading..."}
                                    </LoadingCircle>
                                ) : (
                                    "Update"
                                )}
                            </button>
                            {mutationErrorMessage && (
                                <ErrorCard error={mutationErrorMessage} />
                            )}
                        </div>
                    }
                />
            </div>
        </div>
    );
};

export default UpdateQuestionView;
