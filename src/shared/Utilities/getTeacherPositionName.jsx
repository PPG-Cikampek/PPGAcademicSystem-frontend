const getTeacherPositionName = (position) => {
    const positionMap = {
        branchTeacher: 'MT Desa',
        subBranchTeacher: 'MT Kelompok',
        localTeacher: 'MS',
        assistant: 'Asisten',
        munaqisy: 'Munaqis'
    };
    return positionMap[position] || '-';
};

export default getTeacherPositionName;