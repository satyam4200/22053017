import React, { useState, useEffect, useRef } from 'react';
import PostCard from '../components/PostCard'; 
import LoadingSpinner from '../components/LoadingSpinner'; 
import ErrorMessage from '../components/ErrorMessage'; 
import { getFeedPosts } from '../services/api'; 
import { Post, ApiError, isApiError } from '../types'; 

const POLLING_INTERVAL = 10000; 

const FeedPage: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isMountedRef = useRef<boolean>(true);

  const fetchPosts = async () => {
    if (!isMountedRef.current) return;
    setError(null);
    const result: Post[] | ApiError = await getFeedPosts();

    if (!isMountedRef.current) return;

    if (isApiError(result)) { 
      setError(result.error);
    } else {
      setPosts(result); 
    }
    setLoading(false);
  };

  useEffect(() => {
    isMountedRef.current = true;
    setLoading(true);
    fetchPosts();

    intervalRef.current = setInterval(fetchPosts, POLLING_INTERVAL);

    return () => {
      isMountedRef.current = false;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Live Feed</h1>
      {error && <ErrorMessage message={error} />}
      {loading && posts.length === 0 && <LoadingSpinner />}

      {!loading && !error && posts.length === 0 && (
        <p className="text-gray-600 text-center">No posts available yet.</p>
      )}

      {posts.length > 0 && (
         <div>
            {posts.map((post) => (
                <PostCard key={post.id} post={post} />
            ))}
         </div>
      )}
    </div>
  );
};

export default FeedPage;