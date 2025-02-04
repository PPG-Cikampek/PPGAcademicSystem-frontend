import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useHttp from '../../shared/hooks/http-hook';
import { AuthContext } from '../../shared/Components/Context/auth-context';

import Modal from '../../shared/Components/UIElements/ModalBottomClose';
import LoadingCircle from '../../shared/Components/UIElements/LoadingCircle';
import { Trash2, Search, Users, Pencil, Trash, ChevronDown, Filter, PlusIcon } from 'lucide-react';
import FloatingMenu from '../../shared/Components/UIElements/FloatingMenu';
import StudentInitial from '../../shared/Components/UIElements/StudentInitial';
import WarningCard from '../../shared/Components/UIElements/WarningCard';

const StudentsView = () => {
    const [students, setStudents] = useState()
    const [searchTerm, setSearchTerm] = useState('');
    const [modal, setModal] = useState({ title: '', message: '', onConfirm: null });
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const { isLoading, sendRequest } = useHttp();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentStudent, setCurrentStudent] = useState(null);

    const navigate = useNavigate();
    const auth = useContext(AuthContext);

    // Sample initial data from the provided JSON
    // const [students, setStudents] = useState([
    //     {
    //         "_id": "673ee8bf439365211e82248d",
    //         "userId": {
    //             "teachingGroupId": {
    //                 "name": "Cikampek Kota 1",
    //                 "branchId": {
    //                     "name": "Cikampek Tengah"
    //                 }
    //             }
    //         },
    //         "nis": "20240010",
    //         "name": "Mohandis Supardi Gito Martana",
    //         "gender": "Laki-laki",
    //         "image": ""
    //     },
    //     {
    //         "_id": "673f0c99439365211e822492",
    //         "userId": {
    //             "teachingGroupId": {
    //                 "name": "Cikampek Kota 1",
    //                 "branchId": {
    //                     "name": "Cikampek Tengah"
    //                 }
    //             }
    //         },
    //         "nis": "20240011",
    //         "name": "Yurin",
    //         "gender": "Perempuan",
    //         "image": ""
    //     },
    //     {
    //         "_id": "673f1268439365211e822494",
    //         "userId": {
    //             "teachingGroupId": {
    //                 "name": "Jomin 3",
    //                 "branchId": {
    //                     "name": "Cikampek Timur"
    //                 }
    //             }
    //         },
    //         "nis": "20240012",
    //         "name": "Edsel",
    //         "gender": "Laki-Lalki",
    //         "image": ""
    //     }
    // ]);

    // State for managing modal and form

    // Handler for delete student

    useEffect(() => {
        const url = auth.userRole === 'admin'
            ? `${import.meta.env.VITE_BACKEND_URL}/students`
            : `${import.meta.env.VITE_BACKEND_URL}/students/teaching-group/${auth.userTeachingGroupId}`;

        const fetchStudents = async () => {
            try {
                const responseData = await sendRequest(url);
                setStudents(responseData.students);
                console.log(responseData.students);
            } catch (err) {
                // Error is handled by useHttp
            }
        };
        fetchStudents();
    }, [sendRequest]);

    const handleDeleteStudent = (studentId) => {
        setStudents(students.filter(student => student._id !== studentId));
    };

    // Handler for edit student
    const handleEditStudent = (student) => {
        console.log(student)
    };

    return (
        <div className="min-h-screen px-4 py-8 md:p-8">
            <div className='max-w-6xl mx-auto'>
                <div className="flex flex-col justify-between items-stretch gap-2 mb-4">
                    <h1 className="text-2xl font-semibold text-gray-900">Daftar Peserta Didik</h1>
                    {/* <h1 className="text-2xl font-semibold text-gray-900">Daftar Peserta Didik {auth.userRole === 'admin kelompok' && ''}</h1> */}
                    <WarningCard className="items-center justify-start" warning="Penambahan Peserta Didik Baru Supaya Menghubungi Daerah!" onClear={() => setError(null)} />
                </div>
                {isLoading && (
                    <div className="flex justify-center mt-16">
                        <LoadingCircle size={32} />
                    </div>
                )}
                {students && (
                    <div className="bg-white shadow-sm rounded-md overflow-auto text-nowrap mb-24 ">
                        <table className="w-full">
                            <thead className=" border-b">
                                <tr>
                                    <th className="p-2 md:p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"></th>
                                    {auth.userRole !== 'admin' && <th className="p-2 md:p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>}
                                    <th className="p-2 md:p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">NIS</th>
                                    <th className="p-2 md:p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama</th>
                                    {auth.userRole === 'admin' && <th className="p-2 md:p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Desa</th>}
                                    {auth.userRole === 'admin' && <th className="p-2 md:p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kelompok</th>}
                                    <th className="p-2 md:p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Profile</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {students.map((student) => (
                                    <tr onClick={() => navigate(`/dashboard/students/${student._id}`)} key={student._id} className="hover:bg-gray-50 hover:cursor-pointer transition">
                                        <td className="pl-4 md:pl-8 p-2">
                                            {student.image ? (
                                                <img
                                                    src={student?.image ? `${import.meta.env.VITE_BACKEND_URL}/${student.image}` : "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png?20150327203541"}
                                                    alt={student.name}
                                                    className="size-10 rounded-full m-auto shrink-0"
                                                />
                                            ) : (
                                                <StudentInitial studentName={student.name} clsName={`size-10 rounded-full bg-blue-200 text-blue-500 flex items-center justify-center font-medium m-auto`} />
                                            )}
                                        </td>
                                        {auth.userRole !== 'admin' &&<td className='p-2 md:p-4 '> <div className={`py-1 px-2 text-sm text-center w-min border rounded-md ${!student.isActive ? 'text-red-500 bg-red-100' : 'text-green-500 bg-green-100'}`}>{!student.isActive ? 'Tidak Aktif' : 'Aktif'}</div></td>}
                                        <td className="p-2 md:p-4 text-sm text-gray-900">{student.nis}</td>
                                        <td className="p-2 md:p-4 text-sm text-gray-900">{student.name}</td>
                                        {auth.userRole === 'admin' && <td className="p-2 md:p-4 text-sm text-gray-500">{student.userId.teachingGroupId.branchId.name}</td>}
                                        {auth.userRole === 'admin' && <td className="p-2 md:p-4 text-sm text-gray-500">{student.userId.teachingGroupId.name}</td>}
                                        <td className={`p-2 md:p-4 text-sm text-gray-900 ${student.isProfileComplete ? 'text-green-500' : 'text-red-500 hover:underline cursor-pointer'}`}>{student.isProfileComplete ? 'Lengkap' : 'Lengkapi'}</td>
                                    </tr>
                                ))}
                                {students.length === 0 && (
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

export default StudentsView;


// import React, { useState } from 'react';
// import StudentList from '../components/StudentsList';
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