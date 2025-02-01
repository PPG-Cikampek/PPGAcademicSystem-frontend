import React, { useContext, useRef, useEffect, useState } from 'react';

import useHttp from '../../../shared/hooks/http-hook';

import { StudentAttendanceContext } from '../context/StudentAttendanceContext';

import { SquareCheck, LoaderCircle, ChevronDown, ChevronUp } from 'lucide-react'
import { Icon } from '@iconify-icon/react';
import StudentInitial from '../../../shared/Components/UIElements/StudentInitial';

import { motion, AnimatePresence } from 'framer-motion';


const AttendedStudents = () => {
    const { state, dispatch } = useContext(StudentAttendanceContext);
    const prevStudentList = useRef(state.studentList);
    const { isLoading, error, sendRequest } = useHttp();
    const [showViolationsMenu, setShowViolationsMenu] = useState({}); // Change to an object to track each student's menu


    const patchMultipleStudentStatuses = async (updates) => {
        try {
            const url = `${import.meta.env.VITE_BACKEND_URL}/attendances/`
            const body = JSON.stringify({ updates })
            console.log(body)

            const response = await sendRequest(url, 'PATCH', body, {
                'Content-Type': 'application/json'
            });

            console.log('Successfully updated statuses:', response);
        } catch (error) {
            console.error('Error updating statuses:', error);
        }
    };

    useEffect(() => {
        const changedStatuses = [];
        state.studentList.forEach((student, index) => {
            const prevStudent = prevStudentList.current[index];
            if (
                prevStudent &&
                (
                    prevStudent.status !== student.status ||
                    prevStudent.attributes !== student.attributes ||
                    prevStudent.violations !== student.violations ||
                    prevStudent.notes !== student.notes
                )
            ) {
                changedStatuses.push({
                    attendanceId: student._id,
                    status: student.status,
                    attributes: student.attributes,
                    violations: student.violations,
                    notes: student.notes,
                    timestamp: student.timestamp,
                });
            }
        });

        // Batch updates if changes exist
        if (changedStatuses.length > 0) {
            patchMultipleStudentStatuses(changedStatuses);
        }

        prevStudentList.current = state.studentList;
    }, [state.studentList]);

    const handleStatusChange = (id, newStatus, timestamp = Date.now()) => {
        dispatch({ type: 'SET_STATUS', payload: { id, newStatus, timestamp } });
    };

    const handleAttributesChange = (id, newAttributes) => {
        dispatch({ type: 'SET_ATTRIBUTE', payload: { id, newAttributes } });
    };

    const handleViolationsChange = (id, violationType) => {
        dispatch({ type: 'SET_VIOLATIONS', payload: { id, violationType } });
    };

    const handleCheckboxChange = (id) => {
        dispatch({ type: 'TOGGLE_SELECTED', payload: { id } });
    };

    const handleSelectAll = () => {
        dispatch({ type: 'TOGGLE_SELECT_ALL' });
    };

    const applyBulkStatus = (newStatus, timestamp = Date.now()) => {
        dispatch({ type: 'APPLY_BULK_STATUS', payload: { newStatus, timestamp } });
    };

    const getBorderColor = (status) => {
        switch (status) {
            case 'Hadir':
                return 'bg-blue-500/50';
            case 'Terlambat':
                return 'bg-yellow-500/50';
            case 'Sakit':
                return 'bg-violet-500/50';
            case 'Izin':
                return 'bg-orange-500/50';
            default:
                return 'bg-red-500/50';
        }
    };

    const toggleMenu = (nis) => {
        setShowViolationsMenu((prev) => ({ ...prev, [nis]: !prev[nis] }));
    };

    return (
        <div className="card-basic mx-4 flex-col box-border">
            <div className="flex items-center gap-3">
                <h1 className='text-lg font-medium'>Daftar Hadir</h1>
                {state.studentList.length !== 0 && (
                    isLoading ? (
                        <div className='flex items-center gap-2 animate-pulse'>
                            <LoaderCircle size={24} className='animate-spin' />
                            <span className='text-xs text-gray-600'>Menyimpan otomatis...</span>
                        </div>
                    ) : (
                        error
                            ? <Icon icon="mdi:cloud-alert-outline" width="24" height="24" />
                            : (
                                <div className='flex items-center gap-2 animate-pulse'>
                                    <Icon icon="ci:cloud-check" width="24" height="24" />
                                    <span className='text-xs text-gray-600'>Perubahan tersimpan</span>
                                </div>
                            )

                    ))}
            </div>
            {state.studentList.length !== 0 && state.isTeachingGroupYearActivated === true ? (
                <div className="inline-flex items-center">
                    <label className="flex items-center cursor-pointer relative" htmlFor="check-2">
                        <input
                            type="checkbox"
                            checked={state.selectAll}
                            onChange={handleSelectAll}
                            className="peer h-4 w-4 cursor-pointer transition-all appearance-none rounded shadow hover:shadow-md border border-slate-300 checked:bg-primary checked:border-primary"
                            id="check-2"
                        />
                        <span className="absolute text-white opacity-0 peer-checked:opacity-100 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                            <SquareCheck />
                        </span>
                    </label>
                    <label className="cursor-pointer ml-2 my-2 text-sm" htmlFor="check-2">
                        Pilih Semua
                    </label>
                </div>
            ) : (
                <div className='italic text-gray-500 mt-2'>Daftar hadir kosong</div>
            )}
            <div className={`flex flex-col ${state.studentList.length !== 0 && state.isTeachingGroupYearActivated === true ? 'mb-4' : ''} `}>
                {state.isTeachingGroupYearActivated === true && state.studentList.map(student => (
                    <div key={student.studentId.nis} className={`p-4 pr-0 mx-[-1rem] min-h-20 flex items-center gap-4 border-b ${getBorderColor(student.status)} transition-all duration-500`}>
                        <label className="flex items-center cursor-pointer relative" htmlFor={student.studentId.nis}>
                            <input
                                type="checkbox"
                                checked={!!student.isSelected}
                                onChange={() => handleCheckboxChange(student.studentId.nis)}
                                className="peer h-4 w-4 cursor-pointer transition-all appearance-none rounded shadow hover:shadow-md border border-slate-300 checked:bg-primary checked:border-primary"
                                id={student.studentId.nis}
                                disabled={student.status === "Hadir" || student.status === "Terlambat"}
                            />
                            <span className="absolute text-white opacity-0 peer-checked:opacity-100 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                                <SquareCheck />
                            </span>
                        </label>
                        <div className="flex-1">
                            <div className="flex gap-2 items-center mb-2">
                                {student.studentId.image ? (
                                    <img
                                        src={`${import.meta.env.VITE_BACKEND_URL}/${student.studentId.image}`}
                                        alt="Profile"
                                        className="rounded-full size-10 shrink-0"
                                    />
                                ) : (
                                    <StudentInitial studentName={student.studentId.name} clsName={`size-10 rounded-full bg-blue-200 text-blue-500 flex items-center justify-center font-medium`} />
                                )}
                                <div className="flex flex-col">
                                    <div className="uppercase">{student.studentId.name}</div>
                                    <div className="text-xs text-gray-800">{student.studentId.nis}</div>
                                </div>
                            </div>
                            <div className='flex flex-wrap gap-2'>
                                <select
                                    value={student.status || ''}
                                    onChange={(e) => handleStatusChange(student.studentId.nis, e.target.value)}
                                    className="border p-1 rounded-full active:ring-2 active:ring-blue-300 h-min"
                                    disabled={student.status === "Hadir" || student.status === "Terlambat"}
                                >
                                    <option value={null}>Tanpa Keterangan</option>
                                    <option value="Hadir" disabled={true}>Hadir</option>
                                    <option value="Terlambat" disabled={true}>Terlambat</option>
                                    <option value="Sakit">Sakit</option>
                                    <option value="Izin">Izin</option>
                                </select>
                                <div className={`relative w-full`}>
                                    <button
                                        type="button"
                                        className={`border p-1 px-2 rounded-full active:ring-2 active:ring-blue-300 bg-white flex justify-between items-center ${(student.status === "Sakit" || student.status === "Izin" || student.status === "Tanpa Keterangan") && 'hidden'}`}
                                        onClick={() => toggleMenu(student.studentId.nis)}
                                    >
                                        Temuan
                                        {showViolationsMenu[student.studentId.nis] ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                    </button>
                                    <AnimatePresence>
                                        {showViolationsMenu[student.studentId.nis] && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: "auto", opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                transition={{ duration: 0.3, ease: "backInOut" }}
                                                // className="overflow-hidden bg-white"
                                            >
                                                <div className={`mt-2 mr-4 rounded-md bg-white ring-1 ring-black ring-opacity-5`}>
                                                    <div className="flex flex-col py-2">
                                                        <div className="px-2 inline-flex items-center">
                                                            <label className="flex items-center cursor-pointer p-2 relative" htmlFor={student.studentId.nis + "attribute"}>
                                                                <input
                                                                    type="checkbox"
                                                                    checked={!!student.violations.attribute}
                                                                    onChange={() => handleViolationsChange(student.studentId.nis, "Attribute")}
                                                                    className="peer h-4 w-4 cursor-pointer transition-all appearance-none rounded shadow hover:shadow-md border border-slate-300 checked:bg-primary checked:border-primary"
                                                                    id={student.studentId.nis + "attribute"}
                                                                    disabled={student.status === "Sakit" || student.status === "Izin" || student.status === "Tanpa Keterangan"}
                                                                />
                                                                <span className="absolute text-white opacity-0 peer-checked:opacity-100 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                                                                    <SquareCheck />
                                                                </span>
                                                            </label>
                                                            <label className="cursor-pointer text-sm" htmlFor={student.studentId.nis + "attribute"}>
                                                                Atribut
                                                            </label>
                                                        </div>
                                                        <div className="px-2 inline-flex items-center">
                                                            <label className="flex items-center cursor-pointer p-2 relative" htmlFor={student.studentId.nis + "attitude"}>
                                                                <input
                                                                    type="checkbox"
                                                                    checked={!!student.violations.attitude}
                                                                    onChange={() => handleViolationsChange(student.studentId.nis, "Attitude")}
                                                                    className="peer h-4 w-4 cursor-pointer transition-all appearance-none rounded shadow hover:shadow-md border border-slate-300 checked:bg-primary checked:border-primary"
                                                                    id={student.studentId.nis + "attitude"}
                                                                    disabled={student.status === "Sakit" || student.status === "Izin" || student.status === "Tanpa Keterangan"}
                                                                />
                                                                <span className="absolute text-white opacity-0 peer-checked:opacity-100 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                                                                    <SquareCheck />
                                                                </span>
                                                            </label>
                                                            <label className="cursor-pointer text-sm" htmlFor={student.studentId.nis + "attitude"}>
                                                                Sikap
                                                            </label>
                                                        </div>
                                                        <div className="px-2 inline-flex items-center">
                                                            <label className="flex items-center cursor-pointer p-2 relative" htmlFor={student.studentId.nis + "tidiness"}>
                                                                <input
                                                                    type="checkbox"
                                                                    checked={!!student.violations.tidiness}
                                                                    onChange={() => handleViolationsChange(student.studentId.nis, "tidiness")}
                                                                    className="peer h-4 w-4 cursor-pointer transition-all appearance-none rounded shadow hover:shadow-md border border-slate-300 checked:bg-primary checked:border-primary"
                                                                    id={student.studentId.nis + "tidiness"}
                                                                    disabled={student.status === "Sakit" || student.status === "Izin" || student.status === "Tanpa Keterangan"}
                                                                />
                                                                <span className="absolute text-white opacity-0 peer-checked:opacity-100 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                                                                    <SquareCheck />
                                                                </span>
                                                            </label>
                                                            <label className="cursor-pointer text-sm" htmlFor={student.studentId.nis + "tidiness"}>
                                                                Kerapihan
                                                            </label>
                                                        </div>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            {state.isTeachingGroupYearActivated === true && state.studentList.length !== 0 && (
                <div className="flex justify-between items-center">
                    <div className='flex gap-2'>
                        <button
                            onClick={() => applyBulkStatus('Sakit')}
                            className="btn-mobile-secondary-outline"
                            disabled={state.studentList.filter(student => student.isSelected === true).length === 0}
                        >
                            Sakit
                        </button>
                        <button
                            onClick={() => applyBulkStatus('Izin')}
                            className="btn-mobile-danger-outline"
                            disabled={state.studentList.filter(student => student.isSelected === true).length === 0}
                        >
                            Izin
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AttendedStudents;