import { Link, useNavigate } from "react-router-dom";
import { Users, PlusIcon, Trash } from "lucide-react";

const StudentsTable = ({
    students,
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
        <div>
            <div className="mb-4 flex justify-between items-end">
                <div className="flex gap-1 items-center">
                    <Users className="mr-2 h-5 w-5 text-gray-600" />
                    <h2 className="text-xl font-medium text-gray-800">
                        Siswa
                    </h2>
                </div>
                {auth.userRole === "subBranchAdmin" &&
                    classData.class.isLocked === false &&
                    classData.class.teachingGroupId.branchYearId
                        .academicYearId.isActive === true && (
                        <Link
                            to={`/dashboard/classes/${classId}/add-students`}
                        >
                            <button className="button-primary pl-[11px] mt-0">
                                <PlusIcon className="w-4 h-4 mr-2" />
                                Tambah Siswa
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
                                NIS
                            </th>
                            <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">
                                Nama
                            </th>
                            <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">
                                Kelompok
                            </th>
                            {auth.userRole !== "teacher" &&
                                classData.class.isLocked === false &&
                                classData.class.teachingGroupId
                                    .branchYearId.academicYearId
                                    .isActive === true && (
                                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">
                                        Atur
                                    </th>
                                )}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {students.map((student) => (
                            <tr
                                onClick={(e) => {
                                    e.stopPropagation();
                                    navigate(
                                        `/dashboard/students/${student._id}`
                                    );
                                }}
                                key={student._id}
                                className="hover:bg-gray-50 hover:cursor-pointer transition"
                            >
                                <td className="p-4">
                                    {student.image ? (
                                        <img
                                            src={
                                                student.thumbnail
                                                    ? student.thumbnail
                                                    : `${
                                                          import.meta.env
                                                              .VITE_BACKEND_URL
                                                      }/${student.image}`
                                            }
                                            alt={student.name}
                                            className="w-10 h-10 rounded-full min-w-10 border border-gray-200 bg-white"
                                        />
                                    ) : (
                                        <div
                                            className={`w-10 h-10 rounded-full bg-blue-200 text-blue-500 flex items-center justify-center font-medium`}
                                        >
                                            {getInitials(student.name)}
                                        </div>
                                    )}
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-900">
                                    {student.nis}
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-900">
                                    {student.name}
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-600">
                                    {student.userId?.subBranchId?.name || ""}
                                </td>
                                {auth.userRole === "subBranchAdmin" &&
                                    classData.class.isLocked === false &&
                                    classData.class.teachingGroupId
                                        .branchYearId.academicYearId
                                        .isActive === true &&
                                    student.userId?.subBranchId?._id ===
                                        auth.userSubBranchId && (
                                        <td className="flex gap-4 py-4">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    removeHandler(
                                                        "student",
                                                        student.name,
                                                        student._id
                                                    );
                                                }}
                                                className="p-3 rounded-full  hover:bg-gray-200 text-red-500 hover:text-red-700 transition"
                                            >
                                                <Trash size={20} />
                                            </button>
                                        </td>
                                    )}
                            </tr>
                        ))}
                        {students.length === 0 && (
                            <tr className="">
                                <td
                                    colSpan="4"
                                    className="px-6 py-4 text-sm text-gray-500 text-center"
                                >
                                    Belum ada siswa terdaftar di kelas ini.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default StudentsTable;
