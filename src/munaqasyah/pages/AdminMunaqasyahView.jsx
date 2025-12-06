import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import useHttp from "../../shared/hooks/http-hook";
import SkeletonLoader from "../../shared/Components/UIElements/SkeletonLoader";
import ErrorCard from "../../shared/Components/UIElements/ErrorCard";
import MunaqasyahCard from "../components/MunaqasyahCard";
import { academicYearFormatter } from "../../shared/Utilities/academicYearFormatter";

const AdminMunaqasyahView = () => {
    const navigate = useNavigate();
    const { isLoading, error, sendRequest, setError } = useHttp();
    const [branchYears, setBranchYears] = useState();
    const [showActiveOnly, setShowActiveOnly] = useState(false);

    const fetchBranchYears = useCallback(async () => {
        const params = new URLSearchParams();
        params.append("populate", "branchId");
        if (showActiveOnly) {
            params.append("activeOnly", "true");
        }

        try {
            const responseData = await sendRequest(
                `${import.meta.env.VITE_BACKEND_URL}/branchYears?${params.toString()}`
            );
            setBranchYears(responseData?.branchYears || []);
        } catch (err) {
            // handled by useHttp
        }
    }, [sendRequest, showActiveOnly]);

    useEffect(() => {
        fetchBranchYears();
    }, [fetchBranchYears]);

    const groupedByBranch = useMemo(() => {
        if (!branchYears) return [];
        const groups = branchYears.reduce((acc, item) => {
            const branchKey = item.branchId?._id || "unknown";
            if (!acc[branchKey]) {
                acc[branchKey] = {
                    branchId: item.branchId?._id,
                    branchName: item.branchId?.name || "Tanpa Cabang",
                    items: [],
                };
            }
            acc[branchKey].items.push(item);
            return acc;
        }, {});

        return Object.values(groups).sort((a, b) =>
            a.branchName.localeCompare(b.branchName)
        );
    }, [branchYears]);

    return (
        <div className="bg-gray-50 md:p-8 px-4 py-8 min-h-screen">
            <div className="mx-auto max-w-6xl">
                <div className="flex md:flex-row flex-col md:justify-between md:items-center gap-4 mb-6">
                    <div>
                        <h1 className="font-semibold text-gray-900 text-2xl">
                            Monitor Munaqosah (Admin)
                        </h1>
                        <p className="text-gray-600 text-sm">
                            Akses tahun ajaran aktif maupun lewat sedaerah.
                        </p>
                    </div>
                    <button
                        className="btn-neutral-outline w-fit"
                        onClick={() => setShowActiveOnly((prev) => !prev)}
                    >
                        {showActiveOnly ? "Tampilkan semua tahun" : "Hanya tahun ajaran aktif"}
                    </button>
                </div>

                {(!branchYears || isLoading) && (
                    <div className="flex flex-col gap-4 mt-8">
                        <SkeletonLoader
                            variant="rectangular"
                            height={64}
                            width="100%"
                            count={3}
                        />
                    </div>
                )}

                {error && <ErrorCard error={error} onClear={() => setError(null)} />}

                {branchYears && !isLoading && groupedByBranch.length === 0 && (
                    <div className="bg-white shadow-md p-6 border border-gray-200 rounded-md">
                        <p className="text-gray-700 text-center">
                            Belum ada Tahun Ajaran untuk ditampilkan.
                        </p>
                    </div>
                )}

                {groupedByBranch.map((group) => (
                    <div key={group.branchId || group.branchName} className="mb-6">
                        <div className="flex justify-between items-center mb-2">
                            <h2 className="font-semibold text-gray-800 text-lg">
                                {group.branchName}
                            </h2>
                            <span className="text-gray-500 text-sm">
                                {group.items.length} tahun ajaran
                            </span>
                        </div>
                        <div className="flex flex-col gap-3">
                            {group.items.map((year) => (
                                <div key={year._id} className="relative">
                                    {/* <div className="top-6 right-4 absolute text-gray-500 text-xs">
                                        {academicYearFormatter(year.academicYearId?.name || "")}
                                    </div> */}
                                    <MunaqasyahCard
                                        year={year}
                                        onClick={() =>
                                            navigate(
                                                `/munaqasyah/monitor/${year._id}/branch/${year.branchId?._id}`,
                                                {
                                                    state: {
                                                        year,
                                                        branchName: group.branchName,
                                                    },
                                                }
                                            )
                                        }
                                        fetchData={fetchBranchYears}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AdminMunaqasyahView;
