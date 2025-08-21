import React, { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

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

const CombinedPieChart = ({ attendanceData }) => {
    console.log('Showing charts!')
    const filteredData = attendanceData.filter(item => item.percentage > 0).map(item => ({
        name: `${item.status} ${item.percentage}%`,
        value: item.percentage,
        fill: getChartColors(item.status),
    }));

    return (
        <PieChart width={128} height={256}>
            <Pie
                data={filteredData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius="50%"
                outerRadius="100%"
                fill="#8884d8"
            >
                {filteredData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
            </Pie>
        </PieChart>
    );
};

const PerformanceReportChart = ({ attendanceData }) => {
    const [transformedData, setTransformedData] = useState([]);

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

        setTransformedData(
            [hadir, tidakHadir, tanpaKeterangan && tanpaKeterangan.count > 0 ? {
                status: "Tanpa Keterangan",
                count: tanpaKeterangan.count,
                percentage: tanpaKeterangan.percentage,
            } : null].filter(Boolean)
        );
    };

    useEffect(() => {
        transformData();
    }, [attendanceData]);

    return (
        <div className="p-6">
            <CombinedPieChart attendanceData={transformedData} />
        </div>
    );
};

export default PerformanceReportChart;