import React, { useContext, useEffect, useState } from 'react'
import { Link } from 'react-router-dom';

import useHttp from '../../shared/hooks/http-hook';
import { AuthContext } from '../../shared/Components/Context/auth-context';
import SkeletonLoader from '../../shared/Components/UIElements/SkeletonLoader';
import Modal from '../../shared/Components/UIElements/ModalBottomClose';

import { CircleAlert } from 'lucide-react';
import ErrorCard from '../../shared/Components/UIElements/ErrorCard';
import LoadingCircle from '../../shared/Components/UIElements/LoadingCircle';

const SubBranchMunaqasyahView = () => {
    const [subBranchYears, setSubBranchYears] = useState()
    const [modal, setModal] = useState({ title: '', message: '', onConfirm: null });
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const { isLoading, error, sendRequest, setError } = useHttp()

    const auth = useContext(AuthContext)

    useEffect(() => {
        const fetchSubBranchYears = async () => {
            try {
                const responseData = await sendRequest(`${import.meta.env.VITE_BACKEND_URL}/subBranchYears/subBranch/${auth.userSubBranchId}`);
                setSubBranchYears(responseData.subBranchYears);
                console.log(responseData)
                // console.log(responseData.subBranchYears)
                // console.log(responseData.subBranchYears[0].academicYearId.isMunaqasyahActive)
            } catch (err) {
                // Error is handled by useHttp  
            }
        };
        fetchSubBranchYears();
    }, [sendRequest]);

    const startMunaqasyahHandler = (subBranchYearName, subBranchYearId) => {
        const confirmStart = async () => {
            const body = JSON.stringify({ isMunaqasyahActive: true });
            try {
                const responseData = await sendRequest(
                    `${import.meta.env.VITE_BACKEND_URL}/munaqasyahs/start/${subBranchYearId}`,
                    'PATCH',
                    body,
                    { 'Content-Type': 'application/json' }
                );
                setSubBranchYears((prevYears) =>
                    prevYears.map((year) =>
                        year._id === subBranchYearId
                            ? { ...year, isMunaqasyahActive: true }
                            : year
                    )
                );
                setModal({
                    title: 'Berhasil!',
                    message: responseData.message,
                    onConfirm: null
                });
            } catch (err) {
                setModalIsOpen(false);
            }
        };

        setModal({
            title: `Konfirmasi`,
            message: `Mulai munaqosah untuk tahun ajaran ${subBranchYearName}?`,
            onConfirm: confirmStart
        });
        setModalIsOpen(true);
    };

    const ModalFooter = () => (
        <div className="flex gap-2 items-center">
            <button
                onClick={() => {
                    setModalIsOpen(false)
                    // !error && navigate(-1);
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
        <div className="min-h-screen bg-gray-50 px-4 py-8 md:p-8">
            <div className="max-w-6xl mx-auto">
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

                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-semibold text-gray-900">Munaqosah</h1>
                </div>

                {(!subBranchYears || isLoading) && (
                    <div className="space-y-4">
                        <SkeletonLoader variant="rectangular" width="100%" height={140} count={3} />
                    </div>
                )}

                {error && <ErrorCard error={error} />}

                {subBranchYears && !isLoading && (
                    subBranchYears.map(year => {
                        const content = (
                            <div className={`card-basic hover:bg-gray-100 active:bg-gray-100 hover:cursor-pointer rounded-md justify-start m-0 transition-all duration-200 my-4`} >
                                <div className="flex items-center space-x-4 ">
                                    <div className="flex-1 h-fit"  >
                                        <div className='flex items-center gap-2'>
                                            <h2 className="text-xl text-gray-900">{year.name}</h2>
                                        </div>
                                        <div className="flex items-center text-gray-500 mt-1">
                                            Jumlah Kelas: {year.classes.length}
                                        </div>
                                        <div className="flex items-center mt-4 md:mt-5 md:mb-1">
                                            Status Munaqosah:
                                        </div>
                                        <div className='text-gray-500'>
                                            {year.academicYearId.isMunaqasyahActive ? (
                                                year.isMunaqasyahActive ? (
                                                    <div className='text-green-500'>
                                                        Munaqosah sedang berjalan
                                                    </div>
                                                ) : (
                                                    <div className='inline-flex items-center text-blue-500 gap-1'>
                                                        <CircleAlert />
                                                        Daerah telah memulai munaqosah
                                                    </div>
                                                )
                                            ) : year.academicYearId.isActive === false ?
                                                (
                                                    <div className='text-gray-500 italic'>
                                                        Semester Lewat
                                                    </div>
                                                )
                                                : (
                                                    <div className='text-gray-500 italic'>
                                                        Menunggu daerah memulai munaqosah
                                                    </div>
                                                )}
                                        </div>

                                        <div>
                                            {year.academicYearId.isMunaqasyahActive === true && year.isMunaqasyahActive !== true && year.isActive === true && (
                                                <button
                                                    className='btn-primary-outline mt-2'
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        e.stopPropagation();
                                                        startMunaqasyahHandler(year.name, year._id);
                                                    }}>
                                                    Mulai Munaqosah
                                                </button>
                                            )}
                                            {year.academicYearId.isMunaqasyahActive === true && year.isMunaqasyahActive !== true && year.isActive !== true && (
                                                <div className='inline-flex items-center text-red-500 gap-1'>
                                                    <CircleAlert />
                                                    Tahun ajaran kelompok belum aktif!
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );

                        return year.isMunaqasyahActive ? (
                            <Link key={year._id} to={`/munaqasyah/${year._id}`}>
                                {content}
                            </Link>
                        ) : (
                            <div key={year._id}>
                                {content}
                            </div>
                        );
                    })
                )}

                {subBranchYears && subBranchYears.length === 0 && (
                    <div className="bg-white rounded-md shadow-md p-6 border border-gray-200">
                        <p className="text-gray-700 text-center">Belum ada tahun ajaran terdaftar.</p>
                    </div>
                )}
            </div>
        </div>
    )
}

export default SubBranchMunaqasyahView