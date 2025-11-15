const FEATURE_STATUSES = [
    "planned",
    "in-progress",
    "completed",
    "deprecated",
];

const ANNOUNCEMENT_TYPES = [
    "maintenance",
    "beta",
    "info",
    "warning",
];

export const errorMessages = {
    required: "Field ini wajib diisi.",
    invalidDate: "Tanggal tidak valid.",
    invalidStatus: "Status tidak valid.",
    invalidType: "Tipe tidak valid.",
};

export const sanitizeInput = (value) => {
    if (typeof value === "string") {
        return value.trim();
    }

    if (Array.isArray(value)) {
        return value.map((item) => sanitizeInput(item)).filter(Boolean);
    }

    return value;
};

export const parseTags = (value) => {
    if (!value) {
        return [];
    }

    if (Array.isArray(value)) {
        return sanitizeInput(value);
    }

    return value
        .split(/[,\n]/)
        .map((item) => item.trim())
        .filter(Boolean);
};

const withResult = (values, errors) => ({
    isValid: Object.keys(errors).length === 0,
    errors,
    values,
});

export const validateFeature = (input = {}) => {
    const errors = {};

    const title = sanitizeInput(input.title);
    const description = sanitizeInput(input.description);
    const status = sanitizeInput(input.status)?.toLowerCase();
    const eta = sanitizeInput(input.eta);
    const tags = parseTags(input.tags);

    if (!title) {
        errors.title = errorMessages.required;
    }

    if (!description) {
        errors.description = errorMessages.required;
    }

    if (!status || !FEATURE_STATUSES.includes(status)) {
        errors.status = errorMessages.invalidStatus;
    }

    if (eta) {
        const parsedDate = new Date(eta);
        if (Number.isNaN(parsedDate.getTime())) {
            errors.eta = errorMessages.invalidDate;
        }
    }

    const values = {
        title,
        description,
        status,
        eta: eta || "",
        tags,
    };

    return withResult(values, errors);
};

export const validateRelease = (input = {}) => {
    const errors = {};

    const version = sanitizeInput(input.version) || sanitizeInput(input.id);
    const id = version;
    const date = sanitizeInput(input.date);
    const highlights = Array.isArray(input.highlights)
        ? sanitizeInput(input.highlights)
        : sanitizeInput(input.highlightsText)?.length
        ? sanitizeInput(input.highlightsText)
              .split(/\n/)
              .map((item) => item.trim())
              .filter(Boolean)
        : parseTags(input.highlights);

    if (!version) {
        errors.version = errorMessages.required;
    }

    if (!date) {
        errors.date = errorMessages.required;
    } else {
        const parsedDate = new Date(date);
        if (Number.isNaN(parsedDate.getTime())) {
            errors.date = errorMessages.invalidDate;
        }
    }

    if (!highlights || highlights.length === 0) {
        errors.highlights = errorMessages.required;
    }

    const values = {
        id,
        version,
        date,
        highlights,
    };

    return withResult(values, errors);
};

export const validateAnnouncement = (input = {}) => {
    const errors = {};

    const id = sanitizeInput(input.id);
    const title = sanitizeInput(input.title);
    const body = sanitizeInput(input.body);
    const type = sanitizeInput(input.type)?.toLowerCase();
    const publishedAt = sanitizeInput(input.publishedAt);

    if (!id) {
        errors.id = errorMessages.required;
    }

    if (!title) {
        errors.title = errorMessages.required;
    }

    if (!body) {
        errors.body = errorMessages.required;
    }

    if (!type || !ANNOUNCEMENT_TYPES.includes(type)) {
        errors.type = errorMessages.invalidType;
    }

    if (!publishedAt) {
        errors.publishedAt = errorMessages.required;
    } else {
        const parsedDate = new Date(publishedAt);
        if (Number.isNaN(parsedDate.getTime())) {
            errors.publishedAt = errorMessages.invalidDate;
        }
    }

    const values = {
        id,
        title,
        body,
        type,
        publishedAt,
    };

    return withResult(values, errors);
};

export const isoStringFromLocalInput = (value) => {
    if (!value) {
        return "";
    }

    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
        return "";
    }

    return parsed.toISOString();
};

export const localInputFromIso = (value) => {
    if (!value) {
        return "";
    }

    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
        return "";
    }

    const pad = (num) => num.toString().padStart(2, "0");

    const year = parsed.getFullYear();
    const month = pad(parsed.getMonth() + 1);
    const day = pad(parsed.getDate());
    const hours = pad(parsed.getHours());
    const minutes = pad(parsed.getMinutes());

    return `${year}-${month}-${day}T${hours}:${minutes}`;
};
