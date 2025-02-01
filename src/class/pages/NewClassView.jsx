import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

import useHttp from '../../shared/hooks/http-hook';
import DynamicForm from '../../shared/Components/UIElements/DynamicForm';

import ErrorCard from '../../shared/Components/UIElements/ErrorCard';
import LoadingCircle from '../../shared/Components/UIElements/LoadingCircle';
import Modal from '../../shared/Components/UIElements/ModalBottomClose'

import BackButton from '../../shared/Components/UIElements/BackButton';



const NewClassView = () => {
  const [modal, setModal] = useState({ title: '', message: '', onConfirm: null });
  const [modalIsOpen, setModalIsOpen] = useState(false);

  const [isTransitioning, setIsTransitioning] = useState(false);
  const { isLoading, error, sendRequest, setError } = useHttp();

  // const auth = useContext(AuthContext);
  const navigate = useNavigate()
  const location = useLocation()
  const { state } = location;

  const classFields = [
    {
      name: 'name',
      label: 'Nama Kelas',
      type: 'select',
      required: true,
      options: [
        { label: 'Kelas PRA-PAUD', value: 'Kelas PRA-PAUD' },
        { label: 'Kelas PAUD', value: 'Kelas PAUD' },
        { label: 'Kelas 1', value: 'Kelas 1' },
        { label: 'Kelas 2', value: 'Kelas 2' },
        { label: 'Kelas 3', value: 'Kelas 3' },
        { label: 'Kelas 4', value: 'Kelas 4' },
        { label: 'Kelas 5', value: 'Kelas 5' },
        { label: 'Kelas 6', value: 'Kelas 6' },
      ]
    },
    { name: 'startTime', label: 'Waktu Mulai', type: 'time', required: true },
  ]


  const handleFormSubmit = async (data) => {
    const url = `${import.meta.env.VITE_BACKEND_URL}/classes/`

    const body = JSON.stringify({
      name: data.name,
      startTime: data.startTime,
      teachingGroupYearId: state
    });

    let responseData;
    try {
      responseData = await sendRequest(url, 'POST', body, {
        'Content-Type': 'application/json'
      });
    } catch (err) {
      setModal({ title: 'Gagal!', message: err.message, onConfirm: null });
      setModalIsOpen(true)
    }
    setModal({ title: 'Berhasil!', message: responseData.message, onConfirm: null });
    setModalIsOpen(true)
  };

  const ModalFooter = () => (
    <div className="flex gap-2 items-center">
      <button
        onClick={() => {
          setModalIsOpen(false)
          navigate(-1)
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

      {error && <ErrorCard error={error} onClear={() => setError(null)} />}

      <div className={`pb-24 transition-opacity duration-300 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
        <DynamicForm
          title='Tambah Kelas'
          subtitle={'Sistem Absensi Digital'}
          fields={classFields}
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
                {isLoading ? (<LoadingCircle>Processing...</LoadingCircle>) : ('Tambah')}
              </button>
            </div>
          }
        />
      </div>
    </div >
  );
};

export default NewClassView;
