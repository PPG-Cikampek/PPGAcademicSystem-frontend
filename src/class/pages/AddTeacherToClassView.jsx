import { useContext } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { AuthContext } from "../../shared/Components/Context/auth-context";
import {
    useTeachers,
    useRegisterTeacherToClassMutation,
} from "../../shared/queries/index";
import LoadingCircle from "../../shared/Components/UIElements/LoadingCircle";
import NewModal from "../../shared/Components/Modal/NewModal";
import useModal from "../../shared/hooks/useNewModal";
import ErrorCard from "../../shared/Components/UIElements/ErrorCard";

const AddTeacherToClassView = () => {
    const { modalState, openModal, closeModal } = useModal();

    const navigate = useNavigate();
    const auth = useContext(AuthContext);
    const targetSubBranchId = auth.userSubBranchId;

    const classId = useParams().classId;
    const targetClassId = classId;

    const { data: teachers, isLoading, error } = useTeachers(targetSubBranchId);
    const registerMutation = useRegisterTeacherToClassMutation({
        onSuccess: (data) => {
            openModal(data.message, "success", null, "Berhasil!", false);
        },
        onError: (error) => {
            openModal(error.message, "error", null, "Gagal!", false);
        },
    });

    const registerTeacherHandler = (teacherName, teacherId) => {
        const confirmRegister = () => {
            registerMutation.mutate({ classId, teacherId });
            return false;
        };
        openModal(
            `Daftarkan tenaga pendidik ${teacherName}?`,
            "confirmation",
            confirmRegister,
            "Konfirmasi Pendaftaran",
            true
        );
    };

    const getInitials = (name) => {
        return name
            ?.split(" ")
            .map((word) => word[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);
    };

    return (
        <div className="min-h-screen bg-gray-50 px-4 py-8 md:p-8">
            <div className="max-w-6xl mx-auto">
                <h1 className="text-2xl font-bold mb-4">
                    Daftarkan Tenaga Pendidik ke Kelas
                </h1>
                <NewModal
                    modalState={modalState}
                    onClose={closeModal}
                    isLoading={isLoading || registerMutation.isPending}
                />

                {error && (
                    <div className="px-2">
                        <ErrorCard error={error} onClear={() => {}} />
                    </div>
                )}

                {(!teachers || isLoading) && (
                    <div className="flex justify-center mt-16">
                        <LoadingCircle size={32} />
                    </div>
                )}

                {teachers && !isLoading && (
                    <>
                        {teachers.length === 0 && (
                            <div className="bg-white rounded-md shadow-md p-6 border border-gray-200">
                                <p className="text-gray-700 text-center">
                                    Belum ada daftar guru. Buat Pendaftaran akun
                                    terlebih dahulu!
                                </p>
                            </div>
                        )}
                        {teachers.length > 0 && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {teachers.map((teacher) => {
                                    if (teacher.position !== "munaqisy") {
                                        const hasTargetClass =
                                            teacher.classIds.some(
                                                (classId) =>
                                                    classId?._id ===
                                                    targetClassId
                                            );

                                        return (
                                            <div
                                                key={teacher._id}
                                                className={`p-4 border rounded-lg transition-all duration-300 ${
                                                    hasTargetClass
                                                        ? "bg-gray-100 border-gray-300 text-gray-500 cursor-not-allowed"
                                                        : "bg-white border-gray-200 hover:ring-4 hover:ring-blue-200 hover:border-blue-500 hover:shadow-xl cursor-pointer"
                                                }`}
                                                onClick={
                                                    !hasTargetClass
                                                        ? () =>
                                                              registerTeacherHandler(
                                                                  teacher.name,
                                                                  teacher.id
                                                              )
                                                        : undefined
                                                }
                                            >
                                                <div className="flex justify-between items-center gap-2">
                                                    <div className="flex gap-4 items-center">
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
                                                                className="w-10 h-10 rounded-full border border-gray-200 bg-white"
                                                            />
                                                        ) : (
                                                            <div
                                                                className={`w-10 h-10 rounded-full bg-green-200 text-green-500 hidden md:flex items-center justify-center font-medium`}
                                                            >
                                                                {getInitials(
                                                                    teacher.name
                                                                )}
                                                            </div>
                                                        )}
                                                        <div className="flex flex-col gap-1">
                                                            <p className="text-lg font-semibold">
                                                                {teacher.name}
                                                            </p>
                                                            <p className="text-base font-normal">
                                                                {teacher.nig}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    {teacher.isProfileComplete ===
                                                    false ? (
                                                        <span className="text-sm font-medium text-red-500">
                                                            Lengkapi Profil!
                                                        </span>
                                                    ) : hasTargetClass ? (
                                                        <span className="text-sm font-base text-gray-500">
                                                            Terdaftar ✓
                                                        </span>
                                                    ) : (
                                                        <span className="text-sm font-medium text-blue-500 hidden hover:block">
                                                            Register
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    }
                                })}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default AddTeacherToClassView;
