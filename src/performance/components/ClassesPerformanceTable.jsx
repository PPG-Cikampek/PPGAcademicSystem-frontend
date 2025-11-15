import { useContext, useMemo } from "react";
import DataTable from "../../shared/Components/UIElements/DataTable";
import { useAttendancePerformance } from "../../shared/queries/useAttendancePerformances";
import { AuthContext } from "../../shared/Components/Context/auth-context";

const ClassesPerformanceTable = ({ filterState, setFilterState }) => {
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
                    filterState.selectedBranchYear || auth.currentBranchYearId,
                branchId: auth.userBranchId,
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
        filterState.selectedAcademicYear,
        filterState.selectedBranchYear,
        filterState.selectedClass,
        filterState.selectedSubBranch,
        filterState.selectedTeachingGroup,
        filterState.startDate,
        filterState.endDate,
    ]);

    const { data, isLoading } = useAttendancePerformance(
        requestFilters ?? {},
        {
            enabled: !!requestFilters,
        }
    );

    const tableData = useMemo(() => {
        if (!data?.studentsDataByClass) {
            return [];
        }

        if (
            (auth.userRole === "admin" || auth.userRole === "branchAdmin") &&
            filterState.selectedSubBranch
        ) {
            return data.studentsDataByClass.filter(
                (cls) => cls.subBranchId === filterState.selectedSubBranch
            );
        }

        return data.studentsDataByClass;
    }, [
        auth.userRole,
        data?.studentsDataByClass,
        filterState.selectedSubBranch,
    ]);

    const clsColumns = useMemo(
        () => [
            {
                key: "clsName",
                label: "Nama",
                sortable: true,
            },
            {
                key: "studentsCount",
                label: "Jumlah Siswa",
                cellAlign: "center",
                headerAlign: "center",
                sortable: true,
            },
            {
                key: "attendancesCount",
                label: "Total Pertemuan",
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
                render: (cls) => (
                    <div className="place-self-center w-12 text-center badge-green">
                        {cls?.attendances?.Hadir || 0}%
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
                          render: (cls) => (
                              <div className="place-self-center w-12 text-center badge-primary">
                                  {cls?.attendances?.Terlambat || 0}%
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
                render: (cls) => (
                    <div className="place-self-center w-12 text-center badge-yellow">
                        {cls?.attendances?.Izin || 0}%
                    </div>
                ),
            },
            {
                key: "sick",
                label: "Sakit",
                sortable: true,
                cellAlign: "center",
                headerAlign: "center",
                render: (cls) => (
                    <div className="place-self-center w-12 text-center badge-violet">
                        {cls?.attendances?.Sakit || 0}%
                    </div>
                ),
            },
            {
                key: "absent",
                label: "Alpha",
                sortable: true,
                cellAlign: "center",
                headerAlign: "center",
                render: (cls) => (
                    <div className="place-self-center w-12 text-center badge-red">
                        {cls?.attendances["Tanpa Keterangan"]
                            ? cls.attendances["Tanpa Keterangan"]
                            : 0}
                        %
                    </div>
                ),
            },
            {
                key: "actions",
                label: "Aksi",
                headerAlign: "center",
                render: (cls) => (
                    <div className="place-self-center">
                        <button
                            className="btn-primary-outline"
                            onClick={() =>
                                setFilterState({
                                    ...filterState,
                                    currentView: "studentsTable",
                                    selectedClass: cls.classId,
                                })
                            }
                        >
                            Lihat Detail
                        </button>
                    </div>
                ),
            },
        ],
        [auth.userRole, filterState, setFilterState]
    );

    return (
        <DataTable
            data={tableData}
            columns={clsColumns}
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

export default ClassesPerformanceTable;
