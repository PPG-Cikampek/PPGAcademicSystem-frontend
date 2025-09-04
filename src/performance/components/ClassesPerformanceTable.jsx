import { useContext, useMemo } from "react";
import DataTable from "../../shared/Components/UIElements/DataTable";
import { useAttendancePerformance } from "../../shared/queries/useAttendancePerformances";
import { AuthContext } from "../../shared/Components/Context/auth-context";

const ClassesPerformanceTable = ({
    data,
    filterState,
    setFilterState,
    selectedSubBranch,
    startDate,
    endDate,
}) => {
    console.log(selectedSubBranch);
    console.log(data);
    const auth = useContext(AuthContext);

    let filteredData;
    if (data && auth.userRole !== "teacher") {
        filteredData = useMemo(
            () =>
                data.filter(
                    (item) => item.subBranchId === filterState.selectedSubBranch
                ),
            [data, filterState.selectedSubBranch]
        );
    }

    const { data: attendanceData, isLoading } = useAttendancePerformance(
        {
            branchYearId: auth.currentBranchYearId,
            branchId: auth.userBranchId,
            subBranchId: selectedSubBranch,
            startDate: startDate ? startDate.toISOString() : null,
            endDate: endDate ? endDate.toISOString() : null,
        }
        // {
        //     enabled: !data && !!selectedSubBranch,
        // }
    );

    attendanceData
        ? console.log(attendanceData)
        : console.log("No attendance data available");

    const clsColumns = useMemo(() => [
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
                <div className="badge-green w-12 place-self-center text-center">
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
                          <div className="badge-primary w-12 place-self-center text-center">
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
                <div className="badge-yellow w-12 place-self-center text-center">
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
                <div className="badge-violet w-12 place-self-center text-center">
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
                <div className="badge-red w-12 place-self-center text-center">
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
    ]);

    return (
        <DataTable
            data={
                auth.userRole === "subBranchAdmin" ||
                auth.userRole === "teacher"
                    ? data
                    : attendanceData.studentsDataByClass
            }
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
