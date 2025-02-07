import React, { useContext } from 'react';
import { Link } from 'react-router-dom';

import { useQuery } from '@tanstack/react-query';
import { AuthContext } from '../../../shared/Components/Context/auth-context';
import { StudentAttendanceContext } from '../../scan/context/StudentAttendanceContext';

import Profile from '../components/Profile';
import Dashboard from '../components/Dashboard';
import CurrentTime from '../components/CurrentTime';

import LoadingCircle from '../../../shared/Components/UIElements/LoadingCircle';
import SequentialAnimation from '../../shared/Components/Animation/SequentialAnimation';
import InfoCard from '../../shared/Components/UIElements/InfoCard';

const HomeScreenView = () => {
    const auth = useContext(AuthContext);
    const { state, dispatch } = useContext(StudentAttendanceContext);

    const getPositionName = {
        branchTeacher: 'MT Desa',
        teachingGroupTeacher : 'MT Kelompok',
        localTeacher : 'MS',
        assistant : 'Asisten',
    }

    // console.log(auth.isLoggedIn)
    // console.log(auth.userId)
    // console.log(auth.userRole)
    // console.log(auth.userName)
    // console.log(auth.userBranchId)
    // console.log(auth.userTeachingGroupId)
    // console.log(auth.currentTeachingGroupYear)
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
            responseData.teacher?.userId?.teachingGroupId?.branchId?.id,
            responseData.teacher?.userId?.teachingGroupId?.id,
            classIds
        )
        return responseData.teacher;
    };

    const { data, isLoading, error } = useQuery({
        queryKey: ['teacherData'],
        queryFn: fetchUser,
        staleTime: 1000 * 60 * 5,
    });

    let activeClassCount = 0;
    // console.log(JSON.stringify(data))

    return (
        <div className="flex flex-col pb-12">
            <div>
                <Profile user={data} isLoading={isLoading} />
            </div>
            {!data && isLoading && (
                < div className="flex justify-center mt-44">
                    <LoadingCircle size={32} />
                </div>
            )}
            {data && !isLoading && (
                <SequentialAnimation>
                    <div className="mt-16 flex-1 p-4">
                        <div className="card-basic rounded-md flex-col mb-2">
                            <h1 className="text-xl font-medium mb-2">{getPositionName[data.position] || data.position}</h1>
                            <CurrentTime />
                        </div>
                        <div className="mb-2">
                            {data.classIds.map((item, index) => {
                                const isClassInTeachingGroupYear = item?.teachingGroupYearId?.academicYearId?.isActive
                                if (isClassInTeachingGroupYear) {
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
                    </div>
                </SequentialAnimation>
            )}
        </div>
    );
};

export default HomeScreenView;
