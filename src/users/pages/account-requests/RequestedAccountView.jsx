import { useContext, useEffect, useState, useRef } from "react";
import useHttp from "../../../shared/hooks/http-hook";
import { AuthContext } from "../../../shared/Components/Context/auth-context";
import { useNavigate } from "react-router-dom";
import { formatDate } from "../../../shared/Utilities/formatDateToLocal";
import DataTable from "../../../shared/Components/UIElements/DataTable";
import NewModal from "../../../shared/Components/Modal/NewModal";
import useModal from "../../../shared/hooks/useNewModal";
import { set } from "date-fns";

const RequestedAccountView = () => {
    const [tickets, setTickets] = useState();
    const { modalState, openModal, closeModal } = useModal();
    const { isLoading, sendRequest } = useHttp();
    const [processingTicket, setProcessingTicket] = useState(null);
    const [rejectionReason, setRejectionReason] = useState("");
    const [showRejectionInput, setShowRejectionInput] = useState(false);
    // useRef to keep a mutable reference to the latest rejection reason so
    // callbacks created earlier (like the modal confirm) can read the current
    // value instead of a stale value captured by closure.
    const rejectionReasonRef = useRef("");

    const navigate = useNavigate();
    const auth = useContext(AuthContext);

    // Debug: log rejectionReason whenever it changes so we can observe live updates
    useEffect(() => {
        console.log("useEffect - rejectionReason changed:", rejectionReason);
    }, [rejectionReason]);

    useEffect(() => {
        fetchTickets();
    }, [sendRequest]);

    const fetchTickets = async () => {
        const url = `${
            import.meta.env.VITE_BACKEND_URL
        }/users/account-requests/`;
        try {
            const responseData = await sendRequest(url);
            setTickets(responseData);
        } catch {
            // handled in hook
        }
    };

    const handleRespondTicket = async (ticketId, respond) => {
        // Find ticket details so we can show a clearer confirmation message
        const ticket = tickets?.tickets?.find(
            (t) => t.ticketId === ticketId || t._id === ticketId
        );
        console.log(
            "handleRespondTicket - current rejectionReason:",
            rejectionReason
        );

        const confirmAction = async () => {
            // Validate rejection reason when rejecting — read from ref (latest)
            const currentReason = rejectionReasonRef.current;
            console.log(
                "confirmAction - rejectionReason (from ref):",
                currentReason
            );
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
            }

            const body = JSON.stringify({
                ticketId,
                respond,
                ...(respond === "rejected" && { reason: currentReason }),
            });
            console.log(body);
            const url = `${
                import.meta.env.VITE_BACKEND_URL
            }/users/account-requests/ticket`;

            try {
                console.log(body);
                setProcessingTicket(ticketId);
                const responseData = await sendRequest(url, "PATCH", body, {
                    "Content-Type": "application/json",
                    Authorization: "Bearer " + auth.token,
                });

                setTickets((prevTickets) => ({
                    ...prevTickets,
                    tickets:
                        prevTickets?.tickets?.filter(
                            (t) => t._id !== ticketId
                        ) || [],
                }));

                openModal(
                    responseData.message,
                    "success",
                    null,
                    "Berhasil!",
                    false
                );
            } catch (err) {
                // Error handled by useHttp
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
        const pendingCount =
            tickets?.tickets?.filter((t) => t.status === "pending").length || 0;
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
            const url = `${
                import.meta.env.VITE_BACKEND_URL
            }/users/account-requests/approve-all`;
            try {
                setProcessingTicket("approve-all");
                const result = await sendRequest(url, "POST", null, {
                    Authorization: "Bearer " + auth.token,
                });
                console.log("Approved result:", result);
                await fetchTickets();
                openModal(
                    result.message || "Berhasil memproses semua tiket!",
                    "success",
                    null,
                    "Berhasil!",
                    false
                );
            } catch {
                // handled in hook
            } finally {
                setProcessingTicket(null);
            }
            // Prevent modal from closing automatically;
            return false;
        };

        openModal(
            `Setujui & buat semua akun dari semua tiket pending?`,
            "confirmation",
            doApprove,
            "Konfirmasi",
            true
        );

        // Prevent modal from closing automatically
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
                                className="btn-primary-outline m-0"
                                disabled={
                                    isLoading ||
                                    processingTicket === item.ticketId
                                }
                                aria-disabled={
                                    isLoading ||
                                    processingTicket === item.ticketId
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
                                className="btn-danger-outline m-0"
                                disabled={
                                    isLoading ||
                                    processingTicket === item.ticketId
                                }
                                aria-disabled={
                                    isLoading ||
                                    processingTicket === item.ticketId
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
        <div className="min-h-screen px-4 py-8 md:p-8">
            <NewModal
                modalState={modalState}
                onClose={() => {
                    closeModal();
                    setShowRejectionInput(false);
                    setRejectionReason("");
                }}
                isLoading={isLoading}
            >
                {showRejectionInput && (
                    <div className="mb-4">
                        <label
                            htmlFor="rejection-reason"
                            className="block text-sm font-medium text-gray-700 mb-2"
                        >
                            Alasan Penolakan
                        </label>
                        <textarea
                            id="rejection-reason"
                            value={rejectionReason}
                            onChange={(e) => {
                                const newVal = e.target.value;
                                console.log("onChange - newVal:", newVal);
                                setRejectionReason(newVal);
                                rejectionReasonRef.current = newVal;
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                            rows="3"
                            placeholder="Masukkan alasan penolakan..."
                            required
                        />
                    </div>
                )}
            </NewModal>

            <div className="flex items-center justify-between gap-4 mb-4">
                <h2 className="text-xl font-bold">Daftar Pendaftaran Akun</h2>
                <button
                    onClick={handleApproveAll}
                    className="btn-primary-outline"
                    disabled={isLoading || processingTicket === "approve-all"}
                    aria-disabled={
                        isLoading || processingTicket === "approve-all"
                    }
                >
                    Setujui & Buat Semua Tiket Pending
                </button>
            </div>
            <div className="max-w-6xl mx-auto">
                <p className="text-sm text-gray-600 mb-2">
                    Total: {tickets?.tickets?.length ?? 0} permintaan
                </p>

                {isLoading && !tickets && (
                    <div className="p-6 bg-white rounded shadow text-center">
                        Memuat permintaan...
                    </div>
                )}

                {tickets && tickets.tickets?.length > 0 ? (
                    <DataTable
                        data={tickets.tickets}
                        columns={columns}
                        onRowClick={(item) =>
                            navigate(
                                `/settings/requestAccount/ticket/${item.ticketId}`
                            )
                        }
                        searchableColumns={["ticketId", "status"]}
                        isLoading={isLoading}
                        initialSort={{
                            key: "createdTime",
                            direction: "descending",
                        }}
                        tableId="requestAccount-table"
                    />
                ) : (
                    !isLoading && (
                        <div className="p-6 bg-white rounded shadow text-center">
                            Tidak ada pendaftaran akun baru.
                        </div>
                    )
                )}
            </div>
        </div>
    );
};

export default RequestedAccountView;
