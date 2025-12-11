import { pdf } from "@react-pdf/renderer";
import { createElement } from "react";
import IDCardDocument from "../id-card/IDCardDocument";

/**
 * Convert an image URL to base64 data URL
 * @param {string} imageUrl - The URL of the image to convert
 * @returns {Promise<string|null>} - Base64 data URL or null if failed
 */
const imageToBase64 = async (imageUrl) => {
    try {
        const response = await fetch(imageUrl);
        const blob = await response.blob();
        return await new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = () => resolve(null);
            reader.readAsDataURL(blob);
        });
    } catch (error) {
        console.warn("Failed to convert image to base64:", error);
        return null;
    }
};

/**
 * Generate QR code as data URL using canvas
 * @param {string} value - The value to encode in the QR code
 * @returns {Promise<string|null>} - QR code data URL or null if failed
 */
const generateQRCode = async (value) => {
    try {
        // Use QRCode library via dynamic import to avoid bundling issues
        const QRCode = (await import("qrcode")).default;
        return await QRCode.toDataURL(value, {
            width: 256,
            margin: 1,
            errorCorrectionLevel: "H",
        });
    } catch (error) {
        console.warn("Failed to generate QR code:", error);
        return null;
    }
};

/**
 * Prepare student data for PDF generation
 * @param {Object} student - The raw student data
 * @param {boolean} useHighQuality - Whether to use high quality (actual image) or low quality (thumbnail)
 * @returns {Promise<Object>} - Prepared student data for PDF
 */
const prepareStudentForPdf = async (student, useHighQuality = true) => {
    // Get student image based on quality preference
    let imageDataUrl = null;
    if (useHighQuality && student.image) {
        // High quality: use actual image
        const imageUrl = `${import.meta.env.VITE_BACKEND_URL}/${student.image}`;
        imageDataUrl = await imageToBase64(imageUrl);
    } else if (!useHighQuality && student.thumbnail) {
        // Low quality: use thumbnail
        const thumbnailUrl = student.thumbnail;
        imageDataUrl = await imageToBase64(thumbnailUrl);
    } else if (student.image) {
        // Fallback: if thumbnail doesn't exist but image does, use image
        const imageUrl = `${import.meta.env.VITE_BACKEND_URL}/${student.image}`;
        imageDataUrl = await imageToBase64(imageUrl);
    }
    
    // Fallback to placeholder if no image
    if (!imageDataUrl) {
        imageDataUrl = await imageToBase64(
            "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png?20150327203541"
        );
    }

    // Generate QR code using NIS
    const qrDataUrl = await generateQRCode(student.nis || "");

    return {
        name: student.name || "",
        nis: student.nis || "",
        image: imageDataUrl,
        qrCode: qrDataUrl,
    };
};

/**
 * Generate a single ID card PDF blob
 * @param {Object} student - The student data
 * @param {boolean} useHighQuality - Whether to use high quality images
 * @returns {Promise<Blob>} - PDF blob
 */
const generateSingleIdCard = async (student, useHighQuality = true) => {
    const preparedStudent = await prepareStudentForPdf(student, useHighQuality);
    const doc = createElement(IDCardDocument, { student: preparedStudent });
    const pdfInstance = pdf([]);
    pdfInstance.updateContainer(doc);
    return await pdfInstance.toBlob();
};

/**
 * Combine multiple PDF blobs into a single downloadable file
 * Uses a simple approach of downloading individual files in a zip
 * @param {Array<{blob: Blob, fileName: string}>} pdfFiles - Array of PDF blobs with filenames
 * @returns {Promise<Blob>} - Combined zip blob
 */
const createZipFromBlobs = async (pdfFiles) => {
    // Dynamic import JSZip for code splitting
    const JSZip = (await import("jszip")).default;
    const zip = new JSZip();

    pdfFiles.forEach(({ blob, fileName }) => {
        zip.file(fileName, blob);
    });

    return await zip.generateAsync({ type: "blob" });
};

/**
 * Bulk generate ID cards for multiple students with progress tracking
 * @param {Array<Object>} students - Array of student data
 * @param {Function} onProgress - Callback for progress updates (0-100)
 * @param {AbortSignal} signal - Optional abort signal for cancellation
 * @param {boolean} useHighQuality - Whether to use high quality images (default: true)
 * @returns {Promise<{success: boolean, zipBlob?: Blob, error?: string, completed: number, failed: number}>}
 */
export const bulkGenerateIdCards = async (students, onProgress, signal, useHighQuality = true) => {
    if (!students || students.length === 0) {
        return { success: false, error: "No students selected", completed: 0, failed: 0 };
    }

    const pdfFiles = [];
    let completed = 0;
    let failed = 0;
    const total = students.length;

    // Report initial progress
    onProgress?.(0);

    for (let i = 0; i < students.length; i++) {
        // Check for cancellation
        if (signal?.aborted) {
            return {
                success: false,
                error: "Generation cancelled",
                completed,
                failed,
            };
        }

        const student = students[i];

        try {
            const blob = await generateSingleIdCard(student, useHighQuality);
            const fileName = `IDCard_${student.name?.replace(/\s+/g, "_") || "Unknown"}_${student.nis || i + 1}.pdf`;
            pdfFiles.push({ blob, fileName });
            completed++;
        } catch (error) {
            console.error(`Failed to generate ID card for student ${student.name}:`, error);
            failed++;
        }

        // Report progress (generation is 90% of the work, zipping is 10%)
        const progressPercent = Math.round(((i + 1) / total) * 90);
        onProgress?.(progressPercent);
    }

    if (pdfFiles.length === 0) {
        return {
            success: false,
            error: "Failed to generate any ID cards",
            completed,
            failed,
        };
    }

    // Check for cancellation before zipping
    if (signal?.aborted) {
        return {
            success: false,
            error: "Generation cancelled",
            completed,
            failed,
        };
    }

    try {
        onProgress?.(95);
        const zipBlob = await createZipFromBlobs(pdfFiles);
        onProgress?.(100);

        return {
            success: true,
            zipBlob,
            completed,
            failed,
        };
    } catch (error) {
        console.error("Failed to create zip file:", error);
        return {
            success: false,
            error: "Failed to create zip file",
            completed,
            failed,
        };
    }
};

/**
 * Download a blob as a file
 * @param {Blob} blob - The blob to download
 * @param {string} fileName - The filename for the download
 */
export const downloadBlob = (blob, fileName) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
};

export default bulkGenerateIdCards;
