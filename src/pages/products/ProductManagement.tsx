import React, { useEffect, useState } from "react";
import {
  Box,
  Card,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
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
  InputAdornment,
  FormControlLabel,
  Switch,
  RadioGroup,
  Radio,
  FormControl,
  FormLabel,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import UpdateIcon from "@mui/icons-material/Update";
import SettingsIcon from "@mui/icons-material/Settings";
// import PageHeader from "../../components/common/PageHeader";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import SnackbarNotification from "../../components/common/SnackbarNotification";
import EmptyState from "../../components/common/EmptyState";
import { productService } from "../../api/services/productService";
import { settingsService } from "../../api/services/settingsService";
import type { Product, CreateProductDto } from "../../types";
import ProductFilters from "../../components/products/ProductFilters";

const ProductManagement: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialog, setDialog] = useState(false);
  const [stockDialog, setStockDialog] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [settingsDialog, setSettingsDialog] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [companies, setCompanies] = useState<string[]>([]);
  const [threshold, setThreshold] = useState(5);
  const [newThreshold, setNewThreshold] = useState(5);

  // Form states
  const [formData, setFormData] = useState<CreateProductDto>({
    name: "",
    description: "",
    sku: "",
    price: 0,
    stock: 0,
    hasWarranty: false,
    warrantyMonths: undefined,
    warrantyYears: undefined,
  });

  // Stock update form
  const [stockUpdateData, setStockUpdateData] = useState({
    quantityChange: 0,
    reason: "",
  });

  // Warranty form state
  const [warrantyType, setWarrantyType] = useState<"months" | "years">(
    "months"
  );

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as any,
  });

  // ✅ Initial load
  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true);
        await fetchProducts();
        const savedThreshold = await settingsService.getLowStockThreshold();
        setThreshold(savedThreshold);
        setNewThreshold(savedThreshold);
      } catch (error) {
        console.error("Error initializing:", error);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  // ✅ Update companies when products change
  useEffect(() => {
    const uniqueCompanies = [
      ...new Set(products.map((p) => p.company).filter(Boolean)),
    ];
    setCompanies(uniqueCompanies as string[]);
  }, [products]);

  // ✅ Fetch all products (default)
  const fetchProducts = async () => {
    try {
      const data = await productService.getAllProducts();
      setProducts(data);
    } catch (error) {
      console.error("Failed to fetch products:", error);
      setSnackbar({
        open: true,
        message: "Failed to fetch products",
        severity: "error",
      });
    }
  };

  // ✅ Handle filter apply - SINGLE SOURCE OF TRUTH
  const handleApplyFilters = async (appliedFilters: any) => {
    try {
      setLoading(true);

      // Check if any filters are applied
      const hasFilters =
        appliedFilters.company ||
        appliedFilters.minPrice ||
        appliedFilters.maxPrice ||
        appliedFilters.minStock ||
        appliedFilters.maxStock ||
        appliedFilters.searchTerm ||
        appliedFilters.sortBy ||
        appliedFilters.sortOrder;

      let data;
      if (hasFilters) {
        // Use backend filtering
        data = await productService.getFilteredProducts({
          company: appliedFilters.company,
          minPrice: appliedFilters.minPrice
            ? Number(appliedFilters.minPrice)
            : undefined,
          maxPrice: appliedFilters.maxPrice
            ? Number(appliedFilters.maxPrice)
            : undefined,
          minStock: appliedFilters.minStock
            ? Number(appliedFilters.minStock)
            : undefined,
          maxStock: appliedFilters.maxStock
            ? Number(appliedFilters.maxStock)
            : undefined,
          searchTerm: appliedFilters.searchTerm,
          sortBy: appliedFilters.sortBy || "name",
          sortOrder: appliedFilters.sortOrder || "asc",
        });
      } else {
        // Get all products if no filters
        data = await productService.getAllProducts();
      }

      setProducts(data);
    } catch (error) {
      console.error("Filter error:", error);
      setSnackbar({
        open: true,
        message: "Failed to apply filters",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  // ✅ Format warranty display
  const formatWarranty = (product: Product): string => {
    if (!product.hasWarranty) return "No Warranty";

    if (product.warrantyMonths && !product.warrantyYears) {
      return `${product.warrantyMonths} Month${
        product.warrantyMonths > 1 ? "s" : ""
      }`;
    }

    if (product.warrantyYears && !product.warrantyMonths) {
      return `${product.warrantyYears} Year${
        product.warrantyYears > 1 ? "s" : ""
      }`;
    }

    if (product.warrantyYears && product.warrantyMonths) {
      return `${product.warrantyYears} Year${
        product.warrantyYears > 1 ? "s" : ""
      } ${product.warrantyMonths} Month${
        product.warrantyMonths > 1 ? "s" : ""
      }`;
    }

    return "No Warranty";
  };

  // ✅ Get stock color (based on threshold)
  const getStockColor = (stock: number): "success" | "warning" | "error" => {
    if (stock === 0) return "error";
    if (stock <= threshold) return "warning";
    return "success";
  };

  // ✅ Handle settings save
  const handleSaveThreshold = async () => {
    try {
      await settingsService.setLowStockThreshold(newThreshold);
      setThreshold(newThreshold);
      setSettingsDialog(false);
      setSnackbar({
        open: true,
        message: "Low-stock threshold updated successfully!",
        severity: "success",
      });
    } catch (error: any) {
      setSnackbar({
        open: true,
        message: error.response?.data?.message || "Error saving threshold",
        severity: "error",
      });
    }
  };

  // ✅ Open add/edit dialog
  const handleOpenDialog = (product?: Product) => {
    if (product) {
      setSelectedProduct(product);
      setFormData({
        name: product.name,
        description: product.description || "",
        sku: product.sku || "",
        price: product.price,
        stock: product.stock,
        company: product.company || "",
        hasWarranty: product.hasWarranty,
        warrantyMonths: product.warrantyMonths,
        warrantyYears: product.warrantyYears,
      });

      if (product.warrantyYears) {
        setWarrantyType("years");
      } else {
        setWarrantyType("months");
      }
    } else {
      setSelectedProduct(null);
      setFormData({
        name: "",
        description: "",
        sku: "",
        price: 0,
        stock: 0,
        company: "",
        hasWarranty: false,
        warrantyMonths: undefined,
        warrantyYears: undefined,
      });
      setWarrantyType("months");
    }
    setDialog(true);
  };

  const handleCloseDialog = () => {
    setDialog(false);
    setSelectedProduct(null);
  };

  // ✅ Save product
  const handleSave = async () => {
    try {
      const productData: CreateProductDto = {
        name: formData.name,
        description: formData.description || undefined,
        sku: formData.sku || undefined,
        company: formData.company || undefined,
        price: Number(formData.price),
        stock: Number(formData.stock),
        hasWarranty: formData.hasWarranty,
      };

      if (formData.hasWarranty) {
        if (warrantyType === "months") {
          productData.warrantyMonths = formData.warrantyMonths;
          productData.warrantyYears = undefined;
        } else {
          productData.warrantyYears = formData.warrantyYears;
          productData.warrantyMonths = undefined;
        }
      } else {
        productData.warrantyMonths = undefined;
        productData.warrantyYears = undefined;
      }

      if (selectedProduct) {
        await productService.updateProduct(selectedProduct.id, productData);
        setSnackbar({
          open: true,
          message: "Product updated successfully!",
          severity: "success",
        });
      } else {
        await productService.createProduct(productData);
        setSnackbar({
          open: true,
          message: "Product created successfully!",
          severity: "success",
        });
      }

      handleCloseDialog();
      fetchProducts();
    } catch (error: any) {
      setSnackbar({
        open: true,
        message: error.response?.data?.message || "Operation failed",
        severity: "error",
      });
    }
  };

  // ✅ Open stock update dialog
  const handleOpenStockDialog = (product: Product) => {
    setSelectedProduct(product);
    setStockUpdateData({
      quantityChange: 0,
      reason: "",
    });
    setStockDialog(true);
  };

  const handleCloseStockDialog = () => {
    setStockDialog(false);
    setSelectedProduct(null);
  };

  // ✅ Update stock
  const handleUpdateStock = async () => {
    if (!selectedProduct) return;

    try {
      await productService.updateStock(selectedProduct.id, stockUpdateData);
      setSnackbar({
        open: true,
        message: "Stock updated successfully!",
        severity: "success",
      });
      handleCloseStockDialog();
      fetchProducts();
    } catch (error: any) {
      setSnackbar({
        open: true,
        message: error.response?.data?.message || "Failed to update stock",
        severity: "error",
      });
    }
  };

  // ✅ Delete product
  const handleDelete = async () => {
    if (!selectedProduct) return;

    try {
      await productService.deleteProduct(selectedProduct.id);
      setSnackbar({
        open: true,
        message: "Product deleted successfully!",
        severity: "success",
      });
      setDeleteDialog(false);
      setSelectedProduct(null);
      fetchProducts();
    } catch (error: any) {
      setSnackbar({
        open: true,
        message: error.response?.data?.message || "Failed to delete product",
        severity: "error",
      });
    }
  };

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
        <Typography variant="h4" component="h1" fontWeight={700}>
          Product Management
        </Typography>

        <Box sx={{ display: "flex", gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<SettingsIcon />}
            onClick={() => setSettingsDialog(true)}
          >
            Settings
          </Button>

          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
          >
            Add Product
          </Button>
        </Box>
      </Box>

      {/* ❌ REMOVED: Duplicate Search Bar */}
      {/* The ProductFilters component below already has search functionality */}

      {/* ✅ Product Filters - SINGLE SOURCE OF FILTERING */}
      <ProductFilters onFilter={handleApplyFilters} companies={companies} />

      {products.length === 0 ? (
        <EmptyState
          title="No products found"
          description="Add your first product to get started or adjust your filters"
          actionLabel="Add Product"
          onAction={() => handleOpenDialog()}
        />
      ) : (
        <Card>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Product Name</TableCell>
                  <TableCell>SKU</TableCell>
                  <TableCell>Company</TableCell>
                  <TableCell align="right">Price</TableCell>
                  <TableCell align="center">Stock</TableCell>
                  <TableCell>Warranty</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {products.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>
                      <Typography variant="body1" fontWeight={500}>
                        {product.name}
                      </Typography>
                      {product.description && (
                        <Typography variant="caption" color="text.secondary">
                          {product.description}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>{product.sku || "-"}</TableCell>
                    <TableCell>{product.company || "-"}</TableCell>
                    <TableCell align="right">
                      ₹{Number(product.price).toFixed(2)}
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        label={product.stock}
                        color={getStockColor(product.stock)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{formatWarranty(product)}</TableCell>
                    <TableCell align="right">
                      <IconButton
                        size="small"
                        onClick={() => handleOpenStockDialog(product)}
                        title="Update Stock"
                      >
                        <UpdateIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleOpenDialog(product)}
                        sx={{ ml: 1 }}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => {
                          setSelectedProduct(product);
                          setDeleteDialog(true);
                        }}
                        sx={{ ml: 1 }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      )}

      {/* Rest of the dialogs remain the same */}
      {/* Add/Edit Product Dialog */}
      <Dialog open={dialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedProduct ? "Edit Product" : "Add New Product"}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}>
            <TextField
              fullWidth
              label="Product Name *"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
            />

            <TextField
              fullWidth
              label="SKU"
              value={formData.sku}
              onChange={(e) =>
                setFormData({ ...formData, sku: e.target.value })
              }
            />

            <TextField
              fullWidth
              label="Company"
              value={formData.company || ""}
              onChange={(e) =>
                setFormData({ ...formData, company: e.target.value })
              }
            />

            <TextField
              fullWidth
              label="Description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              multiline
              rows={2}
            />

            <TextField
              fullWidth
              label="Price *"
              type="number"
              value={formData.price}
              onChange={(e) =>
                setFormData({ ...formData, price: Number(e.target.value) })
              }
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">₹</InputAdornment>
                ),
              }}
            />

            <TextField
              fullWidth
              label="Stock Quantity *"
              type="number"
              value={formData.stock}
              onChange={(e) =>
                setFormData({ ...formData, stock: Number(e.target.value) })
              }
            />

            <FormControlLabel
              control={
                <Switch
                  checked={formData.hasWarranty}
                  onChange={(e) =>
                    setFormData({ ...formData, hasWarranty: e.target.checked })
                  }
                />
              }
              label="Has Warranty?"
            />

            {formData.hasWarranty && (
              <Box
                sx={{ pl: 2, display: "flex", flexDirection: "column", gap: 2 }}
              >
                <FormControl>
                  <FormLabel>Warranty Type</FormLabel>
                  <RadioGroup
                    row
                    value={warrantyType}
                    onChange={(e) =>
                      setWarrantyType(e.target.value as "months" | "years")
                    }
                  >
                    <FormControlLabel
                      value="months"
                      control={<Radio />}
                      label="Months"
                    />
                    <FormControlLabel
                      value="years"
                      control={<Radio />}
                      label="Years"
                    />
                  </RadioGroup>
                </FormControl>

                {warrantyType === "months" ? (
                  <TextField
                    fullWidth
                    label="Warranty Duration (Months)"
                    type="number"
                    value={formData.warrantyMonths || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        warrantyMonths: Number(e.target.value),
                        warrantyYears: undefined,
                      })
                    }
                    inputProps={{ min: 1, max: 11 }}
                    helperText="1-11 months"
                  />
                ) : (
                  <TextField
                    fullWidth
                    label="Warranty Duration (Years)"
                    type="number"
                    value={formData.warrantyYears || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        warrantyYears: Number(e.target.value),
                        warrantyMonths: undefined,
                      })
                    }
                    inputProps={{ min: 1 }}
                    helperText="e.g., 2 for 2 years"
                  />
                )}
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            onClick={handleSave}
            variant="contained"
            disabled={!formData.name.trim()}
          >
            {selectedProduct ? "Update" : "Create"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Stock Update Dialog */}
      <Dialog
        open={stockDialog}
        onClose={handleCloseStockDialog}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Update Stock</DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}>
            <Typography variant="body2">
              Product: <strong>{selectedProduct?.name}</strong>
            </Typography>
            <Typography variant="body2">
              Current Stock: <strong>{selectedProduct?.stock}</strong>
            </Typography>

            <TextField
              select
              fullWidth
              label="Reason *"
              value={stockUpdateData.reason}
              onChange={(e) =>
                setStockUpdateData({
                  ...stockUpdateData,
                  reason: e.target.value,
                })
              }
            >
              <MenuItem value="Added Stock">Added Stock</MenuItem>
              <MenuItem value="Used in Service">Used in Service</MenuItem>
              <MenuItem value="Damage">Damage/Lost</MenuItem>
              <MenuItem value="Adjustment">Stock Adjustment</MenuItem>
              <MenuItem value="Other">Other</MenuItem>
            </TextField>

            <TextField
              fullWidth
              label="Quantity Change *"
              type="number"
              value={stockUpdateData.quantityChange}
              onChange={(e) =>
                setStockUpdateData({
                  ...stockUpdateData,
                  quantityChange: Number(e.target.value),
                })
              }
              helperText="Positive to add, negative to remove"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseStockDialog}>Cancel</Button>
          <Button
            onClick={handleUpdateStock}
            variant="contained"
            disabled={
              !stockUpdateData.reason || stockUpdateData.quantityChange === 0
            }
          >
            Update
          </Button>
        </DialogActions>
      </Dialog>

      {/* Settings Dialog */}
      <Dialog
        open={settingsDialog}
        onClose={() => setSettingsDialog(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Stock Alert Settings</DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Set the stock level below which products will be shown as "low
              stock"
            </Typography>
            <TextField
              fullWidth
              label="Low-Stock Threshold"
              type="number"
              value={newThreshold}
              onChange={(e) =>
                setNewThreshold(Math.max(0, Number(e.target.value)))
              }
              inputProps={{ min: 0 }}
              helperText={`Current: ${threshold} units`}
            />
            <Typography variant="caption" color="text.secondary">
              Products with stock ≤ {newThreshold} will be marked as low-stock
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSettingsDialog(false)}>Cancel</Button>
          <Button onClick={handleSaveThreshold} variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteDialog}
        title="Delete Product"
        message={`Are you sure you want to delete "${selectedProduct?.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        severity="error"
        onConfirm={handleDelete}
        onCancel={() => {
          setDeleteDialog(false);
          setSelectedProduct(null);
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

export default ProductManagement;
