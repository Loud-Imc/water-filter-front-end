import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { userService } from '../../api/services/userService';
import type { User, Role } from '../../types';

interface UserState {
  users: User[];
  subordinates: User[];
  assignableRoles: Role[];
  technicians: User[]; 
  selectedUser: User | null;
  loading: boolean;
  error: string | null;
}

const initialState: UserState = {
  users: [],
  subordinates: [],
  assignableRoles: [],
  technicians: [],
  selectedUser: null,
  loading: false,
  error: null,
};

// Async thunks
export const fetchAllUsers = createAsyncThunk('users/fetchAll', async (_, { rejectWithValue }) => {
  try {
    return await userService.getAllUsers();
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || 'Failed to fetch users');
  }
});

export const fetchUserById = createAsyncThunk('users/fetchById', async (id: string, { rejectWithValue }) => {
  try {
    return await userService.getUserById(id);
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || 'Failed to fetch user');
  }
});

export const createUser = createAsyncThunk(
  'users/create',
  async (userData: Partial<User>, { rejectWithValue }) => {
    try {
      return await userService.createUser(userData);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create user');
    }
  }
);

export const updateUser = createAsyncThunk(
  'users/update',
  async ({ id, userData }: { id: string; userData: Partial<User> }, { rejectWithValue }) => {
    try {
      return await userService.updateUser(id, userData);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update user');
    }
  }
);

export const deleteUser = createAsyncThunk('users/delete', async (id: string, { rejectWithValue }) => {
  try {
    await userService.deleteUser(id);
    return id;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || 'Failed to delete user');
  }
});

export const fetchSubordinates = createAsyncThunk('users/fetchSubordinates', async (_, { rejectWithValue }) => {
  try {
    return await userService.getMySubordinates();
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || 'Failed to fetch subordinates');
  }
});

export const fetchAssignableRoles = createAsyncThunk('users/fetchAssignableRoles', async (_, { rejectWithValue }) => {
  try {
    return await userService.getAssignableRoles();
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || 'Failed to fetch roles');
  }
});

export const fetchTechnicians = createAsyncThunk(
  'users/fetchTechnicians',
  async (
    { query = '', regionId, limit = 100 }: { query?: string; regionId?: string; limit?: number },
    { rejectWithValue }
  ) => {
    try {
      return await userService.searchTechnicians(query, regionId, limit);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch technicians');
    }
  }
);

const userSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    clearSelectedUser: (state) => {
      state.selectedUser = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch all users
    builder
      .addCase(fetchAllUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload;
      })
      .addCase(fetchAllUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Fetch user by ID
    builder
      .addCase(fetchUserById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedUser = action.payload;
      })
      .addCase(fetchUserById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Create user
    builder
      .addCase(createUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createUser.fulfilled, (state, action) => {
        state.loading = false;
        state.users.push(action.payload);
      })
      .addCase(createUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Update user
    builder
      .addCase(updateUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.users.findIndex((u) => u.id === action.payload.id);
        if (index !== -1) {
          state.users[index] = action.payload;
        }
        state.selectedUser = action.payload;
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Delete user
    builder
      .addCase(deleteUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.loading = false;
        state.users = state.users.filter((u) => u.id !== action.payload);
      })
      .addCase(deleteUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Fetch subordinates
    builder
      .addCase(fetchSubordinates.fulfilled, (state, action) => {
        state.subordinates = action.payload;
      });

    // Fetch assignable roles
    builder
      .addCase(fetchAssignableRoles.fulfilled, (state, action) => {
        state.assignableRoles = action.payload;
      });

         // ✅ NEW: Fetch technicians
    builder
      .addCase(fetchTechnicians.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTechnicians.fulfilled, (state, action) => {
        state.loading = false;
        state.technicians = action.payload;
      })
      .addCase(fetchTechnicians.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearSelectedUser, clearError } = userSlice.actions;
export default userSlice.reducer;
