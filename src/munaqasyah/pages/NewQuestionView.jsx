import React, { useContext, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import useHttp from '../../shared/hooks/http-hook';
import DynamicForm from '../../shared/Components/UIElements/DynamicForm';

import ErrorCard from '../../shared/Components/UIElements/ErrorCard';
import LoadingCircle from '../../shared/Components/UIElements/LoadingCircle';
import Modal from '../../shared/Components/UIElements/ModalBottomClose'
import { AuthContext } from '../../shared/Components/Context/auth-context';


const NewQuestionView = () => {
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState(false);

  const { isLoading, error, sendRequest, setError } = useHttp();

  const navigate = useNavigate()
  const classGrade = useParams().classGrade;
  const auth = useContext(AuthContext)

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
      required: true,
      options:
        [
          { label: 'Pilihan Ganda', value: 'multipleChoices' },
          { label: 'Jawab Cermat', value: 'shortAnswer' },
          { label: 'Praktik', value: 'practice' },
        ]
    },
    {
      name: 'category',
      label: 'Kategori Materi',
      type: 'select',
      required: true,
      options: questionCategory.map(({ label, value }) => ({ label, value }))
    },
    {
      name: 'semester',
      label: 'Semester',
      type: 'radio',
      required: true,
      options:
      [
        { label: 'Ganjil', value: '1' },
        { label: 'Genap', value: '2' },
      ]
    },
    { name: 'question', label: 'Pertanyaan', placeholder: '', type: 'textarea', textAreaRows: 4, required: false },
    { name: 'answers', label: 'Jawaban (tambah utk pilihan ganda)', placeholder: '', type: 'multi-input', inputType: 'textarea', textAreaRows: 2, required: false },
    { name: 'maxScore', label: 'Skor Maksimal', type: 'number', required: true },
    { name: 'scoreOptions', label: 'Opsi Skor', type: 'multi-input', required: false, inputType: 'number', },
    { name: 'instruction', label: 'Petunjuk Penilaian', placeholder: '', type: 'textarea', textAreaRows: 5, required: false },
  ]


  const handleFormSubmit = async (data) => {
    const url = `${import.meta.env.VITE_BACKEND_URL}/munaqasyah/questions/`;

    const body = JSON.stringify({
      classGrade: classGrade,
      type: data.type,
      category: data.category,
      semester: data.semester,
      maxScore: data.maxScore,
      scoreOptions: data.scoreOptions,
      instruction: data.instruction,
      question: data.question,
      answers: data.answers
    });

    console.log(body)

    let responseData;
    try {
      responseData = await sendRequest(url, 'POST', body, {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + auth.token
      });
      setModalMessage(responseData.message)
      setModalIsOpen(true)
    } catch (err) {
      // Error is already handled by useHttp
    }
  };

  return (
    <div className="m-auto max-w-md mt-14 md:mt-8">
      <Modal
        isOpen={modalIsOpen}
        onClose={() => setModalIsOpen(false)}
        title='Berhasil!'
        footer={
          <>
            <button
              onClick={() => {
                setModalIsOpen(false)
                navigate(-1)
              }}
              className='btn-danger-outline'
            >
              Tutup
            </button>
          </>
        }
      >
        {modalMessage}
      </Modal>


      <div className={`pb-24 transition-opacity duration-300`}>
        {error &&
          <div className="px-2">
            <ErrorCard error={error} onClear={() => setError(null)} />
          </div>
        }
        <DynamicForm
          title='Tambah Bank Soal'
          // subtitle={'Sistem Akademik Digital'}
          fields={questionFields}
          onSubmit={handleFormSubmit || null}
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
                {isLoading ? (<LoadingCircle>Processing...</LoadingCircle>) : ('Tambah')}
              </button>
            </div>
          }
        />
      </div>
    </div >
  );
};

export default NewQuestionView;
