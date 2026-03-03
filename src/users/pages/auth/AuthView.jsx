import { useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { AuthContext } from "../../../shared/Components/Context/auth-context";
import LoadingCircle from "../../../shared/Components/UIElements/LoadingCircle";

import logo from "../../../assets/logos/ppgcikampek.webp";

const AuthView = () => {
    const auth = useContext(AuthContext);
    const navigate = useNavigate();

    useEffect(() => {
        if (auth.isLoggedIn) {
            navigate("/dashboard", { replace: true });
            return;
        }
        auth.redirectToLogin();
    }, [auth.isLoggedIn]);

    return (
        <div className="m-auto mt-16 md:mt-24 max-w-md">
            <div className="flex flex-col items-center gap-4">
                <img src={logo} alt="PPG Cikampek" className="size-24" />
                <h1 className="font-medium text-xl">Sistem Akademik Digital</h1>
                <LoadingCircle>Mengarahkan ke halaman login...</LoadingCircle>
            </div>
        </div>
    );
};

export default AuthView;
