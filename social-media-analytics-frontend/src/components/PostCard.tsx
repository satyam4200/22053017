import React from 'react';
import { getRandomPostImageUrl } from '../utils/imageUtils'; 
import { Post } from '../types'; 
import { FaRegCommentDots, FaUserCircle } from 'react-icons/fa';

interface PostCardProps {
    post: Post; 
}

const PostCard: React.FC<PostCardProps> = ({ post }) => {
    const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
      e.currentTarget.style.display = 'none';
    };

  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden mb-6 flex flex-col sm:flex-row">
      <img
        className="w-full sm:w-48 h-48 object-cover flex-shrink-0"
        src={getRandomPostImageUrl(post.id)}
        alt={post.content ? post.content.substring(0, 50) + '...' : 'Post image'}
        onError={handleImageError}
      />
      <div className="p-4 flex flex-col flex-grow">
        <p className="text-gray-700 text-base mb-3 flex-grow"> 
          {post.content || 'No content available.'}
        </p>
        <div className="flex justify-between items-center text-xs text-gray-500 mt-auto pt-3 border-t border-gray-100">
            <div className="flex items-center">
                <FaUserCircle className="mr-1" />
                <span>{post.userName ?? 'Unknown User'}</span>
            </div>
            <div className="flex items-center">
                <FaRegCommentDots className="mr-1" />
                <span>{post.commentCount !== undefined ? post.commentCount : 'N/A'}</span>
            </div>
        </div>
      </div>
    </div>
  );
};

export default PostCard;