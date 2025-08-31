import { useState, useContext, useMemo } from "react";
import DataTable from "../../shared/Components/UIElements/DataTable";
import StudentInitial from "../../shared/Components/UIElements/StudentInitial";
import StudentReportView from "../../students/pages/StudentReportView";
import { useAttendancePerformance } from "../../shared/queries/useAttendancePerformances";
import { AuthContext } from "../../shared/Components/Context/auth-context";

const StudentsPerformanceTable = ({ studentsData, filterState }) => {
    const auth = useContext(AuthContext);

    const { data: attendanceData } = useAttendancePerformance(
        {
            ...(filterState.selectedAcademicYear
                ? { academicYearId: filterState.selectedAcademicYear }
                : {}),
            ...(filterState.selectedBranchYear
                ? { branchYearId: filterState.selectedBranchYear }
                : {}),
            branchId: auth.userBranchId,
            subBranchId: filterState.selectedSubBranch,
            classId: filterState.selectedClass,
            startDate: filterState.startDate
                ? filterState.startDate.toISOString()
                : null,
            endDate: filterState.endDate
                ? filterState.endDate.toISOString()
                : null,
        },
        {
            ...(filterState.selectedAcademicYear
                ? { academicYearId: filterState.selectedAcademicYear }
                : {}),
            ...(filterState.selectedBranchYear
                ? { branchYearId: filterState.selectedBranchYear }
                : {}),
            ...(filterState.selectedClass
                ? { classId: filterState.selectedClass }
                : {}),
            branchId: auth.userBranchId,
            subBranchId: auth.userSubBranchId,
            classId: filterState.selectedClass,
            startDate: filterState.startDate
                ? filterState.startDate.toISOString()
                : null,
            endDate: filterState.endDate
                ? filterState.endDate.toISOString()
                : null,
        },
        {
            enabled: true, // always allow fetching
            // ensure a fresh fetch every time the component mounts
            // refetchOnMount: "always",
        }
    );

    attendanceData
        ? console.log(attendanceData)
        : console.log("No attendance data available");

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
        [
            filterState.selectedAcademicYear,
            filterState.startDate,
            filterState.endDate,
        ]
    );

    return (
        <DataTable
            data={attendanceData?.studentsData || studentsData}
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

export default StudentsPerformanceTable;
