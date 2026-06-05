const DEFAULT_SCORE_CATEGORIES = [
    { key: "reciting", label: "Membaca Al-Qur'an/Tilawati" },
    { key: "writing", label: "Menulis Arab" },
    { key: "quranTafsir", label: "Tafsir Al-Quran" },
    { key: "hadithTafsir", label: "Tafsir Hadits" },
    { key: "practice", label: "Praktik Ibadah" },
    { key: "moralManner", label: "Akhlak dan Tata Krama" },
    { key: "memorizingSurah", label: "Hafalan Surat-surat Al-Quran" },
    { key: "memorizingHadith", label: "Hafalan Hadits" },
    { key: "memorizingDua", label: "Hafalan Do'a" },
    { key: "memorizingBeautifulName", label: "Hafalan Asma'ul Husna" },
    { key: "knowledge", label: "Keilmuan dan Kefahaman Agama" },
    { key: "independence", label: "Kemandirian" },
];

const PAUD_CATEGORIES = [
    "independence",
    "quranTafsir",
    "hadithTafsir",
    "memorizingHadith",
];

const SMP_CATEGORIES = ["memorizingBeautifulName", "writing"];

export function getScoreCategories(className) {
    if (!className) return DEFAULT_SCORE_CATEGORIES;

    if (/(PAUD|PRA-PAUD|1|2|3|4)/.test(className)) {
        return DEFAULT_SCORE_CATEGORIES.filter(
            (cat) => !PAUD_CATEGORIES.includes(cat.key),
        );
    }

    if (/(7|8|9)/.test(className)) {
        return DEFAULT_SCORE_CATEGORIES.filter(
            (cat) => !SMP_CATEGORIES.includes(cat.key),
        );
    }

    return DEFAULT_SCORE_CATEGORIES;
}

export { DEFAULT_SCORE_CATEGORIES };
