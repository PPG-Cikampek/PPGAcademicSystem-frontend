import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../shared/Components/Context/auth-context";
import useHttp from "../../shared/hooks/http-hook";

export const useUsers = () => {
    const [users, setUsers] = useState();
    const [selectedUserIds, setSelectedUserIds] = useState([]);
    const [groupVisibility, setGroupVisibility] = useState({
        admin: true,
        BranchAdmin: true,
        subBranchAdmin: true,
        teacher: true,
        student: true,
        curriculum: true,
    });

    const roleOrder = [
        "admin",
        "branchAdmin",
        "subBranchAdmin",
        "teacher",
        "student",
        "curriculum",
        "munaqisy",
    ];

    const { isLoading, error, sendRequest, setError } = useHttp();
    const navigate = useNavigate();
    const auth = useContext(AuthContext);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const responseData = await sendRequest(
                    `${import.meta.env.VITE_BACKEND_URL}/users/`
                );
                setUsers(responseData);
                console.log(responseData);
            } catch (err) {
                // Error is handled by useHttp
            }
        };
        fetchUsers();
    }, [sendRequest]);

    const toggleGroupVisibility = (role) => {
        setGroupVisibility((prev) => ({ ...prev, [role]: !prev[role] }));
    };

    const handleDeleteUser = async (userId) => {
        try {
            const responseData = await sendRequest(
                `${import.meta.env.VITE_BACKEND_URL}/users/${userId}`,
                "DELETE",
                null,
                {
                    Authorization: "Bearer " + auth.token,
                }
            );
            setUsers((prevUsers) => ({
                ...prevUsers,
                users: prevUsers.users.filter((user) => user._id !== userId),
            }));
            return responseData.message;
        } catch (err) {
            throw err;
        }
    };

    const handleBulkDelete = async () => {
        if (selectedUserIds.length === 0) {
            throw new Error("Please select at least one user.");
        }

        const url = `${import.meta.env.VITE_BACKEND_URL}/users/bulk-delete`;
        const body = JSON.stringify({ userIds: selectedUserIds });
        console.log(body);
        try {
            const responseData = await sendRequest(url, "DELETE", body, {
                "Content-Type": "application/json",
                Authorization: "Bearer " + auth.token,
            });
            setUsers((prevUsers) => ({
                ...prevUsers,
                users: prevUsers.users.filter(
                    (user) => !selectedUserIds.includes(user._id)
                ),
            }));
            setSelectedUserIds([]);
            return responseData.message;
        } catch (err) {
            throw err;
        }
    };

    return {
        users,
        selectedUserIds,
        setSelectedUserIds,
        groupVisibility,
        toggleGroupVisibility,
        roleOrder,
        isLoading,
        error,
        setError,
        handleDeleteUser,
        handleBulkDelete,
        navigate,
    };
};
