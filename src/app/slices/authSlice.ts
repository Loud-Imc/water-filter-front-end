import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { authService } from '../../api/services/authService';
import { axiosInstance } from '../../api/axios';
import { LoginCredentials, RegisterData, User } from '../../types';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  permissions: string[]; // ← NEW
  loading: boolean;
  error: string | null;
}

// Helper functions to persist/restore user
const saveUserToStorage = (user: User) => {
  localStorage.setItem('user', JSON.stringify(user));
};

const getUserFromStorage = (): User | null => {
  const userStr = localStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
};

// ← NEW: Save/restore permissions
const savePermissionsToStorage = (permissions: string[]) => {
  localStorage.setItem('permissions', JSON.stringify(permissions));
};

const getPermissionsFromStorage = (): string[] => {
  const permsStr = localStorage.getItem('permissions');
  return permsStr ? JSON.parse(permsStr) : [];
};

const initialState: AuthState = {
  user: getUserFromStorage(),
  accessToken: localStorage.getItem('accessToken'),
  isAuthenticated: !!(localStorage.getItem('accessToken') && getUserFromStorage()),
  permissions: getPermissionsFromStorage(), // ← NEW
  loading: false,
  error: null,
};

// ← NEW: Fetch user permissions
export const fetchUserPermissions = createAsyncThunk(
  'auth/fetchPermissions',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/users/me/permissions`);
      const permissions = response.data.effectivePermissions || [];
      savePermissionsToStorage(permissions); // Save to localStorage
      return permissions;
    } catch (error: any) {
      console.error('Failed to fetch permissions:', error);
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch permissions');
    }
  }
);

// Async thunks
export const login = createAsyncThunk(
  'auth/login',
  async (credentials: LoginCredentials, { rejectWithValue, dispatch }) => {
    try {
      const data = await authService.login(credentials);
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('userId', data.user.id);
      saveUserToStorage(data.user);
      
      // ← NEW: Fetch permissions after login
      await dispatch(fetchUserPermissions());
      
      return data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Login failed');
    }
  }
);

export const register = createAsyncThunk(
  'auth/register',
  async (userData: RegisterData, { rejectWithValue, dispatch }) => {
    try {
      const data = await authService.register(userData);
      localStorage.setItem('accessToken', data.accessToken);
      saveUserToStorage(data.user);
      
      // ← NEW: Fetch permissions after register
      await dispatch(fetchUserPermissions(data.user.id));
      
      return data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Registration failed');
    }
  }
);

export const logout = createAsyncThunk('auth/logout', async (_, { rejectWithValue }) => {
  try {
    await authService.logout();
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    localStorage.removeItem('userId');
    localStorage.removeItem('permissions'); // ← NEW
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || 'Logout failed');
  }
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action: PayloadAction<{ user: User; accessToken: string }>) => {
      state.user = action.payload.user;
      state.accessToken = action.payload.accessToken;
      state.isAuthenticated = true;
      state.error = null;
      saveUserToStorage(action.payload.user);
    },
    clearAuth: (state) => {
      state.user = null;
      state.accessToken = null;
      state.isAuthenticated = false;
      state.permissions = []; // ← NEW
      state.error = null;
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
      localStorage.removeItem('permissions'); // ← NEW
    },
    clearError: (state) => {
      state.error = null;
    },
    // ← NEW
    setPermissions: (state, action: PayloadAction<string[]>) => {
      state.permissions = action.payload;
      savePermissionsToStorage(action.payload);
    },
  },
  extraReducers: (builder) => {
    // Login
    builder
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
        state.isAuthenticated = true;
        state.error = null;
        // Permissions will be set by fetchUserPermissions
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.isAuthenticated = false;
      });

    // Register
    builder
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
        state.isAuthenticated = true;
        state.error = null;
        // Permissions will be set by fetchUserPermissions
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Logout
    builder
      .addCase(logout.pending, (state) => {
        state.loading = true;
      })
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.accessToken = null;
        state.isAuthenticated = false;
        state.permissions = []; // ← NEW
        state.loading = false;
        state.error = null;
      })
      .addCase(logout.rejected, (state) => {
        state.loading = false;
      });

    // ← NEW: Handle permission fetch
    builder
      .addCase(fetchUserPermissions.fulfilled, (state, action) => {
        state.permissions = action.payload;
      })
      .addCase(fetchUserPermissions.rejected, (state) => {
        state.permissions = [];
      });
  },
});

export const { setCredentials, clearAuth, clearError, setPermissions } = authSlice.actions;
export default authSlice.reducer;
