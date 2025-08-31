import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import useHttp from "../../shared/hooks/http-hook";
import { AuthContext } from "../../shared/Components/Context/auth-context";
import StudentInitial from "../../shared/Components/UIElements/StudentInitial";
import WarningCard from "../../shared/Components/UIElements/WarningCard";
import DataTable from "../../shared/Components/UIElements/DataTable";

const StudentsView = () => {
    const [students, setStudents] = useState([]);
    const { isLoading, sendRequest } = useHttp();
    const navigate = useNavigate();
    const auth = useContext(AuthContext);

    useEffect(() => {
        const url =
            auth.userRole === "admin"
                ? `${import.meta.env.VITE_BACKEND_URL}/students`
                : auth.userRole === "branchAdmin"
                ? `${import.meta.env.VITE_BACKEND_URL}/students/branch/${
                      auth.userBranchId
                  }`
                : `${import.meta.env.VITE_BACKEND_URL}/students/sub-branch/${
                      auth.userSubBranchId
                  }`;

        const fetchStudents = async () => {
            try {
                const responseData = await sendRequest(url);
                setStudents(responseData.students);
                console.log(responseData.students);
            } catch (err) {
                // Error is handled by useHttp
            }
        };
        fetchStudents();
    }, [sendRequest]);

    const columns = [
        {
            key: "image",
            label: "",
            sortable: false,
            render: (student) =>
                student.image ? (
                    <img
                        src={
                            student.thumbnail
                                ? student.thumbnail
                                : `${import.meta.env.VITE_BACKEND_URL}/${
                                      student.image
                                  }`
                        }
                        alt={student.name}
                        className="size-10 rounded-full m-auto shrink-0 border border-gray-200 bg-white"
                    />
                ) : (
                    <StudentInitial
                        studentName={student.name}
                        clsName={`size-10 shrink-0 rounded-full bg-blue-200 text-blue-500 flex items-center justify-center font-medium m-auto`}
                    />
                ),
        },

        {
            key: "isActive",
            label: "Status",
            sortable: true,
            render: (student) => (!student.isActive ? "Tidak Aktif" : "Aktif"),
            cellStyle: (student) =>
                `py-1 px-2 text-sm text-center w-min border rounded-md ${
                    !student.isActive
                        ? "text-red-500 bg-red-100"
                        : "text-green-500 bg-green-100"
                }`,
        },
        { key: "nis", label: "NIS", sortable: true },
        { key: "name", label: "Nama", sortable: true },
        {
            key: "isInternal",
            label: "Label",
            sortable: true,
            render: (student) =>
                student.isInternal ? "Internal" : "Simpatisan",
            cellStyle: (student) =>
                `py-1 px-2 text-sm text-center w-min border rounded-md ${
                    student.isInternal
                        ? "text-blue-500 bg-blue-100"
                        : "text-gray-500 bg-gray-100"
                }`,
        },
        ...(auth.userRole === "admin"
            ? [
                  {
                      key: "branch",
                      label: "Desa",
                      sortable: true,
                      render: (student) =>
                          student.userId.subBranchId.branchId.name,
                  },
                  {
                      key: "group",
                      label: "Kelompok",
                      sortable: true,
                      render: (student) => student.userId.subBranchId.name,
                  },
              ]
            : []),
        ...(auth.userRole === "branchAdmin"
            ? [
                  {
                      key: "group",
                      label: "Kelompok",
                      sortable: true,
                      render: (student) => student.userId.subBranchId.name,
                  },
              ]
            : []),
        {
            key: "isProfileComplete",
            label: "Profile",
            sortable: true,
            render: (student) =>
                student.isProfileComplete ? "Lengkap" : "Lengkapi",
            cellStyle: (student) =>
                `${
                    student.isProfileComplete
                        ? "text-green-500"
                        : "text-red-500 hover:underline cursor-pointer"
                }`,
        },
    ];

    const filterOptions = [
        {
            key: "isActive",
            label: "Status",
            options: ["Aktif", "Tidak Aktif"],
        },
        {
            key: "isProfileComplete",
            label: "Kelengkapan Profil",
            options: ["Lengkap", "Lengkapi"],
        },
    ];

    if (students?.length > 0) {
        const branches = [
            ...new Set(
                students
                    .map((s) => s?.userId?.subBranchId?.branchId?.name)
                    .filter(Boolean)
            ),
        ];
        const subBranches = [
            ...new Set(
                students
                    .map((s) => s?.userId?.subBranchId?.name)
                    .filter(Boolean)
            ),
        ];

        if (auth.userRole === "admin") {
            filterOptions.push(
                {
                    key: "branch",
                    label: "Desa",
                    options: branches,
                },
                {
                    key: "group",
                    label: "Kelompok",
                    options: subBranches,
                }
            );
        } else if (auth.userRole === "branchAdmin") {
            filterOptions.push({
                key: "group",
                label: "Kelompok",
                options: subBranches,
            });
        }
    }

    return (
        <div className="min-h-screen px-4 py-8 md:p-8">
            <div className="max-w-6xl mx-auto">
                <div className="flex flex-col justify-between items-stretch gap-2 mb-4">
                    <h1 className="text-2xl font-semibold text-gray-900">
                        Daftar Peserta Didik
                    </h1>
                    <WarningCard
                        className="items-center justify-start"
                        warning="Penambahan peserta didik Baru dapat dilakukan melalui fitur Pendaftaran Akun"
                        onClear={() => setError(null)}
                    />
                </div>
                {students && (
                    <DataTable
                        data={students}
                        columns={columns}
                        onRowClick={(student) =>
                            navigate(`/dashboard/students/${student._id}`)
                        }
                        searchableColumns={["name", "nis"]}
                        initialSort={{ key: "name", direction: "ascending" }}
                        isLoading={isLoading}
                        filterOptions={filterOptions}
                        tableId="students-table" // <-- Add unique tableId
                    />
                )}
            </div>
        </div>
    );
};

export default StudentsView;
