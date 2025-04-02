import { Post, User, HealthStatus, ApiError } from '../types'; 

const API_BASE_URL = 'http://localhost:8080';

const handleResponse = async <T>(response: Response): Promise<T> => {
    if (!response.ok) {
        let errorMessage = `HTTP error! status: ${response.status}`;
        try {
            const errorData = await response.json();
            errorMessage = errorData?.message || errorMessage;
            if (response.status === 503 && !errorMessage.includes('(503)')) {
                 errorMessage = errorData?.message
                    ? `${errorData.message} (503)`
                    : 'Service temporarily unavailable (503)';
            }
        } catch (e) {
             // Ignore if response body is not JSON or empty
        }
        throw new Error(errorMessage);
    }

    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
        return response.json() as Promise<T>;
    } else {
         return response.json() as Promise<T>;
    }
};

const handleError = (error: unknown): ApiError => {
    console.error('API call failed:', error);
    if (error instanceof Error) {
        return { error: error.message };
    }
    return { error: 'An unknown network error occurred.' };
};

export const checkHealth = async (): Promise<HealthStatus | ApiError> => {
    try {
        const response = await fetch(`${API_BASE_URL}/health`);
        return await handleResponse<HealthStatus>(response);
    } catch (error) {
        return handleError(error);
    }
};

export const getFeedPosts = async (): Promise<Post[] | ApiError> => {
    try {
        const response = await fetch(`${API_BASE_URL}/posts?type=latest`);
        const data = await handleResponse<Post[]>(response);
        return Array.isArray(data) ? data : []; 
    } catch (error) {
        return handleError(error);
    }
};

export const getTopUsers = async (): Promise<User[] | ApiError> => {
    try {
        const response = await fetch(`${API_BASE_URL}/users`);
        const data = await handleResponse<User[]>(response);
        return Array.isArray(data) ? data : [];
    } catch (error) {
        return handleError(error);
    }
};

export const getTrendingPosts = async (): Promise<Post[] | ApiError> => {
    try {
        const response = await fetch(`${API_BASE_URL}/posts?type=popular`);
        const data = await handleResponse<Post[]>(response);
        return Array.isArray(data) ? data : [];
    } catch (error) {
        return handleError(error);
    }
};