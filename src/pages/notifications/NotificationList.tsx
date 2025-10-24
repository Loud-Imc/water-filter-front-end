import React, { useEffect } from 'react';
import {
  Box,
  Card,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Typography,
  IconButton,
  Chip,
  Button,
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import CheckIcon from '@mui/icons-material/Check';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import {
  fetchNotifications,
  markNotificationAsRead,
  markMultipleAsRead,
} from '../../app/slices/notificationSlice';
import PageHeader from '../../components/common/PageHeader';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import { formatDate } from '../../utils/helpers';

const NotificationList: React.FC = () => {
  const dispatch = useAppDispatch();
  const { notifications, loading } = useAppSelector((state) => state.notifications);

  useEffect(() => {
    dispatch(fetchNotifications());
  }, [dispatch]);

  const handleMarkAsRead = (id: string) => {
    dispatch(markNotificationAsRead(id));
  };

  const handleMarkAllAsRead = () => {
    const unreadIds = notifications.filter((n) => n.status !== 'read').map((n) => n.id);
    if (unreadIds.length > 0) {
      dispatch(markMultipleAsRead(unreadIds));
    }
  };

  const unreadCount = notifications.filter((n) => n.status !== 'read').length;

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <Box>
      <PageHeader
        title="Notifications"
        action={
          unreadCount > 0
            ? {
                label: 'Mark All as Read',
                icon: <DoneAllIcon />,
                onClick: handleMarkAllAsRead,
              }
            : undefined
        }
      />

      {notifications.length === 0 ? (
        <EmptyState
          icon={<NotificationsIcon sx={{ fontSize: 80, color: 'text.disabled' }} />}
          title="No notifications"
          description="You're all caught up! No new notifications at the moment."
        />
      ) : (
        <Card>
          <List>
            {notifications.map((notification, index) => (
              <React.Fragment key={notification.id}>
                <ListItem
                  alignItems="flex-start"
                  sx={{
                    bgcolor: notification.status === 'read' ? 'transparent' : 'action.hover',
                  }}
                  secondaryAction={
                    notification.status !== 'read' && (
                      <IconButton
                        edge="end"
                        onClick={() => handleMarkAsRead(notification.id)}
                        size="small"
                      >
                        <CheckIcon />
                      </IconButton>
                    )
                  }
                >
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: 'primary.main' }}>
                      <NotificationsIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body1">{notification.message}</Typography>
                        {notification.status !== 'read' && (
                          <Chip label="New" color="primary" size="small" />
                        )}
                      </Box>
                    }
                    secondary={
                      <>
                        <Typography variant="caption" color="text.secondary">
                          From: {notification.sender.name}
                        </Typography>
                        <br />
                        <Typography variant="caption" color="text.disabled">
                          {formatDate(notification.createdAt)}
                        </Typography>
                      </>
                    }
                  />
                </ListItem>
                {index < notifications.length - 1 && <Box sx={{ borderBottom: 1, borderColor: 'divider' }} />}
              </React.Fragment>
            ))}
          </List>
        </Card>
      )}
    </Box>
  );
};

export default NotificationList;
