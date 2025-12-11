import { useState, useMemo, useContext } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import useModal from "../../shared/hooks/useNewModal";
import NewModal from "../../shared/Components/Modal/NewModal";
import SkeletonLoader from "../../shared/Components/UIElements/SkeletonLoader";
import ErrorCard from "../../shared/Components/UIElements/ErrorCard";

import { ChevronDown } from "lucide-react";
import { generatePDFContent } from "../components/StudentReportPDF";
import { useQuery } from "@tanstack/react-query";
import { AuthContext } from "../../shared/Components/Context/auth-context";
import LoadingCircle from "../../shared/Components/UIElements/LoadingCircle";
import WarningCard from "../../shared/Components/UIElements/WarningCard";

const DEFAULT_SCORE_CATEGORIES = [
    { key: "reciting", label: "Membaca Al-Qur'an/Tilawati" },
    { key: "writing", label: "Menulis Arab" },
    { key: "quranTafsir", label: "Tafsir Al-Quran" },
    { key: "hadithTafsir", label: "Tafsir Hadits" },
    { key: "practice", label: "Praktik Ibadah" },
    { key: "moralManner", label: "Akhlak dan Tata Krama" },
    { key: "memorizingSurah", label: "Hafalan Surat-surat Al-Quran" },
    { key: "memorizingHadith", label: "Hafalan Hadits" },
    { key: "memorizingDua", label: "Hafalan Do'a" },
    { key: "memorizingBeautifulName", label: "Hafalan Asma'ul Husna" },
    { key: "knowledge", label: "Keilmuan dan Kefahaman Agama" },
    { key: "independence", label: "Kemandirian" },
];

const fetchScores = async ({ queryKey }) => {
    const [_key, { branchYearId, classId, subBranchId, token }] = queryKey;
    const res = await fetch(
        `${
            import.meta.env.VITE_BACKEND_URL
        }/scores/branch-year/${branchYearId}?classId=${classId}&subBranchId=${subBranchId}`,
        {
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
        }
    );
    if (!res.ok) throw new Error("Failed to fetch scores");
    return res.json();
};

