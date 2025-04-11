import React, { useState, useMemo } from 'react'
import { useLocation } from 'react-router-dom'
import { ChevronDown } from 'lucide-react';

const MunaqasyahByClassView = () => {
    const [expandedCards, setExpandedCards] = useState({});
    const location = useLocation()
    const { scores } = location.state || { scores: [] }

    const expandedCount = useMemo(() => 
        Object.values(expandedCards).filter(Boolean).length,
        [expandedCards]
    );

    const toggleCard = (id) => {
        setExpandedCards(prev => ({
            ...prev,
            [id]: !prev[id]
        }));
    };

    const collapseAll = () => {
        setExpandedCards({});
    };

    const calculateAverage = (score) => {
        const values = scoreCategories.map(category => score[category.key]);
        const sum = values.reduce((a, b) => a + b, 0);
        return (sum / values.length).toFixed(1);
    };
    
    const scoreCategories = [
        { key: 'reciting', label: "Membaca Al-Qur'an/Tilawati" },
        { key: 'writing', label: 'Menulis Arab' },
        { key: 'quranTafsir', label: 'Tafsir Al-Quran' },
        { key: 'hadithTafsir', label: 'Tafsir Hadits' },
        { key: 'practice', label: 'Praktik Ibadah' },
        { key: 'moralManner', label: 'Akhlak dan Tata Krama' },
        { key: 'memorizingSurah', label: 'Surat-surat Al-Quran' },
        { key: 'memorizingHadith', label: 'Hafalan Hadits' },
        { key: 'memorizingDua', label: "Hafalan Do'a" },
        { key: 'memorizingBeautifulName', label: 'Hafalan Asmaul Husna' },
        { key: 'knowledge', label: 'Keilmuan dan Kefahaman Agama' },
        { key: 'independence', label: 'Kemandirian' }
    ];

    return (
        <div className="min-h-screen bg-gray-50 px-4 py-8 md:p-8">
            <div className="max-w-6xl mx-auto">
                <div className="flex justify-between items-center mb-6 h-9">
                    <h1 className="text-2xl font-semibold text-gray-900">{scores[0]?.classId.name}</h1>
                    {expandedCount >= 2 && (
                        <button
                            onClick={collapseAll}
                            className="btn-neutral-outline mt-0"
                        >
                            Tutup Semua
                        </button>
                    )}
                </div>
                <div className="flex flex-col gap-4">
                    {scores.map((score) => (
                        <div
                            key={score._id}
                            className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200"
                        >
                            <div
                                onClick={() => toggleCard(score._id)}
                                className="cursor-pointer p-6 hover:bg-gray-50 transition-colors duration-200"
                            >
                                <div className="flex justify-between items-center">
                                    <div className="flex md:flex-col gap-2 items-center md:items-start">
                                        <h2 className="text-lg font-medium text-gray-800">
                                            {score.studentId.name}
                                        </h2>
                                        <span className="text-base text-gray-500">
                                            Rata-rata: {calculateAverage(score)}
                                        </span>
                                    </div>
                                    <ChevronDown
                                        className={`w-5 h-5 text-gray-500 transition-transform duration-200
                                        ${expandedCards[score._id] ? 'transform rotate-180' : ''}`}
                                    />
                                </div>
                            </div>

                            <div className={`overflow-hidden transition-all duration-300 
                                ${expandedCards[score._id] ? 'max-h-[800px]' : 'max-h-0'}`}>
                                <div className="px-4 py-4 bg-gray-50 border-t border-gray-200">
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-1 md:gap-4">
                                        {scoreCategories.map(category => (
                                            <div key={category.key} className="flex justify-between items-center p-2 bg-white rounded border">
                                                <span className="text-gray-600">{category.label}</span>
                                                <span className="font-medium text-gray-800">{score[category.key]}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default MunaqasyahByClassView