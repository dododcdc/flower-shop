import React from 'react';
import { Navigate } from 'react-router-dom';
import { STORAGE_KEYS } from '../../constants';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
  if (!token) return <Navigate to="/admin/login" replace />;
  return <>{children}</>;
};

export default ProtectedRoute;
