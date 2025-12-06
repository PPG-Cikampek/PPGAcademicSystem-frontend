import { useContext, useMemo } from "react";
import useHttp from "../../shared/hooks/http-hook";
import { useLocation, useParams } from "react-router-dom";
import SkeletonLoader from "../../shared/Components/UIElements/SkeletonLoader";
import ErrorCard from "../../shared/Components/UIElements/ErrorCard";
import DataTable from "../../shared/Components/UIElements/DataTable";
import { AuthContext } from "../../shared/Components/Context/auth-context";
import getMunaqasyahStatusName from "../utilities/getMunaqasyahStatusName";
import NewModal from "../../shared/Components/Modal/NewModal";
import useModal from "../../shared/hooks/useNewModal";
import { useBranchSubBranchSummary } from "../../shared/queries/useMunaqasyah";

const BranchAdminMunaqasyahDetailView = () => {
    const {
        sendRequest,
        isLoading: isMutating,
        error: httpError,
        setError,
    } = useHttp();
    const { modalState, openModal, closeModal } = useModal();

    const auth = useContext(AuthContext);
    const { branchYearId: routeBranchYearId } = useParams();
    const location = useLocation();
    const state =
        location.state && location.state.year ? location.state.year : {};

    const {
        data: summaryData,
        isLoading,
        error,
        refetch,
    } = useBranchSubBranchSummary(auth.userBranchId, routeBranchYearId, {
        refetchInterval:
            state?.munaqasyahStatus === "inProgress" ? 3000 : false,
    });

    const subBranchData = useMemo(
        () => summaryData?.subBranches || [],
        [summaryData]
    );

    const showSkeleton = isLoading && subBranchData.length === 0;

    const getMunaqasyahStatusStyle = (status) => {
        const statusClassMap = {
            notStarted: "bg-gray-100 text-gray-600 px-2 py-1 rounded-sm",
            inProgress: "bg-yellow-400 text-white px-2 py-1 rounded-sm",
            completed: "bg-green-500 text-white px-2 py-1 rounded-sm",
        };
        return (
            statusClassMap[status] ||
            "bg-red-500 text-white px-2 py-1 rounded-sm"
        );
    };

    const subBranchColumns = [
        {
            key: "name",
            label: "Nama",
            sortable: true,
            headerAlign: "left",
            cellAlign: "left",
        },
        {
            key: "munaqisyCount",
            label: "Jumlah Munaqis",
            sortable: true,
            headerAlign: "center",
            cellAlign: "center",
        },
        {
            key: "studentCount",
            label: "Jumlah Siswa",
            sortable: true,
            headerAlign: "center",
            cellAlign: "center",
        },
        {
            key: "avgScore",
            label: "Nilai Rata-Rata",
            sortable: true,
            headerAlign: "center",
            cellAlign: "center",
            render: (item) =>
                item?.avgScore || item?.avgScore === 0
                    ? Number(item.avgScore).toFixed(1)
                    : "-",
        },
        {
            key: "progress",
            label: "Persentase Selesai",
            sortable: true,
            headerAlign: "center",
            cellAlign: "center",
            render: (item) =>
                item?.progress || item?.progress === 0
                    ? `${Number(item.progress).toFixed(1)}%`
                    : "0%",
        },
        {
            key: "munaqasyahStatus",
            label: "Status",
            sortable: true,
            headerAlign: "center",
            cellAlign: "center",
            render: (item) => getMunaqasyahStatusName(item.munaqasyahStatus),
            cellStyle: (item) =>
                getMunaqasyahStatusStyle(item.munaqasyahStatus),
        },
        {
            key: "action",
            label: "Aksi",
            sortable: false,
            headerAlign: "center",
            cellAlign: "center",
            render: (item) =>
                item.munaqasyahStatus === "notStarted" ? (
                    <button
                        className="disabled:opacity-50 btn-primary-outline"
                        disabled={state.munaqasyahStatus !== "inProgress"}
                        onClick={() =>
                            subBranchMunaqasyahStatusHandler(
                                "start",
                                item.name,
                                item._id
                            )
                        }
                    >
                        Mulai
                    </button>
                ) : item.munaqasyahStatus === "inProgress" ? (
                    <>
                        <button
                            className="disabled:opacity-50 mx-1 btn-primary-outline"
                            // onClick={() => navigate(`/dashboard/teaching-groups/${teachingGroupId}/sub-branches/${item._id}`)}
                        >
                            Lihat
                        </button>
                        <button
                            className="disabled:opacity-50 mx-1 btn-primary-outline"
                            onClick={() =>
                                subBranchMunaqasyahStatusHandler(
                                    "complete",
                                    item.name,
                                    item._id
                                )
                            }
                        >
                            Selesaikan
                        </button>
                    </>
                ) : (
                    <>
                        <button
                            className="disabled:opacity-50 mx-1 btn-primary-outline"
                            // onClick={() => navigate(`/dashboard/teaching-groups/${teachingGroupId}/sub-branches/${item._id}`)}
                        >
                            Lihat
                        </button>
                        <button
                            className="disabled:opacity-50 mx-1 btn-primary-outline"
                            onClick={() =>
                                subBranchMunaqasyahStatusHandler(
                                    "start",
                                    item.name,
                                    item._id
                                )
                            }
                            disabled={state.munaqasyahStatus !== "inProgress"}
                        >
                            Mulai Susulan
                        </button>
                    </>
                ),
        },
    ];

    const subBranchMunaqasyahStatusHandler = (
        actionName,
        subBranchName,
        subBranchId
    ) => {
        const confirmAction = async (action) => {
            const url = `${
                import.meta.env.VITE_BACKEND_URL
            }/branchYears/munaqasyah/${auth.currentBranchYearId}/sub-branch/`;
            const body = JSON.stringify({
                subBranchId,
                munaqasyahStatus: action,
            });
            try {
                const responseData = await sendRequest(url, "PATCH", body, {
                    "Content-Type": "application/json",
                });
                openModal(responseData.message, "success", null, "Berhasil!");
                refetch();
            } catch (err) {
                setError(err.message);
                openModal(err.message, "error", null, "Gagal!");
            }
        };

        if (actionName === "start") {
            openModal(
                `Mulai Munaosah untuk Kelompok ${subBranchName}?`,
                "confirmation",
                () => confirmAction("inProgress"),
                "Konfirmasi",
                true
            );
        } else {
            openModal(
                `Selesaikan Munaosah untuk Kelompok ${subBranchName}?`,
                "confirmation",
                () => confirmAction("completed"),
                "Konfirmasi",
                true
            );
        }
    };

    return (
        <div className="bg-gray-50 md:p-8 px-4 py-8 pb-24 min-h-screen">
            <NewModal
                modalState={modalState}
                onClose={closeModal}
                isLoading={isMutating}
            />
            <div className="mx-auto max-w-6xl">
                {(error || httpError) && (
                    <ErrorCard
                        error={error?.message || httpError}
                        onClear={() => setError(null)}
                    />
                )}

                {showSkeleton && (
                    <div className="flex flex-col gap-6 mt-16 px-4">
                        <SkeletonLoader
                            variant="text"
                            width="200px"
                            height="32px"
                            className="mb-2"
                        />
                        <SkeletonLoader
                            variant="rectangular"
                            height="100px"
                            className="rounded-lg"
                            count={3}
                        />
                    </div>
                )}

                {subBranchData && !isLoading && state && (
                    <>
                        <div className="mb-8">
                            <div className="flex flex-col gap-4">
                                <h1 className="mb-2 font-semibold text-gray-900 text-2xl">
                                    Munaqosah Desa
                                </h1>
                            </div>
                        </div>

                        <div className="mb-8">
                            <div className="flex justify-between items-end mb-2">
                                <div className="flex items-center gap-1">
                                    {/* <GraduationCap className="mr-2 w-5 h-5 text-gray-600" /> */}
                                    <h2 className="font-medium text-gray-800 text-xl">
                                        Daftar Kelompok
                                    </h2>
                                </div>
                            </div>
                            <DataTable
                                data={subBranchData || []}
                                columns={subBranchColumns}
                                searchableColumns={["name"]}
                                initialSort={{
                                    key: "name",
                                    direction: "ascending",
                                }}
                                initialEntriesPerPage={5}
                                onRowClick={null} // No-op, as clickableRows is false
                                config={{
                                    showSearch: false,
                                    showTopEntries: false,
                                    showBottomEntries: false,
                                    showPagination: false,
                                    clickableRows: false,
                                    entriesOptions: [5, 10, 20, 30],
                                }}
                                tableId={`branch-sub-branches-table-${routeBranchYearId}`}
                            />
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default BranchAdminMunaqasyahDetailView;
