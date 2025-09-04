import { Link, useNavigate } from "react-router-dom";
import { GraduationCap, PlusIcon, Trash } from "lucide-react";

const TeachersTable = ({
    teachers,
    auth,
    classData,
    removeHandler,
    classId,
}) => {
    const navigate = useNavigate();

    const getInitials = (name) => {
        return name
            ?.split(" ")
            .map((word) => word[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);
    };

    return (
        <div className="mb-8">
            <div className="mb-4 flex justify-between items-end">
                <div className="flex gap-1 items-center">
                    <GraduationCap className="mr-2 h-5 w-5 text-gray-600" />
                    <h2 className="text-xl font-medium text-gray-800">
                        Guru
                    </h2>
                </div>
                {auth.userRole === "subBranchAdmin" &&
                    classData.class.isLocked === false &&
                    classData.class.teachingGroupId.branchYearId
                        .academicYearId.isActive === true && (
                        <Link
                            to={`/dashboard/classes/${classId}/add-teachers`}
                        >
                            <button className="button-primary pl-[11px] mt-0">
                                <PlusIcon className="w-4 h-4 mr-2" />
                                Tambah Guru
                            </button>
                        </Link>
                    )}
            </div>
            <div className="rounded-md bg-white shadow-xs overflow-auto text-nowrap">
                <table className="w-full">
                    <thead className="bg-white">
                        <tr>
                            <th className="pl-6 py-3 text-left text-sm font-medium text-gray-500"></th>
                            <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">
                                Nama
                            </th>
                            <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">
                                NIG
                            </th>
                            <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">
                                Posisi
                            </th>
                            <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">
                                Nomor WA
                            </th>
                            {auth.userRole !== "teacher" &&
                                classData.class.isLocked === false &&
                                classData.class.teachingGroupId
                                    .branchYearId.academicYearId
                                    .isActive === true && (
                                    <th className="p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Atur
                                    </th>
                                )}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {teachers.map((teacher) => (
                            <tr
                                onClick={(e) => {
                                    e.stopPropagation();
                                    navigate(
                                        `/dashboard/teachers/${teacher._id}`
                                    );
                                }}
                                key={teacher._id}
                                className="hover:bg-gray-50 hover:cursor-pointer transition"
                            >
                                <td className="p-4 ">
                                    {teacher.image ? (
                                        <img
                                            src={
                                                teacher.thumbnail
                                                    ? teacher.thumbnail
                                                    : `${
                                                          import.meta.env
                                                              .VITE_BACKEND_URL
                                                      }/${teacher.image}`
                                            }
                                            alt={teacher.name}
                                            className="w-10 h-10 rounded-full min-w-10 border border-gray-200 bg-white"
                                        />
                                    ) : (
                                        <div
                                            className={`w-10 h-10 rounded-full bg-green-200 text-green-500 flex items-center justify-center font-medium`}
                                        >
                                            {getInitials(teacher.name)}
                                        </div>
                                    )}
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-900">
                                    {teacher.name}
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-600">
                                    {teacher.nig}
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-600">
                                    {teacher.position}
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-600">
                                    {teacher.phone}
                                </td>
                                {auth.userRole !== "teacher" &&
                                    classData.class.isLocked === false &&
                                    classData.class.teachingGroupId
                                        .branchYearId.academicYearId
                                        .isActive === true &&
                                    teacher.userId?.subBranchId?._id ===
                                        auth.userSubBranchId && (
                                        <td className="flex gap-4 py-4">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    removeHandler(
                                                        "teacher",
                                                        teacher.name,
                                                        teacher._id
                                                    );
                                                }}
                                                className="btn-icon-danger"
                                            >
                                                <Trash size={20} />
                                            </button>
                                        </td>
                                    )}
                            </tr>
                        ))}
                        {teachers.length === 0 && (
                            <tr className="">
                                <td
                                    colSpan="5"
                                    className="px-6 py-4 text-sm text-gray-500 text-center"
                                >
                                    Belum ada guru untuk kelas ini
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default TeachersTable;
