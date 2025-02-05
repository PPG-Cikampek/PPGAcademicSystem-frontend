import React, { useState, useEffect, useContext } from 'react';
import { Link, NavLink, useParams } from 'react-router-dom';
import useHttp from '../../shared/hooks/http-hook';
import { AuthContext } from '../../shared/Components/Context/auth-context';

import ErrorCard from '../../shared/Components/UIElements/ErrorCard';
import LoadingCircle from '../../shared/Components/UIElements/LoadingCircle';
import { Icon } from '@iconify-icon/react'
import { Pencil, QrCode, RefreshCcw, ArrowDownToLine } from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';

const StudentDetailView = () => {
    const { isLoading, sendRequest } = useHttp();
    const [studentDetails, setStudentDetails] = useState([]);
    const [studentInfo, setStudentInfo] = useState(null);
    const [studentData, setStudentData] = useState(null);
    const [showQRCode, setShowQRCode] = useState(false);
    const auth = useContext(AuthContext);

    const studentId = useParams().studentId;

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('id-ID', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
            timeZone: 'Asia/Jakarta',
        });
    };

    useEffect(() => {
        const fetchStudentData = async () => {
            const url = auth.userRole === 'student'
                ? `${import.meta.env.VITE_BACKEND_URL}/students/user/${auth.userId}`
                : studentId
                    ? `${import.meta.env.VITE_BACKEND_URL}/students/${studentId}`
                    : ''

            try {
                const responseData = await sendRequest(url);

                setStudentDetails([
                    { label: 'NIS', value: responseData.student.nis, icon: <Icon icon="icon-park-outline:id-card-h" width="24" height="24" /> },
                    { label: 'Tanggal Lahir', value: formatDate(responseData.student.dateOfBirth), icon: <Icon icon="material-symbols:date-range-outline" width="24" height="24" /> },
                    { label: 'Jenis Kelamin', value: responseData.student.gender === 'male' ? 'Laki-laki' : 'Perempuan', icon: <Icon icon="tabler:gender-bigender" width="24" height="24" /> },
                    { label: 'Nama Orang Tua', value: responseData.student.parentName, icon: <Icon icon="ri:parent-line" width="24" height="24" /> },
                    { label: 'Alamat', value: responseData.student.address, icon: <Icon icon="ph:map-pin-bold" width="24" height="24" /> }
                ]);

                setStudentInfo({
                    name: responseData.student.name,
                    nis: responseData.student.nis,
                    image: responseData.student.image,
                    branch: responseData.student.userId.teachingGroupId.branchId.name,
                    teachingGroup: responseData.student.userId.teachingGroupId.name,
                });

                setStudentData({
                    id: responseData.student._id,
                    isProfileComplete: responseData.student.isProfileComplete
                })

                console.log({
                    id: responseData.student._id,
                    isProfileComplete: responseData.student.isProfileComplete
                })
                console.log(auth.userRole)
            } catch (err) {
            }
        };
        fetchStudentData();
    }, [sendRequest]);

    const downloadQRCode = () => {
        const canvas = document.querySelector('canvas');
        const url = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        const fileName = studentInfo.name.replace(/\s+/g, '') + '_' + studentInfo.teachingGroup.replace(/\s+/g, '');
        link.href = url;
        link.download = `${fileName}_QRCode.png`;
        link.click();
    };

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-8 pb-24">
            {isLoading && (
                <div className="flex justify-center mt-16">
                    <LoadingCircle size={32} />
                </div>
            )}
            {!isLoading && studentDetails.length > 0 && studentInfo && (
                <>
                    {!studentData.isProfileComplete && (
                        <Link to={`/dashboard/students/${studentId}/update`}>
                            <ErrorCard error="Profile belum lengkap! Lengkapi" onClear={() => setError(null)} />
                        </Link>
                    )}
                    <h1 className="text-2xl font-medium mb-6 text-gray-700">Data Peserta Didik</h1>
                    <div className='flex flex-col md:flex-row gap-8'>
                        {/* First card displaying main student information */}
                        <div className='card-basic rounded-md border mx-0 py-12 flex flex-col items-center flex-1 basis-96 min-w-80 md:max-w-96'>
                            <div className='relative'>
                                {showQRCode ? (
                                    <QRCodeCanvas
                                        value={studentDetails.find(detail => detail.label === 'NIS').value}
                                        size={256}
                                        level={'H'}
                                        className="mt-2 rounded-md size-48 md:size-64 shrink-0"
                                    />
                                ) : (
                                    <img
                                        src={studentInfo?.image ? `${import.meta.env.VITE_BACKEND_URL}/${studentInfo.image}` : "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png?20150327203541"}
                                        alt="Profile"
                                        className="mt-2 rounded-md size-48 md:size-64 shrink-0"
                                    />
                                )}
                                {auth.userRole !== 'teacher' && auth.userRole !== 'student' && studentData.isProfileComplete === true && (
                                    <>
                                        <button
                                            className="absolute bottom-1 right-1 bg-white p-2 rounded-full border border-gray-300"
                                            onClick={() => setShowQRCode(prev => !prev)}
                                        >
                                            {showQRCode ? <RefreshCcw className="w-6 h-6" /> : <QrCode className="w-6 h-6" />}
                                        </button>
                                        <button
                                            className="absolute bottom-1 right-14 bg-white p-2 rounded-full border border-gray-300"
                                            hidden={!showQRCode}
                                            onClick={downloadQRCode}
                                        >
                                            <ArrowDownToLine className="w-6 h-6" />
                                        </button>
                                    </>
                                )}
                            </div>
                            <h2 className='mt-4 text-lg font-normal'>{studentInfo.name}</h2>
                            <p className='mt-2 text-gray-600'>{studentInfo.nis}</p>
                            <div className='mt-4 flex flex-col md:flex-row gap-2 text-center'>
                                <span className="badge-primary">{studentInfo.branch}</span>
                                <span className="badge-primary">{studentInfo.teachingGroup}</span>
                            </div>
                        </div>

                        {/* Second card displaying additional details */}
                        <div className='card-basic rounded-md p-8 flex flex-col border mx-0 flex-1 justify-between'>
                            <ul className='space-y-6'>
                                <h2 className='text-lg mb-8'>Profile Peserta Didik</h2>
                                {studentDetails.map((item, index) => (
                                    <li key={index} className='flex items-center gap-2 mb-2'>
                                        {item.icon && (<div className='text-primary'>{item.icon}</div>)}
                                        <span className='font-semibold'>{item.label}:</span>
                                        <span className='font-medium text-gray-700'>{item.value}</span>
                                    </li>
                                ))}
                            </ul>
                            {(auth.userRole !== 'teacher' || studentData.isProfileComplete) && (
                                <Link to={`/dashboard/students/${studentData.id}/update`} className='place-self-end'>
                                    <button className="button-primary pl-[11px] mt-0">
                                        <Pencil className="w-4 h-4 mr-2" />
                                        Edit Profile
                                    </button>
                                </Link>
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default StudentDetailView;
