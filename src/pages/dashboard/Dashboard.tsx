import React, { useEffect } from "react";
import { Box, Grid, LinearProgress } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { fetchDashboardStats } from "../../app/slices/dashboardSlice";
import PageHeader from "../../components/common/PageHeader";
import StatCard from "../../components/dashboard/StatCard";
import RecentRequests from "../../components/dashboard/RecentRequests";
import RequestsByType from "../../components/dashboard/RequestsByType";
// import TechnicianTasks from "../../components/dashboard/TechnicianTasks";
import StockAlertBar from "../../components/dashboard/StockAlertBar";
import ReportsSection from "../../components/dashboard/ReportsSection"; // ✅ NEW

// Icons
import AssignmentIcon from "@mui/icons-material/Assignment";
// import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
// import ThumbUpIcon from "@mui/icons-material/ThumbUp";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import BuildCircleIcon from "@mui/icons-material/BuildCircle";
import TaskAltIcon from "@mui/icons-material/TaskAlt";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";

import { useAppDispatch, useAppSelector } from "../../app/hooks";
import type { RequestStatus } from "../../types";

const Dashboard: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { stats, loading } = useAppSelector((state) => state.dashboard);
  const { user } = useAppSelector((state) => state.auth);

  useEffect(() => {
    dispatch(fetchDashboardStats());
  }, [dispatch]);

  const handleCardClick = (status?: RequestStatus) => {
    if (status) {
      navigate(`/service-requests?status=${status}`);
    } else {
      navigate("/service-requests");
    }
  };

  if (loading || !stats) {
    return (
      <Box>
        <PageHeader title="Dashboard" />
        <LinearProgress />
      </Box>
    );
  }

  const isTechnician = user?.role.name === "Technician";
  const isSuperAdmin = user?.role.name === "Super Admin"; // ✅ NEW

  return (
    <Box>
      <PageHeader
        title={`Welcome back, ${user?.name}!`}
        subtitle="Here's what's happening today"
      />

      {/* {isTechnician && stats.myTasks && (
        <TechnicianTasks tasks={stats.myTasks} />
      )} */}

      <StockAlertBar userRole={user?.role.name} />

      {/* Stats Grid */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {/* Total Requests - Blue/Primary */}
        {!isTechnician && (
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <StatCard
              title="Total Requests"
              value={stats.totalRequests}
              icon={<AssignmentIcon />}
              color="#1976d2" // Primary Blue
              onClick={() => handleCardClick()}
            />
          </Grid>
        )}

        {/* Assigned - Purple/Secondary */}
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <StatCard
            title="Assigned"
            value={stats.assigned}
            icon={<PersonAddIcon />}
            color="#9c27b0" // Purple
            onClick={() => handleCardClick("ASSIGNED")}
          />
        </Grid>

        {/* In Progress - Light Blue/Info */}
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <StatCard
            title="In Progress"
            value={stats.inProgress}
            icon={<BuildCircleIcon />}
            color="#0288d1" // Light Blue
            onClick={() => handleCardClick("IN_PROGRESS")}
          />
        </Grid>

        {/* Work Completed - Teal */}
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <StatCard
            title="Work Completed"
            value={stats.workCompleted}
            icon={<TaskAltIcon />}
            color="#039688ff" // Teal
            onClick={() => handleCardClick("WORK_COMPLETED")}
          />
        </Grid>

        {/* Completed - Green/Success */}
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <StatCard
            title="Completed"
            value={stats.completed}
            icon={<CheckCircleIcon />}
            color="#2e7d32" // Dark Green
            onClick={() => handleCardClick("COMPLETED")}
          />
        </Grid>

        {/* Rejected - Red/Error */}
        {!isTechnician && (
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <StatCard
              title="Rejected"
              value={stats.rejected}
              icon={<CancelIcon />}
              color="#d32f2f" // Red
              onClick={() => handleCardClick("REJECTED")}
            />
          </Grid>
        )}
      </Grid>

      {/* Charts and Recent Activity */}
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 8 }}>
          <RecentRequests requests={stats.recentRequests} />
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <RequestsByType data={stats.byType} />
        </Grid>
      </Grid>

      {/* ✅ NEW: Reports Section (Only for Super Admin) */}
      {isSuperAdmin && <ReportsSection />}
    </Box>
  );
};

export default Dashboard;
