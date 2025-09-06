import { useState, useEffect, useContext } from "react";
import { Link, NavLink, useParams } from "react-router-dom";
import useHttp from "../../shared/hooks/http-hook";
import { AuthContext } from "../../shared/Components/Context/auth-context";

import ErrorCard from "../../shared/Components/UIElements/ErrorCard";
import LoadingCircle from "../../shared/Components/UIElements/LoadingCircle";
import { Icon } from "@iconify-icon/react";
import { Pencil } from "lucide-react";
import getTeacherPositionName from "../../shared/Utilities/getTeacherPositionName";

const TeacherDetailView = () => {
    const { isLoading, sendRequest } = useHttp();
    const [teacherDetails, setTeacherDetails] = useState([]);
    const [teacherInfo, setTeacherInfo] = useState(null);
    const [isProfileComplete, setIsProfileComplete] = useState();

    const auth = useContext(AuthContext);

    const teacherId = useParams().teacherId;

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString("id-ID", {
            day: "2-digit",
            month: "long",
            year: "numeric",
            timeZone: "Asia/Jakarta",
        });
    };

    const mapPosition = (position) => {
        switch (position) {
            case "branchTeacher":
                return "MT Desa";
            case "subBranchTeacher":
                return "MT Kelompok";
            case "localTeacher":
                return "MS";
            case "assistant":
                return "Asisten";
            default:
                return "";
        }
    };

    useEffect(() => {
        const fetchTeacherData = async () => {
            const url =
                auth.userRole !== "teacher"
                    ? `${
                          import.meta.env.VITE_BACKEND_URL
                      }/teachers/${teacherId}`
                    : `${import.meta.env.VITE_BACKEND_URL}/teachers/user/${
                          auth.userId
                      }`;

            try {
                const responseData = await sendRequest(url);
                console.log(responseData.teacher);

                setIsProfileComplete(responseData.teacher.isProfileComplete);

                setTeacherDetails([
                    {
                        label: "NIG",
                        value: responseData.teacher.nig,
                        icon: (
                            <Icon
                                icon="icon-park-outline:id-card-h"
                                width="24"
                                height="24"
                            />
                        ),
                    },
                    {
                        label: "Nomor HP",
                        value: responseData.teacher.phone,
                        icon: (
                            <Icon icon="tabler:phone" width="24" height="24" />
                        ),
                    },
                    {
                        label: "Tanggal Lahir",
                        value: formatDate(responseData.teacher.dateOfBirth),
                        icon: (
                            <Icon
                                icon="material-symbols:date-range-outline"
                                width="24"
                                height="24"
                            />
                        ),
                    },
                    {
                        label: "Jenis Kelamin",
                        value: responseData.teacher.gender
                            ? responseData.teacher.gender === "male"
                                ? "Laki-laki"
                                : "Perempuan"
                            : "",
                        icon: (
                            <Icon
                                icon="tabler:gender-bigender"
                                width="24"
                                height="24"
                            />
                        ),
                    },
                    {
                        label: "Domisili",
                        value: responseData.teacher.address,
                        icon: (
                            <Icon
                                icon="ph:map-pin-bold"
                                width="24"
                                height="24"
                            />
                        ),
                    },
                    {
                        label: "Posisi",
                        value: getTeacherPositionName(
                            responseData.teacher.position
                        ),
                        icon: (
                            <Icon
                                icon="material-symbols:category-outline-rounded"
                                width="24"
                                height="24"
                            />
                        ),
                    },
                    {
                        label: "Mulai Masa Tugas",
                        value: formatDate(
                            responseData.teacher.positionStartDate
                        ),
                        icon: (
                            <Icon
                                icon="lucide:briefcase"
                                width="24"
                                height="24"
                            />
                        ),
                    },
                ]);

                // Update teacher info
                setTeacherInfo({
                    name: responseData.teacher.name,
                    nig: responseData.teacher.nig,
                    image: responseData.teacher.image,
                    branch: responseData.teacher.userId.subBranchId.branchId
                        .name,
                    subBranch: responseData.teacher.userId.subBranchId.name,
                });
            } catch (err) {}
        };
        fetchTeacherData();
    }, [sendRequest]);

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-8 pb-24">
            {isLoading && (
                <div className="flex justify-center mt-16">
                    <LoadingCircle size={32} />
                </div>
            )}
            {teacherDetails.length > 0 && teacherInfo && (
                <>
                    {!isProfileComplete && (
                        <Link to={`/dashboard/teachers/${teacherId}/update`}>
                            <ErrorCard
                                error="Profile belum lengkap! Lengkapi"
                                onClear={() => setError(null)}
                            />
                        </Link>
                    )}
                    <h1 className="text-2xl font-medium mb-6 text-gray-700">
                        Biodata Tenaga Pendidik
                    </h1>
                    <div className="flex flex-col md:flex-row gap-4 md:gap-8">
                        <div className="card-basic rounded-md border mx-0 py-12 flex flex-col items-center flex-1 h-fit basis-96 min-w-80 md:max-w-96">
                            <img
                                src={
                                    teacherInfo?.image
                                        ? `${
                                              import.meta.env.VITE_BACKEND_URL
                                          }/${teacherInfo.image}`
                                        : "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png?20150327203541"
                                }
                                alt="Profile"
                                className="mt-2 rounded-md size-48 md:size-64 shrink-0"
                            />
                            <h2 className="mt-4 text-lg font-normal">
                                {teacherInfo.name}
                            </h2>
                            <p className="mt-2 text-gray-600">
                                {teacherInfo.nig}
                            </p>
                            <div className="mt-4 flex flex-col md:flex-row gap-2 text-center">
                                <NavLink to="" className="badge-primary">
                                    {teacherInfo.branch}
                                </NavLink>
                                <NavLink to="" className="badge-primary">
                                    {teacherInfo.subBranch}
                                </NavLink>
                                {/* <NavLink to="" className="badge-primary">{teacherInfo.class}</NavLink> */}
                            </div>
                        </div>

                        <div className="card-basic rounded-md p-8 flex flex-col border mx-0 flex-1 h-fit justify-start">
                            <h2 className="text-lg mb-8">
                                Profile Tenaga Pendidik
                            </h2>
                            <ul className="space-y-6">
                                {teacherDetails.map((item, index) => (
                                    <li
                                        key={index}
                                        className="flex items-center gap-2 mb-2"
                                    >
                                        {item.icon && (
                                            <div className="text-primary">
                                                {item.icon}
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
                            <Link
                                to={`/dashboard/teachers/${teacherId}/update`}
                                className="place-self-end"
                            >
                                <button className="button-primary pl-[11px] mt-6 md:mt-0">
                                    <Pencil className="w-4 h-4 mr-2" />
                                    Edit Profile
                                </button>
                            </Link>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default TeacherDetailView;
