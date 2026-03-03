import { useContext, useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { AuthContext } from "../../../shared/Components/Context/auth-context";
import usePostLoginSetup from "../../../shared/hooks/usePostLoginSetup";
import LoadingCircle from "../../../shared/Components/UIElements/LoadingCircle";
import ErrorCard from "../../../shared/Components/UIElements/ErrorCard";

const AuthCallbackView = () => {
    const [searchParams] = useSearchParams();
    const [error, setError] = useState(null);
    const auth = useContext(AuthContext);
    const navigate = useNavigate();
    const runSetup = usePostLoginSetup();

    useEffect(() => {
        const token = searchParams.get("token");
        if (!token) {
            setError("Token tidak ditemukan di URL callback.");
            return;
        }

        let cancelled = false;

        const process = async () => {
            try {
                const profile = await auth.handleCallback(token);
                await runSetup(profile);
                if (!cancelled) {
                    navigate("/dashboard", { replace: true });
                }
            } catch (err) {
                if (!cancelled) {
                    setError(err.message || "Gagal memproses login callback.");
                }
            }
        };

        process();

        return () => {
            cancelled = true;
        };
    }, []);

    if (error) {
        return (
            <div className="m-auto mt-16 md:mt-24 max-w-md">
                <ErrorCard error={error} onClear={() => setError(null)} />
                <div
                    onClick={() => auth.redirectToLogin()}
                    className="mt-2 text-center"
                >
                    <p className="text-gray-600 hover:text-primary active:text-primary text-xs underline hover:cursor-pointer">
                        Coba Login Kembali
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex justify-center mt-32">
            <LoadingCircle size={32}>Memproses login...</LoadingCircle>
        </div>
    );
};

export default AuthCallbackView;
