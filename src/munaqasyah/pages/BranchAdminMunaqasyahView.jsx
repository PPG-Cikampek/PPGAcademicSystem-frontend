import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { AuthContext } from '../../shared/Components/Context/auth-context';
import useHttp from '../../shared/hooks/http-hook';

import LoadingCircle from '../../shared/Components/UIElements/LoadingCircle';
import Modal from '../../shared/Components/UIElements/ModalBottomClose';
import ErrorCard from '../../shared/Components/UIElements/ErrorCard';
import { academicYearFormatter } from '../../shared/Utilities/academicYearFormatter';
import MunaqasyahCard from '../components/MunaqasyahCard';
import SkeletonLoader from '../../shared/Components/UIElements/SkeletonLoader';

const BranchAdminMunaqasyahView = () => {
    const [modal, setModal] = useState({ title: '', message: '', onConfirm: null });
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [branchYears, setBranchYears] = useState();
    const { isLoading, error, sendRequest, setError } = useHttp();

    const auth = useContext(AuthContext)
    const navigate = useNavigate()

    useEffect(() => {
        const fetchBranchYears = async () => {
            try {
                const responseData = await sendRequest(`${import.meta.env.VITE_BACKEND_URL}/branchYears/branch/${auth.userBranchId}`);
                setBranchYears(responseData);
            } catch (err) {
                // Error is handled by useHttp  
            }
        };
        fetchBranchYears();
        // Expose fetchBranchYears for use elsewhere
        BranchAdminMunaqasyahView.fetchBranchYears = fetchBranchYears;
    }, [sendRequest]);


    const activateYearHandler = (branchYearId, branchYearName, branchYearSemesterTarget) => (e) => {
        e.stopPropagation()
        console.log(branchYearId)
        console.log(branchYearSemesterTarget)
        if (branchYearSemesterTarget > 0) {
            const confirmActivate = async () => {
                console.log('Updating ... ')
                const url = `${import.meta.env.VITE_BACKEND_URL}/branchYears/activate`

                const body = JSON.stringify({
                    branchYearId: branchYearId,
                    semesterTarget: 20,
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

                const updatedData = await sendRequest(`${import.meta.env.VITE_BACKEND_URL}/branchYears/branch/${auth.userBranchId}`);
                setBranchYears(updatedData);
            };
            setModal({
                title: `Konfirmasi`,
                message: `Aktifkan tahun ajaran ${academicYearFormatter(branchYearName)}?`,
                onConfirm: confirmActivate,
            });
            setModalIsOpen(true);
        } else {
            navigate(`/academic/${branchYearId}`)
        }
    }

    const deactivateYearHandler = (e, branchYearName, branchYearId) => {
        e.stopPropagation()
        const confirmDelete = async () => {
            const url = `${import.meta.env.VITE_BACKEND_URL}/branchYears/deactivate`;
            const body = JSON.stringify({
                branchYearId
            });
            let responseData;
            try {
                responseData = await sendRequest(url, 'PATCH', body, {
                    'Content-Type': 'application/json'
                });
                setModal({ title: 'Berhasil!', message: responseData.message, onConfirm: null });

                const updatedData = await sendRequest(`${import.meta.env.VITE_BACKEND_URL}/branchYears/branch/${auth.userBranchId}`);
                setBranchYears(updatedData);

            } catch (err) {
                setModal({ title: 'Gagal!', message: err.message, onConfirm: null });
            }

        };
        setModal({
            title: `Konfirmasi`,
            message: `Nonaktifkan tahun ajaran ${academicYearFormatter(branchYearName)}?`,
            onConfirm: confirmDelete,
        });
        setModalIsOpen(true);
    }


    const ModalFooter = () => (
        <div className="flex gap-2 items-center">
            <button
                onClick={() => setModalIsOpen(false)}
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
        <div className="min-h-screen bg-gray-50 px-4 py-8 md:p-8">
            <main className="max-w-6xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-semibold text-gray-900">Daftar Munaqosah Desa</h1>
                </div>
                <Modal
                    isOpen={modalIsOpen}
                    onClose={() => setModalIsOpen(false)}
                    title={modal.title}
                    footer={<ModalFooter />}
                >
                    {isLoading && (
                        <div className="flex flex-col gap-4 mt-8">
                            <SkeletonLoader variant="rectangular" height={32} width="100%" count={2} />
                        </div>
                    )}
                    {!isLoading && (
                        modal.message
                    )}
                </Modal>

                {(!branchYears || isLoading) && (
                    <div className="flex flex-col gap-4 mt-16">
                        <SkeletonLoader variant="rectangular" height={64} width="100%" count={3} />
                    </div>
                )}

                {error && <ErrorCard error={error} onClear={() => setError(null)} />}

                {branchYears && !isLoading && (
                    <>
                        {branchYears.branchYears.length === 0 && (
                            <div className="bg-white rounded-md shadow-md p-6 border border-gray-200">
                                <p className="text-gray-700 text-center">Belum ada tahun ajaran terdaftar.</p>
                            </div>
                        )}
                        {branchYears.branchYears.length > 0 && (
                            <div className="flex flex-col items-stretch gap-4">
                                {branchYears.branchYears.map((year) => (
                                    <MunaqasyahCard
                                        key={year._id}
                                        year={year}
                                        onClick={() => {
                                            navigate(`/munaqasyah/${year._id}`, {
                                                state: { year }
                                            });
                                        }}
                                        fetchData={BranchAdminMunaqasyahView.fetchBranchYears}
                                    />
                                ))}
                            </div>
                        )}
                    </>
                )}
            </main>
        </div >
    );
};

export default BranchAdminMunaqasyahView;