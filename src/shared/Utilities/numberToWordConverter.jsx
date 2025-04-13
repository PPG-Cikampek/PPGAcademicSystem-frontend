export default function IndonesianNumberConverter(inputNum) {
    const convertToTitleCase = (num) => {
        // Validate input
        if (isNaN(num) || num < 0 || num > 999 || !Number.isInteger(Number(num))) {
            return { error: 'Please enter a valid integer between 0-999', result: '' };
        }

        // Map numbers to Indonesian words
        const ones = ['', 'satu', 'dua', 'tiga', 'empat', 'lima', 'enam', 'tujuh', 'delapan', 'sembilan'];
        const teens = ['sepuluh', 'sebelas', 'dua belas', 'tiga belas', 'empat belas', 'lima belas',
            'enam belas', 'tujuh belas', 'delapan belas', 'sembilan belas'];
        const tens = ['', 'sepuluh', 'dua puluh', 'tiga puluh', 'empat puluh', 'lima puluh',
            'enam puluh', 'tujuh puluh', 'delapan puluh', 'sembilan puluh'];

        // Special case for 0
        if (num === 0 || num === '0') {
            return { error: '', result: 'Nol' };
        }

        let words = '';
        const numStr = num.toString();

        // Handle hundreds
        if (numStr.length === 3) {
            if (numStr[0] === '1') {
                words += 'seratus ';
            } else {
                words += ones[numStr[0]] + ' ratus ';
            }
        }

        // Handle tens and ones
        const lastTwoDigits = parseInt(numStr.slice(-2));

        if (lastTwoDigits < 10) {
            words += ones[lastTwoDigits];
        } else if (lastTwoDigits < 20) {
            words += teens[lastTwoDigits - 10];
        } else {
            const tensDigit = Math.floor(lastTwoDigits / 10);
            const onesDigit = lastTwoDigits % 10;

            words += tens[tensDigit];
            if (onesDigit > 0) {
                words += ' ' + ones[onesDigit];
            }
        }

        // Convert to title case
        const titleCase = words
            .trim()
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(' ');

        return { error: '', result: titleCase };
    };

    const { error, result } = convertToTitleCase(inputNum);

    return error || result
}