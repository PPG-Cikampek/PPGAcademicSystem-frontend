import React, { useContext, useEffect, useState } from 'react'
import { GraduationCap, Users } from 'lucide-react';
import LoadingCircle from '../../shared/Components/UIElements/LoadingCircle';
import useHttp from '../../shared/hooks/http-hook';
import { AuthContext } from '../../shared/Components/Context/auth-context';
import { Link, useNavigate } from 'react-router-dom';
import { formatDate } from '../../shared/Utilities/formatDateToLocal';
import DataTable from '../../shared/Components/UIElements/DataTable';
import Modal from '../../shared/Components/UIElements/ModalBottomClose';

const RequestedAccountView = () => {
  const [tickets, setTickets] = useState()
  const [modal, setModal] = useState({ title: '', message: '', onConfirm: null });
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const { isLoading, sendRequest } = useHttp();

  const navigate = useNavigate()
  const auth = useContext(AuthContext);

  useEffect(() => {
    const url = `${import.meta.env.VITE_BACKEND_URL}/users/account-requests/`;

    console.log(url)
    const fetchTickets = async () => {
      try {
        const responseData = await sendRequest(url);
        setTickets(responseData);
        console.log(responseData)

      } catch (err) {
        // Error is handled by useHttp
      }
    };
    fetchTickets();
  }, [sendRequest]);

  const handleRespondTicket = async (ticketId, respond) => {
    const body = JSON.stringify({ ticketId, respond });
    const url = `${import.meta.env.VITE_BACKEND_URL}/users/account-requests/ticket`
    console.log(body)
    console.log(url)
    const confirmCancel = async () => {
      try {
        const responseData = await sendRequest(url, 'PATCH', body, {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + auth.token
        });
        setModal({ title: 'Berhasil!', message: responseData.message, onConfirm: null });
        setTickets((prevTickets) => ({
          ...prevTickets,
          tickets: prevTickets.tickets.filter((ticket) => ticket._id !== ticketId),
        }));
      } catch (err) {
        // Error handled by useHttp
      }
    };
    setModal({
      title: 'Peringatan!',
      message: `${respond === 'rejected' ? 'Tolak' : 'Setujui'} Tiket?`,
      onConfirm: confirmCancel,
    });
    setModalIsOpen(true);
  }

  const getStatusStyle = (type) => ({
    pending: 'bg-orange-100 text-orange-700',
    cancelled: 'bg-gray-100 text-gray-700',
    rejected: 'bg-red-100 text-red-700',
    approved: 'bg-green-100 text-green-700',
  }[type]);

  const getStatusName = (type) => ({
    pending: 'Pending',
    cancelled: 'Dibatalkan',
    rejected: 'Ditolak',
    approved: 'Disetujui',
  }[type]);

  const columns = [
    {
      key: 'ticketId',
      label: 'No. Tiket',
      sortable: true,
      render: (item) => item.ticketId.slice(0, 6)
    },
    {
      key: 'userName',
      label: 'Nama',
      sortable: true,
      render: (item) => item.userId?.name || ' Tidak Diketahui',
    },
    {
      key: 'subBranchName',
      label: 'Kelompok',
      sortable: true,
      render: (item) => item.subBranchId?.name || ' Tidak Diketahui',
    },
    {
      key: 'createdTime',
      label: 'Tanggal',
      sortable: true,
      render: (item) => formatDate(item.createdTime)
    },
    {
      key: 'accountList',
      label: 'Jumlah Akun',
      sortable: true,
      render: (item) => item.accountList.length
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (item) => (
        <span className={`px-2 py-1 rounded-full text-sm ${getStatusStyle(item.status)}`}>
          {getStatusName(item.status)}
        </span>
      )
    },
    {
      key: 'actions',
      label: 'Aksi',
      render: (item) => (
        <div className="flex gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleRespondTicket(item.ticketId, 'approved');
            }}
            className="btn-primary-outline m-0"
          >
            Setujui
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleRespondTicket(item.ticketId, 'rejected');
            }}
            className="btn-danger-outline m-0"
          >
            Tolak
          </button>
        </div>
      )
    }
  ];

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

  return (
    <div className="min-h-screen px-4 py-8 md:p-8">
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

      <h2 className='text-xl font-bold mb-4'>Daftar Permintaan Akun</h2>
      <div className='max-w-6xl mx-auto'>
        {tickets && (
          <DataTable
            data={tickets.tickets}
            columns={columns}
            onRowClick={(item) => navigate(`/settings/requestAccount/ticket/${item.ticketId}`)}
            searchableColumns={['ticketId', 'status']}
            isLoading={isLoading}
            initialSort={{ key: 'createdTime', direction: 'descending' }}
            tableId="requestAccount-table" // <-- Add unique tableId
          />
        )}
      </div>

    </div>
  )
}

export default RequestedAccountView