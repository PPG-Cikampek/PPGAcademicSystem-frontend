import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import useHttp from '../../shared/hooks/http-hook';
import DynamicForm from '../../shared/Components/UIElements/DynamicForm';
import { AuthContext } from '../../shared/Components/Context/auth-context';

import ErrorCard from '../../shared/Components/UIElements/ErrorCard';
import LoadingCircle from '../../shared/Components/UIElements/LoadingCircle';

import logo from '../../assets/logos/ppgcikampek.png';
import QRScanner from '../components/QRScanner';

const AuthView = () => {
    const [isStudent, setIsStudent] = useState(false);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [loginFields, setLoginFields] = useState(false)
    const [studentLoginFields, setStudentLoginFields] = useState([]);
    const [nis, setNis] = useState()
    const { isLoading, error, sendRequest, setError } = useHttp();

    const auth = useContext(AuthContext);
    const navigate = useNavigate();

    useEffect(() => {
        setLoginFields([
            { name: 'email', label: 'Email', placeholder: 'Email', type: 'email', required: true },
            { name: 'password', label: 'Password', placeholder: 'Password', type: 'password', required: true },
        ])
    }, [studentLoginFields])


    const handleFormSubmit = async (data) => {
        const url = `${import.meta.env.VITE_BACKEND_URL}/users/login`

        const body = JSON.stringify({ email: data.email, password: data.password, nis });

        let responseData;
        let teachingGroupYearData
        try {
            responseData = await sendRequest(url, 'POST', body, {
                'Content-Type': 'application/json'
            });

            try {
                teachingGroupYearData = await sendRequest(`${import.meta.env.VITE_BACKEND_URL}/teachingGroupYears/teachingGroup/${responseData.user.teachingGroupId.id}`)
            } catch (err) { }

            let activeAcademicYear
            if (teachingGroupYearData) {
                activeAcademicYear = teachingGroupYearData.teachingGroupYears.find(year => year.academicYearId.isActive);
            }

            let teacherData
            if (responseData.user.role === 'teacher') {
                try {
                    teacherData = await sendRequest(`${import.meta.env.VITE_BACKEND_URL}/teachers/user/${responseData.user.id}`)
                    console.log(teacherData)
                } catch (err) {
                    console.log(err)
                }
            } else {
            }

            console.log('logging IN')
            console.log(responseData)

            const classIds = teacherData?.teacher?.classIds.map(item => item._id) || []

            auth.login(
                responseData.user.id,
                responseData.user.role,
                responseData.user.name,
                responseData.user.teachingGroupId.branchId.id,
                responseData.user.teachingGroupId.id,
                activeAcademicYear?.academicYearId?.name || null,
                classIds,
                responseData.token
            );

            console.log('logged IN')
        } catch (err) {
            console.log(err)

        }
    };

    const handleToggle = () => {
        setIsTransitioning(true);
        setError(null);
        setTimeout(() => {
            setIsStudent((prev) => !prev);
            setIsTransitioning(false);
        }, 200);
    };

    return (
        <div className="m-auto max-w-md mt-16 md:mt-24">

            <div className={`pb-24 transition-opacity duration-300 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
                {error && (
                    <div className="px-2">
                        <ErrorCard error={error} onClear={() => setError(null)} />
                    </div>
                )}
                {isStudent === false && (
                    <DynamicForm
                        logo={logo}
                        title='PPG Cikampek'
                        subtitle={'Sistem Absensi Digital'}
                        fields={loginFields}
                        onSubmit={handleFormSubmit}
                        disabled={isLoading}
                        labels={false}
                        button={
                            <div className="flex flex-col justify-stretch mt-4">
                                <button
                                    type="submit"
                                    className={`button-primary ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    disabled={isLoading}
                                >
                                    {isLoading ? (<LoadingCircle>Processing...</LoadingCircle>) : ('Login')}
                                </button>
                                {/* <button
                                    type="button"
                                    onClick={handleToggle}
                                    className="button-secondary"
                                    disabled={isLoading}
                                >
                                    {isStudent ? 'Gunakan Email' : 'Gunakan Kode QR'}
                                </button> */}
                            </div>
                        }
                        helpButton={<div onClick={() => navigate(`/reset-password/reset`)} className='text-center mt-2'><p className='underline text-xs text-gray-600 active:text-primary hover:text-primary hover:cursor-pointer'>Reset Password</p></div>}
                    />
                )}
                {isStudent === true && (
                    <DynamicForm
                        logo={logo}
                        title='PPG Cikampek'
                        subtitle={'Sistem Absensi Digital'}
                        onSubmit={handleFormSubmit}
                        disabled={isLoading}
                        fields={studentLoginFields}
                        labels={false}
                        button={
                            <div className="flex flex-col justify-stretch mt-4">
                                {studentLoginFields.length !== 0 && (
                                    <button
                                        type="submit"
                                        className={`button-primary ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                                        disabled={isLoading}
                                    >
                                        {isLoading ? (<LoadingCircle>Processing...</LoadingCircle>) : ('Login')}
                                    </button>
                                )}
                                {/* <button
                                    type="button"
                                    onClick={handleToggle}
                                    className="button-secondary"
                                    disabled={isLoading}
                                >
                                    {isStudent ? 'Gunakan Email' : 'Gunakan Kode QR'}
                                </button> */}
                            </div>
                        }
                        helpButton={studentLoginFields.length === 0 && <QRScanner setStudentLoginField={setStudentLoginFields} setNis={setNis} />}
                    />
                )}
            </div>
        </div>
    );
};

export default AuthView;
