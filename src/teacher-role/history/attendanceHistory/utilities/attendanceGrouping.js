export const groupAttendancesByDate = (attendances) => {
    return attendances?.reduce((acc, curr) => {
        const date = new Date(curr.forDate).toLocaleDateString("id-ID", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
        });
        acc[date] = acc[date] || [];
        acc[date].push(curr);
        return acc;
    }, {});
};
