import React from 'react';
import { Link } from 'react-router-dom';

import { Clock, Users, ChartLine, GraduationCap, Lock } from 'lucide-react';
import InfoCard from '../../../shared/Components/UIElements/InfoCard';
import { attendanceCount } from '../../../../shared/Utilities/attendanceCount';

const ClassCards = ({ data }) => {
    const formatTime = (time) => {
        const [hours, minutes] = time.split(':');
        return new Date(0, 0, 0, hours, minutes).toLocaleTimeString('id-ID', {
            hour: 'numeric',
            minute: 'numeric',
            hour12: false
        });
    };

    // console.log(JSON.stringify(data))

    let activeClassCount = 0;

    return (
        <div className="p-4 bg-gray-50 min-h-screen">
            <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-16">
                    {data.classes.map((classItem) => {
                        const isClassInSubBranchYear = classItem?.teachingGroupId?.branchYearId?.academicYearId?.isActive;
                        console.log(classItem)
                        if (isClassInSubBranchYear) {
                            activeClassCount++;
                            return (
                                <div
                                    key={classItem._id}
                                    className="card-basic m-0 flex-col p-0 border border-gray-200 hover:border-gray-300 transition-all duration-200 overflow-hidden"
                                >
                                    {/* Card Header */}
                                    <div className="p-4 border-b border-gray-100">
                                        <div className="flex justify-between items-center">
                                            <h2 className="text-lg font-medium text-gray-900">
                                                {classItem.name}
                                            </h2>
                                            {classItem.isLocked && (
                                                <span className="inline-flex items-center p-2 rounded-full text-xs font-medium bg-green-200 text-green-700">
                                                    <Lock size={16} />
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Card Content */}
                                    <div className="p-4 space-y-4">
                                        {/* Time */}
                                        <div className="flex items-center text-gray-600">
                                            <Clock className="w-4 h-4 mr-2" />
                                            <span className="text-sm">
                                                Mulai Kelas {formatTime(classItem.startTime)}
                                            </span>
                                        </div>

                                        {/* Teachers */}
                                        <div className="flex items-center text-gray-600">
                                            <GraduationCap className="w-4 h-4 mr-2" />
                                            <span className="text-sm">
                                                {classItem.teachers.length} Guru
                                            </span>
                                        </div>

                                        {/* Students */}
                                        <div className="flex items-center text-gray-600">
                                            <Users className="w-4 h-4 mr-2" />
                                            <span className="text-sm">
                                                {classItem.students.length} Siswa
                                            </span>
                                        </div>
                                        <div className="flex items-center text-gray-600">
                                            <ChartLine className="w-4 h-4 mr-2" />
                                            <span className="text-sm">
                                                {/* {`${attendanceCount(classItem)} / ${classItem.subBranchYearId.semesterTarget} Pertemuan Terlaksana`} */}
                                                {/* {`${attendanceCount(classItem)} Pertemuan Terlaksana`} */}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Card Footer */}
                                    <div className="p-4 border-t border-gray-100">
                                        <div className="flex gap-2">
                                            <Link to={`/dashboard/classes/${classItem._id}`} className='grow'>
                                                <button className="btn-mobile-primary-round w-full">
                                                    Detail Kelas
                                                </button>
                                            </Link>
                                            <Link to={`/attendance/history/class/${classItem._id}`} className='grow'>
                                                <button className="btn-mobile-primary-round w-full">
                                                    Riwayat Absensi
                                                </button>
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            );
                        }
                    })}
                </div>
                {activeClassCount === 0 && (
                    <InfoCard className={'mx-4 mt-12'}>
                        <p>Belum terdaftar di kelas manapun!</p>
                    </InfoCard>
                )}
            </div>
        </div>
    );
};

export default ClassCards;