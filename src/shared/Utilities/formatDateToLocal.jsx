export const formatDate = (date, withTime = false ) => {
    if (!(date instanceof Date)) {
        date = new Date(date);
    }
    return date.toLocaleDateString('id-ID', {
        weekday: 'long',
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        ...(withTime && {
            hour: '2-digit',
            minute: '2-digit',
        }),
        timeZone: 'Asia/Jakarta'
    });
};