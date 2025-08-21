import { useEffect, useState, lazy } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const PDFRenderer = lazy(() =>
    import("@react-pdf/renderer").then((module) => ({
        Document: module.Document,
        default: module,
        Page: module.Page,
        Text: module.Text,
        View: module.View,
        StyleSheet: module.StyleSheet,
        pdf: module.pdf,
        PDFViewer: module.PDFViewer,
        Image: module.Image,
    }))
);

const { Document, Page, Text, View, StyleSheet, pdf, PDFViewer, Image } =
    PDFRenderer;

import useHttp from "../../shared/hooks/http-hook";

import getCategoryName from "../utilities/getCategoryName";
import logo from "../../assets/logos/ppgcikampek-whitebg.jpg";

// Register fonts if needed
// Font.register({ family: 'Amiri', src: amiriFont });
// Font.register({ family: 'Uthman', src: quranFont });

const styles = StyleSheet.create({
    page: {
        padding: 32,
        fontSize: 12,
        fontFamily: "Times-Roman",
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 12,
    },
    logo: {
        width: 48,
        height: 48,
        marginRight: 16,
    },
    institution: {
        flex: 1,
        textAlign: "center",
    },
    title: {
        fontSize: 16,
        marginVertical: 8,
        textAlign: "center",
        fontWeight: "bold",
    },
    subtitle: {
        fontSize: 14,
        marginBottom: 4,
        textAlign: "center",
    },
    info: {
        marginVertical: 4,
        fontSize: 12,
    },
    table: {
        display: "table",
        width: "auto",
        marginTop: 16,
        borderStyle: "solid",
        borderWidth: 1,
        borderRightWidth: 0,
        borderBottomWidth: 0,
    },
    tableRow: {
        flexDirection: "row",
    },
    tableColHeader: {
        width: "10%",
        borderStyle: "solid",
        borderWidth: 1,
        borderLeftWidth: 0,
        borderTopWidth: 0,
        backgroundColor: "#eee",
        textAlign: "center",
        fontWeight: "bold",
    },
    tableCol: {
        borderStyle: "solid",
        borderWidth: 1,
        borderLeftWidth: 0,
        borderTopWidth: 0,
        padding: 4,
    },
    colNo: { width: "10%", textAlign: "center" },
    colQuestion: { width: "70%" },
    colScore: { width: "20%", textAlign: "center" },
    footer: {
        position: "absolute",
        fontSize: 8,
        bottom: 16,
        right: 32,
        color: "#666",
    },
});

const MunaqasyahPDF = ({ questionsData, state }) => {
    if (!questionsData || !questionsData.classes) return null;

    return (
        <Document>
            {questionsData.classes.map((kelasObj, idx) => (
                <Page key={idx} size="A4" style={styles.page}>
                    <View style={styles.header}>
                        <Image src={logo} style={styles.logo} />
                        <View style={styles.institution}>
                            <Text style={{ fontSize: 14, fontWeight: "bold" }}>
                                PENGGERAK PEMBINA GENERUS
                            </Text>
                            <Text style={{ fontSize: 18, fontWeight: "bold" }}>
                                (PPG)
                            </Text>
                            <Text style={{ fontSize: 14 }}>
                                DAERAH CIKAMPEK
                            </Text>
                            <Text style={{ fontSize: 10 }}>
                                Jl. Ir. H. Juanda, Desa Jomin Barat, Kec. Kota
                                Baru, Kab. Karawang
                            </Text>
                        </View>
                    </View>
                    <View>
                        <Text style={styles.title}>
                            SOAL MUNAQOSAH SEMESTER{" "}
                            {state.semester.toString().endsWith("1")
                                ? "GANJIL"
                                : "GENAP"}
                        </Text>
                        <Text style={styles.subtitle}>
                            TAHUN {state.semester.toString().slice(0, 4)}/
                            {parseInt(state.semester.toString().slice(0, 4)) +
                                1}
                        </Text>
                        <Text style={styles.info}>
                            Materi : {getCategoryName(state.category)}
                        </Text>
                        <Text style={styles.info}>
                            Kelas : {kelasObj.classGrade}
                        </Text>
                    </View>
                    <View style={styles.table}>
                        <View style={styles.tableRow}>
                            <Text style={[styles.tableColHeader, styles.colNo]}>
                                No
                            </Text>
                            <Text
                                style={[
                                    styles.tableColHeader,
                                    styles.colQuestion,
                                ]}
                            >
                                Pertanyaan
                            </Text>
                            <Text
                                style={[styles.tableColHeader, styles.colScore]}
                            >
                                Skor
                            </Text>
                        </View>
                        {(kelasObj.questions || []).map((q, i) => (
                            <View style={styles.tableRow} key={i}>
                                <Text style={[styles.tableCol, styles.colNo]}>
                                    {i + 1}
                                </Text>
                                <Text
                                    style={[
                                        styles.tableCol,
                                        styles.colQuestion,
                                    ]}
                                >
                                    {q.question}
                                    {q.answers && q.answers.length
                                        ? "\n\n" + q.answers.join("\n")
                                        : ""}
                                </Text>
                                <Text
                                    style={[styles.tableCol, styles.colScore]}
                                >
                                    {q.maxScore != null
                                        ? q.maxScore.toString()
                                        : ""}
                                </Text>
                            </View>
                        ))}
                    </View>
                    <Text style={styles.footer}>PPG CIKAMPEK</Text>
                </Page>
            ))}
        </Document>
    );
};

const CategoryPackageViewReactPDF = () => {
    const [questionsData, setQuestionsData] = useState(null);
    const { sendRequest } = useHttp();
    const navigate = useNavigate();
    const location = useLocation();
    const { state } = location;

    useEffect(() => {
        const fetchQuestions = async () => {
            const baseUrl = `${
                import.meta.env.VITE_BACKEND_URL
            }/munaqasyahs/examination/questions/package?semester=${state.semester.slice(
                -1
            )}&category=${state.category}`;
            const url = state.seed ? `${baseUrl}&seed=${state.seed}` : baseUrl;
            try {
                const responseData = await sendRequest(url);
                setQuestionsData(responseData);
            } catch (err) {
                // Error handled by useHttp
            }
        };
        fetchQuestions();
    }, [state]);

    return (
        <div className="container mx-auto p-4">
            <div className="flex flex-col gap-4">
                <div
                    className="border rounded-sm p-4"
                    style={{ minHeight: 600 }}
                >
                    {questionsData && (
                        <PDFViewer width="100%" height={900}>
                            <MunaqasyahPDF
                                questionsData={questionsData}
                                state={state}
                            />
                        </PDFViewer>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CategoryPackageViewReactPDF;
