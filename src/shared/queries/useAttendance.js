import { useQuery } from "@tanstack/react-query";
import api from "./api";

// Fetch attendance data for a specific class and date
export const useAttendanceData = (classId, attendanceDate, options = {}) => {
    return useQuery({
        queryKey: ["attendanceData", classId, attendanceDate],
        queryFn: async () => {
            const response = await api.post(`/attendances/${classId}`, {
                date: attendanceDate,
            });
            const data = response.data;
            const formattedData = data.map((obj) => ({
                ...obj,
                isSelected: false, // Add isSelected property to each object
            }));
            return formattedData;
        },
        enabled: !!classId && !!attendanceDate, // Only run query if both classId and attendanceDate are provided
        ...options,
    });
};

// Fetch class data with populated branchYear
export const useClassData = (classId, options = {}) => {
    return useQuery({
        queryKey: ["classData", classId],
        queryFn: async () => {
            const response = await api.get(
                `/classes/${classId}?populate=branchYear`
            );
            return response.data;
        },
        enabled: !!classId, // Only run query if classId is provided
        ...options,
    });
};
