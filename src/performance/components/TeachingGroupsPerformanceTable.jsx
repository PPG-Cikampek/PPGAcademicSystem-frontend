import { useContext, useMemo } from "react";
import DataTable from "../../shared/Components/UIElements/DataTable";
import { useAttendancePerformance } from "../../shared/queries/useAttendancePerformances";
import { AuthContext } from "../../shared/Components/Context/auth-context";

const TeachingGroupsPerformanceTable = ({
    filterState,
    setFilterState,
}) => {
    const auth = useContext(AuthContext);
    const userRole = JSON.parse(localStorage.getItem("userData")).role;

    const requestFilters = useMemo(() => {
        const branchYearId =
            auth.userRole !== "admin" ? filterState.selectedBranchYear || auth?.currentBranchYearId : null;
        const branchId = filterState.selectedBranch || auth?.userBranchId;

        if (!filterState.selectedAcademicYear || (auth.userRole !== "admin" && !branchYearId) || !branchId) {
            return null;
        }

        return {
            academicYearId: filterState.selectedAcademicYear,
            branchYearId,
            branchId,
            teachingGroupId: filterState.selectedTeachingGroup || null,
            subBranchId: filterState.selectedSubBranch || null,
            classId: filterState.selectedClass || null,
            startDate: filterState.startDate
                ? filterState.startDate.toISOString()
                : null,
            endDate: filterState.endDate
                ? filterState.endDate.toISOString()
                : null,
        };
    }, [
        auth?.currentBranchYearId,
        auth?.userBranchId,
        filterState.selectedAcademicYear,
        filterState.selectedBranch,
        filterState.selectedBranchYear,
        filterState.selectedTeachingGroup,
        filterState.selectedSubBranch,
        filterState.selectedClass,
        filterState.startDate,
        filterState.endDate,
    ]);

    const { data: attendanceData, isLoading } = useAttendancePerformance(
        requestFilters ?? {},
        {
            enabled: !!requestFilters,
        }
    );

    console.log(attendanceData);

    const teachingGroupColumns = useMemo(() => [
        {
            key: "teachingGroupName",
            label: "Nama KBM",
            sortable: true,
            render: (teachingGroup) => (
                <span>KBM {teachingGroup.teachingGroupName}</span>
            ),
        },
        {
            key: "studentsCount",
            label: "Jumlah Siswa",
            cellAlign: "center",
            headerAlign: "center",
            sortable: true,
        },
        {
            key: "present",
            label: "Hadir",
            sortable: true,
            cellAlign: "center",
            headerAlign: "center",
            render: (teachingGroup) => (
                <div className="place-self-center w-12 text-center badge-green">
                    {teachingGroup?.attendances?.Hadir || 0}%
                </div>
            ),
        },
        ...(userRole === "admin"
            ? [
                  {
                      key: "late",
                      label: "Terlambat",
                      sortable: true,
                      cellAlign: "center",
                      headerAlign: "center",
                      render: (teachingGroup) => (
                          <div className="place-self-center w-12 text-center badge-primary">
                              {teachingGroup?.attendances?.Terlambat || 0}%
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
            render: (teachingGroup) => (
                <div className="place-self-center w-12 text-center badge-yellow">
                    {teachingGroup?.attendances?.Izin || 0}%
                </div>
            ),
        },
        {
            key: "sick",
            label: "Sakit",
            sortable: true,
            cellAlign: "center",
            headerAlign: "center",
            render: (teachingGroup) => (
                <div className="place-self-center w-12 text-center badge-violet">
                    {teachingGroup?.attendances?.Sakit || 0}%
                </div>
            ),
        },
        {
            key: "absent",
            label: "Alpha",
            sortable: true,
            cellAlign: "center",
            headerAlign: "center",
            render: (teachingGroup) => (
                <div className="place-self-center w-12 text-center badge-red">
                    {teachingGroup?.attendances["Tanpa Keterangan"]
                        ? teachingGroup.attendances["Tanpa Keterangan"]
                        : 0}
                    %
                </div>
            ),
        },
        {
            key: "actions",
            label: "Aksi",
            headerAlign: "center",
            render: (teachingGroup) => (
                <div className="place-self-center">
                    <button
                        className="btn-primary-outline"
                        onClick={() => {
                            setFilterState({
                                ...filterState,
                                currentView: "subBranchesTable",
                                selectedTeachingGroup:
                                    teachingGroup.teachingGroupId,
                            });
                        }}
                    >
                        Lihat Detail
                    </button>
                </div>
            ),
        },
    ]);

    return (
        <DataTable
            data={attendanceData?.studentsDataByTeachingGroup || []}
            columns={teachingGroupColumns}
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

export default TeachingGroupsPerformanceTable;
