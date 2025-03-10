import React, { useContext, useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { AuthContext } from '../../shared/Components/Context/auth-context';
import useHttp from '../../shared/hooks/http-hook';
import DynamicForm from '../../shared/Components/UIElements/DynamicForm';

import ErrorCard from '../../shared/Components/UIElements/ErrorCard';
import LoadingCircle from '../../shared/Components/UIElements/LoadingCircle';

import Modal from "../../shared/Components/UIElements/ModalBottomClose";

const UpdateQuestionView = () => {
    const [modal, setModal] = useState({ title: '', message: '', onConfirm: null });
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const { isLoading, error, sendRequest, setError } = useHttp();
    const [loadedQuestion, setLoadedQuestion] = useState();

    const auth = useContext(AuthContext);

    const questionId = useParams().questionId;
    const navigate = useNavigate();

    useEffect(() => {
        const fetchQuestion = async () => {
            const url = `${import.meta.env.VITE_BACKEND_URL}/munaqasyah/questions/${questionId}`

            try {
                const responseData = await sendRequest(url);
                setLoadedQuestion(responseData.question);
            } catch (err) { }
        };
        fetchQuestion();
    }, [sendRequest]);

    const questionCategory = [
        { label: "Membaca Al-Qur'an/Tilawati", value: 'reciting' },
        { label: "Menulis Arab", value: 'writing' },
        { label: "Tafsir Al-Qur'an", value: 'quranTafsir' },
        { label: "Tafsir Hadits", value: 'hadithTafsir' },
        { label: "Praktek Ibadah", value: 'practice' },
        { label: "Akhlak dan Tata Krama", value: 'moralManner' },
        { label: "Hafalan", value: 'memorizing' },
        { label: "Keilmuan dan Kefahaman Agama", value: 'knowledge' },
        { label: "Kemandirian", value: 'independence' },
    ]

    const questionFields = [
        {
            name: 'type',
            label: 'Tipe Soal',
            type: 'select',
            required: false,
            options:
                [
                    { label: 'Pilihan Ganda', value: 'multipleChoices' },
                    { label: 'Jawab Cermat', value: 'shortAnswer' },
                    { label: 'Praktik', value: 'practice' },
                ],
            value: loadedQuestion?.type || ''
        },
        {
            name: 'category',
            label: 'Kategori Materi',
            type: 'select',
            required: false,
            options: questionCategory.map(({ label, value }) => ({ label, value })),
            value: loadedQuestion?.category || ''
        },
        {
            name: 'semester',
            label: 'Semester',
            type: 'radio',
            required: false,
            options:
                [
                    { label: 'Ganjil', value: '1' },
                    { label: 'Genap', value: '2' },
                ],
            value: loadedQuestion?.semester || ''
        },
        { name: 'question', label: 'Pertanyaan', placeholder: '', type: 'textarea', textAreaRows: 4, required: false, value: loadedQuestion?.question || '' },
        { name: 'answers', label: 'Jawaban (tambah utk pilihan ganda)', placeholder: '', type: 'multi-input', inputType: 'text', required: false, value: loadedQuestion?.answers || '' },
        { name: 'maxScore', label: 'Skor Maksimal', type: 'number', required: false, value: loadedQuestion?.maxScore || '' },
        { name: 'scoreOptions', label: 'Opsi Skor', type: 'multi-input', required: false, inputType: 'number', value: loadedQuestion?.scoreOptions || '' },
        { name: 'instruction', label: 'Petunjuk Penilaian', placeholder: '', type: 'textarea', textAreaRows: 5, required: false, value: loadedQuestion?.instruction || '' },
    ]


    const handleFormSubmit = async (data) => {
        const url = `${import.meta.env.VITE_BACKEND_URL}/munaqasyah/questions/${questionId}`;

        const body = JSON.stringify({
            type: data.type,
            category: data.category,
            semester: data.semester,
            maxScore: data.maxScore,
            scoreOptions: data.scoreOptions,
            instruction: data.instruction,
            question: data.question,
            answers: data.answers
        });

        let responseData;
        try {
            responseData = await sendRequest(url, 'PATCH', body, {
                'Content-Type': 'application/json',
                Authorization: 'Bearer ' + auth.token
            });
            console.log(responseData);
        } catch (err) { }
        setModal({ title: 'Berhasil!', message: responseData.message, onConfirm: null });
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
        <div className="m-auto max-w-md mt-14 md:mt-8">
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

            <div className={`pb-24 transition-opacity duration-300`}>
                <DynamicForm
                    subtitle={'Update Soal Munaqosah'}
                    fields={questionFields}
                    onSubmit={handleFormSubmit}
                    disabled={isLoading}
                    reset={false}
                    footer={false}
                    button={
                        <div className="flex flex-col justify-stretch mt-4">
                            <button
                                type="submit"
                                className={`button-primary ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                                disabled={isLoading}
                            >
                                {isLoading ? (<LoadingCircle>Processing...</LoadingCircle>) : ('Update')}
                            </button>
                            {error && <ErrorCard error={error} onClear={() => setError(null)} />}
                        </div>
                    }
                />
            </div>
        </div>
    );
};

export default UpdateQuestionView;