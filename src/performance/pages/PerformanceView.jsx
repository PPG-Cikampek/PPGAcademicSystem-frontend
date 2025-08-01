import React, { useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

import DatePicker, { registerLocale } from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import idID from "date-fns/locale/id";

import useHttp from '../../shared/hooks/http-hook';
import { AuthContext } from '../../shared/Components/Context/auth-context';

import LoadingCircle from '../../shared/Components/UIElements/LoadingCircle';

import ExperimentalCards from '../components/ExperementalCards';
import PieChart from '../components/PieChart';
import { academicYearFormatter } from '../../shared/Utilities/academicYearFormatter';
import { getMonday } from '../../shared/Utilities/getMonday';

const PerformanceView = () => {

  const { isLoading, error, sendRequest, setError } = useHttp();

  const [academicYearsList, setAcademicYearsList] = useState();
  const [selectedAcademicYear, setSelectedAcademicYear] = useState(null);

  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [periode, setPeriode] = useState(null);

  const [branchesList, setBranchesList] = useState();
  const [selectedBranch, setSelectedBranch] = useState(null);

  const [subBranchesList, setSubBranchesList] = useState();
  const [selectedSubBranch, setSelectedSubBranch] = useState(null);

  const [classesList, setClassesList] = useState();
  const [selectedClass, setSelectedClass] = useState(null);

  const [attendanceData, setAttendanceData] = useState();
  const [overallAttendances, setOverallAttendances] = useState();
  const [violationData, setViolationData] = useState();

  const auth = useContext(AuthContext);
  const navigate = useNavigate();

  const violationTranslations = {
    attribute: "Perlengkapan Belajar",
    attitude: "Sikap",
    tidiness: "Kerapihan",
  };

  const fetchAcademicYears = useCallback(async () => {
    try {
      const responseData = await sendRequest(`${import.meta.env.VITE_BACKEND_URL}/academicYears/?populate=subBranchYears`);
      setAcademicYearsList(responseData.academicYears);
    } catch (err) { }
  }, [sendRequest]);

  const fetchAttendanceData = useCallback(async () => {
    const url = `${import.meta.env.VITE_BACKEND_URL}/attendances/reports/`;
    const body = JSON.stringify({
      academicYearId: selectedAcademicYear,
      branchId: selectedBranch,
      subBranchId: selectedSubBranch,
      classId: selectedClass,
      startDate: startDate ? startDate.toISOString() : null,
      endDate: endDate ? endDate.toISOString() : null,
    });

    try {
      const attendanceData = await sendRequest(url, 'POST', body, {
        'Content-Type': 'application/json',
      });

      const { overallStats, violationStats, ...cardsData } = attendanceData

      setOverallAttendances(null)
      setViolationData(null)
      setAttendanceData(cardsData);
      setOverallAttendances(attendanceData.overallStats);
      setViolationData(attendanceData.violationStats);
    } catch (err) { }
  }, [sendRequest, selectedAcademicYear, selectedBranch, selectedSubBranch, selectedClass, startDate, endDate]);

  useEffect(() => {
    registerLocale("id-ID", idID);
    fetchAcademicYears();
    fetchAttendanceData();
  }, [fetchAcademicYears, fetchAttendanceData]);

  const selectAcademicYearHandler = (academicYearId) => {
    setOverallAttendances(null)
    setViolationData(null)
    setAttendanceData(null)
    setSelectedAcademicYear(academicYearId);
    setBranchesList([]);
    setSelectedBranch(null);
    setSubBranchesList([]);
    setSelectedSubBranch(null);
    setClassesList([]);
    setSelectedClass(null);

    if (academicYearId !== '') {
      fetchBranches();
    }
  };

  const fetchBranches = async () => {
    console.log('fetching branches!')
    try {
      const responseData = await sendRequest(`${import.meta.env.VITE_BACKEND_URL}/levels/branches/`);
      setBranchesList(responseData.branches);
    } catch (err) { }
  };

  const selectBranchHandler = (branchId) => {
    setOverallAttendances(null)
    setViolationData(null)
    setAttendanceData(null)
    setSelectedBranch(branchId);
    setSubBranchesList([]);
    setSelectedSubBranch(null);
    setClassesList([]);
    setSelectedClass(null);

    if (branchId !== '') {
      fetchSubBranchesList(branchId);
    }
  };

  const fetchSubBranchesList = async (branchId) => {
    try {
      const responseData = await sendRequest(`${import.meta.env.VITE_BACKEND_URL}/levels/branches/${branchId}?populate=true`);
      setSubBranchesList(responseData.branch.subBranches);
    } catch (err) { }
  };

  const selectSubBranchHandler = (subBranchId) => {
    setOverallAttendances(null)
    setViolationData(null)
    setAttendanceData(null)
    setSelectedSubBranch(subBranchId);
    setClassesList([]);
    setSelectedClass(null);

    if (subBranchId !== '') {
      fetchClassesList(subBranchId);
    }
  };

  const fetchClassesList = async (subBranchId) => {
    const url = `${import.meta.env.VITE_BACKEND_URL}/subBranchYears/teaching-group/${subBranchId}/academic-year/${selectedAcademicYear}`;
    try {
      const responseData = await sendRequest(url);
      setClassesList(responseData.subBranchYear.classes);
    } catch (err) { }
  };

  const selectClassHandler = (classId) => {
    setOverallAttendances(null)
    setViolationData(null)
    setAttendanceData(null)
    setSelectedClass(classId);
  };

  const selectDateRangeHandler = (dates) => {
    setOverallAttendances(null)
    setViolationData(null)
    setAttendanceData(null)
    const [start, end] = dates;
    if (start && end) {
      setPeriode(start.toLocaleDateString('id-ID', {
        day: '2-digit',
        timeZone: 'Asia/Jakarta'
      }) + " - " +
        end.toLocaleDateString('id-ID', {
          day: '2-digit',
          month: 'long',
          year: 'numeric',
          timeZone: 'Asia/Jakarta'
        }))
    }

    setStartDate(start);
    setEndDate(end);
  };

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8 md:p-8">
      <main className="max-w-6xl mx-auto">
        {(!academicYearsList || isLoading) && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex justify-center items-center w-full h-dvh">
            <LoadingCircle size={32} />
          </div>
        )}
        {academicYearsList && (
          <div className="card-basic rounded-md flex-col gap-4">

            <div className="flex justify-between">
              <div className={`flex flex-col`}>
                <h2 className="text-xl font-bold">Daerah Cikampek</h2>
                {/* <p className="text-sm text-gray-600">
                          Target Semester: {subBranchData.semesterTarget} hari
                      </p> */}
              </div>
            </div>

            <div className="flex flex-col md:flex-row justify-between gap-4">

              <div className="flex flex-col gap-5">
                <div className="flex flex-row gap-4 items-center">
                  <div className='flex flex-col gap-[18px]'>
                    <div>Tahun Ajaran</div>
                    <div>Periode</div>
                    <div>Desa</div>
                    <div>Kelompok</div>
                    <div>Kelas</div>
                  </div>
                  <div className='flex flex-col gap-2 '>
                    <select
                      value={selectedAcademicYear ? selectedAcademicYear : ''}
                      onChange={(e) => selectAcademicYearHandler(e.target.value)}
                      className="border border-gray-400 px-2 py-1 rounded-full active:ring-2 active:ring-blue-300"
                      disabled={false}
                    >
                      {!selectedAcademicYear && <option value={''}>Pilih</option>}
                      {academicYearsList && academicYearsList.map((academicYear, index) => (
                        <option key={index} value={academicYear._id}>
                          {academicYearFormatter(academicYear.name)}
                        </option>
                      ))}
                    </select>
                    <DatePicker
                      dateFormat="dd/MM/yyyy"
                      selected={startDate}
                      onChange={selectDateRangeHandler}
                      maxDate={new Date(getMonday(new Date()).setDate(getMonday(new Date()).getDate() + 6))}
                      startDate={startDate}
                      endDate={endDate}
                      locale={'id-ID'}
                      isClearable
                      selectsRange
                      withPortal={window.innerWidth <= 768}
                      className={`${selectedAcademicYear && 'pr-8'} border border-gray-400 px-2 py-1 rounded-full active:ring-2 active:ring-blue-300`}
                      disabled={!selectedAcademicYear}
                      placeholderText={`${selectedAcademicYear ? 'Masukkan Periode' : 'Pilih Tahun Ajaran'}`}
                      onFocus={(e) => e.target.readOnly = true}
                    />
                    <select
                      value={selectedBranch ? selectedBranch : ''}
                      onChange={(e) => selectBranchHandler(e.target.value)}
                      className="border border-gray-400 px-2 py-1 rounded-full active:ring-2 active:ring-blue-300"
                      disabled={!selectedAcademicYear}
                    >
                      <option value={''}>Semua</option>
                      {branchesList && branchesList.map((branch, index) => (
                        <option key={index} value={branch._id}>
                          {branch.name}
                        </option>
                      ))}
                    </select>
                    <select
                      value={selectedSubBranch ? selectedSubBranch : ''}
                      onChange={(e) => selectSubBranchHandler(e.target.value)}
                      className="border border-gray-400 px-2 py-1 rounded-full active:ring-2 active:ring-blue-300"
                      disabled={!selectedBranch}
                    >
                      <option value={''}>Semua</option>
                      {subBranchesList && subBranchesList.map((subBranch, index) => (
                        <option key={index} value={subBranch._id}>
                          {subBranch.name}
                        </option>
                      ))}
                    </select>
                    <select
                      value={selectedClass ? selectedClass : ''}
                      onChange={(e) => selectClassHandler(e.target.value)}
                      className="border border-gray-400 px-2 py-1 rounded-full active:ring-2 active:ring-blue-300"
                      disabled={!selectedSubBranch}
                    >
                      <option value={''}>Semua</option>
                      {classesList && classesList.map((cls, index) => (
                        <option key={index} value={cls._id}>
                          {cls.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  {/* <div className="flex-col gap-2 border-t py-t mt-4 hidden">
                <div>{selectedAcademicYear ? academicYearsList.map((academicYear, index) => {
                  if (academicYear._id === selectedAcademicYear) {
                    return <p key={index}> {academicYear.name} - {academicYear.id} </p>
                  }
                }) : ''}</div>
                <div>{selectedBranch ? branchesList.map((branch, index) => {
                  if (branch._id === selectedBranch) {
                    return <p key={index}> {branch.name} - {branch.id} </p>
                  }
                }) : ''}</div>
                <div>{selectedSubBranch ? subBranchesList.map((subBranch, index) => {
                  if (subBranch._id === selectedSubBranch) {
                    return <p key={index}> {subBranch.name} - {subBranch.id} </p>
                  }
                }) : ''}</div>
                <div>{selectedClass ? classesList.map((cls, index) => {
                  if (cls._id === selectedClass) {
                    return <p key={index}> {cls.name} - {cls.id} </p>
                  }
                }) : ''}</div>
              </div> */}
                </div>

                <div className="self-start flex flex-row gap-2">
                  {/* Left Column: Violation Names */}
                  <div className="flex flex-col gap-1">
                    {violationData && !isLoading && selectedAcademicYear && violationData.map(({ violation }, index) => (
                      <div key={index} className="">
                        {violationTranslations[violation] || violation}
                      </div>
                    ))}
                  </div>

                  {/* Right Column: Case Counts */}
                  <div className="flex flex-col gap-1 ">
                    {violationData && !isLoading && selectedAcademicYear && violationData.map(({ count }, index) => (
                      <div key={index} className="font-bold">
                        : {count} Temuan
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              {overallAttendances && !isLoading && selectedAcademicYear && (
                <div className=''>
                  <PieChart attendanceData={overallAttendances} />
                </div>
              )}
            </div>
          </div>

        )}
        {attendanceData && !isLoading && selectedAcademicYear && (
          <ExperimentalCards data={attendanceData} initialView={'branches'} month={periode} />
        )}
      </main>
    </div>
  );
};

export default PerformanceView;