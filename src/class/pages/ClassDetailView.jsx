import { useState, useEffect, useContext } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { AuthContext } from "../../shared/Components/Context/auth-context";
import LoadingCircle from "../../shared/Components/UIElements/LoadingCircle";
import NewModal from "../../shared/Components/Modal/NewModal";
import useNewModal from "../../shared/hooks/useNewModal";
import SkeletonLoader from "../../shared/Components/UIElements/SkeletonLoader";

import {
    LineChart,
    Trash,
    LockOpen,
    Lock,
    Clock,
    Users,
    GraduationCap,
    Building,
    PlusIcon,
    KeyRound,
} from "lucide-react";
import ErrorCard from "../../shared/Components/UIElements/ErrorCard";
import {
    useClass,
    useLockClassMutation,
    useRemoveStudentFromClassMutation,
    useRemoveTeacherFromClassMutation,
} from "../../shared/queries";

const ClassDetailView = () => {
    const [classData, setClassData] = useState();
    const { modalState, openModal, closeModal } = useNewModal();

    const classId = useParams().classId;
    const auth = useContext(AuthContext);
    const navigate = useNavigate();

    const { data: fetchedClass, isLoading, error, refetch } = useClass(classId);
    const [modalLoading, setModalLoading] = useState(false);

    useEffect(() => {
        if (fetchedClass) {
            setClassData({ class: fetchedClass });
        }
    }, [fetchedClass]);

    const lockMutation = useLockClassMutation();

    const removeTeacherMutation = useRemoveTeacherFromClassMutation();

    const removeStudentMutation = useRemoveStudentFromClassMutation();

    const lockClassHandler = (className, classId) => {
        const teachingGroupId =
            classData?.class?.teachingGroupId?._id ||
            classData?.class?.teachingGroupId;

        const confirmLock = async () => {
            try {
                setModalLoading(true);
                const res = await lockMutation.mutateAsync({
                    classId,
                    actionType: "lock",
                    teachingGroupId,
                });
                // show success notification modal
                openModal(
                    res?.message || "Kelas berhasil dikunci",
                    "success",
                    null,
                    "Berhasil!"
                );
            } catch (err) {
                openModal(
                    err?.response?.data?.message ||
                        err?.message ||
                        "Terjadi kesalahan",
                    "error",
                    null,
                    "Gagal!"
                );
            } finally {
                setModalLoading(false);
            }
            return false;
        };

        openModal(
            `Kelas tidak akan bisa di-edit lagi!`,
            "confirmation",
            confirmLock,
            `Kunci kelas: ${className}?`,
            true
        );
    };

    const unlockClassHandler = (className, classId) => {
        const teachingGroupId =
            classData?.class?.teachingGroupId?._id ||
            classData?.class?.teachingGroupId;

        const confirmUnlock = async () => {
            try {
                setModalLoading(true);
                const res = await lockMutation.mutateAsync({
                    classId,
                    actionType: "unlock",
                    teachingGroupId,
                });
                openModal(
                    res?.message || "Kelas berhasil dibuka",
                    "success",
                    null,
                    "Berhasil!"
                );
            } catch (err) {
                openModal(
                    err?.response?.data?.message ||
                        err?.message ||
                        "Terjadi kesalahan",
                    "error",
                    null,
                    "Gagal!"
                );
            } finally {
                setModalLoading(false);
            }
            return false;
        };

        openModal(
            `Kelas dapat di-edit kembali`,
            "confirmation",
            confirmUnlock,
            `Buka kelas: ${className}?`,
            true
        );
    };

    const removeHandler = (role, name, id) => {
        const confirmRemove = async () => {
            try {
                setModalLoading(true);
                if (role === "teacher") {
                    const res = await removeTeacherMutation.mutateAsync({
                        classId,
                        teacherId: id,
                    });
                    openModal(
                        res?.message || "Guru dihapus",
                        "success",
                        null,
                        "Berhasil!"
                    );
                } else {
                    const res = await removeStudentMutation.mutateAsync({
                        classId,
                        studentId: id,
                    });
                    openModal(
                        res?.message || "Siswa dihapus",
                        "success",
                        null,
                        "Berhasil!"
                    );
                }
            } catch (err) {
                openModal(
                    err?.response?.data?.message ||
                        err?.message ||
                        "Terjadi kesalahan",
                    "error",
                    null,
                    "Gagal!"
                );
            } finally {
                setModalLoading(false);
            }
            return false;
        };

        openModal(
            `Hapus ${name} dari kelas ini?`,
            "confirmation",
            confirmRemove,
            "Konfirmasi Penghapusan",
            true
        );
    };

    const getInitials = (gender) => {
        return gender
            ?.split(" ")
            .map((word) => word[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);
    };

    // ModalFooter replaced by NewModal's built-in actions

    return (
        <div className="min-h-screen bg-gray-50 px-4 py-8 md:p-8 pb-24">
            <div className="max-w-6xl mx-auto">
                <NewModal
                    modalState={modalState}
                    onClose={closeModal}
                    isLoading={modalLoading}
                />

                {(!classData || isLoading) && (
                    <div className="flex flex-col gap-6 mt-16 px-4">
                        <SkeletonLoader
                            variant="text"
                            width="200px"
                            height="32px"
                            className="mb-4"
                        />
                        <SkeletonLoader
                            variant="rectangular"
                            height="100px"
                            className="rounded-lg"
                            count={3}
                        />
                    </div>
                )}

                {error && <ErrorCard error={error} onClear={() => refetch()} />}

                {classData && !isLoading && (
                    <>
                        <div className="mb-8">
                            <div className="flex items-center gap-4">
                                <h1 className="text-2xl font-semibold text-gray-900">
                                    {classData.class.name}
                                </h1>
                                {!classData.class.isLocked &&
                                    classData.class.teachingGroupId.branchYearId
                                        .academicYearId.isActive === true &&
                                    auth.userRole === "branchAdmin" && (
                                        <button
                                            onClick={() =>
                                                lockClassHandler(
                                                    classData.class.name,
                                                    classData.class._id
                                                )
                                            }
                                            disabled={classData.class.isLocked}
                                            className={`btn-primary-outline font-medium flex flex-row items-start gap-2 ${
                                                classData.class.isLocked
                                                    ? "text-blue-500 disabled:opacity-100"
                                                    : ""
                                            }`}
                                        >
                                            <LockOpen size={16} />
                                            Kunci Kelas
                                        </button>
                                    )}
                                {classData.class.isLocked &&
                                    classData.class.teachingGroupId.branchYearId
                                        .academicYearId.isActive === true && (
                                        <button
                                            className={`btn-primary-outline font-medium flex flex-row items-start gap-2 text-blue-500 disabled:opacity-100`}
                                            disabled
                                        >
                                            <Lock size={16} />
                                            Kelas Dikunci
                                        </button>
                                    )}

                                {classData.class.isLocked &&
                                    classData.class.teachingGroupId.branchYearId
                                        .isActive === false &&
                                    auth.userRole === "branchAdmin" &&
                                    classData.class.teachingGroupId.branchYearId
                                        .academicYearId.isActive === true && (
                                        <button
                                            onClick={() =>
                                                unlockClassHandler(
                                                    classData.class.name,
                                                    classData.class._id
                                                )
                                            }
                                            className={`btn-danger-outline flex flex-row items-start gap-2 text-gray-600`}
                                        >
                                            <KeyRound size={16} />
                                            Buka Kunci
                                        </button>
                                    )}
                            </div>
                            <div className="mt-2 flex items-center text-gray-500">
                                <Building className="mr-2 h-4 w-4" />
                                {/* <span>{classData.class.subBranchYearId.subBranchId.name} - {classData.class.subbranchYearId.academicYearId.name}</span> */}
                            </div>
                        </div>

                        <div className="flex flex-col gap-4 mb-8 rounded-md border border-gray-200 bg-white p-6 shadow-xs">
                            <div className="flex items-center space-x-2 text-gray-600">
                                <Clock className="h-5 w-5" />
                                <span>
                                    Kelas Mulai: {classData.class.startTime}
                                </span>
                            </div>
                            <div className="flex items-center space-x-2 text-gray-600">
                                <GraduationCap className="h-5 w-5" />
                                <span>
                                    {classData.class.teachers.length} Guru
                                </span>
                            </div>
                            <div className="flex items-center space-x-2 text-gray-600">
                                <Users className="h-5 w-5" />
                                <span>
                                    {classData.class.students.length} Siswa
                                </span>
                            </div>
                            <div className="flex items-center space-x-2 text-gray-600">
                                <LineChart className="h-5 w-5" />
                                {/* <span>{attendanceCount(classData.class)} / {classData.class.subBranchYearId.semesterTarget} Pertemuan Terlaksana</span> */}
                                {/* <span>{attendanceCount(classData.class)} Pertemuan Terlaksana</span> */}
                            </div>
                        </div>

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
                                                classData.class.isLocked ===
                                                    false &&
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
                                        {classData.class.teachers.map(
                                            (teacher) => (
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
                                                                              import.meta
                                                                                  .env
                                                                                  .VITE_BACKEND_URL
                                                                          }/${
                                                                              teacher.image
                                                                          }`
                                                                }
                                                                alt={
                                                                    teacher.name
                                                                }
                                                                className="w-10 h-10 rounded-full min-w-10 border border-gray-200 bg-white"
                                                            />
                                                        ) : (
                                                            <div
                                                                className={`w-10 h-10 rounded-full bg-green-200 text-green-500 flex items-center justify-center font-medium`}
                                                            >
                                                                {getInitials(
                                                                    teacher.name
                                                                )}
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
                                                    {auth.userRole !==
                                                        "teacher" &&
                                                        classData.class
                                                            .isLocked ===
                                                            false &&
                                                        classData.class
                                                            .teachingGroupId
                                                            .branchYearId
                                                            .academicYearId
                                                            .isActive ===
                                                            true &&
                                                        teacher.userId
                                                            ?.subBranchId
                                                            ?._id ===
                                                            auth.userSubBranchId && (
                                                            <td className="flex gap-4 py-4">
                                                                <button
                                                                    onClick={(
                                                                        e
                                                                    ) => {
                                                                        e.stopPropagation();
                                                                        removeHandler(
                                                                            "teacher",
                                                                            teacher.name,
                                                                            teacher._id
                                                                        );
                                                                    }}
                                                                    className="btn-icon-danger"
                                                                >
                                                                    <Trash
                                                                        size={
                                                                            20
                                                                        }
                                                                    />
                                                                </button>
                                                            </td>
                                                        )}
                                                </tr>
                                            )
                                        )}
                                        {classData.class.teachers.length ===
                                            0 && (
                                            <tr className="">
                                                <td
                                                    colSpan="5"
                                                    className="px-6 py-4 text-sm text-gray-500 text-center"
                                                >
                                                    Belum ada guru untuk kelas
                                                    ini
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

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
                                                classData.class.isLocked ===
                                                    false &&
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
                                        {classData.class.students.map(
                                            (student) => (
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
                                                                              import.meta
                                                                                  .env
                                                                                  .VITE_BACKEND_URL
                                                                          }/${
                                                                              student.image
                                                                          }`
                                                                }
                                                                alt={
                                                                    student.name
                                                                }
                                                                className="w-10 h-10 rounded-full min-w-10 border border-gray-200 bg-white"
                                                            />
                                                        ) : (
                                                            <div
                                                                className={`w-10 h-10 rounded-full bg-blue-200 text-blue-500 flex items-center justify-center font-medium`}
                                                            >
                                                                {getInitials(
                                                                    student.name
                                                                )}
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
                                                        {student.userId
                                                            ?.subBranchId
                                                            ?.name || ""}
                                                    </td>
                                                    {auth.userRole ===
                                                        "subBranchAdmin" &&
                                                        classData.class
                                                            .isLocked ===
                                                            false &&
                                                        classData.class
                                                            .teachingGroupId
                                                            .branchYearId
                                                            .academicYearId
                                                            .isActive ===
                                                            true &&
                                                        student.userId
                                                            ?.subBranchId
                                                            ?._id ===
                                                            auth.userSubBranchId && (
                                                            <td className="flex gap-4 py-4">
                                                                <button
                                                                    onClick={(
                                                                        e
                                                                    ) => {
                                                                        e.stopPropagation();
                                                                        removeHandler(
                                                                            "student",
                                                                            student.name,
                                                                            student._id
                                                                        );
                                                                    }}
                                                                    className="p-3 rounded-full  hover:bg-gray-200 text-red-500 hover:text-red-700 transition"
                                                                >
                                                                    <Trash
                                                                        size={
                                                                            20
                                                                        }
                                                                    />
                                                                </button>
                                                            </td>
                                                        )}
                                                </tr>
                                            )
                                        )}
                                        {classData.class.students.length ===
                                            0 && (
                                            <tr className="">
                                                <td
                                                    colSpan="4"
                                                    className="px-6 py-4 text-sm text-gray-500 text-center"
                                                >
                                                    Belum ada siswa terdaftar di
                                                    kelas ini.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default ClassDetailView;
