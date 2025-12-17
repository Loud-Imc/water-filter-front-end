import React, { useEffect, useState } from "react";
import {
  Box,
  Card,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  Typography,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  TextField,
  InputAdornment,
  Grid,
  Collapse,
  Paper,
  TablePagination,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import UpdateIcon from "@mui/icons-material/Update";
import GroupWorkIcon from "@mui/icons-material/GroupWork";
import PeopleIcon from "@mui/icons-material/People";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import ClearIcon from "@mui/icons-material/Clear";
import { PERMISSIONS } from "../../../constants/permissions";
import { sparePartsService } from "../../../api/services/sparePartsService";
import { sparePartGroupsService } from "../../../api/services/sparePartGroupsService";
import type { SparePart, SparePartGroup } from "../../../types";
import LoadingSpinner from "../../../components/common/LoadingSpinner";
import EmptyState from "../../../components/common/EmptyState";
import ConfirmDialog from "../../../components/common/ConfirmDialog";
import SnackbarNotification from "../../../components/common/SnackbarNotification";
import { PermissionGate } from "../../../components/PermissionGate";
import GroupManagement from "../components/GroupManagement";
import SparePartDialog from "../components/SparePartDialog";
import StockUpdateDialog from "../components/StockUpdateDialog";
import TechnicianStockDialog from "../components/TechnicianStockDialog";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import { fetchTechnicians } from "../../../app/slices/userSlice";
import { useLocation } from "react-router-dom";

const SparePartsTab: React.FC = () => {
  const dispatch = useAppDispatch();
  const { technicians } = useAppSelector((state) => state.users);
  const [spareParts, setSpareParts] = useState<SparePart[]>([]);
  const [groups, setGroups] = useState<SparePartGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [sparePartDialog, setSparePartDialog] = useState(false);
  const [groupDialog, setGroupDialog] = useState(false);
  const [stockDialog, setStockDialog] = useState(false);
  const [technicianStockDialog, setTechnicianStockDialog] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [selectedSparePart, setSelectedSparePart] = useState<SparePart | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGroup, setSelectedGroup] = useState<string>("");
  const [selectedCompany, setSelectedCompany] = useState<string>("");
  const [minPrice, setMinPrice] = useState<string>("");
  const [maxPrice, setMaxPrice] = useState<string>("");
  const [minStock, setMinStock] = useState<string>("");
  const [maxStock, setMaxStock] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  // Pagination state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as any,
  });

  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const filterParam = searchParams.get("filter");

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (filterParam === "lowStock") {
      setMaxStock("5");
      setShowFilters(true);
    }
  }, [filterParam]);

  const fetchData = async () => {
    if (spareParts.length === 0) {
      setLoading(true);
    }
    try {
      const [sparePartsData, groupsData] = await Promise.all([
        sparePartsService.getAll(),
        sparePartGroupsService.getAll(),
      ]);
      setSpareParts(sparePartsData);
      setGroups(groupsData);
      dispatch(fetchTechnicians({ query: "", limit: 100 }));
    } catch (error) {
      console.error("Failed to fetch data:", error);
      setSnackbar({
        open: true,
        message: "Failed to fetch spare parts",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSparePart = async (data: any) => {
    try {
      if (selectedSparePart) {
        await sparePartsService.update(selectedSparePart.id, data);
        setSnackbar({
          open: true,
          message: "Spare part updated successfully!",
          severity: "success",
        });
      } else {
        await sparePartsService.create(data);
        setSnackbar({
          open: true,
          message: "Spare part created successfully!",
          severity: "success",
        });
      }
      fetchData();
      setSparePartDialog(false);
      setSelectedSparePart(null);
    } catch (error: any) {
      throw error;
    }
  };

  const handleUpdateStock = async (quantityChange: number, reason: string) => {
    if (!selectedSparePart) return;
    try {
      await sparePartsService.updateStock(selectedSparePart.id, {
        quantityChange,
        reason,
      });
      setSnackbar({
        open: true,
        message: "Stock updated successfully!",
        severity: "success",
      });
      fetchData();
    } catch (error: any) {
      throw error;
    }
  };

  const handleDelete = async () => {
    if (!selectedSparePart) return;
    try {
      await sparePartsService.delete(selectedSparePart.id);
      setSnackbar({
        open: true,
        message: "Spare part deleted successfully!",
        severity: "success",
      });
      setDeleteDialog(false);
      setSelectedSparePart(null);
      fetchData();
    } catch (error: any) {
      setSnackbar({
        open: true,
        message: error.response?.data?.message || "Failed to delete spare part",
        severity: "error",
      });
    }
  };

  const handleClearFilters = () => {
    setSearchTerm("");
    setSelectedGroup("");
    setSelectedCompany("");
    setMinPrice("");
    setMaxPrice("");
    setMinStock("");
    setMaxStock("");
    setSortBy("name");
    setSortOrder("asc");
    setPage(0);
  };

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const formatWarranty = (sparePart: SparePart): string => {
    if (!sparePart.hasWarranty) return "No Warranty";
    if (sparePart.warrantyYears) return `${sparePart.warrantyYears} Year(s)`;
    if (sparePart.warrantyMonths) return `${sparePart.warrantyMonths} Month(s)`;
    return "No Warranty";
  };

  const getStockColor = (stock: number): "success" | "warning" | "error" => {
    if (stock === 0) return "error";
    if (stock <= 5) return "warning";
    return "success";
  };

  const companies = Array.from(
    new Set(spareParts.map((sp) => sp.company).filter(Boolean))
  );

  const filteredSpareParts = spareParts
    .filter((sparePart) => {
      if (searchTerm) {
        const search = searchTerm.toLowerCase();
        const matchesName = sparePart.name.toLowerCase().includes(search);
        const matchesSku = sparePart.sku?.toLowerCase().includes(search);
        if (!matchesName && !matchesSku) return false;
      }
      if (selectedGroup && sparePart.groupId !== selectedGroup) return false;
      if (selectedCompany && sparePart.company !== selectedCompany) return false;
      if (minPrice && Number(sparePart.price) < Number(minPrice)) return false;
      if (maxPrice && Number(sparePart.price) > Number(maxPrice)) return false;
      if (minStock && sparePart.stock < Number(minStock)) return false;
      if (maxStock && sparePart.stock > Number(maxStock)) return false;
      return true;
    })
    .sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case "name":
          comparison = a.name.localeCompare(b.name);
          break;
        case "price":
          comparison = Number(a.price) - Number(b.price);
          break;
        case "stock":
          comparison = a.stock - b.stock;
          break;
        case "company":
          comparison = (a.company || "").localeCompare(b.company || "");
          break;
        default:
          comparison = 0;
      }
      return sortOrder === "asc" ? comparison : -comparison;
    });

  // Paginate filtered spare parts
  const paginatedSpareParts = filteredSpareParts.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography variant="h5" fontWeight={600}>
          Spare Parts ({filteredSpareParts.length})
        </Typography>
        <Box sx={{ display: "flex", gap: 2 }}>
          <PermissionGate permission={PERMISSIONS.GROUPS_MANAGE}>
            <Button
              variant="outlined"
              startIcon={<GroupWorkIcon />}
              onClick={() => setGroupDialog(true)}
            >
              Manage Groups
            </Button>
          </PermissionGate>
          <PermissionGate permission={PERMISSIONS.SPARE_PARTS_CREATE}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => {
                setSelectedSparePart(null);
                setSparePartDialog(true);
              }}
            >
              Add Spare Part
            </Button>
          </PermissionGate>
        </Box>
      </Box>

      <Card sx={{ mb: 3, p: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              placeholder="Search by spare part name or SKU..."
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
                    <IconButton size="small" onClick={() => setSearchTerm("")}>
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
                <MenuItem value="price">Price</MenuItem>
                <MenuItem value="stock">Stock</MenuItem>
                <MenuItem value="company">Company</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid size={{ xs: 6, md: 2 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Order</InputLabel>
              <Select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as "asc" | "desc")}
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
              variant={showFilters ? "contained" : "outlined"}
              startIcon={<FilterListIcon />}
              onClick={() => setShowFilters(!showFilters)}
            >
              Filters
            </Button>
          </Grid>
        </Grid>

        <Collapse in={showFilters}>
          <Paper sx={{ mt: 2, p: 2, bgcolor: "grey.50" }}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Group</InputLabel>
                  <Select
                    value={selectedGroup}
                    onChange={(e) => {
                      setSelectedGroup(e.target.value);
                      setPage(0);
                    }}
                    label="Group"
                  >
                    <MenuItem value="">All Groups</MenuItem>
                    {groups
                      .filter((g) => g.isActive)
                      .map((group) => (
                        <MenuItem key={group.id} value={group.id}>
                          {group.name}
                        </MenuItem>
                      ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Company</InputLabel>
                  <Select
                    value={selectedCompany}
                    onChange={(e) => {
                      setSelectedCompany(e.target.value);
                      setPage(0);
                    }}
                    label="Company"
                  >
                    <MenuItem value="">All Companies</MenuItem>
                    {companies.map((company) => (
                      <MenuItem key={company} value={company}>
                        {company}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid size={{ xs: 6, sm: 3, md: 1.5 }}>
                <TextField
                  fullWidth
                  size="small"
                  type="number"
                  label="Min Price"
                  value={minPrice}
                  onChange={(e) => {
                    setMinPrice(e.target.value);
                    setPage(0);
                  }}
                  inputProps={{ min: 0 }}
                />
              </Grid>

              <Grid size={{ xs: 6, sm: 3, md: 1.5 }}>
                <TextField
                  fullWidth
                  size="small"
                  type="number"
                  label="Max Price"
                  value={maxPrice}
                  onChange={(e) => {
                    setMaxPrice(e.target.value);
                    setPage(0);
                  }}
                  inputProps={{ min: 0 }}
                />
              </Grid>

              <Grid size={{ xs: 6, sm: 3, md: 1.5 }}>
                <TextField
                  fullWidth
                  size="small"
                  type="number"
                  label="Min Stock"
                  value={minStock}
                  onChange={(e) => {
                    setMinStock(e.target.value);
                    setPage(0);
                  }}
                  inputProps={{ min: 0 }}
                />
              </Grid>

              <Grid size={{ xs: 6, sm: 3, md: 1.5 }}>
                <TextField
                  fullWidth
                  size="small"
                  type="number"
                  label="Max Stock"
                  value={maxStock}
                  onChange={(e) => {
                    setMaxStock(e.target.value);
                    setPage(0);
                  }}
                  inputProps={{ min: 0 }}
                />
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

      {filteredSpareParts.length === 0 ? (
        <EmptyState
          title="No spare parts found"
          description={
            searchTerm || selectedGroup || selectedCompany
              ? "Try adjusting your filters"
              : "Add your first spare part to get started"
          }
          actionLabel="Add Spare Part"
          onAction={() => setSparePartDialog(true)}
        />
      ) : (
        <Card>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Spare Part Name</TableCell>
                  <TableCell>SKU</TableCell>
                  <TableCell>Group</TableCell>
                  <TableCell>Company</TableCell>
                  <TableCell align="right">Price</TableCell>
                  <TableCell align="center">Stock</TableCell>
                  <TableCell>Warranty</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedSpareParts.map((sparePart) => (
                  <TableRow key={sparePart.id}>
                    <TableCell>
                      <Typography variant="body1" fontWeight={500}>
                        {sparePart.name}
                      </Typography>
                      {sparePart.description && (
                        <Typography variant="caption" color="text.secondary">
                          {sparePart.description}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>{sparePart.sku || "-"}</TableCell>
                    <TableCell>
                      {sparePart.group ? (
                        <Chip label={sparePart.group.name} size="small" />
                      ) : (
                        "-"
                      )}
                    </TableCell>
                    <TableCell>{sparePart.company || "-"}</TableCell>
                    <TableCell align="right">
                      ₹{Number(sparePart.price).toFixed(2)}
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        label={sparePart.stock}
                        color={getStockColor(sparePart.stock)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{formatWarranty(sparePart)}</TableCell>
                    <TableCell align="right">
                      <PermissionGate permission={PERMISSIONS.STOCK_VIEW}>
                        <IconButton
                          size="small"
                          onClick={() => {
                            setSelectedSparePart(sparePart);
                            setTechnicianStockDialog(true);
                          }}
                          title="View Technician Stock"
                        >
                          <PeopleIcon />
                        </IconButton>
                      </PermissionGate>
                      <PermissionGate permission={PERMISSIONS.STOCK_UPDATE}>
                        <IconButton
                          size="small"
                          onClick={() => {
                            setSelectedSparePart(sparePart);
                            setStockDialog(true);
                          }}
                          title="Update Stock"
                          sx={{ ml: 1 }}
                        >
                          <UpdateIcon />
                        </IconButton>
                      </PermissionGate>
                      <PermissionGate permission={PERMISSIONS.SPARE_PARTS_UPDATE}>
                        <IconButton
                          size="small"
                          onClick={() => {
                            setSelectedSparePart(sparePart);
                            setSparePartDialog(true);
                          }}
                          sx={{ ml: 1 }}
                        >
                          <EditIcon />
                        </IconButton>
                      </PermissionGate>
                      <PermissionGate permission={PERMISSIONS.SPARE_PARTS_DELETE}>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => {
                            setSelectedSparePart(sparePart);
                            setDeleteDialog(true);
                          }}
                          sx={{ ml: 1 }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </PermissionGate>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Pagination */}
          <TablePagination
            rowsPerPageOptions={[5, 10, 25, 50]}
            component="div"
            count={filteredSpareParts.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Card>
      )}

      <GroupManagement
        open={groupDialog}
        onClose={() => setGroupDialog(false)}
        onGroupChange={fetchData}
      />

      <SparePartDialog
        open={sparePartDialog}
        onClose={() => {
          setSparePartDialog(false);
          setSelectedSparePart(null);
        }}
        onSave={handleSaveSparePart}
        sparePart={selectedSparePart}
        groups={groups}
      />

      {selectedSparePart && (
        <>
          <StockUpdateDialog
            open={stockDialog}
            onClose={() => {
              setStockDialog(false);
              setSelectedSparePart(null);
            }}
            onUpdate={handleUpdateStock}
            itemName={selectedSparePart.name}
            currentStock={selectedSparePart.stock}
            itemType="spare part"
          />

          <TechnicianStockDialog
            open={technicianStockDialog}
            onClose={() => {
              setTechnicianStockDialog(false);
              setSelectedSparePart(null);
            }}
            itemType="sparePart"
            itemId={selectedSparePart.id}
            itemName={selectedSparePart.name}
            warehouseStock={selectedSparePart.stock}
            technicians={technicians}
            onTransferComplete={fetchData}
          />
        </>
      )}

      <ConfirmDialog
        open={deleteDialog}
        title="Delete Spare Part"
        message={`Are you sure you want to delete "${selectedSparePart?.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        severity="error"
        onConfirm={handleDelete}
        onCancel={() => {
          setDeleteDialog(false);
          setSelectedSparePart(null);
        }}
      />

      <SnackbarNotification
        open={snackbar.open}
        message={snackbar.message}
        severity={snackbar.severity}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      />
    </Box>
  );
};

export default SparePartsTab;
