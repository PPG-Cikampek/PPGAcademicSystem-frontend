export const attendanceCount = (classData) => {
    const attendances = classData.attendances;

    const uniqueDates = new Set();
    attendances.forEach(attendance => {
        uniqueDates.add(attendance.forDate);
    });

    return uniqueDates.size;
};