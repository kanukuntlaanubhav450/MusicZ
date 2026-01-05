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
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), 30000); // 30s timeout

    try {
        const response = await fetch(url, { ...options, headers, signal: controller.signal });
        clearTimeout(id);
        return response;
    } catch (error) {
        clearTimeout(id);
        throw error;
    }
};
