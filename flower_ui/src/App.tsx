import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './components/auth/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ProductManagementPage from './pages/ProductManagementPage';
import OrderManagementPage from './pages/OrderManagementPage';
import DeliveryManagementPage from './pages/DeliveryManagementPage';
import ProtectedRoute from './components/layout/ProtectedRoute';
import DashboardLayout from './components/layout/DashboardLayout';

const App: React.FC = () => {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <DashboardLayout>
            <DashboardPage />
          </DashboardLayout>
        </ProtectedRoute>
      } />
      <Route path="/products" element={
        <ProtectedRoute>
          <DashboardLayout>
            <ProductManagementPage />
          </DashboardLayout>
        </ProtectedRoute>
      } />
      <Route path="/orders" element={
        <ProtectedRoute>
          <DashboardLayout>
            <OrderManagementPage />
          </DashboardLayout>
        </ProtectedRoute>
      } />
      <Route path="/delivery" element={
        <ProtectedRoute>
          <DashboardLayout>
            <DeliveryManagementPage />
          </DashboardLayout>
        </ProtectedRoute>
      } />
      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  );
};

export default App;
