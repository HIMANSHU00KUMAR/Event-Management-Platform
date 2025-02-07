import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { CircularProgress, Box } from '@mui/material';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user } = useAuth();
  const location = useLocation();
  
  // Optional: Add loading state if you're checking authentication status
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    // Simulate checking auth status
    const checkAuth = setTimeout(() => {
      setIsLoading(false);
    }, 500);

    return () => clearTimeout(checkAuth);
  }, []);

  if (isLoading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  const token = localStorage.getItem('token');
  console.log("protected route token", token);
  console.log("protected route user", user);
  if (!user || !token) {
    console.log("redirecting to login");
    // Redirect to login page but save the current location they tried to access
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  console.log("user", user,children);
  return <>{children}</>;
};