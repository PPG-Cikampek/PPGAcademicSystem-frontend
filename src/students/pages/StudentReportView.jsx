import React, { useState, useEffect } from 'react';

import { Document, Page, Text, View, pdf, PDFViewer, Image } from '@react-pdf/renderer';
import { saveAs } from 'file-saver';

import logo from '../../assets/logos/ppgcikampek.png';
import LoadingCircle from '../../shared/Components/UIElements/LoadingCircle';

import { ArrowDownToLine } from 'lucide-react';
import PieChart from '../../performance/components/PieChart';
import ReactPDFChart from 'react-pdf-charts';
import PerformanceReportChart from '../../performance/components/PerformanceReportChart';

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

const StudentReportView = ({ studentData, attendanceData, noCard = false }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [reportData, setReportData] = useState();
    const [reportChart, setReportChart] = useState();
    const [showPreview, setShowPreview] = useState(false);

    console.log(studentData)
    console.log(attendanceData)

    useEffect(() => {
        setIsLoading(true)
        const transformAttendance = (data) => {
            const totalAttendances = data.attendances.length;

            const statusCounts = data.attendances.reduce((acc, attendance) => {
                acc[attendance.status] = (acc[attendance.status] || 0) + 1;
                return acc;
            }, {});

            return Object.keys(statusCounts).map((status) => ({
                status,
                count: statusCounts[status],
                percentage: ((statusCounts[status] / totalAttendances) * 100).toFixed(0),
            }));
        };

        const transformedAttendance = transformAttendance(studentData);

        const documentData = {
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
            data: transformedAttendance,
        };

        setReportData(documentData);
        setIsLoading(false)
        setReportChart(<PerformanceReportChart attendanceData={attendanceData} />)

    }, [studentData, setReportChart]);

    const getLocalizedMonthName = (monthNumber, locale = 'id-ID') => {
        return new Date(2000, monthNumber - 1, 1)
            .toLocaleString(locale, { month: 'long' });
    };

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


                <View style={[styles.flex, styles.flexCol, { justifyContent: 'center' }]}>
                    <View>
                        <View style={styles.subHeader}>
                            {/* Title */}
                            <Text>{reportData.content.subject}</Text>
                            <Text>{reportData.content.body}</Text>
                            <Text>{reportData.content.subBody}</Text>
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
                                    <Text style={styles.fontBold}>: {(studentData.nis).toUpperCase()}</Text>
                                    <Text style={styles.fontBold}>: {(studentData.name).toUpperCase()}</Text>
                                    <Text style={styles.fontBold}>: {(studentData.branchName).toUpperCase()} - {(studentData.teachingGroupName).toUpperCase()}</Text>
                                    <Text style={styles.fontBold}>: {(studentData.className).toUpperCase()}</Text>
                                    <Text style={styles.fontBold}>: {(studentData.teachingGroupYearName).toUpperCase()}</Text>
                                    <Text style={styles.fontBold}>: {(studentData.month ? studentData.month : 'Semua').toUpperCase()}</Text>
                                </View>
                            </View>
                        </View>

                        <View style={styles.body}>
                            {/* Performance Table */}
                            <View style={styles.table}>
                                {/* Table Header */}
                                <View style={[styles.tableRow, styles.tableHeader, { paddingLeft: 5 }]}>
                                    <Text style={styles.tableCell}>KETERANGAN</Text>
                                    <Text style={[styles.tableCell, styles.tableCellNumber]}>JUMLAH</Text>
                                    <Text style={[styles.tableCell, styles.tableCellNumber]}>PERSENTASE</Text>
                                </View>

                                {/* Table Rows */}
                                {reportData.data.map((row, index) => (
                                    <View key={index} style={[styles.tableRow, { paddingLeft: 5 }]}>
                                        <Text style={styles.tableCell}>{row.status}</Text>
                                        <Text style={[styles.tableCell, styles.tableCellNumber]}>{row.count}</Text>
                                        <Text style={[styles.tableCell, styles.tableCellNumber]}>{row.percentage}%</Text>
                                    </View>
                                ))}
                            </View>
                        </View>

                    </View>

                    {/* 
                    <ReactPDFChart>
                        <PieChart attendanceData={attendanceData} chartType={'mobile'} toImage={false} />
                    </ReactPDFChart> */}

                    <View>
                        <ReactPDFChart>
                            {reportChart && reportChart}
                        </ReactPDFChart>
                    </View>

                    <View style={{ marginTop: 20, flexDirection: 'col', justifyContent: 'space-between', alignItems: 'center', alignSelf: 'flex-end' }}>
                        <Text>Hormat Kami,</Text>
                        <View style={styles.signature} key={studentData.teachers[0]._id}>
                            <Text style={styles.signatureName}>{studentData.teachers[0].name}</Text>
                            <Text>NID: {studentData.teachers[0].nid}</Text>
                        </View>
                    </View>
                </View>


            </Page>
        </Document>
    );

    const generatePDF = async () => {
        const blob = await pdf(<PdfDocument />).toBlob();
        const date = new Date().toLocaleDateString();
        console.log(date)
        saveAs(blob, `Laporan_Kehadiran_${studentData.name}_${date}.pdf`);
    };

    const togglePreview = () => {
        setShowPreview(!showPreview);
    };

    return (
        <div className={`${noCard === false && "container mx-auto p-6 max-w-6xl"}`}>
            <div className={`${noCard === false && "bg-white shadow-md rounded-lg p-6"}`}>
                {isLoading && (
                    <LoadingCircle size={32} />
                )}
                {!isLoading && (
                    <div className="space-y-4">
                        <div className="md:flex flex-row justify-start gap-2 hidden">
                            <button
                                onClick={togglePreview}
                                className="btn-primary-outline"
                            >
                                {showPreview ? 'Tutup PDF' : 'Lihat PDF'}
                            </button>
                            <button
                                onClick={generatePDF}
                                className="button-primary m-0"
                            >
                                Download PDF
                            </button>
                        </div>
                        <div className="md:hidden">
                            <button
                                onClick={generatePDF}
                                className="btn-primary-outline flex items-center m-0 p-2"
                            >
                                <ArrowDownToLine size={24} />
                                <span className='ml-2'>Unduh Laporan</span>
                            </button>
                        </div>

                        {/* PDF Preview */}
                        {showPreview && (
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