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
} from "@mui/material";
import AssessmentIcon from "@mui/icons-material/Assessment";
// import DownloadIcon from '@mui/icons-material/Download';
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import TableViewIcon from "@mui/icons-material/TableView";
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

  const handleGenerateReport = () => {
    dispatch(
      fetchComprehensiveReport({
        startDate,
        endDate,
      })
    );
  };

  // ✅ FIXED: PDF Export
  const handleExportPDF = () => {
    if (report) {
      exportReportToPDF(report);
    }
  };

  // ✅ FIXED: Excel Export
  const handleExportExcel = () => {
    if (report) {
      exportReportToExcel(report);
    }
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
                Generate comprehensive business insights
              </Typography>
            </Box>
          </Box>

          <Divider sx={{ mb: 3 }} />

          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid size={{ xs: 12, md: 4 }}>
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

            <Grid size={{ xs: 12, md: 4 }}>
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

            <Grid size={{ xs: 12, md: 4 }}>
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
          </Grid>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {report && (
            <Box>
              <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
                {/* ✅ Updated PDF Button */}
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<PictureAsPdfIcon />}
                  onClick={handleExportPDF}
                >
                  Export PDF
                </Button>

                {/* ✅ Updated Excel Button */}
                <Button
                  variant="outlined"
                  color="success"
                  startIcon={<TableViewIcon />}
                  onClick={handleExportExcel}
                >
                  Export Excel
                </Button>
              </Box>

              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ mb: 3, display: "block" }}
              >
                Report Period:{" "}
                {new Date(report.period.startDate).toLocaleDateString()} -{" "}
                {new Date(report.period.endDate).toLocaleDateString()}
              </Typography>

              {/* Service Requests Overview */}
              <Box sx={{ mb: 4 }}>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  Service Requests Overview
                </Typography>
                <ServiceRequestsChart data={report.serviceRequests} />
              </Box>

              {/* Technician Performance */}
              <Box sx={{ mb: 4 }}>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  Technician Performance
                </Typography>
                <TechnicianPerformanceTable
                  data={report.technicianPerformance}
                />
              </Box>

              {/* Regional Breakdown */}
              <Box sx={{ mb: 4 }}>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  Regional Breakdown
                </Typography>
                <RegionalBreakdownTable data={report.regionalBreakdown} />
              </Box>

              {/* Customer & Product Insights */}
              <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <CustomerInsightsCard data={report.customerActivity} />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <ProductUsageCard data={report.productUsage} />
                </Grid>
              </Grid>
            </Box>
          )}

          {!report && !reportLoading && (
            <Alert severity="info">
              Select a date range and click "Generate Report" to view analytics
            </Alert>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default ReportsSection;
