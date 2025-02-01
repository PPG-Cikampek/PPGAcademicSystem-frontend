import React, { useContext, useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import useHttp from '../../shared/hooks/http-hook';
import DynamicForm from '../../shared/Components/UIElements/DynamicForm';

import ErrorCard from '../../shared/Components/UIElements/ErrorCard';
import LoadingCircle from '../../shared/Components/UIElements/LoadingCircle';
import Modal from '../../shared/Components/UIElements/ModalBottomClose';


const UpdateAcademicYearView = () => {
    const [modal, setModal] = useState({ title: '', message: '', onConfirm: null });
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const { isLoading, error, sendRequest, setError } = useHttp();
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [loadedAcademicYear, setLoadedAcademicYear] = useState();

    const academicYearId = useParams().academicYearId
    const navigate = useNavigate();

    useEffect(() => {
        const fetchAcademicYear = async () => {
            try {
                const responseData = await sendRequest(`${import.meta.env.VITE_BACKEND_URL}/academicYears/${academicYearId}`)
                setLoadedAcademicYear(responseData.academicYear)
            } catch (err) { }
        }
        fetchAcademicYear();
    }, [sendRequest])

    const handleFormSubmit = async (data) => {
        console.log('Updating ... ')
        const url = `${import.meta.env.VITE_BACKEND_URL}/academicYears/${academicYearId}`

        const body = JSON.stringify({
            name: data.name,
        });

        console.log(body)

        let responseData
        try {
            responseData = await sendRequest(url, 'PATCH', body, {
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
                    !error && navigate(-1)
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

            <div className={`pb-24 transition-opacity duration-300 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
                {error &&
                    <div className="px-2">
                        <ErrorCard error={error} onClear={() => setError(null)} />
                    </div>
                }

                <DynamicForm
                    title={`Aktifkan Tahun Ajaran`}
                    subtitle={`Sistem Absensi Digital`}
                    fields={[
                        { name: 'name', label: 'Nama Tahun Ajaran', type: 'text', required: false, value: loadedAcademicYear?.name || '' },
                    ]}
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
                        </div>
                    }
                />
            </div>
        </div>
    );
};

export default UpdateAcademicYearView;
