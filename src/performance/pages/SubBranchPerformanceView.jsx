import React, { useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

import useHttp from '../../shared/hooks/http-hook';
import { AuthContext } from '../../shared/Components/Context/auth-context';

import DatePicker, { registerLocale } from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import idID from "date-fns/locale/id";
import LoadingCircle from '../../shared/Components/UIElements/LoadingCircle';

import PieChart from '../components/PieChart';
import SubBranchAdminPerformanceCards from '../components/SubBranchAdminPerformanceCards';

import { useReactToPrint } from 'react-to-print';
import { academicYearFormatter } from '../../shared/Utilities/academicYearFormatter';
import { getMonday } from '../../shared/Utilities/getMonday';

const SubBranchPerformanceView = () => {

  const { isLoading, error, sendRequest, setError, setIsLoading } = useHttp();

  const [academicYearsList, setAcademicYearsList] = useState();
  const [selectedAcademicYear, setSelectedAcademicYear] = useState(null);
  const [subBranchData, setSubBranchData] = useState();

  const [classesList, setClassesList] = useState();
  const [selectedClass, setSelectedClass] = useState(null);

  const [attendanceData, setAttendanceData] = useState();
  const [overallAttendances, setOverallAttendances] = useState();
  const [violationData, setViolationData] = useState();

  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [periode, setPeriode] = useState(null);

  const auth = useContext(AuthContext);
  const navigate = useNavigate();

  const contentRef = useRef(null);

  const printFn = useReactToPrint({
    contentRef: contentRef,
    documentTitle: `Laporan_Performa_Kelompok_${subBranchData && subBranchData.subBranchName}`,
  });

  const handlePrint = () => {
    const canvasElements = contentRef.current.querySelectorAll('canvas');
    let validCanvas = true;

    canvasElements.forEach(canvas => {
      if (canvas.width === 0 || canvas.height === 0) {
        canvas.width = 300; // Set default width
        canvas.height = 150; // Set default height
      }
    });

    if (validCanvas) {
      setTimeout(() => {
        printFn()
      }, 200)
    } else {
      console.error('Invalid canvas size detected.');
    }
  };

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
    const getSubBranchData = (data) => {
      if (!data || !data[0] || !data[0].subBranchId || !data[0].subBranchId.branchId) {
        return null;
      }

      const subBranchData = {
        branchName: data[0].subBranchId.branchId.name,
        subBranchName: data[0].subBranchId.name,
        semesterTarget: data[0].semesterTarget,
      };

      return subBranchData;
    };

    const url = `${import.meta.env.VITE_BACKEND_URL}/attendances/reports/`;
    const body = JSON.stringify({
      academicYearId: selectedAcademicYear,
      branchId: auth.userBranchId,
      subBranchId: auth.userSubBranchId,
      classId: selectedClass,
      startDate: startDate ? startDate.toISOString() : null,
      endDate: endDate ? endDate.toISOString() : null,
    });

    try {
      const attendanceData = await sendRequest(url, 'POST', body, {
        'Content-Type': 'application/json',
      });

      const { overallStats, violationStats, ...cardsData } = attendanceData

      setSubBranchData(getSubBranchData(attendanceData.subBranchYears))
      setOverallAttendances(null)
      setViolationData(null)
      setAttendanceData(null)
      setAttendanceData(cardsData);
      setOverallAttendances(attendanceData.overallStats);
      setViolationData(attendanceData.violationStats);
    } catch (err) { }
  }, [sendRequest, selectedAcademicYear, selectedClass, startDate, endDate]);

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
    setClassesList([]);
    setSelectedClass(null);
    setStartDate(null);
    setEndDate(null);

    if (academicYearId !== '') {
      fetchClassesList(academicYearId);
    }
  };

  const fetchClassesList = async (academicYear) => {
    const url = `${import.meta.env.VITE_BACKEND_URL}/subBranchYears/teaching-group/${auth.userSubBranchId}/academic-year/${academicYear || selectedAcademicYear}`;
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
    <div>


      <div ref={contentRef} className="min-h-screen bg-gray-50 px-4 py-8 md:p-8">
        <main className="max-w-6xl mx-auto">

          {(!academicYearsList || isLoading) && (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex justify-center items-center w-full h-dvh">
              <LoadingCircle size={32} />
            </div>
          )}
          {academicYearsList && (
            <div className="card-basic rounded-md flex-col gap-4">
              <div className="flex justify-between">
                {subBranchData && (
                  <div className={`flex flex-col`}>
                    <h2 className="text-xl font-bold">Kelompok {subBranchData.subBranchName}</h2>
                    {/* {subBranchData.semesterTarget && (<p className="text-sm text-gray-600">
                      Target Semester: {subBranchData.semesterTarget} hari
                    </p>)} */}
                  </div>
                )}
                {overallAttendances && !isLoading && selectedAcademicYear && (<button className='button-primary m-0 self-center' onClick={() => handlePrint()}>Print ke PDF</button>)}
              </div>

              <div className="flex flex-col md:flex-row justify-between gap-4">

                <div className="flex flex-col gap-5">

                  <div className="flex flex-row gap-4 items-center">
                    <div className='flex flex-col gap-[18px]'>
                      <div>Tahun Ajaran</div>
                      <div>Periode</div>
                      <div>Kelas</div>
                    </div>
                    <div className='flex flex-col gap-2'>
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
                        selectsRange
                        isClearable
                        withPortal={window.innerWidth <= 768}
                        className={`${selectedAcademicYear && 'pr-8'} border border-gray-400 px-2 py-1 rounded-full active:ring-2 active:ring-blue-300`}
                        disabled={!selectedAcademicYear}
                        placeholderText={`${selectedAcademicYear ? 'Semua Periode' : 'Pilih Tahun Ajaran'}`}
                        onFocus={(e) => e.target.readOnly = true}
                      />
                      <select
                        value={selectedClass ? selectedClass : ''}
                        onChange={(e) => selectClassHandler(e.target.value)}
                        className="border border-gray-400 px-2 py-1 rounded-full active:ring-2 active:ring-blue-300"
                      >
                        <option value={''}>Semua</option>
                        {classesList && classesList.map((cls, index) => (
                          <option key={index} value={cls._id}>
                            {cls.name}
                          </option>
                        ))}
                      </select>
                    </div>
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
          {violationData && attendanceData && !isLoading && selectedAcademicYear && (
            <SubBranchAdminPerformanceCards data={attendanceData} violationData={violationData} initialView={'classes'} month={periode} />
          )}
        </main>
      </div>
    </div>
  );
};

export default SubBranchPerformanceView;