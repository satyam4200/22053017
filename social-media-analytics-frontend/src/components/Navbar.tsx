import React from 'react';
import { NavLink } from 'react-router-dom';

interface NavbarProps {
  isBackendReady: boolean;
}

const Navbar: React.FC<NavbarProps> = ({ isBackendReady }) => {
  const commonLinkClasses = "px-3 py-2 rounded-md text-sm font-medium";
  // Type the callback parameter for className
  const getLinkClassName = ({ isActive }: { isActive: boolean }): string => {
      return isActive
        ? `${commonLinkClasses} bg-gray-900 text-white`
        : `${commonLinkClasses} text-gray-300 hover:bg-gray-700 hover:text-white`;
  };

  return (
    <nav className="bg-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <span className="text-white font-bold text-xl">Analytics</span>
            {!isBackendReady && (
                <span className="ml-3 text-xs text-yellow-400 italic">(Backend Initializing...)</span>
            )}
          </div>
          <div className="flex space-x-4">
            <NavLink to="/" className={getLinkClassName}>
              Feed
            </NavLink>
            <NavLink to="/top-users" className={getLinkClassName}>
              Top Users
            </NavLink>
            <NavLink to="/trending-posts" className={getLinkClassName}>
              Trending
            </NavLink>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
