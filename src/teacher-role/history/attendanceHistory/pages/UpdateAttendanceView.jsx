import React, { useContext, useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import useHttp from '../../../../shared/hooks/http-hook';
import DynamicForm from '../../../../shared/Components/UIElements/DynamicForm';

import ErrorCard from '../../../../shared/Components/UIElements/ErrorCard';
import LoadingCircle from '../../../../shared/Components/UIElements/LoadingCircle';

import Modal from '../../../../shared/Components/UIElements/ModalBottomClose';


const UpdateAttendanceView = () => {
    const [modal, setModal] = useState({ title: '', message: '', onConfirm: null });
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const { isLoading, error, sendRequest, setError } = useHttp();
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [loadedAttendance, setLoadedAttendance] = useState();

    const attendanceId = useParams().attendanceId
    const navigate = useNavigate();

    useEffect(() => {
        const fetchAttendance = async () => {
            try {
                const responseData = await sendRequest(`${import.meta.env.VITE_BACKEND_URL}/attendances/${attendanceId}`)
                setLoadedAttendance(responseData.attendance)
                console.log(responseData.attendance)

            } catch (err) { }
        }
        fetchAttendance();
    }, [sendRequest])

    const handleFormSubmit = async (data) => {
        console.log('Updating ... ')
        const url = `${import.meta.env.VITE_BACKEND_URL}/attendances/`

        const body = JSON.stringify({
            updates: [{
                attendanceId: loadedAttendance.id,
                status: data.status,
                attributes: data.attributes,
                timestamp: Date.now(),
            }]
        });

        console.log(body)

        let responseData
        try {
            responseData = await sendRequest(url, 'PATCH', body, {
                'Content-Type': 'application/json'
            });
        } catch (err) { }

        setModal({ title: 'Berhasil!', message: responseData.message, onConfirm: () => navigate(-2) });
        setModalIsOpen(true)
    };

    const ModalFooter = () => (
        <div className="flex gap-2 items-center">
            {modal.onConfirm && (
                <button onClick={modal.onConfirm} className="button-primary mt-0 ">
                    Ok
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


            {error && <ErrorCard error={error} onClear={() => setError(null)} />}

            <div className={`pb-24 transition-opacity duration-300 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
                <DynamicForm
                    subtitle={'Edit Data Absen'}
                    fields={[
                        { name: 'name', label: 'Nama Lengkap', type: 'text', required: false, disabled: true, value: loadedAttendance?.studentId?.name || '' },
                        { name: 'statusOld', label: 'Status Kehadiran (sebelumnya)', type: 'text', required: false, disabled: true, value: loadedAttendance?.status || '' },
                        { name: 'attributesOld', label: 'Atribut (sebelumnya)', type: 'text', required: false, disabled: true, value: loadedAttendance?.attributes ? 'Ya' : 'Tidak' || '' },
                        {
                            name: 'status', label: 'Status Kehadiran (baru)', type: 'select', required: true,
                            value: loadedAttendance?.status || '',
                            options: [
                                { label: 'Hadir', value: 'Hadir' },
                                { label: 'Terlambat', value: 'Terlambat' },
                                { label: 'Izin', value: 'Izin' },
                                { label: 'Sakit', value: 'Sakit' },
                                { label: 'Tanpa Keterangan', value: 'Tanpa Keterangan' },
                            ]
                        },
                        {
                            name: 'attributes', label: 'Atribut Lengkap? (baru)', type: 'select', required: true,
                            value: loadedAttendance?.attributes || '',
                            options: [
                                { label: 'Ya', value: "true" },
                                { label: 'Tidak', value: "false" },
                            ]
                        },

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
                        </div>
                    }
                />
            </div>
        </div>
    );
};

export default UpdateAttendanceView;
