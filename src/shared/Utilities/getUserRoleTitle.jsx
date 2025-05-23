const getUserRoleTitle = (role) => {
    const roleMap = {
        admin: 'Admin Daerah',
        teachingGroupAdmin: 'Admin Kelompok',
        teacher: 'Guru',
        student: 'Siswa',
        curriculum: 'Tim Kurikulum',
        munaqisy: 'Munaqis'
    };
    return roleMap[role] || 'Unknown Role';
};

export default getUserRoleTitle;