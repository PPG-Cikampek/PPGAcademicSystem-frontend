import React, { useState, useContext, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

import { AuthContext } from "../../shared/Components/Context/auth-context";
import useHttp from "../../shared/hooks/http-hook";

import LoadingCircle from "../../shared/Components/UIElements/LoadingCircle";
import { Trash, PlusIcon, LockOpen, Lock } from "lucide-react";
import Modal from "../../shared/Components/UIElements/ModalBottomClose";
import ErrorCard from "../../shared/Components/UIElements/ErrorCard";

const BranchYearsView = () => {
    const [modal, setModal] = useState({
        title: "",
        message: "",
        onConfirm: null,
    });
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [expandedId, setExpandedId] = useState(null);
    const [branchYears, setBranchYears] = useState();
    const { isLoading, error, sendRequest, setError } = useHttp();

    const auth = useContext(AuthContext);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchBranchYears = async () => {
            try {
                const responseData = await sendRequest(
                    `${import.meta.env.VITE_BACKEND_URL}/BranchYears/branch/${
                        auth.userBranchId
                    }`
                );
                setBranchYears(responseData);
                console.log(responseData);
            } catch (err) {
                // Error is handled by useHttp
            }
        };
        fetchBranchYears();
    }, [sendRequest]);

    const formatAcademicYear = (name) => {
        const year = name.substring(0, 4);
        const semester = name.substring(4);
        return `${year}/${parseInt(year) + 1} ${
            semester === "1" ? "Ganjil" : "Genap"
        }`;
    };

    const handleCardClick = (id) => {
        setExpandedId(expandedId === id ? null : id);
    };

    const activateYearHandler = (branchYearId, branchYearName) => (e) => {
        e.stopPropagation();
        const confirmActivate = async () => {
            console.log("Updating ... ");
            const url = `${
                import.meta.env.VITE_BACKEND_URL
            }/branchYears/activate`;

            const body = JSON.stringify({
                branchYearId: branchYearId,
            });

            console.log(body);

            let responseData;
            try {
                responseData = await sendRequest(url, "PATCH", body, {
                    "Content-Type": "application/json",
                });
            } catch (err) {
                setModal({
                    title: "Gagal!",
                    message: err.message,
                    onConfirm: null,
                });
                setModalIsOpen(true);
            }

            setModal({
                title: "Berhasil!",
                message: responseData.message,
                onConfirm: null,
            });

            const updatedData = await sendRequest(
                `${import.meta.env.VITE_BACKEND_URL}/branchYears/branch/${
                    auth.userBranchId
                }`
            );
            setBranchYears(updatedData);
        };

        setModal({
            title: `Konfirmasi`,
            message: `Aktifkan tahun ajaran ${formatAcademicYear(
                branchYearName
            )}?`,
            onConfirm: confirmActivate,
        });
        setModalIsOpen(true);
    };

    const deactivateYearHandler = (e, branchYearName, branchYearId) => {
        e.stopPropagation();
        const confirmDelete = async () => {
            const url = `${
                import.meta.env.VITE_BACKEND_URL
            }/branchYears/deactivate`;
            const body = JSON.stringify({
                branchYearId,
            });
            let responseData;
            try {
                responseData = await sendRequest(url, "PATCH", body, {
                    "Content-Type": "application/json",
                });
                setModal({
                    title: "Berhasil!",
                    message: responseData.message,
                    onConfirm: null,
                });

                const updatedData = await sendRequest(
                    `${import.meta.env.VITE_BACKEND_URL}/branchYears/branch/${
                        auth.userBranchId
                    }`
                );
                setBranchYears(updatedData);
            } catch (err) {
                setModal({
                    title: "Gagal!",
                    message: err.message,
                    onConfirm: null,
                });
            }
        };
        setModal({
            title: `Konfirmasi`,
            message: `Nonaktifkan tahun ajaran ${formatAcademicYear(
                branchYearName
            )}?`,
            onConfirm: confirmDelete,
        });
        setModalIsOpen(true);
    };

    const deleteBranchYearHandler = (e, branchYearName, branchYearId) => {
        e.stopPropagation();
        console.log(branchYearId);
        const confirmDelete = async () => {
            const url = `${import.meta.env.VITE_BACKEND_URL}/branchYears/`;
            const body = JSON.stringify({
                branchYearId,
            });
            let responseData;
            try {
                responseData = await sendRequest(url, "DELETE", body, {
                    "Content-Type": "application/json",
                });
                setModal({
                    title: "Berhasil!",
                    message: responseData.message,
                    onConfirm: null,
                });

                const updatedData = await sendRequest(
                    `${import.meta.env.VITE_BACKEND_URL}/branchYears/branch/${
                        auth.userBranchId
                    }`
                );
                setBranchYears(updatedData);
            } catch (err) {
                setModal({
                    title: "Gagal!",
                    message: err.message,
                    onConfirm: null,
                });
            }
        };
        setModal({
            title: `Konfirmasi Penghapusan`,
            message: `Hapus tahun ajaran ${formatAcademicYear(
                branchYearName
            )}?`,
            onConfirm: confirmDelete,
        });
        setModalIsOpen(true);
    };

    const deleteTeachingGroupHandler = (e, className, teachingGroupId) => {
        e.stopPropagation();
        const confirmDelete = async () => {
            const url = `${import.meta.env.VITE_BACKEND_URL}/teachingGroups/`;
            console.log(url);
            const body = JSON.stringify({
                teachingGroupId,
            });
            let responseData;
            try {
                responseData = await sendRequest(url, "DELETE", body, {
                    "Content-Type": "application/json",
                });
                setModal({
                    title: "Berhasil!",
                    message: responseData.message,
                    onConfirm: null,
                });

                const updatedData = await sendRequest(
                    `${import.meta.env.VITE_BACKEND_URL}/branchYears/branch/${
                        auth.userBranchId
                    }`
                );
                setBranchYears(updatedData);
            } catch (err) {
                setModal({
                    title: "Gagal!",
                    message: err.message,
                    onConfirm: null,
                });
            }
        };
        setModal({
            title: `Konfirmasi Penghapusan`,
            message: `Hapus KBM: ${className}?`,
            onConfirm: confirmDelete,
        });
        setModalIsOpen(true);
    };

    const ModalFooter = () => (
        <div className="flex gap-2 items-center">
            <button
                onClick={() => setModalIsOpen(false)}
                className={`${
                    modal.onConfirm
                        ? "btn-danger-outline"
                        : "button-primary mt-0 "
                }`}
            >
                {modal.onConfirm ? "Batal" : "Tutup"}
            </button>
            {modal.onConfirm && (
                <button
                    onClick={modal.onConfirm}
                    className="button-primary mt-0 "
                >
                    Ya
                </button>
            )}
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 px-4 py-8 md:p-8">
            <main className="max-w-6xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-semibold text-gray-900">
                        Daftar Tahun Ajaran{" "}
                        {auth.userRole === "branchAdmin" ? "Desa" : ""}
                    </h1>
                    {auth.userRole === "branchAdmin" && (
                        <Link to="/academic/new">
                            {/* <button className="button-primary pl-[11px]">
              <PlusIcon className="w-4 h-4 mr-2" />
              Daftar
            </button> */}
                            <button className="button-primary pl-[8px]">
                                <PlusIcon className="w-4 h-4 mr-1" />
                                Tambah
                            </button>
                        </Link>
                    )}
                </div>
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

                {(!branchYears || isLoading) && (
                    <div className="flex justify-center mt-16">
                        <LoadingCircle size={32} />
                    </div>
                )}

                {error && (
                    <ErrorCard error={error} onClear={() => setError(null)} />
                )}

                {branchYears && !isLoading && (
                    <>
                        {branchYears.branchYears.length === 0 && (
                            <div className="bg-white rounded-md shadow-md p-6 border border-gray-200">
                                <p className="text-gray-700 text-center">
                                    Belum ada tahun ajaran terdaftar.
                                </p>
                            </div>
                        )}
                        {branchYears.branchYears.length > 0 && (
                            <div className="flex flex-col items-stretch gap-4">
                                {branchYears.branchYears.map((year) => (
                                    <div
                                        key={year._id}
                                        className={`bg-white rounded-md shadow-md overflow-hidden transition-all duration-200
                  ${year.academicYearId.isActive === true ? "" : ""}`}
                                    >
                                        <div
                                            onClick={() =>
                                                handleCardClick(year._id)
                                            }
                                            className="p-6 cursor-pointer hover:bg-gray-50 transition-colors duration-200"
                                        >
                                            <div className="flex md:justify-between items-start md:flex-row flex-col md:items-center w-full">
                                                <div className="flex gap-2 flex-row flex-wrap">
                                                    <h2 className="text-xl font-medium text-gray-800">
                                                        {formatAcademicYear(
                                                            year.academicYearId
                                                                .name
                                                        )}
                                                    </h2>
                                                    <div className="flex h-min gap-2">
                                                        {year.academicYearId
                                                            .isActive && (
                                                            <div className="inline-block px-2 py-1 text-sm text-blue-600 bg-blue-100 rounded-sm">
                                                                {
                                                                    year
                                                                        .academicYearId
                                                                        .isActive
                                                                }
                                                                Semester
                                                                Berjalan
                                                            </div>
                                                        )}
                                                        <div
                                                            className={`inline-block px-2 py-1 text-sm ${
                                                                year.isActive
                                                                    ? "text-green-600 bg-green-100"
                                                                    : year
                                                                          .academicYearId
                                                                          .isActive
                                                                    ? "text-red-600 bg-red-100"
                                                                    : "text-gray-600 bg-gray-100"
                                                            } rounded-sm`}
                                                        >
                                                            {year.isActive
                                                                ? "Aktif"
                                                                : year
                                                                      .academicYearId
                                                                      .isActive
                                                                ? "Nonaktif"
                                                                : "Semester Lewat"}
                                                        </div>
                                                    </div>
                                                </div>
                                                {year.academicYearId.isActive &&
                                                auth.userRole ===
                                                    "branchAdmin" &&
                                                !year.isActive ? (
                                                    <div className="flex justify-between md:justify-end items-center w-full">
                                                        <div className="flex gap-2 my-6 md:my-0">
                                                            <div
                                                                onClick={() =>
                                                                    navigate(
                                                                        `/academic/teachingGroups/new`,
                                                                        {
                                                                            state: year.id,
                                                                        }
                                                                    )
                                                                }
                                                                className="btn-primary-outline m-0 text-gray-700"
                                                            >
                                                                Tambah KBM
                                                            </div>
                                                            {
                                                                <div
                                                                    onClick={activateYearHandler(
                                                                        year._id,
                                                                        year.name
                                                                    )}
                                                                    className="btn-primary-outline m-0 text-gray-700"
                                                                >
                                                                    Aktifkan
                                                                </div>
                                                            }
                                                        </div>

                                                        <button
                                                            onClick={(e) =>
                                                                deleteBranchYearHandler(
                                                                    e,
                                                                    year
                                                                        .academicYearId
                                                                        .name,
                                                                    year._id
                                                                )
                                                            }
                                                            className="p-3 rounded-full text-gray-400 hover:bg-gray-200 hover:text-red-500 transition"
                                                        >
                                                            <Trash size={20} />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    auth.userRole ===
                                                        "branchAdmin" &&
                                                    year.isActive && (
                                                        <div
                                                            onClick={(e) =>
                                                                deactivateYearHandler(
                                                                    e,
                                                                    year
                                                                        .academicYearId
                                                                        .name,
                                                                    year._id
                                                                )
                                                            }
                                                            className="btn-danger-outline m-0 text-gray-700 mt-4 md:mt-0"
                                                        >
                                                            Nonaktifkan
                                                        </div>
                                                    )
                                                )}
                                            </div>
                                            {/* {year.semesterTarget && (
                        <div className='mt-2 text-gray-700'>
                          Target Pertemuan dalam Semester: {year.semesterTarget}
                        </div>
                      )} */}
                                            <div className="mt-2 text-gray-700">
                                                Jumlah KBM:{" "}
                                                {year.teachingGroups.length}
                                            </div>
                                            {/* <div className='mt-2 text-gray-700'>
                        Target Semester: {year.semesterTarget ? year.semesterTarget : 'Nonaktif'}
                      </div> */}
                                        </div>

                                        {/* Expandable Section */}
                                        <div
                                            className={`overflow-hidden transition-all duration-300 ${
                                                expandedId === year._id
                                                    ? "max-h-[512px]"
                                                    : "max-h-0"
                                            }`}
                                        >
                                            <div className="border-t">
                                                {year.teachingGroups.length >
                                                0 ? (
                                                    <ul className="">
                                                        {year.teachingGroups.map(
                                                            (teachingGroup) => (
                                                                <li
                                                                    key={
                                                                        teachingGroup._id
                                                                    }
                                                                    className="flex justify-start"
                                                                >
                                                                    <Link
                                                                        to={`/dashboard/teaching-groups/${teachingGroup.id}`}
                                                                        className="grow"
                                                                    >
                                                                        <div className="flex justify-start items-center gap-2 p-4 border-t text-gray-700 border-gray-200 bg-white hover:bg-gray-100 hover:cursor-pointer">
                                                                            <div>
                                                                                {
                                                                                    teachingGroup.name
                                                                                }
                                                                            </div>
                                                                            {year
                                                                                .academicYearId
                                                                                .isActive && (
                                                                                <div
                                                                                    className={`flex justify-center items-center p-1 border rounded-md border-gray-300 italic size-6 ${
                                                                                        teachingGroup.isLocked
                                                                                            ? "text-green-400 border-green-400"
                                                                                            : "text-red-400 border-red-400"
                                                                                    }`}
                                                                                >
                                                                                    {teachingGroup.isLocked ? (
                                                                                        <Lock
                                                                                            size={
                                                                                                16
                                                                                            }
                                                                                        />
                                                                                    ) : (
                                                                                        <LockOpen
                                                                                            size={
                                                                                                16
                                                                                            }
                                                                                        />
                                                                                    )}
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    </Link>
                                                                    {auth.userRole ===
                                                                        "branchAdmin" &&
                                                                        year
                                                                            .academicYearId
                                                                            .isActive &&
                                                                        !year.isActive && (
                                                                            <button
                                                                                onClick={(
                                                                                    e
                                                                                ) =>
                                                                                    deleteTeachingGroupHandler(
                                                                                        e,
                                                                                        teachingGroup.name,
                                                                                        teachingGroup.id
                                                                                    )
                                                                                }
                                                                                className="border-t px-4 italic text-gray-500 hover:underline hover:text-red-500 hover:cursor-pointer"
                                                                            >
                                                                                Hapus
                                                                                KBM
                                                                            </button>
                                                                        )}
                                                                </li>
                                                            )
                                                        )}
                                                    </ul>
                                                ) : (
                                                    <p className="p-4 text-gray-500 italic">
                                                        Tidak ada riwayat KBM.
                                                        {year.academicYearId
                                                            .isActive && (
                                                            <span
                                                                onClick={() =>
                                                                    navigate(
                                                                        `/academic/teachingGroups/new`,
                                                                        {
                                                                            state: year.id,
                                                                        }
                                                                    )
                                                                }
                                                                className="text-gray-800 hover:underline hover:cursor-pointer"
                                                            >
                                                                Tambah KBM
                                                            </span>
                                                        )}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}
            </main>
        </div>
    );
};

export default BranchYearsView;
