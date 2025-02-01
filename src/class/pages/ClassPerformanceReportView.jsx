import React, { useState, useEffect } from 'react';

import { Document, Page, Text, View, pdf, PDFViewer, Image } from '@react-pdf/renderer';
import { saveAs } from 'file-saver';

import logo from '../../assets/logos/ppgcikampek.png';
import LoadingCircle from '../../shared/Components/UIElements/LoadingCircle';

import { ArrowDownToLine } from 'lucide-react';

const styles = {
    page: {
        fontSize: 12,
        fontFamily: 'Times-Roman',
        paddingTop: 40,
        paddingLeft: 75,
        paddingRight: 75,
    },
    header: {
        fontFamily: 'Times-Bold',
        flexDirection: 'row',
        justifyContent: 'start',
        alignItems: 'center',
        marginBottom: 20,
        paddingBottom: 10,
        gap: '68px',
        width: '100%',
        borderBottom: '1px solid #000'
    },
    subHeader: {
        fontFamily: 'Times-Bold',
        flexDirection: 'col',
        justifyContent: 'start',
        alignItems: 'center',
        marginBottom: 10,
        paddingBottom: 5,
        gap: 2,
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
    title: {
        fontSize: 16,
        textAlign: 'center',
    },
    subTitle: {
        fontSize: 16,
        fontWeight: '600',
        textAlign: 'center',
    },
    studentDetails: {
        flexDirection: 'col',
        justifyContent: 'space-between',
        alignItems: 'start',
        gap: 4,
        marginBottom: 20
    },
    studentDetailLists: {
        flexDirection: 'row',
        gap: 10
    },
    body: {
        flexDirection: 'row',
        gap: 20
    },
    table: {
        display: 'table',
        width: '70%',
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
        padding: 5,
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
    svgContainer: { display: 'flex', justifyContent: 'center', alignItems: 'center', margin: 20 }
};

const ClassPerformanceReportView = ({ studentData, noCard = false }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [reportData, setReportData] = useState();
    const [showPreview, setShowPreview] = useState(false);

    console.log(studentData)

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
                subject: 'Lembar Performa Peserta Didik',
                body: 'Kegiatan Belajar Mengajar',
            },
            data: transformedAttendance,
        };

        setReportData(documentData);
        setIsLoading(false)
    }, [studentData]);

    const getLocalizedMonthName = (monthNumber, locale = 'id-ID') => {
        return new Date(2000, monthNumber - 1, 1)
            .toLocaleString(locale, { month: 'long' });
    };

    const PdfDocument = () => (
        <Document>
            <Page size="A4" style={styles.page}>
                {/* Header with Company Info */}
                <View style={styles.header}>
                    <Text>
                        <Image src={logo} style={styles.logo} />
                    </Text>
                    <Text style={styles.title}>
                        {`Penggerak Pembina Generus (PPG)`}
                        {'\n'}
                        Cikampek
                        {'\n'}
                        <Text style={styles.companyInfo}>
                            {`Jl. Ciherang, Wadas, Telukjambe Timur, Cikampek, Jawa Barat 41361`}
                            {'\n'}
                        </Text>
                    </Text>

                </View>

                <View style={styles.subHeader}>
                    {/* Title */}
                    <Text>{reportData.content.subject}</Text>
                    <Text>{reportData.content.body}</Text>
                </View>


                <View style={styles.studentDetails}>
                    {/* Title */}
                    <View style={styles.studentDetailLists}>
                        <Text>NIS</Text>
                        <Text>: {studentData.nis}</Text>
                    </View>
                    <View style={styles.studentDetailLists}>
                        <Text>Nama</Text>
                        <Text>: {studentData.name}</Text>
                    </View>
                    <View style={styles.studentDetailLists}>
                        <Text>Kelas</Text>
                        <Text>: {studentData.className}</Text>
                    </View>
                    <View style={styles.studentDetailLists}>
                        <Text>Tahun Ajaran</Text>
                        <Text>: {studentData.teachingGroupYearName}</Text>
                    </View>
                    <View style={styles.studentDetailLists}>
                        <Text>Periode</Text>
                        <Text>: {studentData.month ? studentData.month : 'Semua'}</Text>
                    </View>
                </View>

                <View style={styles.body}>
                    {/* Performance Table */}
                    <View style={styles.table}>
                        {/* Table Header */}
                        <View style={[styles.tableRow, styles.tableHeader]}>
                            <Text style={styles.tableCell}>Keterangan</Text>
                            <Text style={[styles.tableCell, styles.tableCellNumber]}>Jumlah</Text>
                            <Text style={[styles.tableCell, styles.tableCellNumber]}>Persentase</Text>
                        </View>

                        {/* Table Rows */}
                        {reportData.data.map((row, index) => (
                            <View key={index} style={styles.tableRow}>
                                <Text style={styles.tableCell}>{row.status}</Text>
                                <Text style={[styles.tableCell, styles.tableCellNumber]}>{row.count}</Text>
                                <Text style={[styles.tableCell, styles.tableCellNumber]}>{row.percentage}%</Text>
                            </View>
                        ))}
                    </View>

                </View>

                {/* Performance Chart */}
                {/* <Image style={styles.image} src={chartImage} /> */}


                {/* Signature Placeholder */}
                <View style={{ marginTop: 20, flexDirection: 'col', justifyContent: 'space-between', alignItems: 'start' }}>
                    <Text>Hormat Kami,</Text>
                    {/* <Text>Guru</Text> */}
                    {/* {studentData.teachers.map(teacher => (
                        <View style={styles.signature} key={teacher._id}>
                            <Text style={styles.signatureName}>{teacher.name}</Text>
                            <Text>NID: {teacher.nid}</Text>
                        </View>
                    ))} */}
                    <View style={styles.signature} key={studentData.teachers[0]._id}>
                        <Text style={styles.signatureName}>{studentData.teachers[0].name}</Text>
                        <Text>NID: {studentData.teachers[0].nid}</Text>
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

export default ClassPerformanceReportView;