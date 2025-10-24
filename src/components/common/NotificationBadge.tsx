import React, { useEffect } from 'react';
import { Badge, IconButton } from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { fetchUnreadCount } from '../../app/slices/notificationSlice';

const NotificationBadge: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { unreadCount } = useAppSelector((state) => state.notifications);

  useEffect(() => {
    dispatch(fetchUnreadCount());

    // Poll for new notifications every 30 seconds
    const interval = setInterval(() => {
      dispatch(fetchUnreadCount());
    }, 30000);

    return () => clearInterval(interval);
  }, [dispatch]);

  const handleClick = () => {
    navigate('/notifications');
  };

  return (
    <IconButton color="inherit" onClick={handleClick}>
      <Badge badgeContent={unreadCount} color="error">
        <NotificationsIcon />
      </Badge>
    </IconButton>
  );
};

export default NotificationBadge;
