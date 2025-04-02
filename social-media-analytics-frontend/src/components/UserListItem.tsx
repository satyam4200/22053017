import React from 'react';
import { getRandomUserImageUrl } from '../utils/imageUtils'; 
import { User } from '../types';

interface UserListItemProps {
    user: User;
}

const UserListItem: React.FC<UserListItemProps> = ({ user }) => {
  // Optional: Type the onError event handler
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
      // Replace with a placeholder or hide the image
      // e.currentTarget.src = '/path/to/placeholder-user.png';
      e.currentTarget.style.display = 'none'; // Example: hide if broken
      // Or render an icon instead (would require state or different structure)
  };

  return (
    <li className="flex items-center py-3 px-4 border-b border-gray-200 last:border-b-0 hover:bg-gray-50">
      <img
        className="w-10 h-10 rounded-full mr-3 object-cover"
        src={getRandomUserImageUrl(user.id)}
        alt={user.name || 'User Avatar'}
        onError={handleImageError}
      />
      <div className="flex-grow">
        <p className="font-semibold text-gray-800">{user.name || 'Unknown User'}</p>
        <p className="text-sm text-gray-600">Posts: {user.postCount}</p>
      </div>
    </li>
  );
};

export default UserListItem;