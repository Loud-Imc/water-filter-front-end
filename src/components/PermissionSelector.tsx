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
  Tooltip,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import LockIcon from '@mui/icons-material/Lock';
import AddIcon from '@mui/icons-material/Add';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
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
  onSaveSuccess?: () => void; // ✅ NEW: Callback when permissions are saved
}

export const PermissionSelector: React.FC<PermissionSelectorProps> = ({
  userId,
  onChange,
  readOnly = false,
  // onSaveSuccess,
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [availablePermissions, setAvailablePermissions] = useState<PermissionsByModule>({});
  const [defaultPermissions, setDefaultPermissions] = useState<string[]>([]);
  const [addedPermissions, setAddedPermissions] = useState<string[]>([]);
  // const [allPermissions, setAllPermissions] = useState<string[]>([]);
  const [roleName, setRoleName] = useState('');

  // ✅ NEW: Track pending changes
  const [pendingAdditions, setPendingAdditions] = useState<string[]>([]);
  const [pendingRemovals, setPendingRemovals] = useState<string[]>([]);

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

      console.log('Available permissions:', availableRes.data);
      console.log('User permissions:', userPermsRes.data);

      setAvailablePermissions(availableRes.data.byModule);
      setDefaultPermissions(userPermsRes.data.defaultPermissions || []);
      setAddedPermissions(userPermsRes.data.addedPermissions || []);
      // setAllPermissions(userPermsRes.data.allPermissions || []);
      setRoleName(userPermsRes.data.roleName || '');

      // ✅ Reset pending changes when fetching fresh data
      setPendingAdditions([]);
      setPendingRemovals([]);
    } catch (err: any) {
      console.error('Failed to fetch permissions:', err);
      setError(
        err.response?.data?.message ||
          err.message ||
          'Failed to load permissions'
      );
    } finally {
      setLoading(false);
    }
  };

  const getPermissionStatus = (
    permKey: string
  ): 'default' | 'added' | 'pending_removal' | 'pending_addition' | 'none' => {
    // Check pending removals first
    if (pendingRemovals.includes(permKey)) return 'pending_removal';
    
    // Check pending additions
    if (pendingAdditions.includes(permKey)) return 'pending_addition';
    
    // Then check actual state
    if (defaultPermissions.includes(permKey)) return 'default';
    if (addedPermissions.includes(permKey)) return 'added';
    return 'none';
  };

  const handlePermissionToggle = (permKey: string) => {
    if (readOnly) return;

    const status = getPermissionStatus(permKey);
    console.log('Toggling permission:', permKey, 'Current status:', status);

    // ✅ Cannot remove default permissions
    if (status === 'default') {
      console.warn('Cannot remove default permission:', permKey);
      return;
    }

    let newPendingAdditions = [...pendingAdditions];
    let newPendingRemovals = [...pendingRemovals];

    if (status === 'pending_addition') {
      // If it's pending addition, cancel it
      newPendingAdditions = newPendingAdditions.filter((p) => p !== permKey);
    } else if (status === 'added') {
      // If it's already added, mark for removal
      newPendingRemovals.push(permKey);
    } else if (status === 'pending_removal') {
      // If pending removal, cancel it
      newPendingRemovals = newPendingRemovals.filter((p) => p !== permKey);
    } else {
      // If not assigned, mark for addition
      newPendingAdditions.push(permKey);
    }

    setPendingAdditions(newPendingAdditions);
    setPendingRemovals(newPendingRemovals);

    console.log('Pending additions:', newPendingAdditions);
    console.log('Pending removals:', newPendingRemovals);

    // ✅ Notify parent with the pending changes
    if (onChange) {
      onChange({
        add: newPendingAdditions,
        remove: newPendingRemovals,
      });
    }
  };

  const getPermissionLabel = (permKey: string): string => {
    for (const perms of Object.values(availablePermissions)) {
      const found = perms.find((p) => p.key === permKey);
      if (found) return found.label;
    }
    return permKey;
  };

  // ✅ NEW: Refresh permissions after save
  // const handleRefreshPermissions = () => {
  //   fetchPermissions();
  // };

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

  // ✅ Calculate effective permissions including pending changes
  const effectivePermissions = [
    ...defaultPermissions,
    ...addedPermissions.filter((p) => !pendingRemovals.includes(p)),
    ...pendingAdditions,
  ];

  return (
    <Box>
      {/* Summary Card */}
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
            Current Permissions ({effectivePermissions.length})
          </Typography>

          {roleName && (
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Role: <strong>{roleName}</strong>
            </Typography>
          )}

          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2 }}>
            {effectivePermissions.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                No permissions assigned
              </Typography>
            ) : (
              effectivePermissions.map((permKey) => {
                const status = getPermissionStatus(permKey);
                const isPendingRemoval = pendingRemovals.includes(permKey);
                
                return (
                  <Chip
                    key={permKey}
                    label={getPermissionLabel(permKey)}
                    size="small"
                    sx={{
                      fontWeight: 500,
                      bgcolor:
                        status === 'default'
                          ? 'primary.50'
                          : status === 'pending_removal'
                          ? 'error.50'
                          : status === 'added' || status === 'pending_addition'
                          ? 'success.50'
                          : 'grey.100',
                      color:
                        status === 'default'
                          ? 'primary.700'
                          : status === 'pending_removal'
                          ? 'error.700'
                          : status === 'added' || status === 'pending_addition'
                          ? 'success.700'
                          : 'text.primary',
                      border: '1px solid',
                      borderColor:
                        status === 'default'
                          ? 'primary.300'
                          : status === 'pending_removal'
                          ? 'error.300'
                          : status === 'added' || status === 'pending_addition'
                          ? 'success.300'
                          : 'grey.300',
                      opacity: isPendingRemoval ? 0.6 : 1,
                      textDecoration: isPendingRemoval ? 'line-through' : 'none',
                      '& .MuiChip-icon': {
                        color:
                          status === 'default'
                            ? 'primary.600'
                            : 'success.600',
                      },
                    }}
                    icon={status === 'default' ? <LockIcon /> : <AddIcon />}
                  />
                );
              })
            )}
          </Box>

          {/* Statistics */}
          <Box
            sx={{
              display: 'flex',
              gap: 2,
              mt: 2,
              pt: 2,
              borderTop: '1px solid',
              borderColor: 'divider',
            }}
          >
            <Chip
              label={`Default (Locked): ${defaultPermissions.length}`}
              icon={<LockIcon />}
              size="small"
              sx={{
                bgcolor: 'primary.50',
                color: 'primary.700',
                border: '1px solid',
                borderColor: 'primary.300',
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
            {/* ✅ Show pending changes */}
            {(pendingAdditions.length > 0 || pendingRemovals.length > 0) && (
              <Alert severity="warning" sx={{ py: 0.5, px: 1 }}>
                <Typography variant="caption">
                  {pendingAdditions.length > 0 && `+${pendingAdditions.length} to add `}
                  {pendingRemovals.length > 0 && `-${pendingRemovals.length} to remove`}
                </Typography>
              </Alert>
            )}
          </Box>
        </CardContent>
      </Card>

      <Divider sx={{ my: 3 }} />

      {/* Info Alert */}
      <Alert severity="info" icon={<InfoOutlinedIcon />} sx={{ mb: 3 }}>
        <Typography variant="body2">
          <strong>Default permissions</strong> (marked with{' '}
          <LockIcon sx={{ fontSize: 14, verticalAlign: 'middle' }} />) are
          required for the <strong>{roleName}</strong> role and cannot be
          removed. You can only add additional permissions beyond the defaults.
        </Typography>
      </Alert>

      {/* Permission Accordions */}
      {Object.entries(availablePermissions).map(([module, permissions]) => {
        const modulePermCount = permissions.filter((p) =>
          effectivePermissions.includes(p.key)
        ).length;

        return (
          <Accordion key={module}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  width: '100%',
                  pr: 2,
                }}
              >
                <Typography variant="h6" sx={{ textTransform: 'capitalize' }}>
                  {module}
                </Typography>
                {modulePermCount > 0 && (
                  <Chip
                    label={`${modulePermCount}/${permissions.length}`}
                    size="small"
                    color="primary"
                    sx={{ mr: 1 }}
                  />
                )}
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <Box>
                {permissions.map((perm) => {
                  const status = getPermissionStatus(perm.key);
                  const isChecked = status !== 'none' && status !== 'pending_removal';
                  const isDefault = status === 'default';
                  const isAdded = status === 'added';
                  const isPendingAddition = status === 'pending_addition';
                  const isPendingRemoval = status === 'pending_removal';

                  return (
                    <Box
                      key={perm.key}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        py: 1.5,
                        px: 1,
                        borderRadius: 1,
                        '&:hover': {
                          bgcolor: isDefault ? 'primary.50' : 'action.hover',
                        },
                        bgcolor:
                          isDefault
                            ? 'grey.50'
                            : isPendingRemoval
                            ? 'error.50'
                            : 'transparent',
                        opacity: isPendingRemoval ? 0.6 : 1,
                      }}
                    >
                      <Tooltip
                        title={
                          isDefault
                            ? 'This is a default permission for your role and cannot be removed'
                            : isPendingRemoval
                            ? 'This permission will be removed when you save'
                            : isPendingAddition
                            ? 'This permission will be added when you save'
                            : ''
                        }
                        arrow
                      >
                        <FormControlLabel
                          sx={{ flex: 1 }}
                          control={
                            <Checkbox
                              checked={isChecked}
                              onChange={() => handlePermissionToggle(perm.key)}
                              disabled={readOnly || isDefault}
                              sx={{
                                '&.Mui-disabled': {
                                  color: isDefault
                                    ? 'primary.main'
                                    : 'action.disabled',
                                },
                              }}
                            />
                          }
                          label={
                            <Box>
                              <Box
                                sx={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  textDecoration:
                                    isPendingRemoval ? 'line-through' : 'none',
                                }}
                              >
                                <Typography
                                  variant="body1"
                                  sx={{
                                    fontWeight: isDefault ? 600 : 400,
                                    color: isDefault
                                      ? 'primary.main'
                                      : 'text.primary',
                                  }}
                                >
                                  {perm.label}
                                </Typography>
                                {isDefault && (
                                  <LockIcon
                                    fontSize="small"
                                    sx={{
                                      ml: 1,
                                      fontSize: 16,
                                      color: 'primary.main',
                                    }}
                                  />
                                )}
                              </Box>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                {perm.description}
                              </Typography>
                            </Box>
                          }
                        />
                      </Tooltip>
                      <Box>
                        {isDefault && (
                          <Chip
                            icon={<LockIcon />}
                            label="Default"
                            size="small"
                            sx={{
                              bgcolor: 'primary.50',
                              color: 'primary.700',
                              border: '1px solid',
                              borderColor: 'primary.300',
                              fontWeight: 600,
                            }}
                          />
                        )}
                        {isAdded && (
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
                        {isPendingAddition && (
                          <Chip
                            icon={<AddIcon />}
                            label="Will Add"
                            size="small"
                            sx={{
                              bgcolor: 'success.100',
                              color: 'success.800',
                              border: '2px solid',
                              borderColor: 'success.500',
                              fontWeight: 600,
                            }}
                          />
                        )}
                        {isPendingRemoval && (
                          <Chip
                            label="Will Remove"
                            size="small"
                            sx={{
                              bgcolor: 'error.100',
                              color: 'error.800',
                              border: '2px solid',
                              borderColor: 'error.500',
                              fontWeight: 600,
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
        );
      })}
    </Box>
  );
};

export default PermissionSelector;
