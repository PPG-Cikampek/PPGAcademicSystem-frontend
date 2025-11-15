import { useState, useEffect, useCallback, useMemo } from "react";

import DatePicker, { registerLocale } from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import idID from "date-fns/locale/id";

import useHttp from "../../shared/hooks/http-hook";

import LoadingCircle from "../../shared/Components/UIElements/LoadingCircle";

import PieChart from "../components/PieChart";
import BranchesPerformanceTable from "../components/BranchesPerformanceTable";
import { academicYearFormatter } from "../../shared/Utilities/academicYearFormatter";
import { getMonday } from "../../shared/Utilities/getMonday";
import {
    hasUnappliedFilters as hasUnappliedFiltersHelper,
    hasFiltersChanged as hasFiltersChangedHelper,
} from "../utilities/filterHelpers";
import TeachingGroupsPerformanceTable from "../components/TeachingGroupsPerformanceTable";
import SubBranchesPerformanceTable from "../components/SubBranchesPerformanceTable";
import ClassesPerformanceTable from "../components/ClassesPerformanceTable";
import StudentsPerformanceTable from "../components/StudentsPerformanceTable";

const PerformanceView = () => {
    const { isLoading, error, sendRequest, setError } = useHttp();

    const initialFilterState = {
        selectedAcademicYear: null,
        startDate: null,
        endDate: null,
        periode: null,
        selectedBranch: null,
        selectedSubBranch: null,
        selectedClass: null,
        selectedBranchYear: null,
        selectedTeachingGroup: null,
        currentView: "branchesTable",
    };

    // Academic years list (static data)
    const [academicYearsList, setAcademicYearsList] = useState();

    // Filter state - for user selections (doesn't trigger data fetches)
    const [filterState, setFilterState] = useState(initialFilterState);

    // Display state - for currently shown data (only updates when "Tampilkan" is clicked)
    const [displayState, setDisplayState] = useState({
        attendanceData: null,
        overallAttendances: null,
        violationData: null,
        appliedFilters: null, // Keep track of which filters were used for the current data
    });

    // Dropdown options lists
    const [branchesList, setBranchesList] = useState();
    const [teachingGroupsList, setTeachingGroupsList] = useState();
    const [subBranchesList, setSubBranchesList] = useState();
    const [classesList, setClassesList] = useState();

    const violationTranslations = {
        attribute: "Perlengkapan Belajar",
        attitude: "Sikap",
        tidiness: "Kerapihan",
    };

    const fetchAcademicYears = useCallback(async () => {
        try {
            const responseData = await sendRequest(
                `${
                    import.meta.env.VITE_BACKEND_URL
                }/academicYears/?populate=subBranchYears`
            );
            setAcademicYearsList(responseData.academicYears);
        } catch (err) {}
    }, [sendRequest]);

    const fetchAttendanceData = useCallback(async () => {
        const url = `${import.meta.env.VITE_BACKEND_URL}/attendances/overview/`;
        const body = JSON.stringify({
            academicYearId: filterState.selectedAcademicYear,
            // branchYearId: filterState.selectedBranchYear,
            branchId: filterState.selectedBranch,
            teachingGroupId: filterState.selectedTeachingGroup,
            subBranchId: filterState.selectedSubBranch,
            classId: filterState.selectedClass,
            startDate: filterState.startDate
                ? filterState.startDate.toISOString()
                : null,
            endDate: filterState.endDate
                ? filterState.endDate.toISOString()
                : null,
        });

        console.log({
            academicYearId: filterState.selectedAcademicYear,
            branchId: filterState.selectedBranch,
            subBranchId: filterState.selectedSubBranch,
            classId: filterState.selectedClass,
            startDate: filterState.startDate
                ? filterState.startDate.toISOString()
                : null,
            endDate: filterState.endDate
                ? filterState.endDate.toISOString()
                : null,
        });

        try {
            const attendanceData = await sendRequest(url, "POST", body, {
                "Content-Type": "application/json",
            });

            console.log(attendanceData);

            const { overallStats, violationStats, ...cardsData } =
                attendanceData;

            // Update display state with new data and record applied filters
            setDisplayState({
                attendanceData: cardsData,
                overallAttendances: attendanceData.overallStats,
                violationData: attendanceData.violationStats,
                appliedFilters: { ...filterState }, // Snapshot of current filters
            });
        } catch (err) {}
    }, [sendRequest, filterState]);

    useEffect(() => {
        registerLocale("id-ID", idID);
        fetchAcademicYears();
    }, [fetchAcademicYears]);

    const selectAcademicYearHandler = useCallback((academicYearId) => {
        setFilterState((prev) => ({
            ...prev,
            selectedAcademicYear: academicYearId,
            selectedBranch: null,
            selectedSubBranch: null,
            selectedClass: null,
            selectedBranchYear: null,
            selectedTeachingGroup: null,
            currentView: "branchesTable",
        }));

        setDisplayState((prev) => ({
            ...prev,
            attendanceData: null,
            overallAttendances: null,
            violationData: null,
        }));

        setBranchesList([]);
        setTeachingGroupsList([]);
        setSubBranchesList([]);
        setClassesList([]);

        if (academicYearId !== "") {
            fetchBranches();
        }
    }, []);

    const fetchBranches = useCallback(async () => {
        console.log("fetching branches!");
        try {
            const responseData = await sendRequest(
                `${import.meta.env.VITE_BACKEND_URL}/levels/branches/`
            );
            setBranchesList(responseData.branches);
        } catch (err) {}
    }, [sendRequest]);

    const fetchTeachingGroups = useCallback(
        async (branchYearId) => {
            if (!branchYearId) {
                setTeachingGroupsList([]);
                return;
            }

            try {
                const responseData = await sendRequest(
                    `${import.meta.env.VITE_BACKEND_URL}/branchYears/${branchYearId}/teaching-groups`
                );
                setTeachingGroupsList(responseData?.teachingGroups || []);
            } catch (err) {}
        },
        [sendRequest]
    );

    const fetchBranchYearForBranch = useCallback(
        async (branchId, academicYearId) => {
            if (!branchId || !academicYearId) {
                return null;
            }

            try {
                const responseData = await sendRequest(
                    `${import.meta.env.VITE_BACKEND_URL}/branchYears/branch/${branchId}`
                );
                const branchYearsRaw = responseData?.branchYears;
                const branchYears = Array.isArray(branchYearsRaw)
                    ? branchYearsRaw
                    : Array.isArray(branchYearsRaw?.branchYears)
                    ? branchYearsRaw.branchYears
                    : [];

                const matchingBranchYear = branchYears.find((branchYear) => {
                    const academicYear = branchYear?.academicYearId;
                    if (!academicYear) {
                        return false;
                    }

                    if (typeof academicYear === "string") {
                        return academicYear === academicYearId;
                    }

                    if (academicYear?._id) {
                        return academicYear._id === academicYearId;
                    }

                    return false;
                });

                return (
                    matchingBranchYear?._id || matchingBranchYear?.id || null
                );
            } catch (err) {
                return null;
            }
        },
        [sendRequest]
    );

    const fetchSubBranchesList = useCallback(
        async (teachingGroupId) => {
            if (!teachingGroupId) {
                setSubBranchesList([]);
                return;
            }

            try {
                const responseData = await sendRequest(
                    `${
                        import.meta.env.VITE_BACKEND_URL
                    }/levels/teaching-groups/${teachingGroupId}/sub-branches`
                );
                setSubBranchesList(responseData?.subBranches || []);
            } catch (err) {}
        },
        [sendRequest]
    );

    const fetchClassesList = useCallback(
        async (subBranchId) => {
            if (!subBranchId || !filterState.selectedAcademicYear) {
                setClassesList([]);
                return;
            }

            const url = `${
                import.meta.env.VITE_BACKEND_URL
            }/classes/sub-branch/${subBranchId}/academic-year/${
                filterState.selectedAcademicYear
            }`;
            try {
                const responseData = await sendRequest(url);
                setClassesList(responseData?.subBranchYear?.classes || []);
            } catch (err) {}
        },
        [sendRequest, filterState.selectedAcademicYear]
    );

    const selectBranchHandler = useCallback(
        (branchId) => {
            const academicYearId = filterState.selectedAcademicYear;

            setFilterState((prev) => ({
                ...prev,
                selectedBranch: branchId,
                selectedSubBranch: null,
                selectedClass: null,
                selectedBranchYear: null,
                selectedTeachingGroup: null,
                currentView: "branchesTable",
            }));

            setDisplayState((prev) => ({
                ...prev,
                attendanceData: null,
                overallAttendances: null,
                violationData: null,
            }));

            setTeachingGroupsList([]);
            setSubBranchesList([]);
            setClassesList([]);

            if (!branchId || !academicYearId) {
                return;
            }

            (async () => {
                const branchYearId = await fetchBranchYearForBranch(
                    branchId,
                    academicYearId
                );

                let shouldLoadTeachingGroups = false;

                setFilterState((prev) => {
                    if (prev.selectedBranch !== branchId) {
                        return prev;
                    }

                    shouldLoadTeachingGroups = true;

                    return {
                        ...prev,
                        selectedBranchYear: branchYearId,
                    };
                });

                if (shouldLoadTeachingGroups) {
                    fetchTeachingGroups(branchYearId);
                }
            })();
        },
        [fetchBranchYearForBranch, fetchTeachingGroups, filterState.selectedAcademicYear]
    );

    const selectTeachingGroupHandler = useCallback(
        (teachingGroupId) => {
            setFilterState((prev) => ({
                ...prev,
                selectedTeachingGroup: teachingGroupId,
                selectedSubBranch: null,
                selectedClass: null,
                currentView: "teachingGroupsTable",
            }));

            setDisplayState((prev) => ({
                ...prev,
            }));

            setSubBranchesList([]);
            setClassesList([]);

            if (teachingGroupId !== "") {
                fetchSubBranchesList(teachingGroupId);
            }
        },
        [fetchSubBranchesList]
    );

    const selectSubBranchHandler = useCallback(
        (subBranchId) => {
            setFilterState((prev) => ({
                ...prev,
                selectedSubBranch: subBranchId,
                selectedClass: null,
            }));

            setDisplayState((prev) => ({
                ...prev,
                attendanceData: null,
                overallAttendances: null,
                violationData: null,
            }));

            setClassesList([]);

            if (subBranchId !== "") {
                fetchClassesList(subBranchId);
            }
        },
        [fetchClassesList]
    );

    const selectClassHandler = useCallback((classId) => {
        setFilterState((prev) => ({
            ...prev,
            selectedClass: classId,
        }));
    }, []);

    const selectDateRangeHandler = useCallback((dates) => {
        const [start, end] = dates;
        let periode = null;

        if (start && end) {
            periode =
                start.toLocaleDateString("id-ID", {
                    day: "2-digit",
                    timeZone: "Asia/Jakarta",
                }) +
                " - " +
                end.toLocaleDateString("id-ID", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                    timeZone: "Asia/Jakarta",
                });
        }

        setFilterState((prev) => ({
            ...prev,
            startDate: start,
            endDate: end,
            periode: periode,
        }));

        setDisplayState((prev) => ({
            ...prev,
            attendanceData: null,
            overallAttendances: null,
            violationData: null,
        }));
    }, []);

    const handleApplyFilter = useCallback(() => {
        if (!filterState.selectedAcademicYear) {
            alert("Silakan pilih tahun ajaran terlebih dahulu");
            return;
        }

        // Clear previous data while loading
        setDisplayState((prev) => ({
            ...prev,
            attendanceData: null,
            overallAttendances: null,
            violationData: null,
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
            appliedFilters: null,
        });

        // Clear dependent lists
        setBranchesList([]);
        setTeachingGroupsList([]);
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

    // Helper computed booleans for button visibility
    const hasUnappliedFilters = useMemo(
        () =>
            hasUnappliedFiltersHelper(filterState, displayState, [
                "selectedAcademicYear",
            ]),
        [filterState, displayState.appliedFilters]
    );

    const hasFiltersChanged = useMemo(
        () =>
            hasFiltersChangedHelper(filterState, initialFilterState, [
                "selectedAcademicYear",
                "startDate",
                "endDate",
                "selectedBranch",
                "selectedTeachingGroup",
                "selectedSubBranch",
                "selectedClass",
            ]),
        [filterState]
    );

    return (
        <div className="bg-gray-50 md:p-8 px-4 py-8 min-h-screen">
            <main className="mx-auto max-w-6xl">
                {academicYearsList && (
                    <div className="flex-col gap-4 rounded-md card-basic">
                        <div className="flex justify-between">
                            <div className={`flex flex-col`}>
                                <h2 className="font-bold text-xl">
                                    Daerah Cikampek
                                </h2>
                                {/* <p className="text-gray-600 text-sm">
                          Target Semester: {subBranchData.semesterTarget} hari
                      </p> */}
                            </div>
                        </div>

                        <div className="flex md:flex-row flex-col justify-between gap-4">
                            <div className="flex flex-col items-start gap-5">
                                <div className="flex flex-row items-center gap-4">
                                    <div className="flex flex-col gap-[18px]">
                                        <div>Tahun Ajaran</div>
                                        <div>Periode</div>
                                        <div>Desa</div>
                                        <div>KBM</div>
                                        <div>Kelompok</div>
                                        <div>Kelas</div>
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <select
                                            value={
                                                filterState.selectedAcademicYear
                                                    ? filterState.selectedAcademicYear
                                                    : ""
                                            }
                                            onChange={(e) =>
                                                selectAcademicYearHandler(
                                                    e.target.value
                                                )
                                            }
                                            className="px-2 py-1 border border-gray-400 rounded-full active:ring-2 active:ring-blue-300"
                                            disabled={false}
                                        >
                                            {!filterState.selectedAcademicYear && (
                                                <option value={""}>
                                                    Pilih
                                                </option>
                                            )}
                                            {academicYearsList &&
                                                academicYearsList.map(
                                                    (academicYear, index) => (
                                                        <option
                                                            key={index}
                                                            value={
                                                                academicYear._id
                                                            }
                                                        >
                                                            {academicYearFormatter(
                                                                academicYear.name
                                                            )}
                                                        </option>
                                                    )
                                                )}
                                        </select>
                                        <DatePicker
                                            dateFormat="dd/MM/yyyy"
                                            selected={filterState.startDate}
                                            onChange={selectDateRangeHandler}
                                            maxDate={
                                                new Date(
                                                    getMonday(
                                                        new Date()
                                                    ).setDate(
                                                        getMonday(
                                                            new Date()
                                                        ).getDate() + 6
                                                    )
                                                )
                                            }
                                            startDate={filterState.startDate}
                                            endDate={filterState.endDate}
                                            locale={"id-ID"}
                                            isClearable
                                            selectsRange
                                            withPortal={
                                                window.innerWidth <= 768
                                            }
                                            className={`${
                                                filterState.selectedAcademicYear &&
                                                "pr-8"
                                            } border border-gray-400 px-2 py-1 rounded-full active:ring-2 active:ring-blue-300`}
                                            disabled={
                                                !filterState.selectedAcademicYear
                                            }
                                            placeholderText={`${
                                                filterState.selectedAcademicYear
                                                    ? "Masukkan Periode"
                                                    : "Pilih Tahun Ajaran"
                                            }`}
                                            onFocus={(e) =>
                                                (e.target.readOnly = true)
                                            }
                                        />
                                        <select
                                            value={
                                                filterState.selectedBranch
                                                    ? filterState.selectedBranch
                                                    : ""
                                            }
                                            onChange={(e) =>
                                                selectBranchHandler(
                                                    e.target.value
                                                )
                                            }
                                            className="px-2 py-1 border border-gray-400 rounded-full active:ring-2 active:ring-blue-300"
                                            disabled={
                                                !filterState.selectedAcademicYear
                                            }
                                        >
                                            <option value={""}>Semua</option>
                                            {branchesList &&
                                                branchesList.map(
                                                    (branch, index) => (
                                                        <option
                                                            key={index}
                                                            value={branch._id}
                                                        >
                                                            {branch.name}
                                                        </option>
                                                    )
                                                )}
                                        </select>
                                        <select
                                            value={
                                                filterState.selectedTeachingGroup
                                                    ? filterState.selectedTeachingGroup
                                                    : ""
                                            }
                                            onChange={(e) =>
                                                selectTeachingGroupHandler(
                                                    e.target.value
                                                )
                                            }
                                            className={`border border-gray-400 px-2 py-1 rounded-full active:ring-2 active:ring-blue-300 ${
                                                filterState.selectedBranchYear
                                                    ? ""
                                                    : "opacity-50 cursor-not-allowed"
                                            }`}
                                            disabled={
                                                !filterState.selectedBranchYear
                                            }
                                        >
                                            <option value={""}>
                                                {!filterState.selectedAcademicYear
                                                    ? "Pilih Tahun Ajaran"
                                                    : !filterState.selectedBranch
                                                    ? "Pilih Desa"
                                                    : "Semua"}
                                            </option>
                                            {teachingGroupsList &&
                                                teachingGroupsList.map(
                                                    (teachingGroup, index) => (
                                                        <option
                                                            key={index}
                                                            value={
                                                                teachingGroup._id
                                                            }
                                                        >
                                                            {teachingGroup.name}
                                                        </option>
                                                    )
                                                )}
                                        </select>
                                        <select
                                            value={
                                                filterState.selectedSubBranch
                                                    ? filterState.selectedSubBranch
                                                    : ""
                                            }
                                            onChange={(e) =>
                                                selectSubBranchHandler(
                                                    e.target.value
                                                )
                                            }
                                            className={`px-2 py-1 border border-gray-400 rounded-full active:ring-2 active:ring-blue-300 ${
                                                filterState.selectedTeachingGroup
                                                    ? ""
                                                    : "opacity-50 cursor-not-allowed"
                                            }`}
                                            disabled={
                                                !filterState.selectedTeachingGroup
                                            }
                                        >
                                            <option value={""}>
                                                {!filterState.selectedAcademicYear
                                                    ? "Pilih Tahun Ajaran"
                                                    : !filterState.selectedTeachingGroup
                                                    ? "Pilih KBM"
                                                    : "Semua"}
                                            </option>
                                            {subBranchesList &&
                                                subBranchesList.map(
                                                    (subBranch, index) => (
                                                        <option
                                                            key={index}
                                                            value={
                                                                subBranch._id
                                                            }
                                                        >
                                                            {subBranch.name}
                                                        </option>
                                                    )
                                                )}
                                        </select>
                                        <select
                                            value={
                                                filterState.selectedClass
                                                    ? filterState.selectedClass
                                                    : ""
                                            }
                                            onChange={(e) =>
                                                selectClassHandler(
                                                    e.target.value
                                                )
                                            }
                                            className={`px-2 py-1 border border-gray-400 rounded-full active:ring-2 active:ring-blue-300 ${
                                                filterState.selectedSubBranch
                                                    ? ""
                                                    : "opacity-50 cursor-not-allowed"
                                            }`}
                                            disabled={
                                                !filterState.selectedSubBranch
                                            }
                                        >
                                            <option value={""}>
                                                {!filterState.selectedAcademicYear
                                                    ? "Pilih Tahun Ajaran"
                                                    : !filterState.selectedTeachingGroup
                                                    ? "Pilih KBM"
                                                    : !filterState.selectedSubBranch
                                                    ? "Pilih Kelompok"
                                                    : "Semua"}
                                            </option>
                                            {classesList &&
                                                classesList.map(
                                                    (cls, index) => (
                                                        <option
                                                            key={index}
                                                            value={cls._id}
                                                        >
                                                            {cls.name}
                                                        </option>
                                                    )
                                                )}
                                        </select>
                                    </div>
                                </div>

                                <div className="flex justify-center gap-2 mt-4">
                                    {hasUnappliedFilters && (
                                        <button
                                            onClick={handleApplyFilter}
                                            disabled={
                                                !filterState.selectedAcademicYear ||
                                                isLoading
                                            }
                                            className="btn-round-gray"
                                        >
                                            {isLoading
                                                ? "Memuat..."
                                                : "Tampilkan"}
                                        </button>
                                    )}
                                    {hasFiltersChanged && (
                                        <button
                                            onClick={handleResetFilter}
                                            disabled={isLoading}
                                            className="rounded-full btn-danger-outline"
                                        >
                                            Reset Filter
                                        </button>
                                    )}
                                </div>

                                <div className="flex flex-row self-start gap-2">
                                    {/* Left Column: Violation Names */}
                                    <div className="flex flex-col gap-1">
                                        {memoizedViolationData &&
                                            !isLoading &&
                                            filterState.selectedAcademicYear &&
                                            memoizedViolationData.map(
                                                ({ violation }, index) => (
                                                    <div
                                                        key={index}
                                                        className=""
                                                    >
                                                        {violationTranslations[
                                                            violation
                                                        ] || violation}
                                                    </div>
                                                )
                                            )}
                                    </div>

                                    {/* Right Column: Case Counts */}
                                    <div className="flex flex-col gap-1">
                                        {memoizedViolationData &&
                                            !isLoading &&
                                            filterState.selectedAcademicYear &&
                                            memoizedViolationData.map(
                                                ({ count }, index) => (
                                                    <div
                                                        key={index}
                                                        className="font-bold"
                                                    >
                                                        : {count} Temuan
                                                    </div>
                                                )
                                            )}
                                    </div>
                                </div>
                            </div>
                            {(!academicYearsList || isLoading) && (
                                <div className="justify-self-center self-center place-self-center mx-auto">
                                    <LoadingCircle size={32} />
                                </div>
                            )}
                            {memoizedOverallAttendances &&
                                !isLoading &&
                                filterState.selectedAcademicYear && (
                                    <div className="">
                                        <PieChart
                                            attendanceData={
                                                memoizedOverallAttendances
                                            }
                                        />
                                    </div>
                                )}
                        </div>
                    </div>
                )}
                {displayState.violationData &&
                    !isLoading &&
                    filterState.selectedAcademicYear &&
                    (filterState.currentView === "branchesTable" ? (
                        <div className="print-avoid-break">
                            <h2>Performa Daerah</h2>
                            <BranchesPerformanceTable
                                filterState={filterState}
                                setFilterState={setFilterState}
                            />
                        </div>
                    ) : filterState.currentView === "teachingGroupsTable" ? (
                        <div className="print-avoid-break">
                            <div className="flex justify-between">
                                <h2>Performa Desa</h2>
                                <div className="flex gap-2 no-print">
                                    <button
                                        className="btn-round-gray"
                                        onClick={() =>
                                            setFilterState((prev) => ({
                                                ...prev,
                                                currentView: "branchesTable",
                                                selectedBranch: null,
                                            }))
                                        }
                                    >
                                        Kembali
                                    </button>
                                </div>
                            </div>
                            <TeachingGroupsPerformanceTable
                                filterState={filterState}
                                setFilterState={setFilterState}
                            />
                        </div>
                    ) : filterState.currentView === "subBranchesTable" ? (
                        <div className="print-avoid-break">
                            <div className="flex justify-between">
                                <h2>Performa KBM</h2>
                                <div className="flex gap-2 no-print">
                                    <button
                                        className="btn-round-gray"
                                        onClick={() =>
                                            setFilterState((prev) => ({
                                                ...prev,
                                                currentView:
                                                    "teachingGroupsTable",
                                                selectedClass: null,
                                                selectedTeachingGroup: null,
                                                selectedSubBranch: null,
                                            }))
                                        }
                                    >
                                        Kembali
                                    </button>
                                </div>
                            </div>
                            <SubBranchesPerformanceTable
                                filterState={filterState}
                                setFilterState={setFilterState}
                            />
                        </div>
                    ) : filterState.currentView === "classesTable" ? (
                        <div className="print-avoid-break">
                            <div className="flex justify-between">
                                <h2>Performa Kelompok</h2>
                                <div className="flex gap-2 no-print">
                                    <button
                                        className="btn-round-gray"
                                        onClick={() =>
                                            setFilterState((prev) => ({
                                                ...prev,
                                                currentView: "subBranchesTable",
                                                selectedClass: null,
                                            }))
                                        }
                                    >
                                        Kembali
                                    </button>
                                </div>
                            </div>
                            <ClassesPerformanceTable
                                selectedSubBranch={
                                    filterState.selectedSubBranch
                                }
                                startDate={filterState.startDate}
                                endDate={filterState.endDate}
                                filterState={filterState}
                                setFilterState={setFilterState}
                            />
                        </div>
                    ) : (
                        <div className="print-avoid-break">
                            <div className="flex justify-between">
                                <h2>Performa Kelas</h2>
                                <div className="flex gap-2 no-print">
                                    <button
                                        className="btn-round-gray"
                                        onClick={() =>
                                            setFilterState((prev) => ({
                                                ...prev,
                                                currentView: "classesTable",
                                                selectedClass: null,
                                            }))
                                        }
                                    >
                                        Kembali
                                    </button>
                                </div>
                            </div>
                            <StudentsPerformanceTable
                                filterState={filterState}
                            />
                        </div>
                    ))}
            </main>
        </div>
    );
};

export default PerformanceView;
