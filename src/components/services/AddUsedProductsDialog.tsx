import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  TextField,
  MenuItem,
  Typography,
  Card,
  CardContent,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import type { Product } from '../../types';

interface AddUsedProductsDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (usedProducts: Array<{ productId: string; quantityUsed: number; notes?: string }>) => Promise<void>;
  allProducts: Product[];
  loading?: boolean;
}

const AddUsedProductsDialog: React.FC<AddUsedProductsDialogProps> = ({
  open,
  onClose,
  onConfirm,
  allProducts,
  loading = false,
}) => {
  const [usedProducts, setUsedProducts] = useState<Array<{
    productId: string;
    quantityUsed: number;
    notes?: string;
    name?: string;
    price?: number;
  }>>([]);

  const [selectedProductId, setSelectedProductId] = useState('');
  const [selectedQuantity, setSelectedQuantity] = useState<number>(1);
  const [selectedNotes, setSelectedNotes] = useState('');

  const handleAddProduct = () => {
    if (!selectedProductId || selectedQuantity < 1) {
      return;
    }

    const product = allProducts.find((p) => p.id === selectedProductId);
    if (!product) return;

    // Check if already added
    if (usedProducts.some((p) => p.productId === selectedProductId)) {
      alert('This product is already added');
      return;
    }

    const newProduct = {
      productId: selectedProductId,
      quantityUsed: selectedQuantity,
      notes: selectedNotes || undefined,
      name: product.name,
      price: Number(product.price),
    };

    setUsedProducts([...usedProducts, newProduct]);
    setSelectedProductId('');
    setSelectedQuantity(1);
    setSelectedNotes('');
  };

  const handleRemoveProduct = (productId: string) => {
    setUsedProducts(usedProducts.filter((p) => p.productId !== productId));
  };

  const handleConfirm = async () => {
    if (usedProducts.length === 0) {
      alert('Please add at least one product');
      return;
    }

    try {
      await onConfirm(
        usedProducts.map((p) => ({
          productId: p.productId,
          quantityUsed: p.quantityUsed,
          notes: p.notes,
        })),
      );
      setUsedProducts([]);
      onClose();
    } catch (error) {
      console.error('Error confirming products:', error);
    }
  };

  const totalCost = usedProducts.reduce(
    (sum, p) => sum + (p.price || 0) * p.quantityUsed,
    0,
  );

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Add Used Products & Services</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 2 }}>
          {/* Add Product Section */}
          <Card>
            <CardContent>
              <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                Add Products Used
              </Typography>

              <Box sx={{ display: 'flex', gap: 2, flexDirection: 'column' }}>
                {/* Product Selector */}
                <TextField
                  select
                  fullWidth
                  label="Select Product *"
                  value={selectedProductId}
                  onChange={(e) => setSelectedProductId(e.target.value)}
                  disabled={loading}
                >
                  <MenuItem value="">-- Choose Product --</MenuItem>
                  {allProducts.map((product) => (
                    <MenuItem key={product.id} value={product.id}>
                      {product.name} (Stock: {product.stock}, Price: ₹
                      {Number(product.price).toFixed(2)})
                    </MenuItem>
                  ))}
                </TextField>

                {/* Quantity Input */}
                <TextField
                  type="number"
                  fullWidth
                  label="Quantity Used *"
                  value={selectedQuantity}
                  onChange={(e) => setSelectedQuantity(Math.max(1, Number(e.target.value)))}
                  inputProps={{ min: 1 }}
                  disabled={loading}
                />

                {/* Notes */}
                <TextField
                  fullWidth
                  multiline
                  rows={2}
                  label="Service Notes (Optional)"
                  value={selectedNotes}
                  onChange={(e) => setSelectedNotes(e.target.value)}
                  placeholder="e.g., Installed new filter, replaced motor..."
                  disabled={loading}
                />

                {/* Add Button */}
                <Button
                  startIcon={<AddIcon />}
                  variant="contained"
                  onClick={handleAddProduct}
                  disabled={!selectedProductId || selectedQuantity < 1 || loading}
                >
                  Add Product
                </Button>
              </Box>
            </CardContent>
          </Card>

          {/* Products Summary */}
          {usedProducts.length > 0 && (
            <Card>
              <CardContent>
                <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                  Products Added ({usedProducts.length})
                </Typography>

                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ bgcolor: 'grey.100' }}>
                        <TableCell>Product</TableCell>
                        <TableCell align="right">Qty</TableCell>
                        <TableCell align="right">Price</TableCell>
                        <TableCell align="right">Total</TableCell>
                        <TableCell align="center">Action</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {usedProducts.map((product) => (
                        <TableRow key={product.productId}>
                          <TableCell>{product.name}</TableCell>
                          <TableCell align="right">{product.quantityUsed}</TableCell>
                          <TableCell align="right">₹{product.price?.toFixed(2)}</TableCell>
                          <TableCell align="right">
                            ₹{((product.price || 0) * product.quantityUsed).toFixed(2)}
                          </TableCell>
                          <TableCell align="center">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleRemoveProduct(product.productId)}
                              disabled={loading}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>

                <Box sx={{ mt: 2, textAlign: 'right' }}>
                  <Typography variant="subtitle1" fontWeight={600}>
                    Total Cost: ₹{totalCost.toFixed(2)}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          )}

          {/* Alert if no products */}
          {usedProducts.length === 0 && (
            <Alert severity="info">
              No products added yet. Add at least one product to proceed.
            </Alert>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={handleConfirm}
          variant="contained"
          disabled={usedProducts.length === 0 || loading}
        >
          {loading ? 'Saving...' : 'Confirm & Save'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddUsedProductsDialog;
