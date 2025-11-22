import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "./api";

// Fetch munaqasyah question list by classes
export const useQuestionBankByClass = (options = {}) => {
    return useQuery({
        queryKey: ["munaqasyah", "classes"],
        queryFn: async () => {
            const response = await api.get(`/munaqasyahs/classes`);
            return response?.data?.classes ?? response?.data;
        },
        ...options,
    });
};

export default useQuestionBankByClass;

export const useQuestionBank = (classGrade, options = {}) => {
    return useQuery({
        queryKey: ["questionBank", classGrade],
        queryFn: async () => {
            const response = await api.get(
                `/munaqasyahs/questions/class/${classGrade}`
            );
            return response?.data?.questions ?? [];
        },
        enabled: Boolean(classGrade),
        ...options,
    });
};

export const useQuestion = (questionId, options = {}) => {
    return useQuery({
        queryKey: ["question", questionId],
        queryFn: async () => {
            const response = await api.get(
                `/munaqasyahs/questions/${questionId}`
            );
            return response?.data?.question ?? null;
        },
        enabled: Boolean(questionId),
        ...options,
    });
};

export const useCreateQuestionMutation = (options = {}) => {
    const queryClient = useQueryClient();
    const { onSuccess: userOnSuccess, onError: userOnError, ...rest } = options;

    return useMutation({
        mutationFn: async (data) => {
            const response = await api.post(`/munaqasyahs/questions/`, data);
            return response.data;
        },
        onSuccess: (data, variables, context) => {
            if (variables?.classGrade) {
                queryClient.invalidateQueries({
                    queryKey: ["questionBank", variables.classGrade],
                });
            }

            if (typeof userOnSuccess === "function") {
                userOnSuccess(data, variables, context);
            }
        },
        onError: (error, variables, context) => {
            if (typeof userOnError === "function") {
                userOnError(error, variables, context);
            }
        },
        ...rest,
    });
};

export const useUpdateQuestionMutation = (options = {}) => {
    const queryClient = useQueryClient();
    const { onSuccess: userOnSuccess, onError: userOnError, ...rest } = options;

    return useMutation({
        mutationFn: async ({ questionId, data }) => {
            const response = await api.patch(
                `/munaqasyahs/questions/${questionId}`,
                data
            );
            return response.data;
        },
        onSuccess: (data, variables, context) => {
            if (variables?.questionId) {
                queryClient.invalidateQueries({
                    queryKey: ["question", variables.questionId],
                });
            }
            if (variables?.classGrade) {
                queryClient.invalidateQueries({
                    queryKey: ["questionBank", variables.classGrade],
                });
            }

            if (typeof userOnSuccess === "function") {
                userOnSuccess(data, variables, context);
            }
        },
        onError: (error, variables, context) => {
            if (typeof userOnError === "function") {
                userOnError(error, variables, context);
            }
        },
        ...rest,
    });
};

export const useDeleteQuestionMutation = (options = {}) => {
    const queryClient = useQueryClient();
    const { onSuccess: userOnSuccess, onError: userOnError, ...rest } = options;

    return useMutation({
        mutationFn: async ({ questionId }) => {
            const response = await api.delete(
                `/munaqasyahs/questions/${questionId}`
            );
            return response.data;
        },
        onSuccess: (data, variables, context) => {
            if (variables?.classGrade) {
                queryClient.invalidateQueries({
                    queryKey: ["questionBank", variables.classGrade],
                });
            }
            queryClient.invalidateQueries({
                queryKey: ["question", variables?.questionId],
            });

            if (typeof userOnSuccess === "function") {
                userOnSuccess(data, variables, context);
            }
        },
        onError: (error, variables, context) => {
            if (typeof userOnError === "function") {
                userOnError(error, variables, context);
            }
        },
        ...rest,
    });
};

export const useUpdateQuestionStatusMutation = (options = {}) => {
    const queryClient = useQueryClient();
    const { onSuccess: userOnSuccess, onError: userOnError, ...rest } = options;

    return useMutation({
        mutationFn: async ({ questionId, status }) => {
            const response = await api.patch(
                `/munaqasyahs/questions/${questionId}/status`,
                { status }
            );
            return response.data;
        },
        onSuccess: (data, variables, context) => {
            if (variables?.questionId) {
                queryClient.setQueriesData(
                    { queryKey: ["question", variables.questionId] },
                    (previous) =>
                        previous
                            ? { ...previous, status: variables.status }
                            : previous
                );
            }
            if (variables?.classGrade) {
                queryClient.invalidateQueries({
                    queryKey: ["questionBank", variables.classGrade],
                });
            }

            if (typeof userOnSuccess === "function") {
                userOnSuccess(data, variables, context);
            }
        },
        onError: (error, variables, context) => {
            if (typeof userOnError === "function") {
                userOnError(error, variables, context);
            }
        },
        ...rest,
    });
};