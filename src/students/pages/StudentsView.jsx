import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { useStudents } from "../../shared/queries";
import { AuthContext } from "../../shared/Components/Context/auth-context";
import StudentInitial from "../../shared/Components/UIElements/StudentInitial";
import WarningCard from "../../shared/Components/UIElements/WarningCard";
import DataTable from "../../shared/Components/UIElements/DataTable";

const StudentsView = () => {
    const navigate = useNavigate();
    const auth = useContext(AuthContext);
    const { data: students = [], isLoading } = useStudents({
        role: auth.userRole,
        branchId: auth.userBranchId,
        subBranchId: auth.userSubBranchId,
    });

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
                        className="bg-white m-auto border border-gray-200 rounded-full size-10 shrink-0"
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
        <div className="md:p-8 px-4 py-8 min-h-screen">
            <div className="mx-auto max-w-6xl">
                <div className="flex flex-col justify-between items-stretch gap-2 mb-4">
                    <h1 className="font-semibold text-gray-900 text-2xl">
                        Daftar Peserta Didik
                    </h1>
                    <WarningCard
                        className="justify-start items-center"
                        warning="Penambahan peserta didik Baru dapat dilakukan melalui fitur Pendaftaran Akun"
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
