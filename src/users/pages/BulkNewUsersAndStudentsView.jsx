import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import useHttp from '../../shared/hooks/http-hook';
import DynamicForm from '../../shared/Components/UIElements/DynamicForm';

import ErrorCard from '../../shared/Components/UIElements/ErrorCard';
import LoadingCircle from '../../shared/Components/UIElements/LoadingCircle';
import Modal from '../../shared/Components/UIElements/ModalBottomClose'

import { AuthContext } from '../../shared/Components/Context/auth-context';

const BulkNewUsersAndStudentsView = () => {
    const [loadedTeachingGroups, setLoadedTeachingGroups] = useState([]);
    const { isLoading, error, sendRequest, setError } = useHttp();
    const [bulkCreateFields, setBulkCreateFields] = useState()
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [modalMessage, setModalMessage] = useState(false);

    const [count, setCount] = useState('');
    const [teachingGroupName, setTeachingGroupName] = useState('');
    const [role, setRole] = useState('student');
    const [message, setMessage] = useState('');

    const navigate = useNavigate()
    const auth = useContext(AuthContext)

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
            setBulkCreateFields([
                { name: 'count', label: 'Jumlah Siswa', placeholder: '0', type: 'number', required: true },
                { name: 'year', type: 'year', label: 'Tahun', value: new Date().getFullYear(), required: true },
                {
                    name: 'teachingGroupName',
                    label: 'Kelompok',
                    type: 'select',
                    required: true,
                    options: loadedTeachingGroups.map(({ name }) => ({ label: name, value: name }))
                },

            ]);
        }
    }, [loadedTeachingGroups]);

    const handleBulkCreate = async (data) => {
        if (!data.count || data.count <= 0) {
            setMessage('Please enter a valid count.');
            return;
        }

        const url = `${import.meta.env.VITE_BACKEND_URL}/users/bulk-create`;

        const body = JSON.stringify({
            year: data.year,
            count: data.count,
            teachingGroupName: data.teachingGroupName,
            role: 'student',
        });

        let response
        try {
            response = await sendRequest(url, 'POST', body, {
                'Content-Type': 'application/json',
                Authorization: 'Bearer ' + auth.token
            });
            setModalMessage(response.message)
            setModalIsOpen(true)

        } catch (error) {
        }
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

            <div className="px-2">
                {error && <ErrorCard error={error} onClear={() => setError(null)} />}
            </div>

            <DynamicForm
                title='Tambah Akun Peserta Didik'
                subtitle={'Sistem Akademik Digital'}
                fields={bulkCreateFields || [
                    { name: 'count', label: 'Jumlah Akun', placeholder: '0', type: 'text', required: true },
                    { name: 'teachingGroupName', label: 'Kelompok', placeholder: 'Kelompok', type: 'text', required: true },
                    { name: 'role', label: 'Jenis Akun', placeholder: 'Peserta Didik', type: 'text', required: true },
                ]}
                onSubmit={handleBulkCreate}
                disabled={isLoading}
                reset={false}
                footer={false}
                button={
                    <div className="flex flex-col justify-stretch mt-4">
                        <button
                            type="submit"
                            className={`button-primary ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                            disabled={isLoading}
                        >
                            {isLoading ? (<LoadingCircle>Processing...</LoadingCircle>) : ('Tambah')}
                        </button>
                    </div>
                }
            />
        </div>
    );
};

export default BulkNewUsersAndStudentsView;
