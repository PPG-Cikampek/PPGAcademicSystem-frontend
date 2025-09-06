import { Clock, Users, GraduationCap, LineChart } from "lucide-react";

const ClassSummary = ({ classData }) => {
    return (
        <div className="flex flex-col gap-4 mb-8 rounded-md border border-gray-200 bg-white p-6 shadow-xs">
            <div className="flex items-center space-x-2 text-gray-600">
                <Clock className="h-5 w-5" />
                <span>
                    Kelas Mulai: {classData.class.startTime}
                </span>
            </div>
            <div className="flex items-center space-x-2 text-gray-600">
                <GraduationCap className="h-5 w-5" />
                <span>
                    {classData.class.teachers.length} Guru
                </span>
            </div>
            <div className="flex items-center space-x-2 text-gray-600">
                <Users className="h-5 w-5" />
                <span>
                    {classData.class.students.length} Siswa
                </span>
            </div>
            <div className="flex items-center space-x-2 text-gray-600">
                <LineChart className="h-5 w-5" />
                {/* <span>{attendanceCount(classData.class)} / {classData.class.subBranchYearId.semesterTarget} Pertemuan Terlaksana</span> */}
                {/* <span>{attendanceCount(classData.class)} Pertemuan Terlaksana</span> */}
            </div>
        </div>
    );
};

export default ClassSummary;
