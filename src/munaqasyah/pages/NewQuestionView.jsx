import { useNavigate, useParams } from "react-router-dom";

import DynamicForm from "../../shared/Components/UIElements/DynamicForm";

import ErrorCard from "../../shared/Components/UIElements/ErrorCard";
import LoadingCircle from "../../shared/Components/UIElements/LoadingCircle";
import NewModal from "../../shared/Components/Modal/NewModal";
import useModal from "../../shared/hooks/useNewModal";
import { useCreateQuestionMutation } from "../../shared/queries/useQuestionBank";

const NewQuestionView = () => {
    const { modalState, openModal, closeModal } = useModal();
    const navigate = useNavigate();
    const classGrade = useParams().classGrade;
    const createQuestionMutation = useCreateQuestionMutation();

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
            required: true,
            options: [
                { label: "Pilihan Ganda", value: "multipleChoices" },
                { label: "Jawab Cermat", value: "shortAnswer" },
                { label: "Praktik", value: "practice" },
            ],
        },
        {
            name: "category",
            label: "Kategori Materi",
            type: "select",
            required: true,
            options: questionCategory.map(({ label, value }) => ({
                label,
                value,
            })),
        },
        {
            name: "semester",
            label: "Semester",
            type: "radio",
            required: true,
            options: [
                { label: "Ganjil", value: "1" },
                { label: "Genap", value: "2" },
            ],
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
        },
        {
            name: "question",
            label: "Pertanyaan",
            placeholder: "",
            type: "textarea",
            textAreaRows: 4,
            required: true,
        },
        {
            name: "answers",
            label: "Jawaban (tambah utk pilihan ganda)",
            placeholder: "",
            type: "multi-input",
            inputType: "textarea",
            textAreaRows: 3,
            required: false,
        },
        {
            name: "maxScore",
            label: "Skor Maksimal",
            type: "number",
            required: true,
        },
        {
            name: "scoreOptions",
            label: "Opsi Skor",
            type: "multi-input",
            required: true,
            inputType: "number",
        },
        {
            name: "instruction",
            label: "Petunjuk Penilaian",
            placeholder: "",
            type: "textarea",
            textAreaRows: 5,
            required: true,
        },
    ];

    const handleFormSubmit = async (data) => {
        const payload = {
            classGrade,
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

        try {
            const responseData = await createQuestionMutation.mutateAsync(
                payload
            );
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
            // Error state is surfaced via React Query
        }
    };

    const mutationErrorMessage =
        createQuestionMutation.error?.response?.data?.message ||
        createQuestionMutation.error?.message ||
        (createQuestionMutation.error
            ? String(createQuestionMutation.error)
            : null) ||
        null;

    const isSubmitting = createQuestionMutation.isPending;

    return (
        <div className="m-auto mt-14 md:mt-8 max-w-md">
            <NewModal
                modalState={modalState}
                onClose={closeModal}
                isLoading={isSubmitting}
            />

            <div className={`pb-24 transition-opacity duration-300`}>
                {mutationErrorMessage && (
                    <div className="px-2">
                        <ErrorCard
                            error={mutationErrorMessage}
                        />
                    </div>
                )}
                <DynamicForm
                    title="Tambah Bank Soal"
                    // subtitle={'Sistem Akademik Digital'}
                    fields={questionFields}
                    onSubmit={handleFormSubmit}
                    disabled={isSubmitting}
                    reset={false}
                    footer={false}
                    button={
                        <div className="flex flex-col justify-stretch mt-4">
                            <button
                                type="submit"
                                className={`button-primary ${
                                    isSubmitting
                                        ? "opacity-50 cursor-not-allowed"
                                        : ""
                                }`}
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? (
                                    <LoadingCircle>Processing...</LoadingCircle>
                                ) : (
                                    "Tambah"
                                )}
                            </button>
                        </div>
                    }
                />
            </div>
        </div>
    );
};

export default NewQuestionView;
