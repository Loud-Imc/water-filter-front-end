import React, { useEffect, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  TextField,
  MenuItem,
  Typography,
  Stack,
  Chip,
  useMediaQuery,
  useTheme,
  Divider,
  Pagination,
  ToggleButton,
  ToggleButtonGroup,
  LinearProgress,
  Button,
  Collapse,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import PersonIcon from "@mui/icons-material/Person";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import DescriptionIcon from "@mui/icons-material/Description";
import FilterListIcon from "@mui/icons-material/FilterList";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { fetchAllRequests } from "../../app/slices/requestSlice";
import PageHeader from "../../components/common/PageHeader";
import DataTable from "../../components/common/DataTable";
import EmptyState from "../../components/common/EmptyState";
import StatusChip from "../../components/common/StatusChip";
import { formatDate } from "../../utils/helpers";
import type { ServiceRequest, RequestStatus } from "../../types";

const ServiceRequestList: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [searchParams, setSearchParams] = useSearchParams();
  const { requests, loading, meta } = useAppSelector((state) => state.requests); // 🆕 Get meta
  const { user } = useAppSelector((state) => state.auth);

  const [page, setPage] = useState(1); // 🆕 Changed from 0 to 1 for backend
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [searchBy, setSearchBy] = useState<"general" | "technician">("general");
  const [sortBy, setSortBy] = useState<string>("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [showFilters, setShowFilters] = useState(false);

  const initialStatus = (searchParams.get("status") as RequestStatus) || "ALL";
  const [statusFilter, setStatusFilter] = useState<RequestStatus | "ALL">(
    initialStatus
  );

  const isTechnician = user?.role.name === "Technician";

  // 🆕 Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setPage(1); // Reset to page 1 on new search
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // 🆕 Fetch data with pagination and search
  useEffect(() => {
    dispatch(
      fetchAllRequests({
        page,
        limit: rowsPerPage,
        status: statusFilter !== "ALL" ? statusFilter : undefined,
        userId: isTechnician ? user?.id : undefined,
        search: debouncedSearch || undefined,
        searchBy: searchBy,
        sortBy: sortBy,
        sortOrder: sortOrder,
      })
    );
  }, [dispatch, page, rowsPerPage, statusFilter, debouncedSearch, searchBy, isTechnician, sortBy, sortOrder]);

  useEffect(() => {
    const statusParam = searchParams.get("status");
    if (statusParam && statusParam !== statusFilter) {
      setStatusFilter(statusParam as RequestStatus);
      setPage(1);
    }
  }, [searchParams]);

  const handlePageChange = (_: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(1);
  };

  const handleRowClick = (row: ServiceRequest) => {
    navigate(`/service-requests/${row.id}`);
  };

  const handleStatusChange = (newStatus: RequestStatus | "ALL") => {
    setStatusFilter(newStatus);
    setPage(1);

    if (newStatus === "ALL") {
      searchParams.delete("status");
    } else {
      searchParams.set("status", newStatus);
    }
    setSearchParams(searchParams);
  };

  // 🆕 Search is now handled by the backend for better pagination support
  const filteredRequests = requests;

  const columns = [
    {
      id: "createdAt",
      label: "Created",
      minWidth: 150,
      format: (value: string) => formatDate(value),
    },
    {
      id: "workCompletedAt",
      label: "Work Completed",
      minWidth: 150,
      format: (_: any, row: ServiceRequest) => {
        const lastWorkLog = row.workLogs?.[0];
        return lastWorkLog?.endTime ? formatDate(lastWorkLog.endTime) : "-";
      },
    },
    {
      id: "id",
      label: "ID",
      minWidth: 100,
      format: (value: string) => value.slice(0, 8),
    },
    { id: "type", label: "Type", minWidth: 100 },
    {
      id: "customer",
      label: "Customer",
      minWidth: 150,
      format: (value: any) => value?.name || "N/A",
    },
    { id: "description", label: "Description", minWidth: 200 },
    {
      id: "status",
      label: "Status",
      minWidth: 130,
      format: (value: RequestStatus, row: ServiceRequest) => (
        <StatusChip status={value} requestType={row.type} />
      ),
    },
    ...(!isTechnician
      ? [
          {
            id: "assignedTo",
            label: "Technician",
            minWidth: 150,
            format: (value: any) => value?.name || "Not Assigned",
          },
        ]
      : []),
  ];

  const MobileTaskCard: React.FC<{ request: ServiceRequest }> = ({
    request,
  }) => (
    <Card
      sx={{
        mb: 2,
        cursor: "pointer",
        "&:hover": {
          boxShadow: 3,
          borderColor: "primary.main",
        },
        border: "1px solid",
        borderColor: "divider",
      }}
      onClick={() => handleRowClick(request)}
    >
      <CardContent>
        <Stack spacing={2}>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            <Chip
              label={request.type}
              size="small"
              color="primary"
              variant="outlined"
            />
            <StatusChip status={request.status} requestType={request.type} />
          </Box>

          <Divider />

          <Box display="flex" alignItems="center" gap={1}>
            <PersonIcon fontSize="small" color="action" />
            <Box>
              <Typography
                variant="caption"
                color="text.secondary"
                display="block"
              >
                Customer
              </Typography>
              <Typography variant="body2" fontWeight={600}>
                {request.customer?.name || "N/A"}
              </Typography>
            </Box>
          </Box>

          {request.description && (
            <Box display="flex" alignItems="flex-start" gap={1}>
              <DescriptionIcon
                fontSize="small"
                color="action"
                sx={{ mt: 0.5 }}
              />
              <Box>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  display="block"
                >
                  Description
                </Typography>
                <Typography variant="body2" color="text.primary">
                  {request.description.length > 80
                    ? `${request.description.substring(0, 80)}...`
                    : request.description}
                </Typography>
              </Box>
            </Box>
          )}

          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            <Box display="flex" alignItems="center" gap={0.5}>
              <CalendarTodayIcon fontSize="small" color="action" />
              <Typography variant="caption" color="text.secondary">
                {formatDate(request.createdAt)}
              </Typography>
            </Box>
            <Typography variant="caption" color="text.secondary">
              ID: {request.id.slice(0, 8)}
            </Typography>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );

  return (
    <Box>
      <PageHeader
        title={isTechnician ? "My Tasks" : "Service Requests"}
        subtitle={
          isTechnician
            ? "Tasks assigned to you"
            : statusFilter !== "ALL"
            ? `Filtered by: ${statusFilter.replace(/_/g, " ")}`
            : undefined
        }
        action={
          !isTechnician
            ? {
                label: "New Request",
                icon: <AddIcon />,
                onClick: () => navigate("/service-requests/create"),
              }
            : undefined
        }
      />

      <Card sx={{ mb: 3 }}>
        <CardContent>
          {isMobile && (
            <Button
              variant="outlined"
              startIcon={<FilterListIcon />}
              onClick={() => setShowFilters(!showFilters)}
              fullWidth
              sx={{ mb: showFilters ? 2 : 0 }}
            >
              {showFilters ? "Hide Filters" : "Show Filters & Sorting"}
            </Button>
          )}

          <Collapse in={!isMobile || showFilters}>
            <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
              <TextField
                label={searchBy === "general" ? "Search" : "Search Technician"}
                variant="outlined"
                size="small"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                sx={{ minWidth: isMobile ? "100%" : 250 }}
                placeholder={
                  searchBy === "general"
                    ? "Search by customer, description or ID..."
                    : "Type technician name..."
                }
              />

              {!isTechnician && (
                <ToggleButtonGroup
                  value={searchBy}
                  exclusive
                  onChange={(_, value) => {
                    if (value) {
                      setSearchBy(value);
                      setPage(1);
                    }
                  }}
                  size="small"
                  color="primary"
                >
                  <ToggleButton value="general">General</ToggleButton>
                  <ToggleButton value="technician">Technician</ToggleButton>
                </ToggleButtonGroup>
              )}

              <TextField
                select
                label="Status"
                size="small"
                value={statusFilter}
                onChange={(e) =>
                  handleStatusChange(e.target.value as RequestStatus | "ALL")
                }
                sx={{ minWidth: isMobile ? "100%" : 200 }}
              >
                <MenuItem value="ALL">All Status</MenuItem>
                <MenuItem value="ASSIGNED">Assigned</MenuItem>
                <MenuItem value="RE_ASSIGNED">Re-assigned</MenuItem>
                <MenuItem value="IN_PROGRESS">In Progress</MenuItem>
                <MenuItem value="WORK_COMPLETED">Work Completed</MenuItem>
                <MenuItem value="COMPLETED">Completed</MenuItem>
              </TextField>

              <TextField
                select
                label="Sort By"
                size="small"
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value);
                  setPage(1);
                }}
                sx={{ minWidth: isMobile ? "100%" : 160 }}
              >
                <MenuItem value="createdAt">Created Date</MenuItem>
                <MenuItem value="workCompletedAt">Work Completed</MenuItem>
              </TextField>

              <TextField
                select
                label="Order"
                size="small"
                value={sortOrder}
                onChange={(e) => {
                  setSortOrder(e.target.value as "asc" | "desc");
                  setPage(1);
                }}
                sx={{ minWidth: isMobile ? "100%" : 120 }}
              >
                <MenuItem value="desc">Newest First</MenuItem>
                <MenuItem value="asc">Oldest First</MenuItem>
              </TextField>

              {/* Search mode information */}
              {!isTechnician && (
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ alignSelf: "center", ml: 1 }}
                >
                  Mode:{" "}
                  {searchBy === "general" ? "Customer/ID Only" : "Technician Only"}
                </Typography>
              )}
            </Box>
          </Collapse>

          {/* 🆕 Show count */}
          <Box sx={{ mt: 1 }}>
            <Typography variant="caption" color="text.secondary">
              Showing {(page - 1) * rowsPerPage + 1} -{" "}
              {Math.min(page * rowsPerPage, meta.total)} of {meta.total}{" "}
              requests
            </Typography>
          </Box>
        </CardContent>
      </Card>

      {loading && <LinearProgress sx={{ mb: 3, borderRadius: 2 }} />}

      {filteredRequests.length === 0 && !loading ? (
        <EmptyState
          title={
            isTechnician
              ? "No tasks assigned to you"
              : "No service requests found"
          }
          description={
            isTechnician
              ? "You have no tasks assigned yet. Check back later!"
              : statusFilter !== "ALL"
              ? `No requests with status: ${statusFilter.replace(/_/g, " ")}`
              : "Create your first service request to get started"
          }
          actionLabel={!isTechnician ? "Create Request" : undefined}
          onAction={
            !isTechnician
              ? () => navigate("/service-requests/create")
              : undefined
          }
        />
      ) : (
        <Box sx={{ opacity: loading ? 0.6 : 1 }}>
          {isTechnician && isMobile ? (
            <>
              <Box>
                {filteredRequests.map((request) => (
                  <MobileTaskCard key={request.id} request={request} />
                ))}
              </Box>

              {/* 🆕 Mobile Pagination */}
              <Box
                sx={{
                  mt: 3,
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  gap: 2,
                  flexDirection: "column",
                }}
              >
                <Pagination
                  count={meta.totalPages}
                  page={page}
                  onChange={handlePageChange}
                  color="primary"
                  size="small"
                />
                <TextField
                  select
                  size="small"
                  label="Per page"
                  value={rowsPerPage}
                  onChange={handleRowsPerPageChange}
                  sx={{ width: 100 }}
                >
                  <MenuItem value={10}>10</MenuItem>
                  <MenuItem value={25}>25</MenuItem>
                  <MenuItem value={50}>50</MenuItem>
                </TextField>
              </Box>
            </>
          ) : (
            <>
              <DataTable
                columns={columns}
                rows={filteredRequests}
                page={page - 1} // DataTable uses 0-based indexing
                rowsPerPage={rowsPerPage}
                totalRows={meta.total}
                onPageChange={(_, newPage) => setPage(newPage + 1)} // Convert back to 1-based
                onRowsPerPageChange={handleRowsPerPageChange}
                onRowClick={handleRowClick}
              />

              {/* 🆕 Desktop Pagination (if not using DataTable's built-in) */}
              {meta.totalPages > 1 && (
                <Box sx={{ mt: 3, display: "flex", justifyContent: "center" }}>
                  <Pagination
                    count={meta.totalPages}
                    page={page}
                    onChange={handlePageChange}
                    color="primary"
                    showFirstButton
                    showLastButton
                  />
                </Box>
              )}
            </>
          )}
        </Box>
      )}
    </Box>
  );
};

export default ServiceRequestList;
