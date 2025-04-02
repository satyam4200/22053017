// apiClient.js
import axios from 'axios';

const BASE_URL = 'http://20.244.56.144/evaluation-service';

const AUTH_PAYLOAD = {
    email: "22053017@kiit.ac.in",
    name: "satyam kumar",
    rollNo: "22053017",
    accessCode: "nwpwrZ", 
    clientID: "118d9946-0233-441e-a8e8-99e4afdaefb0",
    clientSecret: "VJpRkXuMFmbBmrdA"
};


let currentAccessToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiZXhwIjoxNzQzNTk4ODcxLCJpYXQiOjE3NDM1OTg1NzEsImlzcyI6IkFmZm9yZG1lZCIsImp0aSI6IjExOGQ5OTQ2LTAyMzMtNDQxZS1hOGU4LTk5ZTRhZmRhZWZiMCIsInN1YiI6IjIyMDUzMDE3QGtpaXQuYWMuaW4ifSwiZW1haWwiOiIyMjA1MzAxN0BraWl0LmFjLmluIiwibmFtZSI6InNhdHlhbSBrdW1hciIsInJvbGxObyI6IjIyMDUzMDE3IiwiYWNjZXNzQ29kZSI6Im53cHdyWiIsImNsaWVudElEIjoiMTE4ZDk5NDYtMDIzMy00NDFlLWE4ZTgtOTllNGFmZGFlZmIwIiwiY2xpZW50U2VjcmV0IjoiVkpwUmtYdU1GbWJCbXJkQSJ9.-6aIZUw0Z820rQjjCk_cDGgjMqAM-ofB7uQU-jtj8AM"; // Initial token

let isRefreshingToken = false;
let tokenRefreshPromise = null;

const apiInstance = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

async function refreshAuthToken() {
    console.log("Attempting to refresh auth token...");
    try {
        const response = await axios.post(`${BASE_URL}/auth`, AUTH_PAYLOAD); 
        if (response.data && response.data.access_token) {
            const newAccessToken = response.data.access_token;
            console.log("Successfully refreshed auth token.");
            currentAccessToken = newAccessToken; 
            return newAccessToken;
        } else {
            throw new Error("Auth response did not contain access_token");
        }
    } catch (error) {
        console.error("!!! CRITICAL: Failed to refresh auth token:", error.response?.status, error.response?.data || error.message);
        currentAccessToken = null; 
        throw error; 
    }
}

apiInstance.interceptors.request.use(
    (config) => {
        if (currentAccessToken) {
            config.headers['Authorization'] = `Bearer ${currentAccessToken}`;
        } else {
             console.warn("No access token available for outgoing request.");
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);


apiInstance.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {

            if (!isRefreshingToken) {
                isRefreshingToken = true;
                originalRequest._retry = true; 

                tokenRefreshPromise = refreshAuthToken()
                    .then(newToken => {
                        originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
                         return apiInstance(originalRequest); 
                    })
                    .catch(refreshError => {
                        console.error("Token refresh failed. Cannot retry original request.", originalRequest.url);
                        return Promise.reject(error); 
                    })
                    .finally(() => {
                        isRefreshingToken = false;
                        tokenRefreshPromise = null; 
                    });

                 return tokenRefreshPromise; 

            } else {
                console.log(`Request to ${originalRequest.url} waiting for token refresh...`);
                 originalRequest._retry = true; 

                return tokenRefreshPromise.then(() => {
                     console.log(`Retrying ${originalRequest.url} after waiting for token refresh.`);
                    return apiInstance(originalRequest);
                }).catch(() => {
                     console.error(`Token refresh failed while ${originalRequest.url} was waiting.`)
                     return Promise.reject(error);
                });
            }

        } else if (error.response?.status === 401 && originalRequest._retry) {
             console.error(`401 Unauthorized even after token refresh/retry for ${originalRequest.url}. Giving up.`);
        }
        return Promise.reject(error);
    }
);



async function fetchUsers() {
    try {
        console.log('Fetching users...');
        const response = await apiInstance.get('/users'); 
        console.log(`Fetched ${Object.keys(response.data?.users || {}).length} users.`);
        return response.data.users || {};
    } catch (error) {
        console.error('Final error fetching users (after potential retry):', error.response?.status, error.response?.data || error.message);
        return {};
    }
}

async function fetchPostsForUser(userId) {
    try {
        const response = await apiInstance.get(`/users/${userId}/posts`);
        return response.data.posts || [];
    } catch (error) {
        console.error(`Final error fetching posts for user ${userId} (after potential retry):`, error.response?.status, error.response?.data || error.message);
        return [];
    }
}

async function fetchCommentsForPost(postId) {
    try {
        const response = await apiInstance.get(`/posts/${postId}/comments`);
        return response.data.comments || [];
    } catch (error) {
        console.error(`Final error fetching comments for post ${postId} (after potential retry):`, error.response?.status, error.response?.data || error.message);
        return [];
    }
}

export { fetchUsers, fetchPostsForUser, fetchCommentsForPost };