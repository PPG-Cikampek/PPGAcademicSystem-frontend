import { useMemo } from "react";
import DataTable from "../../shared/Components/UIElements/DataTable";

const TeachingGroupPerformanceTable = ({
    data,
    filterState,
    setFilterState,
}) => {
    const tgColumns = useMemo(() => [
        {
            key: "tgName",
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
            render: (tg) => (
                <div className="badge-green w-12 place-self-center text-center">
                    {tg?.attendances?.Hadir || 0}%
                </div>
            ),
        },
        {
            key: "late",
            label: "Terlambat",
            sortable: true,
            cellAlign: "center",
            headerAlign: "center",
            render: (tg) => (
                <div className="badge-primary w-12 place-self-center text-center">
                    {tg?.attendances?.Terlambat || 0}%
                </div>
            ),
        },
        {
            key: "permission",
            label: "Izin",
            sortable: true,
            cellAlign: "center",
            headerAlign: "center",
            render: (tg) => (
                <div className="badge-yellow w-12 place-self-center text-center">
                    {tg?.attendances?.Izin || 0}%
                </div>
            ),
        },
        {
            key: "sick",
            label: "Sakit",
            sortable: true,
            cellAlign: "center",
            headerAlign: "center",
            render: (tg) => (
                <div className="badge-violet w-12 place-self-center text-center">
                    {tg?.attendances?.Sakit || 0}%
                </div>
            ),
        },
        {
            key: "absent",
            label: "Alpha",
            sortable: true,
            cellAlign: "center",
            headerAlign: "center",
            render: (tg) => (
                <div className="badge-red w-12 place-self-center text-center">
                    {tg?.attendances["Tanpa Keterangan"]
                        ? tg.attendances["Tanpa Keterangan"]
                        : 0}
                    %
                </div>
            ),
        },
        {
            key: "actions",
            label: "Aksi",
            headerAlign: "center",
            render: (tg) => (
                <div className="place-self-center">
                    <button
                        className="btn-primary-outline"
                        onClick={() =>
                            setFilterState({
                                ...filterState,
                                currentView: "studentsTable",
                                selectedClass: tg.classId,
                            })
                        }
                    >
                        Lihat Detail
                    </button>
                </div>
            ),
        },
    ]);

    return (
        <DataTable
            data={data}
            columns={tgColumns}
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

export default TeachingGroupPerformanceTable;
