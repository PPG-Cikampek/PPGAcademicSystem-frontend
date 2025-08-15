import React, { useContext, useEffect } from 'react';
import { Link } from 'react-router-dom';

import { useQuery } from '@tanstack/react-query';
import { AuthContext } from '../../../shared/Components/Context/auth-context';
import { StudentAttendanceContext } from '../../scan/context/StudentAttendanceContext';

import Profile from '../components/Profile';
import Dashboard from '../components/Dashboard';
import CurrentTime from '../components/CurrentTime';

import SequentialAnimation from '../../shared/Components/Animation/SequentialAnimation';
import InfoCard from '../../shared/Components/UIElements/InfoCard';
import SkeletonLoader from '../../../shared/Components/UIElements/SkeletonLoader';

const HomeScreenView = () => {
    const auth = useContext(AuthContext);


    // console.log(auth.isLoggedIn)
    // console.log(auth.userId)
    // console.log(auth.userRole)
    // console.log(auth.userName)
    // console.log(auth.userBranchId)
    // console.log(auth.userSubBranchId)
    // console.log(auth.currentSubBranchYear)
    // console.log(auth.userClassIds)
    // console.log(auth.token)

    const fetchUser = async () => {
        console.log(`fetching profile...`)
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/teachers/user/${auth.userId}`);
        if (!response.ok) {
            throw new Error('Failed to fetch user data');
        }
        const responseData = await response.json();

        console.log(responseData)

        const classIds = responseData.teacher?.classIds.map(item => item._id) || []

        auth.setAttributes(
            responseData.teacher?.userId?.subBranchId?.branchId?.id,
            responseData.teacher?.userId?.subBranchId?.id,
            classIds
        )
        return responseData.teacher;
    };

    const { data, isLoading, error } = useQuery({
        queryKey: ['teacherData'],
        queryFn: fetchUser,
        staleTime: 1000 * 60 * 5,
    });

    useEffect(() => {
        console.log(`${auth.userClassIds}`);
    }, [data]);


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
                        {/* <div>
                            <p className='font-urdu font-light text-center text-3xl mt-4 mb-2'>
                                السلام عليكم
                            </p>
                        </div> */}

                        <div>
                            <p className='text-lg font-medium mt-4 mb-1'>
                                Assalamu'alaikum, {data.name?.split(' ').slice(0, 2).join(' ')}!
                            </p>
                            <hr className='mb-2' />
                            <CurrentTime />
                        </div>

                        {/* <div className="card-basic mt-2 rounded-md flex-col mb-2">
                            <h1 className="text-xl font-medium mb-2">{getPositionName[data.position] || 'Guru'}</h1>
                            <CurrentTime />
                        </div> */}


                        {auth.userRole === 'teacher' && (
                            <div className="mb-2">
                                {data.classIds.map((item, index) => {
                                    const isClassInActiveAcademicYear = item?.teachingGroupId?.branchYearId?.academicYearId?.isActive
                                    console.log(item)
                                    if (isClassInActiveAcademicYear) {
                                        activeClassCount++;
                                        return <Dashboard key={index} data={item} />
                                    }
                                })}
                                {activeClassCount === 0 && (
                                    <InfoCard>
                                        <p>Belum terdaftar di kelas manapun. Hubungi PJP Kelompok!</p>
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
