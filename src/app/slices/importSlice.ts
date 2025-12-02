
// ============================================
// FILE: app/slices/importSlice.ts
// ============================================

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { axiosInstance } from '../../api/axios';

interface ImportSummary {
  regions: number;
  technicians: number;
  products: number;
  customers: number;
  installations: number;
  serviceRequests: number;
}

interface ImportResult {
  success: boolean;
  summary: ImportSummary;
  errors: string[];
}

interface ImportState {
  loading: boolean;
  error: string | null;
  lastResult: ImportResult | null;
}

const initialState: ImportState = {
  loading: false,
  error: null,
  lastResult: null,
};

// Thunk for importing Excel data
export const importExcelData = createAsyncThunk(
  'import/excel',
  async (formData: FormData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post('/service-requests/import/excel', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data as ImportResult;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Import failed'
      );
    }
  }
);

const importSlice = createSlice({
  name: 'import',
  initialState,
  reducers: {
    clearImportResult: (state) => {
      state.lastResult = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(importExcelData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(importExcelData.fulfilled, (state, action) => {
        state.loading = false;
        state.lastResult = action.payload;
      })
      .addCase(importExcelData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearImportResult } = importSlice.actions;
export default importSlice.reducer;