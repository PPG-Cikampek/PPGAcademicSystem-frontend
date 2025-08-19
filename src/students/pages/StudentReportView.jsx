import React, { useState, useEffect } from 'react';

import { Document, Page, Text, View, pdf, PDFViewer, Image } from '@react-pdf/renderer';
import { saveAs } from 'file-saver';

import logo from '../../assets/logos/ppgcikampek.png';
import LoadingCircle from '../../shared/Components/UIElements/LoadingCircle';

import { FileDown } from 'lucide-react';
import useHttp from '../../shared/hooks/http-hook';

const styles = {
    page: {
        fontSize: 11,
        fontFamily: 'Times-Roman',
        paddingTop: 30,
        paddingLeft: 45,
        paddingRight: 45,
    },
    header: {
        fontFamily: 'Times-Bold',
        flexDirection: 'row',
        justifyContent: 'start',
        alignItems: 'center',
        marginBottom: 10,
        paddingBottom: 5,
        gap: '68px',
        width: '100%',
        borderBottom: '2px solid #000'
    },
    subHeader: {
        fontFamily: 'Times-Bold',
        flexDirection: 'col',
        justifyContent: 'start',
        alignItems: 'center',
        marginBottom: 10,
        paddingBottom: 5,
        width: '100%',
    },
    logo: {
        width: 64,
        height: 64
    },
    companyInfo: {
        fontSize: 9,
        marginTop: 50,
        color: '#222',
    },
    titleHuge: {
        fontSize: 14,
        textAlign: 'center',
    },
    title: {
        textAlign: 'center',
    },
    subTitle: {
        fontWeight: '600',
        textAlign: 'center',
    },
    studentDetailList: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'start',
        gap: 4,
        marginBottom: 20
    },
    studentDetails: {
        flexDirection: 'col',
        gap: 10
    },
    bodyTop: {
        flexDirection: 'row',
    },
    body: {
        flexDirection: 'row',
        gap: 20
    },
    table: {
        display: 'table',
        width: '50%',
        marginBottom: 20,
    },
    tableRow: {
        flexDirection: 'row',
        borderBottom: '1px solid #e0e0e0',
    },
    tableHeader: {
        backgroundColor: '#f0f0f0',
        fontWeight: 'bold',
    },
    tableCell: {
        paddingTop: 2,
        paddingBottom: 2,
        flex: 1,
    },
    tableCellNumber: {
        textAlign: 'center',
    },
    signature: {
        flexDirection: 'col',
        justifyContent: 'start',
        alignItems: 'center',
        gap: 5,
        marginTop: 80,
        borderTop: '1px solid #000',
        paddingTop: 5,
        width: 200,
    },
    signatureName: {
        textDecoration: 'underline',
        fontFamily: 'Times-Bold',
    },
    svgContainer: { display: 'flex', justifyContent: 'center', alignItems: 'center', margin: 20 },
    flex: {
        display: 'flex'
    },
    flexCol: {
        flexDirection: 'col'
    },
    flexRow: {
        flexDirection: 'row'
    },
    fontBold: {
        fontFamily: 'Times-Bold',
    }
};

const violationTranslations = {
    attribute: "Perlengkapan Belajar",
    attitude: "Sikap",
    tidiness: "Kerapihan",
};

const formatDate = (date) => {
    if (!(date instanceof Date)) {
        date = new Date(date);
    }
    return date.toLocaleDateString('id-ID', {
        weekday: 'long',
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        timeZone: 'Asia/Jakarta'
    });
};

const DUMMY_BACKEND_DATA = {
    reportData: {
        companyInfo: {
            name: 'Acme Corporation',
            address: '123 Business Lane, Corporate City, ST 12345',
            contact: 'Phone: (555) 123-4567 | Email: info@acmecorp.com',
        },
        content: {
            date: new Date().toLocaleDateString(),
            subject: 'LAPORAN MONITORING SISWA',
            body: 'KEGIATAN BELAJAR MENGAJAR',
            subBody: 'Lembar Performa Siswa',
        },
    },
    attendanceData: [
        { status: 'Hadir', count: 18, percentage: '90' },
        { status: 'Izin', count: 1, percentage: '5' },
        { status: 'Tanpa Keterangan', count: 1, percentage: '5' },
    ],
    violationData: [
        { violation: "attribute", count: 2 },
        { violation: "attitude", count: 1 },
        { violation: "tidiness", count: 3 },
    ],
    teachersNotes: [
        {
            noteContent: "Siswa sangat aktif dalam pembelajaran.",
            noteDate: "2025-08-01",
        },
        {
            noteContent: "Mohon diperhatikan perlengkapan belajar siswa.",
            noteDate: "2025-08-05",
        },
    ],
    studentData: {
        nis: '123456',
        name: 'John Doe',
        branchName: 'Cikampek',
        subBranchName: 'Jomin Barat',
        period: 'startDate - endDate',
    },
    classData: {
        name: '7A',
        academicYearName: '2025/2026',
        teachers: [{
            _id: 't1',
            name: 'Budi Santoso',
            nig: 'NIG001'
        }]
    }
};

