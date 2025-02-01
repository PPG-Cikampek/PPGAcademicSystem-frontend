import { useContext, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronDown, ChevronUp } from 'lucide-react'
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'
import StudentReportView from '../../students/pages/StudentReportView'
import StudentInitial from '../../shared/Components/UIElements/StudentInitial'
import { AuthContext } from '../../shared/Components/Context/auth-context'
import { attendanceCount } from '../../shared/Utilities/attendanceCount'

ChartJS.register(ArcElement, Tooltip, Legend)

const getOverallStats = (data) => {
    const attendances = [];

    // Extract all attendance records
    data.teachingGroupYears.forEach((year) => {
        year.classes.forEach((cls) => {
            cls.attendances.forEach((att) => {
                attendances.push(att.status);
            });
        });
    });

    // Count occurrences of each status
    const statusCounts = attendances.reduce((acc, status) => {
        acc[status] = (acc[status] || 0) + 1;
        return acc;
    }, {});

    const total = attendances.length;

    // Generate the output
    return Object.keys(statusCounts).map((status) => ({
        status,
        count: statusCounts[status],
        percentage: Math.round((statusCounts[status] / total) * 100),
    }));
}

const calculateStats = (attendances, semesterTarget = null, uniqueStudents = null) => {
    const total = attendances.length
    const stats = attendances.reduce((acc, curr) => {
        acc[curr.status] = (acc[curr.status] || 0) + 1
        return acc
    }, {})
    const base = semesterTarget ? semesterTarget * uniqueStudents : total

    const calculatedResult = Object.entries(stats).map(([status, count]) => ({
        status,
        count,
        percentage: Math.round((count / base) * 100),
    }))
    // console.log(JSON.stringify(calculatedResult, null, 2))
    const statusOrder = ["Hadir", "Terlambat", "Izin", "Sakit", "Tanpa Keterangan"]
    const sortedData = calculatedResult.sort((a, b) => {
        return statusOrder.indexOf(a.status) - statusOrder.indexOf(b.status);
    });
    return sortedData
}


const calculateStatsMobileView = (attendances, semesterTarget = null, uniqueStudents = null) => {

    const attendanceData = calculateStats(attendances, semesterTarget, uniqueStudents)

    const transformData = () => {
        const hadir = attendanceData
            .filter((item) => ["Hadir", "Terlambat"].includes(item.status))
            .reduce(
                (acc, item) => ({
                    status: "Hadir",
                    count: acc.count + item.count,
                    percentage: acc.percentage + item.percentage,
                }),
                { count: 0, percentage: 0 }
            );

        const tidakHadir = attendanceData
            .filter((item) => ["Izin", "Sakit"].includes(item.status))
            .reduce(
                (acc, item) => ({
                    status: "Tidak Hadir",
                    count: acc.count + item.count,
                    percentage: acc.percentage + item.percentage,
                }),
                { count: 0, percentage: 0 }
            );

        let tanpaKeterangan = attendanceData.find(
            (item) => item.status === "Tanpa Keterangan"
        );

        const transformedData = [hadir, tidakHadir, tanpaKeterangan && tanpaKeterangan.count > 0 ? {
            status: "Tanpa Keterangan",
            count: tanpaKeterangan.count,
            percentage: tanpaKeterangan.percentage,
        } : null].filter(Boolean)

        const filteredData = transformedData.filter(item => item.percentage > 0);

        return filteredData;
    };

    return transformData();
}

const calculateMonthlyStats = (attendances, semesterTarget = null, uniqueStudents = null) => {
    const monthlyStats = attendances.reduce((acc, curr) => {
        const month = new Date(curr.forDate).toLocaleString('id-ID', { month: 'long' })
        if (!acc[month]) acc[month] = []
        acc[month].push(curr)
        return acc
    }, {})

    return Object.entries(monthlyStats).map(([month, monthAttendances]) => ({
        month,
        stats: calculateStats(monthAttendances, semesterTarget, uniqueStudents)
    }))
}

