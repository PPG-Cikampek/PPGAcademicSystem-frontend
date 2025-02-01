import React, { useContext, useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import useHttp from '../../../shared/hooks/http-hook';
import { AuthContext } from '../../../shared/Components/Context/auth-context';

import DynamicForm from '../../../shared/Components/UIElements/DynamicForm';

import ErrorCard from '../../../shared/Components/UIElements/ErrorCard';
import LoadingCircle from '../../../shared/Components/UIElements/LoadingCircle';
import Modal from '../../../shared/Components/UIElements/ModalBottomClose';

const NewMaterialProgresslView = () => {
    const [modal, setModal] = useState({ title: '', message: '', onConfirm: null });
    const [modalIsOpen, setModalIsOpen] = useState(false);

    const [isTransitioning, setIsTransitioning] = useState(false);
    const [classData, setClassData] = useState(false);
    const [inputFields, setInputFields] = useState();

    const { isLoading, error, sendRequest, setError } = useHttp();

    const auth = useContext(AuthContext);
    const classIds = auth.userClassIds

    const navigate = useNavigate()
    const location = useLocation()
    const { state } = location;

    useEffect(() => {
        const loadClasses = async () => {
            const url = `${import.meta.env.VITE_BACKEND_URL}/classes/get-by-ids`
            const body = JSON.stringify({ classIds })
            console.log('fetching classes this teacher enrolled...')
            console.log(classIds)

            try {
                const responseData = await sendRequest(url, 'POST', body, {
                    'Content-Type': 'application/json'
                })
                setClassData(responseData.classes)

                console.log('fetching classes complete...')
                console.log(responseData.classes)

            } catch (err) { }
        };
        console.log(classIds)
        if (classIds.length === 0) {
            setClassData({ classes: [] })
        } else {
            loadClasses();
        }
    }, [sendRequest, classIds]);

    useEffect(() => {
        if (classData) {
            setInputFields([
                {
                    name: 'classId',
                    label: 'Kelas',
                    type: 'select',
                    required: true,
                    // options: classData.map(({ cls }) => ({ label: cls?.teachingGroupYearId?.academicYearId?.isActive === true ? cls.name : '', value: cls?.teachingGroupYearId?.academicYearId?.isActive === true ? cls._id : '' })).filter(option => option.label && option.value)
                    options: classData.map((cls) => ({ label: cls?.teachingGroupYearId?.academicYearId?.isActive === true ? cls.name : '', value: cls?.teachingGroupYearId?.academicYearId?.isActive === true ? cls._id : '' }))
                },
                {
                    name: 'category',
                    label: 'Kategori',
                    type: 'select',
                    required: true,
                    options: [
                        { label: 'Membaca Al-Quran/Tilawati', value: 'Membaca Al-Quran/Tilawati' },
                        { label: 'Menulis Arab', value: 'Menulis Arab' },
                        { label: 'Tafsir Al-Quran', value: 'Tafsir Al-Quran' },
                        { label: 'Tafsirt Hadits', value: 'Tafsirt Hadits' },
                        { label: 'Praktek Ibadah', value: 'Praktek Ibadah' },
                        { label: 'Akhlak dan Tata Krama', value: 'Akhlak dan Tata Krama' },
                        { label: 'Hafalan', value: 'Hafalan' },
                        { label: 'Keilmuan dan Kefahaman Agama', value: 'Keilmuan dan Kefahaman Agama' },
                        { label: 'Kemandirian', value: 'Kemandirian' },
                    ]
                },
                // { name: 'title', label: 'Judul', type: 'text', required: true },
                { name: 'material', label: 'Materi', type: 'textarea', textAreaRows: 2, required: true },
            ]);
        }
    }, [classData]);


    const handleFormSubmit = async (data) => {
        const url = `${import.meta.env.VITE_BACKEND_URL}/materialProgress/`

        const body = JSON.stringify({
            userId: auth.userId,
            classId: data.classId,
            category: data.category,
            material: data.material
        });

        let responseData;
        try {
            responseData = await sendRequest(url, 'POST', body, {
                'Content-Type': 'application/json'
            });
        } catch (err) {
            setError(err.message)
            setModal({ title: 'Gagal!', message: err.message, onConfirm: null });
            setModalIsOpen(true)
        }
        setModal({ title: 'Berhasil!', message: responseData.message, onConfirm: null });
        setModalIsOpen(true)
    };

    const ModalFooter = () => (
        <div className="flex gap-2 items-center">
            <button
                onClick={() => {
                    setModalIsOpen(false)
                    !error && navigate(-1)
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

            {error && (
                <div className='mx-2'>
                    <ErrorCard error={error} onClear={() => setError(null)} />
                </div>
            )}

            <div className={`pb-24 transition-opacity duration-300 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
                <DynamicForm
                    // title='Pencapaian Materi'
                    // subtitle={'Sistem Absensi Digital'}
                    subtitle={'Pencapaian Materi'}
                    fields={inputFields || []}
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
                                {isLoading ? (<LoadingCircle>Processing...</LoadingCircle>) : ('Simpan')}
                            </button>
                        </div>
                    }
                />
            </div>
        </div >
    );
};

export default NewMaterialProgresslView;