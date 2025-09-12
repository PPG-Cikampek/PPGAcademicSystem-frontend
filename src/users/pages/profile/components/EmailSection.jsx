import { useState, useCallback } from "react";
import LoadingCircle from "../../../../shared/Components/UIElements/LoadingCircle";

const EmailSection = ({ 
    isLoading, 
    isSubmitting, 
    onEmailUpdate 
}) => {
    const [newEmail, setNewEmail] = useState("");
    const [emailError, setEmailError] = useState("");

    const handleEmailChange = useCallback((e) => {
        setNewEmail(e.target.value);
        if (emailError) setEmailError("");
    }, [emailError]);

    const handleEmailUpdate = useCallback(async () => {
        if (!newEmail) {
            setEmailError("Email tidak boleh kosong!");
            return;
        }

        const success = await onEmailUpdate(newEmail);
        if (success) {
            setNewEmail("");
            setEmailError("");
        }
    }, [newEmail, onEmailUpdate]);

    return (
        <div className="my-4">
            <h2 className="text-base">Ubah Email</h2>
            <div className="flex items-center justify-start">
                <input
                    type="email"
                    value={newEmail}
                    onChange={handleEmailChange}
                    placeholder="Email Baru"
                    className={`grow mr-2 p-2 my-1 border rounded-[4px] shadow-xs hover:ring-1 hover:ring-primary focus:outline-hidden focus:ring-2 focus:ring-primary transition-all duration-300 `}
                />
                <button
                    type="button"
                    className={`button-primary mt-0 py-2 inline-block ${
                        isLoading || isSubmitting
                            ? "opacity-50 cursor-not-allowed"
                            : ""
                    }`}
                    disabled={isLoading || isSubmitting}
                    onClick={handleEmailUpdate}
                >
                    {isLoading || isSubmitting ? (
                        <LoadingCircle />
                    ) : (
                        "Ubah"
                    )}
                </button>
            </div>
            {emailError && (
                <p className="text-red-500">{emailError}</p>
            )}
        </div>
    );
};

export default EmailSection;