import React, { useEffect, useState, useRef, memo } from 'react';
import { Doughnut } from 'react-chartjs-2';
import html2canvas from 'html2canvas';

const getChartColors = (status) => {
  const colors = {
    Hadir: '#10B981',
    Terlambat: '#F59E0B',
    Izin: '#3B82F6',
    Sakit: '#8B5CF6',
    'Tanpa Keterangan': '#EF4444',
    'Tidak Hadir': '#F59E0B',
  };
  return colors[status] || '#6B7280';
};

const IndividualDoughnut = ({ status, percentage }) => {
  const data = {
    labels: [status, 'Others'],
    datasets: [
      {
        data: [percentage, 100 - percentage],
        backgroundColor: [getChartColors(status), '#E5E7EB'],
        borderColor: '#FFFFFF',
        borderWidth: 0,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      tooltip: { enabled: false },
      legend: { display: false },
    },
    cutout: '70%',
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-2">
      <div className="relative w-28 h-28">
        <Doughnut data={data} options={options} />
        <div className="absolute inset-0 flex items-center justify-center font-bold text-sm">
          {percentage} <span>%</span>
        </div>
      </div>
      <div
        className="px-2 py-1 text-white rounded-sm"
        style={{ backgroundColor: getChartColors(status) }}
      >
        {status}
      </div>
    </div>
  );
};

const CombinedDoughnutChart = ({ attendanceData, toImage }) => {
  const chartRef = useRef(null);
  const [chartImage, setChartImage] = useState(null);

  useEffect(() => {
    if (chartRef.current && toImage === true) {
      html2canvas(chartRef.current).then((canvas) => {
        setChartImage(canvas.toDataURL('image/png'));
      });
    }
  }, [attendanceData]);

  const filteredData = attendanceData.filter(item => item.percentage > 0);
  const data = {
    labels: filteredData.map((item) => item.status + ' ' + item.percentage + '%'),
    datasets: [
      {
        data: filteredData.map((item) => item.count),
        backgroundColor: filteredData.map((item) => getChartColors(item.status)),
        borderColor: '#FFFFFF',
        borderWidth: 0,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      // tooltip: { enabled: true },
      legend: { display: true },
    },
    cutout: '50%',
  };

  return (
    <div className="relative w-64 h-64" ref={chartRef}>
      {chartImage ? (
        <img src={chartImage} alt="Chart" />
      ) : (
        <Doughnut data={data} options={options} />
      )}
    </div>
  );
};

const MultiDoughnutChart = ({ attendanceData }) => (
  <div className="hidden md:flex flex-wrap justify-center gap-6 p-6 rounded-lg">
    {attendanceData.map((item) => (
      item.percentage > 0 && (
        <IndividualDoughnut key={item.status} status={item.status} percentage={item.percentage} />
      )
    ))}
  </div>
);

const PieChart = memo(({ attendanceData, chartType, toImage = false }) => {
  const [transformedData, setTransformedData] = useState([]);
  console.log(attendanceData)

  const transformData = () => {
    const hadir = attendanceData
      .filter((item) => ["Hadir", "Terlambat"].includes(item.status))
      .reduce(
        (acc, item) => ({
          status: "Hadir",
          count: acc.count + item.count,
          percentage: acc.percentage + item.percentage,
        }),
        { count: 0, percentage: 0 }
      );

    const tidakHadir = attendanceData
      .filter((item) => ["Izin", "Sakit"].includes(item.status))
      .reduce(
        (acc, item) => ({
          status: "Tidak Hadir",
          count: acc.count + item.count,
          percentage: acc.percentage + item.percentage,
        }),
        { count: 0, percentage: 0 }
      );

    let tanpaKeterangan = attendanceData.find(
      (item) => item.status === "Tanpa Keterangan"
    );

    const finalData = [hadir, tidakHadir, tanpaKeterangan && tanpaKeterangan.count > 0 ? {
      status: "Tanpa Keterangan",
      count: tanpaKeterangan.count,
      percentage: tanpaKeterangan.percentage,
    } : null].filter(Boolean)

    const finalDataFormatted = finalData.map((item) => ({
      ...item,
      percentage: item.percentage.toFixed(2),
    }));

    setTransformedData(finalDataFormatted);
    console.log(JSON.stringify(finalData, null, 2));

  };

  useEffect(() => {
    // transformData();
    setTransformedData(attendanceData);
  }, [attendanceData]);

  return (
    <div className="">
      {chartType === 'mobile' && (
        <CombinedDoughnutChart attendanceData={transformedData} toImage={toImage} />
      )}
      {!chartType && (
        <>
          <div className="md:hidden flex justify-center p-6">
            <CombinedDoughnutChart attendanceData={transformedData} />
          </div>
          <MultiDoughnutChart attendanceData={transformedData} />
        </>
      )}
    </div>
  )
}, (prevProps, nextProps) => {
  // Custom comparison function for React.memo
  // Only re-render if attendanceData actually changes
  if (!prevProps.attendanceData && !nextProps.attendanceData) return true;
  if (!prevProps.attendanceData || !nextProps.attendanceData) return false;
  
  // Deep comparison of attendanceData array
  if (prevProps.attendanceData.length !== nextProps.attendanceData.length) return false;
  
  return prevProps.attendanceData.every((item, index) => {
    const nextItem = nextProps.attendanceData[index];
    return item.status === nextItem.status && 
           item.count === nextItem.count && 
           item.percentage === nextItem.percentage;
  }) && prevProps.chartType === nextProps.chartType && 
       prevProps.toImage === nextProps.toImage;
});

export default PieChart;