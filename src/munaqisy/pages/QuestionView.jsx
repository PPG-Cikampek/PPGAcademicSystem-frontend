import { useContext, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import useHttp from "../../shared/hooks/http-hook";
import { MunaqasyahScoreContext } from "../context/MunaqasyahScoreContext";
import NewModal from "../../shared/Components/Modal/NewModal";
import useModal from "../../shared/hooks/useNewModal";
import LoadingCircle from "../../shared/Components/UIElements/LoadingCircle";
import getMunaqasyahQuestionTypeName from "../../munaqasyah/utilities/getMunaqasyahQuestionTypeName";
import ErrorCard from "../../shared/Components/UIElements/ErrorCard";

const QuestionView = () => {
    const [examQuestions, setExamQuestions] = useState();
    const [selectedScores, setSelectedScores] = useState({});
    const [totalScore, setTotalScore] = useState();
    const { modalState, openModal, closeModal } = useModal();

    const { isLoading, error, sendRequest, setError, setIsLoading } = useHttp();

    const { state, dispatch, patchScoreData } = useContext(
        MunaqasyahScoreContext
    );

    const navigate = useNavigate();
    const location = useLocation();
    const data = location.state?.data;

    // console.log(data);

    useEffect(() => {
        const url = `${
            import.meta.env.VITE_BACKEND_URL
        }/munaqasyahs/examination/questions?semester=${
            data.semester
        }&classGrade=${data.classGrade}&category=${data.categoryData.key}`;

        const fetchExamQuestions = async () => {
            try {
                const responseData = await sendRequest(url, "GET", null, {
                    "Content-Type": "application/json",
                });
                setExamQuestions(responseData);
                console.log(responseData);
            } catch (err) {
                console.log(err);
            }
        };
        fetchExamQuestions();
    }, [sendRequest, data]);

    const handleScoreSelect = (questionId, score) => {
        const newScores = {
            ...selectedScores,
            [questionId]: score,
        };
        setSelectedScores(newScores);

        // Calculate total score only from valid scores
        const scoreSum = Object.values(newScores).reduce(
            (sum, score) => sum + score,
            0
        );
        setTotalScore(scoreSum);

        // Only update if we have a valid category key
        if (data.categoryData?.key) {
            const newScoreData = {
                [data.categoryData.key]: {
                    score: scoreSum,
                    examinerUserId: JSON.parse(localStorage.getItem("userData"))
                        ?.userId,
                    timestamp: new Date().toISOString(),
                },
            };

            dispatch({ type: "UPDATE_SCORE_DATA", payload: newScoreData });
        }
    };

    const handleFinish = async () => {
        if (!totalScore && totalScore !== 0) {
            dispatch({
                type: "SET_ERROR",
                payload: "Berikan nilai untuk semua pertanyaan!",
            });
            openModal(
                "Berikan nilai untuk semua pertanyaan!",
                "error",
                null,
                "Gagal!",
                false
            );
            return;
        }

        try {
            console.log("Saving total score:", totalScore);
            console.log("Current state:", state.studentScore);
        } catch (err) {
            setError(err.message || "Failed to save scores");
        }

        const confirmSave = async () => {
            setIsLoading(true);
            await patchScoreData(state.studentScore, dispatch);
            setIsLoading(false);
            if (!state.error) {
                openModal(
                    "Berhasil menyimpan nilai!",
                    "success",
                    () => {
                        navigate(-1);
                        return false;
                    },
                    "Berhasil!",
                    false
                );
            }
        return false;

        };

        openModal(
            "Simpan Nilai?",
            "confirmation",
            confirmSave,
            "Konfirmasi",
            true
        );
        return false;
    };

    return (
        <div className="bg-gray-50 min-h-screen">
            {!isLoading && state.error && <ErrorCard error={state.error} />}
            <NewModal
                modalState={modalState}
                onClose={closeModal}
                isLoading={isLoading}
            />

            <div className="flex flex-col my-6 pb-24">
                <div className="box-border flex-col justify-between mx-4 mt-0 pr-8 card-basic">
                    <div className="font-semibold text-lg uppercase">
                        {data.categoryData.label}
                    </div>
                    <div className="font-medium text-gray-500 text-base">
                        Nilai: {totalScore || 0}/{examQuestions?.totalScore}
                    </div>
                </div>

                <div className="space-y-4 mx-4 mt-6">
                    {examQuestions?.questions.map((question, index) => (
                        <div
                            key={question.id}
                            className="flex-col gap-2 mx-0 mt-0 card-basic"
                        >
                            <div className="flex justify-between items-center">
                                <div className="font-semibold text-lg">
                                    Pertanyaan {index + 1}
                                </div>
                                <div className="flex flex-col">
                                    <div className="font-medium text-blue-600">
                                        Nilai Maksimal: {question.maxScore}
                                    </div>
                                    <div className="text-gray-500 text-sm whitespace-pre-line">
                                        {" "}
                                        Tipe Soal:{" "}
                                        {getMunaqasyahQuestionTypeName(
                                            question.type
                                        )}{" "}
                                    </div>
                                </div>
                            </div>
                            <div className="mt-2">
                                <div className="font-semibold text-gray-700">
                                    Petunjuk:
                                </div>
                                <div className="mt-1 text-gray-600 whitespace-pre-line">
                                    {question.instruction}
                                </div>
                            </div>
                            <div className="mt-2">
                                <div className="font-semibold text-gray-700">
                                    Pertanyaan:
                                </div>
                                <div className="mt-1 font-lpmq text-gray-600 text-base whitespace-pre-line">
                                    {question.question}
                                </div>
                            </div>

                            <div className="mt-2">
                                <div className="font-semibold text-gray-700">
                                    Jawaban yang Benar:
                                </div>
                                <div className="font-lpmq text-base whitespace-pre-line">
                                    {question.answers}
                                </div>
                            </div>

                            {/* {question.type !== 'multipleChoices' && question.answers[0] !== '' && (
                                <div className="mt-2">
                                    <div className="font-semibold text-gray-700">Jawaban yang Benar:</div>
                                    <div className='font-lpmq text-base whitespace-pre-line'>{question.answers[0]}</div>
                                </div>
                            )}
                            {question.type === 'multipleChoices' && question.answers[0] !== '' && (
                                <div className="mt-2">
                                    <div className="font-semibold text-gray-700">Jawaban yang Benar:</div>
                                    <ul className="mt-1 pl-4 text-gray-600 list-disc">
                                        {question.answers.map((answer, idx) => (
                                            <li key={idx} className='font-lpmq text-base whitespace-pre-line'>{answer}</li>
                                        ))}
                                    </ul>
                                </div>
                            )} */}
                            <div className="mt-4">
                                <div className="mb-2 font-semibold text-gray-700">
                                    Nilai:
                                </div>
                                <div className="flex flex-wrap gap-3">
                                    {question.scoreOptions.map((score, idx) => (
                                        <motion.div
                                            key={idx}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() =>
                                                handleScoreSelect(
                                                    question.id,
                                                    score
                                                )
                                            }
                                            className={`
                                                w-10 h-10 rounded-md flex items-center justify-center cursor-pointer
                                                border-2 transition-colors duration-200
                                                ${
                                                    selectedScores[
                                                        question.id
                                                    ] === score
                                                        ? "bg-blue-500 text-white border-blue-500"
                                                        : "bg-white text-gray-700 border-gray-300 hover:border-blue-400"
                                                }
                                            `}
                                        >
                                            <span className="font-medium">
                                                {score}
                                            </span>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mx-6 my-4">
                    <button
                        onClick={handleFinish}
                        className="w-full button-primary"
                    >
                        Simpan Nilai
                    </button>
                </div>
            </div>
        </div>
    );
};

export default QuestionView;
