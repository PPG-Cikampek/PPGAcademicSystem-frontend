import React from "react";
import {
    Document,
    Page,
    Text,
    Image as PDFImage,
    View,
    StyleSheet,
    Font,
} from "@react-pdf/renderer";

import paypenSans from "../../assets/fonts/PlaypenSans-SemiBold.ttf";
import idCardBGFront from "../../assets/images/id-card-bg-front.png";
import idCardBGBack from "../../assets/images/id-card-bg-back.png";

Font.register({
    family: "PaypenSans",
    format: "truetype",
    src: paypenSans,
});

// Convert mm to pdf points (pt)
const mmToPt = (mm) => (mm * 72) / 25.4;

const styles = StyleSheet.create({
    page: {
        fontFamily: "PaypenSans",
        position: "relative",
        padding: 0,
    },
    content: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
    },
    bg: {
        position: "absolute",
        left: 0,
        top: 0,
        // width/height will be provided inline in points to match the page size
    },
    pic: {
        position: "absolute",
        overflow: "hidden",
    },
    text: {
        fontSize: 14,
    },
    name: {
        position: "absolute",
        // top will be provided dynamically in the component (in points)
        textAlign: "center",
        left: 0,
    },
    nis: {
        position: "absolute",
        // top will be provided dynamically in the component (in points)
        textAlign: "center",
        left: 0,
    },
});

const IDCardDocument = ({ student }) => {
    const width = mmToPt(53.98) * 1.5;
    const height = mmToPt(85.6) * 1.5;
    // compute absolute top positions in points instead of using percentages
    const nameTop = height * 0.2; // equivalent to 20%
    const nisTop = height * 0.85; // equivalent to 90%
    const qrCodeTop = height * 0.65; // equivalent to 65%
    // Enforce a fixed square profile size in points and numeric left/top coordinates
    const profileSize = Math.round(width * 0.65); // 65% of card width
    const profileLeft = Math.round((width - profileSize) / 2);
    const profileTop = height * 0.35; // equivalent to 35%
    const qrTop = height * 0.3; // equivalent to 30%
    // small dynamic font sizing with sensible clamps
    const nameFontSize = Math.min(14, Math.max(8, Math.round(width * 0.06)));
    const idFontSize = Math.min(14, Math.max(6, Math.round(width * 0.06)));
    return (
        <Document>
            <Page size={{ width, height }} style={styles.page}>
                {/* Container to anchor absolute children with numeric dimensions */}
                <View
                    style={{ position: "relative", width, height }}
                    wrap={false}
                >
                    <View style={styles.content} wrap={false}>
                        {/* Background image fills the page using numeric points to avoid over-constraints */}
                        <PDFImage
                            src={idCardBGFront}
                            style={[styles.bg, { width, height }]}
                            resizeMode="cover"
                            wrap={false}
                        />

                        <Text
                            style={[
                                styles.name,
                                { top: nameTop, width, fontSize: nameFontSize },
                            ]}
                            wrap={false}
                        >
                            {student.name.toUpperCase()}
                        </Text>
                        {student.image ? (
                            <PDFImage
                                src={student.image}
                                style={[
                                    styles.pic,
                                    {
                                        left: profileLeft,
                                        top: profileTop,
                                        width: profileSize,
                                        height: profileSize,
                                        borderRadius: 3,
                                    },
                                ]}
                                resizeMode="cover"
                                wrap={false}
                            />
                        ) : (
                            <View
                                style={[
                                    styles.pic,
                                    {
                                        left: profileLeft,
                                        top: profileTop,
                                        width: profileSize,
                                        height: profileSize,
                                        backgroundColor: "#e0e0e0",
                                    },
                                ]}
                                wrap={false}
                            />
                        )}
                        <Text
                            style={[
                                styles.nis,
                                { top: nisTop, width, fontSize: idFontSize },
                            ]}
                            wrap={false}
                        >{student.nis}</Text>
                    </View>
                </View>
            </Page>
            <Page size={{ width, height }} style={styles.page}>
                {/* Container to anchor absolute children with numeric dimensions */}
                <View
                    style={{ position: "relative", width, height }}
                    wrap={false}
                >
                    {/* Background image fills the page using numeric points to avoid over-constraints */}
                    <PDFImage
                        src={idCardBGBack}
                        style={[styles.bg, { width, height }]}
                        resizeMode="cover"
                        wrap={false}
                    />
                    <PDFImage
                        src={student.qrCode}
                        style={[
                            styles.pic,
                            {
                                left: profileLeft,
                                top: qrTop,
                                width: profileSize,
                                height: profileSize,
                            },
                        ]}
                        resizeMode="cover"
                        wrap={false}
                    />
                </View>
            </Page>
        </Document>
    );
};

export default IDCardDocument;
