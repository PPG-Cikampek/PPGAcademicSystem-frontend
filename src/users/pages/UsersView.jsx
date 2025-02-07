import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../shared/Components/Context/auth-context';
import useHttp from '../../shared/hooks/http-hook';

import Modal from '../../shared/Components/UIElements/ModalBottomClose';
import LoadingCircle from '../../shared/Components/UIElements/LoadingCircle';
import { Search, Users, Pencil, Trash, ChevronDown, Filter, PlusIcon } from 'lucide-react';
import FloatingMenu from '../../shared/Components/UIElements/FloatingMenu';
import ErrorCard from '../../shared/Components/UIElements/ErrorCard';

const UsersView = () => {
    const [users, setUsers] = useState();
    const [searchTerm, setSearchTerm] = useState('');
    const [modal, setModal] = useState({ title: '', message: '', onConfirm: null });
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [selectedUserIds, setSelectedUserIds] = useState([]);
    const [groupVisibility, setGroupVisibility] = useState({
        admin: true,
        teachingGroupAdmin: true,
        teacher: true,
        student: true,
    });

    const roleOrder = ['admin', 'teachingGroupAdmin', 'teacher', 'student'];

    const { isLoading, error, sendRequest, setError } = useHttp();
    const navigate = useNavigate();
    const auth = useContext(AuthContext);
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const responseData = await sendRequest(`${import.meta.env.VITE_BACKEND_URL}/users/`);
                setUsers(responseData);
                console.log(responseData);
            } catch (err) {
                // Error is handled by useHttp
            }
        };
        fetchUsers();
    }, [sendRequest]);

    const toggleGroupVisibility = (role) => {
        setGroupVisibility((prev) => ({ ...prev, [role]: !prev[role] }));
    };

    const getRoleColor = (role) => {
        const roles = {
            admin: 'bg-red-100 text-red-700',
            teachingGroupAdmin: 'bg-orange-100 text-orange-700',
            teacher: 'bg-violet-100 text-violet-700',
            student: 'bg-blue-100 text-blue-700',
        };
        return roles[role] || 'bg-gray-100 text-gray-700';
    };

    const getInitials = (name) => {
        return name
            ?.split(' ')
            .map((word) => word[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    const handleDeleteUser = (userId) => {
        const confirmDelete = async () => {
            try {
                const responseData = await sendRequest(`${import.meta.env.VITE_BACKEND_URL}/users/${userId}`, 'DELETE', null, {
                    Authorization: 'Bearer ' + auth.token
                });
                setModal({ title: 'Berhasil!', message: responseData.message, onConfirm: null });
                setUsers((prevUsers) => ({
                    ...prevUsers,
                    users: prevUsers.users.filter((user) => user._id !== userId),
                }));
            } catch (err) {
                // Error handled by useHttp
            }
        };
        setModal({
            title: 'Peringatan!',
            message: 'Hapus Pengguna?',
            onConfirm: confirmDelete,
        });
        setModalIsOpen(true);
    };

    const handleBulkDelete = () => {
        if (selectedUserIds.length === 0) {
            setModal({
                title: 'Error',
                message: 'Please select at least one user.',
                onConfirm: null,
            });
            setModalIsOpen(true);
            return;
        }

        const confirmBulkDelete = async () => {
            const url = `${import.meta.env.VITE_BACKEND_URL}/users/bulk-delete`
            const body = JSON.stringify({ userIds: selectedUserIds })
            console.log(body)
            try {

                const responseData = await sendRequest(url, 'DELETE', body, {
                    'Content-Type': 'application/json',
                    Authorization: 'Bearer ' + auth.token
                });
                setModal({ title: 'Berhasil!', message: responseData.message, onConfirm: null });
                setUsers((prevUsers) => ({
                    ...prevUsers,
                    users: prevUsers.users.filter((user) => !selectedUserIds.includes(user._id)),
                }));
                setSelectedUserIds([]);
            } catch (err) {
                // Error handled by useHttp
            }
        };

        setModal({
            title: 'Konfirmasi',
            message: 'Hapus semua user yang dipilih?',
            onConfirm: confirmBulkDelete,
        });
        setModalIsOpen(true);
    };


    const ModalFooter = () => (
        <div className="flex gap-2 items-center">
            <button
                onClick={() => {
                    setModalIsOpen(false)
                }}
                className={`${modal.onConfirm ? 'btn-danger-outline' : 'button-primary mt-0 '}`}
            >
                {modal.onConfirm ? 'Batal' : 'Tutup'}
            </button>
            {modal.onConfirm && (
                <button onClick={modal.onConfirm} className="button-primary mt-0 ">
                    Ya
                </button>
            )}
        </div>
    );

    const UserCard = ({ user }) => {
        const isSelected = selectedUserIds.includes(user._id);

        const toggleSelection = () => {
            setSelectedUserIds((prev) =>
                isSelected ? prev.filter((id) => id !== user._id) : [...prev, user._id]
            );
        };

        return (
            <div className="p-4 hover:bg-gray-50 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={toggleSelection}
                        className="mr-2"
                    />
                    {user.image ? (
                        <img
                            src={`${import.meta.env.VITE_BACKEND_URL}/${user.image}`}
                            alt={user.name}
                            className="w-10 h-10 rounded-full"
                        />
                    ) : (
                        <div
                            className={`w-10 h-10 rounded-full flex ${getRoleColor(user.role)} items-center justify-center font-medium`}
                        >
                            {getInitials(user.name)}
                        </div>
                    )}
                    <div>
                        <div className="flex gap-2">
                            <h3 className="text-sm font-medium text-gray-900">{user.name}</h3>
                            <span className={`hidden md:inline-block px-2.5 py-0.5 rounded-full text-xs font-medium h-6 ${getRoleColor(user.role)}`}>
                                {
                                    user.role === 'teachingGroupAdmin'
                                        ? 'Admin Kelompok'
                                        : user.role === 'teacher'
                                            ? 'Guru'
                                            : user.role === 'student'
                                                ? 'Siswa'
                                                : 'Admin Daerah'}</span>
                        </div>
                        {user.role !== 'student' && <p className="text-sm text-gray-500 hidden md:block">{user.email}</p>}
                    </div>
                </div>
                <div className="flex items-center space-x-4">
                    <div className="text-right">
                        <div className="text-sm text-gray-900 hidden md:block">{user.teachingGroupId.branchId.name}</div>
                        <div className="text-xs text-gray-500 hidden md:block">{user.teachingGroupId.name}</div>
                    </div>
                    <div className="p-1 hover:bg-gray-100 rounded">
                        <FloatingMenu
                            buttons={[
                                {
                                    icon: Pencil,
                                    label: 'Edit',
                                    onClick: () => navigate(`/settings/users/${user._id}`),
                                },
                                {
                                    icon: Trash,
                                    label: 'Delete',
                                    variant: 'danger',
                                    onClick: () => handleDeleteUser(user._id),
                                },
                            ]}
                        />
                    </div>
                </div>
            </div>
        );
    };


    return (
        <div className="min-h-screen bg-gray-50 px-4 py-8 md:p-8">
            <div className="max-w-6xl mx-auto">
                {error && <ErrorCard error={error} onClear={() => setError(null)} />}

                <Modal
                    isOpen={modalIsOpen}
                    onClose={() => setModalIsOpen(false)}
                    title={modal.title}
                    footer={<ModalFooter />}
                >
                    {isLoading && (
                        <div className="flex justify-center mt-16">
                            <LoadingCircle size={32} />
                        </div>
                    )}
                    {!isLoading && (
                        modal.message
                    )}
                </Modal>

                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-semibold text-gray-900">Daftar User</h1>
                    <div className="flex gap-2">
                        <button onClick={handleBulkDelete} className="button-danger disabled:hidden" disabled={selectedUserIds.length === 0}>
                            <Trash className="w-4 h-4 mr-2" />
                            Hapus Akun
                        </button>
                        <Link to="/settings/users/new">
                            <button className="button-primary pl-[14px]">
                                <PlusIcon className="w-4 h-4 mr-2" />
                                Tambah Akun
                            </button>
                        </Link>
                        <Link to="/settings/users/bulk-create">
                            <button className="button-primary pl-[14px]">
                                <Users className="w-4 h-4 mr-2" />
                                Tambah Peserta Didik
                            </button>
                        </Link>
                    </div>
                </div>

                {isLoading && (
                    <div className="flex justify-center mt-16">
                        <LoadingCircle size={32} />
                    </div>
                )}

                {users && (
                    <>
                        <div className="bg-white p-4 rounded-md shadow-sm mb-6 flex items-center space-x-4">
                            <div className="flex-1 relative">
                                <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                <input
                                    type="text"
                                    placeholder="Search users..."
                                    className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <button className="px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-50 flex items-center space-x-2">
                                <Filter className="w-4 h-4" />
                                <span>Filters</span>
                                <ChevronDown className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="bg-white rounded-md shadow-sm">
                            {roleOrder.map((role) => {
                                const roleUsers = users.users.filter((user) => user.role === role);
                                return (
                                    <div key={role} className="divide-y">
                                        <div
                                            className="bg-gray-100 px-4 py-2 font-semibold text-gray-700 cursor-pointer flex items-center justify-between"
                                            onClick={() => toggleGroupVisibility(role)}
                                        >
                                            <span>{
                                                role === 'teachingGroupAdmin'
                                                    ? 'Admin Kelompok'
                                                    : role === 'teacher'
                                                        ? 'Guru'
                                                        : role === 'student'
                                                            ? 'Siswa'
                                                            : 'Admin'}</span>
                                            <ChevronDown
                                                className={`w-4 h-4 transform transition-transform ${groupVisibility[role] ? '' : '-rotate-90'
                                                    }`}
                                            />
                                        </div>
                                        {groupVisibility[role] &&
                                            roleUsers.map((user) => <UserCard key={user._id} user={user} />)}
                                    </div>
                                );
                            })}
                        </div>
                    </>
                )}

            </div>
        </div>
    );
};

export default UsersView;