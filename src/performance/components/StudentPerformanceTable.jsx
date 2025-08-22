import { useState, useContext, useEffect, useMemo, useCallback } from "react";
import DataTable from "../../shared/Components/UIElements/DataTable";
import StudentInitial from "../../shared/Components/UIElements/StudentInitial";
import StudentReportView from "../../students/pages/StudentReportView";
import useHttp from "../../shared/hooks/http-hook";
import { AuthContext } from "../../shared/Components/Context/auth-context";

const StudentPerformanceTable = ({
    studentsData,
    selectedAcademicYear,
    selectedClass,
    startDate,
    endDate,
}) => {
    const { isLoading, sendRequest } = useHttp();
    const auth = useContext(AuthContext);

    const [displayState, setDisplayState] = useState({});

    const fetchAttendanceData = useCallback(async () => {
        const url = `${import.meta.env.VITE_BACKEND_URL}/attendances/overview/`;
        const body = JSON.stringify({
            academicYearId: selectedAcademicYear,
            branchId: auth.userBranchId,
            subBranchId: auth.userSubBranchId,
            classId: selectedClass,
            startDate: startDate ? startDate.toISOString() : null,
            endDate: endDate ? endDate.toISOString() : null,
        });

        try {
            const responseData = await sendRequest(url, "POST", body, {
                "Content-Type": "application/json",
            });
            console.log(responseData);

            const { overallStats, violationStats, ...cardsData } = responseData;

            // Update display state with new data and record applied filters
            setDisplayState({
                overallAttendances: responseData.overallStats,
                violationData: responseData.violationStats,
                studentsData: responseData.studentsData,
                studentsDataByClass: responseData.studentsDataByClass,
            });
        } catch (err) {}
    }, [sendRequest]);

    useEffect(() => {
        if (!studentsData && selectedAcademicYear && selectedClass) {
            fetchAttendanceData();
        }
    }, [sendRequest]);

    const studentColumns = useMemo(
        () => [
            {
                key: "image",
                label: "",
                sortable: false,
                render: (student) =>
                    student.thumbnail ? (
                        <img
                            src={
                                student.thumbnail
                                    ? student.thumbnail
                                    : `${import.meta.env.VITE_BACKEND_URL}/${
                                          student.image
                                      }`
                            }
                            alt={student.name}
                            className="size-10 rounded-full m-auto shrink-0 border border-gray-200 bg-white"
                        />
                    ) : (
                        <StudentInitial
                            studentName={student.name}
                            clsName={`size-10 shrink-0 rounded-full bg-blue-200 text-blue-500 flex items-center justify-center font-medium m-auto`}
                        />
                    ),
            },
            {
                key: "name",
                label: "Nama",
                sortable: true,
            },
            {
                key: "nis",
                label: "NIS",
                sortable: true,
            },
            {
                key: "present",
                label: "Hadir",
                sortable: true,
                cellAlign: "center",
                headerAlign: "center",
                render: (student) => (
                    <div className="badge-green w-12 place-self-center text-center">
                        {student.attendances.Hadir}%
                    </div>
                ),
            },
            {
                key: "late",
                label: "Terlambat",
                sortable: true,
                cellAlign: "center",
                headerAlign: "center",
                render: (student) => (
                    <div className="badge-primary w-12 place-self-center text-center">
                        {student.attendances.Terlambat}%
                    </div>
                ),
            },
            {
                key: "permission",
                label: "Izin",
                sortable: true,
                cellAlign: "center",
                headerAlign: "center",
                render: (student) => (
                    <div className="badge-yellow w-12 place-self-center text-center">
                        {student.attendances.Izin}%
                    </div>
                ),
            },
            {
                key: "sick",
                label: "Sakit",
                sortable: true,
                cellAlign: "center",
                headerAlign: "center",
                render: (student) => (
                    <div className="badge-violet w-12 place-self-center text-center">
                        {student.attendances.Sakit}%
                    </div>
                ),
            },
            {
                key: "absent",
                label: "Alpha",
                sortable: true,
                cellAlign: "center",
                headerAlign: "center",
                render: (student) => (
                    <div className="badge-red w-12 place-self-center text-center">
                        {student.attendances["Tanpa Keterangan"]}%
                    </div>
                ),
            },
            ...(auth.userRole === "teacher"
                ? [
                      {
                          key: "actions",
                          label: "Aksi",
                          headerAlign: "center",
                          render: (student) => (
                              <div className="place-self-center">
                                  {selectedAcademicYear &&
                                  (student.id || student._id) ? (
                                      <StudentReportView
                                          academicYearId={selectedAcademicYear}
                                          studentId={student.id || student._id}
                                          startDate={startDate}
                                          endDate={endDate}
                                          noCard={true}
                                      />
                                  ) : (
                                      <span className="text-gray-400 text-sm">
                                          Pilih tahun ajaran
                                      </span>
                                  )}
                              </div>
                          ),
                      },
                  ]
                : []),
        ],
        [selectedAcademicYear, startDate, endDate]
    );

    return (
        <DataTable
            data={
                !isLoading && studentsData
                    ? studentsData
                    : displayState.studentsData
            }
            columns={studentColumns}
            searchableColumns={["name"]}
            initialSort={{ key: "name", direction: "ascending" }}
            initialEntriesPerPage={50}
            config={{
                showFilter: false,
                showSearch: false,
                showTopEntries: false,
                showBottomEntries: false,
                showPagination: false,
                entriesOptions: [10, 20, 30],
            }}
        />
    );
};

export default StudentPerformanceTable;
