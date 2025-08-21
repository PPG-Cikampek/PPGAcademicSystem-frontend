import { useContext, useState, useEffect } from "react";
import { useParams } from "react-router-dom";

import useHttp from "../../shared/hooks/http-hook";
import DynamicForm from "../../shared/Components/UIElements/DynamicForm";

import ErrorCard from "../../shared/Components/UIElements/ErrorCard";
import LoadingCircle from "../../shared/Components/UIElements/LoadingCircle";

const UpdateUserView = () => {
    const { isLoading, error, sendRequest, setError } = useHttp();
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [loadedSubBranches, setLoadedSubBranches] = useState([]);
    const [loadedUser, setLoadedUser] = useState();

    const userId = useParams().userId;

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const responseData = await sendRequest(
                    `${import.meta.env.VITE_BACKEND_URL}/users/${userId}`
                );
                setLoadedUser(responseData.users);
                console.log(responseData);
                console.log(responseData.users);
            } catch (err) {}
        };
        fetchUser();

        const fetchSubBranches = async () => {
            try {
                const responseData = await sendRequest(
                    `${
                        import.meta.env.VITE_BACKEND_URL
                    }/levels/branches/sub-branches/`
                );
                setLoadedSubBranches(responseData.subBranches);
            } catch (err) {}
        };
        fetchSubBranches();
    }, [sendRequest]);

    const handleFormSubmit = async (data) => {
        const url = `${import.meta.env.VITE_BACKEND_URL}/users/${userId}`;

        const body = JSON.stringify({
            name: data.name,
            role: data.role,
            subBranchId: data.subBranchId,
        });

        console.log(body);

        try {
            const responseData = await sendRequest(url, "PATCH", body, {
                "Content-Type": "application/json",
                Authorization: "Bearer " + auth.token,
            });
        } catch (err) {
            // Error is already handled by useHttp
        }
    };

    if (!loadedUser && !isLoading) {
        return (
            <div className="m-4 flex justify-center">
                <div className="card-basic flex flex-col items-center">
                    <h2 className="font-semibold">404 place not found!</h2>
                </div>
            </div>
        );
    }

    return (
        <div className="m-auto max-w-md mt-14 md:mt-8">
            {!loadedUser && isLoading && (
                <div className="flex justify-center mt-16">
                    <LoadingCircle size={32} />
                </div>
            )}

            <div
                className={`pb-24 transition-opacity duration-300 ${
                    isTransitioning ? "opacity-0" : "opacity-100"
                }`}
            >
                {error && (
                    <ErrorCard error={error} onClear={() => setError(null)} />
                )}

                {!isLoading && loadedUser && (
                    <DynamicForm
                        title={
                            loadedUser.role === "admin"
                                ? "Ubah Data Admin"
                                : loadedUser.role === "subBranchAdmin"
                                ? "Ubah Data Admin Kelompok"
                                : loadedUser.role === "teacher"
                                ? "Ubah Data Guru"
                                : "Ubah Data Peserta Didik"
                        }
                        subtitle={"Sistem Akademik Digital"}
                        fields={[
                            {
                                name: "name",
                                label: "Nama",
                                placeholder: "Nama Lengkap",
                                type: "text",
                                required: true,
                                value: loadedUser.name,
                            },
                            ...(loadedUser.role === "admin"
                                ? [
                                      {
                                          name: "role",
                                          label: "Jenis Akun",
                                          placeholder: "admin",
                                          type: "select",
                                          required: true,
                                          value: loadedUser.role,
                                          options: [
                                              {
                                                  label: "Admin",
                                                  value: "admin",
                                              },
                                              {
                                                  label: "Admin Kelompok",
                                                  value: "subBranchAdmin",
                                              },
                                          ],
                                      },
                                  ]
                                : []),
                            {
                                name: "subBranchId",
                                label: "Kelompok",
                                placeholder: "Kelompok",
                                type: "select",
                                required: true,
                                value: loadedUser.subBranchId.name,
                                options: loadedSubBranches.map(({ name }) => ({
                                    label: name,
                                    value: name,
                                })),
                            },
                        ]}
                        onSubmit={handleFormSubmit}
                        disabled={isLoading}
                        reset={false}
                        footer={false}
                        button={
                            <div className="flex flex-col justify-stretch mt-4">
                                <button
                                    type="submit"
                                    className={`button-primary ${
                                        isLoading
                                            ? "opacity-50 hover:cursor-not-allowed"
                                            : ""
                                    }`}
                                    disabled={isLoading}
                                >
                                    {isLoading ? (
                                        <LoadingCircle>
                                            Processing...
                                        </LoadingCircle>
                                    ) : (
                                        "Update"
                                    )}
                                </button>
                                {/* <button
                                type="button"
                                onClick={handleToggle}
                                className="button-secondary"
                                disabled={isLoading}
                            >
                                {isAdmin ? 'Masuk Generus' : 'Masuk Pengurus'}
                            </button> */}
                            </div>
                        }
                    />
                )}
            </div>
        </div>
    );
};

export default UpdateUserView;
