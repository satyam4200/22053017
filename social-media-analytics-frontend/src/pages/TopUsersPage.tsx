import React, { useState, useEffect } from 'react';
import UserListItem from '../components/UserListItem'; // Using path alias
import LoadingSpinner from '../components/LoadingSpinner'; // Using path alias
import ErrorMessage from '../components/ErrorMessage'; // Using path alias
import { getTopUsers } from '../services/api'; // Using path alias
import { User, ApiError, isApiError } from '../types'; // Using path alias

const TopUsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      setError(null);
      const result: User[] | ApiError = await getTopUsers();
      if (isApiError(result)) {
        setError(result.error);
      } else {
        setUsers(result);
      }
      setLoading(false);
    };

    fetchUsers();
  }, []);

  return (
    <div className="max-w-md mx-auto px-4 py-6">
       <h1 className="text-2xl font-bold text-gray-800 mb-6">Top 5 Users</h1>
        {loading && <LoadingSpinner />}
        {error && <ErrorMessage message={error} />}
        {!loading && !error && (
            <ul className="bg-white shadow-md rounded-lg overflow-hidden">
                {users.length > 0 ? (
                    users.map((user) => (
                        <UserListItem key={user.id} user={user} />
                    ))
                ) : (
                    <p className="text-gray-600 text-center p-4">No user data available.</p>
                )}
            </ul>
        )}
    </div>
  );
};

export default TopUsersPage;