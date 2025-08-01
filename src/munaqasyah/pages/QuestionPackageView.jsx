import React, { useContext, useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AuthContext } from '../../shared/Components/Context/auth-context'
import DataTable from '../../shared/Components/UIElements/DataTable'

import useHttp from '../../shared/hooks/http-hook'
import LoadingCircle from '../../shared/Components/UIElements/LoadingCircle'

import { Download, RefreshCw, Trash } from 'lucide-react'

import { academicYearFormatter } from '../../shared/Utilities/academicYearFormatter'

const QuestionPackageView = () => {
    const [packages, setPackages] = useState([])
    const auth = useContext(AuthContext)
    const navigate = useNavigate()

    const { isLoading, error, sendRequest, setError } = useHttp()

    useEffect(() => {
        const fetchPackages = async () => {
            const url = `${import.meta.env.VITE_BACKEND_URL}/academicYears/munaqasyah/packages/`
            try {
                const responseData = await sendRequest(url)
                console.log(responseData)
                setPackages(responseData.packages)
            } catch (err) {
                // Error is handled by useHttp
            }
        }
        fetchPackages()
    }, [sendRequest])

    const columns = [
        {
            key: 'name',
            label: 'Semester',
            sortable: true,
            render: (pkg) => academicYearFormatter(pkg.name) || '-'
        },
        {
            key: 'reciting',
            label: 'Membaca',
            sortable: true,
            render: (pkg) => (
                <button
                    onClick={() => navigate('/munaqasyah/question-package/class', { state: { semester: pkg.name, category: 'reciting', seed: pkg.reciting } })}
                    className='button-primary  w-24 w-24'>
                    Unduh
                </button>
            )
        },
        {
            key: 'writing',
            label: 'Menulis',
            sortable: true,
            render: (pkg) => (
                <button
                    onClick={() => navigate('/munaqasyah/question-package/class', { state: { semester: pkg.name, category: 'writing', seed: pkg.writing } })}
                    className='button-primary  w-24 w-24'>
                    Unduh
                </button>
            )
        },
        {
            key: 'quranTafsir',
            label: 'Tafsir Quran',
            sortable: true,
            render: (pkg) => (
                <button
                    onClick={() => navigate('/munaqasyah/question-package/class', { state: { semester: pkg.name, category: 'quranTafsir', seed: pkg.quranTafsir } })}
                    className='button-primary w-24'>
                    Unduh
                </button>
            )
        },
        {
            key: 'hadithTafsir',
            label: 'Tafsir Hadits',
            sortable: true,
            render: (pkg) => (
                <button
                    onClick={() => navigate('/munaqasyah/question-package/class', { state: { semester: pkg.name, category: 'hadithTafsir', seed: pkg.hadithTafsir } })}
                    className='button-primary w-24'>
                    Unduh
                </button>
            )
        },
        {
            key: 'practice',
            label: 'Praktek',
            sortable: true,
            render: (pkg) => (
                <button
                    onClick={() => navigate('/munaqasyah/question-package/class', { state: { semester: pkg.name, category: 'practice', seed: pkg.practice } })}
                    className='button-primary w-24'>
                    Unduh
                </button>
            )
        },
        {
            key: 'moralManner',
            label: 'Akhlak',
            sortable: true,
            render: (pkg) => (
                <button
                    onClick={() => navigate('/munaqasyah/question-package/class', { state: { semester: pkg.name, category: 'moralManner', seed: pkg.moralManner } })}
                    className='button-primary w-24'>
                    Unduh
                </button>
            )
        },
        {
            key: 'memorizingSurah',
            label: 'Menghafal Surat',
            sortable: true,
            render: (pkg) => (
                <button
                    onClick={() => navigate('/munaqasyah/question-package/class', { state: { semester: pkg.name, category: 'memorizingSurah', seed: pkg.memorizingSurah } })}
                    className='button-primary w-24'>
                    Unduh
                </button>
            )
        },
        {
            key: 'memorizingHadith',
            label: 'Menghafal Hadits',
            sortable: true,
            render: (pkg) => (
                <button
                    onClick={() => navigate('/munaqasyah/question-package/class', { state: { semester: pkg.name, category: 'memorizingHadith', seed: pkg.memorizingHadith } })}
                    className='button-primary w-24'>
                    Unduh
                </button>
            )
        },
        {
            key: 'memorizingDua',
            label: "Menghafal Do'a",
            sortable: true,
            render: (pkg) => (
                <button
                    onClick={() => navigate('/munaqasyah/question-package/class', { state: { semester: pkg.name, category: 'memorizingDua', seed: pkg.memorizingDua } })}
                    className='button-primary w-24'>
                    Unduh
                </button>
            )
        },
        {
            key: 'memorizingBeautifulName',
            label: 'Menghafal Asmaul Husna',
            sortable: true,
            render: (pkg) => (
                <button
                    onClick={() => navigate('/munaqasyah/question-package/class', { state: { semester: pkg.name, category: 'memorizingBeautifulName', seed: pkg.memorizingBeautifulName } })}
                    className='button-primary w-24'>
                    Unduh
                </button>
            )
        },
        {
            key: 'knowledge',
            label: 'Kepahaman Agama',
            sortable: true,
            render: (pkg) => (
                <button
                    onClick={() => navigate('/munaqasyah/question-package/class', { state: { semester: pkg.name, category: 'knowledge', seed: pkg.knowledge } })}
                    className='button-primary w-24'>
                    Unduh
                </button>
            )
        },
        {
            key: 'independance',
            label: 'Kemandirian',
            sortable: true,
            render: (pkg) => (
                <button
                    onClick={() => navigate('/munaqasyah/question-package/class', { state: { semester: pkg.name, category: 'independance', seed: pkg.independance } })}
                    className='button-primary w-24'>
                    Unduh
                </button>
            )
        },
        {
            key: 'actions',
            label: 'Aksi',
            render: (pkg) => (
                <div className="flex gap-2">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            // navigate(`/munaqasyah/question-bank/${classGrade}/${question._id}/update`);
                        }}
                        className="p-2 hover:bg-gray-100 rounded-full"
                    >
                        <Download className="w-4 h-4" />
                    </button>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            // navigate(`/munaqasyah/question-bank/${classGrade}/${question._id}/update`);
                        }}
                        className="p-2 hover:bg-gray-100 rounded-full"
                    >
                        <RefreshCw className="w-4 h-4" />
                    </button>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            // handleDeleteQuestion(question._id);
                        }}
                        className="p-2 hover:bg-gray-100 rounded-full text-red-500"
                    >
                        <Trash className="w-4 h-4" />
                    </button>
                </div>
            )
        }
    ];

    return (
        <div className="min-h-screen px-4 py-8 md:p-8">
            <div className='max-w-6xl mx-auto'>
                <div className="flex flex-col justify-between items-stretch gap-2 mb-4">
                    <div className="flex items-center mb-6 gap-4">
                        <h1 className="text-2xl font-semibold text-gray-900">{'Paket Soal Daerah (under construction)'}</h1>
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
                        searchableColumns={['name']}
                        initialSort={{ key: 'name', direction: 'ascending' }}
                        isLoading={isLoading}
                        config={{
                            showFilter: false,
                            showSearch: true,
                            showTopEntries: true,
                            showBottomEntries: true,
                            showPagination: true,
                            clickableRows: false,
                            entriesOptions: [5, 10, 25, 50, 100]
                        }}
                        tableId="packages-table"
                    />
                )}
            </div>
        </div>
    )
}

export default QuestionPackageView