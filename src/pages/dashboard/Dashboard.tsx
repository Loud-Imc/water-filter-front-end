import React, { useEffect } from "react";
import {
  Box,
  Grid,
  LinearProgress,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { fetchDashboardStats } from "../../app/slices/dashboardSlice";
import PageHeader from "../../components/common/PageHeader";
import StatCard from "../../components/dashboard/StatCard";
import RecentRequests from "../../components/dashboard/RecentRequests";
import RequestsByType from "../../components/dashboard/RequestsByType";
import TechnicianTasks from "../../components/dashboard/TechnicianTasks";
import StockAlertBar from "../../components/dashboard/StockAlertBar";

// Icons
import AssignmentIcon from "@mui/icons-material/Assignment";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import ThumbUpIcon from "@mui/icons-material/ThumbUp";
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

  // Navigate to service requests with filter
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

  // ✅ Determine if user is technician
  const isTechnician = user?.role.name === "Technician";

  return (
    <Box>
      <PageHeader
        title={`Welcome back, ${user?.name}!`}
        subtitle="Here's what's happening today"
      />

      {/* Technician-specific task view */}
      {isTechnician && stats.myTasks && (
        <TechnicianTasks tasks={stats.myTasks} />
      )}

      {/* Stock alert bar */}
      <StockAlertBar userRole={user?.role.name} />

      {/* ✅ Stats Grid - Single container with conditional cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {/* Cards visible to ALL users */}
        
        {/* Total Requests - Show to non-technicians only */}
        {!isTechnician && (
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <StatCard
              title="Total Requests"
              value={stats.totalRequests}
              icon={<AssignmentIcon />}
              color="primary"
              onClick={() => handleCardClick()}
            />
          </Grid>
        )}

        {/* Pending Approval - Show to non-technicians only */}
        {!isTechnician && (
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <StatCard
              title="Pending Approval"
              value={stats.pendingApproval}
              icon={<HourglassEmptyIcon />}
              color="warning"
              onClick={() => handleCardClick("PENDING_APPROVAL")}
            />
          </Grid>
        )}

        {/* Approved - Show to non-technicians only */}
        {!isTechnician && (
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <StatCard
              title="Approved, Not Assigned"
              value={stats.approved}
              icon={<ThumbUpIcon />}
              color="info"
              onClick={() => handleCardClick("APPROVED")}
            />
          </Grid>
        )}

        {/* Assigned - Show to ALL */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Assigned"
            value={stats.assigned}
            icon={<PersonAddIcon />}
            color="secondary"
            onClick={() => handleCardClick("ASSIGNED")}
          />
        </Grid>

        {/* In Progress - Show to ALL */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="In Progress"
            value={stats.inProgress}
            icon={<BuildCircleIcon />}
            color="info"
            onClick={() => handleCardClick("IN_PROGRESS")}
          />
        </Grid>

        {/* Work Completed - Show to ALL */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Work Completed"
            value={stats.workCompleted}
            icon={<TaskAltIcon />}
            color="success"
            onClick={() => handleCardClick("WORK_COMPLETED")}
          />
        </Grid>

        {/* Completed - Show to ALL */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Completed"
            value={stats.completed}
            icon={<CheckCircleIcon />}
            color="success"
            onClick={() => handleCardClick("COMPLETED")}
          />
        </Grid>

        {/* Rejected - Show to non-technicians only */}
        {!isTechnician && (
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <StatCard
              title="Rejected"
              value={stats.rejected}
              icon={<CancelIcon />}
              color="error"
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
    </Box>
  );
};

export default Dashboard;
