import express from 'express';
import {
    getUsersMap,
    getUserPostCounts,
    getPostsList,
    isDataReady,
    startBackgroundRefresh
} from './cacheManager.js'; 

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.use((req, res, next) => {
    if (!isDataReady() && req.path !== '/health') {
        return res.status(503).json({ message: 'Service initializing or data temporarily unavailable, please try again shortly.' });
    }
    next();
});


app.get('/health', (req, res) => {
    res.status(200).json({ status: 'UP', dataReady: isDataReady() });
});

app.get('/users', (req, res) => {
    const usersMap = getUsersMap();
    const userPostCounts = getUserPostCounts();

    if (!usersMap || !userPostCounts) {
         return res.status(500).json({ message: "User data cache is not available." });
    }

    const sortedUsers = Array.from(userPostCounts.entries())
        .sort(([, countA], [, countB]) => countB - countA)
        .slice(0, 5);

    const topUsersResponse = sortedUsers.map(([userId, count]) => ({
        id: userId,
        name: usersMap.get(userId) || 'Unknown User',
        postCount: count,
    }));

    res.status(200).json(topUsersResponse);
});


app.get('/posts', (req, res) => {
    const { type } = req.query;
    const postsList = getPostsList(); 

    if (!type || (type !== 'latest' && type !== 'popular')) {
        return res.status(400).json({ message: "Missing or invalid 'type' query parameter. Use 'latest' or 'popular'." });
    }

     if (!postsList) {
         return res.status(500).json({ message: "Post data cache is not available." });
     }
     if (postsList.length === 0 && isDataReady()) { 
        return res.status(200).json([]);
     }


    let responsePosts = [];

    if (type === 'latest') {
        responsePosts = postsList.slice(0, 5);
    } else if (type === 'popular') {
        if (postsList.length > 0) {
             let maxComments = 0;
             for (const post of postsList) {
                 if (post.commentCount > maxComments) {
                     maxComments = post.commentCount;
                 }
             }
            responsePosts = postsList.filter(post => post.commentCount === maxComments);
        }
        
    }

    res.status(200).json(responsePosts);
});


app.use((err, req, res, next) => {
    console.error("Unhandled Error:", err.stack || err);
    res.status(500).json({ message: 'An unexpected server error occurred.' });
});

app.listen(PORT, () => {
    console.log(`Social Media Analytics Microservice running on port ${PORT}`);
    startBackgroundRefresh();
});