import React, { useEffect } from "react";
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  LinearProgress,
} from "@mui/material";
import { fetchDashboardStats } from "../../app/slices/dashboardSlice";
import PageHeader from "../../components/common/PageHeader";
import StatCard from "../../components/dashboard/StatCard";
import RecentRequests from "../../components/dashboard/RecentRequests";
import RequestsByType from "../../components/dashboard/RequestsByType";
import TechnicianTasks from "../../components/dashboard/TechnicianTasks";

import AssignmentIcon from "@mui/icons-material/Assignment";
import PendingIcon from "@mui/icons-material/Pending";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import EngineeringIcon from "@mui/icons-material/Engineering";
import { useAppDispatch, useAppSelector } from "../../app/hooks";

const Dashboard: React.FC = () => {
  const dispatch = useAppDispatch();
  const { stats, loading } = useAppSelector((state) => state.dashboard);
  const { user } = useAppSelector((state) => state.auth);

  useEffect(() => {
    dispatch(fetchDashboardStats());
  }, [dispatch]);

  if (loading || !stats) {
    return (
      <Box>
        <PageHeader title="Dashboard" />
        <LinearProgress />
      </Box>
    );
  }

  return (
    <Box>
      <PageHeader
        title={`Welcome back, ${user?.name}!`}
        subtitle="Here's what's happening today"
      />

      {/* Technician View */}
      {user?.role.name === "Technician" && stats.myTasks && (
        <TechnicianTasks tasks={stats.myTasks} />
      )}

      {/* Stats Grid */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Total Requests"
            value={stats.totalRequests}
            icon={<AssignmentIcon />}
            color="primary"
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Pending Approval"
            value={stats.pendingApproval}
            icon={<PendingIcon />}
            color="warning"
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="In Progress"
            value={stats.inProgress}
            icon={<EngineeringIcon />}
            color="info"
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Completed"
            value={stats.completed}
            icon={<CheckCircleIcon />}
            color="success"
          />
        </Grid>
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