const MunaqasyahByClassView = () => {
    const [expandedCards, setExpandedCards] = useState({});
    const location = useLocation();
    const navigate = useNavigate();
    const { branchYearId: paramBranchYearId, subBranchId: paramSubBranchId, classId } =
        useParams();
    const branchYearId = paramBranchYearId || location.state?.branchYearId;
    const subBranchMunaqasyahStatus =
        location.state?.subBranchMunaqasyahStatus || null;
    const [loadingIdx, setLoadingIdx] = useState(null);

    const auth = useContext(AuthContext);
    const subBranchId = paramSubBranchId || auth.userSubBranchId;

    const { modalState, openModal, closeModal } = useModal();

    const {
        data: responseData,
        isLoading,
        error,
    } = useQuery({
        queryKey: [
            "scores",
            { branchYearId, classId, subBranchId, token: auth.token },
        ],
        queryFn: fetchScores,
        refetchInterval: 3000,
        enabled: Boolean(branchYearId && classId && subBranchId),
    });

    const rawScores = useMemo(() => {
        if (!responseData) return [];
        const matchedClass = responseData.classes.find(
            (cls) => cls.classId._id === classId
        );
        console.log(responseData);
        return matchedClass ? matchedClass.scores : [];
    }, [responseData, classId]);

    const branchAvgScores = useMemo(() => {
        if (!responseData) return [];
        const matchedClass = responseData.classes.find(
            (cls) => cls.classId._id === classId
        );
        return matchedClass ? matchedClass.averageScores : [];
    }, [responseData, classId]);

    const scoreCategories = useMemo(() => {
        if (
            rawScores.length > 0 &&
            rawScores[0].classId &&
            /(PAUD|PRA-PAUD|1|2|3|4)/.test(rawScores[0].classId.name)
        ) {
            return DEFAULT_SCORE_CATEGORIES.filter(
                (cat) =>
                    ![
                        "independence",
                        "quranTafsir",
                        "hadithTafsir",
                        "memorizingHadith",
                    ].includes(cat.key)
            );
        }

        if (
            rawScores.length > 0 &&
            rawScores[0].classId &&
            /(7|8|9)/.test(rawScores[0].classId.name)
        ) {
            return DEFAULT_SCORE_CATEGORIES.filter(
                (cat) => 
                    !["memorizingBeautifulName",
                        "writing"
                    ].includes(cat.key)
            );
        }

        return DEFAULT_SCORE_CATEGORIES;
    }, [rawScores]);

    // const scores = useMemo(() => {
    //     return rawScores.map(score => ({
    //         ...score,
    //         ...scoreCategories.reduce((acc, category) => {
    //             const originalScore = score[category.key]?.score;
    //             let normalizedScore = originalScore;
    //             if (originalScore === 0) {
    //                 normalizedScore = null;
    //             } else if (originalScore > 0 && originalScore <= 100) {
    //                 normalizedScore = 60 + (originalScore / 100) * 40;
    //                 normalizedScore = Math.round(normalizedScore * 10) / 10; // round to 1 decimal
    //             }
    //             return {
    //                 ...acc,
    //                 [category.key]: {
    //                     ...score[category.key],
    //                     score: normalizedScore,
    //                 }
    //             };
    //         }, {})
    //     }));
    // }, [rawScores, scoreCategories]);

    // Calculate normalized scores (old)
    const scores = useMemo(() => {
        return rawScores.map((score) => ({
            ...score,
            ...scoreCategories.reduce(
                (acc, category) => ({
                    ...acc,
                    [category.key]: {
                        ...score[category.key],
                        score:
                            score[category.key]?.score < 60 &&
                            score[category.key]?.score > 0
                                ? 60
                                : score[category.key]?.score === 0
                                ? null
                                : score[category.key]?.score,
                    },
                }),
                {}
            ),
        }));
    }, [rawScores, scoreCategories]);

    const expandedCount = useMemo(
        () => Object.values(expandedCards).filter(Boolean).length,
        [expandedCards]
    );

    const toggleCard = (id) => {
        setExpandedCards((prev) => ({
            ...prev,
            [id]: !prev[id],
        }));
    };

    const collapseAll = () => {
        setExpandedCards({});
    };

    const calculateAverage = (score) => {
        const values = scoreCategories.map(
            (category) => score[category.key]?.score ?? 0
        );
        const sum = values.reduce((a, b) => a + b, 0);
        return (sum / values.length).toFixed(1);
    };

    const downloadReport = (
        studentName,
        studentScores,
        studentNis,
        grade,
        academicYearName,
        branchAvgScores
    ) => {
        const doc = generatePDFContent(
            studentName,
            studentScores,
            scoreCategories,
            studentNis,
            grade,
            academicYearName,
            branchAvgScores
        );
        const safeYear = academicYearName.replace(/[/\\:*?"<>|]/g, "-");
        doc.save(`Raport_${studentName}_${safeYear}.pdf`);
    };

    const previewReport = (
        studentName,
        studentScores,
        studentNis,
        grade,
        academicYearName,
        branchAvgScores
    ) => {
        const doc = generatePDFContent(
            studentName,
            studentScores,
            scoreCategories,
            studentNis,
            grade,
            academicYearName,
            branchAvgScores
        );
        const pdfBlob = doc.output("blob");
        const pdfUrl = URL.createObjectURL(pdfBlob);
        navigate("/munaqasyah/student/score", {
            state: { pdfUrl, studentName, academicYearName },
        });
    };

    if (isLoading)
        return (
            <div className="flex justify-center items-center bg-gray-50 min-h-screen">
                <div className="mx-auto md:p-5 px-4 py-2 w-full max-w-6xl">
                    <div className="flex flex-col gap-4">
                        {[...Array(3)].map((_, idx) => (
                            <div
                                key={idx}
                                className="bg-white shadow-md p-6 border border-gray-200 rounded-lg overflow-hidden"
                            >
                                <div className="flex flex-col items-start gap-2">
                                    <SkeletonLoader
                                        width="180px"
                                        height="20px"
                                        className="mb-2"
                                    />
                                    <SkeletonLoader
                                        width="100px"
                                        height="16px"
                                        className="mb-2"
                                    />
                                    <SkeletonLoader
                                        width="80px"
                                        height="16px"
                                        className="mb-2"
                                    />
                                    <div className="flex gap-2">
                                        <SkeletonLoader
                                            width="120px"
                                            height="32px"
                                            count={2}
                                            inline
                                        />
                                    </div>
                                </div>
                                <div className="mt-4">
                                    <SkeletonLoader
                                        width="100%"
                                        height="10px"
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );

    if (error)
        return (
            <div className="flex justify-center bg-gray-50 min-h-screen">
                <div className="mx-auto md:p-8 px-4 py-8 w-full max-w-md">
                    <ErrorCard error={error.message || "Terjadi kesalahan."} />
                </div>
            </div>
        );

    return (
        <div className="bg-gray-50 md:p-8 px-4 py-8 min-h-screen">
            <div className="mx-auto max-w-6xl">
                <NewModal
                    modalState={modalState}
                    onClose={closeModal}
                    isLoading={loadingIdx !== null}
                />
                <div className="flex justify-between items-center mb-6 h-9">
                    <h1 className="font-semibold text-gray-900 text-2xl">
                        {rawScores[0]?.classId.name}
                    </h1>

                    {expandedCount >= 2 && (
                        <button
                            onClick={collapseAll}
                            className="mt-0 btn-neutral-outline"
                        >
                            Tutup Semua
                        </button>
                    )}
                </div>
                <WarningCard
                    className="justify-start items-center"
                    warning="Nilai rata-rata kelas akan muncul setelah satu daerah telah menyelesaikan munaqosah!"
                    onClear={() => setError(null)}
                />
                <div className="flex flex-col gap-4">
                    {rawScores.map((score, idx) => {
                        console.log(score);
                        const filledCount = scoreCategories.filter(
                            (cat) =>
                                score[cat.key]?.score != null &&
                                score[cat.key]?.score !== "" &&
                                score[cat.key]?.score !== 0
                        ).length;
                        const totalCount = scoreCategories.length;
                        const progressPercent = Math.round(
                            (filledCount / totalCount) * 100
                        );

                        return (
                            <div
                                key={score._id}
                                className="bg-white shadow-md border border-gray-200 rounded-lg overflow-hidden"
                            >
                                <div
                                    onClick={() => toggleCard(score._id)}
                                    className="hover:bg-gray-50 p-6 transition-colors duration-200 cursor-pointer"
                                >
                                    <div className="flex justify-between items-center">
                                        <div className="flex flex-col items-start gap-2">
                                            <div>
                                                <h2 className="font-medium text-gray-800 text-lg">
                                                    {score.studentId.name}
                                                </h2>
                                                <h3 className="text-gray-700">
                                                    {score.studentNis}
                                                </h3>
                                            </div>

                                            <span className="text-gray-500 text-base">
                                                Rata-rata:{" "}
                                                {calculateAverage(score)}
                                            </span>
                                            {subBranchMunaqasyahStatus !==
                                                "inProgress" && (
                                                <div className="flex md:flex-row flex-col gap-2 my-2 md:my-0">
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            openModal(
                                                                "Unduh Raport untuk Orang Tua?",
                                                                "confirmation",
                                                                () => {
                                                                    setLoadingIdx(
                                                                        idx
                                                                    );
                                                                    setTimeout(
                                                                        () => {
                                                                            downloadReport(
                                                                                score
                                                                                    .studentId
                                                                                    .name,
                                                                                scores[
                                                                                    idx
                                                                                ],
                                                                                score.studentNis,
                                                                                score
                                                                                    .classId
                                                                                    .name,
                                                                                score
                                                                                    .branchYearId
                                                                                    .academicYearId
                                                                                    .name,
                                                                                branchAvgScores
                                                                            );
                                                                            setLoadingIdx(
                                                                                null
                                                                            );
                                                                            openModal(
                                                                                "Berhasil! Periksa folder unduhan anda.",
                                                                                "success",
                                                                                null,
                                                                                "Berhasil!"
                                                                            );
                                                                        },
                                                                        1200
                                                                    );
                                                                },
                                                                "Konfirmasi",
                                                                true
                                                            );
                                                        }}
                                                        className="bg-green-500 mt-0 border-green-500 button-primary"
                                                        disabled={
                                                            loadingIdx === idx
                                                        }
                                                    >
                                                        {loadingIdx === idx ? (
                                                            <LoadingCircle
                                                                size={18}
                                                            />
                                                        ) : null}
                                                        Unduh Raport Orang Tua
                                                    </button>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            // Use normalized score for PDF
                                                            previewReport(
                                                                score.studentId
                                                                    .name,
                                                                scores[idx],
                                                                score.studentNis,
                                                                score.classId
                                                                    .name,
                                                                score
                                                                    .branchYearId
                                                                    .academicYearId
                                                                    .name,
                                                                branchAvgScores
                                                            );
                                                        }}
                                                        className="hidden md:block bg-green-500 mt-0 border-green-500 button-primary"
                                                        disabled={
                                                            loadingIdx === idx
                                                        }
                                                    >
                                                        {loadingIdx === idx ? (
                                                            <LoadingCircle
                                                                size={18}
                                                            />
                                                        ) : null}
                                                        Lihat Raport Orang Tua
                                                    </button>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            openModal(
                                                                "Unduh Raport untuk Pengurus?",
                                                                "confirmation",
                                                                () => {
                                                                    setLoadingIdx(
                                                                        idx
                                                                    );
                                                                    setTimeout(
                                                                        () => {
                                                                            downloadReport(
                                                                                score
                                                                                    .studentId
                                                                                    .name,
                                                                                rawScores[
                                                                                    idx
                                                                                ],
                                                                                score.studentNis,
                                                                                score
                                                                                    .classId
                                                                                    .name,
                                                                                score
                                                                                    .branchYearId
                                                                                    .academicYearId
                                                                                    .name,
                                                                                branchAvgScores
                                                                            );
                                                                            setLoadingIdx(
                                                                                null
                                                                            );
                                                                            openModal(
                                                                                "Berhasil! Periksa folder unduhan anda.",
                                                                                "success",
                                                                                null,
                                                                                "Berhasil!"
                                                                            );
                                                                        },
                                                                        1200
                                                                    );
                                                                },
                                                                "Konfirmasi",
                                                                true
                                                            );
                                                        }}
                                                        className="m-0 btn-primary-outline text-gray-700"
                                                        disabled={
                                                            loadingIdx === idx
                                                        }
                                                    >
                                                        {loadingIdx === idx ? (
                                                            <LoadingCircle
                                                                size={18}
                                                            />
                                                        ) : null}
                                                        Unduh Raport Pengurus
                                                    </button>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            // Use raw score for PDF
                                                            previewReport(
                                                                score.studentId
                                                                    .name,
                                                                rawScores[idx],
                                                                score.studentNis,
                                                                score.classId
                                                                    .name,
                                                                score
                                                                    .branchYearId
                                                                    .academicYearId
                                                                    .name,
                                                                branchAvgScores
                                                            );
                                                        }}
                                                        className="hidden md:block m-0 btn-primary-outline text-gray-700"
                                                        disabled={
                                                            loadingIdx === idx
                                                        }
                                                    >
                                                        {loadingIdx === idx ? (
                                                            <LoadingCircle
                                                                size={18}
                                                            />
                                                        ) : null}
                                                        Lihat Raport Pengurus
                                                    </button>
                                                </div>
                                            )}
                                        </div>

                                        <ChevronDown
                                            className={`w-5 h-5 text-gray-500 transition-transform duration-200
                                        ${
                                            expandedCards[score._id]
                                                ? "transform rotate-180"
                                                : ""
                                        }`}
                                        />
                                    </div>
                                    {/* Progress Bar */}
                                    <div className="mt-2 w-full min-w-[180px]">
                                        <div className="flex justify-end mb-1">
                                            <span className="place-self-end text-gray-500 text-xs">
                                                {progressPercent}%
                                            </span>
                                        </div>
                                        <div className="bg-gray-200 rounded-full w-full h-2.5">
                                            <div
                                                className="bg-blue-600 rounded-full h-2.5 transition-all animate-pulse duration-300"
                                                style={{
                                                    width: `${progressPercent}%`,
                                                    animationDelay: `${
                                                        idx * 0.5
                                                    }s`,
                                                }}
                                            ></div>
                                        </div>
                                    </div>
                                </div>

                                <div
                                    className={`overflow-hidden transition-all duration-300 
                                ${
                                    expandedCards[score._id]
                                        ? "max-h-[800px]"
                                        : "max-h-0"
                                }`}
                                >
                                    <div className="bg-gray-50 px-4 py-4 border-gray-200 border-t">
                                        <div className="gap-1 md:gap-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                                            {scoreCategories.map((category) => (
                                                <div
                                                    key={category.key}
                                                    className="flex justify-between items-center bg-white p-2 border rounded-sm"
                                                >
                                                    <span className="text-gray-600">
                                                        {category.label}
                                                    </span>
                                                    <span className="font-medium text-gray-800">
                                                        {score[category.key]
                                                            ?.score > 0
                                                            ? score[
                                                                  category.key
                                                              ]?.score
                                                            : "-"}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default MunaqasyahByClassView;
