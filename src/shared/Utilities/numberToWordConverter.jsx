export default function IndonesianNumberConverter(inputNum) {
    const convertToTitleCase = (num) => {
        // Validate input
        if (isNaN(num) || num < 0 || num > 9999 || !Number.isInteger(Number(num))) {
            return { error: 'Please enter a valid integer between 0-9999', result: '' };
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
        let n = parseInt(numStr, 10);

        // Handle thousands
        if (n >= 1000) {
            const thousands = Math.floor(n / 1000);
            if (thousands === 1) {
                words += 'seribu ';
            } else {
                words += ones[thousands] + ' ribu ';
            }
            n = n % 1000;
        }

        // Handle hundreds
        if (n >= 100) {
            const hundreds = Math.floor(n / 100);
            if (hundreds === 1) {
                words += 'seratus ';
            } else {
                words += ones[hundreds] + ' ratus ';
            }
            n = n % 100;
        }

        // Handle tens and ones
        if (n < 10) {
            words += ones[n];
        } else if (n < 20) {
            words += teens[n - 10];
        } else {
            const tensDigit = Math.floor(n / 10);
            const onesDigit = n % 10;
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

    return error || result;
}