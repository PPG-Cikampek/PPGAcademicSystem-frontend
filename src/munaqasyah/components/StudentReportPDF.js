import jsPDF from 'jspdf';
import { applyPlugin } from 'jspdf-autotable';

import IndonesianNumberConverter from '../../shared/Utilities/numberToWordConverter';
import { academicYearFormatter } from '../../shared/Utilities/academicYearFormatter';
import logo from '../../assets/logos/ppgcikampek.png';
import logoHD from '../../assets/logos/ppgcikampek - ori.png';

applyPlugin(jsPDF);

/**
 * Generates a jsPDF document for a student's report.
 * @param {string} studentName
 * @param {string} studentNis
 * @param {string} grade
 * @param {string} academicYearName
 * @param {object} studentScores
 * @param {Array} scoreCategories
 * @returns {jsPDF}
 */
export function generatePDFContent(studentName, studentScores, scoreCategories, studentNis, grade, academicYearName, branchAvgScores) {
    const doc = new jsPDF({});

    console.log(branchAvgScores)

    // Add semi-transparent large logo as background watermark
    const pageWidth = doc.internal.pageSize.width || doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.height || doc.internal.pageSize.getHeight();
    const watermarkWidth = pageWidth * 0.6; // 70% of page width
    const watermarkHeight = watermarkWidth * 0.95; // keep aspect ratio, adjust as needed
    const watermarkX = (pageWidth - watermarkWidth) / 2;
    const watermarkY = (pageHeight - watermarkHeight) / 2;
    if (logo) {
        try {
            if (doc.setGState) {
                doc.setGState(new doc.GState({ opacity: 0.05 }));
                doc.addImage(logoHD, 'WEBP', watermarkX, watermarkY, watermarkWidth, watermarkHeight);
                doc.setGState(new doc.GState({ opacity: 1 }));
            } else if (doc.setFillAlpha) {
                doc.setFillAlpha(0.08);
                doc.addImage(logoHD, 'WEBP', watermarkX, watermarkY, watermarkWidth, watermarkHeight);
                doc.setFillAlpha(1);
            } else if (doc.setAlpha) {
                doc.setAlpha(0.08);
                doc.addImage(logoHD, 'WEBP', watermarkX, watermarkY, watermarkWidth, watermarkHeight);
                doc.setAlpha(1);
            } else {
                doc.addImage(logoHD, 'WEBP', watermarkX, watermarkY, watermarkWidth, watermarkHeight);
            }
        } catch (e) {
            // Fallback: ignore if logo fails to load
        }
    }

    console.log('Generating PDF for:', studentName);
    console.log('Academic Year:', academicYearName);
    console.log('Grade:', grade);
    console.log('Student NIS:', studentNis);

    // Layout variables
    const marginLeft = 16;
    const marginRight = 20;
    const marginTop = 16;
    const lineSpacing = 5;
    let currentY = marginTop;

    // Add logo to the left of the header
    const logoWidth = 14; // Adjust as needed
    const logoHeight = 14; // Adjust as needed
    const logoY = currentY - 8; // Vertically align with header text
    const logoX = marginLeft;
    if (logo) {
        try {
            doc.addImage(logo, 'WEBP', logoX, logoY, logoWidth, logoHeight);
        } catch (e) {
            // Fallback: ignore if logo fails to load
        }
    }

    // Adjust header X to leave space for logo
    const headerX = pageWidth / 2 + logoWidth / 2;
    doc.setFont("Helvetica", "normal");
    doc.setFontSize(12);
    doc.text("LAPORAN PENILAIAN HASIL BELAJAR SISWA", headerX, currentY, {
        align: "center"
    });

    currentY += 4;
    doc.setFont("Helvetica", "normal");
    doc.setFontSize(11);
    currentY += lineSpacing + 4;
    doc.text(`Nama Siswa`, marginLeft, currentY);
    doc.text(`: ${studentName}`, marginLeft + 25, currentY);

    currentY += lineSpacing;
    doc.text("Nomor Induk", marginLeft, currentY);
    doc.text(`: ${studentNis}`, marginLeft + 25, currentY);

    // Right column for Kelas/Semester and Tahun Pelajaran
    const rightColX = pageWidth - marginRight - 60;
    currentY = marginTop + lineSpacing + 8;
    doc.text("Kelas", rightColX + 5, currentY);
    doc.text(`: ${grade}`, rightColX + 30, currentY);

    currentY += lineSpacing;
    doc.text("Tahun Ajaran", rightColX + 5, currentY);
    doc.text(`: ${academicYearFormatter(academicYearName)}`, rightColX + 30, currentY);

    // Table for scores
    currentY += lineSpacing;
    const tableData = scoreCategories.map((category, index) => {
        const score = studentScores[category.key]?.score;
        const isNull = score === null || score === undefined;
        // Get branch/class average for this category
        let branchAvg = branchAvgScores && branchAvgScores[category.key] !== undefined && branchAvgScores[category.key] !== 0
            ? branchAvgScores[category.key]
            : '-';
        if (typeof branchAvg === 'number' && branchAvg < 60) branchAvg = 60;
        return [
            index + 1,
            category.label,
            (isNull || score === 0) ? '-' : score,
            isNull ? '-' : IndonesianNumberConverter(score),
            branchAvg // Rata-rata Kelas (Angka)
        ];
    });

    const totalScore = scoreCategories.reduce((total, category) => {
        const score = studentScores[category.key]?.score;
        return score !== null && score !== undefined ? total + score : total;
    }, 0);

    console.log('Total Score:', totalScore);

    console.log(tableData)

    doc.setFontSize(11);
    doc.autoTable({
        theme: 'grid',
        head: [
            [
                { content: 'No', rowSpan: 2, styles: { valign: 'middle', halign: 'center', fillColor: false } },
                { content: 'Mata Pelajaran', rowSpan: 2, styles: { valign: 'middle', halign: 'center', fillColor: false } },
                { content: 'Nilai Prestasi', colSpan: 2, styles: { valign: 'middle', halign: 'center', fillColor: false } },
                { content: 'Rata-rata Kelas', styles: { valign: 'middle', halign: 'center', fillColor: false } }
            ],
            [
                { content: 'Angka', styles: { valign: 'middle', halign: 'center', fillColor: false } },
                { content: 'Huruf', styles: { valign: 'middle', halign: 'center', fillColor: false } },
                { content: 'Angka', styles: { valign: 'middle', halign: 'center', fillColor: false } },
            ]
        ],
        body: tableData.map(row => [
            row[0], // No
            row[1], // Mata Pelajaran
            row[2], // Angka
            row[3], // Huruf
            row[4]  // Rata-rata Kelas (Angka)
        ]),
        startY: currentY,
        margin: { left: marginLeft, right: marginRight },
        headStyles: {
            textColor: [0, 0, 0],
            fillColor: false, // transparent
            lineColor: 0,
            lineWidth: 0.001,
            fontStyle: 'bold',
        },
        styles: {
            lineColor: 0,
            lineWidth: 0.001,
            cellPadding: 1.25,
            fillColor: false // transparent
        },
        zebra: false, // disable zebra striping for full transparency
        columnStyles: {
            0: { cellWidth: 10, halign: 'center', valign: 'middle' },
            1: { cellWidth: 70 },
            2: { cellWidth: 17, halign: 'center', valign: 'middle' },
            3: { cellWidth: 63, halign: 'center', valign: 'middle' },
            4: { cellWidth: 20, halign: 'center', valign: 'middle' }
        }
    });

    currentY = doc.lastAutoTable.finalY;

    const totalBranchAvg = branchAvgScores
        ? Object.values(branchAvgScores).reduce((sum, val) => typeof val === 'number' ? sum + val : sum, 0)
        : '-';

    doc.autoTable({
        theme: 'grid',
        head: [], // No headers
        body: [
            [{ content: 'Jumlah ', colSpan: 2, styles: { halign: 'right', valign: 'middle' } }, totalScore, { content: IndonesianNumberConverter(totalScore), colSpan: 2 }],
            [
                { content: 'Peringkat ', colSpan: 2, styles: { halign: 'right', valign: 'middle' } },
                { content: `   ${studentScores.studentRank} dari ${studentScores.studentTotal} siswa ${grade} se-desa.`, colSpan: 3, styles: { halign: 'left', valign: 'middle' } }

            ]
        ],
        startY: currentY,
        margin: { left: marginLeft, right: marginRight },
        tableWidth: pageWidth - marginLeft - marginRight,
        styles: {
            lineColor: 0,
            lineWidth: 0.001,
            cellPadding: 1.25,
            fillColor: false // transparent
        },
        columnStyles: {
            0: { cellWidth: 10, halign: 'center', valign: 'middle' },
            1: { cellWidth: 70 },
            2: { cellWidth: 17, halign: 'center', valign: 'middle' },
            3: { cellWidth: 63, halign: 'center', valign: 'middle' },
            4: { cellWidth: 20, halign: 'center', valign: 'middle' }
        }
    });



    currentY = doc.lastAutoTable.finalY + 8;

    // Section: Laporan Perkembangan Individu Siswa
    doc.setFont("Helvetica", "normal");
    doc.setFontSize(12);
    doc.text("LAPORAN PERKEMBANGAN INDIVIDU SISWA", pageWidth / 2, currentY, {
        align: "center"
    });
    currentY += lineSpacing;

    // Left table: Kepribadian
    doc.autoTable({
        theme: 'grid',
        head: [['No', 'Kepribadian', 'Prediksi']],
        body: [
            ['1', 'Kedisiplinan', ''],
            ['2', 'Sopan Santun', ''],
            ['3', 'Kerapihan', ''],
            ['4', 'Kebersihan', ''],
            ['5', 'Kerajinan', ''],
        ],
        startY: currentY,
        margin: { left: marginLeft, right: 2 },
        tableWidth: (pageWidth / 2) - marginLeft - 10,
        headStyles: {
            textColor: [0, 0, 0],
            // fillColor: [255, 255, 255],
            lineColor: 0,
            lineWidth: 0.001,
            fontStyle: 'bold',
            halign: 'center',
            valign: 'middle',
            fillColor: false // transparent
        },
        styles: {
            lineColor: 0,
            lineWidth: 0.001,
            cellPadding: 1.25,
            fillColor: false // transparent
        },
        columnStyles: {
            0: { cellWidth: 10, halign: 'center', valign: 'middle' },
            1: { cellWidth: 40 },
            2: { cellWidth: 33, halign: 'center', valign: 'middle' },
        }
    });

    // Right table: Catatan untuk diperhatikan Orang Tua/Wali
    doc.autoTable({
        theme: 'grid',
        head: [['Catatan untuk diperhatikan Orang Tua/Wali']],
        // body: [['']],
        startY: currentY,
        margin: { left: pageWidth / 2, right: marginRight },
        tableWidth: (pageWidth / 2) - marginRight + 6,
        headStyles: {
            textColor: [0, 0, 0],
            // fillColor: [255, 255, 255],
            lineColor: 0,
            lineWidth: 0.001,
            fontStyle: 'bold',
            halign: 'center',
            fillColor: false // transparent
        },
        styles: {
            lineColor: 0,
            lineWidth: 0.001,
            cellPadding: 1.25,
            fillColor: false, // transparent
            minCellHeight: 69 // Set the height to match the left table
        },
    });

    // Table: Ketidakhadiran
    currentY = doc.lastAutoTable.finalY - 26.5;
    doc.autoTable({
        theme: 'grid',
        head: [['No', 'Ketidakhadiran', 'Jumlah Hari']],
        body: [
            ['1', 'Izin', ''],
            ['2', 'Sakit', ''],
            ['3', 'Tanpa Keterangan', ''],
        ],
        startY: currentY,
        margin: { left: marginLeft, right: 2 },
        tableWidth: (pageWidth / 2) - marginLeft - 10,
        headStyles: {
            textColor: [0, 0, 0],
            // fillColor: [255, 255, 255],
            lineColor: 0,
            lineWidth: 0.001,
            fontStyle: 'bold',
            halign: 'center',
            valign: 'middle',
            fillColor: false // transparent
        },
        styles: {
            lineColor: 0,
            lineWidth: 0.001,
            cellPadding: 1.25,
            fillColor: false // transparent
        },
        columnStyles: {
            0: { cellWidth: 10, halign: 'center', valign: 'middle' },
            1: { cellWidth: 40 },
            2: { cellWidth: 33, halign: 'center', valign: 'middle' },
        }
    });

    // Footer section
    doc.setFontSize(11);
    currentY = doc.lastAutoTable.finalY + lineSpacing;
    doc.text(`Diberikan di`, marginLeft, currentY);
    doc.text(`:`, marginLeft + 35, currentY);

    currentY += lineSpacing;
    doc.text("Pada Tanggal", marginLeft, currentY);
    doc.text(`:`, marginLeft + 35, currentY);

    currentY += lineSpacing + 1;
    doc.text("Mengetahui,", marginLeft, currentY);

    currentY += lineSpacing + 1;
    doc.text("Orang Tua / Wali", marginLeft + 20, currentY);
    doc.text("Wali Kelas", pageWidth - marginRight - 50, currentY);
    currentY += lineSpacing * 6;
    doc.text("___________________", marginLeft + 14, currentY);
    doc.text("___________________", pageWidth - marginRight - 60, currentY);

    return doc;
}
