const getUserRoleTitle = (role) => {
    const roleMap = {
        admin: 'Admin Daerah',
        branchAdmin: 'PJP Desa',
        subBranchAdmin: 'PJP Kelompok',
        teacher: 'Guru',
        student: 'Siswa',
        curriculum: 'Tim Kurikulum',
        munaqisy: 'Munaqis'
    };
    return roleMap[role] || 'Unknown Role';
};

export default getUserRoleTitle;