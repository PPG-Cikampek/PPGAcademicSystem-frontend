const getCategoryName = (category) => {
        const categoryMap = {
            reciting: "Membaca Al-Qur'an/Tilawati",
            writing: "Menulis Arab",
            quranTafsir: "Tafsir Al-Qur'an",
            hadithTafsir: "Tafsir Hadits",
            practice: "Praktek Ibadah",
            moralManner: "Akhlak dan Tata Krama",
            memorizingSurah: "Hafalan Surat-surat Al-Quran",
            memorizingHadith: "Hafalan Hadist",
            memorizingDua: "Hafalan Do'a",
            memorizingBeautifulName: "Hafalan Asmaul Husna",
            knowledge: "Keilmuan dan Kefahaman Agama",
            independence: "Kemandirian",
        };
        return categoryMap[category] || 'kosong';
    };

export default getCategoryName;