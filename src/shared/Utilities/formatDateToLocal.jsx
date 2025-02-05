export const formatDate = (date) => {
    if (!(date instanceof Date)) {
        date = new Date(date);
    }
    return date.toLocaleDateString('id-ID', {
        weekday: 'long',
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        timeZone: 'Asia/Jakarta'
    });
};