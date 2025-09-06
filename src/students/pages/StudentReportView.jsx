import { useState, lazy } from "react";

import {
    Document,
    Page,
    Text,
    View,
    pdf,
    PDFViewer,
    Image,
} from "@react-pdf/renderer";
import { saveAs } from "file-saver";

import logo from "../../assets/logos/ppgcikampek.png";
import LoadingCircle from "../../shared/Components/UIElements/LoadingCircle";

import { FileDown } from "lucide-react";
import useHttp from "../../shared/hooks/http-hook";
import { academicYearFormatter } from "../../shared/Utilities/academicYearFormatter";

import useNewModal from "../../shared/hooks/useNewModal";
import NewModal from "../../shared/Components/Modal/NewModal";

const styles = {
    page: {
        fontSize: 11,
        fontFamily: "Times-Roman",
        paddingTop: 30,
        paddingLeft: 45,
        paddingRight: 45,
    },
    header: {
        fontFamily: "Times-Bold",
        flexDirection: "row",
        justifyContent: "start",
        alignItems: "center",
        marginBottom: 10,
        paddingBottom: 5,
        gap: "68px",
        width: "100%",
        borderBottom: "2px solid #000",
    },
    subHeader: {
        fontFamily: "Times-Bold",
        flexDirection: "col",
        justifyContent: "start",
        alignItems: "center",
        marginBottom: 10,
        paddingBottom: 5,
        width: "100%",
    },
    logo: {
        width: 64,
        height: 64,
    },
    companyInfo: {
        fontSize: 9,
        marginTop: 50,
        color: "#222",
    },
    titleHuge: {
        fontSize: 14,
        textAlign: "center",
    },
    title: {
        textAlign: "center",
    },
    subTitle: {
        fontWeight: "600",
        textAlign: "center",
    },
    studentDetailList: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "start",
        gap: 4,
        marginBottom: 20,
    },
    studentDetails: {
        flexDirection: "col",
        gap: 10,
    },
    bodyTop: {
        flexDirection: "row",
    },
    body: {
        flexDirection: "row",
        gap: 20,
    },
    table: {
        display: "table",
        width: "50%",
        marginBottom: 20,
    },
    tableRow: {
        flexDirection: "row",
        borderBottom: "1px solid #e0e0e0",
    },
    tableHeader: {
        backgroundColor: "#f0f0f0",
        fontWeight: "bold",
    },
    tableCell: {
        paddingTop: 2,
        paddingBottom: 2,
        flex: 1,
    },
    tableCellNumber: {
        textAlign: "center",
    },
    signature: {
        flexDirection: "col",
        justifyContent: "start",
        alignItems: "center",
        gap: 5,
        marginTop: 80,
        borderTop: "1px solid #000",
        paddingTop: 5,
        width: 200,
    },
    signatureName: {
        textDecoration: "underline",
        fontFamily: "Times-Bold",
    },
    svgContainer: {
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        margin: 20,
    },
    flex: {
        display: "flex",
    },
    flexCol: {
        flexDirection: "col",
    },
    flexRow: {
        flexDirection: "row",
    },
    fontBold: {
        fontFamily: "Times-Bold",
    },
};

const violationTranslations = {
    attribute: "Perlengkapan Belajar",
    attitude: "Sikap",
    tidiness: "Kerapihan",
};

