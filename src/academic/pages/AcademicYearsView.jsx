import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import useHttp from '../../shared/hooks/http-hook';

import LoadingCircle from '../../shared/Components/UIElements/LoadingCircle';
import Modal from "../../shared/Components/UIElements/ModalBottomClose";
import { ChevronDown, PlusIcon } from 'lucide-react';
import ErrorCard from '../../shared/Components/UIElements/ErrorCard';

const formatAcademicYear = (name) => {
  const year = name.substring(0, 4);
  const semester = name.substring(4);
  return `${year}/${parseInt(year) + 1} ${semester === '1' ? 'Ganjil' : 'Genap'}`;
};

const AcademicYearsView = () => {
  const [expandedCards, setExpandedCards] = useState({});
  const [modal, setModal] = useState({ title: '', message: '', onConfirm: null });
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [data, setData] = useState();
  const { isLoading, sendRequest, error } = useHttp();

  const navigate = useNavigate()

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

  const activateYearHandler = (academicYearName, academicYearId) => (e) => {
    e.stopPropagation()
    console.log(academicYearId)
    const confirmRegister = async () => {
      const url = `${import.meta.env.VITE_BACKEND_URL}/academicYears/activate/${academicYearId}`;

      try {
        const responseData = await sendRequest(url, 'POST', null, {
          'Content-Type': 'application/json',
        });

        // Show success message
        setModal({ title: 'Berhasil!', message: responseData.message, onConfirm: null });

        // Fetch updated data
        const updatedData = await sendRequest(`${import.meta.env.VITE_BACKEND_URL}/academicYears?populate=teachingGroupYears`);
        setData(updatedData);

      } catch (err) {
        // Error is already handled by useHttp
      }
    };

    setModal({
      title: `Konfirmasi Aktivasi`,
      message: `Aktivasi tahun ajaran ${formatAcademicYear(academicYearName)}?`,
      onConfirm: confirmRegister,
    });
    setModalIsOpen(true);
  };

  const deleteAcademicYearHandler = (academicYearName, academicYearId) => {
    console.log(academicYearName)
    const confirmDelete = async () => {
      setModalIsOpen(false)
      const url = `${import.meta.env.VITE_BACKEND_URL}/academicYears/${academicYearId}`;

      console.log(url)

      const body = JSON.stringify({
        academicYearId
      });

      let responseData;
      try {
        responseData = await sendRequest(url, 'DELETE', body, {
          'Content-Type': 'application/json'
        });
        setModal({ title: 'Berhasil!', message: responseData.message, onConfirm: null });
        setModalIsOpen(true)

        const updatedData = await sendRequest(`${import.meta.env.VITE_BACKEND_URL}/academicYears?populate=teachingGroupYears`);
        setData(updatedData);

      } catch (err) {
        setModal({ title: 'Gagal!', message: err.message, onConfirm: null });
        setModalIsOpen(true)
      }
    };
    setModal({
      title: `Konfirmasi Penghapusan`,
      message: `Hapus Tahun Ajaran: ${formatAcademicYear(academicYearName)}?`,
      onConfirm: confirmDelete,
    });
    setModalIsOpen(true);
  }



  const ModalFooter = () => (
    <div className="flex gap-2 items-center">
      <button
        onClick={() => setModalIsOpen(false)}
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
    <div className="min-h-screen bg-gray-50 px-4 py-8 md:p-8">
      <div className="max-w-6xl mx-auto">
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
          <h1 className="text-2xl font-semibold text-gray-900">Daftar Tahun Ajaran</h1>
          <Link to="/settings/academic/new">
            <button className="inline-flex items-center px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md transition-colors duration-200">
              <PlusIcon className="w-4 h-4 mr-2" />
              Tambah
            </button>
          </Link>
        </div>

        {(!data || isLoading) && (
          <div className="flex justify-center mt-16">
            <LoadingCircle size={32} />
          </div>
        )}

        {error && (
          <ErrorCard error={error} />
        )}

        {data && !isLoading && (
          <>
            {data.academicYears.length === 0 && (
              <div className="bg-white rounded-md shadow-md p-6 border border-gray-200">
                <p className="text-gray-700 text-center">Belum ada tahun ajaran. <Link to="/settings/academic/new" className="text-blue-500 hover:underline">Buat baru</Link></p>

              </div>
            )}
            {data.academicYears.length > 0 && (
              <div className="flex flex-col items-stretch gap-4">
                {data.academicYears.map((year) => (
                  <div
                    key={year._id}
                    className={`bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300
                  ${year.isActive ? 'border-2 border-green-400 ring-2 ring-green-100' : 'border border-gray-200'}`}
                  >
                    <div
                      onClick={() => toggleCard(year._id)}
                      className="cursor-pointer p-6 hover:bg-gray-50 transition-colors duration-200"
                    >
                      <div className="flex justify-between items-center mb-2">
                        <h2 className="text-xl font-medium text-gray-800">
                          {formatAcademicYear(year.name)}
                        </h2>
                        <ChevronDown
                          className={`w-5 h-5 text-gray-500 transition-transform duration-200
                        ${expandedCards[year._id] ? 'transform rotate-180' : ''}`}
                        />
                      </div>

                      <div className="flex justify-between items-center text-gray-600">
                        <span>{year.teachingGroupYears.length} Kelompok terdaftar</span>
                      </div>

                      {year.isActive === true ? (
                        <div className="inline-block mt-2 px-2 py-1 text-sm text-green-600 bg-green-100 rounded">
                          Active
                        </div>
                      ) : (
                        <button className='btn-primary-outline mt-2' onClick={activateYearHandler(year.name, year._id)}>
                          Aktifkan
                        </button>
                      )}
                    </div>

                    <div
                      className={`overflow-hidden transition-all duration-300
                    ${expandedCards[year._id] ? 'max-h-96' : 'max-h-0'}`}
                    >
                      <div className="px-6 pb-6 bg-gray-50 border-t border-gray-200">
                        <h3 className="text-sm font-medium text-gray-700 mb-2 mt-4">
                          Kelompok terdaftar:
                        </h3>
                        {year.teachingGroupYears.length > 0 ? (
                          <>
                            <ul className="space-y-2">
                              {year.teachingGroupYears.map((teachingGroupYear) => (
                                <li
                                  key={teachingGroupYear._id}
                                  className="text-gray-700 bg-white p-3 rounded border border-gray-200 hover:border-gray-300 transition-colors duration-200"
                                >
                                  <div className='flex items-center gap-2'>
                                    <div>{teachingGroupYear.teachingGroupId.name} </div>
                                    <div className={`p-1 border rounded-md border-gray-300 italic ${teachingGroupYear.isActive ? 'text-green-400 border-green-400' : 'text-red-400 border-red-400'}`}>{teachingGroupYear.isActive ? 'Aktif' : 'Nonaktif'}</div>
                                  </div>
                                </li>
                              ))}
                            </ul>
                            <div className="mt-4 flex justify-end">
                              {/* <button onClick={() => navigate(`/settings/academic/${year._id}`)} className='px-2 italic text-gray-500 hover:underline hover:text-blue-500 hover:cursor-pointer'>Edit Tahun Ajaran</button> */}
                              <button onClick={() => deleteAcademicYearHandler(year.name, year.id)} className='px-2 italic text-gray-500 hover:underline hover:text-red-500 hover:cursor-pointer'>Hapus Tahun Ajaran</button>
                            </div>
                          </>
                        ) : (
                          <>
                            <p className="text-gray-400 italic">
                              Belum ada Kelompok yang mendaftarkan diri
                            </p>
                            <div className="mt-4 flex justify-end">
                              {/* <button onClick={() => navigate(`/settings/academic/${year._id}`)} className='px-2 italic text-gray-500 hover:underline hover:text-blue-500 hover:cursor-pointer'>Edit Tahun Ajaran</button> */}
                              <button onClick={() => deleteAcademicYearHandler(year.name, year.id)} className='px-2 italic text-gray-500 hover:underline hover:text-red-500 hover:cursor-pointer'>Hapus Tahun Ajaran</button>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AcademicYearsView;