import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { requestService } from "../../api/services/requestService";
import { type ServiceRequest } from "../../types";

interface RequestState {
  requests: ServiceRequest[];
  myTasks: ServiceRequest[];
  taskHistory: ServiceRequest[];
  reassignmentHistory: any[];
  selectedRequest: ServiceRequest | null;
  stats: {
    assigned: number;
    inProgress: number;
    completed: number;
    totalWorkTime: number;
  } | null;
  loading: boolean;
  error: string | null;
}

const initialState: RequestState = {
  requests: [],
  myTasks: [],
  taskHistory: [],
  reassignmentHistory: [],
  selectedRequest: null,
  stats: null,
  loading: false,
  error: null,
};

// Async thunks
export const fetchAllRequests = createAsyncThunk(
  "requests/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      return await requestService.getAllRequests();
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch requests"
      );
    }
  }
);

export const fetchRequestById = createAsyncThunk(
  "requests/fetchById",
  async (id: string, { rejectWithValue }) => {
    try {
      return await requestService.getRequestById(id);
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch request"
      );
    }
  }
);

// ✅ UPDATED: Accept new format with priority and assignedToId
export const createRequest = createAsyncThunk(
  "requests/create",
  async (
    requestData: {
      type: string;
      description: string;
      customerId: string;
      regionId: string;
      priority?: string;
      assignedToId: string;
      adminNotes?: string;
    },
    { rejectWithValue }
  ) => {
    try {
      return await requestService.createRequest(requestData);
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to create request"
      );
    }
  }
);

export const approveRequest = createAsyncThunk(
  "requests/approve",
  async (
    {
      id,
      comments,
      type,
    }: { id: string; comments?: string; type: "sales" | "service" },
    { rejectWithValue }
  ) => {
    try {
      if (type === "sales") {
        return await requestService.salesApprove(id, comments);
      } else {
        return await requestService.serviceApprove(id, comments);
      }
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to approve request"
      );
    }
  }
);

export const rejectRequest = createAsyncThunk(
  "requests/reject",
  async (
    { id, comments }: { id: string; comments: string },
    { rejectWithValue }
  ) => {
    try {
      return await requestService.rejectRequest(id, comments);
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to reject request"
      );
    }
  }
);

export const assignTechnician = createAsyncThunk(
  "requests/assign",
  async (
    {
      id,
      technicianId,
      auto,
    }: { id: string; technicianId?: string; auto: boolean },
    { rejectWithValue }
  ) => {
    try {
      if (auto) {
        return await requestService.autoAssign(id);
      } else if (technicianId) {
        return await requestService.manualAssign(id, technicianId);
      }
      throw new Error("Invalid assignment parameters");
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to assign technician"
      );
    }
  }
);

export const reassignTechnician = createAsyncThunk(
  "requests/reassign",
  async (
    {
      id,
      newTechnicianId,
      reason,
    }: { id: string; newTechnicianId: string; reason: string },
    { rejectWithValue }
  ) => {
    try {
      return await requestService.reassignTechnician(
        id,
        newTechnicianId,
        reason
      );
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to reassign technician"
      );
    }
  }
);

export const fetchReassignmentHistory = createAsyncThunk(
  "requests/reassignmentHistory",
  async (id: string, { rejectWithValue }) => {
    try {
      return await requestService.getReassignmentHistory(id);
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch reassignment history"
      );
    }
  }
);

export const fetchMyTasks = createAsyncThunk(
  "requests/fetchMyTasks",
  async (_, { rejectWithValue }) => {
    try {
      return await requestService.getMyTasks();
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch tasks"
      );
    }
  }
);

export const fetchTaskHistory = createAsyncThunk(
  "requests/fetchTaskHistory",
  async (_, { rejectWithValue }) => {
    try {
      return await requestService.getTaskHistory();
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch task history"
      );
    }
  }
);

export const fetchMyStats = createAsyncThunk(
  "requests/fetchMyStats",
  async (_, { rejectWithValue }) => {
    try {
      return await requestService.getMyStats();
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch stats"
      );
    }
  }
);

export const startWork = createAsyncThunk(
  "requests/startWork",
  async ({ requestId }: { requestId: string }, { rejectWithValue }) => {
    try {
      return await requestService.startWork(requestId);
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to start work"
      );
    }
  }
);

export const stopWork = createAsyncThunk(
  "requests/stopWork",
  async (
    { requestId, notes }: { requestId: string; notes?: string },
    { rejectWithValue }
  ) => {
    try {
      return await requestService.stopWork(requestId, notes);
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to stop work"
      );
    }
  }
);

export const uploadWorkMedia = createAsyncThunk(
  "requests/uploadMedia",
  async (
    { requestId, file }: { requestId: string; file: File },
    { rejectWithValue }
  ) => {
    try {
      return await requestService.uploadWorkMedia(requestId, file);
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to upload media"
      );
    }
  }
);

export const acknowledgeCompletion = createAsyncThunk(
  "requests/acknowledge",
  async (
    { id, comments }: { id: string; comments?: string },
    { rejectWithValue }
  ) => {
    try {
      return await requestService.acknowledgeCompletion(id, comments);
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to acknowledge"
      );
    }
  }
);

const requestSlice = createSlice({
  name: "requests",
  initialState,
  reducers: {
    clearSelectedRequest: (state) => {
      state.selectedRequest = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch all requests
    builder
      .addCase(fetchAllRequests.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllRequests.fulfilled, (state, action) => {
        state.loading = false;
        state.requests = action.payload;
      })
      .addCase(fetchAllRequests.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Fetch request by ID
    builder.addCase(fetchRequestById.fulfilled, (state, action) => {
      state.selectedRequest = action.payload;
    });

    // Create request
    builder
      .addCase(createRequest.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createRequest.fulfilled, (state, action) => {
        state.loading = false;
        state.requests.push(action.payload);
      })
      .addCase(createRequest.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Approve/Reject request
    builder
      .addCase(approveRequest.fulfilled, (state, action) => {
        const index = state.requests.findIndex(
          (r) => r.id === action.payload.id
        );
        if (index !== -1) {
          state.requests[index] = action.payload;
        }
      })
      .addCase(rejectRequest.fulfilled, (state, action) => {
        const index = state.requests.findIndex(
          (r) => r.id === action.payload.id
        );
        if (index !== -1) {
          state.requests[index] = action.payload;
        }
      });

    // Assign technician
    builder.addCase(assignTechnician.fulfilled, (state, action) => {
      const index = state.requests.findIndex((r) => r.id === action.payload.id);
      if (index !== -1) {
        state.requests[index] = action.payload;
      }
    });

    // Fetch my tasks
    builder.addCase(fetchMyTasks.fulfilled, (state, action) => {
      state.myTasks = action.payload;
    });

    // Fetch task history
    builder.addCase(fetchTaskHistory.fulfilled, (state, action) => {
      state.taskHistory = action.payload;
    });

    // Fetch stats
    builder.addCase(fetchMyStats.fulfilled, (state, action) => {
      state.stats = action.payload;
    });
  },
});

export const { clearSelectedRequest, clearError } = requestSlice.actions;
export default requestSlice.reducer;
