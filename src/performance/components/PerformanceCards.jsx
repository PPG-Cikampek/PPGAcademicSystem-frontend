import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft } from "lucide-react";
import { attendanceCount } from "../../shared/Utilities/attendanceCount";


const calculateStats = (attendances, semesterTarget = null, uniqueStudents = null) => {
    const total = attendances.length;
    const stats = attendances.reduce((acc, curr) => {
        acc[curr.status] = (acc[curr.status] || 0) + 1;
        return acc;
    }, {});

    const base = semesterTarget ? semesterTarget * uniqueStudents : total;

    return Object.entries(stats).map(([status, count]) => ({
        status,
        percentage: Math.round((count / base) * 100)
    }));
};


const getStatusColor = (status) => {
    const colors = {
        'Hadir': 'bg-emerald-100 text-emerald-800',
        'Terlambat': 'bg-amber-100 text-amber-800',
        'Izin': 'bg-blue-100 text-blue-800',
        'Sakit': 'bg-purple-100 text-purple-800',
        'Tanpa Keterangan': 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
};

const StatBadge = ({ status, percentage }) => (
    <span className={`px-2 py-1 rounded-full text-center ${getStatusColor(status)}`}>
        {status} {percentage}%
    </span>
);

const PerformanceCards = ({ data }) => {
    const [view, setView] = useState('branches');
    const [selectedBranch, setSelectedBranch] = useState(null);
    const [selectedTeachingGroup, setSelectedTeachingGroup] = useState(null);
    const [selectedClass, setSelectedClass] = useState(null);
    const [showRelativeToTarget, setShowRelativeToTarget] = useState(false);


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
        } else if (view === 'classes') {
            setView('teachingGroups');
            setSelectedTeachingGroup(null);
        } else if (view === 'teachingGroups') {
            setView('branches');
            setSelectedBranch(null);
        } else {
            setView('branches');
        }
    };

    const renderBranches = () => {
        const branches = {};
        data.teachingGroupYears.forEach(year => {
            const branchId = year.teachingGroupId.branchId._id;
            if (!branches[branchId]) {
                branches[branchId] = {
                    name: year.teachingGroupId.branchId.name,
                    attendances: [],
                    uniqueStudents: new Set(),
                    semesterTarget: year.semesterTarget
                };
            }
            year.classes.forEach(cls => {
                branches[branchId].attendances.push(...cls.attendances);
                cls.students.forEach(studentId => branches[branchId].uniqueStudents.add(studentId));
            });
        });

        console.log(branches)

        if (Object.keys(branches).length === 1) {
            setSelectedBranch(Object.keys(branches)[0]);
            setView('teachingGroups');
        }

        return (
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="flex flex-col items-stretch"
            >
                <h2 className="mx-8 text-xl font-bold">Semua Desa</h2>

                {Object.entries(branches).map(([id, branch]) => (
                    <motion.div
                        key={id}
                        variants={itemVariants}
                        className="card-interactive justify-between"
                        onClick={() => {
                            setSelectedBranch(id);
                            setView('teachingGroups');
                        }}
                    >
                        <div className="flex flex-col gap-1">
                            <h3 className="text-lg font-medium">{branch.name}</h3>
                            <p className="text-sm text-gray-600">
                                Jumlah Siswa: {branch.uniqueStudents.size} siswa
                            </p>
                            {/* <p className="text-sm text-gray-600">
                                Total Pertemuan: {branch.attendances.length / branch.uniqueStudents.size} hari
                            </p> */}
                            {/* <p className="text-sm text-gray-600">
                                Target Semester: {branch.semesterTarget} hari
                            </p> */}
                        </div>
                        <div className="flex flex-wrap gap-2 items-center">
                            {calculateStats(
                                branch.attendances,
                                showRelativeToTarget ? branch.semesterTarget : null,
                                showRelativeToTarget ? branch.uniqueStudents.size : null
                            ).map((stat, idx) => (
                                <StatBadge key={idx} {...stat} />
                            ))}
                        </div>
                    </motion.div>
                ))}
            </motion.div>
        );
    };



    const renderTeachingGroups = () => {
        const teachingGroupYear = data.teachingGroupYears.find(
            year => year.teachingGroupId.branchId._id === selectedBranch
        );

        const teachingGroups = data.teachingGroupYears
            .filter(year => year.teachingGroupId.branchId._id === selectedBranch) // Fixed key
            .map(year => ({
                id: year.teachingGroupId._id,
                name: year.teachingGroupId.name,
                attendances: year.classes.flatMap(cls => cls.attendances),
                semesterTarget: year.semesterTarget,
                uniqueStudents: new Set(
                    year.classes.flatMap(cls => cls.students.map(studentId => studentId))
                ).size // Count unique student IDs
            }));

        const branchName = data.teachingGroupYears.find(year => year.teachingGroupId.branchId._id === selectedBranch)?.teachingGroupId.branchId.name;

        return (
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="flex flex-col items-stretch"
            >
                <div className="mx-8 flex flex-col">
                    <h2 className="text-xl font-bold">Kelompok {branchName}</h2>
                    {/* <p className="text-sm text-gray-600">
                        Target Semester: {teachingGroupYear.semesterTarget} hari
                    </p> */}
                </div>

                {teachingGroups.map(teachingGroup => (
                    <motion.div
                        key={teachingGroup.id}
                        variants={itemVariants}
                        className="card-interactive justify-between"
                        onClick={() => {
                            setSelectedTeachingGroup(teachingGroup.id);
                            setView('classes');
                        }}
                    >
                        <div className="flex flex-col gap-1">
                            <h3 className="text-lg font-medium">{teachingGroup.name}</h3>
                            <p className="text-sm text-gray-600">
                                Jumlah Siswa: {teachingGroup.uniqueStudents} siswa
                            </p>
                            <p className="text-sm text-gray-600">
                                Total Pertemuan: {teachingGroup.attendances.length / teachingGroup.uniqueStudents} hari
                                Total Pertemuan: {attendanceCount(teachingGroup)} hari
                            </p>
                            {/* <p className="text-sm text-gray-600">
                                Target Semester: {teachingGroup.semesterTarget} hari
                            </p> */}
                        </div>
                        <div className="flex flex-wrap gap-2 items-center">
                            {/* {calculateStats(
                                teachingGroup.attendances,
                                showRelativeToTarget ? teachingGroup.semesterTarget : null,
                                showRelativeToTarget ? teachingGroup.uniqueStudents : null
                            ).map((stat, idx) => (
                                <StatBadge key={idx} {...stat} />
                            ))} */}
                        </div>
                    </motion.div>
                ))}
            </motion.div>
        );
    };



    const renderClasses = () => {
        const teachingGroupYear = data.teachingGroupYears.find(
            year => year.teachingGroupId._id === selectedTeachingGroup
        );

        if (!teachingGroupYear) return null;

        const classes = teachingGroupYear.classes.map(cls => ({
            id: cls._id,
            name: cls.name,
            attendances: cls.attendances,
            uniqueStudents: new Set(cls.students.map(studentId => studentId)).size,
            semesterTarget: teachingGroupYear.semesterTarget,
        }));

        const teachingGroupName = data.teachingGroupYears.find(year => year.teachingGroupId._id === selectedTeachingGroup)?.teachingGroupId.name;

        return (
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="flex flex-col items-stretch"
            >
                <div className="mx-8 flex flex-col">
                    <h2 className="text-xl font-bold">Kelompok {teachingGroupName}</h2>
                    {/* <p className="text-sm text-gray-600">
                        Target Semester: {teachingGroupYear.semesterTarget} hari
                    </p> */}
                </div>

                {classes.map(cls => (
                    <motion.div
                        key={cls.id}
                        variants={itemVariants}
                        className="card-interactive justify-between"
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
                                Total Pertemuan: {cls.attendances.length / cls.uniqueStudents} hari
                                Total Pertemuan: {attendanceCount(cls.attendances)} hari
                            </p>
                        </div>
                        <div className="flex flex-wrap gap-2 items-center">
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
            year => year.teachingGroupId._id === selectedTeachingGroup
        );
        const selectedClassData = teachingGroupYear?.classes.find(cls => cls._id === selectedClass);

        if (!selectedClassData) return null;

        // Extract unique students from the attendance records
        const students = selectedClassData.attendances.reduce((acc, attendance) => {
            const student = attendance.studentId;
            if (!acc.some(s => s.id === student._id)) {
                acc.push({
                    id: student._id,
                    name: student.name,
                    attendances: selectedClassData.attendances.filter(
                        a => a.studentId._id === student._id
                    ),
                    uniqueStudents: new Set(selectedClassData.students.map(studentId => studentId)).size,
                    semesterTarget: teachingGroupYear.semesterTarget,
                });
            }
            return acc;
        }, []);

        return (
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="flex flex-col items-stretch"
            >
                <div className="mx-8 flex flex-col">
                    <h2 className="text-xl font-bold">Kelompok {selectedClassData.name}</h2>
                    {/* <p className="text-sm text-gray-600">
                        Target Semester: {teachingGroupYear.semesterTarget} hari
                    </p> */}
                </div>
                {students.map(student => (
                    <motion.div
                        key={student.id}
                        variants={itemVariants}
                        className="card-interactive justify-between"
                    >
                        <h3 className="text-lg font-medium">{student.name}</h3>
                        <div className="flex flex-wrap gap-2 items-center">
                            {calculateStats(
                                student.attendances,
                                showRelativeToTarget ? student.semesterTarget : null,
                                showRelativeToTarget ? student.uniqueStudents : null,
                            ).map((stat, idx) => (
                                <StatBadge key={idx} {...stat} />
                            ))}
                        </div>
                    </motion.div>
                ))}
            </motion.div>
        );
    };

    return (
        <div className="min-h-screen bg-background">
            <div className="mx-8 mt-8 flex justify-between items-center">
                <button
                    onClick={handleBack}
                    className="flex items-center text-primary hover:text-primary/80 transition-colors disabled:text-gray-400"
                    disabled={view === 'branches'}
                >
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Kembali
                </button>

                <div className="flex flex-col gap-2">
                    <p>Kalkulasi Berdasarkan: {!showRelativeToTarget ? <strong>Hari berjalan</strong> : <strong>Hari efektif</strong>}</p>
                    {/* <button
                        onClick={() => setShowRelativeToTarget(!showRelativeToTarget)}
                        className="text-primary px-4 py-2 rounded border border-primary hover:bg-primary hover:text-white transition"
                    >
                        Ubah
                    </button> */}
                </div>
            </div>

            {/* 
            <h1 className="text-3xl font-bold mb-8">
                {view === 'branches' && 'Branches'}
                {view === 'classes' && 'Classes'}
                {view === 'students' && 'Students'}
            </h1> */}

            <AnimatePresence mode="wait">
                {view === 'branches' && renderBranches()}
                {view === 'teachingGroups' && renderTeachingGroups()}
                {view === 'classes' && renderClasses()}
                {view === 'students' && renderStudents()}
            </AnimatePresence>
        </div>
    );
};

export default PerformanceCards;