/**
 * Bug Report Validation Utility
 * Follows the pattern from formValidation.js
 */

export const SEVERITY_LEVELS = ['low', 'medium', 'high', 'critical'];
export const CATEGORIES = ['ui', 'data', 'performance', 'security', 'other'];

export const SEVERITY_LABELS = {
    low: 'Rendah',
    medium: 'Sedang',
    high: 'Tinggi',
    critical: 'Kritis'
};

export const CATEGORY_LABELS = {
    ui: 'Antarmuka (UI)',
    data: 'Data',
    performance: 'Performa',
    security: 'Keamanan',
    other: 'Lainnya'
};

export const STATUS_LABELS = {
    pending: 'Menunggu',
    reviewing: 'Sedang Ditinjau',
    accepted: 'Diterima',
    rejected: 'Ditolak',
    fixed: 'Diperbaiki'
};

export const REJECTION_REASONS = [
    { value: 'already_reported', label: 'Sudah dilaporkan sebelumnya' },
    { value: 'cannot_reproduce', label: 'Tidak dapat direproduksi' },
    { value: 'not_a_bug', label: 'Bukan bug (perilaku yang diinginkan)' },
    { value: 'duplicate', label: 'Duplikat dari laporan lain' },
    { value: 'out_of_scope', label: 'Di luar cakupan' },
    { value: 'other', label: 'Lainnya' }
];

export const errorMessages = {
    required: 'Field ini wajib diisi.',
    titleTooLong: 'Judul maksimal 100 karakter.',
    descriptionTooLong: 'Deskripsi maksimal 2000 karakter.',
    invalidSeverity: 'Tingkat keparahan tidak valid.',
    invalidCategory: 'Kategori tidak valid.',
    tooManyScreenshots: 'Maksimal 3 screenshot.',
    fileTooLarge: 'Ukuran file maksimal 10MB.'
};

/**
 * Sanitize string input
 */
export const sanitizeInput = (value) => {
    if (typeof value === 'string') {
        return value.trim();
    }
    return value;
};

/**
 * Helper to construct result object
 */
const withResult = (values, errors) => ({
    isValid: Object.keys(errors).length === 0,
    errors,
    values
});

/**
 * Validate bug report form input
 * @param {Object} input - { title, description, severity, category }
 * @returns {Object} { isValid, errors, values }
 */
export const validateBugReport = (input = {}) => {
    const errors = {};

    const title = sanitizeInput(input.title);
    const description = sanitizeInput(input.description);
    const severity = sanitizeInput(input.severity)?.toLowerCase();
    const category = sanitizeInput(input.category)?.toLowerCase();

    // Validate title
    if (!title) {
        errors.title = errorMessages.required;
    } else if (title.length > 100) {
        errors.title = errorMessages.titleTooLong;
    }

    // Validate description
    if (!description) {
        errors.description = errorMessages.required;
    } else if (description.length > 2000) {
        errors.description = errorMessages.descriptionTooLong;
    }

    // Validate severity
    if (!severity) {
        errors.severity = errorMessages.required;
    } else if (!SEVERITY_LEVELS.includes(severity)) {
        errors.severity = errorMessages.invalidSeverity;
    }

    // Validate category (optional)
    if (category && !CATEGORIES.includes(category)) {
        errors.category = errorMessages.invalidCategory;
    }

    return withResult(
        {
            title,
            description,
            severity,
            category: category || 'other'
        },
        errors
    );
};

/**
 * Validate screenshot files
 * @param {FileList|Array} files - The files to validate
 * @returns {Object} { isValid, errors }
 */
export const validateScreenshots = (files) => {
    const errors = {};
    const MAX_FILES = 3;
    const MAX_SIZE = 10 * 1024 * 1024; // 10MB
    const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/jpg'];

    if (!files || files.length === 0) {
        return { isValid: true, errors: {} };
    }

    if (files.length > MAX_FILES) {
        errors.screenshots = errorMessages.tooManyScreenshots;
        return { isValid: false, errors };
    }

    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        if (file.size > MAX_SIZE) {
            errors.screenshots = errorMessages.fileTooLarge;
            break;
        }

        if (!ALLOWED_TYPES.includes(file.type)) {
            errors.screenshots = 'Hanya file PNG atau JPG yang diizinkan.';
            break;
        }
    }

    return {
        isValid: Object.keys(errors).length === 0,
        errors
    };
};
