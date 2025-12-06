import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { useTeachers } from "../../shared/queries";
import { AuthContext } from "../../shared/Components/Context/auth-context";

import WarningCard from "../../shared/Components/UIElements/WarningCard";
import DataTable from "../../shared/Components/UIElements/DataTable";
import getTeacherPositionName from "../../shared/Utilities/getTeacherPositionName";

const TeachersView = () => {
    const navigate = useNavigate();
    const auth = useContext(AuthContext);
    const { data: teachers = [], isLoading } = useTeachers({
        role: auth.userRole,
        branchId: auth.userBranchId,
        subBranchId: auth.userSubBranchId,
    });

    const getInitials = (gender) => {
        return gender
            ?.split(" ")
            .map((word) => word[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);
    };

    const columns = [
        {
            key: "image",
            label: "",
            render: (teacher) =>
                teacher.image ? (
                    <img
                        src={
                            teacher.thumbnail
                                ? teacher.thumbnail
                                : `${import.meta.env.VITE_BACKEND_URL}/${
                                      teacher.image
                                  }`
                        }
                        alt={teacher.name}
                        className="bg-white m-auto border border-gray-200 rounded-full min-w-10 size-10"
                    />
                ) : (
                    <div className="flex justify-center items-center bg-blue-200 m-auto rounded-full size-10 font-medium text-blue-500">
                        {getInitials(teacher.name)}
                    </div>
                ),
        },
        {
            key: "status",
            label: "Status",
            render: (teacher) =>
                teacher.positionEndDate ? "Tidak Aktif" : "Aktif",
            cellStyle: (teacher) =>
                `py-1 px-2 text-sm text-center w-min border rounded-md ${
                    teacher.positionEndDate
                        ? "text-red-500 bg-red-100"
                        : "text-green-500 bg-green-100"
                }`,
        },
        {
            key: "position",
            label: "Dapukan",
            sortable: true,
            render: (teacher) => getTeacherPositionName(teacher.position),
        },
        { key: "nig", label: "NIG", sortable: true },
        { key: "name", label: "Nama", sortable: true },
        ...(auth.userRole === "admin"
            ? [
                  {
                      key: "branch",
                      label: "Desa",
                      sortable: true,
                      render: (teacher) =>
                          teacher?.userId?.subBranchId?.branchId?.name,
                  },
                  {
                      key: "group",
                      label: "Kelompok",
                      sortable: true,
                      render: (teacher) => teacher?.userId?.subBranchId?.name,
                  },
              ]
            : []),
        ...(auth.userRole === "branchAdmin"
            ? [
                  {
                      key: "group",
                      label: "Kelompok",
                      sortable: true,
                      render: (teacher) => teacher?.userId?.subBranchId?.name,
                  },
              ]
            : []),
        {
            key: "isProfileComplete",
            label: "Profile",
            render: (teacher) =>
                teacher.isProfileComplete ? "Lengkap" : "Lengkapi",
            cellStyle: (teacher) =>
                `${
                    teacher.isProfileComplete
                        ? "text-green-500"
                        : "text-red-500 hover:underline cursor-pointer"
                }`,
        },
    ];

    const filterOptions = [
        {
            key: "status",
            label: "Status",
            options: ["Aktif", "Tidak Aktif"],
        },
        {
            key: "isProfileComplete",
            label: "Kelengkapan Profil",
            options: ["Lengkap", "Lengkapi"],
        },
    ];

    if (teachers?.length > 0) {
        const branches = [
            ...new Set(
                teachers
                    .map((s) => s?.userId?.subBranchId?.branchId?.name)
                    .filter(Boolean)
            ),
        ];
        const subBranches = [
            ...new Set(
                teachers
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
                <div className="flex flex-col justify-between items-start gap-2 mb-4">
                    <h1 className="font-semibold text-gray-900 text-2xl">
                        Daftar Tenaga Pendidik
                    </h1>
                    <WarningCard
                        className="justify-start items-center"
                        warning="Penambahan tenaga pendidik baru dapat dilakukan melalui fitur Pendaftaran Akun."
                    />
                </div>

                {teachers && (
                    <DataTable
                        data={teachers}
                        columns={columns}
                        onRowClick={(teacher) =>
                            navigate(`/dashboard/teachers/${teacher._id}`)
                        }
                        searchableColumns={["name", "nig"]}
                        initialSort={{ key: "name", direction: "ascending" }}
                        isLoading={isLoading}
                        filterOptions={filterOptions}
                        tableId="teachers-table" // <-- Add unique tableId
                    />
                )}
            </div>
        </div>
    );
};

export default TeachersView;
