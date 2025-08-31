import { useMemo } from "react";
import DataTable from "../../shared/Components/UIElements/DataTable";

const SubBranchPerformanceTable = ({ data, filterState, setFilterState }) => {
    const filteredData = useMemo(
        () =>
            data.filter(
                (item) =>
                    item.teachingGroupId === filterState.selectedTeachingGroup
            ),
        [data, filterState.selectedTeachingGroup]
    );

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
            render: (subBranch) => (
                <div className="badge-green w-12 place-self-center text-center">
                    {subBranch?.attendances?.Hadir || 0}%
                </div>
            ),
        },
        {
            key: "late",
            label: "Terlambat",
            sortable: true,
            cellAlign: "center",
            headerAlign: "center",
            render: (subBranch) => (
                <div className="badge-primary w-12 place-self-center text-center">
                    {subBranch?.attendances?.Terlambat || 0}%
                </div>
            ),
        },
        {
            key: "permission",
            label: "Izin",
            sortable: true,
            cellAlign: "center",
            headerAlign: "center",
            render: (subBranch) => (
                <div className="badge-yellow w-12 place-self-center text-center">
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
                <div className="badge-violet w-12 place-self-center text-center">
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
                <div className="badge-red w-12 place-self-center text-center">
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
                            console.log(filterState);
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
        />
    );
};

export default SubBranchPerformanceTable;
