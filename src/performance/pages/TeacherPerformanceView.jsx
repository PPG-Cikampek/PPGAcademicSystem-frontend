import React, { useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import DatePicker, { registerLocale } from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import idID from "date-fns/locale/id";

import useHttp from '../../shared/hooks/http-hook';
import { AuthContext } from '../../shared/Components/Context/auth-context';

import LoadingCircle from '../../shared/Components/UIElements/LoadingCircle';

import PieChart from '../components/PieChart';
import { academicYearFormatter } from '../../shared/Utilities/academicYearFormatter';
import { getMonday } from '../../shared/Utilities/getMonday';
import DataTable from '../../shared/Components/UIElements/DataTable';
import StudentInitial from '../../shared/Components/UIElements/StudentInitial';
import StudentReportView from '../../students/pages/StudentReportView';

const TeacherPerformanceView = () => {
    const navigate = useNavigate();

    const { isLoading, error, sendRequest, setError } = useHttp();

    const initialFilterState = {
        selectedAcademicYear: '',
        startDate: null,
        endDate: null,
        period: null,
        selectedClass: ''
    };

    // Academic years list (static data)
    const [academicYearsList, setAcademicYearsList] = useState();

    // Filter state - for user selections (doesn't trigger data fetches)
    const [filterState, setFilterState] = useState({
        selectedAcademicYear: null,
        startDate: null,
        endDate: null,
        period: null,
        selectedClass: null
    });

    // Display state - for currently shown data (only updates when filters are applied)
    const [displayState, setDisplayState] = useState({
        attendanceData: null,
        overallAttendances: null,
        violationData: null,
        appliedFilters: null, // Keep track of which filters were used for the current data
        classData: null,
        studentsData: null
    });

    // Dropdown options lists
    const [classesList, setClassesList] = useState();

    const auth = useContext(AuthContext);

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
        const url = `${import.meta.env.VITE_BACKEND_URL}/attendances/overview/`;
        const body = JSON.stringify({
            academicYearId: filterState.selectedAcademicYear,
            branchId: auth.userBranchId,
            subBranchId: auth.userSubBranchId,
            classId: filterState.selectedClass,
            teacherClassIds: auth.userClassIds, // Use all classes the user has access to
            startDate: filterState.startDate ? filterState.startDate.toISOString() : null,
            endDate: filterState.endDate ? filterState.endDate.toISOString() : null,
        });

        try {
            const responseData = await sendRequest(url, 'POST', body, {
                'Content-Type': 'application/json',
            });
            console.log(responseData)

            const { overallStats, violationStats, ...cardsData } = responseData

            // Update display state with new data and record applied filters
            setDisplayState({
                attendanceData: cardsData,
                overallAttendances: responseData.overallStats,
                violationData: responseData.violationStats,
                appliedFilters: { ...filterState }, // Snapshot of current filters
                studentsData: responseData.studentsData
            });
        } catch (err) { }
    }, [sendRequest, filterState]);

    // compute maxDate only once per render to avoid repeated getMonday calls
    const maxDate = useMemo(() => {
        const m = getMonday(new Date());
        const end = new Date(m);
        end.setDate(m.getDate() + 6);
        return end;
    }, []);

    useEffect(() => {
        registerLocale("id-ID", idID);
        fetchAcademicYears();
    }, [fetchAcademicYears]);

    const fetchClassesList = useCallback(async () => {
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
    }, [sendRequest, auth.userClassIds]);


    const selectAcademicYearHandler = useCallback((academicYearId) => {
        setFilterState(prev => ({
            ...prev,
            selectedAcademicYear: academicYearId,
            selectedClass: null
        }));

        // Batch clear display state to a single update
        setDisplayState({
            attendanceData: null,
            overallAttendances: null,
            violationData: null,
            appliedFilters: null,
            classData: null,
            studentsData: null
        });

        setClassesList([]);

        if (academicYearId !== '') {
            fetchClassesList();
        }
    }, [fetchClassesList]);


    const selectClassHandler = useCallback((classId) => {
        setFilterState(prev => ({
            ...prev,
            selectedClass: classId
        }));

        // Batch clear
        setDisplayState({
            attendanceData: null,
            overallAttendances: null,
            violationData: null,
            appliedFilters: null,
            classData: null,
            studentsData: null
        });
    }, []);

    const selectDateRangeHandler = useCallback((dates) => {
        let startingWeek = null;
        let endOfWeek = null;
        let period = null;

        if (dates) {
            startingWeek = getMonday(dates);
            endOfWeek = new Date(startingWeek);
            endOfWeek.setDate(startingWeek.getDate() + 6);

            console.log(startingWeek)
            console.log(endOfWeek)

            period = startingWeek.toLocaleDateString('id-ID', {
                day: '2-digit',
                timeZone: 'Asia/Jakarta'
            }) + " - " +
                endOfWeek.toLocaleDateString('id-ID', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric',
                    timeZone: 'Asia/Jakarta'
                });
        }

        console.log(period)

        setFilterState(prev => ({
            ...prev,
            startDate: startingWeek,
            endDate: endOfWeek,
            period: period
        }));

        setDisplayState({
            attendanceData: null,
            overallAttendances: null,
            violationData: null,
            appliedFilters: null,
            classData: null,
            studentsData: null
        });
    }, []);

    const handleApplyFilter = useCallback(() => {
        if (!filterState.selectedAcademicYear) {
            alert('Silakan pilih tahun ajaran terlebih dahulu');
            return;
        }

        // Clear previous data while loading
        setDisplayState(prev => ({
            ...prev,
            attendanceData: null,
            overallAttendances: null,
            violationData: null
        }));

        fetchAttendanceData();
    }, [filterState.selectedAcademicYear, fetchAttendanceData]);

    const handleResetFilter = useCallback(() => {
        // Reset filter selections to initial values
        setFilterState({ ...initialFilterState });

        // Clear displayed data in one shot
        setDisplayState({
            attendanceData: null,
            overallAttendances: null,
            violationData: null,
            appliedFilters: null,
            classData: null,
            studentsData: null
        });

        // Clear dependent lists
        setClassesList([]);
    }, []);

    // Memoized values to prevent unnecessary re-renders
    const memoizedOverallAttendances = useMemo(() => {
        return displayState.overallAttendances;
    }, [displayState.overallAttendances]);

    const memoizedViolationData = useMemo(() => {
        return displayState.violationData;
    }, [displayState.violationData]);

    // Memoize columns to keep stable reference unless relevant filterState changes
    const studentColumns = useMemo(() => [
        {
            key: 'image',
            label: '',
            sortable: false,
            render: (student) => (
                student.thumbnail ? (
                    <img
                        src={student.thumbnail ? student.thumbnail : `${import.meta.env.VITE_BACKEND_URL}/${student.image}`}
                        alt={student.name}
                        className="size-10 rounded-full m-auto shrink-0 border border-gray-200 bg-white"
                    />
                ) : (
                    <StudentInitial
                        studentName={student.name}
                        clsName={`size-10 shrink-0 rounded-full bg-blue-200 text-blue-500 flex items-center justify-center font-medium m-auto`}
                    />
                )
            )
        },
        {
            key: 'name',
            label: 'Nama',
            sortable: true,
        },
        {
            key: 'nis',
            label: 'NIS',
            sortable: true,
        },
        {
            key: 'present',
            label: 'Hadir',
            sortable: true,
            cellAlign: 'center',
            headerAlign: 'center',
            render: (student) => (
                <div className="badge-green w-12 place-self-center">
                    {student.attendances.Hadir}%
                </div>
            )
        },
        {
            key: 'late',
            label: 'Terlambat',
            sortable: true,
            cellAlign: 'center',
            headerAlign: 'center',
            render: (student) => (
                <div className="badge-primary w-12 place-self-center">
                    {student.attendances.Terlambat}%
                </div>
            )

        },
        {
            key: 'permission',
            label: 'Izin',
            sortable: true,
            cellAlign: 'center',
            headerAlign: 'center',
            render: (student) => (
                <div className="badge-yellow w-12 place-self-center">
                    {student.attendances.Izin}%
                </div>
            )
        },
        {
            key: 'sick',
            label: 'Sakit',
            sortable: true,
            cellAlign: 'center',
            headerAlign: 'center',
            render: (student) => (
                <div className="badge-violet w-12 place-self-center">
                    {student.attendances.Sakit}%
                </div>
            )
        },
        {
            key: 'absent',
            label: 'Alpha',
            sortable: true,
            cellAlign: 'center',
            headerAlign: 'center',
            render: (student) => (
                <div className="badge-red w-12 place-self-center">
                    {student.attendances["Tanpa Keterangan"]}%
                </div>
            )
        },
        {
            key: 'actions',
            label: 'Aksi',
            headerAlign: 'center',
            render: (student) => (
                <div className='place-self-center'>
                    {filterState.selectedAcademicYear && (student.id || student._id) ? (
                        <StudentReportView
                            academicYearId={filterState.selectedAcademicYear}
                            studentId={student.id || student._id}
                            startDate={filterState.startDate}
                            endDate={filterState.endDate}
                            noCard={true}
                        />
                    ) : (
                        <span className="text-gray-400 text-sm">Pilih tahun ajaran</span>
                    )}
                </div>
            )
        }
    ], [filterState.selectedAcademicYear, filterState.startDate, filterState.endDate]);


    return (
        <div className="min-h-screen bg-gray-50 px-4 py-8 md:p-8">
            <main className="max-w-6xl mx-auto mb-24">

                {academicYearsList && (
                    <div className="card-basic rounded-md flex-col gap-4">

                        <div className="flex flex-col md:flex-row justify-between gap-4">

                            <div className="flex flex-col gap-5">

                                <div className="flex flex-row gap-4 items-center">
                                    <div className='flex flex-col gap-[18px] items-start'>
                                        <div>Tahun Ajaran</div>
                                        <div>Periode</div>
                                        <div>Kelas</div>
                                    </div>
                                    <div className='flex flex-col gap-2'>
                                        <select
                                            value={filterState.selectedAcademicYear ? filterState.selectedAcademicYear : ''}
                                            onChange={(e) => selectAcademicYearHandler(e.target.value)}
                                            className="border border-gray-400 px-2 py-1 rounded-full active:ring-2 active:ring-blue-300"
                                            disabled={false}
                                        >
                                            {!filterState.selectedAcademicYear && <option value={''}>Pilih</option>}
                                            {academicYearsList && academicYearsList.map((academicYear, index) => (
                                                <option key={index} value={academicYear._id}>
                                                    {academicYearFormatter(academicYear.name)}
                                                </option>
                                            ))}
                                        </select>
                                        <DatePicker
                                            dateFormat="dd/MM/yyyy"
                                            maxDate={maxDate}
                                            selected={filterState.startDate}
                                            onChange={selectDateRangeHandler}
                                            startDate={filterState.startDate}
                                            endDate={filterState.endDate}
                                            value={filterState.period}
                                            locale={'id-ID'}
                                            showWeekPicker
                                            isClearable
                                            withPortal={window.innerWidth <= 768}
                                            className={`${filterState.selectedAcademicYear && 'pr-8'} border border-gray-400 px-2 py-1 rounded-full active:ring-2 active:ring-blue-300 ${filterState.selectedAcademicYear ? '' : 'opacity-50 cursor-not-allowed'}`}
                                            disabled={!filterState.selectedAcademicYear}
                                            placeholderText={`${filterState.selectedAcademicYear ? 'Pilih Periode' : 'Pilih Tahun Ajaran'}`}
                                            onFocus={(e) => e.target.readOnly = true}
                                        />
                                        <select
                                            value={filterState.selectedClass ? filterState.selectedClass : ''}
                                            onChange={(e) => selectClassHandler(e.target.value)}
                                            className={`border border-gray-400 px-2 py-1 rounded-full active:ring-2 active:ring-blue-300 ${filterState.selectedAcademicYear ? '' : 'opacity-50 cursor-not-allowed'}`}
                                            disabled={!filterState.selectedAcademicYear}
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

                                <div className="flex justify-center mt-4 gap-2">
                                    <button
                                        onClick={handleApplyFilter}
                                        disabled={!filterState.selectedAcademicYear || !filterState.period || isLoading}
                                        className="btn-mobile-primary-round-gray"
                                    >
                                        {isLoading ? <LoadingCircle size={16} /> : 'Tampilkan'}
                                    </button>

                                    <button
                                        onClick={handleResetFilter}
                                        disabled={isLoading}
                                        className="btn-danger-outline rounded-full"
                                    >
                                        Reset Filter
                                    </button>
                                </div>

                                <div className="self-start flex flex-row gap-2">
                                    {/* Left Column: Violation Names */}
                                    <div className="flex flex-col gap-1">
                                        {memoizedViolationData && !isLoading && filterState.selectedAcademicYear && memoizedViolationData.map(({ violation }, index) => (
                                            <div key={index} className="">
                                                {violationTranslations[violation] || violation}
                                            </div>
                                        ))}
                                    </div>

                                    {/* Right Column: Case Counts */}
                                    <div className="flex flex-col gap-1 ">
                                        {memoizedViolationData && !isLoading && filterState.selectedAcademicYear && memoizedViolationData.map(({ count }, index) => (
                                            <div key={index} className="font-bold">
                                                : {count} Temuan
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            {(!academicYearsList || isLoading) && displayState.attendanceData !== null && (
                                <div className="place-self-center justify-self-center self-center mx-auto">
                                    <LoadingCircle size={32} />
                                </div>
                            )}
                            {memoizedOverallAttendances && !isLoading && filterState.selectedAcademicYear && (
                                <div className=''>
                                    <PieChart attendanceData={memoizedOverallAttendances} />
                                </div>
                            )}
                        </div>
                    </div>

                )}
                {displayState.violationData && !isLoading && filterState.selectedAcademicYear && (
                    <DataTable
                        data={displayState.studentsData}
                        columns={studentColumns}
                        searchableColumns={['name']}
                        initialSort={{ key: 'name', direction: 'ascending' }}
                        initialEntriesPerPage={50}
                        config={{
                            showFilter: false,
                            showSearch: false,
                            showTopEntries: false,
                            showBottomEntries: false,
                            showPagination: false,
                            entriesOptions: [10, 20, 30]
                        }}
                    />
                )}
            </main>
        </div>
    );
};

export default TeacherPerformanceView;