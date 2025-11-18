import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  FormControlLabel,
  Switch,
  RadioGroup,
  Radio,
  FormControl,
  FormLabel,
  InputAdornment,
  MenuItem,
} from '@mui/material';
import type { Product, ProductCategory, CreateProductDto } from '../../../types';

interface ProductDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: CreateProductDto) => Promise<void>;
  product?: Product | null;
  categories: ProductCategory[];
}

const ProductDialog: React.FC<ProductDialogProps> = ({
  open,
  onClose,
  onSave,
  product,
  categories,
}) => {
  const [formData, setFormData] = useState<CreateProductDto>({
    name: '',
    description: '',
    sku: '',
    categoryId: '',
    company: '',
    price: 0,
    stock: 0,
    hasWarranty: false,
    warrantyMonths: undefined,
    warrantyYears: undefined,
  });
  const [warrantyType, setWarrantyType] = useState<'months' | 'years'>('months');
  const [loading, setLoading] = useState(false);

  // Validation errors state
  const [errors, setErrors] = useState<{
    name?: string;
    price?: string;
    stock?: string;
  }>({});

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        description: product.description || '',
        sku: product.sku || '',
        categoryId: product.categoryId || '',
        company: product.company || '',
        price: product.price,
        stock: product.stock,
        hasWarranty: product.hasWarranty,
        warrantyMonths: product.warrantyMonths,
        warrantyYears: product.warrantyYears,
      });
      if (product.warrantyYears) setWarrantyType('years');
    } else {
      setFormData({
        name: '',
        description: '',
        sku: '',
        categoryId: '',
        company: '',
        price: 0,
        stock: 0,
        hasWarranty: false,
        warrantyMonths: undefined,
        warrantyYears: undefined,
      });
      setWarrantyType('months');
    }
    setErrors({});
  }, [product, open]);

  const validateForm = () => {
    const newErrors: typeof errors = {};

    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (formData.price < 1) newErrors.price = 'Price must be at least 1';
    if (formData.stock < 1) newErrors.stock = 'Stock must be at least 1';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const productData = { ...formData };

      if (formData.hasWarranty) {
        if (warrantyType === 'months') {
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

      await onSave(productData);
      onClose();
    } catch (error) {
      console.error('Error saving product:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{product ? 'Edit Product' : 'Add New Product'}</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
          <TextField
            fullWidth
            label="Product Name *"
            value={formData.name}
            onChange={(e) => {
              setFormData({ ...formData, name: e.target.value });
              setErrors((prev) => ({ ...prev, name: undefined }));
            }}
            error={!!errors.name}
            helperText={errors.name}
          />

          <TextField
            fullWidth
            label="SKU"
            value={formData.sku}
            onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
          />

          <TextField
            select
            fullWidth
            label="Category"
            value={formData.categoryId}
            onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
          >
            <MenuItem value="">None</MenuItem>
            {categories.filter((c) => c.isActive).map((category) => (
              <MenuItem key={category.id} value={category.id}>
                {category.name}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            fullWidth
            label="Company"
            value={formData.company}
            onChange={(e) => setFormData({ ...formData, company: e.target.value })}
          />

          <TextField
            fullWidth
            label="Description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            multiline
            rows={2}
          />

          <TextField
            fullWidth
            label="Price *"
            type="number"
            value={formData.price}
            onChange={(e) => {
              setFormData({ ...formData, price: Number(e.target.value) });
              setErrors((prev) => ({ ...prev, price: undefined }));
            }}
            error={!!errors.price}
            helperText={errors.price}
            InputProps={{ startAdornment: <InputAdornment position="start">₹</InputAdornment> }}
            inputProps={{ min: 1 }}
          />

          <TextField
            fullWidth
            label="Stock Quantity *"
            type="number"
            value={formData.stock}
            onChange={(e) => {
              setFormData({ ...formData, stock: Number(e.target.value) });
              setErrors((prev) => ({ ...prev, stock: undefined }));
            }}
            error={!!errors.stock}
            helperText={errors.stock}
            inputProps={{ min: 1 }}
          />

          <FormControlLabel
            control={
              <Switch
                checked={formData.hasWarranty}
                onChange={(e) => setFormData({ ...formData, hasWarranty: e.target.checked })}
              />
            }
            label="Has Warranty?"
          />

          {formData.hasWarranty && (
            <Box sx={{ pl: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
              <FormControl>
                <FormLabel>Warranty Type</FormLabel>
                <RadioGroup
                  row
                  value={warrantyType}
                  onChange={(e) => setWarrantyType(e.target.value as 'months' | 'years')}
                >
                  <FormControlLabel value="months" control={<Radio />} label="Months" />
                  <FormControlLabel value="years" control={<Radio />} label="Years" />
                </RadioGroup>
              </FormControl>

              {warrantyType === 'months' ? (
                <TextField
                  fullWidth
                  label="Warranty Duration (Months)"
                  type="number"
                  value={formData.warrantyMonths || ''}
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
                  value={formData.warrantyYears || ''}
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
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading}
        >
          {loading ? 'Saving...' : product ? 'Update' : 'Create'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ProductDialog;
