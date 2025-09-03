import { useState, useContext, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { AuthContext } from "../../shared/Components/Context/auth-context";
import useHttp from "../../shared/hooks/http-hook";

import LoadingCircle from "../../shared/Components/UIElements/LoadingCircle";
import Modal from "../../shared/Components/UIElements/ModalBottomClose";
import ErrorCard from "../../shared/Components/UIElements/ErrorCard";
import SkeletonLoader from "../../shared/Components/UIElements/SkeletonLoader";

const AddStudentToClassView = () => {
    const [modal, setModal] = useState({
        title: "",
        message: "",
        onConfirm: null,
    });
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [students, setStudents] = useState();
    const [cls, setCls] = useState();
    const { isLoading, error, sendRequest, setError } = useHttp();

    const navigate = useNavigate();
    const auth = useContext(AuthContext);
    const targetSubBranchId = auth.userSubBranchId;

    const classId = useParams().classId;

    useEffect(() => {
        const loadStudents = async () => {
            try {
                const responseData = await sendRequest(
                    `${
                        import.meta.env.VITE_BACKEND_URL
                    }/students/sub-branch/${targetSubBranchId}`
                );
                setStudents(responseData.students);
                console.log(responseData.students);
            } catch (err) {
                // Error handled by useHttp
            }
        };
        const loadClassesByTeachingGroupId = async () => {
            try {
                const responseData = await sendRequest(
                    `${import.meta.env.VITE_BACKEND_URL}/classes/${classId}`
                );
                // setCls(responseData.class);
                console.log(responseData.class);
                setCls(responseData.class);
            } catch (err) {}
        };

        loadStudents();
        loadClassesByTeachingGroupId();
    }, [sendRequest, modal]);

    const registerStudentHandler = (studentName, studentId) => {
        const confirmRegister = async () => {
            setModalIsOpen(false);

            const url = `${
                import.meta.env.VITE_BACKEND_URL
            }/classes/register-student`;
            const body = JSON.stringify({
                classId,
                studentId,
            });
            console.log(body);
            let responseData;
            try {
                responseData = await sendRequest(url, "POST", body, {
                    "Content-Type": "application/json",
                });

                setModalIsOpen(false);
                // setModalIsOpen(true)
                // setModal({ title: 'Berhasil!', message: responseData.message, onConfirm: null });

                const updatedData = await sendRequest(
                    `${
                        import.meta.env.VITE_BACKEND_URL
                    }/students/sub-branch/${targetSubBranchId}`
                );
                setStudents(updatedData.students);
            } catch (err) {
                // Error is already handled by useHttp
            }
        };

        confirmRegister();

        // setModal({
        //     title: `Konfirmasi Pendaftaran`,
        //     message: `Daftarkan peserta didik ${studentName}?`,
        //     onConfirm: confirmRegister,
        // });
        // setModalIsOpen(true);
    };

    const getInitials = (name) => {
        return name
            ?.split(" ")
            .map((word) => word[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);
    };

    const ModalFooter = () => (
        <div className="flex gap-2 items-center">
            <button
                onClick={() => {
                    setModalIsOpen(false);
                }}
                className={`${
                    modal.onConfirm
                        ? "btn-danger-outline"
                        : "button-primary mt-0 "
                } ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                disabled={isLoading}
            >
                {isLoading ? (
                    <LoadingCircle />
                ) : modal.onConfirm ? (
                    "Batal"
                ) : (
                    "Tutup"
                )}
            </button>
            {modal.onConfirm && (
                <button
                    onClick={modal.onConfirm}
                    className={`button-primary mt-0 ${
                        isLoading ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                >
                    {isLoading ? <LoadingCircle /> : "Ya"}
                </button>
            )}
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 px-4 py-8 md:p-8">
            <div className="max-w-6xl mx-auto">
                <h1 className="text-2xl font-bold mb-4">
                    Pendaftaran Ulang Peserta Didik
                </h1>
                {!isLoading && cls && (
                    <h3 className="text-base font-normal mb-4">
                        Daftarkan Peserta Didik ke KBM {cls.name}
                    </h3>
                )}

                {error && (
                    <ErrorCard error={error} onClear={() => setError(null)} />
                )}

                <Modal
                    isOpen={modalIsOpen}
                    onClose={() => setModalIsOpen(false)}
                    title={modal.title}
                    footer={<ModalFooter />}
                >
                    {isLoading && (
                        <div className="flex justify-center mt-16">
                            <LoadingCircle size={32} />
                        </div>
                    )}
                    {!isLoading && modal.message}
                </Modal>

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
                                                    cls.teachingGroupId
                                        );
                                    };

                                    const registered = isStudentRegistered();
                                    return (
                                        <div
                                            key={student._id}
                                            className={`p-4 border rounded-lg transition-all duration-300 ${
                                                registered ||
                                                student.isProfileComplete ===
                                                    false
                                                    ? "bg-gray-100 border-gray-300 text-gray-500 cursor-not-allowed"
                                                    : "bg-white border-gray-200 hover:ring-4 hover:ring-blue-200 hover:border-blue-500 hover:shadow-xl cursor-pointer"
                                            }`}
                                            onClick={
                                                !registered &&
                                                student.isProfileComplete ===
                                                    true
                                                    ? () =>
                                                          registerStudentHandler(
                                                              student.name,
                                                              student._id
                                                          )
                                                    : undefined
                                            }
                                        >
                                            <div className="flex justify-between items-center gap-2">
                                                <div className="flex gap-4 items-center">
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
                                                            alt={student.name}
                                                            className="w-10 h-10 rounded-full border border-gray-200 bg-white"
                                                        />
                                                    ) : (
                                                        <div
                                                            className={`flex w-10 h-10 rounded-full bg-blue-200 text-blue-500 items-center justify-center font-medium`}
                                                        >
                                                            {getInitials(
                                                                student.name
                                                            )}
                                                        </div>
                                                    )}
                                                    <div className="flex flex-col gap-1">
                                                        <p className="text-lg font-semibold text-clip overflow-hidden">
                                                            {student.name}
                                                        </p>
                                                        <p className="text-base font-normal">
                                                            {student.nis}
                                                        </p>
                                                    </div>
                                                </div>
                                                {student.isProfileComplete ===
                                                false ? (
                                                    <span className="text-sm font-medium text-red-500">
                                                        Lengkapi Profil!
                                                    </span>
                                                ) : registered ? (
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
