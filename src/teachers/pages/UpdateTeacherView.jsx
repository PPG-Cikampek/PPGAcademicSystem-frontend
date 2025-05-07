import React, { useContext, useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { AuthContext } from '../../shared/Components/Context/auth-context';
import useHttp from '../../shared/hooks/http-hook';
import DynamicForm from '../../shared/Components/UIElements/DynamicForm';

import ErrorCard from '../../shared/Components/UIElements/ErrorCard';
import LoadingCircle from '../../shared/Components/UIElements/LoadingCircle';

import Modal from "../../shared/Components/UIElements/ModalBottomClose";
import FileUpload from '../../shared/Components/FormElements/FileUpload';

import { Icon } from '@iconify-icon/react'
import generateBase64Thumbnail from '../../shared/Utilities/generateBase64Thumbnail';

const UpdateTeacherView = () => {
    const [modal, setModal] = useState({ title: '', message: '', onConfirm: null });
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const { isLoading, error, sendRequest, setError } = useHttp();
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [loadedTeacher, setLoadedTeacher] = useState();
    const [loadedDate, setLoadedDate] = useState();
    const [croppedImage, setCroppedImage] = useState(null);
    const fileInputRef = useRef();

    const auth = useContext(AuthContext);

    const id = useParams().id;
    const navigate = useNavigate();

    useEffect(() => {
        const fetchTeacher = async () => {
            const url = auth.userRole !== 'teacher'
                ? `${import.meta.env.VITE_BACKEND_URL}/teachers/${id}`
                : `${import.meta.env.VITE_BACKEND_URL}/teachers/user/${auth.userId}`;

            try {
                const responseData = await sendRequest(url);
                setLoadedTeacher(responseData.teacher);

                const date = new Date(responseData.teacher.dateOfBirth);
                setLoadedDate(date.toISOString().split('T')[0]);
            } catch (err) { }
        };
        fetchTeacher();
    }, [sendRequest]);

    const handleFormSubmit = async (data) => {
        const url = `${import.meta.env.VITE_BACKEND_URL}/teachers/`;
        const formData = new FormData();

        formData.append('name', data.name);
        formData.append('phone', data.phone);
        formData.append('dateOfBirth', data.dateOfBirth);
        formData.append('gender', data.gender);
        formData.append('address', data.address);
        formData.append('position', data.position);
        formData.append('parentName', data.parentName);
        formData.append('userId', loadedTeacher.userId);
        formData.append('teacherId', loadedTeacher.id);

        console.log(croppedImage)
        console.log(fileInputRef.current.files[0])

        if (croppedImage) {
            formData.append('image', croppedImage);
            // Generate and append base64 thumbnail
            try {
                const base64Thumb = await generateBase64Thumbnail(croppedImage, 128);
                formData.append('thumbnail', base64Thumb);
            } catch (err) {
                setError("Gagal membuat thumbnail!");
                throw err;
            }
        } else {
            if (auth.userRole !== 'admin') {
                setError("Tidak ada foto yang dipilih!");
                throw new Error('Tidak ada foto yang dipilih!');
            }
        }

        console.log(data);
        console.log(formData);

        let responseData;
        try {
            responseData = await sendRequest(url, 'PATCH', formData);
            console.log(responseData);
        } catch (err) { }
        setModal({ title: 'Berhasil!', message: responseData.message, onConfirm: null });
        setModalIsOpen(true);
    };

    const ModalFooter = () => (
        <div className="flex gap-2 items-center">
            <button
                onClick={() => {
                    setModalIsOpen(false);
                    !error && navigate(-1);
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

    return (
        <div className="m-auto max-w-md mt-14 md:mt-8">
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

            <div className={`pb-24 transition-opacity duration-300 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
                <DynamicForm
                    customDescription={
                        <div className='relative'>
                            <div className=''>
                                <FileUpload
                                    ref={fileInputRef}
                                    accept=".jpg,.jpeg,.png"
                                    buttonLabel={<Icon icon="jam:upload" width="24" height="24" />}
                                    buttonClassName={`${isLoading && 'hidden'} border border-gray-600 bg-gray-50 size-9 rounded-full absolute offset bottom-2 right-2 translate-x-1/2 translate-y-1/2`}
                                    imgClassName={`${isLoading && 'animate-pulse'} mt-2 rounded-md size-32 md:size-48 shrink-0`}
                                    defaultImageSrc={loadedTeacher?.image ? `${import.meta.env.VITE_BACKEND_URL}/${loadedTeacher.image}` : "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png?20150327203541"}
                                    onImageCropped={setCroppedImage}
                                />
                            </div>
                        </div>
                    }
                    subtitle={'Update Profile Tenaga Pendidik'}
                    fields={[
                        { name: 'name', label: 'Nama Lengkap', placeholder: 'Nama Lengkap', type: 'text', required: true, disabled: isLoading, value: loadedTeacher?.name || '' },
                        { name: 'phone', label: 'Nomor WA Aktif', placeholder: '8123456789', type: 'phone', required: true, disabled: isLoading, value: loadedTeacher?.phone || '' },
                        {
                            name: 'position', label: 'Posisi', placeholder: 'Guru', type: 'select', required: true, disabled: isLoading, value: loadedTeacher?.position || '',
                            options: [
                                { label: 'MT Desa', value: 'branchTeacher' },
                                { label: 'MT Kelompok', value: 'teachingGroupTeacher' },
                                { label: 'MS', value: 'localTeacher' },
                                { label: 'Asisten', value: 'assistant' }
                            ]
                        },
                        { name: 'dateOfBirth', label: 'Tanggal Lahir', placeholder: 'Desa', type: 'date', required: true, disabled: isLoading, value: loadedDate || '' },
                        { name: 'gender', label: 'Jenis Kelamin', type: 'select', required: true, disabled: isLoading, value: loadedTeacher?.gender || '', options: [{ label: 'Laki-Laki', value: 'male' }, { label: 'Perempuan', value: 'female' }] },
                        { name: 'address', label: 'Alamat', type: 'textarea', required: true, disabled: isLoading, value: loadedTeacher?.address || '' },
                    ]}
                    onSubmit={handleFormSubmit}
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
                                {isLoading ? (<LoadingCircle>Processing...</LoadingCircle>) : ('Update')}
                            </button>
                            {error && <ErrorCard error={error} onClear={() => setError(null)} />}
                        </div>
                    }
                />
            </div>
        </div>
    );
};

export default UpdateTeacherView;