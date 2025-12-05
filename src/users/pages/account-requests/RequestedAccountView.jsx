import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { formatDate } from "../../../shared/Utilities/formatDateToLocal";
import DataTable from "../../../shared/Components/UIElements/DataTable";
import NewModal from "../../../shared/Components/Modal/NewModal";
import useModal from "../../../shared/hooks/useNewModal";
import {
    useAccountRequests,
    useApproveAllAccountRequestsMutation,
    useRespondAccountRequestMutation,
} from "../../../shared/queries";

const RequestedAccountView = () => {
    const { modalState, openModal, closeModal } = useModal();
    const [processingTicket, setProcessingTicket] = useState(null);
    const [rejectionReason, setRejectionReason] = useState("");
    const [showRejectionInput, setShowRejectionInput] = useState(false);
    // useRef to keep a mutable reference to the latest rejection reason so
    // callbacks created earlier (like the modal confirm) can read the current
    // value instead of a stale value captured by closure.
    const rejectionReasonRef = useRef("");

    const navigate = useNavigate();
    const { data: ticketsData, isLoading, isFetching } = useAccountRequests();

    const respondTicketMutation = useRespondAccountRequestMutation({
        onSuccess: (data) => {
            openModal(
                data?.message || "Berhasil memproses tiket.",
                "success",
                null,
                "Berhasil!",
                false
            );
        },
        onError: (error) => {
            const message =
                error?.response?.data?.message ||
                "Gagal memproses tiket. Silakan coba lagi.";
            openModal(message, "info", null, "Gagal", false);
        },
    });

    const approveAllMutation = useApproveAllAccountRequestsMutation({
        onSuccess: (data) => {
            openModal(
                data?.message || "Berhasil memproses semua tiket!",
                "success",
                null,
                "Berhasil!",
                false
            );
        },
        onError: (error) => {
            const message =
                error?.response?.data?.message ||
                "Gagal memproses semua tiket. Silakan coba lagi.";
            openModal(message, "info", null, "Gagal", false);
        },
    });

    const isMutating =
        respondTicketMutation.isPending || approveAllMutation.isPending;
    const isBusy = isLoading || isMutating;

    const tickets = ticketsData?.tickets || [];

    const handleRespondTicket = async (ticketId, respond) => {
        // Find ticket details so we can show a clearer confirmation message
        const ticket = tickets.find(
            (t) => t.ticketId === ticketId || t._id === ticketId
        );

        const confirmAction = async () => {
            // Validate rejection reason when rejecting — read from ref (latest)
            const currentReason = rejectionReasonRef.current;
            if (
                respond === "rejected" &&
                (!currentReason || currentReason.trim() === "")
            ) {
                openModal(
                    "Alasan penolakan tidak boleh kosong.",
                    "info",
                    null,
                    "Info",
                    false
                );
                setShowRejectionInput(false);
                return;
            }

            try {
                setProcessingTicket(ticketId);
                await respondTicketMutation.mutateAsync({
                    ticketId,
                    respond,
                    reason: currentReason,
                });
            } catch (err) {
                // Error surfaced via mutation onError
                console.error("Request handling error:", err);
            } finally {
                setProcessingTicket(null);
                setRejectionReason("");
                rejectionReasonRef.current = "";
                setShowRejectionInput(false);
            }
            // prevent modal from closing automatically; we close it manually above
            return false;
        };

        const userName = ticket?.userId?.name || "Tidak Diketahui";
        const accountCount = ticket?.accountList?.length ?? 0;
        const actionWord = respond === "rejected" ? "Tolak" : "Setujui";

        if (respond === "rejected") {
            // Show the rejection textarea inside the modal. Don't store JSX in state —
            // store a boolean flag so the textarea remains connected to the
            // component state (rejectionReason) and updates correctly.
            setShowRejectionInput(true);
        } else {
            setShowRejectionInput(false);
        }

        openModal(
            `${actionWord} tiket untuk ${userName} (${accountCount} akun)?`,
            "confirmation",
            confirmAction,
            "Peringatan!",
            true
        );
        // prevent modal from closing automatically; we close it manually above
        return false;
    };

    const getStatusStyle = (type) =>
        ({
            pending: "bg-orange-100 text-orange-700",
            cancelled: "bg-gray-100 text-gray-700",
            rejected: "bg-red-100 text-red-700",
            approved: "bg-green-100 text-green-700",
        }[type]);

    const getStatusName = (type) =>
        ({
            pending: "Pending",
            cancelled: "Dibatalkan",
            rejected: "Ditolak",
            approved: "Disetujui",
        }[type]);

    const handleApproveAll = () => {
        const pendingCount = tickets.filter(
            (t) => t.status === "pending"
        ).length;
        if (pendingCount === 0) {
            openModal(
                "Tidak ada tiket pending untuk diproses.",
                "info",
                null,
                "Info",
                false
            );
            return;
        }

        const doApprove = async () => {
            try {
                setProcessingTicket("approve-all");
                await approveAllMutation.mutateAsync();
            } catch (err) {
                console.error("Approve all error:", err);
            } finally {
                setProcessingTicket(null);
            }
            // prevent modal from closing automatically; we close it manually above
            return false;
        };

        openModal(
            `Setujui & buat semua akun dari semua tiket pending?`,
            "confirmation",
            doApprove,
            "Konfirmasi",
            true
        );
        // prevent modal from closing automatically; we close it manually above
        return false;
    };

    const columns = [
        {
            key: "ticketId",
            label: "No. Tiket",
            sortable: true,
            render: (item) => item.ticketId.slice(0, 6),
        },
        {
            key: "userName",
            label: "Nama",
            sortable: true,
            render: (item) => item.userId?.name || " Tidak Diketahui",
        },
        {
            key: "subBranchName",
            label: "Kelompok",
            sortable: true,
            render: (item) => item.subBranchId?.name || " Tidak Diketahui",
        },
        {
            key: "createdTime",
            label: "Tanggal",
            sortable: true,
            render: (item) => formatDate(item.createdTime),
        },
        {
            key: "accountList",
            label: "Jumlah Akun",
            sortable: true,
            headerAlign: "center",
            cellAlign: "center",
            render: (item) => item.accountList.length,
        },
        {
            key: "status",
            label: "Status",
            sortable: true,
            headerAlign: "center",
            cellAlign: "center",
            render: (item) => (
                <span
                    className={`px-2 py-1 rounded-full text-sm ${getStatusStyle(
                        item.status
                    )}`}
                >
                    {getStatusName(item.status)}
                </span>
            ),
        },
        {
            key: "actions",
            label: "Aksi",
            headerAlign: "center",
            cellAlign: "center",
            render: (item) => {
                if (item.status === "pending") {
                    return (
                        <div className="flex gap-2">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleRespondTicket(
                                        item.ticketId,
                                        "approved"
                                    );
                                }}
                                className="m-0 btn-primary-outline"
                                disabled={
                                    isBusy || processingTicket === item.ticketId
                                }
                                aria-disabled={
                                    isBusy || processingTicket === item.ticketId
                                }
                                aria-label={`Setujui tiket ${item.ticketId}`}
                            >
                                Setujui
                            </button>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleRespondTicket(
                                        item.ticketId,
                                        "rejected"
                                    );
                                }}
                                className="m-0 btn-danger-outline"
                                disabled={
                                    isBusy || processingTicket === item.ticketId
                                }
                                aria-disabled={
                                    isBusy || processingTicket === item.ticketId
                                }
                                aria-label={`Tolak tiket ${item.ticketId}`}
                            >
                                Tolak
                            </button>
                        </div>
                    );
                } else if (
                    item.status === "approved" ||
                    item.status === "cancelled"
                ) {
                    return <span className="text-gray-500">Selesai</span>;
                } else {
                    return null;
                }
            },
        },
    ];

    return (
        <div className="md:p-8 px-4 py-8 min-h-screen">
            <NewModal
                modalState={modalState}
                onClose={() => {
                    closeModal();
                    setShowRejectionInput(false);
                    setRejectionReason("");
                }}
                isLoading={isBusy}
            >
                {showRejectionInput && (
                    <div className="mb-4">
                        <label
                            htmlFor="rejection-reason"
                            className="block mb-2 font-medium text-gray-700 text-sm"
                        >
                            Alasan Penolakan
                        </label>
                        <textarea
                            id="rejection-reason"
                            value={rejectionReason}
                            onChange={(e) => {
                                const newVal = e.target.value;
                                setRejectionReason(newVal);
                                rejectionReasonRef.current = newVal;
                            }}
                            className="shadow-sm px-3 py-2 border border-gray-300 focus:border-red-500 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 w-full"
                            rows="3"
                            placeholder="Masukkan alasan penolakan..."
                            required
                        />
                    </div>
                )}
            </NewModal>

            <div className="flex justify-between items-center gap-4 mb-4">
                <h2 className="font-bold text-xl">Daftar Pendaftaran Akun</h2>
                <button
                    onClick={handleApproveAll}
                    className="btn-primary-outline"
                    disabled={
                        isBusy ||
                        isFetching ||
                        processingTicket === "approve-all"
                    }
                    aria-disabled={
                        isBusy ||
                        isFetching ||
                        processingTicket === "approve-all"
                    }
                >
                    Setujui & Buat Semua Tiket Pending
                </button>
            </div>
            <div className="mx-auto max-w-6xl">
                <p className="mb-2 text-gray-600 text-sm">
                    Total: {tickets.length} permintaan
                </p>

                {isLoading && tickets.length === 0 && (
                    <div className="bg-white shadow p-6 rounded text-center">
                        Memuat permintaan...
                    </div>
                )}

                {tickets.length > 0 ? (
                    <DataTable
                        data={tickets}
                        columns={columns}
                        onRowClick={(item) =>
                            navigate(
                                `/settings/requestAccount/ticket/${item.ticketId}`
                            )
                        }
                        searchableColumns={["ticketId", "status"]}
                        isLoading={isLoading || isFetching}
                        initialSort={{
                            key: "createdTime",
                            direction: "descending",
                        }}
                        tableId="requestAccount-table"
                    />
                ) : (
                    !isLoading && (
                        <div className="bg-white shadow p-6 rounded text-center">
                            Tidak ada pendaftaran akun baru.
                        </div>
                    )
                )}
            </div>
        </div>
    );
};

export default RequestedAccountView;