const getStatusColor = (status) => {
    const colors = {
        Hadir: 'bg-emerald-100 text-emerald-800',
        Terlambat: 'bg-amber-100 text-amber-800',
        Izin: 'bg-blue-100 text-blue-800',
        Sakit: 'bg-purple-100 text-purple-800',
        'Tanpa Keterangan': 'bg-red-100 text-red-800',
        'Tidak Hadir': 'bg-orange-100 text-orange-800',
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
}

const StatBadge = ({ status, percentage }) => (
    <span className={`px-2 py-1 rounded-full text-center ${getStatusColor(status)}`}>
        {status} {percentage}%
    </span>
)

const StatCard = ({ level, title, subtitle, stats, onViewMore, expanded }) => {
    const [showMonthly, setShowMonthly] = useState(false)
    const monthlyStats = calculateMonthlyStats(stats.attendances, stats.semesterTarget, stats.uniqueStudents)

    return (
        <div className="bg-white rounded-lg shadow-sm mx-4 md:mx-8  p-6 mb-4 transition-all">
            <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                    <h3 className="text-lg font-medium">{level} {title}</h3>
                    <p className="text-sm text-gray-600">{subtitle}</p>
                </div>
                {/* <div className="flex items-center gap-4">
                    <DoughnutChart stats={calculateStats(stats.attendances)} />
                    </div> */}
                <div className="flex flex-wrap gap-2 items-center mb-4">
                    {calculateStats(stats.attendances, stats.semesterTarget, stats.uniqueStudents).map((stat, idx) => (
                        <StatBadge key={idx} {...stat} />
                    ))}
                </div>
            </div>
            <div className="flex justify-between">
                <button
                    onClick={() => setShowMonthly(!showMonthly)}
                    className="flex items-center text-sm text-gray-600 hover:text-gray-800 transition-colors"
                >
                    {showMonthly ? <ChevronUp className="w-4 h-4 mr-1" /> : <ChevronDown className="w-4 h-4 mr-1" />}
                    {showMonthly ? 'Tutup Status Bulanan' : 'Lihat Status Bulanan'}
                </button>
                <button
                    onClick={(e) => {
                        e.stopPropagation()
                        onViewMore()
                    }}
                    className="px-4 py-2 text-sm bg-primary text-white rounded hover:bg-primary/90 transition-colors"
                >
                    Lihat Detail
                </button>
            </div>

            <AnimatePresence>
                {showMonthly && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                    >
                        <div className="mt-4 space-y-4 pt-4 border-t">
                            {monthlyStats.map(({ month, stats }) => (
                                <div key={month} className="flex items-center justify-between">
                                    <h4 className="font-medium">{month}</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {stats.map((stat, idx) => (
                                            <StatBadge key={idx} {...stat} />
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

const TeachingGroupAdminPerformanceCards = ({ data, initialView, month }) => {
    const [view, setView] = useState(initialView);
    const [selectedClass, setSelectedClass] = useState(null);
    const [showRelativeToTarget, setShowRelativeToTarget] = useState(false);
    const [expandStudentDetail, setExpandStudentDetail] = useState(false);

    const auth = useContext(AuthContext)

    const navigate = useNavigate()

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1
        }
    };

    const handleBack = () => {
        if (view === 'students') {
            setView('classes');
            setSelectedClass(null);
        } else {
            setView('classes');
        }
    };

    const renderClasses = () => {
        const teachingGroupYear = data.teachingGroupYears.find(
            year => year.teachingGroupId._id === auth.userTeachingGroupId
        );

        if (!teachingGroupYear) return null;

        const classes = teachingGroupYear.classes.map(cls => ({
            id: cls._id,
            name: cls.name,
            branchName: teachingGroupYear.teachingGroupId.branchId.name,
            teachingGroupName: teachingGroupYear.teachingGroupId.name,
            attendances: cls.attendances,
            teachers: cls.teachers,
            uniqueStudents: new Set(cls.students.map(studentId => studentId)).size,
            semesterTarget: teachingGroupYear.semesterTarget,
        }));

        const teachingGroupName = data.teachingGroupYears.find(year => year.teachingGroupId._id === auth.userTeachingGroupId)?.teachingGroupId.name;

        // console.log(JSON.stringify(teachingGroupYear, null, 2))

        return (
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="flex flex-col items-stretch"
            >
                {classes.map(cls => (
                    <motion.div
                        key={cls.id}
                        variants={itemVariants}
                        className="card-basic rounded-md justify-between hover:cursor-pointer hover:bg-gray-50 hover:ring-1 transition-colors duration-200"
                        onClick={() => {
                            setSelectedClass(cls.id);
                            setView('students');
                        }}
                    >
                        <div className="flex flex-col gap-1">
                            <h3 className="text-lg font-medium">{cls.name}</h3>
                            <p className="text-sm text-gray-600">
                                Jumlah Siswa: {cls.uniqueStudents} siswa
                            </p>
                            <p className="text-sm text-gray-600">
                                Total Pertemuan: {attendanceCount(cls)} hari
                            </p>
                        </div>
                        <div className="md:hidden flex flex-col md:flex-row gap-2 items-end md:items-end">
                            {calculateStatsMobileView(
                                cls.attendances,
                                showRelativeToTarget ? cls.semesterTarget : null,
                                showRelativeToTarget ? cls.uniqueStudents : null
                            ).map((stat, idx) => (
                                <StatBadge key={idx} {...stat} />
                            ))}
                        </div>
                        <div className="hidden md:flex flex-col md:flex-row items-end gap-2 md:items-center">
                            {calculateStats(
                                cls.attendances,
                                showRelativeToTarget ? cls.semesterTarget : null,
                                showRelativeToTarget ? cls.uniqueStudents : null
                            ).map((stat, idx) => (
                                <StatBadge key={idx} {...stat} />
                            ))}
                        </div>
                    </motion.div>
                ))}
            </motion.div>
        );
    };


    const renderStudents = () => {
        const teachingGroupYear = data.teachingGroupYears.find(
            year => year.teachingGroupId._id === auth.userTeachingGroupId
        );
        const selectedClassData = teachingGroupYear?.classes.find(cls => cls._id === selectedClass)
        // selectedClassData

        if (!selectedClassData) return null;

        console.log(selectedClassData)
        // Extract unique students from the attendance records
        const students = selectedClassData.attendances.reduce((acc, attendance) => {
            const student = attendance.studentId;
            if (!acc.some(s => s.id === student._id)) {
                acc.push({
                    id: student._id,
                    teachingGroupYearName: teachingGroupYear.name,
                    month,
                    className: selectedClassData.name,
                    name: student.name,
                    nis: student.nis,
                    image: student.image,
                    branchName: teachingGroupYear.teachingGroupId.branchId.name,
                    teachingGroupName: teachingGroupYear.teachingGroupId.name,
                    teachers: selectedClassData.teachers,
                    attendances: selectedClassData.attendances.filter(
                        a => a.studentId._id === student._id
                    ),
                    uniqueStudents: new Set(selectedClassData.students.map(studentId => studentId)).size,
                    semesterTarget: teachingGroupYear.semesterTarget,
                });
            }
            return acc;
        }, []);

        // console.log(JSON.stringify(teachingGroupYear, null, 2))
        // console.log(JSON.stringify(students, null, 2))

        return (
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="flex flex-col items-stretch"
            >
                <div className="mx-4 md:mx-8  flex flex-col">
                    <h2 className="text-xl font-bold">{selectedClassData.name}</h2>
                    <p className="text-sm text-gray-600">
                        Jumlah Siswa: {students.uniqueStudents} siswa
                    </p>
                    <p className="text-sm text-gray-600">
                        Total Pertemuan: {attendanceCount(selectedClassData)} hari
                    </p>
                </div>
                {students.map(student => (
                    <motion.div
                        key={student.id}
                        onClick={() => setExpandStudentDetail(expandStudentDetail === student.id ? null : student.id)}
                        variants={itemVariants}

                    >
                        {console.log(student)}

                        <div className="card-basic rounded-md hover:cursor-pointer hover:bg-gray-50 hover:ring-1 hover:ring-primary flex-col transition-all duration-200">
                            <div className="flex md:justify-between md:flex-row flex-col justify-start items-start gap-4 ">
                                <div className="flex gap-3 items-center">
                                    {student.image ? (
                                        <img
                                            src={student?.image ? `${import.meta.env.VITE_BACKEND_URL}/${student.image}` : "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png?20150327203541"}
                                            alt={student.name}
                                            className="size-14 rounded-full m-auto shrink-0"
                                        />
                                    ) : (
                                        <StudentInitial studentName={student.name} clsName={`size-14 rounded-full bg-blue-200 text-blue-500 flex items-center justify-center font-medium m-auto shrink-0 grow-0`} />
                                    )}
                                    <div className="flex flex-col gap-1">
                                        <h3 className="text-lg font-medium">{student.name}</h3>
                                        <h4 className="">{student.nis}</h4>
                                    </div>
                                </div>
                                <div className="md:hidden flex flex-col md:flex-row gap-2 items-end md:items-end self-end">
                                    {calculateStatsMobileView(
                                        student.attendances,
                                        showRelativeToTarget ? student.semesterTarget : null,
                                        showRelativeToTarget ? student.uniqueStudents : null
                                    ).map((stat, idx) => (
                                        <StatBadge key={idx} {...stat} />
                                    ))}
                                </div>
                                <div className="hidden md:flex flex-col md:flex-row items-end gap-2 md:items-center">
                                    {calculateStats(
                                        student.attendances,
                                        showRelativeToTarget ? student.semesterTarget : null,
                                        showRelativeToTarget ? student.uniqueStudents : null
                                    ).map((stat, idx) => (
                                        <StatBadge key={idx} {...stat} />
                                    ))}
                                </div>
                            </div>
                            {auth.userRole === 'teacher' && expandStudentDetail === student.id && (
                                <div
                                    className='mt-4'
                                    onClick={(e) => e.stopPropagation()} // Prevents triggering parent onClick
                                >
                                    <motion.div>
                                        <StudentReportView studentData={student} attendanceData={calculateStats(student.attendances)} noCard={true} />
                                    </motion.div>
                                </div>
                            )}
                        </div>
                    </motion.div>
                ))}

            </motion.div>
        );
    };

    return (
        <div className="min-h-screen bg-background">
            <div className="md:mx-8 mt-8 flex justify-between items-center">
                <button
                    onClick={handleBack}
                    className="flex items-center text-primary hover:text-primary/80 transition-colors disabled:text-gray-400"
                    disabled={view === 'classes'}
                >
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Kembali
                </button>

                <div className="flex flex-col gap-2">
                    <p>Kalkulasi Berdasarkan: {!showRelativeToTarget ? <strong>Hari berjalan</strong> : <strong>Hari efektif</strong>}</p>
                    <button
                        onClick={() => setShowRelativeToTarget(!showRelativeToTarget)}
                        className="text-primary px-4 py-2 rounded border border-primary hover:bg-primary hover:text-white transition"
                    >
                        Ubah
                    </button>
                </div>
            </div>

            {/* 
            <h1 className="text-3xl font-bold mb-8">
                {view === 'branches' && 'Branches'}
                {view === 'classes' && 'Classes'}
                {view === 'students' && 'Students'}
            </h1> */}

            <AnimatePresence mode="wait">
                {view === 'classes' && renderClasses()}
                {view === 'students' && renderStudents()}
            </AnimatePresence>
        </div>
    );
};

export default TeachingGroupAdminPerformanceCards;