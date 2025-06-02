import React, { useContext, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import useHttp from '../../shared/hooks/http-hook';
import QRCodeScanner from '../components/QRCodeScanner';
import StatusBar from '../components/StatusBar';
import InfoCard from '../../teacher-role/shared/Components/UIElements/InfoCard';

import SequentialAnimation from '../../teacher-role/shared/Components/Animation/SequentialAnimation';
import LoadingCircle from '../../shared/Components/UIElements/LoadingCircle';

import { AuthContext } from '../../shared/Components/Context/auth-context';
import { MunaqasyahScoreContext } from '../context/MunaqasyahScoreContext';

const MunaqasyahScannerView = () => {
    const { isLoading, error, sendRequest, setError, setIsLoading } = useHttp();

    const { state, dispatch, fetchYearData } = useContext(MunaqasyahScoreContext);

    const auth = useContext(AuthContext)
    const teachingGroupYearId = auth.currentTeachingGroupYearId

    useEffect(() => {
        console.log(teachingGroupYearId)
        setIsLoading(true);

        fetchYearData(teachingGroupYearId, dispatch);

        setIsLoading(false);
    }, [teachingGroupYearId]);

    useEffect(() => {
        console.log(state.isTeachingGroupYearMunaqasyahStarted)
    }, [state.isTeachingGroupYearMunaqasyahStarted])

    return (
        <div className='flex flex-col pb-24'>
            {state.isTeachingGroupYearMunaqasyahStarted === true && (
                <SequentialAnimation variant={2}>
                    <StatusBar academicYear={auth.currentTeachingGroupYear} />
                </SequentialAnimation>)}

            {isLoading && (
                <div className={`flex justify-center mt-16 `}>
                    <LoadingCircle size={32} />
                </div>
            )}

            {!isLoading && (
                <SequentialAnimation variant={2}>
                    {state.isTeachingGroupYearMunaqasyahStarted === true ?
                        (< div className='card-basic m-4'>
                            <QRCodeScanner />
                        </div>) : state.isTeachingGroupYearMunaqasyahStarted === false ? (
                            <InfoCard className={'mx-4 my-12'}>
                                <p>Munaqosah Belum Dimulai!</p>
                            </InfoCard>)
                            : auth.currentTeachingGroupYear === null && (
                                <InfoCard className={'mx-4 my-12'}>
                                    <p>Tidak ada tahun ajaran aktif, hubungi PJP kelompok!</p>
                                </InfoCard>
                            ) }
                </SequentialAnimation>
            )}
        </div >
    );
};

export default MunaqasyahScannerView;