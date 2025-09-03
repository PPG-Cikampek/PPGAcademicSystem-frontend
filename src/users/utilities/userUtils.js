export const getRoleColor = (role) => {
    const roles = {
        admin: "bg-red-100 text-red-700",
        branchAdmin: "bg-orange-100 text-orange-700",
        subBranchAdmin: "bg-yellow-100 text-yellow-700",
        teacher: "bg-violet-100 text-violet-700",
        student: "bg-blue-100 text-blue-700",
        curriculum: "bg-green-100 text-green-700",
        munaqisy: "bg-pink-100 text-pink-700",
    };
    return roles[role] || "bg-gray-100 text-gray-700";
};

export const getInitials = (name) => {
    return name
        ?.split(" ")
        .map((word) => word[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
};
