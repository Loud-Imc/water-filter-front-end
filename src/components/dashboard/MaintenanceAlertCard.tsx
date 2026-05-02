import React, { useEffect, useState } from "react";
import {
  Card,
  CardHeader,
  CardContent,
  Typography,
  List,
  ListItem,
  ListItemText,
  Button,
  Box,
  Divider,
  Chip,
} from "@mui/material";
import { WaterDrop, Schedule, Phone } from "@mui/icons-material";
import { installationService } from "../../api/services/installationService";
import type { Installation } from "../../types";
import { useNavigate } from "react-router-dom";

const MaintenanceAlertCard: React.FC = () => {
  const [alerts, setAlerts] = useState<Installation[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const data = await installationService.getUpcomingMaintenance(30); // Show alerts for next 30 days
        setAlerts(data);
      } catch (err) {
        console.error("Failed to fetch maintenance alerts:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAlerts();
  }, []);

  if (loading) return null;

  return (
    <Card sx={{ height: "100%", boxShadow: 3, border: '1px solid', borderColor: 'warning.light' }}>
      <CardHeader
        title={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <WaterDrop color="primary" />
            <Typography variant="h6">Maintenance Alerts</Typography>
            {alerts.length > 0 && <Chip label={alerts.length} color="error" size="small" />}
          </Box>
        }
        subheader="Systems due for filter (spun) change soon"
        sx={{ borderBottom: '1px solid', borderColor: 'divider' }}
      />
      <CardContent sx={{ p: 0, maxHeight: 400, overflow: 'auto' }}>
        {alerts.length === 0 ? (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="body1" color="text.secondary">
              ✨ All systems are up to date!
            </Typography>
            <Typography variant="caption" color="text.secondary">
              No filter changes are due in the next 15 days.
            </Typography>
          </Box>
        ) : (
          <List disablePadding>
          {alerts.map((alert, index) => (
            <React.Fragment key={alert.id}>
              {index > 0 && <Divider component="li" />}
              <ListItem
                sx={{
                  '&:hover': { bgcolor: 'action.hover' },
                  py: 2
                }}
                secondaryAction={
                  <Button 
                    variant="contained" 
                    size="small"
                    color="primary"
                    onClick={() => navigate(`/customers/${alert.customerId}`)}
                  >
                    View
                  </Button>
                }
              >
                <ListItemText
                  primary={
                    <Typography variant="subtitle2" fontWeight="bold">
                      {alert.customer?.name}
                    </Typography>
                  }
                  secondary={
                    <Box component="div" sx={{ mt: 0.5 }}>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        {alert.name} ({alert.region?.name})
                      </Typography>
                      <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 1, mt: 1 }}>
                         <Chip 
                            size="small" 
                            icon={<Schedule sx={{ fontSize: "14px !important" }} />}
                            label={`Due: ${new Date(alert.nextSpunChangeAt!).toLocaleDateString()}`}
                            color={new Date(alert.nextSpunChangeAt!) < new Date() ? "error" : "warning"}
                            variant="filled"
                         />
                         {alert.customer?.primaryPhone && (
                           <Typography variant="caption" sx={{ display: "flex", alignItems: "center", color: 'text.secondary' }}>
                              <Phone sx={{ fontSize: 14, mr: 0.5 }} /> {alert.customer.primaryPhone}
                           </Typography>
                         )}
                      </Box>
                    </Box>
                  }
                />
              </ListItem>
            </React.Fragment>
          ))}
        </List>
        )}
      </CardContent>
    </Card>
  );
};

export default MaintenanceAlertCard;
