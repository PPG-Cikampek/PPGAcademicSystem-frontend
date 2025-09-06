import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../shared/Components/Context/auth-context";
import { attendanceCount } from "../../shared/Utilities/attendanceCount";
import useHttp from "../../shared/hooks/http-hook";
import LoadingCircle from "../../shared/Components/UIElements/LoadingCircle";
import DataTable from "../../shared/Components/UIElements/DataTable";

const SubBranchAdminClassesView = () => {
    const [classes, setClasses] = useState();
    const { isLoading, error, sendRequest } = useHttp();

    const navigate = useNavigate();
    const auth = useContext(AuthContext);
    console.log(auth.userSubBranchId);

    useEffect(() => {
        const url = `${
            import.meta.env.VITE_BACKEND_URL
        }/classes/teaching-group/${auth.userSubBranchId}`;

        const fetchClasses = async () => {
            console.log(url);
            try {
                const responseData = await sendRequest(url);
                setClasses(responseData.classes);
                console.log(responseData.classes);
                console.log(responseData.classes);
            } catch (err) {
                // Error is handled by useHttp
            }
        };
        fetchClasses();
    }, [sendRequest]);

    const columns = [
        { key: "name", label: "Nama Kelas", sortable: true },
        { key: "startTime", label: "Waktu Mulai", sortable: true },
        {
            key: "teachers",
            label: "Guru",
            sortable: true,
            render: (row) => row.teachers?.length ?? row.teachers,
        },
        {
            key: "students",
            label: "Siswa",
            sortable: true,
            render: (row) => row.students?.length ?? row.students,
        },
        {
            key: "isLocked",
            label: "Status",
            sortable: true,
            render: (row) => (row.isLocked ? "Terkunci" : "Terbuka"),
        },
        // { key: 'attendances', label: 'Pertemuan', sortable: true, render: (row) => row.attendances ?? (typeof attendanceCount === 'function' ? attendanceCount(row) : '-') },
    ];

    const filterOptions = [
        {
            key: "name",
            label: "Nama Kelas",
            options: Array.from(new Set((classes || []).map((c) => c.name))),
        },
        {
            key: "startTime",
            label: "Waktu Mulai",
            options: Array.from(
                new Set((classes || []).map((c) => c.startTime))
            ),
        },
    ];

    return (
        <div className="min-h-screen px-4 py-8 md:p-8">
            <div className="max-w-6xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-semibold text-gray-900">
                        Daftar Kelas
                    </h1>
                </div>
                {isLoading && (
                    <div className="flex justify-center mt-16">
                        <LoadingCircle size={32} />
                    </div>
                )}
                {classes && (
                    <DataTable
                        data={classes}
                        columns={columns}
                        onRowClick={(cls) =>
                            navigate(`/dashboard/classes/${cls._id}`)
                        }
                        searchableColumns={["name"]}
                        initialSort={{ key: "name", direction: "ascending" }}
                        isLoading={isLoading}
                        // filterOptions={filterOptions}
                        tableId="teaching-group-admin-classes"
                    />
                )}
            </div>
        </div>
    );
};

export default SubBranchAdminClassesView;
