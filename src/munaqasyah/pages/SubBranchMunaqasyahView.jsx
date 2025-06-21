import React, { useContext, useEffect, useState } from 'react'
import { Link } from 'react-router-dom';

import useHttp from '../../shared/hooks/http-hook';
import { AuthContext } from '../../shared/Components/Context/auth-context';
import SkeletonLoader from '../../shared/Components/UIElements/SkeletonLoader';
import Modal from '../../shared/Components/UIElements/ModalBottomClose';

import { CircleAlert } from 'lucide-react';
import ErrorCard from '../../shared/Components/UIElements/ErrorCard';
import LoadingCircle from '../../shared/Components/UIElements/LoadingCircle';
import { academicYearFormatter } from '../../shared/Utilities/academicYearFormatter';

const SubBranchMunaqasyahView = () => {
    const [subBranchYears, setSubBranchYears] = useState()
    const [modal, setModal] = useState({ title: '', message: '', onConfirm: null });
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const { isLoading, error, sendRequest, setError } = useHttp()

    const auth = useContext(AuthContext)

    useEffect(() => {
        const fetchSubBranchYears = async () => {
            try {
                const responseData = await sendRequest(`${import.meta.env.VITE_BACKEND_URL}/branchYears/branch/${auth.userBranchId}/sub-branch/${auth.userSubBranchId}`);
                setSubBranchYears(responseData.subBranchYears);
                console.log(responseData.subBranchYears)
            } catch (err) { }
        };
        fetchSubBranchYears();

        SubBranchMunaqasyahView.fetchSubBranchYears = fetchSubBranchYears; // Expose for use elsewhere
    }, [sendRequest]);

    const munaqasyahStatusHandler = (actionType, subBranchYearName, subBranchId) => {
        const confirmStart = async (action) => {
            const body = JSON.stringify({
                subBranchId,
                munaqasyahStatus: action
            });
            try {
                const responseData = await sendRequest(
                    `${import.meta.env.VITE_BACKEND_URL}/branchYears/munaqasyah/${auth.currentBranchYearId}/sub-branch/`,
                    'PATCH',
                    body,
                    { 'Content-Type': 'application/json' }
                );
                setModal({
                    title: 'Berhasil!',
                    message: responseData.message,
                    onConfirm: null
                });
                SubBranchMunaqasyahView.fetchSubBranchYears()
            } catch (err) {
                setModalIsOpen(false);
            }
        };

        if (actionType === "start") {
            setModal({
                title: `Konfirmasi`,
                message: `Mulai munaqosah untuk tahun ajaran ${subBranchYearName}?`,
                onConfirm: () => confirmStart("inProgress")
            })
            setModalIsOpen(true);
        } else if (actionType === "finish") {
            setModal({
                title: `Konfirmasi`,
                message: `Mulai munaqosah untuk tahun ajaran ${subBranchYearName}?`,
                onConfirm: () => confirmStart("completed")
            })
            setModalIsOpen(true);
        }
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
                    subBranchYears.map((year, idx) => {
                        const key = year._id || `year-${idx}`;
                        const content = (
                            <div className={`card-basic hover:bg-gray-100 active:bg-gray-100 hover:cursor-pointer rounded-md justify-start m-0 transition-all duration-200 my-4`} >
                                <div className="flex items-center space-x-4 ">
                                    <div className="flex-1 h-fit"  >
                                        <div className='flex items-center gap-2'>
                                            <h2 className="text-xl text-gray-900">{academicYearFormatter(year.branchYear.name)}</h2>
                                        </div>
                                        <div className="flex items-center text-gray-500 mt-1">
                                            Jumlah Kelas: {year.classes.length}
                                        </div>
                                        <div className="flex items-center mt-4 md:mt-5 md:mb-1">
                                            Status Munaqosah:
                                        </div>
                                        <div className='text-gray-500'>
                                            {year.branchYear.isActive === true && (
                                                year.subBranch.munaqasyahStatus === "inProgress" && (
                                                    <div className='text-green-500'>
                                                        Munaqosah Kelompok berjalan!
                                                    </div>
                                                )
                                            )}
                                            {year.branchYear.isActive === true && (
                                                year.branchYear.munaqasyahStatus !== "inProgress" ? (
                                                    <div className='inline-flex items-center text-yellow-600 gap-1'>
                                                        <CircleAlert />
                                                        Desa belum memulai munaqosah.
                                                    </div>
                                                ) : (
                                                    <div className='inline-flex items-center text-blue-500 gap-1'>
                                                        <CircleAlert />
                                                        Desa sudah memulai munaqosah.
                                                    </div>
                                                )
                                            )}
                                        </div>

                                        <div>
                                            {year.branchYear.munaqasyahStatus === "inProgress"
                                                && year.branchYear.isActive === true
                                                && year.subBranch.munaqasyahStatus !== "inProgress"
                                                && (
                                                    <button
                                                        className='btn-primary-outline mt-2'
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            e.stopPropagation();
                                                            munaqasyahStatusHandler("start", year.branchYear.name, year.subBranch._id);
                                                        }}>
                                                        {year.subBranch.munaqasyahStatus === "notStarted" ? "Mulai Munaqosah" : "Mulai Munaqosah Susulan"}
                                                    </button>
                                                )}
                                            {year.branchYear.munaqasyahStatus === "inProgress"
                                                && year.branchYear.isActive === true
                                                && year.subBranch.munaqasyahStatus === "inProgress"
                                                && (
                                                    <button
                                                        className='btn-primary-outline mt-2'
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            e.stopPropagation();
                                                            munaqasyahStatusHandler("finish", year.branchYear.name, year.subBranch._id);
                                                        }}>
                                                        Selesaikan Munaqosah
                                                    </button>
                                                )}

                                            {year.branchYear.isActive !== true && (
                                                <div className='inline-flex italic items-center text-gray-500 gap-1'>
                                                    {/* <CircleAlert /> */}
                                                    Tahun ajaran tidak aktif.
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );

                        console.log("Branch Year ID:", year.branchYear._id);

                        return (
                            year.branchYear.munaqasyahStatus === "inProgress" &&
                            year.subBranch &&
                            year.subBranch.munaqasyahStatus === "inProgress"
                        ) ? (
                            <Link key={key} to={`/munaqasyah/${year.branchYear._id}`}>
                                {content}
                            </Link>
                        ) : (
                            <div key={key}>
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