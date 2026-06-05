import { generatePDFContent } from "../components/StudentReportPDF";

export const bulkGenerateRaports = async (studentRaports, onProgress, signal) => {
    const total = studentRaports.length;
    const pdfFiles = [];
    let completed = 0;
    let failed = 0;

    onProgress?.(0);

    for (let i = 0; i < total; i++) {
        if (signal?.aborted) {
            return { success: false, error: "Dibatalkan", completed, failed };
        }

        const r = studentRaports[i];
        try {
            const doc = generatePDFContent(
                r.studentName,
                r.studentScores,
                r.scoreCategories,
                r.studentNis,
                r.grade,
                r.academicYearName,
                r.branchAvgScores,
                r.isPengurus,
            );
            const blob = doc.output("blob");
            const prefix = r.isPengurus ? "Pengurus" : "OrangTua";
            const safeName = r.studentName.replace(/[/\\:*?"<>|\t]/g, " ").trim();
            const safeYear = r.academicYearName.replace(/[/\\:*?"<>|]/g, "-");
            const fileName = `Raport_${prefix}_${r.studentNis}_${safeName}_${safeYear}.pdf`;
            pdfFiles.push({ blob, fileName });
            completed++;
        } catch (err) {
            console.error(`Gagal generate raport untuk ${r.studentName}:`, err);
            failed++;
        }

        const pct = Math.round(((i + 1) / total) * 90);
        onProgress?.(pct);
    }

    if (pdfFiles.length === 0) {
        return { success: false, error: "Gagal generate semua raport", completed, failed };
    }

    if (signal?.aborted) {
        return { success: false, error: "Dibatalkan", completed, failed };
    }

    try {
        onProgress?.(95);
        const JSZip = (await import("jszip")).default;
        const zip = new JSZip();
        pdfFiles.forEach(({ blob, fileName }) => zip.file(fileName, blob));
        const zipBlob = await zip.generateAsync({ type: "blob" });
        onProgress?.(100);
        return { success: true, zipBlob, completed, failed };
    } catch (err) {
        console.error("Gagal membuat zip:", err);
        return { success: false, error: "Gagal membuat file zip", completed, failed };
    }
};

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
