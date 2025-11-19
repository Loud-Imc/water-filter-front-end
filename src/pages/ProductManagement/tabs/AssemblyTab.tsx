import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
  Typography,
  IconButton,
  Chip,
  Tooltip,
  Dialog,
  TextField,
  InputAdornment,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Collapse,
  Paper,
  TablePagination,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import LaunchIcon from '@mui/icons-material/Launch';
import HistoryIcon from '@mui/icons-material/History';
import EditIcon from '@mui/icons-material/Edit';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import ClearIcon from '@mui/icons-material/Clear';
import { bomTemplatesService } from '../../../api/services/bomTemplatesService';
import { productService } from '../../../api/services/productService';
import type { BOMTemplate, AssemblyHistory, Product } from '../../../types';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import SnackbarNotification from '../../../components/common/SnackbarNotification';
import BOMTemplateDialog from '../components/BOMTemplateDialog';
import AssemblyExecutionDialog from '../components/AssemblyExecutionDialog';
import { PermissionGate } from '../../../components/PermissionGate';

const AssemblyTab: React.FC = () => {
  const [templates, setTemplates] = useState<BOMTemplate[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [assemblyHistory, setAssemblyHistory] = useState<AssemblyHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [templateDialog, setTemplateDialog] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<BOMTemplate | null>(null);
  const [executionDialog, setExecutionDialog] = useState(false);
  const [historyDialog, setHistoryDialog] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Pagination state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as any,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [templatesData, productsData] = await Promise.all([
        bomTemplatesService.getAll(),
        productService.getAllProducts(),
      ]);
      setTemplates(templatesData);
      setProducts(productsData);
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Failed to fetch BOM templates',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchAssemblyHistory = async (templateId: string) => {
    setLoading(true);
    try {
      const history = await bomTemplatesService.getAssemblyHistory(templateId);
      setAssemblyHistory(history);
      setHistoryDialog(true);
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Failed to fetch assembly history',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveTemplate = () => {
    fetchData();
    setTemplateDialog(false);
    setSelectedTemplate(null);
  };

  const handleExecuteAssembly = () => {
    fetchData();
    setExecutionDialog(false);
    setSelectedTemplate(null);
    setSnackbar({
      open: true,
      message: 'Assembly executed successfully!',
      severity: 'success',
    });
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedProduct('');
    setSelectedStatus('');
    setSortBy('name');
    setSortOrder('asc');
    setPage(0);
  };

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const filteredTemplates = templates
    .filter((template) => {
      if (searchTerm) {
        const search = searchTerm.toLowerCase();
        const matchesName = template.name.toLowerCase().includes(search);
        const matchesDescription = template.description?.toLowerCase().includes(search);
        const matchesProduct = template.product?.name.toLowerCase().includes(search);
        if (!matchesName && !matchesDescription && !matchesProduct) return false;
      }
      if (selectedProduct && template.productId !== selectedProduct) return false;
      if (selectedStatus === 'active' && !template.isActive) return false;
      if (selectedStatus === 'inactive' && template.isActive) return false;
      return true;
    })
    .sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'product':
          comparison = (a.product?.name || '').localeCompare(b.product?.name || '');
          break;
        case 'parts':
          comparison = (a._count?.items || 0) - (b._count?.items || 0);
          break;
        case 'assemblies':
          comparison = (a._count?.assemblies || 0) - (b._count?.assemblies || 0);
          break;
        default:
          comparison = 0;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

  // Paginate filtered templates
  const paginatedTemplates = filteredTemplates.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" fontWeight={600}>
          Assembly (Bill of Materials) ({filteredTemplates.length})
        </Typography>
        <PermissionGate permission="assembly.create">
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => {
              setSelectedTemplate(null);
              setTemplateDialog(true);
            }}
          >
            New BOM Template
          </Button>
        </PermissionGate>
      </Box>

      <Card sx={{ mb: 3, p: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              placeholder="Search by template name, product, or description..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(0);
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
                endAdornment: searchTerm && (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => setSearchTerm('')}>
                      <ClearIcon />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Grid>

          <Grid size={{ xs: 6, md: 2 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Sort By</InputLabel>
              <Select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                label="Sort By"
              >
                <MenuItem value="name">Name</MenuItem>
                <MenuItem value="product">Product</MenuItem>
                <MenuItem value="parts">Parts Count</MenuItem>
                <MenuItem value="assemblies">Assemblies Count</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid size={{ xs: 6, md: 2 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Order</InputLabel>
              <Select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
                label="Order"
              >
                <MenuItem value="asc">Ascending</MenuItem>
                <MenuItem value="desc">Descending</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid size={{ xs: 12, md: 2 }}>
            <Button
              fullWidth
              variant={showFilters ? 'contained' : 'outlined'}
              startIcon={<FilterListIcon />}
              onClick={() => setShowFilters(!showFilters)}
            >
              Filters
            </Button>
          </Grid>
        </Grid>

        <Collapse in={showFilters}>
          <Paper sx={{ mt: 2, p: 2, bgcolor: 'grey.50' }}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Product</InputLabel>
                  <Select
                    value={selectedProduct}
                    onChange={(e) => {
                      setSelectedProduct(e.target.value);
                      setPage(0);
                    }}
                    label="Product"
                  >
                    <MenuItem value="">All Products</MenuItem>
                    {products.map((product) => (
                      <MenuItem key={product.id} value={product.id}>
                        {product.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={selectedStatus}
                    onChange={(e) => {
                      setSelectedStatus(e.target.value);
                      setPage(0);
                    }}
                    label="Status"
                  >
                    <MenuItem value="">All Status</MenuItem>
                    <MenuItem value="active">Active</MenuItem>
                    <MenuItem value="inactive">Inactive</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid size={{ xs: 12 }}>
                <Box display="flex" justifyContent="flex-end">
                  <Button
                    startIcon={<ClearIcon />}
                    onClick={handleClearFilters}
                    size="small"
                  >
                    Clear All Filters
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Collapse>
      </Card>

      <Card>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Template Name</TableCell>
                <TableCell>Product</TableCell>
                <TableCell>Active</TableCell>
                <TableCell>Parts</TableCell>
                <TableCell>Assemblies</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredTemplates.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <Typography variant="body2" color="text.secondary" py={3}>
                      {searchTerm || selectedProduct || selectedStatus
                        ? 'No templates match your filters'
                        : 'No BOM templates found. Create one to get started.'}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedTemplates.map((template) => (
                  <TableRow key={template.id}>
                    <TableCell>
                      <Typography fontWeight={500}>{template.name}</Typography>
                      {template.description && (
                        <Typography variant="caption" color="text.secondary">
                          {template.description}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={template.product.name}
                        color="primary"
                        size="small"
                        sx={{ fontWeight: 500 }}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={template.isActive ? 'Active' : 'Inactive'}
                        color={template.isActive ? 'success' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={`${template._count?.items || 0} parts`}
                        size="small"
                        color="info"
                        sx={{ mr: 1 }}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={`${template._count?.assemblies || 0} assemblies`}
                        size="small"
                        color="secondary"
                      />
                    </TableCell>
                    <TableCell align="right">
                      <PermissionGate permission="assembly.execute">
                        <Tooltip title="Execute Assembly">
                          <IconButton
                            color="primary"
                            onClick={() => {
                              setSelectedTemplate(template);
                              setExecutionDialog(true);
                            }}
                            disabled={!template.isActive || (template.items?.length || 0) === 0}
                          >
                            <LaunchIcon />
                          </IconButton>
                        </Tooltip>
                      </PermissionGate>
                      <PermissionGate permission="assembly.create">
                        <Tooltip title="Edit Template">
                          <IconButton
                            onClick={() => {
                              setSelectedTemplate(template);
                              setTemplateDialog(true);
                            }}
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                      </PermissionGate>
                      <Tooltip title="Assembly History">
                        <IconButton
                          color="secondary"
                          onClick={() => fetchAssemblyHistory(template.id)}
                        >
                          <HistoryIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Pagination */}
        {filteredTemplates.length > 0 && (
          <TablePagination
            rowsPerPageOptions={[5, 10, 25, 50]}
            component="div"
            count={filteredTemplates.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        )}
      </Card>

      <BOMTemplateDialog
        open={templateDialog}
        onClose={() => {
          setTemplateDialog(false);
          setSelectedTemplate(null);
        }}
        onSave={handleSaveTemplate}
        template={selectedTemplate}
        products={products}
      />

      {selectedTemplate && (
        <AssemblyExecutionDialog
          open={executionDialog}
          onClose={() => {
            setExecutionDialog(false);
            setSelectedTemplate(null);
          }}
          template={selectedTemplate}
          onAssemblyComplete={handleExecuteAssembly}
        />
      )}

      <Dialog
        open={historyDialog}
        onClose={() => setHistoryDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <Box sx={{ p: 2 }}>
          <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
            Assembly History: {selectedTemplate?.name}
          </Typography>
          {assemblyHistory.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              No assemblies yet.
            </Typography>
          ) : (
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell>Product</TableCell>
                    <TableCell>Assembler</TableCell>
                    <TableCell>Total Cost</TableCell>
                    <TableCell>Parts Used</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {assemblyHistory.map((assembly) => (
                    <TableRow key={assembly.id}>
                      <TableCell>
                        {new Date(assembly.assembledAt).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Chip label={assembly.product.name} size="small" />
                      </TableCell>
                      <TableCell>
                        <Chip label={assembly.assembler?.name || '-'} size="small" />
                      </TableCell>
                      <TableCell>
                        ₹{Number(assembly.totalCost).toFixed(2)}
                      </TableCell>
                      <TableCell>
                        {assembly.usedParts
                          .map(
                            (part) =>
                              `${part.sparePart.name} (x${part.quantityUsed})`
                          )
                          .join(', ')}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Box>
      </Dialog>

      <SnackbarNotification
        open={snackbar.open}
        message={snackbar.message}
        severity={snackbar.severity}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      />
    </Box>
  );
};

export default AssemblyTab;
