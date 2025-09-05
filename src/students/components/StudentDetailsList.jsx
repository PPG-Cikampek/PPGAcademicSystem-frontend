import { useContext } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../../shared/Components/Context/auth-context";
import { Icon } from "@iconify-icon/react";
import { Pencil } from "lucide-react";

const StudentDetailsList = ({ studentDetails, studentData }) => {
    const auth = useContext(AuthContext);

    return (
        <div className="card-basic rounded-md p-8 flex flex-col border mx-0 flex-1 h-full justify-between">
            <ul className="space-y-6">
                <h2 className="text-lg mb-8">Profile Peserta Didik</h2>
                {studentDetails.map((item, index) => (
                    <li
                        key={index}
                        className="flex items-center gap-2 mb-2"
                    >
                        {item.iconName && (
                            <div className="text-primary">
                                <Icon
                                    icon={item.iconName}
                                    width="24"
                                    height="24"
                                />
                            </div>
                        )}
                        <span className="font-semibold">
                            {item.label}:
                        </span>
                        <span className="font-medium text-gray-700">
                            {item.value}
                        </span>
                    </li>
                ))}
            </ul>
            {(auth.userRole !== "teacher" ||
                studentData.isProfileComplete) && (
                <Link
                    to={`/dashboard/students/${studentData.id}/update`}
                    className="place-self-end"
                >
                    <button className="button-primary pl-[11px] mt-0">
                        <Pencil className="w-4 h-4 mr-2" />
                        Edit Profile
                    </button>
                </Link>
            )}
        </div>
    );
};

export default StudentDetailsList;
