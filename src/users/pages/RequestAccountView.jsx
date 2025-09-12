import { useContext, useEffect, useState } from "react";
import { GraduationCap, Users } from "lucide-react";
import LoadingCircle from "../../shared/Components/UIElements/LoadingCircle";
import useHttp from "../../shared/hooks/http-hook";
import { AuthContext } from "../../shared/Components/Context/auth-context";
import { Link, useNavigate } from "react-router-dom";
import { formatDate } from "../../shared/Utilities/formatDateToLocal";
import DataTable from "../../shared/Components/UIElements/DataTable";
import NewModal from "../../shared/Components/Modal/NewModal";
import useModal from "../../shared/hooks/useNewModal";
import useToast from "../../shared/hooks/useToast";
import ToastContainer from "../../shared/Components/UIElements/ToastContainer";

const RequestAccountView = () => {
    const [tickets, setTickets] = useState();
    const { modalState, openModal, closeModal } = useModal();
    const { isLoading, sendRequest } = useHttp();
    const { toasts, showSuccess, showError, removeToast } =
        useToast();

    const navigate = useNavigate();
    const auth = useContext(AuthContext);

    useEffect(() => {
        const url = `${
            import.meta.env.VITE_BACKEND_URL
        }/users/account-requests/${auth.userId}`;

        const fetchTickets = async () => {
            try {
                const responseData = await sendRequest(url);
                setTickets(responseData);
            } catch (err) {
                // Enhanced error handling for initial data fetch
                console.error("Failed to fetch tickets:", err);
                showError(
                    "Gagal Memuat Data",
                    "Tidak dapat memuat daftar Pendaftaran akun. Silakan refresh halaman atau coba lagi nanti."
                );
            }
        };

        if (auth.userId) {
            fetchTickets();
        }
    }, [sendRequest, auth.userId]);

    const handleCancelTicket = async (ticketId, respond) => {
        // Validation
        if (
            !ticketId ||
            typeof ticketId !== "string" ||
            ticketId.trim().length === 0
        ) {
            showError("Error!", "ID tiket tidak valid. Silakan coba lagi.");
            return;
        }

        const body = JSON.stringify({ ticketId, respond });
        const url = `${
            import.meta.env.VITE_BACKEND_URL
        }/users/account-requests/ticket`;

        const confirmCancel = async () => {
            try {
                const responseData = await sendRequest(url, "PATCH", body, {
                    "Content-Type": "application/json",
                    Authorization: "Bearer " + auth.token,
                });

                // Use toast instead of modal for success
                showSuccess(
                    "Berhasil!",
                    responseData.message || "Tiket berhasil dibatalkan."
                );

                setTickets((prevTickets) => ({
                    ...prevTickets,
                    tickets: prevTickets.tickets.filter(
                        (ticket) => ticket._id !== ticketId
                    ),
                }));
            } catch (err) {
                showError(
                    "Gagal!",
                    `${
                        err.message || "Gagal membatalkan tiket"
                    }. Silakan coba lagi.`
                );
            }
        };

        openModal(
            "Apakah Anda yakin ingin membatalkan tiket ini? Tindakan ini tidak dapat dibatalkan.",
            "confirmation",
            confirmCancel,
            "Konfirmasi Pembatalan",
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

    const columns = [
        {
            key: "ticketId",
            label: "No. Tiket",
            sortable: true,
            render: (item) => (
                <div className="text-sm">{item.ticketId.slice(0, 6)}</div>
            ),
        },
        {
            key: "createdTime",
            label: "Tanggal Dibuat",
            sortable: true,
            render: (item) => (
                <div className="text-sm">
                    <div>{formatDate(item.createdTime)}</div>
                    <div className="text-xs text-gray-500">
                        {new Date(item.createdTime).toLocaleTimeString(
                            "id-ID",
                            {
                                hour: "2-digit",
                                minute: "2-digit",
                            }
                        )}
                    </div>
                </div>
            ),
        },
        {
            key: "accountList",
            label: "Jumlah",
            cellAlign: "center",
            headerAlign: "center",
            sortable: true,
            render: (item) => (
                <div className="">{item.accountList.length} akun</div>
            ),
        },
        {
            key: "status",
            label: "Status",
            sortable: true,
            cellAlign: "center",
            headerAlign: "center",
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
            cellAlign: "center",
            headerAlign: "center",
            render: (item) =>
                item.status === "pending" ? (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            handleCancelTicket(item.ticketId, "cancelled");
                        }}
                        className="btn-danger-outline m-0 text-xs px-3 py-1"
                        title="Batalkan Pendaftaran"
                    >
                        Batalkan
                    </button>
                ) : item.status === "cancelled" ||
                  item.status === "rejected" ? (
                    <span className="text-xs text-gray-500 italic">
                        Selesai
                    </span>
                ) : (
                    <span className="text-xs text-green-600 font-medium">
                        Selesai
                    </span>
                ),
        },
    ];

    return (
        <div className="min-h-screen px-4 py-8 md:p-8">
            <ToastContainer toasts={toasts} onRemoveToast={removeToast} />

            <NewModal
                modalState={modalState}
                onClose={closeModal}
                isLoading={isLoading}
            />

            <div className="max-w-6xl mx-auto">
                <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-6">
                    Riwayat Pendaftaran
                </h2>
                {isLoading && !tickets ? (
                    <div className="bg-white rounded-lg shadow-sm border p-8">
                        <div className="flex items-center justify-center">
                            <LoadingCircle size={32} />
                            <span className="ml-3 text-gray-600">
                                Memuat daftar Pendaftaran...
                            </span>
                        </div>
                    </div>
                ) : tickets && tickets.tickets && tickets.tickets.length > 0 ? (
                    <div className="">
                        <DataTable
                            data={tickets.tickets}
                            columns={columns}
                            onRowClick={(item) =>
                                navigate(
                                    `/settings/requestAccount/ticket/${item.ticketId}`
                                )
                            }
                            searchableColumns={[
                                "ticketId",
                                "status",
                                "accountList",
                            ]}
                            filterOptions={[
                                {
                                    key: "status",
                                    label: "Status",
                                    options: [
                                        { value: "pending", label: "Pending" },
                                        {
                                            value: "approved",
                                            label: "Disetujui",
                                        },
                                        { value: "rejected", label: "Ditolak" },
                                        {
                                            value: "cancelled",
                                            label: "Dibatalkan",
                                        },
                                    ],
                                },
                            ]}
                            isLoading={isLoading}
                            initialSort={{
                                key: "createdTime",
                                direction: "descending",
                            }}
                            tableId="requestAccount-table"
                            config={{
                                showFilter: true,
                                showSearch: true,
                                showTopEntries: true,
                                showBottomEntries: true,
                                showPagination: true,
                                clickableRows: true,
                                entriesOptions: [5, 10, 25, 50],
                            }}
                        />
                    </div>
                ) : tickets &&
                  (!tickets.tickets || tickets.tickets.length === 0) ? (
                    <div className="bg-white rounded-lg border-2 border-dashed border-gray-300 p-12 text-center">
                        <div className="mx-auto flex flex-col items-center">
                            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gray-100">
                                <Users className="h-10 w-10 text-gray-400" />
                            </div>
                            <h3 className="mt-4 text-lg font-semibold text-gray-900">
                                Belum Ada Pendaftaran Baru
                            </h3>
                            <p className="mt-2 text-sm text-gray-500 max-w-sm">
                                Anda belum memiliki Pendaftaran apapun. Mulai
                                dengan membuat Pendaftaran baru di bawah ini.
                            </p>
                            <div className="mt-6 flex gap-3">
                                <Link
                                    to="/settings/requestAccount/teacher"
                                    className="btn-primary-outline"
                                >
                                    Buat Pendaftaran Guru
                                </Link>
                                <Link
                                    to="/settings/requestAccount/student"
                                    className="btn-primary-outline"
                                >
                                    Buat Pendaftaran Siswa
                                </Link>
                            </div>
                        </div>
                    </div>
                ) : null}
                <h2 className="text-xl md:text-2xl font-bold my-8 md:my-12 mb-4 md:mb-6">
                    Buat Pendaftaran Baru
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 max-w-4xl mx-auto">
                    <Link
                        to="/settings/requestAccount/teacher"
                        className="group card-interactive min-h-32 md:min-h-48 rounded-lg items-center p-6 md:p-8 transition-all duration-200 hover:shadow-lg"
                    >
                        <div className="flex flex-col items-center gap-3 md:gap-4 text-center">
                            <div className="p-3 md:p-4 bg-blue-50 rounded-full group-hover:bg-blue-100 transition-colors">
                                <GraduationCap
                                    size={32}
                                    className="md:w-12 md:h-12 text-blue-600"
                                />
                            </div>
                            <div>
                                <div className="font-semibold text-lg md:text-xl mb-1">
                                    Pendaftaran Guru Baru
                                </div>
                                <div className="text-sm text-gray-600">
                                    Buat Pendaftaran tenaga pendidik baru
                                </div>
                            </div>
                        </div>
                    </Link>
                    <Link
                        to="/settings/requestAccount/student"
                        className="group card-interactive min-h-32 md:min-h-48 rounded-lg items-center p-6 md:p-8 transition-all duration-200 hover:shadow-lg"
                    >
                        <div className="flex flex-col items-center gap-3 md:gap-4 text-center">
                            <div className="p-3 md:p-4 bg-green-50 rounded-full group-hover:bg-green-100 transition-colors">
                                <Users
                                    size={32}
                                    className="md:w-12 md:h-12 text-green-600"
                                />
                            </div>
                            <div>
                                <div className="font-semibold text-lg md:text-xl mb-1">
                                    Pendaftaran Siswa Baru
                                </div>
                                <div className="text-sm text-gray-600">
                                    Buat Pendaftaran peserta didik baru
                                </div>
                            </div>
                        </div>
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default RequestAccountView;
