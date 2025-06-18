import React, { useContext, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../shared/Components/Context/auth-context';
import useHttp from '../../shared/hooks/http-hook';
import { MunaqasyahScoreContext } from '../context/MunaqasyahScoreContext';

import StudentInitial from '../../shared/Components/UIElements/StudentInitial';
import SequentialAnimation from '../../teacher-role/shared/Components/Animation/SequentialAnimation';
import ScoreList from '../components/ScoreList';
import SkeletonLoader from '../../shared/Components/UIElements/SkeletonLoader';
import { GeneralContext } from '../../shared/Components/Context/general-context';

const StudentScoresView = () => {
    const { isLoading, error, sendRequest, setError, setIsLoading } = useHttp();

    const { state, dispatch, fetchYearData, fetchScoreData, patchScoreData } = useContext(MunaqasyahScoreContext);

    const location = useLocation();
    const scannedData = location.state?.scannedData;

    const general = useContext(GeneralContext);
    const auth = useContext(AuthContext);
    const branchYearId = auth.currentBranchYearId

    const navigate = useNavigate();

    // Add dataLoaded state
    const [dataLoaded, setDataLoaded] = useState(false);

    useEffect(() => {
        let isMounted = true;
        general.setMessage('Pilih "Selesai" untuk kembali!'); // Clear any previous messages
        dispatch({ type: 'SET_SCORE_DATA', payload: [] });
        dispatch({ type: 'SET_STUDENT_DATA', payload: [] });
        setDataLoaded(false); // Reset before fetching
        const fetchData = async () => {
            setIsLoading(true);
            try {
                await fetchScoreData(scannedData, branchYearId, dispatch, auth.userId);
                if (isMounted) setDataLoaded(true); // Set to true after fetch
            } finally {
                if (isMounted) setIsLoading(false);
            }
        };
        if (branchYearId && scannedData) {
            fetchData();
        }
        return () => { isMounted = false; };
    }, [branchYearId, scannedData]);

    useEffect(() => {
        // Guard: only check after data is loaded and valid
        if (
            dataLoaded &&
            state.studentScore &&
            state.studentScore.isBeingScored !== undefined &&
            state.studentScore.isBeingScored !== null &&
            auth.userId
        ) {
            console.log(state.studentScore.isBeingScored, auth.userId);
            if (
                state.studentScore.isBeingScored !== auth.userId
            ) {
                // Clear context state before navigating back to scanner
                navigate(`/munaqasyah/scanner`, {
                    state: {
                        errorMessage: "Siswa ini sedang dinilai oleh munaqis lain!",
                    }
                });
            }
        }
    }, [dataLoaded, state.studentScore, auth.userId, navigate]);

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

    // Determine which categories to show based on className
    let filteredScoreCategories = scoreCategories;
    if (state.studentData && state.studentData.className && !/(5|6)/.test(state.studentData.className)) {
        filteredScoreCategories = scoreCategories.filter(cat => !['independence', 'quranTafsir', 'hadithTafsir', 'memorizingHadith'].includes(cat.key));
    }

    const handleCategoryClick = (category) => {
        const data = {
            studentData: state.studentData,
            categoryData: {
                key: category.key,
                label: category.label,
                score: state.studentScore[category.key]
            },
            semester: parseInt(state.studentScore.branchYearId.academicYearId.name.slice(-1)),
            classGrade: state.studentScore.classId.name.split(' ').pop()
        }
        navigate(`/munaqasyah/examination`, {
            state: { data }
        });
        console.log(data)
    };

    const handleFinish = async () => {
        // Patch score with isBeingScored = "false"
        if (state.studentScore && state.studentScore.id) {
            const updatedScore = { ...state.studentScore, isBeingScored: "false" };
            await patchScoreData(updatedScore); // patchScoreData is in context
        }
        // Navigate back to scanner
        navigate(`/munaqasyah/scanner`, {
            state: {
                message: "Penilaian selesai, silakan scan siswa berikutnya."
            }
        });
    };

    return (
        <div className="min-h-screen bg-gray-50 ">
            <div className="flex items-center justify-between p-4">
                <h1 className="text-2xl font-semibold text-gray-900 mr-4">Munaqosah</h1>
                <button
                    className="button-primary m-0"
                    onClick={() => {
                        handleFinish()
                        general.setMessage(true);
                    }}
                >
                    Selesai
                </button>
            </div>
            {isLoading ? (
                <div className="flex flex-col pb-24">
                    <div className="card-basic justify-between mt-0 mx-4 pr-8 box-border">
                        <div className="flex flex-col">
                            <div className="flex-1 h-fit">
                                <div className="flex gap-2 items-center">
                                    <SkeletonLoader variant="circular" width={40} height={40} />
                                    <div className="flex flex-col justify-end">
                                        <SkeletonLoader width={100} height={16} className="mb-1" />
                                        <SkeletonLoader width={60} height={12} />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <SkeletonLoader width={80} height={16} className="self-center mt-2" />
                    </div>
                    <div className="mt-4 mx-4">
                        {filteredScoreCategories.map((cat, idx) => (
                            <div key={cat.key} className="mb-2">
                                <SkeletonLoader width={220} height={32} />
                            </div>
                        ))}
                    </div>
                </div>
            ) : (!isLoading && state.studentScore && state.studentData && (
                <div className='flex flex-col pb-24'>
                    <div className="card-basic justify-between items-center mt-0 mx-4 pr-8 box-border">
                        <SequentialAnimation variant={1}>
                            <div className="flex flex-col">
                                <div className="flex-1 h-fit">
                                    <div className="flex gap-2 items-center">
                                        {state.studentData.image ? (
                                            <img
                                                src={state.studentData.thumbnail ? state.studentData.thumbnail : `${import.meta.env.VITE_BACKEND_URL}/${state.studentData.image}`}
                                                alt="Profile"
                                                className="rounded-full size-10 shrink-0 border border-gray-200 bg-white"
                                            />
                                        ) : (
                                            <StudentInitial studentName={state.studentData.name} clsName={`size-10 rounded-full bg-blue-200 text-blue-500 flex items-center justify-center font-medium`} />
                                        )}
                                        <div className="flex flex-col justify-end">
                                            <div className="uppercase">{state.studentData.name}</div>
                                            <div className="text-xs text-gray-800">{state.studentData.nis}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </SequentialAnimation>
                        <SequentialAnimation variant={1}>
                            <div className="uppercase font-semibold self-center">{state.studentData.className}</div>
                        </SequentialAnimation>
                    </div>
                    {state.studentScore && (
                        <ScoreList
                            categories={filteredScoreCategories}
                            studentScore={state.studentScore}
                            onCategoryClick={handleCategoryClick}
                        />
                    )}
                </div>
            ))}
        </div>
    );
};

export default StudentScoresView;