import { useState, useEffect, useContext } from "react";
import { Link, useParams } from "react-router-dom";
import { AuthContext } from "../../shared/Components/Context/auth-context";

import ErrorCard from "../../shared/Components/UIElements/ErrorCard";
import SkeletonLoader from "../../shared/Components/UIElements/SkeletonLoader";

import StudentProfileCard from "../components/StudentProfileCard";
import StudentDetailsList from "../components/StudentDetailsList";
import useStudentData from "../hooks/useStudentData";

const StudentDetailView = () => {
    const auth = useContext(AuthContext);
    const studentId = useParams().studentId;
    const { isLoading, studentDetails, studentInfo, studentData } = useStudentData(studentId);

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-8 pb-24">
            {isLoading && (
                <div className="flex flex-col gap-6 mt-16 px-4">
                    <div className="flex gap-4">
                        <SkeletonLoader
                            variant="circular"
                            width="120px"
                            height="120px"
                        />
                        <div className="flex-1">
                            <SkeletonLoader
                                variant="text"
                                count={3}
                                className="max-w-[90%]"
                            />
                        </div>
                    </div>
                    <SkeletonLoader
                        variant="rectangular"
                        height="200px"
                        className="rounded-lg"
                    />
                </div>
            )}
            {!isLoading && studentDetails.length > 0 && studentInfo && (
                <>
                    {!studentData.isProfileComplete && (
                        <Link to={`/dashboard/students/${studentId}/update`}>
                            <ErrorCard
                                error="Profile belum lengkap! Lengkapi"
                            />
                        </Link>
                    )}
                    <h1 className="text-2xl font-medium mb-6 text-gray-700">
                        Data Peserta Didik
                    </h1>
                    <div className="flex flex-col md:flex-row gap-8">
                        <StudentProfileCard
                            studentInfo={studentInfo}
                            studentData={studentData}
                            studentDetails={studentDetails}
                        />
                        <StudentDetailsList
                            studentDetails={studentDetails}
                            studentData={studentData}
                        />
                    </div>
                </>
            )}
        </div>
    );
};

export default StudentDetailView;
