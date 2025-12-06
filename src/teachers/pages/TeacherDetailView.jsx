import React from "react";
import { Link, NavLink, useParams } from "react-router-dom";
import useTeacherData from "../hooks/useTeacherData";
// AuthContext is used internally by the `useTeacherData` hook

import ErrorCard from "../../shared/Components/UIElements/ErrorCard";
import LoadingCircle from "../../shared/Components/UIElements/LoadingCircle";
import { Pencil } from "lucide-react";
// util function `getTeacherPositionName` is used inside the custom hook now

const TeacherDetailView = () => {
    const teacherId = useParams().teacherId;
    const { isLoading, teacherDetails, teacherInfo, teacherData } = useTeacherData(teacherId);

    // Data fetching is handled by `useTeacherData` (react query)

    return (
        <div className="bg-gray-50 p-4 md:p-8 pb-24 min-h-screen">
            {isLoading && (
                <div className="flex justify-center mt-16">
                    <LoadingCircle size={32} />
                </div>
            )}
            {teacherDetails.length > 0 && teacherInfo && (
                <>
                    {!teacherData?.isProfileComplete && (
                        <Link to={`/dashboard/teachers/${teacherId || teacherData?.id}/update`}>
                            <ErrorCard error="Profile belum lengkap! Lengkapi" />
                        </Link>
                    )}
                    <h1 className="mb-6 font-medium text-gray-700 text-2xl">
                        Biodata Tenaga Pendidik
                    </h1>
                    <div className="flex md:flex-row flex-col gap-4 md:gap-8">
                        <div className="flex flex-col flex-1 items-center mx-0 py-12 border rounded-md min-w-80 md:max-w-96 h-fit card-basic basis-96">
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
                            <h2 className="mt-4 font-normal text-lg">
                                {teacherInfo.name}
                            </h2>
                            <p className="mt-2 text-gray-600">
                                {teacherInfo.nig}
                            </p>
                            <div className="flex md:flex-row flex-col gap-2 mt-4 text-center">
                                <NavLink to="" className="badge-primary">
                                    {teacherInfo.branch}
                                </NavLink>
                                <NavLink to="" className="badge-primary">
                                    {teacherInfo.subBranch}
                                </NavLink>
                                {/* <NavLink to="" className="badge-primary">{teacherInfo.class}</NavLink> */}
                            </div>
                        </div>

                        <div className="flex flex-col flex-1 justify-start mx-0 p-8 border rounded-md h-fit card-basic">
                            <h2 className="mb-8 text-lg">
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
                                to={`/dashboard/teachers/${teacherId || teacherData?.id}/update`}
                                className="place-self-end"
                            >
                                <button className="mt-6 md:mt-0 pl-[11px] button-primary">
                                    <Pencil className="mr-2 w-4 h-4" />
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
