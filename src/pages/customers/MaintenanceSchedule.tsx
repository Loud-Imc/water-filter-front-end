import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Chip,
  TextField,
  InputAdornment,
  CircularProgress,
  Alert,
} from "@mui/material";
import {
  Search as SearchIcon,
  Schedule as ScheduleIcon,
  Phone as PhoneIcon,
  Person as PersonIcon,
  History as HistoryIcon,
} from "@mui/icons-material";
import { installationService } from "../../api/services/installationService";
import type { Installation } from "../../types";
import { useNavigate } from "react-router-dom";

const MaintenanceSchedule: React.FC = () => {
  const [schedule, setSchedule] = useState<Installation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  const fetchSchedule = async () => {
    setLoading(true);
    try {
      const data = await installationService.getMaintenanceSchedule();
      setSchedule(data);
    } catch (err) {
      console.error("Failed to fetch maintenance schedule:", err);
      setError("Failed to load maintenance schedule. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedule();
  }, []);

  const filteredSchedule = schedule.filter((item) =>
    item.customer?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.customer?.primaryPhone.includes(searchTerm) ||
    item.region?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (date: string) => {
    const dueDate = new Date(date);
    const now = new Date();
    const diffDays = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return "error"; // Overdue
    if (diffDays <= 7) return "warning"; // Due within a week
    return "success"; // Far away
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Maintenance Schedule
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Proactive tracking of filter (spun) changes for all customers.
          </Typography>
        </Box>
        <Button 
          variant="contained" 
          startIcon={<HistoryIcon />}
          onClick={fetchSchedule}
        >
          Refresh Schedule
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      <Card sx={{ mb: 4, boxShadow: 2 }}>
        <CardContent>
          <TextField
            fullWidth
            placeholder="Search by customer name, phone, or region..."
            variant="outlined"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
            }}
          />
        </CardContent>
      </Card>

      <TableContainer component={Paper} sx={{ boxShadow: 3, borderRadius: 2, overflow: 'hidden' }}>
        <Table>
          <TableHead sx={{ bgcolor: 'primary.main' }}>
            <TableRow>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Customer</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Region</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Last Spun Change</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Next Spun Change</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Status</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold', textAlign: 'center' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredSchedule.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    No maintenance records found.
                  </Typography>
                  <Typography variant="body2" color="text.disabled">
                    Schedule a maintenance update from a customer's service request to see them here.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              filteredSchedule.map((item) => (
                <TableRow key={item.id} hover>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <PersonIcon color="action" fontSize="small" />
                      <Box>
                        <Typography variant="subtitle2" fontWeight="bold">
                          {item.customer?.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <PhoneIcon sx={{ fontSize: 12 }} /> {item.customer?.primaryPhone}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>{item.region?.name}</TableCell>
                  <TableCell>
                    {item.lastSpunChangeAt ? (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <HistoryIcon fontSize="small" color="disabled" />
                        <Typography variant="body2">
                          {new Date(item.lastSpunChangeAt).toLocaleDateString()}
                        </Typography>
                      </Box>
                    ) : (
                      <Typography variant="caption" color="text.secondary">Never recorded</Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <ScheduleIcon fontSize="small" color="action" />
                      <Typography variant="body2" fontWeight="medium">
                        {new Date(item.nextSpunChangeAt!).toLocaleDateString()}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={new Date(item.nextSpunChangeAt!) < new Date() ? "Overdue" : "Upcoming"}
                      color={getStatusColor(item.nextSpunChangeAt!)}
                      size="small"
                      variant="filled"
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => navigate(`/customers/${item.customerId}`)}
                    >
                      View Customer
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default MaintenanceSchedule;
