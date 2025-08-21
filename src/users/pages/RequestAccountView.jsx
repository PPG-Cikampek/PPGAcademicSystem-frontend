import { useContext, useEffect, useState } from "react";
import { GraduationCap, Users } from "lucide-react";
import LoadingCircle from "../../shared/Components/UIElements/LoadingCircle";
import useHttp from "../../shared/hooks/http-hook";
import { AuthContext } from "../../shared/Components/Context/auth-context";
import { Link, useNavigate } from "react-router-dom";
import { formatDate } from "../../shared/Utilities/formatDateToLocal";
import DataTable from "../../shared/Components/UIElements/DataTable";
import Modal from "../../shared/Components/UIElements/ModalBottomClose";
import useToast from "../../shared/hooks/useToast";
import ToastContainer from "../../shared/Components/UIElements/ToastContainer";

const RequestAccountView = () => {
    const [tickets, setTickets] = useState();
    const [modal, setModal] = useState({
        title: "",
        message: "",
        onConfirm: null,
    });
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const { isLoading, sendRequest } = useHttp();
    const { toasts, showSuccess, showError, showWarning, removeToast } =
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
                    "Tidak dapat memuat daftar permintaan akun. Silakan refresh halaman atau coba lagi nanti."
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
                setModalIsOpen(false);

                setTickets((prevTickets) => ({
                    ...prevTickets,
                    tickets: prevTickets.tickets.filter(
                        (ticket) => ticket._id !== ticketId
                    ),
                }));
            } catch (err) {
                // Enhanced error handling with retry option
                const retryCancel = () => {
                    setModalIsOpen(false);
                    setTimeout(
                        () => handleCancelTicket(ticketId, respond),
                        100
                    );
                };

                showError(
                    "Gagal!",
                    `${
                        err.message || "Gagal membatalkan tiket"
                    }. Silakan coba lagi.`
                );
                setModalIsOpen(false);
            }
        };

        setModal({
            title: "Konfirmasi Pembatalan",
            message:
                "Apakah Anda yakin ingin membatalkan tiket ini? Tindakan ini tidak dapat dibatalkan.",
            onConfirm: confirmCancel,
        });
        setModalIsOpen(true);
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
                <div className="font-mono text-sm">
                    <div className="font-semibold">
                        {item.ticketId.slice(0, 8)}
                    </div>
                    <div className="text-xs text-gray-500">
                        {item.ticketId.slice(8)}
                    </div>
                </div>
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
            label: "Detail Akun",
            sortable: true,
            render: (item) => (
                <div className="text-sm">
                    <div className="font-semibold">
                        {item.accountList.length} akun
                    </div>
                    <div className="text-xs text-gray-500">
                        {item.accountList.length > 1
                            ? "Permintaan bulk"
                            : "Permintaan tunggal"}
                    </div>
                </div>
            ),
        },
        {
            key: "status",
            label: "Status",
            sortable: true,
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
            render: (item) =>
                item.status === "pending" ? (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            handleCancelTicket(item.ticketId, "cancelled");
                        }}
                        className="btn-danger-outline m-0 text-xs px-3 py-1"
                        title="Batalkan permintaan"
                    >
                        Batalkan
                    </button>
                ) : item.status === "cancelled" ||
                  item.status === "rejected" ? (
                    <span className="text-xs text-gray-500 italic">
                        Tidak ada aksi
                    </span>
                ) : (
                    <span className="text-xs text-green-600 font-medium">
                        Selesai
                    </span>
                ),
        },
    ];

    const ModalFooter = () => (
        <div className="flex gap-2 items-center">
            <button
                onClick={() => {
                    setModalIsOpen(false);
                }}
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
        <div className="min-h-screen px-4 py-8 md:p-8">
            <ToastContainer toasts={toasts} onRemoveToast={removeToast} />

            <Modal
                isOpen={modalIsOpen}
                onClose={() => setModalIsOpen(false)}
                title={modal.title}
                footer={<ModalFooter />}
            >
                {isLoading ? (
                    <div className="flex justify-center py-4">
                        <LoadingCircle size={24} />
                        <span className="ml-3 text-gray-600">Memproses...</span>
                    </div>
                ) : (
                    <div className="py-2">{modal.message}</div>
                )}
            </Modal>

            <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-6">
                Daftar Permintaan Akun
            </h2>
            <div className="max-w-6xl mx-auto">
                {isLoading && !tickets ? (
                    <div className="bg-white rounded-lg shadow-sm border p-8">
                        <div className="flex items-center justify-center">
                            <LoadingCircle size={32} />
                            <span className="ml-3 text-gray-600">
                                Memuat daftar permintaan...
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
                    <div className="bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 p-12 text-center">
                        <div className="mx-auto flex flex-col items-center">
                            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gray-100">
                                <Users className="h-10 w-10 text-gray-400" />
                            </div>
                            <h3 className="mt-4 text-lg font-semibold text-gray-900">
                                Belum Ada Permintaan Akun
                            </h3>
                            <p className="mt-2 text-sm text-gray-500 max-w-sm">
                                Anda belum memiliki permintaan akun apapun.
                                Mulai dengan membuat permintaan akun baru di
                                bawah ini.
                            </p>
                            <div className="mt-6 flex gap-3">
                                <Link
                                    to="/settings/requestAccount/teacher"
                                    className="btn-primary-outline"
                                >
                                    Buat Permintaan Guru
                                </Link>
                                <Link
                                    to="/settings/requestAccount/student"
                                    className="btn-primary"
                                >
                                    Buat Permintaan Siswa
                                </Link>
                            </div>
                        </div>
                    </div>
                ) : null}
                <h2 className="text-xl md:text-2xl font-bold my-8 md:my-12 mb-4 md:mb-6">
                    Buat Permintaan Akun
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
                                    Permintaan Akun Guru
                                </div>
                                <div className="text-sm text-gray-600">
                                    Buat permintaan akun untuk tenaga pendidik
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
                                    Permintaan Siswa Baru
                                </div>
                                <div className="text-sm text-gray-600">
                                    Buat permintaan peserta didik baru
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
