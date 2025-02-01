// hooks/useHttp.js
import { useState, useCallback, useRef, useEffect } from 'react';

const useHttp = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const activeHttpRequests = useRef([]);

    const sendRequest = useCallback(async (url, method = 'GET', body = null, headers = {}) => {
        setIsLoading(true);
        setError(null);

        const httpAbortCtrl = new AbortController();
        activeHttpRequests.current.push(httpAbortCtrl);

        try {
            const response = await fetch(url, {
                method,
                body,
                headers,
                signal: httpAbortCtrl.signal // Attach the abort signal to the request
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
                // Request was aborted; no need to update state
                return;
            }
            setIsLoading(false);
            setError(err.message || 'Gagal menghubungi server!');
            throw err;
        }
    }, []);

    useEffect(() => {
        return () => {
            // Cleanup: abort any ongoing requests when the component using the hook unmounts
            activeHttpRequests.current.forEach((abortCtrl) => abortCtrl.abort());
        };
    }, []);

    return { isLoading, error, sendRequest, setError, setIsLoading };
};

export default useHttp;
