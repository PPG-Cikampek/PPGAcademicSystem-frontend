import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "./api";

const ACCOUNT_REQUESTS_KEY = ["accountRequests"];

export const useAccountRequests = (options = {}) => {
    return useQuery({
        queryKey: ACCOUNT_REQUESTS_KEY,
        queryFn: async () => {
            const response = await api.get("/users/account-requests/");
            return response.data;
        },
        ...options,
    });
};

export const useRespondAccountRequestMutation = (options = {}) => {
    const queryClient = useQueryClient();
    const { onSuccess: userOnSuccess, onError: userOnError, ...rest } = options;

    return useMutation({
        mutationFn: async ({ ticketId, respond, reason }) => {
            const payload = { ticketId, respond };

            if (respond === "rejected" && reason) {
                payload.reason = reason;
            }

            const response = await api.patch(
                "/users/account-requests/ticket",
                payload
            );
            return response.data;
        },
        onSuccess: (data, variables, context) => {
            queryClient.invalidateQueries({ queryKey: ACCOUNT_REQUESTS_KEY });

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

export const useApproveAllAccountRequestsMutation = (options = {}) => {
    const queryClient = useQueryClient();
    const { onSuccess: userOnSuccess, onError: userOnError, ...rest } = options;

    return useMutation({
        mutationFn: async () => {
            const response = await api.post(
                "/users/account-requests/approve-all"
            );
            return response.data;
        },
        onSuccess: (data, variables, context) => {
            queryClient.invalidateQueries({ queryKey: ACCOUNT_REQUESTS_KEY });

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
