import { useEffect, useState } from "react";
import useHttp from "../../shared/hooks/http-hook";
import { useParams } from "react-router-dom";
import AccountRequestTable from "../components/AccountRequestTable";

const RequestAccountTicketDetail = () => {
    const [accounts, setAccounts] = useState([]);
    const [role, setRole] = useState();
    const { isLoading, sendRequest } = useHttp();
    const { ticketId } = useParams();

    useEffect(() => {
        let abort = false;
        const fetchTicketData = async () => {
            const url = `${import.meta.env.VITE_BACKEND_URL}/users/account-requests/ticket/${ticketId}`;
            try {
                const responseData = await sendRequest(url);
                /* Expected shape examples:
                   [{ accountList: [ {...}, ... ], accountRole: 'student' }]
                   or { accountList: [...], accountRole: 'teacher' }
                */
                let container = responseData;
                if (!container) return;
                if (Array.isArray(container)) {
                    container = container[0];
                }
                const list = container?.accountList || [];
                if (!abort) {
                    setAccounts(list);
                    setRole(container?.accountRole || list[0]?.accountRole);
                }
            } catch (e) {
                if (import.meta.env.DEV) {
                    console.warn("Failed to load ticket detail", e);
                }
            }
        };
        fetchTicketData();
        return () => {
            abort = true;
        };
    }, [sendRequest, ticketId]);

    return (
        <div className="min-h-screen px-4 py-8 md:p-8">
            <div className="max-w-6xl mx-auto">
                <div className="flex flex-col justify-between items-start gap-2 mb-4">
                    <h1 className="text-2xl font-semibold text-gray-900">
                        Daftar Pendaftaran Akun
                    </h1>
                    <div className="w-full mt-4">
                        {isLoading ? (
                            <div className="text-gray-500 text-sm">Memuat data...</div>
                        ) : (
                            <AccountRequestTable data={accounts} role={role} />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RequestAccountTicketDetail;
