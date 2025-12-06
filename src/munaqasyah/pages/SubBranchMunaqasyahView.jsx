import { useContext, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import useHttp from "../../shared/hooks/http-hook";
import { AuthContext } from "../../shared/Components/Context/auth-context";
import SkeletonLoader from "../../shared/Components/UIElements/SkeletonLoader";
import NewModal from "../../shared/Components/Modal/NewModal";
import useModal from "../../shared/hooks/useNewModal";

import { CircleAlert } from "lucide-react";
import ErrorCard from "../../shared/Components/UIElements/ErrorCard";
import { academicYearFormatter } from "../../shared/Utilities/academicYearFormatter";

const SubBranchMunaqasyahView = () => {
    const [subBranchYears, setSubBranchYears] = useState();
    const { modalState, openModal, closeModal } = useModal();
    const { isLoading, error, sendRequest, setError } = useHttp();

    const navigate = useNavigate(); 
    const auth = useContext(AuthContext);

    useEffect(() => {
        const fetchSubBranchYears = async () => {
            try {
                const responseData = await sendRequest(
                    `${import.meta.env.VITE_BACKEND_URL}/branchYears/branch/${
                        auth.userBranchId
                    }/sub-branch/${auth.userSubBranchId}`
                );
                setSubBranchYears(responseData.subBranchYears);
                console.log(responseData.subBranchYears);
            } catch (err) {}
        };
        fetchSubBranchYears();

        SubBranchMunaqasyahView.fetchSubBranchYears = fetchSubBranchYears; // Expose for use elsewhere
    }, [sendRequest]);

    const munaqasyahStatusHandler = (
        actionType,
        subBranchYearName,
        subBranchId
    ) => {
        const confirmStart = async (action) => {
            const body = JSON.stringify({
                subBranchId,
                munaqasyahStatus: action,
            });
            try {
                const responseData = await sendRequest(
                    `${
                        import.meta.env.VITE_BACKEND_URL
                    }/branchYears/munaqasyah/${
                        auth.currentBranchYearId
                    }/sub-branch/`,
                    "PATCH",
                    body,
                    { "Content-Type": "application/json" }
                );
                openModal(
                    responseData.message,
                    "success",
                    null,
                    "Berhasil!",
                    false
                );
                SubBranchMunaqasyahView.fetchSubBranchYears();
            } catch (err) {
                // Error handled by useHttp
            }
        };

        if (actionType === "start") {
            openModal(
                `Mulai munaqosah untuk tahun ajaran ${subBranchYearName}?`,
                "confirmation",
                () => confirmStart("inProgress"),
                `Konfirmasi`,
                true
            );
        } else if (actionType === "finish") {
            openModal(
                `Mulai munaqosah untuk tahun ajaran ${subBranchYearName}?`,
                "confirmation",
                () => confirmStart("completed"),
                `Konfirmasi`,
                true
            );
        }
    };

    return (
        <div className="bg-gray-50 md:p-8 px-4 py-8 min-h-screen">
            <div className="mx-auto max-w-6xl">
                <NewModal
                    modalState={modalState}
                    onClose={closeModal}
                    isLoading={isLoading}
                />

                <div className="flex justify-between items-center mb-6">
                    <h1 className="font-semibold text-gray-900 text-2xl">
                        Munaqosah
                    </h1>
                </div>

                {(!subBranchYears || isLoading) && (
                    <div className="space-y-4">
                        <SkeletonLoader
                            variant="rectangular"
                            width="100%"
                            height={140}
                            count={3}
                        />
                    </div>
                )}

                {error && <ErrorCard error={error} />}

                {subBranchYears &&
                    !isLoading &&
                    subBranchYears.map((year, idx) => {
                        const key = year._id || `year-${idx}`;
                        const content = (
                            <div
                                className={`card-basic hover:bg-gray-100 active:bg-gray-100 hover:cursor-pointer rounded-md justify-start m-0 transition-all duration-200 my-4`}
                            >
                                <div className="flex items-center space-x-4">
                                    <div className="flex-1 h-fit">
                                        <div className="flex items-center gap-2">
                                            <h2 className="text-gray-900 text-xl">
                                                {academicYearFormatter(
                                                    year.branchYear.name
                                                )}
                                            </h2>
                                        </div>
                                        <div className="flex items-center mt-1 text-gray-500">
                                            Jumlah Kelas: {year.classes.length}
                                        </div>
                                        <div className="flex items-center mt-4 md:mt-5 md:mb-1">
                                            Status Munaqosah:
                                        </div>
                                        <div className="text-gray-500">
                                            {year.branchYear.isActive ===
                                                true &&
                                                year.subBranch
                                                    ?.munaqasyahStatus ===
                                                    "inProgress" && (
                                                    <div className="text-green-500">
                                                        Munaqosah Kelompok
                                                        berjalan!
                                                    </div>
                                                )}
                                            {year.branchYear.isActive ===
                                                true &&
                                                year.branchYear.academicYearId
                                                    ?.munaqasyahStatus ===
                                                    "inProgress" &&
                                                (year.branchYear
                                                    ?.munaqasyahStatus ===
                                                "notStarted" ? (
                                                    <div className="inline-flex items-center gap-1 text-yellow-600">
                                                        <CircleAlert />
                                                        Desa belum memulai
                                                        munaqosah.
                                                    </div>
                                                ) : year.branchYear
                                                      ?.munaqasyahStatus ===
                                                  "inProgress" ? (
                                                    <div className="inline-flex items-center gap-1 text-blue-500">
                                                        <CircleAlert />
                                                        Desa sudah memulai
                                                        munaqosah.
                                                    </div>
                                                ) : (
                                                    <div className="inline-flex items-center gap-1 text-green-500">
                                                        <CircleAlert />
                                                        Munaqosah Desa telah
                                                        selesai.
                                                    </div>
                                                ))}

                                            {year.branchYear.isActive ===
                                                true &&
                                                year.branchYear.academicYearId
                                                    ?.munaqasyahStatus !==
                                                    "inProgress" && (
                                                    <div className="inline-flex items-center gap-1 text-gray-600">
                                                        <CircleAlert />
                                                        Munaqosah Daerah belum
                                                        dimulai.
                                                    </div>
                                                )}
                                        </div>

                                        <div>
                                            {year.branchYear
                                                ?.munaqasyahStatus ===
                                                "inProgress" &&
                                                year.branchYear.isActive ===
                                                    true &&
                                                year.subBranch
                                                    ?.munaqasyahStatus !==
                                                    "inProgress" && (
                                                    <button
                                                        className="mt-2 btn-primary-outline"
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            e.stopPropagation();
                                                            munaqasyahStatusHandler(
                                                                "start",
                                                                year.branchYear
                                                                    .name,
                                                                year.subBranch
                                                                    ._id
                                                            );
                                                        }}
                                                    >
                                                        {year.subBranch
                                                            ?.munaqasyahStatus ===
                                                        "notStarted"
                                                            ? "Mulai Munaqosah"
                                                            : "Mulai Munaqosah Susulan"}
                                                    </button>
                                                )}
                                            {year.branchYear
                                                ?.munaqasyahStatus ===
                                                "inProgress" &&
                                                year.branchYear.isActive ===
                                                    true &&
                                                year.subBranch
                                                    ?.munaqasyahStatus ===
                                                    "inProgress" && (
                                                        <div className="flex flex-row gap-2">
                                                    <button
                                                        className="mt-2 btn-primary-outline"
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            e.stopPropagation();
                                                            munaqasyahStatusHandler(
                                                                "finish",
                                                                year.branchYear
                                                                    .name,
                                                                year.subBranch
                                                                    ._id
                                                            );
                                                        }}
                                                    >
                                                        Selesaikan Munaqosah
                                                    </button>
                                                    <button
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            e.stopPropagation();
                                                            navigate(`/munaqasyah/${year.branchYear._id}`);
                                                        }}
                                                        className="mt-2 button-primary">
                                                        Lihat Detail
                                                    </button>
                                                    </div>
                                                )}

                                            {year.branchYear.isActive !==
                                                true && (
                                                <div className="inline-flex items-center gap-1 text-gray-500 italic">
                                                    {/* <CircleAlert /> */}
                                                    Tahun ajaran tidak aktif.
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );

                        console.log("Branch Year ID:", year.branchYear._id);

                        return year.branchYear?.munaqasyahStatus !==
                            "notStarted" &&
                            year.subBranch?.munaqasyahStatus !==
                                "notStarted" ? (
                            <Link
                                key={key}
                                to={`/munaqasyah/${year.branchYear._id}`}
                            >
                                {content}
                            </Link>
                        ) : (
                            <div key={key}>{content}</div>
                        );
                    })}

                {subBranchYears && subBranchYears.length === 0 && (
                    <div className="bg-white shadow-md p-6 border border-gray-200 rounded-md">
                        <p className="text-gray-700 text-center">
                            Belum ada tahun ajaran terdaftar.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SubBranchMunaqasyahView;
