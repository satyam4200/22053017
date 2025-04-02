import React, { useState, useEffect } from 'react';
import PostCard from '../components/PostCard'; // Using path alias
import LoadingSpinner from '../components/LoadingSpinner'; // Using path alias
import ErrorMessage from '../components/ErrorMessage'; // Using path alias
import { getTrendingPosts } from '../services/api'; // Using path alias
import { Post, ApiError, isApiError } from '../types'; // Using path alias

const TrendingPostsPage: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTrending = async () => {
        setLoading(true);
        setError(null);
        const result: Post[] | ApiError = await getTrendingPosts();
        if (isApiError(result)) {
            setError(result.error);
        } else {
            setPosts(result);
        }
        setLoading(false);
    };

    fetchTrending();
  }, []); // Fetch only once on mount

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Trending Posts</h1>
       {loading && <LoadingSpinner />}
       {error && <ErrorMessage message={error} />}
       {!loading && !error && (
            <div>
               {posts.length > 0 ? (
                    posts.map((post) => (
                        <PostCard key={post.id} post={post} />
                    ))
               ) : (
                    <p className="text-gray-600 text-center">No trending posts found.</p>
               )}
           </div>
        )}
    </div>
  );
};

export default TrendingPostsPage;