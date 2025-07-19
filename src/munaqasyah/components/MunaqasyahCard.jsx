import React from "react";
import { academicYearFormatter } from "../../shared/Utilities/academicYearFormatter";
import getMunaqasyahStatusName from '../utilities/getMunaqasyahStatusName';
import useModal from "../../shared/hooks/useModal";
import useHttp from "../../shared/hooks/http-hook";
import Modal from '../../shared/Components/Modal';
import ModalFooter from '../../shared/Components/ModalFooter';
import ErrorCard from "../../shared/Components/UIElements/ErrorCard";


const MunaqasyahCard = ({ year, onClick, isClickAble = true, fetchData }) => {

    const { sendRequest, isLoading, error, setError } = useHttp();

    const {
        isOpen: modalIsOpen,
        modal,
        openModal,
        closeModal,
        setModal
    } = useModal({ title: '', message: '', onConfirm: null });

    const branchMunaqasyahStatusHandler = (actionName, name, branchYearId) => {
        const confirmAction = async (action) => {
            const url = `${import.meta.env.VITE_BACKEND_URL}/branchYears/munaqasyah/`;
            const body = JSON.stringify({
                branchYearId,
                action: action
            });
            try {
                const responseData = await sendRequest(url, 'PATCH', body, {
                    'Content-Type': 'application/json'
                });
                openModal({ title: 'Berhasil!', message: responseData.message, onConfirm: null });
                if (typeof fetchData === 'function') {
                    await fetchData(); // Refresh parent data to update year.munaqasyahStatus
                }
            } catch (err) {
                setError(err.message);
                openModal({ title: 'Gagal!', message: err.message, onConfirm: null });;
            }
        };

        if (actionName === 'start') {
            openModal({
                title: `Konfirmasi`,
                message: `Mulai Munaosah Desa untuk Tahun Ajaran ${academicYearFormatter(name)}?`,
                onConfirm: () => confirmAction('inProgress')
            });
        } else {
            openModal({
                title: `Konfirmasi`,
                message: `Selesaikan Munaosah Desa untuk Tahun Ajaran ${academicYearFormatter(name)}?`,
                onConfirm: () => confirmAction('completed')
            });
        }
    }

    return (
        <>
            {error && !isLoading && <ErrorCard error={error} onClose={() => setError(null)} />}
            <div
                className="card-basic rounded-md flex-col m-0 p-0"
                onClick={typeof onClick === 'function' ? onClick : undefined}
            >
                <Modal
                    isOpen={modalIsOpen}
                    title={modal.title}
                    message={modal.message}
                    onClose={closeModal}
                    onConfirm={modal.onConfirm}
                    footer={<ModalFooter isLoading={isLoading} onClose={closeModal} onConfirm={modal.onConfirm} showConfirm={!!modal.onConfirm} />}
                />
                <div
                    className={`p-6 ${isClickAble ? 'cursor-pointer hover:bg-gray-50' : ''} transition-colors duration-200`}
                >
                    <div className="flex md:justify-between items-start md:flex-row flex-col md:items-center w-full">
                        <div className="flex flex-col">
                            <div className='flex gap-2 flex-row flex-wrap'>
                                <h2 className="text-xl font-medium text-gray-800">{academicYearFormatter(year.academicYearId.name)}</h2>
                                <div className="flex gap-2">
                                    <div className={`inline-block px-2 py-1 text-sm ${(year.academicYearId.isActive ? 'text-blue-600 bg-blue-100' : 'text-gray-600 bg-gray-100')} rounded-sm`}>
                                        {year.academicYearId.isActive ? 'Semester Berjalan' : 'Semester Lewat'}
                                    </div>
                                    <div className={`inline-block px-2 py-1 text-sm ${year.munaqasyahStatus === 'inProgress' ? 'text-yellow-600 bg-yellow-100' : year.munaqasyahStatus === 'completed' ? 'text-green-600 bg-green-100' : 'text-gray-600 bg-gray-100'} rounded-sm`}>
                                        {getMunaqasyahStatusName(year.munaqasyahStatus)}
                                    </div>
                                </div>
                            </div>

                            <div className={`inline-block py-1 text-sm ${year.academicYearId.munaqasyahStatus === 'inProgress' ? 'text-blue-500' : year.academicYearId.munaqasyahStatus === 'completed' ? 'text-gray-500' : 'text-gray-600 '} rounded-sm`}>
                                {year.academicYearId.munaqasyahStatus === 'inProgress' ? 'Daerah sudah memulai munaqosah!' : year.academicYearId.munaqasyahStatus === 'completed' ? 'Munaqosah daerah sudah selesai.' : 'Daerah belum memulai'}
                            </div>
                        </div>
                        {(year.academicYearId.isActive === true && year.academicYearId.munaqasyahStatus === 'inProgress') && (
                            <>
                                {(year.munaqasyahStatus === 'notStarted' || year.munaqasyahStatus === 'completed') && (
                                    <div className="mt-4">
                                        <button
                                            className="btn-primary-outline"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                branchMunaqasyahStatusHandler('start', year.name, year._id);
                                            }}
                                        >
                                            {year.munaqasyahStatus === 'notStarted' ? 'Mulai Munaqosah' : 'Mulai Munaqosah Susulan'}
                                        </button>
                                    </div>
                                )}
                                {year.munaqasyahStatus === 'inProgress' && (
                                    <div className="mt-4">
                                        <button
                                            className="btn-primary-outline"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                branchMunaqasyahStatusHandler('complete', year.name, year._id);
                                            }}
                                        >
                                            Selesaikan Munaqosah
                                        </button>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </>
    )
};

export default MunaqasyahCard;
