import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * ProtectedRoute — Route guard that prevents unauthenticated users
 * from accessing protected pages such as /dashboard.
 * Redirects to /login with state containing the target path and reason message.
 */
export default function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        state={{
          from: location.pathname,
          message: 'Please log in to access your Dashboard.',
        }}
        replace
      />
    );
  }

  return children;
}
