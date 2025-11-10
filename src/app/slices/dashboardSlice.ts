import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { axiosInstance } from '../../api/axios';
import type { ComprehensiveReport, ReportDateRange } from '../../types';

interface DashboardStats {
  totalRequests: number;
  pendingApproval: number;
  approved: number;
  assigned: number;
  inProgress: number;
  workCompleted: number;
  completed: number;
  rejected: number;
  byType: Array<{ type: string; count: number }>;
  recentRequests: any[];
  myTasks: {
    assigned: number;
    inProgress: number;
    workCompleted: number;
  } | null;
}

interface DashboardState {
  stats: DashboardStats | null;
  report: ComprehensiveReport | null; // ✅ NEW
  loading: boolean;
  reportLoading: boolean; // ✅ NEW
  error: string | null;
}

const initialState: DashboardState = {
  stats: null,
  report: null, // ✅ NEW
  loading: false,
  reportLoading: false, // ✅ NEW
  error: null,
};

export const fetchDashboardStats = createAsyncThunk(
  'dashboard/fetchStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get('/service-requests/dashboard/stats');
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch dashboard stats');
    }
  }
);

// ✅ NEW: Fetch comprehensive report
export const fetchComprehensiveReport = createAsyncThunk(
  'dashboard/fetchReport',
  async (dateRange: ReportDateRange, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get('/service-requests/reports/comprehensive', {
        params: dateRange,
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch report');
    }
  }
);

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    clearDashboard: (state) => {
      state.stats = null;
      state.report = null; // ✅ NEW
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Existing stats
      .addCase(fetchDashboardStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDashboardStats.fulfilled, (state, action) => {
        state.loading = false;
        state.stats = action.payload;
      })
      .addCase(fetchDashboardStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // ✅ NEW: Report
      .addCase(fetchComprehensiveReport.pending, (state) => {
        state.reportLoading = true;
        state.error = null;
      })
      .addCase(fetchComprehensiveReport.fulfilled, (state, action) => {
        state.reportLoading = false;
        state.report = action.payload;
      })
      .addCase(fetchComprehensiveReport.rejected, (state, action) => {
        state.reportLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearDashboard } = dashboardSlice.actions;
export default dashboardSlice.reducer;
