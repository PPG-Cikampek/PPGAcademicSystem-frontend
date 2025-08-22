import { useContext, useState, useEffect, useCallback, useMemo } from "react";
import DatePicker, { registerLocale } from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import idID from "date-fns/locale/id";
import html2pdf from "html2pdf.js";
import "./SubBranchPerformanceView.css";

import useHttp from "../../shared/hooks/http-hook";
import { AuthContext } from "../../shared/Components/Context/auth-context";

import LoadingCircle from "../../shared/Components/UIElements/LoadingCircle";

import PieChart from "../components/PieChart";
import { academicYearFormatter } from "../../shared/Utilities/academicYearFormatter";
import { getMonday } from "../../shared/Utilities/getMonday";
import ClassPerformanceTable from "../components/ClassPerformanceTable";
import StudentPerformanceTable from "../components/StudentPerformanceTable";
import { CircleX, FileDown } from "lucide-react";

const SubBranchPerformanceView = () => {
    const { isLoading, error, sendRequest, setError } = useHttp();

    const initialFilterState = {
        selectedAcademicYear: null,
        startDate: null,
        endDate: null,
        period: null,
        selectedClass: null,
    };

    // Academic years list (static data)
    const [academicYearsList, setAcademicYearsList] = useState();

    // Filter state - for user selections (doesn't trigger data fetches)
    const [filterState, setFilterState] = useState({
        selectedAcademicYear: null,
        startDate: null,
        endDate: null,
        period: null,
        selectedClass: null,
        currentView: "classesTable",
    });

    // Display state - for currently shown data (only updates when filters are applied)
    const [displayState, setDisplayState] = useState({
        attendanceData: null,
        overallAttendances: null,
        violationData: null,
        appliedFilters: null, // Keep track of which filters were used for the current data
        classData: null,
        studentsData: null,
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
            branchId: auth.userBranchId,
            subBranchId: auth.userSubBranchId,
            classId: filterState.selectedClass,
            startDate: filterState.startDate
                ? filterState.startDate.toISOString()
                : null,
            endDate: filterState.endDate
                ? filterState.endDate.toISOString()
                : null,
        });

        try {
            const responseData = await sendRequest(url, "POST", body, {
                "Content-Type": "application/json",
            });
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
            });
        } catch (err) {}
    }, [sendRequest, filterState]);

    // compute maxDate only once per render to avoid repeated getMonday calls
    const maxDate = useMemo(() => {
        const m = getMonday(new Date());
        const end = new Date(m);
        end.setDate(m + 6);
        return end;
    }, []);

    useEffect(() => {
        registerLocale("id-ID", idID);
        fetchAcademicYears();
    }, [fetchAcademicYears]);

    const fetchClassesList = useCallback(
        async (academicYearId) => {
            const url = `${
                import.meta.env.VITE_BACKEND_URL
            }/classes/sub-branch/${
                auth.userSubBranchId
            }/academic-year/${academicYearId}`;

            try {
                const responseData = await sendRequest(url);
                setClassesList(responseData.classes);
            } catch (err) {}
        },
        [sendRequest]
    );

    const selectAcademicYearHandler = useCallback(
        (academicYearId) => {
            setFilterState((prev) => ({
                ...prev,
                selectedAcademicYear: academicYearId,
                selectedClass: null,
                currentView: "classesTable",
            }));

            // Batch clear display state to a single update
            setDisplayState({
                appliedFilters: null,
                classData: null,
            });

            setClassesList([]);

            if (academicYearId !== "") {
                fetchClassesList(academicYearId);
            }
        },
        [fetchClassesList]
    );

    const selectClassHandler = useCallback((classId) => {
        setFilterState((prev) => ({
            ...prev,
            selectedClass: classId,
            currentView: "classesTable",
        }));
        setDisplayState((prev) => ({
            ...prev,
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
            currentView: "classesTable",
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
            currentView: "classesTable",
        }));

        fetchAttendanceData();
    }, [filterState.selectedAcademicYear, fetchAttendanceData]);

    const handleResetFilter = useCallback(() => {
        // Reset filter selections to initial values
        setFilterState({
            selectedAcademicYear: null,
            startDate: null,
            endDate: null,
            period: null,
            selectedClass: null,
            currentView: "classesTable",
        });

        // Clear display state
        setDisplayState({
            attendanceData: null,
            overallAttendances: null,
            violationData: null,
            appliedFilters: null,
            classData: null,
            studentsData: null,
        });

        // Clear classes list
        setClassesList([]);
    }, []);

    // Helper functions for button display logic
    const hasUnappliedFilters = useMemo(() => {
        if (!displayState.appliedFilters) {
            // If no filters have been applied yet, check if any filter is set
            return !!(
                filterState.selectedAcademicYear ||
                filterState.startDate ||
                filterState.endDate ||
                filterState.selectedClass
            );
        }

        // Compare current filterState with applied filters
        return (
            filterState.selectedAcademicYear !==
                displayState.appliedFilters.selectedAcademicYear ||
            filterState.startDate !== displayState.appliedFilters.startDate ||
            filterState.endDate !== displayState.appliedFilters.endDate ||
            filterState.selectedClass !==
                displayState.appliedFilters.selectedClass
        );
    }, [filterState, displayState.appliedFilters]);

    const hasFiltersChanged = useMemo(() => {
        return (
            filterState.selectedAcademicYear !==
                initialFilterState.selectedAcademicYear ||
            filterState.startDate !== initialFilterState.startDate ||
            filterState.endDate !== initialFilterState.endDate ||
            filterState.selectedClass !== initialFilterState.selectedClass
        );
    }, [filterState]);

    // Memoized values to prevent unnecessary re-renders
    const memoizedOverallAttendances = useMemo(() => {
        return displayState.overallAttendances;
    }, [displayState.overallAttendances]);

    const memoizedViolationData = useMemo(() => {
        return displayState.violationData;
    }, [displayState.violationData]);

    // PDF download logic
    const handleDownloadPDF = useCallback(async () => {
        if (!displayState.violationData || !filterState.selectedAcademicYear) {
            alert(
                "Tidak ada data untuk dicetak. Silakan apply filter terlebih dahulu."
            );
            return;
        }

        try {
            const element = document.getElementById("report");
            if (!element) {
                console.error("Report element not found");
                return;
            }

            // Get the selected academic year name for filename
            const selectedAcademicYear = academicYearsList?.find(
                (year) => year._id === filterState.selectedAcademicYear
            );
            const academicYearName = selectedAcademicYear
                ? academicYearFormatter(selectedAcademicYear.name)
                : "Unknown";

            // Generate filename with current date and filters
            const currentDate = new Date().toLocaleDateString("id-ID", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
            });

            let filename = `Laporan_Performa_${academicYearName}_${currentDate}`;

            if (filterState.period) {
                filename += `_${filterState.period
                    .replace(/\s+/g, "_")
                    .replace(/[/\\:*?"<>|]/g, "-")}`;
            }

            if (filterState.selectedClass && classesList) {
                const selectedClass = classesList.find(
                    (cls) => cls._id === filterState.selectedClass
                );
                if (selectedClass) {
                    filename += `_${selectedClass.name.replace(/\s+/g, "_")}`;
                }
            }

            // Configure html2pdf options
            const opt = {
                filename: `${filename}.pdf`,
                image: {
                    type: "jpeg",
                    quality: 1,
                },
                html2canvas: {
                    scale: 2,
                    useCORS: true,
                    letterRendering: true,
                    allowTaint: true,
                    backgroundColor: "#ffffff",
                },
                jsPDF: {
                    unit: "mm",
                    format: "a4",
                    orientation: "landscape",
                },
                pagebreak: {
                    mode: ["avoid-all", "css", "legacy"],
                    before: ".page-break-before",
                    after: ".page-break-after",
                },
            };

            // Add print-specific styling temporarily
            const printStyle = document.createElement("style");
            printStyle.textContent = `
                @media print {
                    .no-print { display: none !important; }
                    .print-break { page-break-before: always; }
                    .print-avoid-break { page-break-inside: avoid; }
                }
                .pdf-generation .no-print { display: none !important; }
                .pdf-generation .print-break { page-break-before: always; }
                .pdf-generation .print-avoid-break { page-break-inside: avoid; }
            `;
            document.head.appendChild(printStyle);

            // Add temporary class for PDF generation
            element.classList.add("pdf-generation");

            // Generate PDF
            await html2pdf().set(opt).from(element).save();

            // Cleanup
            element.classList.remove("pdf-generation");
            document.head.removeChild(printStyle);
        } catch (error) {
            console.error("Error generating PDF:", error);

            // Fallback to browser print
            if (
                confirm(
                    "Gagal mengunduh PDF. Apakah Anda ingin menggunakan Print Browser sebagai alternatif?"
                )
            ) {
                handlePrintFallback();
            }
        }
    }, [
        displayState.violationData,
        filterState,
        academicYearsList,
        classesList,
    ]);

    // Fallback print function
    const handlePrintFallback = useCallback(() => {
        // Add print-specific styles
        const printStyle = document.createElement("style");
        printStyle.textContent = `
            @media print {
                body * { visibility: hidden; }
                #report, #report * { visibility: visible; }
                #report { 
                    position: absolute; 
                    left: 0; 
                    top: 0; 
                    width: 100% !important;
                    margin: auto !important;
                    padding: 50px 100px !important;
                }
                .no-print { display: none !important; }
                .print-break { page-break-before: always; }
                .print-avoid-break { page-break-inside: avoid; }
                button { display: none !important; }
                .flex.gap-2 { display: none !important; }
            }
        `;
        document.head.appendChild(printStyle);

        // Trigger print
        window.print();

        // Cleanup after print dialog closes
        setTimeout(() => {
            document.head.removeChild(printStyle);
        }, 2000);
    }, []);

    return (
        <div className="min-h-screen bg-gray-50 px-4 py-8 md:p-8">
            <main id="report" className="max-w-6xl mx-auto mb-24">
                {/* PDF Header - Only visible in PDF */}
                <div className="hidden print:block pdf-generation:block mb-6">
                    <div className="text-center border-b pb-4 mb-6">
                        <h1 className="text-2xl font-bold mb-2">
                            Laporan Performa Kehadiran
                        </h1>
                        <div className="text-sm text-gray-600">
                            <p>
                                Diterbitkan secara elektronik pada:{" "}
                                {new Date().toLocaleDateString("id-ID", {
                                    weekday: "long",
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                })}
                            </p>
                        </div>
                    </div>
                </div>
                {academicYearsList && (
                    <div className="card-basic rounded-md flex-col gap-4">
                        <div className="flex flex-col md:flex-row justify-between gap-4">
                            <div className="hidden print:flex pdf-generation:flex flex-row items-center gap-[18px]">
                                <div className="flex flex-col gap-4">
                                    <div>Tahun Ajaran</div>
                                    <div>Periode</div>
                                    <div>Kelas</div>
                                </div>
                                <div className="flex flex-col gap-4">
                                    {filterState.selectedAcademicYear &&
                                        academicYearsList && (
                                            <p>
                                                {":  "}
                                                {academicYearFormatter(
                                                    academicYearsList.find(
                                                        (year) =>
                                                            year._id ===
                                                            filterState.selectedAcademicYear
                                                    )?.name
                                                )}
                                            </p>
                                        )}
                                    {filterState.period ? (
                                        <p>: {filterState.period}</p>
                                    ) : (
                                        <p>: Semua</p>
                                    )}
                                    {console.log(filterState)}
                                    {filterState.selectedClass &&
                                    classesList ? (
                                        <p>
                                            {": "}
                                            {classesList.find(
                                                (cls) =>
                                                    cls._id ===
                                                    filterState.selectedClass
                                            )?.name || ": Semua Kelas"}
                                        </p>
                                    ) : (
                                        <p>: Semua Kelas</p>
                                    )}
                                </div>
                            </div>

                            <div className="flex flex-col gap-5 no-print">
                                <div className="flex flex-row gap-4 items-center">
                                    <div className="flex flex-col gap-[18px] items-start">
                                        <div>Tahun Ajaran</div>
                                        <div>Periode</div>
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
                                            maxDate={maxDate}
                                            startDate={filterState.startDate}
                                            endDate={filterState.endDate}
                                            onChange={selectDateRangeHandler}
                                            value={filterState.period}
                                            locale={"id-ID"}
                                            selectsRange
                                            isClearable
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
                                                filterState.selectedAcademicYear
                                                    ? ""
                                                    : "text-gray-500 opacity-50 cursor-not-allowed"
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

                                <div className="flex justify-center mt-4 gap-2 no-print">
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
                                            className="btn-danger-outline rounded-full flex flex-row items-center gap-2"
                                        >
                                            {isLoading ? (
                                                <span>
                                                    <LoadingCircle size={16} />
                                                </span>
                                            ) : (
                                                <span>
                                                    <CircleX size={18} />
                                                </span>
                                            )}
                                            Reset Filter
                                        </button>
                                    )}

                                    {displayState.violationData && (
                                        <button
                                            onClick={handleDownloadPDF}
                                            disabled={
                                                isLoading ||
                                                !displayState.violationData
                                            }
                                            className="button-primary mt-0 rounded-full flex flex-row items-center gap-2"
                                            title={
                                                !displayState.violationData
                                                    ? "Apply filter terlebih dahulu untuk mengunduh laporan"
                                                    : "Unduh laporan dalam format PDF"
                                            }
                                        >
                                            {isLoading ? (
                                                <span>
                                                    <LoadingCircle size={16} />
                                                </span>
                                            ) : (
                                                <span>
                                                    <FileDown size={18} />
                                                </span>
                                            )}
                                            Print Laporan
                                        </button>
                                    )}
                                </div>

                                <div className="self-start flex flex-row gap-2 print-avoid-break">
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

                            {(!academicYearsList || isLoading) &&
                                displayState.attendanceData !== null && (
                                    <div className="place-self-center justify-self-center self-center mx-auto">
                                        <LoadingCircle size={32} />
                                    </div>
                                )}
                            {memoizedOverallAttendances &&
                                !isLoading &&
                                filterState.selectedAcademicYear && (
                                    <div className="print-avoid-break">
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
                    (filterState.currentView === "classesTable" ? (
                        <div className="print-avoid-break">
                            <h2>Performa Kelompok</h2>
                            <ClassPerformanceTable
                                data={displayState.studentsDataByClass}
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

export default SubBranchPerformanceView;
