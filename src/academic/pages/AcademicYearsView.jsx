import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PlusIcon } from 'lucide-react';

import useHttp from '../../shared/hooks/http-hook';
import SkeletonLoader from '../../shared/Components/UIElements/SkeletonLoader';
import Modal from "../../shared/Components/UIElements/ModalBottomClose";
import ErrorCard from '../../shared/Components/UIElements/ErrorCard';
import AcademicYearList from '../components/AcademicYearList';
import ModalFooter from '../components/ModalFooter';

import { academicYearFormatter } from '../../shared/Utilities/academicYearFormatter';

const AcademicYearsView = () => {
  const [expandedCards, setExpandedCards] = useState({});
  const [modal, setModal] = useState({ title: '', message: '', onConfirm: null });
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [data, setData] = useState();
  const { isLoading, sendRequest, error } = useHttp();

  useEffect(() => {
    const loadLevels = async () => {
      try {
        const responseData = await sendRequest(`${import.meta.env.VITE_BACKEND_URL}/academicYears?populate=teachingGroupYears`);
        setData(responseData);
      } catch (err) {
        // Error handled by useHttp
      }
    };
    loadLevels();
  }, [sendRequest]);

  const toggleCard = (id) => {
    setExpandedCards(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const activateYearHandler = (academicYearName, academicYearId) => {
    const confirmRegister = async () => {
      try {
        const responseData = await sendRequest(
          `${import.meta.env.VITE_BACKEND_URL}/academicYears/activate/${academicYearId}`,
          'POST',
          null,
          { 'Content-Type': 'application/json' }
        );

        setModal({ title: 'Berhasil!', message: responseData.message, onConfirm: null });

        const updatedData = await sendRequest(`${import.meta.env.VITE_BACKEND_URL}/academicYears?populate=teachingGroupYears`);
        setData(updatedData);
      } catch (err) { }
    };

    setModal({
      title: `Konfirmasi Aktivasi`,
      message: `Aktivasi tahun ajaran ${academicYearFormatter(academicYearName)}?`,
      onConfirm: confirmRegister,
    });
    setModalIsOpen(true);
  };

  const startMunaqasyahHandler = (academicYearName, academicYearId) => {
    const confirmStart = async () => {
      const body = JSON.stringify({ isMunaqasyahActive: true })
      try {
        const responseData = await sendRequest(
          `${import.meta.env.VITE_BACKEND_URL}/academicYears/start/${academicYearId}/munaqasyah`,
          'PATCH',
          body,
          { 'Content-Type': 'application/json' }
        );

        setModal({ title: 'Berhasil!', message: responseData.message, onConfirm: null });

        const updatedData = await sendRequest(`${import.meta.env.VITE_BACKEND_URL}/academicYears?populate=teachingGroupYears`);
        setData(updatedData);
      } catch (err) { }
    };

    setModal({
      title: `Konfirmasi`,
      message: `Mulai munaqosah untuk tahun ajaran ${academicYearFormatter(academicYearName)}?`,
      onConfirm: confirmStart
    });
    setModalIsOpen(true);
  };

  const deleteAcademicYearHandler = (academicYearName, academicYearId) => {
    const confirmDelete = async () => {
      try {
        const responseData = await sendRequest(
          `${import.meta.env.VITE_BACKEND_URL}/academicYears/${academicYearId}`,
          'DELETE',
          JSON.stringify({ academicYearId }),
          { 'Content-Type': 'application/json' }
        );

        setModal({ title: 'Berhasil!', message: responseData.message, onConfirm: null });

        const updatedData = await sendRequest(`${import.meta.env.VITE_BACKEND_URL}/academicYears?populate=teachingGroupYears`);
        setData(updatedData);
      } catch (err) {
        setModal({ title: 'Gagal!', message: err.message, onConfirm: null });
      }
      setModalIsOpen(true);
    };

    setModal({
      title: `Konfirmasi Penghapusan`,
      message: `Hapus Tahun Ajaran: ${academicYearFormatter(academicYearName)}?`,
      onConfirm: confirmDelete,
    });
    setModalIsOpen(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8 md:p-8">
      <div className="max-w-6xl mx-auto">
        <Modal
          isOpen={modalIsOpen}
          onClose={() => setModalIsOpen(false)}
          title={modal.title}
          footer={
            <ModalFooter
              onClose={() => setModalIsOpen(false)}
              onConfirm={modal.onConfirm}
            />
          }
        >
          {isLoading && (
            <div className="flex justify-center mt-16">
              <SkeletonLoader variant="rectangular" width="100%" height={100} />
            </div>
          )}
          {!isLoading && modal.message}
        </Modal>

        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">Daftar Tahun Ajaran</h1>
          <Link to="/settings/academic/new">
            <button className="inline-flex items-center px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md transition-colors duration-200">
              <PlusIcon className="w-4 h-4 mr-2" />
              Tambah
            </button>
          </Link>
        </div>

        {(!data || isLoading) && (
          <div className="space-y-4">
            <SkeletonLoader variant="rectangular" width="100%" height={140} count={3} />
          </div>
        )}

        {error && <ErrorCard error={error} />}

        {data && !isLoading && (
          <AcademicYearList
            years={data.academicYears}
            expandedCards={expandedCards}
            onToggleCard={toggleCard}
            onActivateYear={activateYearHandler}
            onStartMunaqasyah={startMunaqasyahHandler}
            onDeleteYear={deleteAcademicYearHandler}
          />
        )}
      </div>
    </div>
  );
};

export default AcademicYearsView;