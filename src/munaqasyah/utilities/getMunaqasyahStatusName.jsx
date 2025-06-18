const getMunaqasyahStatusName = (status) => {
        const statusMap = {
            notStarted: 'Belum Dimulai',
            inProgress: 'Sedang Berlangsung',
            completed: 'Selesai',
        };
        return statusMap[status] || 'kosong';
    };

export default getMunaqasyahStatusName;