import React from 'react';
import { useAuth } from '../firebase/auth';
import LoginPage from '../pages/LoginPage';

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { currentUser, userRole } = useAuth();

  if (!currentUser) {
    return <LoginPage />;
  }

  if (adminOnly && userRole !== 'admin') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-900 via-red-800 to-red-900 flex items-center justify-center">
        <div className="bg-white rounded-2xl p-8 border-2 border-red-600 text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h2>
          <p className="text-gray-700">You need admin privileges to access this page.</p>
        </div>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;