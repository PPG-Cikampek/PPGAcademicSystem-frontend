import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import useHttp from '../../shared/hooks/http-hook';
import { AuthContext } from '../../shared/Components/Context/auth-context';
import LoadingCircle from '../../shared/Components/UIElements/LoadingCircle';
import Modal from "../../shared/Components/UIElements/ModalBottomClose";

import { LineChart, Trash, LockOpen, Lock, Clock, Users, GraduationCap, Building, PlusIcon, KeyRound } from 'lucide-react'
import ErrorCard from '../../shared/Components/UIElements/ErrorCard';
import { attendanceCount } from '../../shared/Utilities/attendanceCount';


const ClassDetailView = () => {
    const { isLoading, error, sendRequest, setError } = useHttp();
    const [classData, setClassData] = useState();
    const [modal, setModal] = useState({ title: '', message: '', onConfirm: null });
    const [modalIsOpen, setModalIsOpen] = useState(false);

    const classId = useParams().classId;
    const auth = useContext(AuthContext);
    const navigate = useNavigate();


    useEffect(() => {
        const fetchClassData = async () => {
            const url = `${import.meta.env.VITE_BACKEND_URL}/classes/${classId}?populate=all`
            try {
                const responseData = await sendRequest(url);
                setClassData(responseData);
                console.log(responseData)
            } catch (err) {
                // handled by useHttp
            }
        }
        fetchClassData();

    }, [sendRequest, classId]);

    const lockClassHandler = (className, classId) => {
        const confirmLock = async () => {

            const url = `${import.meta.env.VITE_BACKEND_URL}/classes/lock`
            const body = JSON.stringify({ classId })

            let responseData;
            try {
                responseData = await sendRequest(url, 'PATCH', body, {
                    'Content-Type': 'application/json'
                });

                setModal({ title: 'Berhasil!', message: responseData.message, onConfirm: null });
                const updatedData = await sendRequest(`${import.meta.env.VITE_BACKEND_URL}/classes/${classId}?populate=all`);
                setClassData(updatedData);

            } catch (err) {
                setModal({ title: 'Gagal!', message: err.message, onConfirm: null });
            }
        }
        setModal({
            title: `Kunci kelas: ${className}?`,
            message: `Kelas tidak akan bisa di-edit lagi!`,
            onConfirm: confirmLock,
        });
        setModalIsOpen(true);
    }

    const unlockClassHandler = (className, classId) => {
        const confirmLock = async () => {

            const url = `${import.meta.env.VITE_BACKEND_URL}/classes/unlock`
            const body = JSON.stringify({ classId })

            let responseData;
            try {
                responseData = await sendRequest(url, 'PATCH', body, {
                    'Content-Type': 'application/json'
                });

                setModal({ title: 'Berhasil!', message: responseData.message, onConfirm: null });
                const updatedData = await sendRequest(`${import.meta.env.VITE_BACKEND_URL}/classes/${classId}?populate=all`);
                setClassData(updatedData);

            } catch (err) {
                setModal({ title: 'Gagal!', message: err.message, onConfirm: null });
            }
        }
        setModal({
            title: `Buka kelas: ${className}?`,
            message: `Kelas dapat di-edit kembali`,
            onConfirm: confirmLock,
        });
        setModalIsOpen(true);
    }

    const removeHandler = (role, name, id) => {
        const confirmRemove = async () => {
            const url = role === "teacher"
                ? `${import.meta.env.VITE_BACKEND_URL}/classes/remove-teacher`
                : `${import.meta.env.VITE_BACKEND_URL}/classes/remove-student`;

            const body = role === "teacher"
                ? JSON.stringify({ classId, teacherId: id })
                : JSON.stringify({ classId, studentId: id })

            let responseData;

            try {
                responseData = await sendRequest(url, 'DELETE', body, {
                    'Content-Type': 'application/json'
                });
                setModal({ title: 'Berhasil!', message: responseData.message, onConfirm: null });

                const updatedData = await sendRequest(`${import.meta.env.VITE_BACKEND_URL}/classes/${classId}?populate=all`);
                setClassData(updatedData);

            } catch (err) {
                // Error is already handled by useHttp
            }

        };
        setModal({
            title: `Konfirmasi Penghapusan`,
            message: `Hapus ${name} dari kelas ini?`,
            onConfirm: confirmRemove,
        });
        setModalIsOpen(true);
    }

    const getInitials = (gender) => {
        return gender
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
        <div className="min-h-screen bg-gray-50 px-4 py-8 md:p-8 pb-24">
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

                {(!classData || isLoading) && !modalIsOpen && (
                    <div className="flex justify-center mt-16">
                        <LoadingCircle size={32} />
                    </div>
                )}

                {error && <ErrorCard error={error} onClear={() => setError(null)} />}

                {classData && !isLoading && (
                    <>
                        <div className="mb-8">
                            <div className="flex items-center gap-4">
                                <h1 className="text-2xl font-semibold text-gray-900">{classData.class.name}</h1>
                                {(!classData.class.isLocked && auth.userRole === 'admin kelompok') && classData.class.teachingGroupYearId.academicYearId.isActive === true && (
                                    <button
                                        onClick={() => lockClassHandler(classData.class.name, classData.class._id)}
                                        disabled={classData.class.isLocked}
                                        className={`btn-primary-outline font-medium flex flex-row items-start gap-2 ${classData.class.isLocked ? 'text-blue-500 disabled:opacity-100' : ''}`}
                                    >
                                        <LockOpen size={16} />
                                        Kunci Kelas
                                    </button>
                                )}
                                {classData.class.isLocked && classData.class.teachingGroupYearId.academicYearId.isActive === true && (
                                    <button
                                        className={`btn-primary-outline font-medium flex flex-row items-start gap-2 text-blue-500 disabled:opacity-100`}
                                        disabled
                                    >
                                        <Lock size={16} />
                                        Kelas Dikunci
                                    </button>
                                )}

                                {classData.class.isLocked && classData.class.teachingGroupYearId.isActive === false && auth.userRole === 'admin kelompok' && classData.class.teachingGroupYearId.academicYearId.isActive === true && (
                                    <button
                                        onClick={() => unlockClassHandler(classData.class.name, classData.class._id)}
                                        className={`btn-danger-outline flex flex-row items-start gap-2 text-gray-600`}
                                    >
                                        <KeyRound size={16} />
                                        Buka Kunci
                                    </button>
                                )}
                            </div>
                            <div className="mt-2 flex items-center text-gray-500">
                                <Building className="mr-2 h-4 w-4" />
                                <span>{classData.class.teachingGroupYearId.teachingGroupId.name} - {classData.class.teachingGroupYearId.name}</span>
                            </div>
                        </div>

                        <div className="flex flex-col gap-4 mb-8 rounded-md border border-gray-200 bg-white p-6 shadow-sm">
                            <div className="flex items-center space-x-2 text-gray-600">
                                <Clock className="h-5 w-5" />
                                <span>Kelas Mulai: {classData.class.startTime}</span>
                            </div>
                            <div className="flex items-center space-x-2 text-gray-600">
                                <GraduationCap className="h-5 w-5" />
                                <span>{classData.class.teachers.length} Guru</span>
                            </div>
                            <div className="flex items-center space-x-2 text-gray-600">
                                <Users className="h-5 w-5" />
                                <span>{classData.class.students.length} Siswa</span>
                            </div>
                            <div className="flex items-center space-x-2 text-gray-600">
                                <LineChart className="h-5 w-5" />
                                <span>{attendanceCount(classData.class)} / {classData.class.teachingGroupYearId.semesterTarget} Pertemuan Terlaksana</span>
                            </div>
                        </div>


                        <div className="mb-8">
                            <div className="mb-4 flex justify-between items-end">
                                <div className="flex gap-1 items-center">
                                    <GraduationCap className="mr-2 h-5 w-5 text-gray-600" />
                                    <h2 className="text-xl font-medium text-gray-800">Guru</h2>
                                </div>
                                {auth.userRole === 'admin kelompok' && classData.class.isLocked === false && classData.class.teachingGroupYearId.academicYearId.isActive === true && (
                                    <Link to={`/dashboard/classes/${classId}/add-teachers/`}>
                                        <button className="button-primary pl-[11px] mt-0">
                                            <PlusIcon className="w-4 h-4 mr-2" />
                                            Tambah Guru
                                        </button>
                                    </Link>
                                )}
                            </div>
                            <div className="rounded-md border border-gray-200 bg-white shadow-sm overflow-auto text-nowrap">
                                <table className="w-full">
                                    <thead className="bg-white">
                                        <tr>
                                            <th className="pl-6 py-3 text-left text-sm font-medium text-gray-500"></th>
                                            <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Nama</th>
                                            <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">NID</th>
                                            <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Posisi</th>
                                            <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Nomor WA</th>
                                            {auth.userRole !== 'teacher' && classData.class.isLocked === false && classData.class.teachingGroupYearId.academicYearId.isActive === true && (<th className="p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Atur</th>)}

                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {classData.class.teachers.map((teacher) => (
                                            <tr onClick={(e) => { e.stopPropagation(); navigate(`/dashboard/teachers/${teacher._id}`); }} key={teacher._id} className="hover:bg-gray-50 hover:cursor-pointer transition">
                                                <td className="p-4 ">
                                                    {teacher.image ? (
                                                        <img
                                                            src={teacher?.image ? `${import.meta.env.VITE_BACKEND_URL}/${teacher.image}` : "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png?20150327203541"}
                                                            alt={teacher.name}
                                                            className="w-10 h-10 rounded-full min-w-10"
                                                        />
                                                    ) : (
                                                        <div
                                                            className={`w-10 h-10 rounded-full bg-green-200 text-green-500 flex items-center justify-center font-medium`}
                                                        >
                                                            {getInitials(teacher.name)}
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-900">{teacher.name}</td>
                                                <td className="px-6 py-4 text-sm text-gray-600">{teacher.nid}</td>
                                                <td className="px-6 py-4 text-sm text-gray-600">{teacher.position}</td>
                                                <td className="px-6 py-4 text-sm text-gray-600">{teacher.phone}</td>
                                                {auth.userRole !== 'teacher' && classData.class.isLocked === false && classData.class.teachingGroupYearId.academicYearId.isActive === true && (
                                                    <td className="flex gap-4 py-4">
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); removeHandler('teacher', teacher.name, teacher._id); }}
                                                            className="p-3 rounded-full hover:bg-gray-200 text-red-500 hover:text-red-700 transition"
                                                        >
                                                            <Trash size={20} />
                                                        </button>
                                                    </td>)}
                                            </tr>
                                        ))}
                                        {classData.class.teachers.length === 0 && (
                                            <tr className="">
                                                <td colSpan="5" className="px-6 py-4 text-sm text-gray-500 text-center">Belum ada guru untuk kelas ini</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div>
                            <div className="mb-4 flex justify-between items-end">
                                <div className="flex gap-1 items-center">
                                    <Users className="mr-2 h-5 w-5 text-gray-600" />
                                    <h2 className="text-xl font-medium text-gray-800">Siswa</h2>
                                </div>
                                {classData.class.isLocked === false && (
                                    <Link to={`/dashboard/classes/${classId}/add-students/`}>
                                        <button className="button-primary pl-[11px] mt-0">
                                            <PlusIcon className="w-4 h-4 mr-2" />
                                            Tambah Siswa
                                        </button>
                                    </Link>
                                )}
                            </div>
                            <div className="rounded-md border border-gray-200 bg-white shadow-sm  overflow-auto text-nowrap">
                                <table className="w-full">
                                    <thead className="bg-white">
                                        <tr>
                                            <th className="pl-6 py-3 text-left text-sm font-medium text-gray-500"></th>
                                            <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">NIS</th>
                                            <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Nama</th>
                                            {auth.userRole !== 'teacher' && classData.class.isLocked === false && classData.class.teachingGroupYearId.academicYearId.isActive === true && (<th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Atur</th>)}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {classData.class.students.map((student) => (
                                            <tr onClick={(e) => { e.stopPropagation(); navigate(`/dashboard/students/${student._id}`); }} key={student._id} className="hover:bg-gray-50 hover:cursor-pointer transition">
                                                <td className="p-4">
                                                    {student.image ? (
                                                        <img
                                                            src={student?.image ? `${import.meta.env.VITE_BACKEND_URL}/${student.image}` : "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png?20150327203541"}
                                                            alt={student.name}
                                                            className="w-10 h-10 rounded-full min-w-10"
                                                        />
                                                    ) : (
                                                        <div
                                                            className={`w-10 h-10 rounded-full bg-blue-200 text-blue-500 flex items-center justify-center font-medium`}
                                                        >
                                                            {getInitials(student.name)}
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-900">{student.nis}</td>
                                                <td className="px-6 py-4 text-sm text-gray-900">{student.name}</td>
                                                {classData.class.isLocked === false && classData.class.teachingGroupYearId.academicYearId.isActive === true && (
                                                    <td className="flex gap-4 py-4">
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); removeHandler('student', student.name, student._id); }}
                                                            className="p-3 rounded-full  hover:bg-gray-200 text-red-500 hover:text-red-700 transition"
                                                        >
                                                            <Trash size={20} />
                                                        </button>
                                                    </td>)}
                                            </tr>
                                        ))}
                                        {classData.class.students.length === 0 && (
                                            <tr className="">
                                                <td colSpan="4" className="px-6 py-4 text-sm text-gray-500 text-center">Belum ada siswa terdaftar di kelas ini.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default ClassDetailView