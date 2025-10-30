import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Checkbox,
  FormControlLabel,
  Chip,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Divider,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import LockIcon from '@mui/icons-material/Lock';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { axiosInstance } from '../api/axios';

interface Permission {
  module: string;
  action: string;
  key: string;
  label: string;
  description: string;
}

interface PermissionsByModule {
  [module: string]: Permission[];
}

interface PermissionSelectorProps {
  userId: string;
  onChange?: (permissions: { add: string[]; remove: string[] }) => void;
  readOnly?: boolean;
}

export const PermissionSelector: React.FC<PermissionSelectorProps> = ({
  userId,
  onChange,
  readOnly = false,
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [availablePermissions, setAvailablePermissions] = useState<PermissionsByModule>({});
  const [rolePermissions, setRolePermissions] = useState<string[]>([]);
  const [addedPermissions, setAddedPermissions] = useState<string[]>([]);
  const [removedPermissions, setRemovedPermissions] = useState<string[]>([]);

  useEffect(() => {
    fetchPermissions();
  }, [userId]);

  const fetchPermissions = async () => {
    try {
      setLoading(true);
      
      const [availableRes, userPermsRes] = await Promise.all([
        axiosInstance.get('/users/meta/available-permissions'),
        axiosInstance.get(`/users/${userId}/permissions`),
      ]);

      setAvailablePermissions(availableRes.data.byModule);
      setRolePermissions(userPermsRes.data.rolePermissions || []);
      setAddedPermissions(userPermsRes.data.customPermissions?.add || []);
      setRemovedPermissions(userPermsRes.data.customPermissions?.remove || []);
    } catch (err: any) {
      console.error('Failed to fetch permissions:', err);
      setError(err.response?.data?.message || err.message || 'Failed to load permissions');
    } finally {
      setLoading(false);
    }
  };

  const getPermissionStatus = (permKey: string): 'role' | 'added' | 'removed' | 'none' => {
    if (removedPermissions.includes(permKey)) return 'removed';
    if (addedPermissions.includes(permKey)) return 'added';
    if (rolePermissions.includes(permKey)) return 'role';
    return 'none';
  };

  const handlePermissionToggle = (permKey: string) => {
    if (readOnly) return;

    const status = getPermissionStatus(permKey);
    let newAdded = [...addedPermissions];
    let newRemoved = [...removedPermissions];

    if (status === 'role') {
      newRemoved.push(permKey);
    } else if (status === 'added') {
      newAdded = newAdded.filter((p) => p !== permKey);
    } else if (status === 'removed') {
      newRemoved = newRemoved.filter((p) => p !== permKey);
    } else {
      newAdded.push(permKey);
    }

    setAddedPermissions(newAdded);
    setRemovedPermissions(newRemoved);

    if (onChange) {
      onChange({ add: newAdded, remove: newRemoved });
    }
  };

  const effectivePermissions = rolePermissions
    .filter(p => !removedPermissions.includes(p))
    .concat(addedPermissions);

  const getPermissionLabel = (permKey: string): string => {
    for (const perms of Object.values(availablePermissions)) {
      const found = perms.find(p => p.key === permKey);
      if (found) return found.label;
    }
    return permKey;
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  return (
    <Box>
      {/* ✅ UPDATED: Softer, Professional Colors */}
      <Card 
        sx={{ 
          mb: 3, 
          bgcolor: 'grey.50',
          border: '1px solid',
          borderColor: 'grey.200',
        }}
      >
        <CardContent>
          <Typography 
            variant="h6" 
            gutterBottom 
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 1,
              color: 'text.primary',
            }}
          >
            <CheckCircleIcon sx={{ color: 'success.main' }} />
            Current Assigned Permissions ({effectivePermissions.length})
          </Typography>
          
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2 }}>
            {effectivePermissions.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                No permissions assigned
              </Typography>
            ) : (
              effectivePermissions.map((permKey) => {
                const status = getPermissionStatus(permKey);
                return (
                  <Chip
                    key={permKey}
                    label={getPermissionLabel(permKey)}
                    size="small"
                    // ✅ SOFTER COLORS
                    sx={{
                      fontWeight: 500,
                      bgcolor: status === 'added' ? 'success.50' : 'grey.100',
                      color: status === 'added' ? 'success.700' : 'text.primary',
                      border: '1px solid',
                      borderColor: status === 'added' ? 'success.300' : 'grey.300',
                      '& .MuiChip-icon': {
                        color: status === 'added' ? 'success.600' : 'grey.600',
                      },
                    }}
                    icon={status === 'role' ? <LockIcon /> : <AddIcon />}
                  />
                );
              })
            )}
          </Box>

          {/* ✅ UPDATED: Softer Stat Chips */}
          <Box sx={{ display: 'flex', gap: 2, mt: 2, pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
            <Chip
              label={`From Role: ${rolePermissions.length}`}
              icon={<LockIcon />}
              size="small"
              sx={{
                bgcolor: 'grey.100',
                color: 'grey.700',
                border: '1px solid',
                borderColor: 'grey.300',
              }}
            />
            <Chip
              label={`Custom Added: ${addedPermissions.length}`}
              icon={<AddIcon />}
              size="small"
              sx={{
                bgcolor: 'success.50',
                color: 'success.700',
                border: '1px solid',
                borderColor: 'success.300',
              }}
            />
            {removedPermissions.length > 0 && (
              <Chip
                label={`Revoked: ${removedPermissions.length}`}
                icon={<RemoveIcon />}
                size="small"
                sx={{
                  bgcolor: 'error.50',
                  color: 'error.700',
                  border: '1px solid',
                  borderColor: 'error.300',
                }}
              />
            )}
          </Box>
        </CardContent>
      </Card>

      <Divider sx={{ my: 3 }} />

      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        <LockIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 1 }} />
        Permissions from role are shown with a lock icon. You can add custom permissions or revoke role permissions.
      </Typography>

      {Object.entries(availablePermissions).map(([module, permissions]) => (
        <Accordion key={module}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6" sx={{ textTransform: 'capitalize' }}>
              {module}
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Box>
              {permissions.map((perm) => {
                const status = getPermissionStatus(perm.key);
                const isChecked = status === 'role' || status === 'added';
                const isFromRole = status === 'role';
                const isRevoked = status === 'removed';
                const isCustom = status === 'added';

                return (
                  <Box
                    key={perm.key}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      py: 1,
                      borderBottom: '1px solid',
                      borderColor: 'divider',
                      opacity: isRevoked ? 0.5 : 1,
                    }}
                  >
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={isChecked && !isRevoked}
                          onChange={() => handlePermissionToggle(perm.key)}
                          disabled={readOnly}
                        />
                      }
                      label={
                        <Box>
                          <Typography variant="body1">
                            {perm.label}
                            {isFromRole && (
                              <LockIcon
                                fontSize="small"
                                sx={{ ml: 1, verticalAlign: 'middle', fontSize: 16, color: 'grey.500' }}
                              />
                            )}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {perm.description}
                          </Typography>
                        </Box>
                      }
                    />
                    <Box>
                      {isCustom && (
                        <Chip
                          icon={<AddIcon />}
                          label="Custom"
                          size="small"
                          sx={{
                            bgcolor: 'success.50',
                            color: 'success.700',
                            border: '1px solid',
                            borderColor: 'success.300',
                          }}
                        />
                      )}
                      {isRevoked && (
                        <Chip
                          icon={<RemoveIcon />}
                          label="Revoked"
                          size="small"
                          sx={{
                            bgcolor: 'error.50',
                            color: 'error.700',
                            border: '1px solid',
                            borderColor: 'error.300',
                          }}
                        />
                      )}
                    </Box>
                  </Box>
                );
              })}
            </Box>
          </AccordionDetails>
        </Accordion>
      ))}
    </Box>
  );
};
