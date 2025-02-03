import React, { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import useHttp from '../../shared/hooks/http-hook';
import DynamicForm from '../../shared/Components/UIElements/DynamicForm';
import { AuthContext } from '../../shared/Components/Context/auth-context';

import ErrorCard from '../../shared/Components/UIElements/ErrorCard';
import LoadingCircle from '../../shared/Components/UIElements/LoadingCircle';
import Modal from '../../shared/Components/UIElements/ModalBottomClose'

import logo from '../../assets/logos/ppgcikampek.webp';
import { div } from 'framer-motion/client';



const NewLevelView = () => {
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [modalMessage, setModalMessage] = useState('');

    const [isBranch, setIsBranch] = useState(true);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const { isLoading, error, sendRequest, setError } = useHttp();
    const [loadedBranch, setLoadedBranch] = useState([]);
    const [teachingGroupFields, setTeachingGroupFields] = useState();


    const auth = useContext(AuthContext);
    const navigate = useNavigate()

    const branchFields = [
        { name: 'name', label: 'Nama Desa', placeholder: 'Nama Desa', type: 'text', required: true },
        { name: 'address', label: 'Alamat Desa', placeholder: 'Alamat Lengkap', type: 'text', required: true },
    ];

    useEffect(() => {
        const fetchBranch = async () => {
            try {
                const responseData = await sendRequest(`${import.meta.env.VITE_BACKEND_URL}/levels/branches/`);
                setLoadedBranch(responseData.branches);
            } catch (err) { }
        };
        fetchBranch();
    }, [sendRequest]);

    useEffect(() => {
        if (loadedBranch) {
            setTeachingGroupFields([
                { name: 'name', label: 'Nama Kelompok', placeholder: 'Nama Kelompok', type: 'text', required: true },
                { name: 'address', label: 'Alamat Kelompok', placeholder: 'Alamat Lengkap', type: 'text', required: true },
                {
                    name: 'branch',
                    label: 'Desa',
                    type: 'select',
                    required: true,
                    options: loadedBranch.map(({ name }) => ({ label: name, value: name }))
                },
            ]);
        }
    }, [loadedBranch]);



    const handleFormSubmit = async (data) => {
        const url = isBranch
            ? `${import.meta.env.VITE_BACKEND_URL}/levels/branches`
            : `${import.meta.env.VITE_BACKEND_URL}/levels/branches/teaching-groupes`

        const body = JSON.stringify(isBranch
            ? { name: data.name, address: data.address }
            : { name: data.name, address: data.address, branchName: data.branch }
        );

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

    const handleToggle = () => {
        setIsTransitioning(true);
        setTimeout(() => {
            setIsBranch((prev) => !prev)
            setIsTransitioning(false);
        }, 200);
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
                                navigate('/settings/levels/')
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
                {error && (
                    <div className='mx-2'>
                        <ErrorCard error={error} onClear={() => setError(null)} />
                    </div>
                )}
                <DynamicForm
                    title={isBranch ? 'Tambah Desa' : 'Tambah Kelompok'}
                    subtitle={'Sistem Akademik Digital'}
                    fields={isBranch ? branchFields : teachingGroupFields}
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
                            <button
                                type="button"
                                onClick={handleToggle}
                                className={`button-secondary ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                                disabled={isLoading}
                            >
                                {isLoading ? (<LoadingCircle>Processing...</LoadingCircle>) : isBranch ? 'Tambah Kelompok' : 'Tambah Desa'}
                            </button>
                        </div>
                    }
                />
            </div>
        </div >
    );
};

export default NewLevelView;
