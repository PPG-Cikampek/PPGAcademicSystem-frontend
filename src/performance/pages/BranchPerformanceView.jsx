import { useContext, useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";

import DatePicker, { registerLocale } from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import idID from "date-fns/locale/id";

import useHttp from "../../shared/hooks/http-hook";
import { AuthContext } from "../../shared/Components/Context/auth-context";
import { useAttendancePerformanceMutation } from "../../shared/queries";

import LoadingCircle from "../../shared/Components/UIElements/LoadingCircle";

import PieChart from "../components/PieChart";
import { academicYearFormatter } from "../../shared/Utilities/academicYearFormatter";
import { getMonday } from "../../shared/Utilities/getMonday";
import {
    hasUnappliedFilters as hasUnappliedFiltersHelper,
    hasFiltersChanged as hasFiltersChangedHelper,
} from "../utilities/filterHelpers";
import TeachingGroupPerformanceTable from "../components/TeachingGroupPerformanceTable";
import SubBranchPerformanceTable from "../components/SubBranchPerformanceTable";
import ClassPerformanceTable from "../components/ClassPerformanceTable";
import StudentPerformanceTable from "../components/StudentPerformanceTable";

const BranchPerformanceView = () => {
    const { isLoading, error, sendRequest, setError } = useHttp();
    const attendancePerformanceMutation = useAttendancePerformanceMutation();

    const initialFilterState = {
        selectedAcademicYear: null,
        selectedTeachingGroup: null,
        selectedSubBranch: null,
        selectedClass: null,
        startDate: null,
        endDate: null,
        period: null,
    };

    // Academic years list (static data)
    const [academicYearsList, setAcademicYearsList] = useState();

    // Filter state - for user selections (doesn't trigger data fetches)
    const [filterState, setFilterState] = useState({
        selectedAcademicYear: null,
        startDate: null,
        endDate: null,
        period: null,
        selectedTeachingGroup: null,
        selectedSubBranch: null,
        selectedClass: null,
        currentView: "teachingGroupsTable",
    });

    // Display state - for currently shown data (only updates when "Tampilkan" is clicked)
    const [displayState, setDisplayState] = useState({
        attendanceData: null,
        overallAttendances: null,
        violationData: null,
        appliedFilters: null, // Keep track of which filters were used for the current data
    });

    // Dropdown options lists
    const [teachingGroupsList, setTeachingGroupsList] = useState();
    const [subBranchesList, setSubBranchesList] = useState();
    const [classesList, setClassesList] = useState();

    const auth = useContext(AuthContext);

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

    const fetchTeachingGroups = useCallback(async () => {
        console.log("fetching teachingGroups!");
        try {
            const responseData = await sendRequest(
                `${import.meta.env.VITE_BACKEND_URL}/branchYears/${
                    auth.currentBranchYearId
                }/teaching-groups`
            );
            setTeachingGroupsList(responseData.teachingGroups);
        } catch (err) {}
    }, [sendRequest]);

    const fetchSubBranchesList = useCallback(
        async (teachingGroupId) => {
            try {
                const responseData = await sendRequest(
                    `${
                        import.meta.env.VITE_BACKEND_URL
                    }/levels/teaching-groups/${teachingGroupId}/sub-branches`
                );
                setSubBranchesList(responseData.subBranches);
            } catch (err) {}
        },
        [sendRequest]
    );

    const fetchClassesList = useCallback(
        async (teachingGroupId = null) => {
            const url = `${
                import.meta.env.VITE_BACKEND_URL
            }/teachingGroups/${teachingGroupId}/classes`;

            try {
                const responseData = await sendRequest(url);
                setClassesList(responseData.classes);
            } catch (err) {}
        },
        [sendRequest]
    );

    const fetchAttendanceData = useCallback(async () => {
        const requestData = {
            branchYearId: auth.currentBranchYearId,
            teachingGroupId: filterState.selectedTeachingGroup,
            subBranchId: filterState.selectedSubBranch,
            classId: filterState.selectedClass,
            startDate: filterState.startDate
                ? filterState.startDate.toISOString()
                : null,
            endDate: filterState.endDate
                ? filterState.endDate.toISOString()
                : null,
        };

        try {
            const responseData =
                await attendancePerformanceMutation.mutateAsync(requestData);
            console.log(responseData);

            const { overallStats, violationStats, ...cardsData } = responseData;

            // Update display state with new data and record applied filters
            setDisplayState({
                attendanceData: cardsData,
                overallAttendances: responseData.overallStats,
                violationData: responseData.violationStats,
                appliedFilters: { ...filterState }, // Snapshot of current filters
                studentsData: responseData.studentsData,
                studentsDataByClass: responseData.studentsDataByClass,
                studentsDataBySubBranch: responseData.studentsDataBySubBranch,
                studentsDataByTeachingGroup:
                    responseData.studentsDataByTeachingGroup,
            });
        } catch (err) {
            console.error("Error fetching attendance data:", err);
        }
    }, [attendancePerformanceMutation, filterState]);

    useEffect(() => {
        registerLocale("id-ID", idID);
        fetchAcademicYears();
    }, [fetchAcademicYears]);

    const selectAcademicYearHandler = useCallback(
        (academicYearId) => {
            setFilterState(() => ({
                selectedAcademicYear: academicYearId,
                currentView: "teachingGroupsTable",
            }));

            setDisplayState((prev) => ({
                attendanceData: null,
                overallAttendances: null,
                violationData: null,
                appliedFilters: null,
            }));

            setTeachingGroupsList([]);
            setSubBranchesList([]);
            setClassesList([]);

            if (academicYearId !== "") {
                fetchTeachingGroups(academicYearId);
            }
        },
        [fetchTeachingGroups]
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

            if (teachingGroupId !== "") {
                fetchSubBranchesList(teachingGroupId);
                fetchClassesList(teachingGroupId);
            }
        },
        [fetchSubBranchesList, fetchClassesList]
    );

    const selectSubBranchHandler = useCallback(
        (subBranchId) => {
            setFilterState((prev) => ({
                ...prev,
                selectedSubBranch: subBranchId,
                selectedClass: null,
                currentView: "teachingGroupsTable",
            }));

            setDisplayState((prev) => ({
                ...prev,
            }));
        },
        [fetchClassesList, filterState.selectedAcademicYear]
    );

    const selectClassHandler = useCallback((classId) => {
        setFilterState((prev) => ({
            ...prev,
            selectedClass: classId,
            currentView: "teachingGroupsTable",
        }));
    }, []);

    const selectDateRangeHandler = useCallback((dates) => {
        const [start, end] = dates;

        let period = null;

        if (start && end) {
            period =
                start.toLocaleDateString("id-ID", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "2-digit",
                    timeZone: "Asia/Jakarta",
                }) +
                " - " +
                end.toLocaleDateString("id-ID", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "2-digit",
                    timeZone: "Asia/Jakarta",
                });
        }

        setFilterState((prev) => ({
            ...prev,
            startDate: start,
            endDate: end,
            period: period,
            currentView: "teachingGroupsTable",
        }));

        setDisplayState((prev) => ({
            ...prev,
        }));
    }, []);

    const handleApplyFilter = useCallback(() => {
        if (!filterState.selectedAcademicYear) {
            alert("Silakan pilih tahun ajaran terlebih dahulu");
            return;
        }

        setFilterState((prev) => ({
            ...prev,
            currentView: "teachingGroupsTable",
        }));

        fetchAttendanceData();
    }, [filterState.selectedAcademicYear, fetchAttendanceData]);

    const handleResetFilter = useCallback(() => {
        // Reset filter selections to initial values
        setFilterState({
            ...initialFilterState,
            currentView: "teachingGroupsTable",
        });

        // Clear displayed data
        setDisplayState({
            attendanceData: null,
            overallAttendances: null,
            violationData: null,
            appliedFilters: null,
        });

        // Clear dependent lists
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

    const hasUnappliedFilters = useMemo(() => {
        // When there's no appliedFilters (initial state), show the Tampilkan
        // button as soon as the user selects an academic year (branch requires it).
        if (!displayState || !displayState.appliedFilters) {
            return !!filterState.selectedAcademicYear;
        }

        // After data was applied at least once, compare all relevant keys.
        return hasUnappliedFiltersHelper(filterState, displayState, [
            "selectedAcademicYear",
            "period",
            "selectedTeachingGroup",
            "selectedSubBranch",
            "selectedClass",
        ]);
    }, [filterState, displayState.appliedFilters]);

    const hasFiltersChanged = useMemo(
        () =>
            hasFiltersChangedHelper(filterState, initialFilterState, [
                "selectedAcademicYear",
                "startDate",
                "endDate",
                "period",
                "selectedTeachingGroup",
                "selectedSubBranch",
                "selectedClass",
            ]),
        [filterState]
    );

    return (
        <div className="min-h-screen bg-gray-50 px-4 py-8 md:p-8">
            <main className="max-w-6xl mx-auto">
                {academicYearsList && (
                    <div className="card-basic rounded-md flex-col gap-4">
                        <div className="flex justify-between">
                            <div className={`flex flex-col`}>
                                <h2 className="text-xl font-bold">Desa</h2>
                                {/* <p className="text-sm text-gray-600">
                          Target Semester: {subBranchData.semesterTarget} hari
                      </p> */}
                            </div>
                        </div>

                        <div className="flex flex-col md:flex-row justify-between gap-4">
                            <div className="flex flex-col gap-5 items-start">
                                <div className="flex flex-row gap-4 items-center">
                                    <div className="flex flex-col gap-[18px]">
                                        <div>Tahun Ajaran</div>
                                        <div>Periode</div>
                                        <div>KBM</div>
                                        <div>Kelompok</div>
                                        <div>Kelas</div>
                                    </div>
                                    <div className="flex flex-col gap-2 ">
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
                                            className="border border-gray-400 px-2 py-1 rounded-full active:ring-2 active:ring-blue-300"
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
                                            } border border-gray-400 px-2 py-1 rounded-full active:ring-2 active:ring-blue-300 ${
                                                filterState.selectedAcademicYear
                                                    ? ""
                                                    : "opacity-50 cursor-not-allowed"
                                            }`}
                                            disabled={
                                                !filterState.selectedAcademicYear
                                            }
                                            placeholderText={`${
                                                filterState.selectedAcademicYear
                                                    ? "Semua"
                                                    : "Pilih Tahun Ajaran"
                                            }`}
                                            onFocus={(e) =>
                                                (e.target.readOnly = true)
                                            }
                                        />
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
                                                filterState.selectedAcademicYear
                                                    ? ""
                                                    : "opacity-50 cursor-not-allowed"
                                            }`}
                                            disabled={
                                                !filterState.selectedAcademicYear
                                            }
                                        >
                                            <option value={""}>
                                                {!filterState.selectedAcademicYear
                                                    ? "Pilih Tahun Ajaran"
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
                                            className={`border border-gray-400 px-2 py-1 rounded-full active:ring-2 active:ring-blue-300 ${
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
                                            className={`border border-gray-400 px-2 py-1 rounded-full active:ring-2 active:ring-blue-300 ${
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

                                <div className="flex justify-center mt-4 gap-2">
                                    {hasUnappliedFilters && (
                                        <button
                                            onClick={handleApplyFilter}
                                            disabled={
                                                !filterState.selectedAcademicYear ||
                                                isLoading
                                            }
                                            className="btn-mobile-primary-round-gray"
                                        >
                                            {isLoading ? (
                                                <span>
                                                    <LoadingCircle size={16} />{" "}
                                                    Merangkum Data...{" "}
                                                </span>
                                            ) : !filterState.selectedAcademicYear ? (
                                                "Pilih Tahun Ajaran"
                                            ) : (
                                                "Tampilkan"
                                            )}
                                        </button>
                                    )}
                                    {hasFiltersChanged && (
                                        <button
                                            onClick={handleResetFilter}
                                            disabled={isLoading}
                                            className="btn-danger-outline rounded-full"
                                        >
                                            Reset Filter
                                        </button>
                                    )}
                                </div>

                                <div className="self-start flex flex-row gap-2">
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
                                    <div className="flex flex-col gap-1 ">
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
                                <div className="place-self-center justify-self-center self-center mx-auto">
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
                    (filterState.currentView === "teachingGroupsTable" ? (
                        <div className="print-avoid-break">
                            <h2>Performa Desa</h2>
                            <TeachingGroupPerformanceTable
                                data={displayState.studentsDataByTeachingGroup}
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
                                        className="btn-mobile-primary-round-gray"
                                        onClick={() =>
                                            setFilterState((prev) => ({
                                                ...prev,
                                                currentView:
                                                    "teachingGroupsTable",
                                                selectedClass: null,
                                            }))
                                        }
                                    >
                                        Kembali
                                    </button>
                                </div>
                            </div>
                            <SubBranchPerformanceTable
                                data={displayState.studentsDataBySubBranch}
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
                                        className="btn-mobile-primary-round-gray"
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
                            <ClassPerformanceTable
                                data={displayState.studentsDataByClass}
                                filterState={filterState}
                                setFilterState={setFilterState}
                            />
                        </div>
                    ) : (
                        <div className="print-avoid-break">
                            <div className="flex justify-between">
                                <h2>Performa Kelompok</h2>
                                <div className="flex gap-2 no-print">
                                    <button
                                        className="btn-mobile-primary-round-gray"
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
                            <StudentPerformanceTable
                                selectedAcademicYear={
                                    filterState.selectedAcademicYear
                                }
                                selectedClass={filterState.selectedClass}
                                startDate={filterState.startDate}
                                endDate={filterState.endDate}
                            />
                        </div>
                    ))}
            </main>
        </div>
    );
};

export default BranchPerformanceView;
