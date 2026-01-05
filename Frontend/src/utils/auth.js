import { auth } from '../services/firebase';

export const getAuthToken = async () => {
    if (!auth.currentUser) return null;
    return await auth.currentUser.getIdToken();
};

export const authenticatedFetch = async (url, options = {}) => {
    const token = await getAuthToken();
    const headers = {
        ...options.headers,
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };

    const timeoutController = new AbortController();
    const timeoutId = setTimeout(() => timeoutController.abort(), 30000); // 30s timeout
    const externalSignal = options.signal;

    // Check if already aborted before starting
    if (externalSignal?.aborted) {
        clearTimeout(timeoutId);
        throw new DOMException('Aborted', 'AbortError');
    }

    // Compose signals: use AbortSignal.any if available, otherwise manual listener
    let combinedSignal;
    let abortHandler;

    if (typeof AbortSignal.any === 'function' && externalSignal) {
        combinedSignal = AbortSignal.any([timeoutController.signal, externalSignal]);
    } else {
        combinedSignal = timeoutController.signal;
        if (externalSignal) {
            abortHandler = () => timeoutController.abort();
            externalSignal.addEventListener('abort', abortHandler);
        }
    }

    try {
        const response = await fetch(url, {
            ...options,
            headers,
            signal: combinedSignal
        });
        return response;
    } finally {
        clearTimeout(timeoutId);
        // Clean up listener if we added one manually
        if (abortHandler && externalSignal) {
            externalSignal.removeEventListener('abort', abortHandler);
        }
    }
};
