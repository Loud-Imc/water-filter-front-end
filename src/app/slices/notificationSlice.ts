import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { notificationService } from '../../api/services/notificationService';
import { type Notification } from '../../types';

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
}

const initialState: NotificationState = {
  notifications: [],
  unreadCount: 0,
  loading: false,
  error: null,
};

// Async thunks
export const fetchNotifications = createAsyncThunk('notifications/fetchAll', async (_, { rejectWithValue }) => {
  try {
    return await notificationService.getNotifications();
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || 'Failed to fetch notifications');
  }
});

export const fetchUnreadCount = createAsyncThunk('notifications/fetchUnreadCount', async (_, { rejectWithValue }) => {
  try {
    const data = await notificationService.getUnreadCount();
    return data.count;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || 'Failed to fetch unread count');
  }
});

export const markNotificationAsRead = createAsyncThunk(
  'notifications/markAsRead',
  async (id: string, { rejectWithValue }) => {
    try {
      return await notificationService.markAsRead(id);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to mark as read');
    }
  }
);

export const markMultipleAsRead = createAsyncThunk(
  'notifications/markMultipleAsRead',
  async (ids: string[], { rejectWithValue }) => {
    try {
      await notificationService.markMultipleAsRead(ids);
      return ids;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to mark notifications as read');
    }
  }
);

const notificationSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    decrementUnreadCount: (state) => {
      if (state.unreadCount > 0) state.unreadCount -= 1;
    },
  },
  extraReducers: (builder) => {
    // Fetch notifications
    builder
      .addCase(fetchNotifications.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.loading = false;
        state.notifications = action.payload;
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Fetch unread count
    builder
      .addCase(fetchUnreadCount.fulfilled, (state, action) => {
        state.unreadCount = action.payload;
      });

    // Mark as read
    builder
      .addCase(markNotificationAsRead.fulfilled, (state, action) => {
        const notification = state.notifications.find((n) => n.id === action.payload.id);
        if (notification) {
          notification.status = 'read';
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
      });

    // Mark multiple as read
    builder
      .addCase(markMultipleAsRead.fulfilled, (state, action) => {
        const ids = action.payload;
        state.notifications = state.notifications.map((n) =>
          ids.includes(n.id) ? { ...n, status: 'read' as const } : n
        );
        state.unreadCount = Math.max(0, state.unreadCount - ids.length);
      });
  },
});

export const { clearError, decrementUnreadCount } = notificationSlice.actions;
export default notificationSlice.reducer;
