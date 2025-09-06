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
import UserCard from "../components/UserCard";

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

                                        const statusText = teacher.isProfileComplete === false
                                            ? "Lengkapi Profil!"
                                            : hasTargetClass
                                            ? "Terdaftar ✓"
                                            : "";

                                        return (
                                            <UserCard
                                                key={teacher._id}
                                                user={teacher}
                                                onClick={() => registerTeacherHandler(teacher.name, teacher.id)}
                                                isRegistered={hasTargetClass}
                                                identifier="nig"
                                                statusText={statusText}
                                                backendUrl={import.meta.env.VITE_BACKEND_URL}
                                                avatarColor="green"
                                            />
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
