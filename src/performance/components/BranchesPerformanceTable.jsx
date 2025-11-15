import { useContext, useMemo } from "react";
import DataTable from "../../shared/Components/UIElements/DataTable";
import { useAttendancePerformance } from "../../shared/queries/useAttendancePerformances";
import { AuthContext } from "../../shared/Components/Context/auth-context";

const BranchesPerformanceTable = ({ filterState, setFilterState }) => {
    const auth = useContext(AuthContext);

    const requestFilters = useMemo(() => {
        if (!filterState.selectedAcademicYear) {
            return null;
        }

        return {
            academicYearId: filterState.selectedAcademicYear,
            branchId: filterState.selectedBranch || null,
            branchYearId: filterState.selectedBranchYear || null,
            subBranchId: null,
            classId: null,
            startDate: filterState.startDate
                ? filterState.startDate.toISOString()
                : null,
            endDate: filterState.endDate
                ? filterState.endDate.toISOString()
                : null,
        };
    }, [
        filterState.selectedAcademicYear,
        filterState.selectedBranch,
        filterState.selectedBranchYear,
        filterState.selectedTeachingGroup,
        filterState.startDate,
        filterState.endDate,
    ]);

    const { data, isLoading } = useAttendancePerformance(requestFilters ?? {}, {
        enabled: !!requestFilters,
    });

    const branchesData = useMemo(() => {
        if (!data?.studentsDataByBranch) {
            return [];
        }

        if (filterState.selectedBranch) {
            return data.studentsDataByBranch.filter(
                (branch) => branch.branchId === filterState.selectedBranch
            );
        }

        return data.studentsDataByBranch;
    }, [data?.studentsDataByBranch, filterState.selectedBranch]);

    const branchColumns = useMemo(
        () => [
            {
                key: "branchName",
                label: "Nama Daerah",
                sortable: true,
                render: (branch) => (
                    <span>Daerah {branch?.branchName || "-"}</span>
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
                render: (branch) => (
                    <div className="place-self-center w-12 text-center badge-green">
                        {branch?.attendances?.Hadir || 0}%
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
                          render: (branch) => (
                              <div className="place-self-center w-12 text-center badge-primary">
                                  {branch?.attendances?.Terlambat || 0}%
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
                render: (branch) => (
                    <div className="place-self-center w-12 text-center badge-yellow">
                        {branch?.attendances?.Izin || 0}%
                    </div>
                ),
            },
            {
                key: "sick",
                label: "Sakit",
                sortable: true,
                cellAlign: "center",
                headerAlign: "center",
                render: (branch) => (
                    <div className="place-self-center w-12 text-center badge-violet">
                        {branch?.attendances?.Sakit || 0}%
                    </div>
                ),
            },
            {
                key: "absent",
                label: "Alpha",
                sortable: true,
                cellAlign: "center",
                headerAlign: "center",
                render: (branch) => (
                    <div className="place-self-center w-12 text-center badge-red">
                        {branch?.attendances?.["Tanpa Keterangan"] || 0}%
                    </div>
                ),
            },
            {
                key: "actions",
                label: "Aksi",
                headerAlign: "center",
                render: (branch) => (
                    <div className="place-self-center">
                        <button
                            className="btn-primary-outline"
                            disabled={!branch?.branchId}
                            onClick={() =>
                                branch?.branchId &&
                                setFilterState((prev) => ({
                                    ...prev,
                                    currentView: "teachingGroupsTable",
                                    selectedBranch: branch.branchId,
                                    selectedBranchYear: branch.branchYearId,
                                    selectedTeachingGroup: null,
                                    selectedSubBranch: null,
                                    selectedClass: null,
                                }))
                            }
                        >
                            Lihat Detail
                        </button>
                    </div>
                ),
            },
        ],
        [auth.userRole, setFilterState]
    );

    return (
        <DataTable
            data={branchesData}
            columns={branchColumns}
            searchableColumns={["branchName"]}
            initialSort={{ key: "branchName", direction: "ascending" }}
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

export default BranchesPerformanceTable;