const StudentReportView = ({
    academicYearId,
    studentId,
    startDate,
    endDate,
    noCard = true,
}) => {
    // Combine related report state into a single object to batch updates and reduce re-renders
    const [reportState, setReportState] = useState({
        reportData: null,
        violationData: null,
        teachersNotes: null,
        studentData: null,
        classData: null,
        attendanceData: null,
        reportChart: null,
    });
    const [showPreview, setShowPreview] = useState(false);

    const { isLoading, error, sendRequest, setError, setIsLoading } = useHttp();

    const { modalState, openModal, closeModal } = useNewModal();

    const fetchData = async () => {
        // Validate required props before making API call
        if (!academicYearId || !studentId) {
            console.warn(
                "StudentReportView: Missing required props (academicYearId or studentId)"
            );
            return;
        }

        const url = `${import.meta.env.VITE_BACKEND_URL}/attendances/reports/`;

        console.log(url);

        const body = JSON.stringify({
            academicYearId,
            studentId,
            startDate,
            endDate,
        });

        try {
            const responseData = await sendRequest(url, "POST", body, {
                "Content-Type": "application/json",
            });

            console.log(responseData);

            // Batch all related report updates into a single state update
            setReportState({
                reportData: responseData.reportData,
                violationData: responseData.violationData,
                teachersNotes: responseData.teachersNotes,
                studentData: responseData.studentData,
                classData: responseData.classData,
                attendanceData: responseData.attendanceData,
                reportChart: responseData.reportChart,
            });

            return responseData;
        } catch (err) {
            // Error is already handled by useHttp
            throw err;
        }
    };
    const PdfDocument = ({ data }) => {
        // prefer explicit data (passed in for generatePDF) otherwise fall back to reportState
        const rd = data || reportState;

        return (
            <Document>
                <Page size="A4" style={[styles.page]}>
                    {/* Header with Company Info */}
                    <View style={styles.header}>
                        <Text>
                            <Image src={logo} style={styles.logo} />
                        </Text>
                        <Text style={styles.subTitle}>
                            {`${"Penggerak Pembina Generus".toUpperCase()}`}
                            {"\n"}
                            <Text style={styles.titleHuge}>
                                {`PPG`}
                                {"\n"}
                            </Text>
                            {`${"Daerah Cikampek".toUpperCase()}`}
                            {"\n"}
                            <Text style={styles.companyInfo}>
                                {`Gg. Palem, Desa Jomin Barat, Kecamatan Kotabaru, Kabupaten Karawang`}
                                {"\n"}
                            </Text>
                        </Text>
                    </View>

                    <View
                        style={[
                            styles.flex,
                            styles.flexCol,
                            { justifyContent: "space-between" },
                        ]}
                    >
                        <View>
                            <View style={styles.subHeader}>
                                {/* Title */}
                                <Text>{rd.reportData?.content.subject}</Text>
                                <Text>{rd.reportData?.content.body}</Text>
                                <Text>{rd.reportData?.content.subBody}</Text>
                            </View>

                            <View style={styles.bodyTop}>
                                <View
                                    style={[
                                        styles.flex,
                                        styles.flexRow,
                                        { gap: 30, marginBottom: 30 },
                                    ]}
                                >
                                    <View
                                        style={[
                                            styles.flex,
                                            styles.flexCol,
                                            { gap: 1 },
                                        ]}
                                    >
                                        <Text>NIS</Text>
                                        <Text>Nama</Text>
                                        <Text>Kelompok</Text>
                                        <Text>Kelas</Text>
                                        <Text>Tahun Ajaran</Text>
                                        <Text>Periode</Text>
                                    </View>
                                    <View
                                        style={[
                                            styles.flex,
                                            styles.flexCol,
                                            { gap: 1 },
                                        ]}
                                    >
                                        <Text style={styles.fontBold}>
                                            :{" "}
                                            {(
                                                rd.studentData?.nis || ""
                                            ).toUpperCase()}
                                        </Text>
                                        <Text style={styles.fontBold}>
                                            :{" "}
                                            {(
                                                rd.studentData?.name || ""
                                            ).toUpperCase()}
                                        </Text>
                                        <Text style={styles.fontBold}>
                                            :{" "}
                                            {(
                                                rd.studentData?.branchName || ""
                                            ).toUpperCase()}{" "}
                                            -{" "}
                                            {(
                                                rd.studentData?.subBranchName ||
                                                ""
                                            ).toUpperCase()}
                                        </Text>
                                        <Text style={styles.fontBold}>
                                            :{" "}
                                            {(
                                                rd.classData?.name || ""
                                            ).toUpperCase()}
                                        </Text>
                                        <Text style={styles.fontBold}>
                                            :{" "}
                                            {academicYearFormatter(
                                                rd.classData
                                                    ?.academicYearName || ""
                                            ).toUpperCase()}
                                        </Text>
                                        <Text style={styles.fontBold}>
                                            :{" "}
                                            {(rd.studentData?.period
                                                ? rd.studentData.period
                                                : "Semua"
                                            ).toUpperCase()}
                                        </Text>
                                    </View>
                                </View>
                            </View>

                            <View style={styles.body}>
                                {/* Performance Table */}
                                <View style={[styles.table, { width: "60%" }]}>
                                    {/* Table Header */}
                                    <View
                                        style={[
                                            styles.tableRow,
                                            styles.tableHeader,
                                            { paddingLeft: 5 },
                                        ]}
                                    >
                                        <Text style={styles.tableCell}>
                                            ITEM
                                        </Text>
                                        <Text
                                            style={[
                                                styles.tableCell,
                                                styles.tableCellNumber,
                                            ]}
                                        >
                                            REPETISI
                                        </Text>
                                        <Text
                                            style={[
                                                styles.tableCell,
                                                styles.tableCellNumber,
                                            ]}
                                        >
                                            PERSENTASE
                                        </Text>
                                    </View>

                                    {/* Table Rows */}
                                    {rd.attendanceData?.map((row, index) => (
                                        <View
                                            key={index}
                                            style={[
                                                styles.tableRow,
                                                { paddingLeft: 5 },
                                            ]}
                                        >
                                            <Text style={styles.tableCell}>
                                                {row.status}
                                            </Text>
                                            <Text
                                                style={[
                                                    styles.tableCell,
                                                    styles.tableCellNumber,
                                                ]}
                                            >
                                                {row.count} Hari
                                            </Text>
                                            <Text
                                                style={[
                                                    styles.tableCell,
                                                    styles.tableCellNumber,
                                                ]}
                                            >
                                                {row.percentage}%
                                            </Text>
                                        </View>
                                    ))}
                                </View>

                                <View style={[styles.table, { width: "40%" }]}>
                                    {/* Table Header */}
                                    <View
                                        style={[
                                            styles.tableRow,
                                            styles.tableHeader,
                                            { paddingLeft: 5 },
                                        ]}
                                    >
                                        <Text style={styles.tableCell}>
                                            ITEM
                                        </Text>
                                        <Text
                                            style={[
                                                styles.tableCell,
                                                styles.tableCellNumber,
                                            ]}
                                        >
                                            REPETISI
                                        </Text>
                                    </View>

                                    {/* Table Rows */}
                                    {rd.violationData?.map((row, index) => (
                                        <View
                                            key={index}
                                            style={[
                                                styles.tableRow,
                                                { paddingLeft: 5 },
                                            ]}
                                        >
                                            <Text style={styles.tableCell}>
                                                {violationTranslations[
                                                    row.violation
                                                ] || row.violation}
                                            </Text>
                                            <Text
                                                style={[
                                                    styles.tableCell,
                                                    styles.tableCellNumber,
                                                ]}
                                            >
                                                {row.count} Kali
                                            </Text>
                                        </View>
                                    ))}
                                </View>
                            </View>

                            <View
                                style={{
                                    marginTop: 10,
                                    marginBottom: 30,
                                    display: "flex",
                                    flexDirection: "col",
                                    justifyContent: "start",
                                    alignItems: "start",
                                }}
                            >
                                {/* full-width box with 2px border solid black */}
                                <Text
                                    style={{
                                        fontFamily: "Times-Bold",
                                        textDecoration: "underline",
                                        // fontStyle: "italic",
                                        marginBottom: 5,
                                    }}
                                >
                                    CATATAN KOMUNIKASI KEPADA ORANG TUA:
                                </Text>
                                {rd.teachersNotes?.map((row, index) => (
                                    <View
                                        key={index}
                                        style={[
                                            styles.tableRow,
                                            { paddingLeft: 5 },
                                        ]}
                                    >
                                        <Text style={styles.tableCell}>
                                            {index + 1}. {row.noteContent}{" "}
                                            {`(${row.noteDate})`}
                                        </Text>
                                    </View>
                                ))}
                            </View>
                        </View>

                        <View
                            style={{
                                marginTop: 50,
                                flexDirection: "col",
                                justifyContent: "space-between",
                                alignItems: "center",
                                alignSelf: "flex-end",
                            }}
                        >
                            <Text style={{ marginVertical: 3 }}>
                                Cikampek,{" "}
                                {new Date().toLocaleDateString("id-ID", {
                                    day: "2-digit",
                                    month: "long",
                                    year: "numeric",
                                })}
                            </Text>
                            <Text>Hormat Kami,</Text>
                            <View
                                style={styles.signature}
                                key={rd.classData?.teachers?.[0]?._id}
                            >
                                <Text style={styles.signatureName}>
                                    {rd.classData?.teachers?.[0]?.name}
                                </Text>
                                <Text>
                                    NIG: {rd.classData?.teachers?.[0]?.nig}
                                </Text>
                            </View>
                        </View>
                    </View>
                </Page>
            </Document>
        );
    };

    const generatePDF = async () => {
        try {
            // Use the returned response from fetchData to avoid waiting for state propagation
            const responseData = await fetchData();
            const blob = await pdf(
                <PdfDocument data={responseData} />
            ).toBlob();
            const date = new Date().toLocaleDateString();
            saveAs(
                blob,
                `Laporan_Kehadiran_${
                    responseData?.studentData?.name || "Siswa"
                }_${date}.pdf`
            );
            openModal(
                "Laporan berhasil diunduh!\nCek folder unduhan Anda.",
                "success",
                null,
                "Berhasil!"
            );
        } catch (err) {
            console.error("Error generating PDF:", err);
        }
    };

    return (
        <div
            className={`${
                noCard === false && "container mx-auto p-6 max-w-6xl"
            }`}
        >
            <div
                className={`${
                    noCard === false && "bg-white shadow-md rounded-lg p-6"
                }`}
            >
                <div className="space-y-4">
                    <div className="md:flex flex-row justify-start gap-2 hidden">
                        <button
                            onClick={generatePDF}
                            className="button-primary m-0"
                            disabled={isLoading}
                        >
                            {isLoading ? "Memuat..." : "Download PDF"}
                        </button>
                    </div>
                    <div className="md:hidden">
                        <button
                            onClick={generatePDF}
                            className="btn-round-primary text-xs flex items-center m-0 mr-2 p-2 pr-3"
                            disabled={isLoading}
                        >
                            {!isLoading && <FileDown size={18} />}
                            <span className="ml-1">
                                {isLoading ? (
                                    <LoadingCircle />
                                ) : (
                                    "Unduh Laporan"
                                )}
                            </span>
                        </button>
                    </div>

                    {/* PDF Preview */}
                    {showPreview && reportState.reportData && (
                        <div
                            className={`${
                                noCard === false &&
                                "mt-6 border-2 border-gray-200 rounded-lg overflow-hidden"
                            }`}
                        >
                            <PDFViewer width="100%" height="600">
                                <PdfDocument />
                            </PDFViewer>
                        </div>
                    )}
                </div>
            </div>
            <NewModal modalState={modalState} onClose={closeModal} />
        </div>
    );
};

export default StudentReportView;
