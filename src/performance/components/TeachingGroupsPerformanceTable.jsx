import { useMemo } from "react";
import DataTable from "../../shared/Components/UIElements/DataTable";

const TeachingGroupsPerformanceTable = ({
    data,
    filterState,
    setFilterState,
}) => {
    const userRole = JSON.parse(localStorage.getItem("userData")).role;

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
                <div className="badge-green w-12 place-self-center text-center">
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
                          <div className="badge-primary w-12 place-self-center text-center">
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
                <div className="badge-yellow w-12 place-self-center text-center">
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
                <div className="badge-violet w-12 place-self-center text-center">
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
                <div className="badge-red w-12 place-self-center text-center">
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
            data={data}
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
        />
    );
};

export default TeachingGroupsPerformanceTable;
