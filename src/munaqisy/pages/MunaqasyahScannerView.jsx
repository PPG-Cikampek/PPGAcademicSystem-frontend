import React, { useContext, useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

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
    const branchYearId = auth.currentBranchYearId
    const subBranchId = auth.userSubBranchId
    const location = useLocation()
    const errorMessage = location.state?.errorMessage || "";

    useEffect(() => {
        console.log(branchYearId)
        setIsLoading(true);

        fetchYearData(branchYearId, subBranchId, dispatch);

        dispatch({ type: 'SET_SCORE_DATA', payload: [] });
        dispatch({ type: 'SET_STUDENT_DATA', payload: [] });

        setIsLoading(false);
    }, [branchYearId]);

    // useEffect(() => {
    //     console.log(state.studentScore);
    // }, [state.isBranchYearMunaqasyahStarted])

    return (
        <div className='flex flex-col pb-24'>
            <SequentialAnimation variant={2}>
                <StatusBar academicYear={auth.branchYear} />
            </SequentialAnimation>

            {isLoading && (
                <div className={`flex justify-center mt-16 `}>
                    <LoadingCircle size={32} />
                </div>
            )}

            {!isLoading && (
                <SequentialAnimation variant={2}>
                    {(state.isBranchYearMunaqasyahStarted === true) ?
                        (< div className='card-basic m-4'>
                            <QRCodeScanner errorMessage={errorMessage} />
                        </div>) : state.isBranchYearMunaqasyahStarted === false ? (
                            <InfoCard className={'mx-4 my-12'}>
                                <p>PJP Desa belum memulai munaqosah!</p>
                            </InfoCard>)
                            : auth.currentBranchYear === null && (
                                <InfoCard className={'mx-4 my-12'}>
                                    <p>Tidak ada tahun ajaran aktif, hubungi PJP Desa!</p>
                                </InfoCard>
                            )}
                </SequentialAnimation>
            )}
        </div >
    );
};

export default MunaqasyahScannerView;