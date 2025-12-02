import React, { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  TextField,
  MenuItem,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { fetchAllRequests } from '../../app/slices/requestSlice';
import PageHeader from '../../components/common/PageHeader';
import DataTable from '../../components/common/DataTable';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import StatusChip from '../../components/common/StatusChip';
import { formatDate } from '../../utils/helpers';
import type { ServiceRequest, RequestStatus } from '../../types';

const ServiceRequestList: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  const { requests, loading } = useAppSelector((state) => state.requests);
  const { user } = useAppSelector((state) => state.auth); // ✅ Get current user

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');

  const initialStatus = (searchParams.get('status') as RequestStatus) || 'ALL';
  const [statusFilter, setStatusFilter] = useState<RequestStatus | 'ALL'>(initialStatus);

  useEffect(() => {
    dispatch(fetchAllRequests());
  }, [dispatch]);

  useEffect(() => {
    const statusParam = searchParams.get('status');
    if (statusParam && statusParam !== statusFilter) {
      setStatusFilter(statusParam as RequestStatus);
    }
  }, [searchParams]);

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

  const handleStatusChange = (newStatus: RequestStatus | 'ALL') => {
    setStatusFilter(newStatus);
    setPage(0);

    if (newStatus === 'ALL') {
      searchParams.delete('status');
    } else {
      searchParams.set('status', newStatus);
    }
    setSearchParams(searchParams);
  };

  // ✅ Check if user is technician
  const isTechnician = user?.role.name === 'Technician';

  // ✅ Filter requests based on role
  const filteredRequests = requests.filter((request) => {
    // ✅ For technicians: Only show requests assigned to them
    if (isTechnician) {
      const isAssignedToMe = request.assignedTo?.id === user?.id;
      if (!isAssignedToMe) return false;
    }

    // Status filter
    const matchesStatus = statusFilter === 'ALL' || request.status === statusFilter;

    // Search filter
    const matchesSearch =
      !searchQuery ||
      request?.customer?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request?.description?.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesStatus && matchesSearch;
  });

  const paginatedRequests = filteredRequests.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  // ✅ Conditionally show Technician column
  const columns = [
    { id: 'id', label: 'ID', minWidth: 100, format: (value: string) => value.slice(0, 8) },
    { id: 'type', label: 'Type', minWidth: 100 },
    {
      id: 'customer',
      label: 'Customer',
      minWidth: 150,
      format: (value: any) => value?.name || 'N/A',
    },
    { id: 'description', label: 'Description', minWidth: 200 },
    {
      id: 'status',
      label: 'Status',
      minWidth: 130,
      format: (value: RequestStatus, row: ServiceRequest) => (
        <StatusChip status={value} requestType={row.type} />
      ),
    },
    // ✅ Hide Technician column for technicians (they know it's them)
    ...(!isTechnician
      ? [
          {
            id: 'assignedTo',
            label: 'Technician',
            minWidth: 150,
            format: (value: any) => value?.name || 'Not Assigned',
          },
        ]
      : []),
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
      <PageHeader
        title={isTechnician ? 'My Tasks' : 'Service Requests'}
        subtitle={
          isTechnician
            ? 'Tasks assigned to you'
            : statusFilter !== 'ALL'
            ? `Filtered by: ${statusFilter.replace(/_/g, ' ')}`
            : undefined
        }
        action={
          // ✅ Hide "New Request" button for technicians
          !isTechnician
            ? {
                label: 'New Request',
                icon: <AddIcon />,
                onClick: () => navigate('/service-requests/create'),
              }
            : undefined
        }
      />

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <TextField
              label="Search"
              variant="outlined"
              size="small"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              sx={{ minWidth: 250 }}
              placeholder="Search by customer or description..."
            />
            <TextField
              select
              label="Status"
              size="small"
              value={statusFilter}
              onChange={(e) => handleStatusChange(e.target.value as RequestStatus | 'ALL')}
              sx={{ minWidth: 200 }}
            >
              <MenuItem value="ALL">All Status</MenuItem>
              {/* ✅ Hide irrelevant statuses for technicians */}
              {/* {!isTechnician && <MenuItem value="PENDING_APPROVAL">Pending Approval</MenuItem>} */}
              {/* {!isTechnician && <MenuItem value="APPROVED">Approved</MenuItem>} */}
              <MenuItem value="ASSIGNED">Assigned</MenuItem>
              <MenuItem value="ASSIGNED">Re-signed</MenuItem>
              <MenuItem value="IN_PROGRESS">In Progress</MenuItem>
              <MenuItem value="WORK_COMPLETED">Work Completed</MenuItem>
              <MenuItem value="COMPLETED">Completed</MenuItem>
              {/* {!isTechnician && <MenuItem value="REJECTED">Rejected</MenuItem>} */}
            </TextField>
          </Box>
        </CardContent>
      </Card>

      {filteredRequests.length === 0 ? (
        <EmptyState
          title={isTechnician ? 'No tasks assigned to you' : 'No service requests found'}
          description={
            isTechnician
              ? 'You have no tasks assigned yet. Check back later!'
              : statusFilter !== 'ALL'
              ? `No requests with status: ${statusFilter.replace(/_/g, ' ')}`
              : 'Create your first service request to get started'
          }
          actionLabel={!isTechnician ? 'Create Request' : undefined}
          onAction={!isTechnician ? () => navigate('/service-requests/create') : undefined}
        />
      ) : (
        <DataTable
          columns={columns}
          rows={paginatedRequests}
          page={page}
          rowsPerPage={rowsPerPage}
          totalRows={filteredRequests.length}
          onPageChange={handlePageChange}
          onRowsPerPageChange={handleRowsPerPageChange}
          onRowClick={handleRowClick}
        />
      )}
    </Box>
  );
};

export default ServiceRequestList;
