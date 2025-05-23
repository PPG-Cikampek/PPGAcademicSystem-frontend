const getTeacherPositionName = (position) => {
    const positionMap = {
        branchTeacher: 'MT Desa',
        teachingGroupTeacher: 'MT Kelompok',
        localTeacher: 'MS',
        assistant: 'Asisten',
        munaqisy: 'Munaqis'
    };
    return positionMap[position] || '-';
};

export default getTeacherPositionName;