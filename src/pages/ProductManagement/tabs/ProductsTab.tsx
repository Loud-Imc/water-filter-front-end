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
import CategoryIcon from "@mui/icons-material/Category";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import ClearIcon from "@mui/icons-material/Clear";
import { PERMISSIONS } from "../../../constants/permissions";
import { productService } from "../../../api/services/productService";
import { productCategoriesService } from "../../../api/services/productCategoriesService";
import type { Product, ProductCategory } from "../../../types";
import LoadingSpinner from "../../../components/common/LoadingSpinner";
import EmptyState from "../../../components/common/EmptyState";
import ConfirmDialog from "../../../components/common/ConfirmDialog";
import SnackbarNotification from "../../../components/common/SnackbarNotification";
import { PermissionGate } from "../../../components/PermissionGate";
import CategoryManagement from "../components/CategoryManagement";
import ProductDialog from "../components/ProductDialog";
import StockUpdateDialog from "../components/StockUpdateDialog";
import { useLocation } from "react-router-dom";

const ProductsTab: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [productDialog, setProductDialog] = useState(false);
  const [categoryDialog, setCategoryDialog] = useState(false);
  const [stockDialog, setStockDialog] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
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
    setLoading(true);
    try {
      const [productsData, categoriesData] = await Promise.all([
        productService.getAllProducts(),
        productCategoriesService.getAll(),
      ]);
      setProducts(productsData);
      setCategories(categoriesData);
    } catch (error) {
      console.error("Failed to fetch data:", error);
      setSnackbar({
        open: true,
        message: "Failed to fetch products",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProduct = async (data: any) => {
    try {
      if (selectedProduct) {
        await productService.updateProduct(selectedProduct.id, data);
        setSnackbar({
          open: true,
          message: "Product updated successfully!",
          severity: "success",
        });
      } else {
        await productService.createProduct(data);
        setSnackbar({
          open: true,
          message: "Product created successfully!",
          severity: "success",
        });
      }
      fetchData();
      setProductDialog(false);
      setSelectedProduct(null);
    } catch (error: any) {
      throw error;
    }
  };

  const handleUpdateStock = async (quantityChange: number, reason: string) => {
    if (!selectedProduct) return;
    try {
      await productService.updateStock(selectedProduct.id, {
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
      fetchData();
    } catch (error: any) {
      setSnackbar({
        open: true,
        message: error.response?.data?.message || "Failed to delete product",
        severity: "error",
      });
    }
  };

  const handleClearFilters = () => {
    setSearchTerm("");
    setSelectedCategory("");
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

  const formatWarranty = (product: Product): string => {
    if (!product.hasWarranty) return "No Warranty";
    if (product.warrantyYears) return `${product.warrantyYears} Year(s)`;
    if (product.warrantyMonths) return `${product.warrantyMonths} Month(s)`;
    return "No Warranty";
  };

  const getStockColor = (stock: number): "success" | "warning" | "error" => {
    if (stock === 0) return "error";
    if (stock <= 5) return "warning";
    return "success";
  };

  const companies = Array.from(
    new Set(products.map((p) => p.company).filter(Boolean))
  );

  const filteredProducts = products
    .filter((product) => {
      if (searchTerm) {
        const search = searchTerm.toLowerCase();
        const matchesName = product.name.toLowerCase().includes(search);
        const matchesSku = product.sku?.toLowerCase().includes(search);
        if (!matchesName && !matchesSku) return false;
      }
      if (selectedCategory && product.categoryId !== selectedCategory)
        return false;
      if (selectedCompany && product.company !== selectedCompany) return false;
      if (minPrice && Number(product.price) < Number(minPrice)) return false;
      if (maxPrice && Number(product.price) > Number(maxPrice)) return false;
      if (minStock && product.stock < Number(minStock)) return false;
      if (maxStock && product.stock > Number(maxStock)) return false;
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

  // Paginate filtered products
  const paginatedProducts = filteredProducts.slice(
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
          Products ({filteredProducts.length})
        </Typography>
        <Box sx={{ display: "flex", gap: 2 }}>
          <PermissionGate permission={PERMISSIONS.CATEGORIES_MANAGE}>
            <Button
              variant="outlined"
              startIcon={<CategoryIcon />}
              onClick={() => setCategoryDialog(true)}
            >
              Manage Categories
            </Button>
          </PermissionGate>
          <PermissionGate permission={PERMISSIONS.PRODUCTS_CREATE}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => {
                setSelectedProduct(null);
                setProductDialog(true);
              }}
            >
              Add Product
            </Button>
          </PermissionGate>
        </Box>
      </Box>

      <Card sx={{ mb: 3, p: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              placeholder="Search by product name or SKU..."
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
                  <InputLabel>Category</InputLabel>
                  <Select
                    value={selectedCategory}
                    onChange={(e) => {
                      setSelectedCategory(e.target.value);
                      setPage(0);
                    }}
                    label="Category"
                  >
                    <MenuItem value="">All Categories</MenuItem>
                    {categories
                      .filter((c) => c.isActive)
                      .map((category) => (
                        <MenuItem key={category.id} value={category.id}>
                          {category.name}
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

      {filteredProducts.length === 0 ? (
        <EmptyState
          title="No products found"
          description={
            searchTerm || selectedCategory || selectedCompany
              ? "Try adjusting your filters"
              : "Add your first product to get started"
          }
          actionLabel="Add Product"
          onAction={() => setProductDialog(true)}
        />
      ) : (
        <Card>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Product Name</TableCell>
                  <TableCell>SKU</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell>Company</TableCell>
                  <TableCell align="right">Price</TableCell>
                  <TableCell align="center">Stock</TableCell>
                  <TableCell>Warranty</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedProducts.map((product) => (
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
                    <TableCell>
                      {product.category ? (
                        <Chip label={product.category.name} size="small" />
                      ) : (
                        "-"
                      )}
                    </TableCell>
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
                      <PermissionGate permission={PERMISSIONS.STOCK_UPDATE}>
                        <IconButton
                          size="small"
                          onClick={() => {
                            setSelectedProduct(product);
                            setStockDialog(true);
                          }}
                          title="Update Stock"
                        >
                          <UpdateIcon />
                        </IconButton>
                      </PermissionGate>
                      <PermissionGate permission={PERMISSIONS.PRODUCTS_UPDATE}>
                        <IconButton
                          size="small"
                          onClick={() => {
                            setSelectedProduct(product);
                            setProductDialog(true);
                          }}
                          sx={{ ml: 1 }}
                        >
                          <EditIcon />
                        </IconButton>
                      </PermissionGate>
                      <PermissionGate permission={PERMISSIONS.PRODUCTS_DELETE}>
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
            count={filteredProducts.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Card>
      )}

      <CategoryManagement
        open={categoryDialog}
        onClose={() => setCategoryDialog(false)}
        onCategoryChange={fetchData}
      />

      <ProductDialog
        open={productDialog}
        onClose={() => {
          setProductDialog(false);
          setSelectedProduct(null);
        }}
        onSave={handleSaveProduct}
        product={selectedProduct}
        categories={categories}
      />

      {selectedProduct && (
        <StockUpdateDialog
          open={stockDialog}
          onClose={() => {
            setStockDialog(false);
            setSelectedProduct(null);
          }}
          onUpdate={handleUpdateStock}
          itemName={selectedProduct.name}
          currentStock={selectedProduct.stock}
          itemType="product"
        />
      )}

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

export default ProductsTab;
