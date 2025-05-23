import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../shared/Components/Context/auth-context';

import useHttp from '../../shared/hooks/http-hook';
import DynamicForm from '../../shared/Components/UIElements/DynamicForm';

import ErrorCard from '../../shared/Components/UIElements/ErrorCard';
import LoadingCircle from '../../shared/Components/UIElements/LoadingCircle';
import Modal from '../../shared/Components/UIElements/ModalBottomClose'

const NewUserView = () => {
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [modalMessage, setModalMessage] = useState(false);

    const [isAccountForAdmin, setIsAccountForAdmin] = useState(true);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const { isLoading, error, sendRequest, setError } = useHttp();
    const [loadedTeachingGroups, setLoadedTeachingGroups] = useState([]);
    const [adminFields, setAdminFields] = useState()

    const auth = useContext(AuthContext);
    const navigate = useNavigate()

    useEffect(() => {
        const fetchTeachingGroups = async () => {
            try {
                const responseData = await sendRequest(`${import.meta.env.VITE_BACKEND_URL}/levels/branches/teaching-groupes`);
                setLoadedTeachingGroups(responseData.teachingGroups);
            } catch (err) { }
        };
        fetchTeachingGroups();
    }, [sendRequest]);

    useEffect(() => {
        if (loadedTeachingGroups) {
            setAdminFields([
                { name: 'name', label: 'Nama Lengkap', placeholder: 'Faisal Ahmad', type: 'text', required: true },
                { name: 'email', label: 'Email', placeholder: 'contoh@email.com', type: 'email', required: true },
                { name: 'password', label: 'Password', placeholder: 'min 8 karakter', type: 'password', required: true },
                {
                    name: 'teachingGroupName',
                    label: 'Kelompok',
                    type: 'select',
                    required: true,
                    options: loadedTeachingGroups.map(({ name }) => ({ label: name, value: name }))
                },
                {
                    name: 'role',
                    label: 'Role Akun',
                    type: 'select',
                    required: true,
                    options:
                        [
                            { label: 'Admin', value: 'admin' },
                            { label: 'Admin Kelompok', value: 'teachingGroupAdmin' },
                            { label: 'Kurikulum', value: 'curriculum' },
                            { label: 'Munaqis', value: 'munaqisy' },
                        ]

                },

            ]);
        }
    }, [loadedTeachingGroups]);

    const handleFormSubmit = async (data) => {
        const url = `${import.meta.env.VITE_BACKEND_URL}/users/createUser`

        const body = JSON.stringify(isAccountForAdmin
            ? {
                name: data.name,
                email: data.email,
                password: data.password,
                role: data.role,
                teachingGroupName: data.teachingGroupName
            }
            : {
                name: data.name,
                email: data.email,
                password: data.password,
                role: data.position,
                teachingGroupName: data.teachingGroupName,
                teacherDetails: {
                    nig: data.nig,
                    position: data.position
                }
            });

        // console.log(body)
        let responseData;
        try {
            responseData = await sendRequest(url, 'POST', body, {
                'Content-Type': 'application/json',
                Authorization: 'Bearer ' + auth.token
            });
            setModalMessage(responseData.message)
            setModalIsOpen(true)

        } catch (err) {
            // Error is already handled by useHttp
        }
    };

    const teacherObject = () => {
        const updatedList = adminFields.filter((item) => item.name !== 'nig' && item.name !== 'role'); // Removing the object

        const newObject = { name: 'nig', label: 'NIG Guru', placeholder: '00001234', type: 'text', required: true };
        const newObject2 = { name: 'position', label: 'Posisi', placeholder: 'Guru', type: 'select', required: true, options:
            [
                { label: 'Guru', value: 'teacher' },
                { label: 'Munaqis', value: 'munaqisy' },
            ]};
        // const newObject2 = { name: 'role', label: 'Jenis Akun', placeholder: 'Guru', value: 'teacher', type: 'text', disabled: true };
        setAdminFields([...updatedList, newObject, newObject2]); // Adding the new object to the list
    };

    // Function to remove an object by its `id`
    const adminObject = () => {
        const updatedList = adminFields.filter((item) => item.name !== 'nig' && item.name !== 'role'); // Removing the object
        const newObject2 = {
            name: 'role',
            label: 'Akun',
            type: 'select',
            required: true,
            options:
                [
                    { label: 'Admin', value: 'admin' },
                    { label: 'Admin Kelompok', value: 'teachingGroupAdmin' },
                ]

        };
        updatedList.push(newObject2); // Adding the new object to the list
        setAdminFields(updatedList);
    };

    const handleToggle = () => {
        setIsTransitioning(true);
        setError(null);
        setTimeout(() => {
            setIsAccountForAdmin((prev) => !prev);
            if (!isAccountForAdmin) {
                adminObject(); // Remove 'nig' field if switching to admin
            } else {
                teacherObject(); // Add 'nig' field if switching to teacher
            }
            setIsTransitioning(false);
        }, 200);
    };


    return (
        <div className="m-auto max-w-md mt-14 md:mt-8">
            <Modal
                isOpen={modalIsOpen}
                onClose={() => setModalIsOpen(false)}
                title='Berhasil!'
                footer={
                    <>
                        <button
                            onClick={() => {
                                setModalIsOpen(false)
                                navigate('/settings/users/')
                            }}
                            className='btn-danger-outline'
                        >
                            Tutup
                        </button>
                    </>
                }
            >
                {modalMessage}
            </Modal>


            <div className={`pb-24 transition-opacity duration-300 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
                <div className="px-2">
                    {error && <ErrorCard error={error} onClear={() => setError(null)} />}
                </div>
                <DynamicForm
                    title={isAccountForAdmin ? 'Tambah Akun' : 'Tambah Akun Guru'}
                    subtitle={'Sistem Akademik Digital'}
                    fields={adminFields || [
                        { name: 'name', label: 'Name', placeholder: 'Nama Lengkap', type: 'text', required: true },
                        { name: 'email', label: 'Email', placeholder: 'Email', type: 'email', required: true },
                        { name: 'password', label: 'Password', placeholder: 'Password', type: 'password', required: true },
                    ]}
                    onSubmit={handleFormSubmit}
                    disabled={isLoading}
                    reset={false}
                    footer={false}
                    button={
                        <div className="flex flex-col justify-stretch mt-4">
                            <button
                                type="submit"
                                className={`button-primary ${isLoading ? 'opacity-50 hover:cursor-not-allowed' : ''}`}
                                disabled={isLoading}
                            >
                                {isLoading ? (<LoadingCircle>Processing...</LoadingCircle>) : ('Tambah')}
                            </button>
                            <button
                                type="button"
                                onClick={handleToggle}
                                className="button-secondary"
                                disabled={isLoading}
                            >
                                {isAccountForAdmin ? 'Tambah Akun Guru' : 'Tambah Akun Admin'}
                            </button>
                        </div>
                    }
                />
            </div>
        </div >
    );
};

export default NewUserView;
