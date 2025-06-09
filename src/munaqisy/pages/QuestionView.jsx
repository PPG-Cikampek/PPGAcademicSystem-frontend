import React, { useContext, useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import useHttp from '../../shared/hooks/http-hook';
import { MunaqasyahScoreContext } from '../context/MunaqasyahScoreContext';
import Modal from '../../shared/Components/UIElements/ModalBottomClose';
import LoadingCircle from '../../shared/Components/UIElements/LoadingCircle';
import getMunaqasyahQuestionTypeName from '../../munaqasyah/utilities/getMunaqasyahQuestionTypeName';

const QuestionView = () => {
    const [examQuestions, setExamQuestions] = useState()
    const [selectedScores, setSelectedScores] = useState({});
    const [totalScore, setTotalScore] = useState()
    const [modal, setModal] = useState({ title: '', message: '', onConfirm: null });
    const [modalIsOpen, setModalIsOpen] = useState(false);

    const { isLoading, error, sendRequest, setError, setIsLoading } = useHttp();

    const { state, dispatch, patchScoreData } = useContext(MunaqasyahScoreContext);

    const navigate = useNavigate();
    const location = useLocation();
    const data = location.state?.data;

    // console.log(data);

    useEffect(() => {
        // console.log(state.studentScore)

        const url = `${import.meta.env.VITE_BACKEND_URL}/munaqasyahs/examination/questions?semester=${data.semester}&classGrade=${data.classGrade}&category=${data.categoryData.key}`

        const fetchExamQuestions = async () => {
            try {
                const responseData = await sendRequest(url, 'GET', null, { 'Content-Type': 'application/json' });
                setExamQuestions(responseData)
                console.log(responseData)
            } catch (err) {
                console.log(err)
            }
        }
        fetchExamQuestions();
    }, [sendRequest, data]);

    const handleScoreSelect = (questionId, score) => {
        const newScores = {
            ...selectedScores,
            [questionId]: score
        };
        setSelectedScores(newScores);

        // Calculate total score only from valid scores
        const scoreSum = Object.values(newScores).reduce((sum, score) => sum + score, 0);
        setTotalScore(scoreSum);

        // Only update if we have a valid category key
        if (data.categoryData?.key) {
            const newScoreData = {
                [data.categoryData.key]: {
                    score: scoreSum,
                    examinerUserId: JSON.parse(localStorage.getItem('userData'))?.userId,
                    timestamp: new Date().toISOString()
                }
            };

            dispatch({ type: 'UPDATE_SCORE_DATA', payload: newScoreData });
        }
    };

    const handleFinish = async () => {
        if (!totalScore && totalScore !== 0) {
            setError('Please provide scores for all questions');
            setModal({
                title: 'Gagal!',
                message: 'Berikan nilai untuk semua pertanyaan!',
                onConfirm: null
            });
            setModalIsOpen(true);
            return;
        }

        try {
            // Add your API call here to save the final score
            console.log('Saving total score:', totalScore);
            console.log('Current state:', state.studentScore);
        } catch (err) {
            setError(err.message || 'Failed to save scores');
        }

        setModal({
            title: 'Konfirmasi!',
            message: 'Simpan Nilai?',
            onConfirm: () => {
                setIsLoading(true)
                patchScoreData(state.studentScore)
                setIsLoading(false)
                setModal({
                    title: 'Berhasil!',
                    message: 'Berhasil menyimpan nilai!',
                    onConfirm: null
                });
            },
        });

        setModalIsOpen(true);
    };

    const ModalFooter = () => (
        <div className="flex gap-2 items-center">
            <button
                onClick={() => {
                    setModalIsOpen(false);
                    !error && navigate(-1);
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
        <div className="min-h-screen bg-gray-50 ">
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

            <div className='flex flex-col pb-24 my-6'>
                <div className="card-basic flex-col justify-between mt-0 mx-4 pr-8 box-border">
                    <div className="text-lg uppercase font-semibold">{data.categoryData.label}</div>
                    <div className="text-base font-medium text-gray-500">Nilai: {totalScore || 0}/{examQuestions?.totalScore}</div>
                </div>

                <div className="mt-6 mx-4 space-y-4">
                    {examQuestions?.questions.map((question, index) => (
                        <div key={question.id} className="card-basic flex-col mt-0 gap-2 mx-0">
                            <div className="flex justify-between items-center">
                                <div className="text-lg font-semibold">Pertanyaan {index + 1}</div>
                                <div className="flex flex-col">
                                    <div className="text-blue-600 font-medium">Nilai Maksimal: {question.maxScore}</div>
                                    <div className="text-sm text-gray-500 whitespace-pre-line"> Tipe Soal: {getMunaqasyahQuestionTypeName(question.type)} </div>
                                </div>
                            </div>
                            <div className="mt-2">
                                <div className="font-semibold text-gray-700">Petunjuk:</div>
                                <div className="mt-1 text-gray-600 whitespace-pre-line">{question.instruction}</div>
                            </div>
                            <div className="mt-2">
                                <div className="font-semibold text-gray-700">Pertanyaan:</div>
                                <div className="mt-1 text-gray-600 whitespace-pre-line font-lpmq text-base">{question.question}</div>
                            </div>
                            {question.type !== 'multipleChoices' && question.answers[0] !== '' && (
                                <div className="mt-2">
                                    <div className="font-semibold text-gray-700">Jawaban yang Benar:</div>
                                    <div className='whitespace-pre-line font-lpmq text-base'>{question.answers[0]}</div>
                                </div>
                            )}
                            {question.type === 'multipleChoices' && question.answers[0] !== '' && (
                                <div className="mt-2">
                                    <div className="font-semibold text-gray-700">Jawaban yang Benar:</div>
                                    <ul className="mt-1 text-gray-600 list-disc pl-4">
                                        {question.answers.map((answer, idx) => (
                                            <li key={idx} className='whitespace-pre-line font-lpmq text-base'>{answer}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                            <div className="mt-4">
                                <div className="font-semibold text-gray-700 mb-2">Nilai:</div>
                                <div className="flex flex-wrap gap-3">
                                    {question.scoreOptions.map((score, idx) => (
                                        <motion.div
                                            key={idx}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => handleScoreSelect(question.id, score)}
                                            className={`
                                                w-10 h-10 rounded-md flex items-center justify-center cursor-pointer
                                                border-2 transition-colors duration-200
                                                ${selectedScores[question.id] === score
                                                    ? 'bg-blue-500 text-white border-blue-500'
                                                    : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400'}
                                            `}
                                        >
                                            <span className="font-medium">{score}</span>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="my-4 mx-6">
                    <button
                        onClick={handleFinish}
                        className="button-primary w-full"
                    >
                        Simpan Nilai
                    </button>
                </div>
            </div>
        </div>
    )
}

export default QuestionView