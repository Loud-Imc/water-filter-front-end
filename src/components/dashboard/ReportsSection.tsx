import React, { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  TextField,
  Divider,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
  Chip,
} from "@mui/material";
import AssessmentIcon from "@mui/icons-material/Assessment";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import TableViewIcon from "@mui/icons-material/TableView";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import GroupIcon from "@mui/icons-material/Group";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import WarningIcon from "@mui/icons-material/Warning";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { fetchComprehensiveReport } from "../../app/slices/dashboardSlice";
import {
  exportReportToPDF,
  exportReportToExcel,
} from "../../utils/reportExport";

import ServiceRequestsChart from "./ServiceRequestsChart";
import TechnicianPerformanceTable from "./TechnicianPerformanceTable";
import RegionalBreakdownTable from "./RegionalBreakdownTable";
import CustomerInsightsCard from "./CustomerInsightsCard";
import ProductUsageCard from "./ProductUsageCard";

import QualityMetricsCard from "./QualityMetricsCard";
import ReassignmentAnalysisCard from "./ReassignmentAnalysisCard";
import OperationalEfficiencyCard from "./OperationalEfficiencyCard";
import SparePartUsageCard from "./SparePartUsageCard";
import AssemblyUsageCard from "./AssemblyUsageCard";

const ReportsSection: React.FC = () => {
  const dispatch = useAppDispatch();
  const { report, reportLoading, error } = useAppSelector(
    (state) => state.dashboard
  );

  const today = new Date();
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

  const [startDate, setStartDate] = useState(
    firstDayOfMonth.toISOString().split("T")[0]
  );
  const [endDate, setEndDate] = useState(today.toISOString().split("T")[0]);
  const [activeTab, setActiveTab] = useState(0);

  const handleGenerateReport = () => {
    dispatch(fetchComprehensiveReport({ startDate, endDate }));
  };

  const handleExportPDF = () => {
    if (report) exportReportToPDF(report);
  };

  const handleExportExcel = () => {
    if (report) exportReportToExcel(report);
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const setDateRange = (days: number) => {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - days);
    setStartDate(start.toISOString().split("T")[0]);
    setEndDate(end.toISOString().split("T")[0]);
  };

  return (
    <Box sx={{ mt: 4 }}>
      <Card>
        <CardContent>
          <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
            <AssessmentIcon
              sx={{ fontSize: 32, mr: 2, color: "primary.main" }}
            />
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="h5" fontWeight={600}>
                Reports & Analytics
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Generate comprehensive business insights and performance metrics
              </Typography>
            </Box>
          </Box>

          <Divider sx={{ mb: 3 }} />

          {/* Date Range Fields */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid sx={{ xs: 12, md: 3 }}>
              <TextField
                fullWidth
                type="date"
                label="Start Date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
                InputProps={{
                  startAdornment: (
                    <CalendarTodayIcon sx={{ mr: 1, color: "action.active" }} />
                  ),
                }}
              />
            </Grid>

            <Grid sx={{ xs: 12, md: 3 }}>
              <TextField
                fullWidth
                type="date"
                label="End Date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
                InputProps={{
                  startAdornment: (
                    <CalendarTodayIcon sx={{ mr: 1, color: "action.active" }} />
                  ),
                }}
              />
            </Grid>

            <Grid sx={{ xs: 12, md: 3 }}>
              <Button
                fullWidth
                variant="contained"
                size="large"
                onClick={handleGenerateReport}
                disabled={reportLoading}
                startIcon={
                  reportLoading ? (
                    <CircularProgress size={20} />
                  ) : (
                    <AssessmentIcon />
                  )
                }
              >
                {reportLoading ? "Generating..." : "Generate Report"}
              </Button>
            </Grid>

            <Grid sx={{ xs: 12, md: 3 }}>
              <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                <Chip
                  label="Last 7 Days"
                  onClick={() => setDateRange(7)}
                  clickable
                />
                <Chip
                  label="Last 30 Days"
                  onClick={() => setDateRange(30)}
                  clickable
                />
                <Chip
                  label="Last 90 Days"
                  onClick={() => setDateRange(90)}
                  clickable
                />
              </Box>
            </Grid>
          </Grid>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {report && (
            <Box>
              <Box
                sx={{
                  display: "flex",
                  gap: 2,
                  mb: 3,
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Typography variant="caption" color="text.secondary">
                  Report Period:{" "}
                  {new Date(report.period.startDate).toLocaleDateString()} -{" "}
                  {new Date(report.period.endDate).toLocaleDateString()}
                </Typography>
                <Box sx={{ display: "flex", gap: 2 }}>
                  <Button
                    variant="outlined"
                    color="error"
                    startIcon={<PictureAsPdfIcon />}
                    onClick={handleExportPDF}
                  >
                    Export PDF
                  </Button>
                  <Button
                    variant="outlined"
                    color="success"
                    startIcon={<TableViewIcon />}
                    onClick={handleExportExcel}
                  >
                    Export Excel
                  </Button>
                </Box>
              </Box>

              <Tabs value={activeTab} onChange={handleTabChange} sx={{ mb: 3 }}>
                <Tab
                  icon={<TrendingUpIcon />}
                  label="Overview"
                  iconPosition="start"
                />
                <Tab
                  icon={<GroupIcon />}
                  label="Technicians"
                  iconPosition="start"
                />
                <Tab
                  icon={<LocationOnIcon />}
                  label="Regions"
                  iconPosition="start"
                />
                <Tab
                  icon={<ShoppingCartIcon />}
                  label="Products"
                  iconPosition="start"
                />
                <Tab
                  icon={<WarningIcon />}
                  label="Quality"
                  iconPosition="start"
                />
                <Tab
                  icon={<AttachMoneyIcon />}
                  label="Financial"
                  iconPosition="start"
                />
              </Tabs>

              {activeTab === 0 && (
                <Box>
                  <Box sx={{ mb: 4 }}>
                    <Typography variant="h6" fontWeight={600} gutterBottom>
                      Service Requests Overview
                    </Typography>
                    <ServiceRequestsChart data={report.serviceRequests} />
                  </Box>

                  {report.operationalMetrics && (
                    <Box sx={{ mb: 4 }}>
                      <Typography variant="h6" fontWeight={600} gutterBottom>
                        Operational Efficiency
                      </Typography>
                      <OperationalEfficiencyCard
                        data={report.operationalMetrics}
                      />
                    </Box>
                  )}
                </Box>
              )}

              {activeTab === 1 && (
                <Box>
                  <Box sx={{ mb: 4 }}>
                    <Typography variant="h6" fontWeight={600} gutterBottom>
                      Technician Performance
                    </Typography>
                    <TechnicianPerformanceTable
                      data={report.technicianPerformance}
                    />
                  </Box>
                </Box>
              )}

              {activeTab === 2 && (
                <Box>
                  <Box sx={{ mb: 4 }}>
                    <Typography variant="h6" fontWeight={600} gutterBottom>
                      Regional Breakdown
                    </Typography>
                    <RegionalBreakdownTable data={report.regionalBreakdown} />
                  </Box>
                </Box>
              )}

              {activeTab === 3 && (
                <Box>
                  <Grid  spacing={3}>
                    <Grid sx={{xs: 12, md: 4}}>
                      <CustomerInsightsCard data={report.customerActivity} />
                    </Grid>
                    <Grid sx={{xs: 12, md: 4}}>
                      <ProductUsageCard data={report.productUsage} />
                    </Grid>
                    {report.sparePartUsage && (
                      <Grid sx={{xs: 12, md: 4}}>
                        <SparePartUsageCard data={report.sparePartUsage} />
                      </Grid>
                    )}
                    {report.assemblyUsage && (
                      <Grid sx={{xs: 12, md: 4}}>
                        <AssemblyUsageCard data={report.assemblyUsage} />
                      </Grid>
                    )}
                  </Grid>
                </Box>
              )}

              {activeTab === 4 && (
                <Box>
                  {report.qualityMetrics && (
                    <Box sx={{ mb: 4 }}>
                      <Typography variant="h6" fontWeight={600} gutterBottom>
                        Quality & Performance Metrics
                      </Typography>
                      <QualityMetricsCard data={report.qualityMetrics} />
                    </Box>
                  )}

                  {report.reassignmentAnalysis && (
                    <Box sx={{ mb: 4 }}>
                      <Typography variant="h6" fontWeight={600} gutterBottom>
                        Reassignment Analysis
                      </Typography>
                      <ReassignmentAnalysisCard
                        data={report.reassignmentAnalysis}
                      />
                    </Box>
                  )}
                </Box>
              )}

              {activeTab === 5 && (
                <Box>
                  <Alert severity="info" icon={<AttachMoneyIcon />}>
                    Financial analytics coming soon. Track revenue, costs, and
                    profitability.
                  </Alert>
                </Box>
              )}
            </Box>
          )}

          {!report && !reportLoading && (
            <Alert severity="info" icon={<AssessmentIcon />}>
              Select a date range and click "Generate Report" to view
              comprehensive analytics
            </Alert>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default ReportsSection;
