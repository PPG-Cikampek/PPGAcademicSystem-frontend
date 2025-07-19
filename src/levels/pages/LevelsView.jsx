import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import useHttp from '../../shared/hooks/http-hook';

import Modal from '../../shared/Components/UIElements/ModalBottomClose'
import LoadingCircle from '../../shared/Components/UIElements/LoadingCircle';


import { ChevronDown, ChevronRight, MapPin, Building, PlusIcon, Pencil, Trash } from 'lucide-react';
import FloatingMenu from '../../shared/Components/UIElements/FloatingMenu';
import ErrorCard from '../../shared/Components/UIElements/ErrorCard';
import SkeletonLoader from '../../shared/Components/UIElements/SkeletonLoader';

const LevelsView = () => {
    const [modal, setModal] = useState({ title: '', message: '', onConfirm: null });
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [data, setData] = useState();
    const [expandedBranches, setExpandedBranches] = useState({});
    const { isLoading, error, sendRequest, setError } = useHttp();

    const navigate = useNavigate()

    useEffect(() => {
        const loadLevels = async () => {
            try {
                console.log('Fetching Levels...')
                const responseData = await sendRequest(`${import.meta.env.VITE_BACKEND_URL}/levels/branches/?populate=true`);
                setData(responseData);
                console.log(responseData)
                console.log('Fetching Levels completed')

            } catch (err) {
                // Error is already handled by useHttp
            }
        };
        loadLevels();
    }, [sendRequest, modal]);

    const toggleBranch = (branchId) => {
        setExpandedBranches(prev => ({
            ...prev,
            [branchId]: !prev[branchId]
        }));
    };


    const deleteBranchHandler = (branchName, branchId) => {
        console.log(branchId)
        const confirmDelete = async () => {
            setModalIsOpen(false)

            const url = `${import.meta.env.VITE_BACKEND_URL}/levels/branches/`;

            console.log(url)

            const body = JSON.stringify({
                branchId
            });

            let responseData;
            try {
                responseData = await sendRequest(url, 'DELETE', body, {
                    'Content-Type': 'application/json'
                });

                setModalIsOpen(true)
                setModal({ title: 'Berhasil!', message: responseData.message, onConfirm: null });

                const updatedData = await sendRequest(`${import.meta.env.VITE_BACKEND_URL}/levels/branches/?populate=true`);
                setData(updatedData);

            } catch (err) {
                // Error is already handled by useHttp
            }

        };
        setModal({
            title: `Konfirmasi Penghapusan`,
            message: `Hapus Desa: ${branchName}?`,
            onConfirm: confirmDelete,
        });
        setModalIsOpen(true);
    }

    const deleteSubBranchHandler = (e, subBranchName, subBranchId) => {
        e.stopPropagation()
        console.log(subBranchId)
        const confirmDelete = async () => {
            setModalIsOpen(false)
            const url = `${import.meta.env.VITE_BACKEND_URL}/levels/branches/sub-branches`;

            console.log(url)

            const body = JSON.stringify({
                subBranchId
            });

            let responseData;
            try {
                responseData = await sendRequest(url, 'DELETE', body, {
                    'Content-Type': 'application/json'
                });
                setModalIsOpen(true)
                setModal({ title: 'Berhasil!', message: responseData.message, onConfirm: null });

                const updatedData = await sendRequest(`${import.meta.env.VITE_BACKEND_URL}/levels/branches/?populate=true`);
                setData(updatedData);

            } catch (err) { }
        };
        setModal({
            title: `Konfirmasi Penghapusan`,
            message: `Hapus Desa: ${subBranchName}?`,
            onConfirm: confirmDelete,
        });
        setModalIsOpen(true);
    }

    const ModalFooter = () => (
        <div className="flex gap-2 items-center">
            <button
                onClick={() => {
                    setModalIsOpen(false)
                }}
                className={`${modal.onConfirm ? 'btn-danger-outline' : 'button-primary mt-0 '} ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                disabled={isLoading}
            >
                {isLoading ? <LoadingCircle /> : modal.onConfirm ? 'Batal' : 'Tutup'}
            </button>
            {modal.onConfirm && (
                <button onClick={modal.onConfirm} className={`button-primary mt-0 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                    {isLoading ? <LoadingCircle /> : 'Ya'}
                </button>
            )}
        </div>
    );


    return (
        <div className="min-h-screen bg-gray-50 px-4 py-8 md:p-8">
            <div className="max-w-6xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-2xl font-bold text-gray-900">Manajemen Desa dan Kelompok</h1>
                    <Link to={`/settings/levels/new`}>
                        <button
                            className="button-primary pl-[10px]"
                        >
                            <PlusIcon className="w-4 h-4 mr-2" />
                            Tambah
                        </button>
                    </Link>
                </div>

                {error && <ErrorCard error={error} onClear={() => setError(null)} />}


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

                {!data && isLoading && (
                    <div className="flex flex-col gap-4 mt-16 px-4">
                        <SkeletonLoader 
                            variant="rectangular"
                            height="60px"
                            className="rounded-lg"
                            count={4}
                        />
                    </div>
                )}

                {data && !isLoading && (
                    <div className="bg-white rounded-lg shadow-sm divide-y">
                        {data.branches.map(branch => (
                            <div key={branch._id} className="p-4 hover:bg-gray-100 hover:cursor-pointer transition-all duration-200" >
                                <div
                                    onClick={() => toggleBranch(branch._id)}
                                    className="flex items-center space-x-4 "
                                >
                                    {/* <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                                        <Building className="w-4 h-4 text-indigo-600" />
                                    </div> */}
                                    <div className="flex-1 h-fit"  >
                                        <div className='flex items-center gap-2'>
                                            <h2 className="text-sm font-semibold text-gray-900">Desa {branch.name}</h2>
                                            <div className="text-xs text-gray-500 border border-gray-500 rounded-sm p-1">
                                                {branch.subBranches.length} Kelompok
                                            </div>
                                        </div>
                                        <div className="flex items-center text-xs text-gray-500 mt-1">
                                            {/* <MapPin className="w-4 h-4 mr-1" /> */}
                                            {branch.address}
                                        </div>

                                    </div>
                                    <FloatingMenu
                                        onClick={(e) => e.stopPropagation()}
                                        buttons={[
                                            {
                                                icon: Pencil,
                                                label: 'Edit',
                                                onClick: () => navigate(`/settings/levels/${branch._id}`),
                                            },
                                            {
                                                icon: Trash,
                                                label: 'Delete',
                                                variant: 'danger',
                                                onClick: () => deleteBranchHandler(branch.name, branch._id),
                                            },
                                        ]}
                                    />
                                </div>

                                {expandedBranches[branch._id] && (
                                    <div className="mt-3 ml-12 space-y-2">
                                        {branch.subBranches.map(sub => (
                                            <div key={sub._id} className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-sm text-sm">
                                                <div>
                                                    <div className="font-medium text-gray-900">Kelompok {sub.name}</div>
                                                    <div className="flex items-center text-xs text-gray-500 mt-1">
                                                        {/* <MapPin className="w-4 h-4 mr-1" /> */}
                                                        {sub.address}
                                                    </div>
                                                </div>
                                                <div className="flex">
                                                    <button onClick={() => navigate(`/settings/levels/teaching-group/${sub._id}`)} className='px-2 italic text-gray-500 hover:underline hover:text-blue-500 hover:cursor-pointer'>Edit</button>
                                                    <button onClick={(e) => deleteSubBranchHandler(e, sub.name, sub._id)} className='px-2 italic text-gray-500 hover:underline hover:text-red-500 hover:cursor-pointer'>Hapus</button>
                                                </div>

                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div >
    )
}

export default LevelsView;