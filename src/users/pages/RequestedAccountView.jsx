import { useContext, useEffect, useState } from "react";
import useHttp from "../../shared/hooks/http-hook";
import { AuthContext } from "../../shared/Components/Context/auth-context";
import { useNavigate } from "react-router-dom";
import { formatDate } from "../../shared/Utilities/formatDateToLocal";
import DataTable from "../../shared/Components/UIElements/DataTable";
import NewModal from "../../shared/Components/Modal/NewModal";
import useModal from "../../shared/hooks/useNewModal";

const RequestedAccountView = () => {
    const [tickets, setTickets] = useState();
    const { modalState, openModal, closeModal } = useModal();
    const { isLoading, sendRequest } = useHttp();
    const [processingTicket, setProcessingTicket] = useState(null);

    const navigate = useNavigate();
    const auth = useContext(AuthContext);

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

        const body = JSON.stringify({ ticketId, respond });
        const url = `${
            import.meta.env.VITE_BACKEND_URL
        }/users/account-requests/ticket`;

        const confirmAction = async () => {
            try {
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
            }
        };

        const userName = ticket?.userId?.name || "Tidak Diketahui";
        const accountCount = ticket?.accountList?.length ?? 0;
        const actionWord = respond === "rejected" ? "Tolak" : "Setujui";

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
        };

        openModal(
            `Setujui & buat semua akun dari semua tiket pending?`,
            "confirmation",
            doApprove,
            "Konfirmasi",
            true
        );
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
                onClose={closeModal}
                isLoading={isLoading}
            />

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
