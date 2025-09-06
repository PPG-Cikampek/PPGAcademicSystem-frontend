export const getMonday = (date = new Date()) => {
    const d = new Date(date);
    if (Number.isNaN(d.getTime())) return null;
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
    return new Date(d.setDate(diff));
};