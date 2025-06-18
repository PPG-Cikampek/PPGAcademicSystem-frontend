import React, { useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import DatePicker, { registerLocale } from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import idID from "date-fns/locale/id";

import useHttp from '../../shared/hooks/http-hook';
import { AuthContext } from '../../shared/Components/Context/auth-context';

import LoadingCircle from '../../shared/Components/UIElements/LoadingCircle';

import PieChart from '../components/PieChart';
import SubBranchAdminPerformanceCards from '../components/SubBranchAdminPerformanceCards';
import { academicYearFormatter } from '../../shared/Utilities/academicYearFormatter';
import { getMonday } from '../../shared/Utilities/getMonday';

const TeacherPerformanceView = () => {

    const { isLoading, error, sendRequest, setError } = useHttp();

    const [academicYearsList, setAcademicYearsList] = useState();
    const [selectedAcademicYear, setSelectedAcademicYear] = useState(null);

    const [classesList, setClassesList] = useState();
    const [selectedClass, setSelectedClass] = useState(null);

    const [attendanceData, setAttendanceData] = useState();
    const [overallAttendances, setOverallAttendances] = useState();
    const [violationData, setViolationData] = useState();

    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [periode, setPeriode] = useState(null);

    const auth = useContext(AuthContext);
    const navigate = useNavigate();

    const violationTranslations = {
        attribute: "Perlengkapan Belajar",
        attitude: "Sikap",
        tidiness: "Kerapihan",
    };

    const fetchAcademicYears = useCallback(async () => {
        try {
            const responseData = await sendRequest(`${import.meta.env.VITE_BACKEND_URL}/academicYears/?populate=subBranchYears`);
            setAcademicYearsList(responseData.academicYears);
        } catch (err) { }
    }, [sendRequest]);

    const fetchAttendanceData = useCallback(async () => {
        const getOverallStats = (data) => {
            const attendances = [];
            data.subBranchYears.forEach((year) => {
                year.classes.forEach((cls) => {
                    cls.attendances.forEach((att) => {
                        attendances.push(att.status);
                    });
                });
            });
            const statusCounts = attendances.reduce((acc, status) => {
                acc[status] = (acc[status] || 0) + 1;
                return acc;
            }, {});
            const total = attendances.length;
            return Object.keys(statusCounts).map((status) => ({
                status,
                count: statusCounts[status],
                percentage: Math.round((statusCounts[status] / total) * 100 * 100) / 100,
            })).sort((a, b) => a.status.localeCompare(b.status));
        };

        const getViolationStats = (data) => {
            const violationCounts = {};
            data.subBranchYears.forEach((groupYear) => {
                groupYear.classes.forEach((cls) => {
                    cls.attendances.forEach((attendance) => {
                        Object.entries(attendance.violations).forEach(([violation, occurred]) => {
                            if (occurred) {
                                violationCounts[violation] = (violationCounts[violation] || 0) + 1;
                            }
                        });
                    });
                });
            });

            return Object.entries(violationCounts).map(([violation, count]) => ({ violation, count }));
        };

        const url = `${import.meta.env.VITE_BACKEND_URL}/attendances/reports/`;
        const body = JSON.stringify({
            academicYearId: selectedAcademicYear,
            branchId: auth.userBranchId,
            subBranchId: auth.userSubBranchId,
            classId: selectedClass,
            startDate: startDate ? startDate.toISOString() : null,
            endDate: endDate ? endDate.toISOString() : null,
        });

        try {
            const responseData = await sendRequest(url, 'POST', body, {
                'Content-Type': 'application/json',
            });
            console.log(responseData)

            let updatedData = {}
            updatedData.subBranchYears = responseData.subBranchYears.map(year => {
                // Keep only the classes with IDs in the classIdsToKeep array
                year.classes = year.classes.filter(cls => auth.userClassIds.includes(cls._id));
                return year;
            });

            const { overallStats, violationStats, ...cardsData } = responseData

            setOverallAttendances(null)
            setViolationData(null)
            setAttendanceData(cardsData);
            setOverallAttendances(responseData.overallStats);
            setViolationData(responseData.violationStats);
        } catch (err) { }
    }, [sendRequest, selectedAcademicYear, selectedClass, startDate, endDate]);

    useEffect(() => {
        registerLocale("id-ID", idID);
        fetchAcademicYears();
        fetchAttendanceData();
    }, [fetchAcademicYears, fetchAttendanceData]);

    const selectAcademicYearHandler = (academicYearId) => {
        setOverallAttendances(null)
        setViolationData(null)
        setAttendanceData(null)
        setSelectedAcademicYear(academicYearId);
        setClassesList([]);
        setSelectedClass(null);
        setStartDate(null);
        setEndDate(null);

        if (academicYearId !== '') {
            fetchClassesList();
        }
    };

    const fetchClassesList = async () => {
        const url = `${import.meta.env.VITE_BACKEND_URL}/classes/get-by-ids`
        const body = JSON.stringify({ classIds: auth.userClassIds })
        console.log(body)

        try {
            const responseData = await sendRequest(url, 'POST', body, {
                'Content-Type': 'application/json'
            })
            setClassesList(responseData.classes)
            console.log(responseData.classes)
        } catch (err) { }
    };

    const selectClassHandler = (classId) => {
        setOverallAttendances(null)
        setViolationData(null)
        setAttendanceData(null)
        setSelectedClass(classId);
    };

    const selectDateRangeHandler = (dates) => {
        setOverallAttendances(null)
        setViolationData(null)
        setAttendanceData(null)
        let startingWeek = null;
        let endOfWeek = null;

        if (dates) {
            startingWeek = getMonday(dates);
            endOfWeek = new Date(startingWeek);
            endOfWeek.setDate(startingWeek.getDate() + 6);

            console.log(startingWeek)
            console.log(endOfWeek)

            setPeriode(startingWeek.toLocaleDateString('id-ID', {
                day: '2-digit',
                timeZone: 'Asia/Jakarta'
            }) + " - " +
                endOfWeek.toLocaleDateString('id-ID', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric',
                    timeZone: 'Asia/Jakarta'
                }))
        }
        setStartDate(startingWeek)
        setEndDate(endOfWeek);
    };

    return (
        <div className="min-h-screen bg-gray-50 px-4 py-8 md:p-8">
            <main className="max-w-6xl mx-auto">
                {(!academicYearsList || isLoading) && (
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex justify-center items-center w-full h-dvh">
                        <LoadingCircle size={32} />
                    </div>
                )}
                {academicYearsList && (
                    <div className="card-basic rounded-md flex-col gap-4">

                        <div className="flex justify-between">
                            {/* {subBranchData && (
                                <div className={`flex flex-col`}>
                                    <h2 className="text-xl font-bold">Kelompok {subBranchData.subBranchName}</h2>
                                    <p className="text-sm text-gray-600">
                                        Target Semester: {subBranchData.semesterTarget} hari
                                    </p>
                                </div>
                            )} */}
                        </div>

                        <div className="flex flex-col md:flex-row justify-between gap-4">

                            <div className="flex flex-col gap-5">

                                <div className="flex flex-row gap-4 items-center">
                                    <div className='flex flex-col gap-[18px]'>
                                        <div>Tahun Ajaran</div>
                                        <div>Periode</div>
                                        <div>Kelas</div>
                                    </div>
                                    <div className='flex flex-col gap-2'>
                                        <select
                                            value={selectedAcademicYear ? selectedAcademicYear : ''}
                                            onChange={(e) => selectAcademicYearHandler(e.target.value)}
                                            className="border border-gray-400 px-2 py-1 rounded-full active:ring-2 active:ring-blue-300"
                                            disabled={false}
                                        >
                                            {!selectedAcademicYear && <option value={''}>Pilih</option>}
                                            {academicYearsList && academicYearsList.map((academicYear, index) => (
                                                <option key={index} value={academicYear._id}>
                                                    {academicYearFormatter(academicYear.name)}
                                                </option>
                                            ))}
                                        </select>
                                        <DatePicker
                                            dateFormat="dd/MM/yyyy"
                                            maxDate={new Date(getMonday(new Date()).setDate(getMonday(new Date()).getDate() + 6))}
                                            selected={startDate}
                                            onChange={selectDateRangeHandler}
                                            startDate={startDate}
                                            endDate={endDate}
                                            locale={'id-ID'}
                                            showWeekPicker
                                            isClearable
                                            withPortal={window.innerWidth <= 768}
                                            className={`${selectedAcademicYear && 'pr-8'} border border-gray-400 px-2 py-1 rounded-full active:ring-2 active:ring-blue-300`}
                                            disabled={!selectedAcademicYear}
                                            placeholderText={`${selectedAcademicYear ? 'Semua' : 'Pilih Tahun Ajaran'}`}
                                            onFocus={(e) => e.target.readOnly = true}
                                        />
                                        <select
                                            value={selectedClass ? selectedClass : ''}
                                            onChange={(e) => selectClassHandler(e.target.value)}
                                            className="border border-gray-400 px-2 py-1 rounded-full active:ring-2 active:ring-blue-300"
                                        >
                                            <option value={''}>Semua</option>
                                            {classesList && classesList.map((cls, index) => (
                                                <option key={index} value={cls._id}>
                                                    {cls.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                </div>

                                <div className="self-start flex flex-row gap-2">
                                    {/* Left Column: Violation Names */}
                                    <div className="flex flex-col gap-1">
                                        {violationData && !isLoading && selectedAcademicYear && violationData.map(({ violation }, index) => (
                                            <div key={index} className="">
                                                {violationTranslations[violation] || violation}
                                            </div>
                                        ))}
                                    </div>

                                    {/* Right Column: Case Counts */}
                                    <div className="flex flex-col gap-1 ">
                                        {violationData && !isLoading && selectedAcademicYear && violationData.map(({ count }, index) => (
                                            <div key={index} className="font-bold">
                                                : {count} Temuan
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            {overallAttendances && !isLoading && selectedAcademicYear && (
                                <div className=''>
                                    <PieChart attendanceData={overallAttendances} />
                                </div>
                            )}
                        </div>
                    </div>

                )}
                {violationData && attendanceData && !isLoading && selectedAcademicYear && (
                    <SubBranchAdminPerformanceCards data={attendanceData} violationData={violationData} initialView={'classes'} month={periode} />
                )}
            </main>
        </div>
    );
};

export default TeacherPerformanceView;