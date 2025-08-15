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

const PerformanceView = () => {

    const { isLoading, error, sendRequest, setError } = useHttp();

    const initialFilterState = {
        selectedAcademicYear: '',
        startDate: null,
        endDate: null,
        periode: null,
        selectedBranch: '',
        selectedSubBranch: '',
        selectedClass: ''
    };

    // Academic years list (static data)
    const [academicYearsList, setAcademicYearsList] = useState();

    // Filter state - for user selections (doesn't trigger data fetches)
    const [filterState, setFilterState] = useState({
        selectedAcademicYear: null,
        startDate: null,
        endDate: null,
        periode: null,
        selectedBranch: null,
        selectedSubBranch: null,
        selectedClass: null
    });

    // Display state - for currently shown data (only updates when "Tampilkan" is clicked)
    const [displayState, setDisplayState] = useState({
        attendanceData: null,
        overallAttendances: null,
        violationData: null,
        appliedFilters: null // Keep track of which filters were used for the current data
    });

    // Dropdown options lists
    const [branchesList, setBranchesList] = useState();
    const [subBranchesList, setSubBranchesList] = useState();
    const [classesList, setClassesList] = useState();

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
        const url = `${import.meta.env.VITE_BACKEND_URL}/attendances/overview/`;
        const body = JSON.stringify({
            academicYearId: filterState.selectedAcademicYear,
            branchId: filterState.selectedBranch,
            subBranchId: filterState.selectedSubBranch,
            classId: filterState.selectedClass,
            startDate: filterState.startDate ? filterState.startDate.toISOString() : null,
            endDate: filterState.endDate ? filterState.endDate.toISOString() : null,
        });

        console.log({
            academicYearId: filterState.selectedAcademicYear,
            branchId: filterState.selectedBranch,
            subBranchId: filterState.selectedSubBranch,
            classId: filterState.selectedClass,
            startDate: filterState.startDate ? filterState.startDate.toISOString() : null,
            endDate: filterState.endDate ? filterState.endDate.toISOString() : null,
        })

        try {
            const attendanceData = await sendRequest(url, 'POST', body, {
                'Content-Type': 'application/json',
            });

            console.log(attendanceData)

            const { overallStats, violationStats, ...cardsData } = attendanceData

            // Update display state with new data and record applied filters
            setDisplayState({
                attendanceData: cardsData,
                overallAttendances: attendanceData.overallStats,
                violationData: attendanceData.violationStats,
                appliedFilters: { ...filterState } // Snapshot of current filters
            });
        } catch (err) { }
    }, [sendRequest, filterState]);

    useEffect(() => {
        registerLocale("id-ID", idID);
        fetchAcademicYears();
    }, [fetchAcademicYears]);

    const selectAcademicYearHandler = useCallback((academicYearId) => {
        setFilterState(prev => ({
            ...prev,
            selectedAcademicYear: academicYearId,
            selectedBranch: null,
            selectedSubBranch: null,
            selectedClass: null
        }));

        setDisplayState(prev => ({
            ...prev,
            attendanceData: null,
            overallAttendances: null,
            violationData: null
        }));

        setBranchesList([]);
        setSubBranchesList([]);
        setClassesList([]);

        if (academicYearId !== '') {
            fetchBranches();
        }
    }, []);

    const fetchBranches = useCallback(async () => {
        console.log('fetching branches!')
        try {
            const responseData = await sendRequest(`${import.meta.env.VITE_BACKEND_URL}/levels/branches/`);
            setBranchesList(responseData.branches);
        } catch (err) { }
    }, [sendRequest]);

    const selectBranchHandler = useCallback((branchId) => {
        setFilterState(prev => ({
            ...prev,
            selectedBranch: branchId,
            selectedSubBranch: null,
            selectedClass: null
        }));

        setDisplayState(prev => ({
            ...prev,
            attendanceData: null,
            overallAttendances: null,
            violationData: null
        }));

        setSubBranchesList([]);
        setClassesList([]);

        if (branchId !== '') {
            fetchSubBranchesList(branchId);
        }
    }, []);

    const fetchSubBranchesList = useCallback(async (branchId) => {
        try {
            const responseData = await sendRequest(`${import.meta.env.VITE_BACKEND_URL}/levels/branches/${branchId}?populate=true`);
            setSubBranchesList(responseData.branch.subBranches);
        } catch (err) { }
    }, [sendRequest]);

    const selectSubBranchHandler = useCallback((subBranchId) => {
        setFilterState(prev => ({
            ...prev,
            selectedSubBranch: subBranchId,
            selectedClass: null
        }));

        setDisplayState(prev => ({
            ...prev,
            attendanceData: null,
            overallAttendances: null,
            violationData: null
        }));

        setClassesList([]);

        if (subBranchId !== '') {
            fetchClassesList(subBranchId);
        }
    }, []);

    const fetchClassesList = useCallback(async (subBranchId) => {
        const url = `${import.meta.env.VITE_BACKEND_URL}/classes/sub-branch/${subBranchId}/academic-year/${filterState.selectedAcademicYear}`;
        try {
            const responseData = await sendRequest(url);
            setClassesList(responseData.subBranchYear.classes);
        } catch (err) { }
    }, [sendRequest, filterState.selectedAcademicYear]);

    const selectClassHandler = useCallback((classId) => {
        setFilterState(prev => ({
            ...prev,
            selectedClass: classId
        }));
    }, []);

    const selectDateRangeHandler = useCallback((dates) => {
        const [start, end] = dates;
        let periode = null;

        if (start && end) {
            periode = start.toLocaleDateString('id-ID', {
                day: '2-digit',
                timeZone: 'Asia/Jakarta'
            }) + " - " +
                end.toLocaleDateString('id-ID', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric',
                    timeZone: 'Asia/Jakarta'
                });
        }

        setFilterState(prev => ({
            ...prev,
            startDate: start,
            endDate: end,
            periode: periode
        }));

        setDisplayState(prev => ({
            ...prev,
            attendanceData: null,
            overallAttendances: null,
            violationData: null
        }));
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

        // Clear displayed data
        setDisplayState({
            attendanceData: null,
            overallAttendances: null,
            violationData: null,
            appliedFilters: null
        });

        // Clear dependent lists
        setBranchesList([]);
        setSubBranchesList([]);
        setClassesList([]);
    }, []);

    // Memoized values to prevent unnecessary re-renders
    const memoizedOverallAttendances = useMemo(() => {
        return displayState.overallAttendances;
    }, [displayState.overallAttendances]);

    const memoizedViolationData = useMemo(() => {
        return displayState.violationData;
    }, [displayState.violationData]);

    return (
        <div className="min-h-screen bg-gray-50 px-4 py-8 md:p-8">
            <main className="max-w-6xl mx-auto">

                {academicYearsList && (
                    <div className="card-basic rounded-md flex-col gap-4">

                        <div className="flex justify-between">
                            <div className={`flex flex-col`}>
                                <h2 className="text-xl font-bold">Daerah Cikampek</h2>
                                {/* <p className="text-sm text-gray-600">
                          Target Semester: {subBranchData.semesterTarget} hari
                      </p> */}
                            </div>
                        </div>

                        <div className="flex flex-col md:flex-row justify-between gap-4">

                            <div className="flex flex-col gap-5 items-start">
                                <div className="flex flex-row gap-4 items-center">
                                    <div className='flex flex-col gap-[18px]'>
                                        <div>Tahun Ajaran</div>
                                        <div>Periode</div>
                                        <div>Desa</div>
                                        <div>Kelompok</div>
                                        <div>Kelas</div>
                                    </div>
                                    <div className='flex flex-col gap-2 '>
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
                                            selected={filterState.startDate}
                                            onChange={selectDateRangeHandler}
                                            maxDate={new Date(getMonday(new Date()).setDate(getMonday(new Date()).getDate() + 6))}
                                            startDate={filterState.startDate}
                                            endDate={filterState.endDate}
                                            locale={'id-ID'}
                                            isClearable
                                            selectsRange
                                            withPortal={window.innerWidth <= 768}
                                            className={`${filterState.selectedAcademicYear && 'pr-8'} border border-gray-400 px-2 py-1 rounded-full active:ring-2 active:ring-blue-300`}
                                            disabled={!filterState.selectedAcademicYear}
                                            placeholderText={`${filterState.selectedAcademicYear ? 'Masukkan Periode' : 'Pilih Tahun Ajaran'}`}
                                            onFocus={(e) => e.target.readOnly = true}
                                        />
                                        <select
                                            value={filterState.selectedBranch ? filterState.selectedBranch : ''}
                                            onChange={(e) => selectBranchHandler(e.target.value)}
                                            className="border border-gray-400 px-2 py-1 rounded-full active:ring-2 active:ring-blue-300"
                                            disabled={!filterState.selectedAcademicYear}
                                        >
                                            <option value={''}>Semua</option>
                                            {branchesList && branchesList.map((branch, index) => (
                                                <option key={index} value={branch._id}>
                                                    {branch.name}
                                                </option>
                                            ))}
                                        </select>
                                        <select
                                            value={filterState.selectedSubBranch ? filterState.selectedSubBranch : ''}
                                            onChange={(e) => selectSubBranchHandler(e.target.value)}
                                            className="border border-gray-400 px-2 py-1 rounded-full active:ring-2 active:ring-blue-300"
                                            disabled={!filterState.selectedBranch}
                                        >
                                            <option value={''}>Semua</option>
                                            {subBranchesList && subBranchesList.map((subBranch, index) => (
                                                <option key={index} value={subBranch._id}>
                                                    {subBranch.name}
                                                </option>
                                            ))}
                                        </select>
                                        <select
                                            value={filterState.selectedClass ? filterState.selectedClass : ''}
                                            onChange={(e) => selectClassHandler(e.target.value)}
                                            className="border border-gray-400 px-2 py-1 rounded-full active:ring-2 active:ring-blue-300"
                                            disabled={!filterState.selectedSubBranch}
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
                                        disabled={!filterState.selectedAcademicYear || isLoading}
                                        className="btn-mobile-primary-round-gray"
                                    >
                                        {isLoading ? 'Memuat...' : 'Tampilkan'}
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
                            {(!academicYearsList || isLoading) && (
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

            </main>
        </div>
    );
};

export default PerformanceView;