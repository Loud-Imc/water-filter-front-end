import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "../components/layout/Layout";
import ProtectedRoute from "../components/layout/ProtectedRoute";
import { PERMISSIONS } from "../constants/permissions";
import Login from "../pages/auth/Login";
import Dashboard from "../pages/dashboard/Dashboard";
import UserList from "../pages/users/UserList";
import CreateUser from "../pages/users/CreateUser";
import EditUser from "../pages/users/EditUser";
import RoleManagement from "../pages/roles/RoleManagement";
import RegionManagement from "../pages/regions/RegionManagement";
import CustomerManagement from "../pages/customers/CustomerManagement";
import ServiceRequestList from "../pages/service-requests/ServiceRequestList";
import CreateServiceRequest from "../pages/service-requests/CreateServiceRequest";
import ServiceRequestDetail from "../pages/service-requests/ServiceRequestDetail";
import MyTasks from "../pages/technician/MyTasks";
import TaskHistory from "../pages/technician/TaskHistory";
import MyStocks from "../pages/technician/MyStocks";
import NotificationList from "../pages/notifications/NotificationList";
import Unauthorized from "../pages/Unauthorized";
import NotFound from "../pages/NotFound";
import { useAppSelector } from "../app/hooks";
import CustomerProfile from "../pages/customers/CustomerProfile";
import ProductManagement from "../pages/ProductManagement/ProductManagement";

const AppRoutes: React.FC = () => {
  const { isAuthenticated } = useAppSelector((state) => state.auth);


  return (
    <Routes>
      {/* Public Routes */}
      <Route
        path="/login"
        element={
          isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />
        }
      />
      <Route path="/unauthorized" element={<Unauthorized />} />

      {/* Protected Routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute requiredPermissions={[PERMISSIONS.DASHBOARD_VIEW]}>
            <Layout>
              <Dashboard />
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* User Management */}
      <Route
        path="/users"
        element={
          <ProtectedRoute requiredPermissions={[PERMISSIONS.USERS_VIEW]}>
            <Layout>
              <UserList />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/users/create"
        element={
          <ProtectedRoute requiredPermissions={[PERMISSIONS.USERS_CREATE]}>
            <Layout>
              <CreateUser />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/users/edit/:id"
        element={
          <ProtectedRoute requiredPermissions={[PERMISSIONS.USERS_EDIT]}>
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
          <ProtectedRoute
            allowedRoles={["Super Admin", "Service Admin", "Sales Admin"]}
          >
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
          <ProtectedRoute requiredPermissions={[PERMISSIONS.REGIONS_VIEW]}>
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
          <ProtectedRoute requiredPermissions={[PERMISSIONS.CUSTOMERS_VIEW]}>
            <Layout>
              <CustomerManagement />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/customers/:id"
        element={
          <ProtectedRoute requiredPermissions={[PERMISSIONS.CUSTOMERS_VIEW]}>
            <Layout>
              <CustomerProfile />
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* Service Requests */}
      <Route
        path="/service-requests"
        element={
          <ProtectedRoute requiredPermissions={[PERMISSIONS.SERVICES_VIEW]}>
            <Layout>
              <ServiceRequestList />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/service-requests/create"
        element={
          <ProtectedRoute requiredPermissions={[PERMISSIONS.SERVICES_CREATE]}>
            <Layout>
              <CreateServiceRequest />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/service-requests/:id"
        element={
          <ProtectedRoute requiredPermissions={[PERMISSIONS.SERVICES_VIEW]}>
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
          <ProtectedRoute
            requiredPermissions={[PERMISSIONS.SERVICES_VIEW]}
            allowedRoles={["Technician"]}
          >
            <Layout>
              <MyTasks />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/technician/task-history"
        element={
          <ProtectedRoute
            requiredPermissions={[PERMISSIONS.SERVICES_VIEW]}
            allowedRoles={["Technician"]}
          >
            <Layout>
              <TaskHistory />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/technician/my-stocks"
        element={
          <ProtectedRoute
            requiredPermissions={[PERMISSIONS.SERVICES_VIEW]}
            allowedRoles={["Technician"]}
          >
            <Layout>
              <MyStocks />
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

      {/* Product Management - New route */}
      <Route
        path="/products"
        element={
          <ProtectedRoute requiredPermissions={[PERMISSIONS.PRODUCTS_VIEW]}>
            <Layout>
              <ProductManagement />
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
