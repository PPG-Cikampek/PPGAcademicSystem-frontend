import { useContext, useMemo } from "react";
import DataTable from "../../shared/Components/UIElements/DataTable";
import { useAttendancePerformance } from "../../shared/queries/useAttendancePerformances";
import { AuthContext } from "../../shared/Components/Context/auth-context";

const SubBranchesPerformanceTable = ({ filterState, setFilterState }) => {
    const auth = useContext(AuthContext);

    const requestFilters = useMemo(() => {
        if (
            !filterState.selectedAcademicYear ||
            !filterState.selectedTeachingGroup ||
            !auth?.currentBranchYearId
        ) {
            return null;
        }

        return {
            academicYearId: filterState.selectedAcademicYear,
            branchYearId: auth.currentBranchYearId,
            branchId: auth.userBranchId,
            teachingGroupId: filterState.selectedTeachingGroup,
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
        filterState.selectedTeachingGroup,
        filterState.selectedSubBranch,
        filterState.selectedClass,
        filterState.startDate,
        filterState.endDate,
    ]);

    const { data, isLoading } = useAttendancePerformance(
        requestFilters ?? {},
        {
            enabled: !!requestFilters,
        }
    );

    const filteredData = useMemo(
        () =>
            (data?.studentsDataBySubBranch || []).filter(
                (item) =>
                    item.teachingGroupId === filterState.selectedTeachingGroup
            ),
        [data?.studentsDataBySubBranch, filterState.selectedTeachingGroup]
    );

    const userRole = JSON.parse(localStorage.getItem("userData")).role;

    const subBranchColumns = useMemo(() => [
        {
            key: "subBranchName",
            label: "Nama Kelompok",
            sortable: true,
            render: (subBranch) => (
                <span>Kelompok {subBranch.subBranchName}</span>
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
            render: (subBranch) => (
                <div className="place-self-center w-12 text-center badge-green">
                    {subBranch?.attendances?.Hadir || 0}%
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
                      render: (subBranch) => (
                          <div className="place-self-center w-12 text-center badge-primary">
                              {subBranch?.attendances?.Terlambat || 0}%
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
            render: (subBranch) => (
                <div className="place-self-center w-12 text-center badge-yellow">
                    {subBranch?.attendances?.Izin || 0}%
                </div>
            ),
        },
        {
            key: "sick",
            label: "Sakit",
            sortable: true,
            cellAlign: "center",
            headerAlign: "center",
            render: (subBranch) => (
                <div className="place-self-center w-12 text-center badge-violet">
                    {subBranch?.attendances?.Sakit || 0}%
                </div>
            ),
        },
        {
            key: "absent",
            label: "Alpha",
            sortable: true,
            cellAlign: "center",
            headerAlign: "center",
            render: (subBranch) => (
                <div className="place-self-center w-12 text-center badge-red">
                    {subBranch?.attendances["Tanpa Keterangan"]
                        ? subBranch.attendances["Tanpa Keterangan"]
                        : 0}
                    %
                </div>
            ),
        },
        {
            key: "actions",
            label: "Aksi",
            headerAlign: "center",
            render: (subBranch) => (
                <div className="place-self-center">
                    <button
                        className="btn-primary-outline"
                        onClick={() => {
                            setFilterState({
                                ...filterState,
                                currentView: "classesTable",
                                selectedSubBranch: subBranch.subBranchId,
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
            data={filteredData}
            columns={subBranchColumns}
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

export default SubBranchesPerformanceTable;
