import { useContext, useEffect } from "react";

import { useQuery } from "@tanstack/react-query";
import { AuthContext } from "../../../shared/Components/Context/auth-context";

import Profile from "../components/Profile";
import Dashboard from "../components/Dashboard";
import CurrentTime from "../components/CurrentTime";

import SequentialAnimation from "../../shared/Components/Animation/SequentialAnimation";
import InfoCard from "../../shared/Components/UIElements/InfoCard";
import SkeletonLoader from "../../../shared/Components/UIElements/SkeletonLoader";

const HomeScreenView = () => {
    const auth = useContext(AuthContext);

    const fetchUser = async () => {
        console.log(`fetching profile...`);
        const response = await fetch(
            `${import.meta.env.VITE_BACKEND_URL}/teachers/user/${auth.userId}`
        );
        if (!response.ok) {
            throw new Error("Failed to fetch user data");
        }
        const responseData = await response.json();

        const classIds =
            responseData.teacher?.classIds.map((item) => item._id) || [];

        auth.setAttributes(
            responseData.teacher?.userId?.subBranchId?.branchId?.id,
            responseData.teacher?.userId?.subBranchId?.id,
            classIds
        );
        return responseData.teacher;
    };

    const { data, isLoading, error } = useQuery({
        queryKey: ["teacherData"],
        queryFn: fetchUser,
        staleTime: 1000 * 60 * 5,
    });

    useEffect(() => {
        console.log(`${auth.userClassIds}`);
    }, [data]);

    data && console.log(data);

    let activeClassCount = 0;

    return (
        <div className="flex flex-col pb-12">
            <div>
                <Profile user={data} isLoading={isLoading} />
            </div>
            {!data && isLoading && (
                <div className="mt-44 px-4">
                    <SkeletonLoader
                        variant="rectangular"
                        height="200px"
                        className="rounded-lg max-w-xl mx-auto"
                    />
                    <div className="mt-4 max-w-xl mx-auto">
                        <SkeletonLoader
                            variant="text"
                            count={3}
                            className="max-w-[80%]"
                        />
                    </div>
                </div>
            )}
            {data && !isLoading && (
                <SequentialAnimation>
                    <div className="mt-16 flex-1 h-fit p-4">
                        <div className="flex flex-row items-end mb-2">
                            <p className="font-lpmq font-light text-lg mt-4 mb-2">
                                السلام عليكم
                            </p>
                            <p className="text-lg font-medium mt-4 mb-1">
                                {",  "}
                                {data.name?.split(" ").slice(0, 2).join(" ")}!
                            </p>
                        </div>
                        <hr className="mb-2" />
                        <CurrentTime />

                        {auth.userRole === "teacher" && (
                            <div className="mb-2">
                                {data.classIds.map((item, index) => {
                                    const isClassInActiveAcademicYear =
                                        item?.teachingGroupId?.branchYearId
                                            ?.academicYearId?.isActive;
                                    if (isClassInActiveAcademicYear) {
                                        activeClassCount++;
                                        return (
                                            <Dashboard
                                                key={index}
                                                data={item}
                                            />
                                        );
                                    }
                                })}
                                {activeClassCount === 0 && (
                                    <InfoCard>
                                        <p>
                                            Belum terdaftar di kelas manapun.
                                            Hubungi PJP Kelompok!
                                        </p>
                                        {/* <p>Buat kelas baru di <Link to={'/dashboard/academic'} className='active:text-blue-400 underline'>pengaturan akademik</Link></p> */}
                                    </InfoCard>
                                )}
                            </div>
                        )}
                    </div>
                </SequentialAnimation>
            )}
        </div>
    );
};

export default HomeScreenView;
