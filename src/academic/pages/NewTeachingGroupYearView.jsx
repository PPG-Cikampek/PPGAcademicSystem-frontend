import React, { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { AuthContext } from "../../shared/Components/Context/auth-context";
import useHttp from '../../shared/hooks/http-hook';

import LoadingCircle from '../../shared/Components/UIElements/LoadingCircle';
import Modal from "../../shared/Components/UIElements/ModalBottomClose";
import BackButton from "../../shared/Components/UIElements/BackButton";

const NewTeachingGroupYearView = () => {
    const [modal, setModal] = useState({ title: '', message: '', onConfirm: null });
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [academicYears, setAcademicYears] = useState()
    const { isLoading, error, sendRequest, setError } = useHttp();

    const navigate = useNavigate()
    const auth = useContext(AuthContext)
    const targetTeachingGroupId = auth.userTeachingGroupId

    useEffect(() => {
        const loadYears = async () => {
            try {
                const responseData = await sendRequest(`${import.meta.env.VITE_BACKEND_URL}/academicYears?populate=teachingGroupYears`);
                setAcademicYears(responseData.academicYears);
            } catch (err) {
                // Error handled by useHttp
            }
        };
        loadYears();
    }, [sendRequest]);

    const formatAcademicYear = (name) => {
        const year = name.substring(0, 4);
        const semester = name.substring(4);
        return `${year}/${parseInt(year) + 1} ${semester === '1' ? 'Ganjil' : 'Genap'}`;
    };

    const registerYearHandler = (academicYearName, academicYearId) => {
        const confirmRegister = async () => {
            const url = `${import.meta.env.VITE_BACKEND_URL}/teachingGroupYears`
            const body = JSON.stringify({
                name: formatAcademicYear(academicYearName),
                teachingGroupId: auth.userTeachingGroupId,
                academicYearId
            });
            let responseData;
            try {
                responseData = await sendRequest(url, 'POST', body, {
                    'Content-Type': 'application/json'
                });
                setModal({ title: 'Berhasil!', message: responseData.message, onConfirm: null });

                const updatedData = await sendRequest(`${import.meta.env.VITE_BACKEND_URL}/academicYears?populate=teachingGroupYears`);
                setAcademicYears(updatedData.academicYears);

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
            message: `Daftarkan tahun ajaran ${formatAcademicYear(academicYearName)}?`,
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
                <h1 className="text-2xl font-bold mb-4">Daftarkan Tahun Ajaran ke Kelompok</h1>
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


                {(!academicYears || isLoading) && (
                    <div className="flex justify-center mt-16">
                        <LoadingCircle size={32} />
                    </div>
                )}

                {academicYears && !isLoading && (
                    <>
                        {academicYears.length === 0 && (
                            <div className="bg-white rounded-md shadow-md p-6 border border-gray-200">
                                <p className="text-gray-700 text-center">Daerah belum membuat tahun ajaran. Hubungi pihak terkait</p>

                            </div>
                        )}
                        {academicYears.length > 0 && (

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {academicYears.map((year) => {
                                    const hasTargetTeachingGroup = year.teachingGroupYears.some(
                                        (teachingGroupYear) => teachingGroupYear.teachingGroupId.id === targetTeachingGroupId
                                    );

                                    return (
                                        <div
                                            key={year._id}
                                            className={`p-4 border rounded-lg transition-all duration-300 ${hasTargetTeachingGroup
                                                ? "bg-gray-100 border-gray-300 text-gray-500 hover:cursor-not-allowed"
                                                : "bg-white border-gray-200 hover:ring-4 hover:ring-blue-200 hover:border-blue-500 hover:shadow-xl cursor-pointer"
                                                }`}
                                            onClick={!hasTargetTeachingGroup ? () => registerYearHandler(year.name, year.id) : undefined}
                                        >
                                            <div className="flex justify-between items-center">
                                                <h2 className="text-lg font-medium">{formatAcademicYear(year.name)}</h2>
                                                {hasTargetTeachingGroup && (
                                                    <span className="text-sm font-base text-gray-500">Terdaftar ✓</span>
                                                )}
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

export default NewTeachingGroupYearView;
