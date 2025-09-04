import { getInitials } from "../../shared/Utilities/getInitials";

const UserCard = ({
    user,
    onClick,
    isRegistered,
    identifier,
    statusText,
    backendUrl,
    avatarColor = "green",
}) => {
    const isDisabled = isRegistered || user.isProfileComplete === false;

    const avatarClasses = `w-10 h-10 rounded-full bg-${avatarColor}-200 text-${avatarColor}-500 hidden md:flex items-center justify-center font-medium`;

    return (
        <div
            className={`p-4 border rounded-lg transition-all duration-300 ${
                isDisabled
                    ? "bg-gray-100 border-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-white border-gray-200 hover:ring-4 hover:ring-blue-200 hover:border-blue-500 hover:shadow-xl cursor-pointer"
            }`}
            onClick={isDisabled ? undefined : onClick}
        >
            <div className="flex justify-between items-center gap-2">
                <div className="flex gap-4 items-center">
                    {user.image ? (
                        <img
                            src={
                                user.thumbnail
                                    ? user.thumbnail
                                    : `${backendUrl}/${user.image}`
                            }
                            alt={user.name}
                            className="w-10 h-10 rounded-full border border-gray-200 bg-white"
                        />
                    ) : (
                        <div className={avatarClasses}>
                            {getInitials(user.name)}
                        </div>
                    )}
                    <div className="flex flex-col gap-1">
                        <p className="text-lg font-semibold">{user.name}</p>
                        <p className="text-base font-normal">
                            {user[identifier]}
                        </p>
                    </div>
                </div>
                <span
                    className={`text-sm font-medium ${
                        user.isProfileComplete === false
                            ? "text-red-500"
                            : isRegistered
                            ? "text-gray-500"
                            : "text-blue-500 hidden hover:block"
                    }`}
                >
                    {statusText}
                </span>
            </div>
        </div>
    );
};

export default UserCard;
