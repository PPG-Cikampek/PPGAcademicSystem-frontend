import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useHttp from '../../shared/hooks/http-hook';
import { AuthContext } from '../../shared/Components/Context/auth-context';

import Modal from '../../shared/Components/UIElements/ModalBottomClose';
import LoadingCircle from '../../shared/Components/UIElements/LoadingCircle';
import { Trash2, Search, Users, Pencil, Trash, ChevronDown, Filter, PlusIcon } from 'lucide-react';
import FloatingMenu from '../../shared/Components/UIElements/FloatingMenu';
import WarningCard from '../../shared/Components/UIElements/WarningCard';

const TeachersView = () => {
    const [teachers, setTeachers] = useState()
    const [searchTerm, setSearchTerm] = useState('');
    const [modal, setModal] = useState({ title: '', message: '', onConfirm: null });
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const { isLoading, sendRequest } = useHttp();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentStudent, setCurrentStudent] = useState(null);

    const navigate = useNavigate();
    const auth = useContext(AuthContext);

    useEffect(() => {
        const url = auth.userRole === 'admin'
            ? `${import.meta.env.VITE_BACKEND_URL}/teachers`
            : `${import.meta.env.VITE_BACKEND_URL}/teachers/teaching-group/${auth.userTeachingGroupId}`;

        console.log(url)
        const fetchTeachers = async () => {
            try {
                const responseData = await sendRequest(url);
                setTeachers(responseData.teachers);
                console.log(responseData.teachers)
                console.log(auth.userTeachingGroupId)

            } catch (err) {
                // Error is handled by useHttp
            }
        };
        fetchTeachers();
    }, [sendRequest]);

    const handleDeleteStudent = (teacherId) => {
        setteachers(teachers.filter(teacher => teacher._id !== teacherId));
    };

    // Handler for edit teacher
    const handleEditteacher = (teacher) => {
        setCurrentteacher(teacher);
        setIsModalOpen(true);
    };

    // Handler for adding new teacher
    const handleAddteacher = () => {
        setCurrentteacher(null);
        setIsModalOpen(true);
    };

    // Default avatar function
    const getAvatar = (gender) => {
        return gender === 'Perempuan'
            ? '/api/placeholder/100/100?text=F'
            : '/api/placeholder/100/100?text=M';
    };

    const getInitials = (gender) => {
        return gender
            ?.split(' ')
            .map((word) => word[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };


    return (
        <div className="min-h-screen px-4 py-8 md:p-8">
            <div className='max-w-6xl mx-auto'>
                <div className="flex flex-col justify-between items-start gap-2 mb-4">
                    <h1 className="text-2xl font-semibold text-gray-900">Daftar Tenaga Pendidik</h1>
                    <WarningCard className="items-center justify-start" warning="Penambahan Tenaga Pendidik Baru Supaya Menghubungi Daerah!" onClear={() => setError(null)} />

                    {/* {auth.userRole === 'admin' && (
                        <Link to="/settings/users/new">
                            <button className="button-primary pl-[12px] ">
                                <PlusIcon className="w-4 h-4 mr-2" />
                                Tambah
                            </button>
                        </Link>
                    )} */}
                </div>
                {isLoading && (
                    <div className="flex justify-center mt-16">
                        <LoadingCircle size={32} />
                    </div>
                )}
                {teachers && (
                    <div className="bg-white shadow-sm rounded-md overflow-auto text-nowrap">
                        <table className="w-full">
                            <thead className=" border-b">
                                <tr>
                                    <th className="p-2 md:p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"></th>
                                    <th className="p-2 md:p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="p-2 md:p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">NID</th>
                                    <th className="p-2 md:p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama</th>
                                    {auth.userRole === 'admin' && <th className="p-2 md:p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Desa</th>}
                                    {auth.userRole === 'admin' && <th className="p-2 md:p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kelompok</th>}
                                    <th className="p-2 md:p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Profile</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {teachers.map((teacher) => (
                                    <tr onClick={() => navigate(`/dashboard/teachers/${teacher._id}`)} key={teacher._id} className="hover:bg-gray-50 hover:cursor-pointer transition">
                                        <td className="pl-4 md:pl-8 p-2">
                                            {teacher.image ? (
                                                <img
                                                    src={teacher?.image ? `${import.meta.env.VITE_BACKEND_URL}/${teacher.image}` : "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png?20150327203541"}

                                                    alt={teacher.name}
                                                    className="size-10 rounded-full m-auto min-w-10"
                                                />
                                            ) : (
                                                <div
                                                    className={`size-10 rounded-full bg-blue-200 text-blue-500 flex items-center justify-center font-medium m-auto`}
                                                >
                                                    {getInitials(teacher.name)}
                                                </div>
                                            )}
                                        </td>
                                        <td className='p-2 md:p-4 '> <div className={`py-2 px-4 text-sm text-center w-min border rounded-md ${teacher.positionEndDate ? 'text-red-500 bg-red-100' : 'text-green-500 bg-green-100'}`}>{teacher.positionEndDate ? 'Tidak Aktif' : 'Aktif'}</div></td>
                                        <td className="p-2 md:p-4 text-sm text-gray-900">{teacher.nid}</td>
                                        <td className="p-2 md:p-4 text-sm text-gray-900">{teacher.name}</td>
                                        {auth.userRole === 'admin' && <td className="p-2 md:p-4 text-sm text-gray-500">{teacher?.userId?.teachingGroupId?.branchId?.name}</td>}
                                        {auth.userRole === 'admin' && <td className="p-2 md:p-4 text-sm text-gray-500">{teacher?.userId?.teachingGroupId?.name}</td>}
                                        <td className={`p-2 md:p-4 text-sm text-gray-900 ${teacher.isProfileComplete ? 'text-green-500' : 'text-red-500 hover:underline cursor-pointer'}`}>{teacher.isProfileComplete ? 'Lengkap' : 'Lengkapi'}</td>
                                    </tr>
                                ))}
                                {teachers.length === 0 && (
                                    <tr>
                                        <td colSpan={8} className='p-4 text-center italic text-gray-500'>
                                            Tidak ada data
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TeachersView;


// import React, { useState } from 'react';
// import StudentsList from '../components/StudentsList';
// import SearchFilter from '../components/SearchFilter';

// const students = [
//     { id: 1, nik: 20220010, name: 'Almeera Shakira Arli', class: 'Kelas 2', branch: 'Cikampek Timur', teachingGroup: 'Jomin Timur', gender: 'Female' },
//     { id: 2, nik: 20240010, name: 'Natasya Angelica', class: 'Kelas 2', branch: 'Teluk Jambe Timur', teachingGroup: 'Margakaya', gender: 'Female' },
//     { id: 3, nik: 20240011, name: 'Dehan Abdirrochmanu', class: 'Kelas 1', branch: 'Teluk Jambe Timur', teachingGroup: 'Margakaya', gender: 'Male' },
//     // Add more students
// ];

// function StudentsView() {
//     const [search, setSearch] = useState('');
//     const [filter, setFilter] = useState({ class: '', branch: '', teachingGroup: '', gender: '' });
//     const [showFilters, setShowFilters] = useState(false);
//     const [sort, setSort] = useState('');

//     // Helper function to compare class levels
//     const compareClasses = (a, b) => {
//         const getClassNumber = (cls) => parseInt(cls.split(' ')[1]);
//         return getClassNumber(a) - getClassNumber(b);
//     };

//     // Helper function to sort students based on selected criteria
//     const sortStudents = (students, sortOption) => {
//         const sortedStudents = [...students];

//         switch (sortOption) {
//             case 'name_asc':
//                 return sortedStudents.sort((a, b) =>
//                     a.name.localeCompare(b.name)
//                 );
//             case 'name_desc':
//                 return sortedStudents.sort((a, b) =>
//                     b.name.localeCompare(a.name)
//                 );
//             case 'class_asc':
//                 return sortedStudents.sort((a, b) =>
//                     compareClasses(a.class, b.class)
//                 );
//             case 'class_desc':
//                 return sortedStudents.sort((a, b) =>
//                     compareClasses(b.class, a.class)
//                 );
//             default:
//                 return sortedStudents;
//         }
//     };

//     // First filter, then sort the students
//     const filteredStudents = students.filter(student =>
//         student.name.toLowerCase().includes(search.toLowerCase()) &&
//         (filter.branch ? student.branch.toString() === filter.branch : true) &&
//         (filter.teachingGroup ? student.teachingGroup.toString() === filter.teachingGroup : true) &&
//         (filter.class ? student.class === filter.class : true) &&
//         (filter.gender ? student.gender === filter.gender : true)
//     );

//     // Apply sorting to filtered students
//     const sortedAndFilteredStudents = sortStudents(filteredStudents, sort);

//     return (
//         <div className="min-h-screen p-4 md:p-8">
//             <h1 className="text-2xl font-medium mb-6 text-gray-700">Data Peserta Didik</h1>
//             <SearchFilter
//                 search={search}
//                 setSearch={setSearch}
//                 setFilter={setFilter}
//                 showFilters={showFilters}
//                 setShowFilters={setShowFilters}
//                 setSort={setSort}
//             />
//             <StudentList students={sortedAndFilteredStudents} />
//         </div>
//     );
// }

// export default StudentsView;








// import React, { useState } from 'react';
// import { Link, useNavigate } from 'react-router-dom';

// import StudentList from '../../students/components/StudentsList';
// import SearchFilter from '../../students/components/SearchFilter';

// import { PlusIcon, PencilIcon, TrashIcon, ChevronDownIcon, ChevronRightIcon } from 'lucide-react';


// const students = [
//     { id: 1, nik: 20220010, name: 'Almeera Shakira Arli', class: 'Kelas 2', branch: 'Cikampek Timur', teachingGroup: 'Jomin Timur', gender: 'Female' },
//     { id: 2, nik: 20240010, name: 'Natasya Angelica', class: 'Kelas 2', branch: 'Teluk Jambe Timur', teachingGroup: 'Margakaya', gender: 'Female' },
//     { id: 3, nik: 20240011, name: 'Dehan Abdirrochmanu', class: 'Kelas 1', branch: 'Teluk Jambe Timur', teachingGroup: 'Margakaya', gender: 'Male' },
//     // Add more students
// ];

// const TeachersView = () => {
//     const [search, setSearch] = useState('');
//     const [filter, setFilter] = useState({ class: '', branch: '', teachingGroup: '', gender: '' });
//     const [showFilters, setShowFilters] = useState(false);
//     const [sort, setSort] = useState('');

//     // Helper function to compare class levels
//     const compareClasses = (a, b) => {
//         const getClassNumber = (cls) => parseInt(cls.split(' ')[1]);
//         return getClassNumber(a) - getClassNumber(b);
//     };

//     // Helper function to sort students based on selected criteria
//     const sortStudents = (students, sortOption) => {
//         const sortedStudents = [...students];

//         switch (sortOption) {
//             case 'name_asc':
//                 return sortedStudents.sort((a, b) =>
//                     a.name.localeCompare(b.name)
//                 );
//             case 'name_desc':
//                 return sortedStudents.sort((a, b) =>
//                     b.name.localeCompare(a.name)
//                 );
//             case 'class_asc':
//                 return sortedStudents.sort((a, b) =>
//                     compareClasses(a.class, b.class)
//                 );
//             case 'class_desc':
//                 return sortedStudents.sort((a, b) =>
//                     compareClasses(b.class, a.class)
//                 );
//             default:
//                 return sortedStudents;
//         }
//     };

//     // First filter, then sort the students
//     const filteredStudents = students.filter(student =>
//         student.name.toLowerCase().includes(search.toLowerCase()) &&
//         (filter.branch ? student.branch.toString() === filter.branch : true) &&
//         (filter.teachingGroup ? student.teachingGroup.toString() === filter.teachingGroup : true) &&
//         (filter.class ? student.class === filter.class : true) &&
//         (filter.gender ? student.gender === filter.gender : true)
//     );

//     // Apply sorting to filtered students
//     const sortedAndFilteredStudents = sortStudents(filteredStudents, sort);

//     return (
//         <div className="min-h-screen bg-gray-100 p-4 md:p-8">
//             <div className='flex justify-between items-center mb-6'>
//                 <h1 className="text-2xl font-medium text-gray-700">Data Tenaga Pendidik</h1>
//                 <Link to={`/dashboard/teachers/new`}>
//                     <button
//                         className="button-primary pl-3"
//                     >
//                         <PlusIcon className="w-4 h-4 mr-2" />
//                         Tambah
//                     </button>
//                 </Link>
//             </div>
//             <SearchFilter
//                 search={search}
//                 setSearch={setSearch}
//                 setFilter={setFilter}
//                 showFilters={showFilters}
//                 setShowFilters={setShowFilters}
//                 setSort={setSort}
//             />
//             <StudentList students={sortedAndFilteredStudents} />
//         </div >
//     );
// }

// export default TeachersView;