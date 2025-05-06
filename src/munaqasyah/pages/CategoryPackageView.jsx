import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

import { jsPDF } from 'jspdf';
import { applyPlugin } from 'jspdf-autotable';
import logo from '../../assets/logos/ppgcikampek-whitebg.jpg';
import useHttp from '../../shared/hooks/http-hook';

import amiriFont from '../../assets/fonts/Amiri-Regular.ttf'
import quranFont from '../../assets/fonts/me_quran.ttf'

applyPlugin(jsPDF);

const CategoryPackageView = () => {
  const [pdfUrl, setPdfUrl] = useState('');
  const [questionsData, setQuestionsData] = useState(null);
  const { isLoading, error, sendRequest, setError } = useHttp();

  const navigate = useNavigate();
  const location = useLocation();
  const { state } = location;

  const getCategoryName = (category) => {
    const categoryMap = {
      reciting: "Membaca Al-Qur'an/Tilawati",
      writing: "Menulis Arab",
      quranTafsir: "Tafsir Al-Qur'an",
      hadithTafsir: "Tafsir Hadits",
      practice: "Praktek Ibadah",
      moralManner: "Akhlak dan Tata Krama",
      memorizingSurah: "Hafalan Surat-surat Al-Quran",
      memorizingHadith: "Hafalan Hadist",
      memorizingDua: "Hafalan Do'a",
      memorizingBeautifulName: "Hafalan Asmaul Husna",
      knowledge: "Keilmuan dan Kefahaman Agama",
      independence: "Kemandirian",
    };
    return categoryMap[category] || 'kosong';
  };

  const generatePDF = () => {
    if (!questionsData || !questionsData.classes) return;

    const doc = new jsPDF();

    doc.addFont(amiriFont, "Amiri", "normal");
    doc.addFont(quranFont, "Uthman", "normal");


    // Header and Footer function
    const addHeaderFooter = () => {
      doc.setFontSize(8);
      doc.setTextColor(100);
      doc.text('PPG CIKAMPEK', doc.internal.pageSize.width - 28, doc.internal.pageSize.height - 10);
    };

    // Table headers
    const headers = [["No", "Pertanyaan", "Skor"]];

    // For each class from backend data
    questionsData.classes.forEach((kelasObj, idx) => {
      if (idx > 0) {
        doc.addPage();
      }

      // Add letterhead with imported logo
      doc.addImage(logo, 'PNG', 25, 5, 32, 32, undefined, 'NONE');

      // Institution details
      doc.setFont("times", "bold");
      doc.setFontSize(14);
      doc.text("PENGGERAK PEMBINA GENERUS", doc.internal.pageSize.width / 2 + 10, 15, { align: "center" });

      doc.setFontSize(18);
      doc.text("(PPG)", doc.internal.pageSize.width / 2 + 10, 23, { align: "center" });

      doc.setFontSize(14);
      doc.text("DAERAH CIKAMPEK", doc.internal.pageSize.width / 2 + 10, 30, { align: "center" });

      doc.setFont("times", "normal");
      doc.setFontSize(10);
      doc.text("Jl. Ir. H. Juanda, Desa Jomin Barat, Kec. Kota Baru, Kab. Karawang", doc.internal.pageSize.width / 2 + 10, 35, { align: "center" });

      // Add horizontal lines
      doc.setLineWidth(0.5);
      doc.line(14, 42, doc.internal.pageSize.width - 14, 42);
      doc.setLineWidth(0.1);
      doc.line(14, 43, doc.internal.pageSize.width - 14, 43);

      // Title
      doc.setFont("times", "normal");
      doc.setFontSize(14);
      doc.text(`SOAL MUNAQOSAH SEMESTER ${state.semester.toString().endsWith('1') ? 'GANJIL' : 'GENAP'}`, doc.internal.pageSize.width / 2, 50, { align: "center" });

      doc.setFontSize(14);
      doc.text(`TAHUN ${state.semester.toString().slice(0, 4)}/${parseInt(state.semester.toString().slice(0, 4)) + 1}`, doc.internal.pageSize.width / 2, 57, { align: "center" });

      doc.setFontSize(12);
      doc.text(`Materi    : ${getCategoryName(state.category)}`, 14, 65);
      doc.text(`Kelas     : ${kelasObj.classGrade}`, 14, 70);

      doc.setFont("Uthman");
      doc.setFontSize(22);
      doc.text(`أميري`, 28, 70);


      // Table data for this class
      const tableData = (kelasObj.questions || []).map((q, i) => [
        (i + 1).toString(),
        q.question + '\n\n' + (q.answers && q.answers.length ? q.answers.join('\n') : ''),
        q.maxScore != null ? q.maxScore.toString() : ''
      ]);

      doc.autoTable({
        head: headers,
        body: tableData,
        startY: 75,
        margin: { top: 15 },
        theme: 'grid',
        headStyles: {
          textColor: [0, 0, 0],
          fillColor: [255, 255, 255],
          lineColor: 0,
          lineWidth: 0.1,
          font: 'times',
          fontSize: 12,
          fontStyle: 'bold',
          halign: 'center'
        },
        bodyStyles: {
          textColor: [0, 0, 0],
          lineColor: 0,
          lineWidth: 0.1,
          font: 'times',
          fontSize: 12,
          halign: 'left',
        },
        tableWidth: 'auto',
        columnStyles: {
          0: { cellWidth: 10, halign: 'center', walign: 'center' },
          1: { cellWidth: 'auto', font: 'Uthman', fontSize: 18, },
          2: { cellWidth: 15, halign: 'center', walign: 'center' },
        }
      });
    });

    // Add header/footer to all pages
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      addHeaderFooter();
    }

    // Preview the generated PDF
    const pdfDataUri = doc.output('datauristring');
    setPdfUrl(pdfDataUri);
  };

  useEffect(() => {
    const fetchQuestions = async () => {
      const baseUrl = `${import.meta.env.VITE_BACKEND_URL}/munaqasyahs/examination/questions/package?semester=${state.semester.slice(-1)}&category=${state.category}`;
      const url = state.seed ? `${baseUrl}&seed=${state.seed}` : baseUrl;
      try {
        const responseData = await sendRequest(url);
        console.log(responseData);
        setQuestionsData(responseData);
      } catch (err) {
        // Error is handled by useHttp
      }
    };
    fetchQuestions();
  }, [state]);

  useEffect(() => {
    if (questionsData) {
      generatePDF();
    }
  }, [questionsData]);

  return (
    <div className="container mx-auto p-4">
      <div className="flex flex-col gap-4">
        <div className="flex gap-4">
          <button
            onClick={generatePDF}
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            Preview PDF
          </button>
        </div>

        <div className="border rounded p-4">
          {pdfUrl && (
            <iframe
              src={pdfUrl}
              width="100%"
              height="1080px"
              title="PDF Preview"
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default CategoryPackageView;