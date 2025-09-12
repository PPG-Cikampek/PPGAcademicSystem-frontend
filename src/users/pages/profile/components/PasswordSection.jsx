import { useState, useCallback } from "react";
import { Icon } from "@iconify-icon/react/dist/iconify.js";
import LoadingCircle from "../../../../shared/Components/UIElements/LoadingCircle";

const PasswordSection = ({ 
    userData, 
    isLoading, 
    isSubmitting, 
    onPasswordUpdate 
}) => {
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [oldPassword, setOldPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [passwordError, setPasswordError] = useState("");

    const handlePasswordChange = useCallback((e) => {
        setPassword(e.target.value);
        if (passwordError) setPasswordError("");
    }, [passwordError]);

    const handleConfirmPasswordChange = useCallback((e) => {
        setConfirmPassword(e.target.value);
        if (passwordError) setPasswordError("");
    }, [passwordError]);

    const handleOldPasswordChange = useCallback((e) => {
        setOldPassword(e.target.value);
        if (passwordError) setPasswordError("");
    }, [passwordError]);

    const toggleShowPassword = useCallback(() => {
        setShowPassword((prevState) => !prevState);
    }, []);

    const handlePasswordUpdate = useCallback(async () => {
        if (password !== confirmPassword) {
            setPasswordError("Passwords tidak sama");
            return;
        }

        const success = await onPasswordUpdate({
            oldPassword,
            newPassword: password,
            confirmNewPassword: confirmPassword
        });

        if (success) {
            setPassword("");
            setConfirmPassword("");
            setOldPassword("");
            setPasswordError("");
        }
    }, [password, confirmPassword, oldPassword, onPasswordUpdate]);

    // Don't render if email is not verified
    if (isLoading || !userData || !userData.isEmailVerified) {
        return null;
    }

    return (
        <div className="mb-4 flex flex-col">
            <h2 className="text-base">Ubah Password</h2>
            <input
                type="password"
                value={oldPassword}
                onChange={handleOldPasswordChange}
                placeholder="Password Lama"
                className={`p-2 my-1 border rounded-[4px] shadow-xs hover:ring-1 hover:ring-primary focus:outline-hidden focus:ring-2 focus:ring-primary transition-all duration-300 `}
            />
            <div className="relative">
                <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={handlePasswordChange}
                    placeholder="Password Baru"
                    className={`p-2 my-1 border rounded-[4px] shadow-xs hover:ring-1 hover:ring-primary focus:outline-hidden focus:ring-2 focus:ring-primary transition-all duration-300 w-full`}
                />
                <span
                    onClick={toggleShowPassword}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
                >
                    {showPassword ? (
                        <Icon
                            icon="eva:eye-outline"
                            width="24"
                            height="24"
                            className="text-gray-400 hover:text-black transition-all duration-200"
                        />
                    ) : (
                        <Icon
                            icon="eva:eye-off-outline"
                            width="24"
                            height="24"
                            className="text-gray-400 hover:text-black transition-all duration-200"
                        />
                    )}
                </span>
            </div>
            <input
                type="password"
                value={confirmPassword}
                onChange={handleConfirmPasswordChange}
                placeholder="Konfirmasi Password Baru"
                className={`p-2 my-1 border rounded-[4px] shadow-xs hover:ring-1 hover:ring-primary focus:outline-hidden focus:ring-2 focus:ring-primary transition-all duration-300 `}
            />
            {passwordError && (
                <p className="text-red-500">{passwordError}</p>
            )}
            <button
                type="button"
                className={`button-primary py-2 inline-block ${
                    isLoading || isSubmitting
                        ? "opacity-50 cursor-not-allowed"
                        : ""
                }`}
                disabled={isLoading || isSubmitting}
                onClick={handlePasswordUpdate}
            >
                {isLoading || isSubmitting ? (
                    <LoadingCircle>Processing...</LoadingCircle>
                ) : (
                    "Update"
                )}
            </button>
        </div>
    );
};

export default PasswordSection;