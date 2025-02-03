export const academicYearFormatter = (name) => {
    const year = name.substring(0, 4);
    const semester = name.substring(4);
    return `${year}/${parseInt(year) + 1} ${semester === '1' ? 'Ganjil' : 'Genap'}`;
};