const StudentReportView = ({ academicYearId, studentId, startDate, endDate, noCard = true }) => {
    const [reportData, setReportData] = useState();
    const [violationData, setViolationData] = useState();
    const [teachersNotes, setTeachersNotes] = useState();
    const [studentData, setStudentData] = useState();
    const [classData, setClassData] = useState();
    const [attendanceData, setAttendanceData] = useState();
    const [reportChart, setReportChart] = useState();
    const [showPreview, setShowPreview] = useState(false);


    const { isLoading, error, sendRequest, setError, setIsLoading } = useHttp()

    const fetchData = async () => {
        // Validate required props before making API call
        if (!academicYearId || !studentId) {
            console.warn('StudentReportView: Missing required props (academicYearId or studentId)');
            return;
        }

        const url = `${import.meta.env.VITE_BACKEND_URL}/attendances/reports/`;

        console.log(url)

        const body = JSON.stringify({
            academicYearId,
            studentId,
            startDate,
            endDate
        });

        let responseData;
        try {
            responseData = await sendRequest(url, 'POST', body, {
                'Content-Type': 'application/json'
            });

            console.log(responseData)

            setReportData(responseData.reportData);
            setViolationData(responseData.violationData);
            setTeachersNotes(responseData.teachersNotes);
            setStudentData(responseData.studentData);
            setClassData(responseData.classData);
            setAttendanceData(responseData.attendanceData);

            return responseData;

        } catch (err) {
            // Error is already handled by useHttp
            throw err;
        }
    }

    const PdfDocument = () => (
        <Document>
            <Page size="A4" style={[styles.page]}>
                {/* Header with Company Info */}
                <View style={styles.header}>
                    <Text>
                        <Image src={logo} style={styles.logo} />
                    </Text>
                    <Text style={styles.subTitle}>
                        {`${('Penggerak Pembina Generus').toUpperCase()}`}
                        {'\n'}
                        <Text style={styles.titleHuge}>
                            {`PPG`}
                            {'\n'}
                        </Text>
                        {`${('Daerah Cikampek').toUpperCase()}`}
                        {'\n'}
                        <Text style={styles.companyInfo}>
                            {`Gg. Palem, Desa Jomin Barat, Kecamatan Kotabaru, Kabupaten Karawang`}
                            {'\n'}
                        </Text>
                    </Text>
                </View>

                <View style={[styles.flex, styles.flexCol, { justifyContent: 'space-between' }]}>
                    <View>
                        <View style={styles.subHeader}>
                            {/* Title */}
                            <Text>{reportData?.content.subject}</Text>
                            <Text>{reportData?.content.body}</Text>
                            <Text>{reportData?.content.subBody}</Text>
                        </View>

                        <View style={styles.bodyTop}>
                            <View style={[styles.flex, styles.flexRow, { gap: 30, marginBottom: 30 }]}>
                                <View style={[styles.flex, styles.flexCol, { gap: 1 }]}>
                                    <Text>NIS</Text>
                                    <Text>Nama</Text>
                                    <Text>Kelompok</Text>
                                    <Text>Kelas</Text>
                                    <Text>Tahun Ajaran</Text>
                                    <Text>Periode</Text>
                                </View>
                                <View style={[styles.flex, styles.flexCol, { gap: 1 }]}>
                                    <Text style={styles.fontBold}>: {(studentData?.nis || '').toUpperCase()}</Text>
                                    <Text style={styles.fontBold}>: {(studentData?.name || '').toUpperCase()}</Text>
                                    <Text style={styles.fontBold}>: {(studentData?.branchName || '').toUpperCase()} - {(studentData?.subBranchName || '').toUpperCase()}</Text>
                                    <Text style={styles.fontBold}>: {(classData?.name || '').toUpperCase()}</Text>
                                    <Text style={styles.fontBold}>: {(classData?.academicYearName || '').toUpperCase()}</Text>
                                    <Text style={styles.fontBold}>: {(studentData?.period ? studentData.period : 'Semua').toUpperCase()}</Text>
                                </View>
                            </View>
                        </View>

                        <View style={styles.body}>
                            {/* Performance Table */}
                            <View style={[styles.table, { width: '60%' }]}>
                                {/* Table Header */}
                                <View style={[styles.tableRow, styles.tableHeader, { paddingLeft: 5 }]}>
                                    <Text style={styles.tableCell}>ITEM</Text>
                                    <Text style={[styles.tableCell, styles.tableCellNumber]}>REPETISI</Text>
                                    <Text style={[styles.tableCell, styles.tableCellNumber]}>PERSENTASE</Text>
                                </View>

                                {/* Table Rows */}
                                {attendanceData?.map((row, index) => (
                                    <View key={index} style={[styles.tableRow, { paddingLeft: 5 }]}>
                                        <Text style={styles.tableCell}>{row.status}</Text>
                                        <Text style={[styles.tableCell, styles.tableCellNumber]}>{row.count} Hari</Text>
                                        <Text style={[styles.tableCell, styles.tableCellNumber]}>{row.percentage}%</Text>
                                    </View>
                                ))}
                            </View>

                            <View style={[styles.table, { width: '40%' }]}>
                                {/* Table Header */}
                                <View style={[styles.tableRow, styles.tableHeader, { paddingLeft: 5 }]}>
                                    <Text style={styles.tableCell}>ITEM</Text>
                                    <Text style={[styles.tableCell, styles.tableCellNumber]}>REPETISI</Text>
                                </View>

                                {/* Table Rows */}
                                {violationData?.map((row, index) => (
                                    <View key={index} style={[styles.tableRow, { paddingLeft: 5 }]}>
                                        <Text style={styles.tableCell}>{violationTranslations[row.violation] || row.violation}</Text>
                                        <Text style={[styles.tableCell, styles.tableCellNumber]}>{row.count} Kali</Text>
                                    </View>
                                ))}
                            </View>
                        </View>

                        <View style={{ marginTop: 10, marginBottom: 30, display: 'flex', flexDirection: 'col', justifyContent: 'start', alignItems: 'start' }}>
                            {/* full-width box with 2px border solid black */}
                            <Text style={{ fontFamily: 'Times-Bold', textDecoration: 'underline', fontStyle: 'italic', marginBottom: 5 }}>
                                CATATAN KOMUNIKASI KEPADA ORANG TUA:
                            </Text>
                            {teachersNotes?.map((row, index) => (
                                <View key={index} style={[styles.tableRow, { paddingLeft: 5 }]}>
                                    <Text style={styles.tableCell}>{index + 1}. {row.noteContent} {`(${formatDate(row.noteDate)})`}</Text>
                                </View>
                            ))}
                        </View>
                    </View>

                    {/* Chart (optional, not shown in PDF) */}
                    {/* <View>
                        <ReactPDFChart>
                            {reportChart && reportChart}
                        </ReactPDFChart>
                    </View> */}

                    <View style={{ marginTop: 50, flexDirection: 'col', justifyContent: 'space-between', alignItems: 'center', alignSelf: 'flex-end' }}>
                        <Text style={{ marginVertical: 3 }}>Cikampek, {new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}</Text>
                        <Text>Hormat Kami,</Text>
                        <View style={styles.signature} key={classData?.teachers?.[0]?._id}>
                            <Text style={styles.signatureName}>{classData?.teachers?.[0]?.name}</Text>
                            <Text>NIG: {classData?.teachers?.[0]?.nig}</Text>
                        </View>
                    </View>
                </View>
            </Page>
        </Document>
    );

    const generatePDF = async () => {
        try {
            await fetchData();
            const blob = await pdf(<PdfDocument />).toBlob();
            const date = new Date().toLocaleDateString();
            saveAs(blob, `Laporan_Kehadiran_${studentData?.name || 'Siswa'}_${date}.pdf`);
        } catch (err) {
            console.error('Error generating PDF:', err);
        }
    };

    const handlePreviewClick = async () => {
        if (!reportData) {
            await fetchData();
        }
        setShowPreview(!showPreview);
    };

    return (
        <div className={`${noCard === false && "container mx-auto p-6 max-w-6xl"}`}>
            <div className={`${noCard === false && "bg-white shadow-md rounded-lg p-6"}`}>

                {!isLoading && (
                    <div className="space-y-4">
                        <div className="md:flex flex-row justify-start gap-2 hidden">
                            <button
                                onClick={handlePreviewClick}
                                className="btn-primary-outline"
                                disabled={isLoading}
                            >
                                {showPreview ? 'Tutup PDF' : 'Lihat PDF'}
                            </button>
                            <button
                                onClick={generatePDF}
                                className="button-primary m-0"
                                disabled={isLoading}
                            >
                                {isLoading ? 'Memuat...' : 'Download PDF'}
                            </button>
                        </div>
                        <div className="md:hidden">
                            <button
                                onClick={generatePDF}
                                className="btn-mobile-primary-round text-xs flex items-center m-0 mr-2 p-2 pr-3"
                                disabled={isLoading}
                            >
                                <FileDown size={18} />
                                <span className='ml-1'>{isLoading ? <LoadingCircle /> : 'Unduh Laporan'}</span>
                            </button>
                        </div>

                        {/* PDF Preview */}
                        {showPreview && reportData && (
                            <div className={`${noCard === false && "mt-6 border-2 border-gray-200 rounded-lg overflow-hidden"}`}>
                                <PDFViewer width="100%" height="600">
                                    <PdfDocument />
                                </PDFViewer>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default StudentReportView;