import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import reportWebVitals from './reportWebVitals';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { AuthProvider } from './firebase/auth';
import ProtectedRoute from './components/ProtectedRoute';
import HomePage from './pages/HomePage';
import InvalidRoute from './pages/InvalidRoute';
import Rooms from './pages/RoomBookings';
import LoginPage from './pages/LoginPage';
import AdminDashboard from './pages/AdminDashboard';
import FleetBookings from './pages/FleetBookings';
import TestDatabase from './pages/TestDatabase';

const router = createBrowserRouter([
  {
    path: '/',
    element: <HomePage />
  },
  {
    path: '/login',
    element: <LoginPage />
  },
  {
    path: '/rooms',
    element: (
      <ProtectedRoute>
        <Rooms />
      </ProtectedRoute>
    )
  },
  {
    path: '/vehicles',
    element: (
      <ProtectedRoute>
        <FleetBookings />
      </ProtectedRoute>
    )
  },
  {
    path: '/admindash',
    element: (
      <ProtectedRoute adminOnly={true}>
        <AdminDashboard />
      </ProtectedRoute>
    )
  },
  {
    path: '/test-db',
    element: (
      <ProtectedRoute adminOnly={true}>
        <TestDatabase />
      </ProtectedRoute>
    )
  },
  {
    path: '*',
    element: <InvalidRoute />
  }
]);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </React.StrictMode>
);

reportWebVitals();