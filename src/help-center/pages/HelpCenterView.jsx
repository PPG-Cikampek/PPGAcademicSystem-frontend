import { useMemo, useState } from "react";
import {
    Shield,
    Phone,
    MessageSquare,
    ChevronDown,
    ChevronUp,
} from "lucide-react";
import LoadingCircle from "../../shared/Components/UIElements/LoadingCircle";
import { useFAQs } from "../hooks/useFAQData";

const HelpCenterView = () => {
    const [expandedFaq, setExpandedFaq] = useState(null);

    const faqQuery = useFAQs();
    const faqData = useMemo(() => faqQuery.data || [], [faqQuery.data]);

    // Contact channels
    const contactChannels = [
        // {
        //     id: 1,
        //     icon: Mail,
        //     title: "Email Support",
        //     description: "support@ppgacademic.com",
        //     color: "blue",
        // },
        {
            id: 2,
            icon: Phone,
            title: "0813-8030-2979",
            subTitle: "Mas Billi",
            description: "Kendala teknis seperti bug, error, sistem, dll.",
            color: "green",
        },
        {
            id: 3,
            icon: MessageSquare,
            title: "0895-3530-75885",
            subTitle: "Mas Bintang",
            description:
                "Penambahan guru/siswa, tutorial penggunaan, dan informasi umum.",
            color: "purple",
        },
    ];

    const toggleFaq = (id) => {
        setExpandedFaq(expandedFaq === id ? null : id);
    };

    const getColorClasses = (color) => {
        const colors = {
            blue: "bg-blue-100 text-blue-600 border-blue-200",
            green: "bg-green-100 text-green-600 border-green-200",
            purple: "bg-purple-100 text-purple-600 border-purple-200",
            orange: "bg-orange-100 text-orange-600 border-orange-200",
        };
        return colors[color] || colors.blue;
    };

    return (
        <div className="bg-gray-50 md:p-8 px-4 py-8 min-h-screen">
            <div className="mx-auto max-w-6xl">
                {/* Header Section */}
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-4">
                        <h1 className="font-semibold text-gray-900 text-2xl">
                            Pusat Bantuan
                        </h1>
                    </div>
                </div>

                {/* FAQ Section */}
                <div className="mb-12">
                    <h2 className="flex items-center gap-2 mb-6 font-semibold text-gray-900 text-xl">
                        <MessageSquare className="w-5 h-5" />
                        Pertanyaan Umum (FAQ)
                    </h2>
                    {faqQuery.isLoading ? (
                        <div className="flex justify-center bg-white shadow-xs py-12 border border-gray-100 rounded-md">
                            <LoadingCircle size={28} />
                        </div>
                    ) : faqData.length === 0 ? (
                        <div className="bg-white shadow-xs p-6 border border-gray-100 rounded-md text-gray-500 text-sm text-center">
                            Belum ada pertanyaan yang tersedia saat ini.
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {faqData.map((faq) => (
                                <div
                                    key={faq.id}
                                    className="bg-white shadow-xs border border-gray-100 rounded-md overflow-hidden"
                                >
                                    <button
                                        onClick={() => toggleFaq(faq.id)}
                                        className="flex justify-between items-center hover:bg-gray-50 px-6 py-4 w-full text-left transition-colors duration-200"
                                    >
                                        <span className="font-medium text-gray-900">
                                            {faq.question}
                                        </span>
                                        {expandedFaq === faq.id ? (
                                            <ChevronUp className="w-5 h-5 text-gray-500 shrink-0" />
                                        ) : (
                                            <ChevronDown className="w-5 h-5 text-gray-500 shrink-0" />
                                        )}
                                    </button>
                                    {expandedFaq === faq.id && (
                                        <div className="bg-gray-50 px-6 py-4 border-gray-100 border-t">
                                            <p className="text-gray-700">
                                                {faq.answer}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <h2 className="flex items-center gap-2 mb-6 font-semibold text-gray-900 text-xl">
                    <Shield className="w-5 h-5" />
                    Hubungi Tim ICT PPG Cikampek
                </h2>
                {/* Contact Support Section */}
                <div className="bg-white shadow-xs p-8 border border-gray-100 rounded-md">
                    <p className="mb-6 text-gray-600">
                        Hubungi Tim ICT untuk dukungan lebih lanjut.
                    </p>
                    <div className="flex md:flex-row flex-col justify-between gap-6">
                        {contactChannels.map((channel) => (
                            <div
                                key={channel.id}
                                className="flex items-start gap-4"
                            >
                                <div
                                    className={`w-12 h-12 rounded-md flex items-center justify-center shrink-0 ${getColorClasses(
                                        channel.color
                                    )}`}
                                >
                                    <channel.icon className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="mb-1 font-semibold text-gray-900">
                                        {channel.title}
                                    </h3>
                                    <p className="font-semibold text-gray-400">
                                        {channel.subTitle}
                                    </p>
                                    <p className="text-gray-600 text-sm">
                                        {channel.description}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Footer Note */}
                <div className="mt-8 text-gray-500 text-sm text-center">
                    <p>
                        Dokumentasi diperbarui secara berkala. Terakhir
                        diperbarui: 15 November 2025
                    </p>
                </div>
            </div>
        </div>
    );
};

export default HelpCenterView;
