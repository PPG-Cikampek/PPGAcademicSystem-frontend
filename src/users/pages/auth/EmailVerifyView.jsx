import { useEffect, useState, useContext } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { AuthContext } from "../../../shared/Components/Context/auth-context";
import useHttp from "../../../shared/hooks/http-hook";

import logo from "../../../assets/logos/ppgcikampek.webp";
import LoadingCircle from "../../../shared/Components/UIElements/LoadingCircle";

const EmailVerifyView = () => {
    const token = useParams().token;
    const [message, setMessage] = useState("");
    const { isLoading, error, sendRequest } = useHttp();

    const auth = useContext(AuthContext);
    const navigate = useNavigate();

    console.log(token);

    useEffect(() => {
        const verifyEmail = async () => {
            try {
                const responseData = await sendRequest(
                    `${
                        import.meta.env.VITE_BACKEND_URL
                    }/users/verify-email/${token}`
                );
                console.log(responseData);
                setMessage(responseData.message);
            } catch (err) {
                console.log(err);
            }
        };
        verifyEmail();
    }, [sendRequest, token]);

    return (
        <div className="flex flex-col justify-center items-center gap-4 mx-auto mt-36 w-96 h-64 card-basic">
            {isLoading && (
                <div className="flex justify-center mt-16">
                    <LoadingCircle size={32} />
                </div>
            )}
            {(message || error) && (
                <>
                    <img
                        src={logo}
                        alt="logo"
                        className="self-center mb-4 size-24"
                    />
                    <h1
                        className={`text-2xl font-bold self-center ${
                            error && "text-red-500"
                        } `}
                    >
                        {message || error}
                    </h1>
                    <p
                        onClick={() => navigate("/")}
                        className="text-gray-600 hover:text-blue-500 hover:underline hover:cursor-pointer"
                    >
                        Kembali ke {auth.isLoggedIn ? "Dashboard" : "Login"}
                    </p>
                </>
            )}
        </div>
    );
};

export default EmailVerifyView;
