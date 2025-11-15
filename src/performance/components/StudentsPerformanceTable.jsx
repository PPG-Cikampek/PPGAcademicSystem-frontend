import { useContext, useMemo } from "react";
import DataTable from "../../shared/Components/UIElements/DataTable";
import StudentInitial from "../../shared/Components/UIElements/StudentInitial";
import StudentReportView from "../../students/pages/StudentReportView";
import { useAttendancePerformance } from "../../shared/queries/useAttendancePerformances";
import { AuthContext } from "../../shared/Components/Context/auth-context";

const StudentsPerformanceTable = ({ filterState }) => {
    const auth = useContext(AuthContext);

    const requestFilters = useMemo(() => {
        if (!filterState.selectedAcademicYear) {
            return null;
        }

        const baseFilters = {
            academicYearId: filterState.selectedAcademicYear,
            startDate: filterState.startDate
                ? filterState.startDate.toISOString()
                : null,
            endDate: filterState.endDate
                ? filterState.endDate.toISOString()
                : null,
            classId: filterState.selectedClass || null,
        };

        if (
            auth.userRole === "admin" ||
            auth.userRole === "branchAdmin"
        ) {
            if (!auth.currentBranchYearId) {
                return null;
            }

            return {
                ...baseFilters,
                branchYearId:
                    auth.userRole !== "admin" ? filterState.selectedBranchYear || auth.currentBranchYearId : null,
                branchId: auth.userRole !== "admin" ? auth.userBranchId : null,
                teachingGroupId: filterState.selectedTeachingGroup || null,
                subBranchId: filterState.selectedSubBranch || null,
            };
        }

        if (auth.userRole === "subBranchAdmin") {
            return {
                ...baseFilters,
                branchId: auth.userBranchId,
                subBranchId: auth.userSubBranchId,
            };
        }

        if (auth.userRole === "teacher") {
            return {
                ...baseFilters,
                branchId: auth.userBranchId,
                teacherClassIds: auth.userClassIds,
            };
        }

        return null;
    }, [
        auth.currentBranchYearId,
        auth.userBranchId,
        auth.userClassIds,
        auth.userRole,
        auth.userSubBranchId,
        filterState.selectedAcademicYear,
        filterState.selectedBranchYear,
        filterState.selectedClass,
        filterState.selectedSubBranch,
        filterState.selectedTeachingGroup,
        filterState.startDate,
        filterState.endDate,
    ]);

    const { data: attendanceData, isLoading } = useAttendancePerformance(
        requestFilters ?? {},
        {
            enabled: !!requestFilters,
        }
    );

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
                            className="bg-white m-auto border border-gray-200 rounded-full size-10 shrink-0"
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
                    <div className="place-self-center w-12 text-center badge-green">
                        {student.attendances.Hadir}%
                    </div>
                ),
            },
            ...(auth.userRole === "admin"
                ? [
                      {
                          key: "late",
                          label: "Terlambat",
                          sortable: true,
                          cellAlign: "center",
                          headerAlign: "center",
                          render: (student) => (
                              <div className="place-self-center w-12 text-center badge-primary">
                                  {student.attendances.Terlambat}%
                              </div>
                          ),
                      },
                  ]
                : []),
            {
                key: "permission",
                label: "Izin",
                sortable: true,
                cellAlign: "center",
                headerAlign: "center",
                render: (student) => (
                    <div className="place-self-center w-12 text-center badge-yellow">
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
                    <div className="place-self-center w-12 text-center badge-violet">
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
                    <div className="place-self-center w-12 text-center badge-red">
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
                                  {filterState.selectedAcademicYear &&
                                  (student.id || student._id) ? (
                                      <StudentReportView
                                          academicYearId={
                                              filterState.selectedAcademicYear
                                          }
                                          studentId={student.id || student._id}
                                          startDate={filterState.startDate}
                                          endDate={filterState.endDate}
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
            data={attendanceData?.studentsData || []}
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
            isLoading={isLoading}
        />
    );
};

export default StudentsPerformanceTable;
