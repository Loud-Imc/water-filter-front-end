import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import ProtectedRoute from '../components/layout/ProtectedRoute';
import Login from '../pages/auth/Login';
import Dashboard from '../pages/dashboard/Dashboard';
import UserList from '../pages/users/UserList';
import CreateUser from '../pages/users/CreateUser';
import EditUser from '../pages/users/EditUser';
import RoleManagement from '../pages/roles/RoleManagement';
import RegionManagement from '../pages/regions/RegionManagement';
import CustomerManagement from '../pages/customers/CustomerManagement';
import ServiceRequestList from '../pages/service-requests/ServiceRequestList';
import CreateServiceRequest from '../pages/service-requests/CreateServiceRequest';
import ServiceRequestDetail from '../pages/service-requests/ServiceRequestDetail';
import MyTasks from '../pages/technician/MyTasks';
import TaskHistory from '../pages/technician/TaskHistory';
import NotificationList from '../pages/notifications/NotificationList';
import Unauthorized from '../pages/Unauthorized';
import NotFound from '../pages/NotFound';
import { useAppSelector } from '../app/hooks';

const AppRoutes: React.FC = () => {
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" /> : <Login />} />
      <Route path="/unauthorized" element={<Unauthorized />} />

      {/* Protected Routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Layout>
              <Dashboard />
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* User Management Routes */}
      <Route
        path="/users"
        element={
          <ProtectedRoute allowedRoles={['Super Admin', 'Service Admin', 'Sales Admin', 'Service Manager', 'Sales Manager']}>
            <Layout>
              <UserList />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/users/create"
        element={
          <ProtectedRoute allowedRoles={['Super Admin', 'Service Admin', 'Sales Admin', 'Service Manager', 'Sales Manager']}>
            <Layout>
              <CreateUser />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/users/edit/:id"
        element={
          <ProtectedRoute allowedRoles={['Super Admin', 'Service Admin', 'Sales Admin', 'Service Manager', 'Sales Manager']}>
            <Layout>
              <EditUser />
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* Role Management */}
      <Route
        path="/roles"
        element={
          <ProtectedRoute allowedRoles={['Super Admin', 'Service Admin', 'Sales Admin']}>
            <Layout>
              <RoleManagement />
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* Region Management */}
      <Route
        path="/regions"
        element={
          <ProtectedRoute allowedRoles={['Super Admin', 'Service Admin', 'Sales Admin']}>
            <Layout>
              <RegionManagement />
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* Customer Management */}
      <Route
        path="/customers"
        element={
          <ProtectedRoute allowedRoles={['Super Admin', 'Service Admin', 'Sales Admin', 'Service Manager', 'Sales Manager']}>
            <Layout>
              <CustomerManagement />
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* Service Requests */}
      <Route
        path="/service-requests"
        element={
          <ProtectedRoute allowedRoles={['Super Admin', 'Service Admin', 'Sales Admin', 'Service Manager', 'Sales Manager']}>
            <Layout>
              <ServiceRequestList />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/service-requests/create"
        element={
          <ProtectedRoute>
            <Layout>
              <CreateServiceRequest />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/service-requests/:id"
        element={
          <ProtectedRoute>
            <Layout>
              <ServiceRequestDetail />
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* Technician Routes */}
      <Route
        path="/technician/my-tasks"
        element={
          <ProtectedRoute allowedRoles={['Technician']}>
            <Layout>
              <MyTasks />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/technician/task-history"
        element={
          <ProtectedRoute allowedRoles={['Technician']}>
            <Layout>
              <TaskHistory />
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* Notifications */}
      <Route
        path="/notifications"
        element={
          <ProtectedRoute>
            <Layout>
              <NotificationList />
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* Default Routes */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
