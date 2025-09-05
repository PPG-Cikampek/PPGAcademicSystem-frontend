import { useContext, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { AuthContext } from "../../shared/Components/Context/auth-context";
import ErrorCard from "../../shared/Components/UIElements/ErrorCard";
import SkeletonLoader from "../../shared/Components/UIElements/SkeletonLoader";
import { useClass, useRegisterStudentToClassMutation, useStudents } from "../../shared/queries";
import UserCard from "../components/UserCard";

const AddStudentToClassView = () => {
    const navigate = useNavigate();
    const auth = useContext(AuthContext);
    const targetSubBranchId = auth.userSubBranchId;

    const classId = useParams().classId;

    // React Query: fetch students and class data
    const {
        data: students,
        isLoading: isStudentsLoading,
        error: studentsError,
        refetch: refetchStudents,
    } = useStudents(targetSubBranchId);

    const {
        data: cls,
        isLoading: isClassLoading,
        error: classError,
    } = useClass(classId);

    const isLoading = isStudentsLoading || isClassLoading;
    const error = studentsError || classError;

    const { mutate: registerStudentToClass, isPending: isRegistering } =
        useRegisterStudentToClassMutation({
            onSuccess: () => {
                // Ensure the students list refreshes to reflect registration state
                refetchStudents();
            },
        });

    const registerStudentHandler = (_studentName, studentId) => {
        registerStudentToClass({ classId, studentId });
    };

    return (
        <div className="min-h-screen bg-gray-50 px-4 py-8 md:p-8">
            <div className="max-w-6xl mx-auto">
                <h1 className="text-2xl font-bold mb-4">
                    Pendaftaran Ulang Peserta Didik
                </h1>
                {!isLoading && cls && (
                    <h3 className="text-base font-normal mb-4">
                        {cls.name}
                    </h3>
                )}

                {error && (
                    <ErrorCard error={error?.message || "Terjadi kesalahan"} onClear={() => { /* no-op for react-query */ }} />
                )}

                {(!students || isLoading) && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-16">
                        {[...Array(18)].map((_, idx) => (
                            <div
                                key={idx}
                                className="p-4 border rounded-lg bg-white border-gray-200"
                            >
                                <div className="flex justify-between items-center gap-2">
                                    <div className="flex gap-4 items-center">
                                        <SkeletonLoader
                                            variant="circular"
                                            width={40}
                                            height={40}
                                        />
                                        <div className="flex flex-col gap-1 w-32">
                                            <SkeletonLoader
                                                width="100%"
                                                height={32}
                                            />
                                            <SkeletonLoader
                                                width="60%"
                                                height={24}
                                            />
                                        </div>
                                    </div>
                                    <SkeletonLoader width={60} height={16} />
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {students && !isLoading && (
                    <>
                        {students.length === 0 && (
                            <div className="bg-white rounded-md shadow-md p-6 border border-gray-200">
                                <p className="text-gray-700 text-center">
                                    Belum ada daftar siswa. Buat Pendaftaran
                                    siswa baru terlebih dahulu!
                                </p>
                            </div>
                        )}
                        {students.length > 0 && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {students.map((student) => {
                                    const isStudentRegistered = () => {
                                        if (
                                            !student.classIds ||
                                            !Array.isArray(student.classIds) ||
                                            !cls ||
                                            !cls.teachingGroupId
                                        )
                                            return false;
                                        return student.classIds.some(
                                            (c) =>
                                                c.teachingGroupId &&
                                                c.teachingGroupId._id ===
                                                    cls.teachingGroupId._id
                                        );
                                    };

                                    const registered = isStudentRegistered();
                                    const statusText = student.isProfileComplete === false
                                        ? "Lengkapi Profil!"
                                        : registered
                                        ? "Terdaftar ✓"
                                        : "";

                                    return (
                                        <UserCard
                                            key={student._id}
                                            user={student}
                                            onClick={() => registerStudentHandler(student.name, student._id)}
                                            isRegistered={registered}
                                            identifier="nis"
                                            statusText={statusText}
                                            backendUrl={import.meta.env.VITE_BACKEND_URL}
                                            avatarColor="blue"
                                        />
                                    );
                                })}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default AddStudentToClassView;
