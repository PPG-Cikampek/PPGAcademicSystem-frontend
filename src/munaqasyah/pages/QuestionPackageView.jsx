import { useContext, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../../shared/Components/Context/auth-context";
import DataTable from "../../shared/Components/UIElements/DataTable";

import useHttp from "../../shared/hooks/http-hook";
import LoadingCircle from "../../shared/Components/UIElements/LoadingCircle";

import { Download, RefreshCw, Trash } from "lucide-react";

import { academicYearFormatter } from "../../shared/Utilities/academicYearFormatter";

import { generateCategoryPDF, generateEmptyCategoryPDF } from "../utilities/generateCategoryPDF";
import JSZip from "jszip";
import { saveAs } from "file-saver";

const CATEGORIES = [
    'reciting', 'writing', 'quranTafsir', 'hadithTafsir',
    'practice', 'moralManner', 'memorizingSurah', 'memorizingHadith',
    'memorizingDua', 'memorizingBeautifulName', 'knowledge', 'independence'
];

const QuestionPackageView = () => {
    const [packages, setPackages] = useState([]);
    const [isDownloading, setIsDownloading] = useState(false);
    const auth = useContext(AuthContext);
    const navigate = useNavigate();

    const { isLoading, error, sendRequest, setError } = useHttp();

    useEffect(() => {
        const fetchPackages = async () => {
            const url = `${
                import.meta.env.VITE_BACKEND_URL
            }/academicYears/munaqasyah/packages/`;
            try {
                const responseData = await sendRequest(url);
                console.log(responseData);
                setPackages(responseData.packages);
            } catch (err) {
                // Error is handled by useHttp
            }
        };
        fetchPackages();
    }, [sendRequest]);

    const handleDownloadAll = async (pkg) => {
        setIsDownloading(true);
        try {
            const semester = pkg.name.slice(-1);
            const zip = new JSZip();

            const results = await Promise.all(
                CATEGORIES.map(async (category) => {
                    const baseUrl = `${import.meta.env.VITE_BACKEND_URL}/munaqasyahs/examination/questions/package?semester=${semester}&category=${category}`;
                    try {
                        const response = await fetch(baseUrl);
                        if (!response.ok) return { category, data: null };
                        const data = await response.json();
                        return { category, data };
                    } catch {
                        return { category, data: null };
                    }
                })
            );

            for (const { category, data } of results) {
                let doc;
                if (data && data.classes && data.classes.length > 0) {
                    doc = generateCategoryPDF(pkg.name, category, data);
                } else {
                    doc = generateEmptyCategoryPDF(category);
                }
                zip.file(`${category}.pdf`, doc.output('arraybuffer'));
            }

            const blob = await zip.generateAsync({ type: 'blob' });
            saveAs(blob, `PaketSoal_${pkg.name}.zip`);
        } finally {
            setIsDownloading(false);
        }
    };

    const columns = [
        {
            key: "name",
            label: "Semester",
            sortable: true,
            render: (pkg) => academicYearFormatter(pkg.name) || "-",
        },
        {
            key: "reciting",
            label: "Membaca",
            sortable: true,
            render: (pkg) => (
                <button
                    onClick={() =>
                        navigate("/munaqasyah/question-package/class", {
                            state: {
                                semester: pkg.name,
                                category: "reciting",
                                seed: pkg.reciting,
                            },
                        })
                    }
                    className="w-24 button-primary"
                >
                    Unduh
                </button>
            ),
        },
        {
            key: "writing",
            label: "Menulis",
            sortable: true,
            render: (pkg) => (
                <button
                    onClick={() =>
                        navigate("/munaqasyah/question-package/class", {
                            state: {
                                semester: pkg.name,
                                category: "writing",
                                seed: pkg.writing,
                            },
                        })
                    }
                    className="button-primaryw-24"
                >
                    Unduh
                </button>
            ),
        },
        {
            key: "quranTafsir",
            label: "Tafsir Quran",
            sortable: true,
            render: (pkg) => (
                <button
                    onClick={() =>
                        navigate("/munaqasyah/question-package/class", {
                            state: {
                                semester: pkg.name,
                                category: "quranTafsir",
                                seed: pkg.quranTafsir,
                            },
                        })
                    }
                    className="w-24 button-primary"
                >
                    Unduh
                </button>
            ),
        },
        {
            key: "hadithTafsir",
            label: "Tafsir Hadits",
            sortable: true,
            render: (pkg) => (
                <button
                    onClick={() =>
                        navigate("/munaqasyah/question-package/class", {
                            state: {
                                semester: pkg.name,
                                category: "hadithTafsir",
                                seed: pkg.hadithTafsir,
                            },
                        })
                    }
                    className="w-24 button-primary"
                >
                    Unduh
                </button>
            ),
        },
        {
            key: "practice",
            label: "Praktek",
            sortable: true,
            render: (pkg) => (
                <button
                    onClick={() =>
                        navigate("/munaqasyah/question-package/class", {
                            state: {
                                semester: pkg.name,
                                category: "practice",
                                seed: pkg.practice,
                            },
                        })
                    }
                    className="w-24 button-primary"
                >
                    Unduh
                </button>
            ),
        },
        {
            key: "moralManner",
            label: "Akhlak",
            sortable: true,
            render: (pkg) => (
                <button
                    onClick={() =>
                        navigate("/munaqasyah/question-package/class", {
                            state: {
                                semester: pkg.name,
                                category: "moralManner",
                                seed: pkg.moralManner,
                            },
                        })
                    }
                    className="w-24 button-primary"
                >
                    Unduh
                </button>
            ),
        },
        {
            key: "memorizingSurah",
            label: "Menghafal Surat",
            sortable: true,
            render: (pkg) => (
                <button
                    onClick={() =>
                        navigate("/munaqasyah/question-package/class", {
                            state: {
                                semester: pkg.name,
                                category: "memorizingSurah",
                                seed: pkg.memorizingSurah,
                            },
                        })
                    }
                    className="w-24 button-primary"
                >
                    Unduh
                </button>
            ),
        },
        {
            key: "memorizingHadith",
            label: "Menghafal Hadits",
            sortable: true,
            render: (pkg) => (
                <button
                    onClick={() =>
                        navigate("/munaqasyah/question-package/class", {
                            state: {
                                semester: pkg.name,
                                category: "memorizingHadith",
                                seed: pkg.memorizingHadith,
                            },
                        })
                    }
                    className="w-24 button-primary"
                >
                    Unduh
                </button>
            ),
        },
        {
            key: "memorizingDua",
            label: "Menghafal Do'a",
            sortable: true,
            render: (pkg) => (
                <button
                    onClick={() =>
                        navigate("/munaqasyah/question-package/class", {
                            state: {
                                semester: pkg.name,
                                category: "memorizingDua",
                                seed: pkg.memorizingDua,
                            },
                        })
                    }
                    className="w-24 button-primary"
                >
                    Unduh
                </button>
            ),
        },
        {
            key: "memorizingBeautifulName",
            label: "Menghafal Asmaul Husna",
            sortable: true,
            render: (pkg) => (
                <button
                    onClick={() =>
                        navigate("/munaqasyah/question-package/class", {
                            state: {
                                semester: pkg.name,
                                category: "memorizingBeautifulName",
                                seed: pkg.memorizingBeautifulName,
                            },
                        })
                    }
                    className="w-24 button-primary"
                >
                    Unduh
                </button>
            ),
        },
        {
            key: "knowledge",
            label: "Kepahaman Agama",
            sortable: true,
            render: (pkg) => (
                <button
                    onClick={() =>
                        navigate("/munaqasyah/question-package/class", {
                            state: {
                                semester: pkg.name,
                                category: "knowledge",
                                seed: pkg.knowledge,
                            },
                        })
                    }
                    className="w-24 button-primary"
                >
                    Unduh
                </button>
            ),
        },
        {
            key: "independence",
            label: "Kemandirian",
            sortable: true,
            render: (pkg) => (
                <button
                    onClick={() =>
                        navigate("/munaqasyah/question-package/class", {
                            state: {
                                semester: pkg.name,
                                category: "independence",
                                seed: pkg.independence,
                            },
                        })
                    }
                    className="w-24 button-primary"
                >
                    Unduh
                </button>
            ),
        },
        {
            key: "actions",
            label: "Aksi",
            render: (pkg) => (
                <div className="flex gap-2">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            handleDownloadAll(pkg);
                        }}
                        disabled={isDownloading}
                        className="hover:bg-gray-100 p-2 rounded-full disabled:opacity-50"
                        title="Download semua kategori"
                    >
                        <Download className="w-4 h-4" />
                    </button>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            // navigate(`/munaqasyah/question-bank/${classGrade}/${question._id}/update`);
                        }}
                        className="hover:bg-gray-100 p-2 rounded-full"
                    >
                        <RefreshCw className="w-4 h-4" />
                    </button>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            // handleDeleteQuestion(question._id);
                        }}
                        className="hover:bg-gray-100 p-2 rounded-full text-red-500"
                    >
                        <Trash className="w-4 h-4" />
                    </button>
                </div>
            ),
        },
    ];

    return (
        <div className="md:p-8 px-4 py-8 min-h-screen">
            <div className="mx-auto max-w-6xl">
                <div className="flex flex-col justify-between items-stretch gap-2 mb-4">
                    <div className="flex items-center gap-4 mb-6">
                        <h1 className="font-semibold text-gray-900 text-2xl">
                            {"Paket Soal Daerah"}
                        </h1>
                        {isDownloading && (
                            <div className="flex items-center gap-2 text-gray-500 text-sm">
                                <LoadingCircle size={16} />
                                <span>Mengunduh paket soal...</span>
                            </div>
                        )}
                    </div>
                </div>
                {isLoading && (
                    <div className="flex justify-center mt-16">
                        <LoadingCircle size={32} />
                    </div>
                )}
                {!isLoading && packages && (
                    <DataTable
                        data={packages}
                        columns={columns}
                        searchableColumns={["name"]}
                        initialSort={{ key: "name", direction: "ascending" }}
                        isLoading={isLoading}
                        config={{
                            showFilter: false,
                            showSearch: true,
                            showTopEntries: true,
                            showBottomEntries: true,
                            showPagination: true,
                            clickableRows: false,
                            entriesOptions: [5, 10, 25, 50, 100],
                        }}
                        tableId="packages-table"
                    />
                )}
            </div>
        </div>
    );
};

export default QuestionPackageView;
