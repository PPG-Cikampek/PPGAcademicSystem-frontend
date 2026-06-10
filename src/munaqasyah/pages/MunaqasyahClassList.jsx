import { useContext, useEffect, useState, useRef, useCallback } from "react";
import { Link, useParams, useLocation } from "react-router-dom";
import useHttp from "../../shared/hooks/http-hook";
import SkeletonLoader from "../../shared/Components/UIElements/SkeletonLoader";
import ErrorCard from "../../shared/Components/UIElements/ErrorCard";
import NewModal from "../../shared/Components/Modal/NewModal";
import useModal from "../../shared/hooks/useNewModal";
import { AuthContext } from "../../shared/Components/Context/auth-context";
import { bulkGenerateRaports, downloadBlob } from "../utilities/bulkRaportGenerator";
import { getScoreCategories } from "../utilities/getScoreCategories";

const MunaqasyahClassList = () => {
    const [classes, setClasses] = useState();
    const { isLoading, error, sendRequest, setError } = useHttp();
    const { modalState, openModal, closeModal } = useModal();
    const [isBulkLoading, setIsBulkLoading] = useState(false);
    const [bulkProgress, setBulkProgress] = useState(0);
    const abortControllerRef = useRef(null);

    const {
        branchYearId,
        subBranchId: paramSubBranchId,
        branchId: paramBranchId,
    } = useParams();
    const auth = useContext(AuthContext);
    const subBranchId = paramSubBranchId || auth.userSubBranchId;

    const location = useLocation();
    const subBranchMunaqasyahStatus = location.state?.subBranchMunaqasyahStatus;
    const branchMunaqasyahStatus = location.state?.branchMunaqasyahStatus;

    useEffect(() => {
        const fetchClasses = async () => {
            try {
                const responseData = await sendRequest(
                    `${
                        import.meta.env.VITE_BACKEND_URL
                    }/scores/branch-year/${branchYearId}?subBranchId=${subBranchId}`,
                    "GET",
                    null,
                    {
                        Authorization: `Bearer ${auth.token}`,
                        "Content-Type": "application/json",
                    }
                );
                setClasses(responseData.classes);
                console.log(responseData);
            } catch (err) {
                // Error is handled by useHttp
            }
        };
        fetchClasses();
    }, [sendRequest, branchYearId, subBranchId, auth.token]);

    const startBulkDownload = useCallback(
        async (isPengurus) => {
            const label = isPengurus ? "Pengurus" : "Orang Tua";
            openModal(
                `Memproses raport (${label})...`,
                "info",
                null,
                "Mengunduh Seluruh Raport",
            );
            setIsBulkLoading(true);
            setBulkProgress(0);
            abortControllerRef.current = new AbortController();

            const studentRaports = [];

            classes.forEach((cls) => {
                const categories = getScoreCategories(cls.classId.name);
                const avgScores = cls.averageScores;
                const grade = cls.classId.name;
                const academicYearName =
                    cls.scores[0]?.branchYearId?.academicYearId?.name || "";

                cls.scores.forEach((score) => {
                    let studentScores;
                    if (isPengurus) {
                        studentScores = score;
                    } else {
                        studentScores = {
                            ...score,
                            ...categories.reduce((acc, cat) => ({
                                ...acc,
                                [cat.key]: {
                                    ...score[cat.key],
                                    score:
                                        score[cat.key]?.score < 60 && score[cat.key]?.score > 0
                                            ? 60
                                            : score[cat.key]?.score === 0
                                              ? null
                                              : score[cat.key]?.score,
                                },
                            }), {}),
                        };
                    }

                    studentRaports.push({
                        studentName: score.studentId.name,
                        studentScores,
                        scoreCategories: categories,
                        studentNis: score.studentNis,
                        grade,
                        academicYearName,
                        branchAvgScores: avgScores,
                        isPengurus,
                    });
                });
            });

            const result = await bulkGenerateRaports(
                studentRaports,
                setBulkProgress,
                abortControllerRef.current.signal,
            );

            setIsBulkLoading(false);
            setBulkProgress(0);
            abortControllerRef.current = null;

            if (result.success && result.zipBlob) {
                const academicYearName =
                    classes[0]?.scores[0]?.branchYearId?.academicYearId?.name || "";
                const safeYear = academicYearName.replace(/[/\\:*?"<>|]/g, "-");
                downloadBlob(result.zipBlob, `Raport_SeluruhKelas_${safeYear}.zip`);

                setTimeout(() => {
                    openModal(
                        `Berhasil mengunduh ${result.completed} raport${result.failed > 0 ? `\n${result.failed} gagal diproses.` : ""}`,
                        "success",
                        null,
                        "Berhasil!",
                    );
                }, 100);
            } else {
                setTimeout(() => {
                    openModal(
                        result.error || "Terjadi kesalahan.",
                        "error",
                        null,
                        "Gagal",
                    );
                }, 100);
            }
        },
        [classes, openModal],
    );

    const handleBulkDownload = useCallback(() => {
        if (
            branchMunaqasyahStatus &&
            branchMunaqasyahStatus !== "completed" &&
            branchMunaqasyahStatus !== "deferredCompleted"
        ) {
            openModal("Munaqosah belum selesai", "warning", null, "Perhatian");
            return;
        }
        if (!classes || classes.length === 0) {
            openModal("Tidak ada data raport untuk diunduh.", "warning", null, "Data Kosong");
            return;
        }
        openModal(
            "Pilih jenis raport yang akan diunduh:",
            "confirmation",
            null,
            "Unduh Seluruh Raport",
            false,
            "md",
        );
    }, [classes, branchMunaqasyahStatus, openModal]);

    const handleModalClose = useCallback(() => {
        if (isBulkLoading && abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
        closeModal();
    }, [isBulkLoading, closeModal]);

    return (
        <div className="bg-gray-50 md:p-8 px-4 py-8 min-h-screen">
            <div className="mx-auto max-w-6xl">
                <NewModal
                    modalState={modalState}
                    onClose={handleModalClose}
                    isLoading={isBulkLoading}
                    loadingVariant="bar"
                    progress={bulkProgress}
                >
                    {modalState.type === "confirmation" && modalState.title === "Unduh Seluruh Raport" && (
                        <div className="flex flex-col gap-3 mt-4">
                            <button
                                onClick={() => {
                                    closeModal();
                                    setTimeout(() => startBulkDownload(false), 100);
                                }}
                                className="px-4 py-3 rounded-md button-primary w-full transition-colors"
                            >
                                <span className="font-semibold text-base">Orang Tua</span>
                            </button>
                            <button
                                onClick={() => {
                                    closeModal();
                                    setTimeout(() => startBulkDownload(true), 100);
                                }}
                                className="px-4 py-3 rounded-md btn-primary-outline w-full transition-colors"
                            >
                                <span className="font-semibold text-base">Pengurus</span>
                            </button>
                        </div>
                    )}
                </NewModal>

                <div className="flex justify-between items-center mb-6">
                    <h1 className="font-semibold text-gray-900 text-2xl">
                        Daftar Kelas
                    </h1>
                    <button
                        onClick={handleBulkDownload}
                        disabled={isBulkLoading || !classes || classes.length === 0}
                        className="m-0 btn-primary-outline text-sm"
                    >
                        Unduh Seluruh Raport
                    </button>
                </div>

                {(!classes || isLoading) && (
                    <div className="space-y-4">
                        <SkeletonLoader
                            variant="rectangular"
                            width="100%"
                            height={70}
                            count={3}
                        />
                    </div>
                )}

                {error && <ErrorCard error={error} />}

                {classes &&
                    !isLoading &&
                    classes.map((cls) => (
                        <div key={cls.classId._id}>
                            <Link
                                to={
                                    paramSubBranchId
                                        ? paramBranchId
                                            ? `/munaqasyah/monitor/${branchYearId}/branch/${paramBranchId}/sub-branch/${subBranchId}/class/${cls.classId._id}`
                                            : `/munaqasyah/${branchYearId}/sub-branch/${subBranchId}/class/${cls.classId._id}`
                                        : `/munaqasyah/class/${cls.classId._id || cls.classId.id}`
                                }
                                state={{
                                    branchYearId,
                                    subBranchId,
                                    subBranchMunaqasyahStatus,
                                    branchMunaqasyahStatus,
                                }}
                            >
                                <div
                                    className={`card-basic hover:bg-gray-100 active:bg-gray-100 hover:cursor-pointer rounded-md justify-start m-0 transition-all duration-200 my-4`}
                                >
                                    <div className="flex items-center space-x-4">
                                        <div className="flex-1 h-fit">
                                            <div className="flex items-center gap-2">
                                                <h2 className="text-gray-900 text-lg">
                                                    {cls.classId.name}
                                                </h2>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        </div>
                    ))}
            </div>
        </div>
    );
};

export default MunaqasyahClassList;
