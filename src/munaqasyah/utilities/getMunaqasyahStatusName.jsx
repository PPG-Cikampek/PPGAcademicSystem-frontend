const getMunaqasyahStatusName = (status) => {
        const statusMap = {
            notStarted: 'Belum Dimulai',
            inProgress: 'Sedang Berlangsung',
            deferredInProgress: 'Sedang Berlangsung (Susulan)',
            completed: 'Selesai',
            deferredCompleted: 'Susulan Selesai',
        };
        return statusMap[status] || 'Tidak Diketahui';
    };

export default getMunaqasyahStatusName;