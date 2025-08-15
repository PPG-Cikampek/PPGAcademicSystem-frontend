import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useHttp from '../../../../shared/hooks/http-hook';

import { ChevronDown, ChevronUp, Pencil, Trash, Edit2, X } from 'lucide-react';
import LoadingCircle from '../../../../shared/Components/UIElements/LoadingCircle';
import { motion, AnimatePresence } from 'framer-motion';
import ErrorCard from '../../../../shared/Components/UIElements/ErrorCard';
import Modal from '../../../../shared/Components/UIElements/ModalBottomClose';

const AttendanceHistoryViewByClass = () => {
    const [modal, setModal] = useState({ title: '', message: '', onConfirm: null });
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [loadedData, setLoadedData] = useState();
    const [expandedDates, setExpandedDates] = useState([]);
    const { isLoading, error, sendRequest } = useHttp();
    const classId = useParams().classId;

    const navigate = useNavigate();

    useEffect(() => {
        const loadAttendances = async () => {
            const url = `${import.meta.env.VITE_BACKEND_URL}/attendances/class/${classId}`;
            try {
                const responseData = await sendRequest(url);
                setLoadedData(responseData);
            } catch (err) { }
        };
        if (classId) {
            loadAttendances();
        }
    }, [classId, sendRequest]);

    const toggleExpand = (date) => {
        setExpandedDates((prev) =>
            prev.includes(date)
                ? prev.filter((d) => d !== date)
                : [...prev, date]
        );
    };

    const editAttendanceHandler = (attendanceId) => {
        console.log('edit attendance', attendanceId);
        navigate(`/attendance/history/class/${classId}/${attendanceId}/edit`)
    }

    const deleteAttendanceHandler = (studentName, attendanceId) => {
        const confirmDelete = async () => {
            const url = `${import.meta.env.VITE_BACKEND_URL}/attendances/${attendanceId}`;
            const body = JSON.stringify({ studentName })
            let responseData;
            try {
                responseData = await sendRequest(url, 'DELETE', body, {
                    'Content-Type': 'application/json'
                });
                setModal({ title: 'Berhasil!', message: responseData.message, onConfirm: null });

                const updatedData = await sendRequest(`${import.meta.env.VITE_BACKEND_URL}/attendances/class/${classId}`);
                setLoadedData(updatedData);

            } catch (err) {
                setModal({ title: 'Gagal!', message: err.message, onConfirm: null });
            }

        };
        setModal({
            title: `Konfirmasi Penghapusan`,
            message: `Hapus absen siswa: ${studentName}?`,
            onConfirm: confirmDelete,
        });
        setModalIsOpen(true);
    }


    const collapseAll = () => {
        setExpandedDates([]);
    };

    const groupedData = loadedData?.reduce((acc, curr) => {
        const date = new Date(curr.forDate).toLocaleDateString('id-ID', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        });
        acc[date] = acc[date] || [];
        acc[date].push(curr);
        return acc;
    }, {});

    console.log(loadedData)
    console.log(groupedData)

    const dateCount = groupedData ? Object.keys(groupedData).length : 0;

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
        <div className="p-4 space-y-4 mb-24">
            {isLoading && !loadedData && (
                <div className="flex justify-center mt-16">
                    <LoadingCircle size={32} />
                </div>
            )}

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

            {error && <ErrorCard error={error} onClear={() => setError(null)} />}

            {expandedDates.length > 1 && dateCount > 1 && (
                <motion.button
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="flex items-center gap-2 px-4 py-2 border border-gray-300 bg-gray-100 hover:bg-gray-200 rounded-full text-sm font-medium transition-colors"
                    onClick={collapseAll}
                >
                    <X size={16} />
                    Collapse All
                </motion.button>
            )}

            <AnimatePresence>
                {groupedData &&
                    Object.entries(groupedData).map(([date, attendances]) => (
                        <motion.div
                            key={date}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="border shadow-xs rounded-full"
                        >
                            <motion.button
                                onClick={() => toggleExpand(date)}
                                className={`w-full px-3 py-2 flex justify-between items-center bg-blue-100 hover:bg-blue-200 transition-colors ${expandedDates.includes(date) ? 'rounded-t-md' : 'rounded-full'
                                    }`}
                            >
                                <span className="font-medium">{date}</span>
                                <div className="flex items-center gap-2">
                                    {expandedDates.includes(date) ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                </div>
                            </motion.button>

                            <AnimatePresence>
                                {expandedDates.includes(date) && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: "auto", opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.3, ease: "easeInOut" }}
                                        className="overflow-hidden bg-white"
                                    >
                                        <table className="w-full table-auto border-collapse border border-gray-300">
                                            <thead>
                                                <tr className="bg-white">
                                                    <th className="border-t border-gray-300 p-2 text-left text-xs text-gray-500">Nama</th>
                                                    <th className="border-t border-gray-300 p-2 text-left text-xs text-gray-500">Status</th>
                                                    <th className="border-t border-gray-300 p-2 text-left text-xs text-gray-500">Waktu</th>
                                                    <th className="border-t border-gray-300 p-2 text-left text-xs text-gray-500">Temuan</th>
                                                    <th className="border-t border-gray-300 text-left text-xs text-gray-500"></th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {attendances.map((attendance) => (
                                                    <tr onClick={() => navigate(`/attendance/history/class/${loadedData[0].classId}/${attendance._id}`)} key={attendance._id} className="bg-white hover:bg-gray-100">
                                                        <td className="border-t border-gray-300 p-2 text-xs">{attendance.studentId.name}</td>
                                                        <td className="border-t border-gray-300 p-2 text-xs">{attendance.status}</td>
                                                        <td className="border-t border-gray-300 p-2 text-xs">
                                                            {new Date(attendance.timestamp).toLocaleTimeString('id-ID', {
                                                                hour: '2-digit',
                                                                minute: '2-digit',
                                                            })}
                                                        </td>
                                                        <td className="border-t border-gray-300 p-2 text-xs">
                                                            {Object.values(attendance?.violations).filter(value => value === true).length || '0'}
                                                        </td>
                                                        {new Date().toLocaleDateString('en-CA') !== new Date(attendance.forDate).toLocaleDateString('en-CA') && (
                                                            <td className="border-t border-gray-300 text-xs flex">
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        editAttendanceHandler(attendance._id);
                                                                    }}
                                                                    className="p-1 rounded-full active:bg-gray-200 text-blue-500 active:text-blue-700 transition duration-300"
                                                                >
                                                                    <Edit2 size={16} />
                                                                </button>
                                                                {/* <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        deleteAttendanceHandler(attendance.studentId.name, attendance._id);
                                                                    }}
                                                                    className="p-1 rounded-full active:bg-gray-200 text-red-500 active:text-red-700 transition duration-300"
                                                                >
                                                                    <Trash size={16} />
                                                                </button> */}
                                                            </td>
                                                        )}
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    ))}
            </AnimatePresence>
        </div>
    );
};

export default AttendanceHistoryViewByClass;