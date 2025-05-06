import React, { useState, useContext, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { AuthContext } from "../../shared/Components/Context/auth-context";
import useHttp from '../../shared/hooks/http-hook';

import LoadingCircle from '../../shared/Components/UIElements/LoadingCircle';
import Modal from "../../shared/Components/UIElements/ModalBottomClose";
import { TriangleAlert } from "lucide-react";
import ErrorCard from "../../shared/Components/UIElements/ErrorCard";


const AddTeacherToClassView = () => {
    const [modal, setModal] = useState({ title: '', message: '', className: '', onConfirm: null });
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [teachers, setTeachers] = useState()
    const { isLoading, error, sendRequest, setError } = useHttp();

    const navigate = useNavigate()
    const auth = useContext(AuthContext)
    const targetTeachingGroupId = auth.userTeachingGroupId

    const classId = useParams().classId;
    const targetClassId = classId

    useEffect(() => {
        const loadedTeachers = async () => {
            try {
                const responseData = await sendRequest(`${import.meta.env.VITE_BACKEND_URL}/teachers/teaching-group/${targetTeachingGroupId}`);
                setTeachers(responseData.teachers);
            } catch (err) {
                // Error handled by useHttp
            }
        };
        loadedTeachers();
    }, [sendRequest]);

    const registerTeacherHandler = (teacherName, teacherId) => {
        const confirmRegister = async () => {
            const url = `${import.meta.env.VITE_BACKEND_URL}/classes/register-teacher`
            const body = JSON.stringify({
                classId,
                teacherId
            });
            let responseData;
            try {
                responseData = await sendRequest(url, 'POST', body, {
                    'Content-Type': 'application/json'
                });
                setModal({ title: 'Berhasil!', message: responseData.message, onConfirm: null });

                const updatedData = await sendRequest(`${import.meta.env.VITE_BACKEND_URL}/teachers/teaching-group/${targetTeachingGroupId}`);
                setTeachers(updatedData.teachers);

            } catch (err) {
                setModal({ title: 'Gagal!', message: err.message, className: 'text-red-500', onConfirm: null });
            }

        };
        setModal({
            title: `Konfirmasi Pendaftaran`,
            message: `Daftarkan tenaga pendidik ${teacherName}?`,
            onConfirm: confirmRegister,
        });
        setModalIsOpen(true);
    }

    const getInitials = (name) => {
        return name
            ?.split(' ')
            .map((word) => word[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

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

                <h1 className="text-2xl font-bold mb-4">Daftarkan Tenaga Pendidik ke Kelas</h1>
                <Modal
                    isOpen={modalIsOpen}
                    onClose={() => setModalIsOpen(false)}
                    title={modal.title}
                    footer={<ModalFooter />}
                >
                    {isLoading && (
                        <div className={`flex justify-center mt-16 `}>
                            <LoadingCircle size={32} />
                        </div>
                    )}
                    <div className={`${modal.className}`}>
                        {!isLoading && (
                            modal.message
                        )}
                    </div>
                </Modal>

                {error && (
                    <div className="px-2">
                        <ErrorCard error={error} onClear={() => setError(null)} />
                    </div>
                )}

                {(!teachers || isLoading) && (
                    <div className="flex justify-center mt-16">
                        <LoadingCircle size={32} />
                    </div>
                )}

                {teachers && !isLoading && (
                    <>
                        {teachers.length === 0 && (
                            <div className="bg-white rounded-md shadow-md p-6 border border-gray-200">
                                <p className="text-gray-700 text-center">Daerah belum menyediakan tenaga pendidik. Hubungi pihak terkait</p>

                            </div>
                        )}
                        {teachers.length > 0 && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {teachers.map((teacher) => {
                                    const hasTargetClass = teacher.classIds.some(
                                        (classId) => classId?._id === targetClassId
                                    );

                                    return (
                                        <div
                                            key={teacher._id}
                                            className={`p-4 border rounded-lg transition-all duration-300 ${hasTargetClass
                                                ? "bg-gray-100 border-gray-300 text-gray-500 cursor-not-allowed"
                                                : "bg-white border-gray-200 hover:ring-4 hover:ring-blue-200 hover:border-blue-500 hover:shadow-xl cursor-pointer"
                                                }`}
                                            onClick={!hasTargetClass ? () => registerTeacherHandler(teacher.name, teacher.id) : undefined}
                                        >
                                            <div className="flex justify-between items-center gap-2">
                                                <div className="flex gap-4 items-center">
                                                    {teacher.image ? (
                                                        <img
                                                            src={teacher?.image ? `${import.meta.env.VITE_BACKEND_URL}/${teacher.image}` : "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png?20150327203541"}
                                                            alt={teacher.name}
                                                            className="w-10 h-10 rounded-full border border-gray-200 bg-white"
                                                        />
                                                    ) : (
                                                        <div
                                                            className={`w-10 h-10 rounded-full bg-green-200 text-green-500 hidden md:flex items-center justify-center font-medium`}
                                                        >
                                                            {getInitials(teacher.name)}
                                                        </div>
                                                    )}
                                                    <div className="flex flex-col gap-1">
                                                        <h2 className="text-lg font-medium">{teacher.name}</h2>
                                                        <h3 className="text-base font-normal">{teacher.nig}</h3>
                                                    </div>
                                                </div>
                                                {teacher.isProfileComplete === false ? (
                                                    <span className="text-sm font-medium text-red-500">
                                                        Lengkapi Profil!
                                                    </span>
                                                ) : hasTargetClass ? (
                                                    <span className="text-sm font-base text-gray-500">Terdaftar ✓</span>
                                                ) : (
                                                    <span className="text-sm font-medium text-blue-500 hidden hover:block">
                                                        Register
                                                    </span>
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

export default AddTeacherToClassView;
