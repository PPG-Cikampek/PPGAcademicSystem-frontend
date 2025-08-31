import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "./api";

// export const useStudentPerformance = (studentId) => {
//     return useQuery(["studentPerformance", studentId], async () => {
//         const response = await api.get(`/students/${studentId}/performance`);
//         return response.data;
//     });
// };
