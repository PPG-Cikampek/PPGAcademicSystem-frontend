import React, { useState, useContext, useEffect } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";

import { AuthContext } from "../../shared/Components/Context/auth-context";
import useHttp from '../../shared/hooks/http-hook';

import LoadingCircle from '../../shared/Components/UIElements/LoadingCircle';
import Modal from "../../shared/Components/UIElements/ModalBottomClose";

const AddSubBranchToTeachingGroupView = () => {
    const [modal, setModal] = useState({ title: '', message: '', onConfirm: null });
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [subBranches, setSubBranches] = useState()
    const { isLoading, error, sendRequest, setError } = useHttp();

    const targetTeachingGroupId = useParams().teachingGroupId;
    const navigate = useNavigate()

    const location = useLocation();
    const teachingGroupData = location.state?.teachingGroupData;
    console.log(teachingGroupData);

    const auth = useContext(AuthContext)

    useEffect(() => {
        const loadSubBranches = async () => {
            try {
                const responseData = await sendRequest(`${import.meta.env.VITE_BACKEND_URL}/levels/branches/${auth.userBranchId}/sub-branches`);
                setSubBranches(responseData.subBranches);
                console.log(responseData.subBranches);
            } catch (err) {
                // Error handled by useHttp
            }
        };
        loadSubBranches();
    }, [sendRequest]);


    const registerSubBranchHandler = (subBranchName, subBranchId) => {
        const confirmRegister = async () => {
            const url = `${import.meta.env.VITE_BACKEND_URL}/teachingGroups/${targetTeachingGroupId}`
            const body = JSON.stringify({
                name: subBranchName,
                teachingGroupId: targetTeachingGroupId,
                subBranchId
            });
            let responseData;
            try {
                responseData = await sendRequest(url, 'POST', body, {
                    'Content-Type': 'application/json'
                });
                setModal({ title: 'Berhasil!', message: responseData.message, onConfirm: null });

                const updatedData = await sendRequest(`${import.meta.env.VITE_BACKEND_URL}/levels/branches/${auth.userBranchId}/sub-branches`);
                setSubBranches(updatedData.subBranches);

            } catch (err) {
                setModal({
                    title: `Gagal!`,
                    message: err.message,
                    onConfirm: null,
                });
            }
        };
        setModal({
            title: `Konfirmasi Pendaftaran`,
            message: `Daftarkan kelompok ${subBranchName}?`,
            onConfirm: confirmRegister,
        });
        setModalIsOpen(true);
    }

    const ModalFooter = () => (
        <div className="flex gap-2 items-center">
            <button
                onClick={() => {
                    setModalIsOpen(false)
                }}
                className={`${modal.onConfirm ? 'btn-danger-outline' : 'button-primary mt-0 '} ${isLoading ? 'opacity-50 hover:cursor-not-allowed' : ''}`}
                disabled={isLoading}
            >
                {isLoading ? <LoadingCircle /> : modal.onConfirm ? 'Batal' : 'Tutup'}
            </button>
            {modal.onConfirm && (
                <button onClick={modal.onConfirm} className={`button-primary mt-0 ${isLoading ? 'opacity-50 hover:cursor-not-allowed' : ''}`}>
                    {isLoading ? <LoadingCircle /> : 'Ya'}
                </button>
            )}
        </div>
    );

    return (

        <div className="min-h-screen bg-gray-50 px-4 py-8 md:p-8">
            <div className="max-w-6xl mx-auto">
                <h1 className="text-2xl font-bold mb-4">Daftarkan Kelompok ke KBM</h1>
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


                {(!subBranches || isLoading) && (
                    <div className="flex justify-center mt-16">
                        <LoadingCircle size={32} />
                    </div>
                )}

                {subBranches && !isLoading && (
                    <>
                        {subBranches.length === 0 && (
                            <div className="bg-white rounded-md shadow-md p-6 border border-gray-200">
                                <p className="text-gray-700 text-center">Tidak Ada Kelompok di Desa Ini!</p>

                            </div>
                        )}
                        {subBranches.length > 0 && (

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {subBranches.map((subBranch) => {
                                    // const hasTargetBranch = subBranch.subBranches.some(
                                    //     (subBranch) => subBranch.id === targetTeachingGroupId.
                                    // );

                                    return (
                                        <div
                                            key={subBranch._id}
                                            className={`p-4 border rounded-lg transition-all duration-300 bg-white border-gray-200 hover:ring-4 hover:ring-blue-200 hover:border-blue-500 hover:shadow-xl cursor-pointer`}
                                            // className={`p-4 border rounded-lg transition-all duration-300 ${hasTargetBranch
                                            //     ? "bg-gray-100 border-gray-300 text-gray-500 hover:cursor-not-allowed"
                                            //     : "bg-white border-gray-200 hover:ring-4 hover:ring-blue-200 hover:border-blue-500 hover:shadow-xl cursor-pointer"
                                            //     }`}
                                            onClick={() => registerSubBranchHandler(subBranch.name, subBranch.id)}
                                        >
                                            <div className="flex justify-between items-center">
                                                <h2 className="text-lg font-medium">{subBranch.name}</h2>
                                                {/* {hasTargetBranch && (
                                                    <span className="text-sm font-base text-gray-500">Terdaftar ✓</span>
                                                )} */}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default AddSubBranchToTeachingGroupView;
