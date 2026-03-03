import { useState, useCallback, useRef, useEffect } from 'react';
import { getApiToken } from '../queries/api';

const useHttp = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const activeHttpRequests = useRef([]);

    const sendRequest = useCallback(async (url, method = 'GET', body = null, headers = {}) => {
        setIsLoading(true);
        setError(null);

        const httpAbortCtrl = new AbortController();
        activeHttpRequests.current.push(httpAbortCtrl);

        // Automatically add Authorization header from shared api token
        const mergedHeaders = { ...headers };
        const token = getApiToken();
        if (token && !mergedHeaders.Authorization && !mergedHeaders.authorization) {
            mergedHeaders.Authorization = `Bearer ${token}`;
        }

        try {
            const response = await fetch(url, {
                method,
                body,
                headers: mergedHeaders,
                signal: httpAbortCtrl.signal
            });

            const responseData = await response.json();

            activeHttpRequests.current = activeHttpRequests.current.filter(
                (reqCtrl) => reqCtrl !== httpAbortCtrl
            );

            if (!response.ok) {
                throw new Error(responseData.message || 'Something went wrong');
            }

            setIsLoading(false);
            return responseData;
        } catch (err) {
            if (err.name === 'AbortError') {
                return;
            }
            setIsLoading(false);
            setError(err.message || 'Gagal menghubungi server!');
            throw err;
        }
    }, []);

    useEffect(() => {
        return () => {
            activeHttpRequests.current.forEach((abortCtrl) => abortCtrl.abort());
        };
    }, []);

    return { isLoading, error, sendRequest, setError, setIsLoading };
};

export default useHttp;
