import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { CircularProgress, Box } from '@mui/material';
import ProtectedRoute from './components/layout/ProtectedRoute';
import DashboardLayout from './components/layout/DashboardLayout';
import ErrorBoundary from './components/common/ErrorBoundary';
import { queryClient } from './utils/queryClient';

// 懒加载页面组件
const LoginPage = lazy(() => import('./components/auth/LoginPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const ProductManagementPage = lazy(() => import('./pages/ProductManagementPage'));
const OrderManagementPage = lazy(() => import('./pages/OrderManagementPage'));
const DeliveryManagementPage = lazy(() => import('./pages/DeliveryManagementPage'));

// 加载指示器组件
const LoadingSpinner = () => (
  <Box
    display="flex"
    justifyContent="center"
    alignItems="center"
    minHeight="100vh"
  >
    <CircularProgress size={40} />
  </Box>
);

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <Suspense fallback={<LoadingSpinner />}>
          <Routes>
            <Route path="/admin/login" element={<LoginPage />} />
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Suspense fallback={<LoadingSpinner />}>
                    <DashboardPage />
                  </Suspense>
                </DashboardLayout>
              </ProtectedRoute>
            } />
            <Route path="/products" element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Suspense fallback={<LoadingSpinner />}>
                    <ProductManagementPage />
                  </Suspense>
                </DashboardLayout>
              </ProtectedRoute>
            } />
            <Route path="/orders" element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Suspense fallback={<LoadingSpinner />}>
                    <OrderManagementPage />
                  </Suspense>
                </DashboardLayout>
              </ProtectedRoute>
            } />
            <Route path="/delivery" element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Suspense fallback={<LoadingSpinner />}>
                    <DeliveryManagementPage />
                  </Suspense>
                </DashboardLayout>
              </ProtectedRoute>
            } />
            <Route path="/404" element={
              <ErrorBoundary fallback={
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '100vh',
                  flexDirection: 'column'
                }}>
                  <h1>404 - 页面未找到</h1>
                  <p>抱歉，您访问的页面不存在</p>
                </div>
              }>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '100vh',
                  flexDirection: 'column'
                }}>
                  <h1>404 - 页面未找到</h1>
                  <p>抱歉，您访问的页面不存在</p>
                </div>
              </ErrorBoundary>
            } />
            <Route path="/" element={<Navigate to="/admin/login" replace />} />
            <Route path="*" element={<Navigate to="/404" replace />} />
          </Routes>
        </Suspense>
        {/* React Query DevTools - 仅在开发环境显示 */}
        {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;
