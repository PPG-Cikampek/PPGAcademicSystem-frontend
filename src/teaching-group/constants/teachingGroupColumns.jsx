import { Eye, KeyRound, Lock, LockOpen, Pencil, Trash } from "lucide-react";
import { Link } from "react-router-dom";

export const subBranchColumns = (
    teachingGroupId,
    teachingGroupData,
    removeSubBranchHandler,
    userRole
) => [
    {
        key: "name",
        label: "Nama",
        sortable: true,
        headerAlign: "left",
        cellAlign: "left",
    },
    {
        key: "address",
        label: "Alamat Kegiatan",
        sortable: true,
        headerAlign: "left",
        cellAlign: "left",
    },
    {
        key: "teacherCount",
        label: "Jumlah Guru",
        sortable: true,
        headerAlign: "center",
        cellAlign: "center",
    },
    {
        key: "studentCount",
        label: "Jumlah Siswa",
        sortable: true,
        headerAlign: "center",
        cellAlign: "center",
    },
    {
        key: "attendancePerformance",
        label: "Kehadiran",
        sortable: true,
        headerAlign: "center",
        cellAlign: "center",
    },
    {
        key: "action",
        label: "Aksi",
        sortable: false,
        headerAlign: "center",
        cellAlign: "center",
        render: (item) => (
            <>
                <Link
                    to={`/dashboard/teaching-groups/${teachingGroupId}/sub-branches/${item._id}`}
                >
                    <button className="btn-icon-primary" disabled={true}>
                        <Eye size={20} />
                    </button>
                </Link>
                {teachingGroupData?.branchYearId?.academicYearId.isActive &&
                    teachingGroupData?.isLocked === false && userRole === "branchAdmin" && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                removeSubBranchHandler(item.name, item._id);
                            }}
                            className="btn-icon-danger"
                        >
                            <Trash size={20} />
                        </button>
                    )}
            </>
        ),
    },
];

export const classColumns = (
    teachingGroupId,
    teachingGroupData,
    auth,
    lockClassHandler,
    editClassHandler,
    removeClassHandler
) => [
    {
        key: "name",
        label: "Nama",
        sortable: true,
        headerAlign: "left",
        cellAlign: "left",
    },
    {
        key: "startTime",
        label: "Waktu Mulai",
        sortable: true,
        headerAlign: "center",
        cellAlign: "center",
        cellStyle: () => "text-center",
    },
    {
        key: "endTime",
        label: "Waktu Selesai",
        sortable: true,
        headerAlign: "center",
        cellAlign: "center",
    },
    {
        key: "teacherCount",
        label: "Jumlah Guru",
        sortable: true,
        headerAlign: "center",
        cellAlign: "center",
        render: (item) => (item.teachers ? item.teachers.length : 0),
    },
    {
        key: "studentCount",
        label: "Jumlah Siswa",
        sortable: true,
        headerAlign: "center",
        cellAlign: "center",
        render: (item) => (item.students ? item.students.length : 0),
    },
    {
        key: "attendancePerformance",
        label: "Kehadiran",
        sortable: true,
        headerAlign: "center",
        cellAlign: "center",
    },
    {
        key: "isLocked",
        label: "status",
        sortable: true,
        headerAlign: "center",
        cellAlign: "center",
        render: (item) =>
            item.isLocked ? <Lock size={16} /> : <LockOpen size={16} />,
        cellStyle: (item) =>
            `m-auto flex justify-center items-center p-1 border-2 rounded-md size-6 ${
                item.isLocked
                    ? "text-white bg-green-400 border-green-400"
                    : "text-white bg-red-400 border-red-400"
            }`,
    },
    {
        key: "action",
        label: "Aksi",
        sortable: false,
        headerAlign: "center",
        cellAlign: "center",
        render: (item) => (
            <>
                <Link to={`/dashboard/classes/${item._id}`}>
                    <button className="btn-icon-primary">
                        <Eye size={20} />
                    </button>
                </Link>
                {auth.userRole === "branchAdmin" &&
                    teachingGroupData?.branchYearId?.academicYearId.isActive &&
                    teachingGroupData?.isLocked === false && (
                        <>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    item.isLocked
                                        ? lockClassHandler(
                                              "unlock",
                                              item.name,
                                              item._id
                                          )
                                        : lockClassHandler(
                                              "lock",
                                              item.name,
                                              item._id
                                          );
                                }}
                                className="btn-icon-secondary"
                            >
                                <KeyRound size={20} />
                            </button>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    editClassHandler(item.name, item._id);
                                }}
                                className="btn-icon-primary"
                            >
                                <Pencil size={18} />
                            </button>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    removeClassHandler(item.name, item._id);
                                }}
                                className="btn-icon-danger"
                            >
                                <Trash size={20} />
                            </button>
                        </>
                    )}
            </>
        ),
    },
];
