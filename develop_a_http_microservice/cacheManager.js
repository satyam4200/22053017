import NodeCache from 'node-cache';
import { fetchUsers, fetchPostsForUser, fetchCommentsForPost } from './apiClient.js'; 

const cache = new NodeCache({ stdTTL: 0, checkperiod: 600 }); 
const CACHE_KEYS = {
    USERS_MAP: 'usersMap',
    POSTS_LIST: 'postsList', 
    USER_POST_COUNTS: 'userPostCounts',
    DATA_STATUS: 'dataStatus', 
};

let isRefreshing = false; 
const REFRESH_INTERVAL_MS = 30 * 1000; 


async function refreshData() {
    if (isRefreshing) {
        console.log('Refresh already in progress. Skipping.');
        return;
    }
    isRefreshing = true;
    console.log(`Starting data refresh cycle at ${new Date().toISOString()}...`);

    try {
        const startTime = Date.now();

        const fetchedUsers = await fetchUsers();
        const userIds = Object.keys(fetchedUsers);
        const currentUsersMap = new Map(Object.entries(fetchedUsers));

        const postPromises = userIds.map(userId => fetchPostsForUser(userId));
        const userPostsResults = await Promise.allSettled(postPromises);

        const allPostsRaw = [];
        const currentUserPostCounts = new Map();
        userIds.forEach((userId, index) => {
            const result = userPostsResults[index];
            if (result.status === 'fulfilled' && Array.isArray(result.value)) {
                currentUserPostCounts.set(userId, result.value.length);
                allPostsRaw.push(...result.value);
            } else {
                const oldCounts = cache.get(CACHE_KEYS.USER_POST_COUNTS) || new Map();
                currentUserPostCounts.set(userId, oldCounts.get(userId) || 0);
                 if (result.status === 'rejected') {
                    console.warn(`Failed to fetch posts for user ${userId}: ${result.reason?.message}`);
                }
            }
        });

        console.log(`Fetched basic post data for ${userIds.length} users. Total raw posts: ${allPostsRaw.length}`);

        const commentPromises = allPostsRaw.map(post => fetchCommentsForPost(post.id));
        const commentResults = await Promise.allSettled(commentPromises);

        const enrichedPosts = [];
        allPostsRaw.forEach((post, index) => {
            const result = commentResults[index];
            let commentCount = 0;
            if (result.status === 'fulfilled' && Array.isArray(result.value)) {
                commentCount = result.value.length;
            } else {
                 if (result.status === 'rejected') {
                    console.warn(`Failed to fetch comments for post ${post.id}: ${result.reason?.message}`);
                }
            }

            enrichedPosts.push({
                id: post.id,
                userId: post.userid,
                userName: currentUsersMap.get(String(post.userid)) || 'Unknown User',
                content: post.content,
                commentCount: commentCount,
            });
        });

        enrichedPosts.sort((a, b) => b.id - a.id); // Sort latest first by ID

        const successUsers = cache.set(CACHE_KEYS.USERS_MAP, currentUsersMap);
        const successCounts = cache.set(CACHE_KEYS.USER_POST_COUNTS, currentUserPostCounts);
        const successPosts = cache.set(CACHE_KEYS.POSTS_LIST, enrichedPosts);

        if (successUsers && successCounts && successPosts) {
            cache.set(CACHE_KEYS.DATA_STATUS, 'ready'); 
            const duration = Date.now() - startTime;
            console.log(`Data refresh completed and cache updated in ${duration} ms. ${enrichedPosts.length} posts processed.`);
        } else {
             console.error("Failed to set one or more core items in cache during refresh.");
        }


    } catch (error) {
        console.error('FATAL: Unhandled error during data refresh:', error);
    } finally {
        isRefreshing = false;
    }
}


function getUsersMap() {
    return cache.get(CACHE_KEYS.USERS_MAP) || new Map(); 
}

function getUserPostCounts() {
    return cache.get(CACHE_KEYS.USER_POST_COUNTS) || new Map(); 
}

function getPostsList() {
    return cache.get(CACHE_KEYS.POSTS_LIST) || []; 
}

function isDataReady() {
    return cache.get(CACHE_KEYS.DATA_STATUS) === 'ready';
}


function startBackgroundRefresh() {
    console.log(`Starting background refresh every ${REFRESH_INTERVAL_MS / 1000} seconds.`);
    cache.set(CACHE_KEYS.DATA_STATUS, 'initializing');
    refreshData().then(() => {
        if (isDataReady()) {
            console.log("Initial data load complete and cache populated.");
        } else {
             console.warn("Initial data load finished, but cache might not be fully populated or marked as ready.");
        }
    }).catch(err => {
         console.error("Initial data load failed:", err);
         cache.set(CACHE_KEYS.DATA_STATUS, 'error');
    });

    setInterval(refreshData, REFRESH_INTERVAL_MS);
}

export {
    getUsersMap,
    getUserPostCounts,
    getPostsList,
    isDataReady,
    startBackgroundRefresh,
};