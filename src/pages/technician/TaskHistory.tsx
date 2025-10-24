import React, { useEffect } from 'react';
import { Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { fetchTaskHistory } from '../../app/slices/requestSlice';
import PageHeader from '../../components/common/PageHeader';
import DataTable from '../../components/common/DataTable';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import StatusChip from '../../components/common/StatusChip';
import { formatDate } from '../../utils/helpers';
import type { ServiceRequest, RequestStatus } from '../../types';
import HistoryIcon from '@mui/icons-material/History';

const TaskHistory: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { taskHistory, loading } = useAppSelector((state) => state.requests);

  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);

  useEffect(() => {
    dispatch(fetchTaskHistory());
  }, [dispatch]);

  const handlePageChange = (_: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleRowClick = (row: ServiceRequest) => {
    navigate(`/service-requests/${row.id}`);
  };

  const paginatedTasks = taskHistory.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const columns = [
    {
      id: 'customer',
      label: 'Customer',
      minWidth: 150,
      format: (value: any) => value.name,
    },
    { id: 'type', label: 'Type', minWidth: 100 },
    { id: 'description', label: 'Description', minWidth: 200 },
    {
      id: 'status',
      label: 'Status',
      minWidth: 130,
      format: (value: RequestStatus) => <StatusChip status={value} />,
    },
    {
      id: 'createdAt',
      label: 'Created',
      minWidth: 150,
      format: (value: string) => formatDate(value),
    },
  ];

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <Box>
      <PageHeader title="Task History" />

      {taskHistory.length === 0 ? (
        <EmptyState
          icon={<HistoryIcon sx={{ fontSize: 80, color: 'text.disabled' }} />}
          title="No task history"
          description="Your completed tasks will appear here"
        />
      ) : (
        <DataTable
          columns={columns}
          rows={paginatedTasks}
          page={page}
          rowsPerPage={rowsPerPage}
          totalRows={taskHistory.length}
          onPageChange={handlePageChange}
          onRowsPerPageChange={handleRowsPerPageChange}
          onRowClick={handleRowClick}
        />
      )}
    </Box>
  );
};

export default TaskHistory;
