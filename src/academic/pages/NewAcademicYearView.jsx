import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import useHttp from '../../shared/hooks/http-hook';
import DynamicForm from '../../shared/Components/UIElements/DynamicForm';

import ErrorCard from '../../shared/Components/UIElements/ErrorCard';
import LoadingCircle from '../../shared/Components/UIElements/LoadingCircle';
import Modal from '../../shared/Components/UIElements/ModalBottomClose'




const NewAcademicYearView = () => {
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [modalMessage, setModalMessage] = useState(false);

    const [isTransitioning, setIsTransitioning] = useState(false);
    const { isLoading, error, sendRequest, setError } = useHttp();
    const [signUpFields, setSignUpFields] = useState()

    // const auth = useContext(AuthContext);
    const navigate = useNavigate()

    const academicYearFields = [
        { name: 'name', label: 'Tahun Ajaran', placeholder: '20241', type: 'text', required: true },
    ]

    const handleFormSubmit = async (data) => {
        const url = `${import.meta.env.VITE_BACKEND_URL}/academicYears`

        const body = JSON.stringify({
            name: data.name,
        });

        // console.log(body)
        let responseData;
        try {
            responseData = await sendRequest(url, 'POST', body, {
                'Content-Type': 'application/json'
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
                                navigate('/academic/')
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


            <div className={`pb-24 transition-opacity duration-300 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
                {error &&
                    <div className="px-2">
                        <ErrorCard error={error} onClear={() => setError(null)} />
                    </div>
                }
                <DynamicForm
                    title='Tambah Tahun Ajaran'
                    subtitle={'Sistem Akademik Digital'}
                    fields={academicYearFields}
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

export default NewAcademicYearView;
