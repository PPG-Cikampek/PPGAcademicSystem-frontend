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
    src: paypenSans
});

// Convert mm to pdf points (pt)
const mmToPt = (mm) => (mm * 72) / 25.4;

const styles = StyleSheet.create({
    page: {
        fontFamily: "PaypenSans",
        position: "relative",
        padding: 0,
    },
    bg: {
        position: "absolute",
        left: 0,
        top: 0,
        // width/height will be provided inline in points to match the page size
    },
    text: {
        fontSize: 12,
        textAlign: "center",
    },
    name: {
        position: "absolute",
        // top will be provided dynamically in the component (in points)
        left: 0,
        textAlign: "center",
        fontSize: 12,
    },
    id: {
        position: "absolute",
        // top will be provided dynamically in the component (in points)
        left: 0,
        textAlign: "center",
        fontSize: 10,
    },
});

const IDCardDocument = ({ student }) => {
    const width = mmToPt(53.98);
    const height = mmToPt(85.6);
    // compute absolute top positions in points instead of using percentages
    const nameTop = height * 0.45; // equivalent to 45%
    const idTop = height * 0.55; // equivalent to 55%
    return (
        <Document>
            <Page size={{ width, height }} style={styles.page}>
                {/* Container to anchor absolute children with numeric dimensions */}
                <View style={{ position: "relative", width, height }} wrap={false}>
                    {/* Background image fills the page using numeric points to avoid over-constraints */}
                    <PDFImage
                        src={idCardBGFront}
                        style={[styles.bg, { width, height }]}
                        resizeMode="cover"
                        wrap={false}
                    />

                    <Text style={[styles.name, { top: nameTop, width }]} wrap={false}>
                        {student.name}
                    </Text>

                </View>
            </Page>
            <Page size={{ width, height }} style={styles.page}>
                {/* Container to anchor absolute children with numeric dimensions */}
                <View style={{ position: "relative", width, height }} wrap={false}>
                    {/* Background image fills the page using numeric points to avoid over-constraints */}
                    <PDFImage
                        src={idCardBGBack}
                        style={[styles.bg, { width, height }]}
                        resizeMode="cover"
                        wrap={false}
                    />

                    <Text style={[styles.id, { top: idTop, width }]} wrap={false}>{`ID: ${student.id}`}</Text>
                </View>
            </Page>
        </Document>
    );
};

export default IDCardDocument;
