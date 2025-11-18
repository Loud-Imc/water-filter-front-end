import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Chip,
  Typography,
  Alert,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import ToggleOffIcon from '@mui/icons-material/ToggleOff';
import ToggleOnIcon from '@mui/icons-material/ToggleOn';
import { productCategoriesService } from '../../../api/services/productCategoriesService';
import type { ProductCategory } from '../../../types';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import ConfirmDialog from '../../../components/common/ConfirmDialog';

interface CategoryManagementProps {
  open: boolean;
  onClose: () => void;
  onCategoryChange: () => void;
}

const CategoryManagement: React.FC<CategoryManagementProps> = ({
  open,
  onClose,
  onCategoryChange,
}) => {
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | null>(null);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      fetchCategories();
    }
  }, [open]);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const data = await productCategoriesService.getAll(true); // Include inactive
      setCategories(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch categories');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (category: ProductCategory) => {
    setSelectedCategory(category);
    setFormData({
      name: category.name,
      description: category.description || '',
    });
    setEditMode(true);
  };

  const handleCancelEdit = () => {
    setEditMode(false);
    setSelectedCategory(null);
    setFormData({ name: '', description: '' });
    setError('');
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      setError('Category name is required');
      return;
    }

    setLoading(true);
    setError('');
    try {
      if (selectedCategory) {
        await productCategoriesService.update(selectedCategory.id, formData);
      } else {
        await productCategoriesService.create(formData);
      }
      await fetchCategories();
      handleCancelEdit();
      onCategoryChange();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save category');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (category: ProductCategory) => {
    setLoading(true);
    try {
      await productCategoriesService.toggleStatus(category.id);
      await fetchCategories();
      onCategoryChange();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to toggle status');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedCategory) return;

    setLoading(true);
    try {
      await productCategoriesService.delete(selectedCategory.id);
      await fetchCategories();
      setDeleteDialog(false);
      setSelectedCategory(null);
      onCategoryChange();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete category');
      setDeleteDialog(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogTitle>Manage Product Categories</DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
              {error}
            </Alert>
          )}

          {/* Add/Edit Form */}
          <Box sx={{ mb: 3, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
            <Typography variant="subtitle2" gutterBottom>
              {editMode ? 'Edit Category' : 'Add New Category'}
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
              <TextField
                fullWidth
                label="Category Name *"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., RO Systems, UV Filters"
              />
              <TextField
                fullWidth
                label="Description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                multiline
                rows={2}
              />
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  variant="contained"
                  startIcon={editMode ? <EditIcon /> : <AddIcon />}
                  onClick={handleSave}
                  disabled={loading || !formData.name.trim()}
                >
                  {editMode ? 'Update' : 'Add'}
                </Button>
                {editMode && (
                  <Button onClick={handleCancelEdit} disabled={loading}>
                    Cancel
                  </Button>
                )}
              </Box>
            </Box>
          </Box>

          {/* Categories List */}
          {loading && !editMode ? (
            <LoadingSpinner />
          ) : (
            <List>
              {categories.length === 0 ? (
                <Typography variant="body2" color="text.secondary" sx={{ p: 2 }}>
                  No categories yet. Add your first category above.
                </Typography>
              ) : (
                categories.map((category) => (
                  <ListItem
                    key={category.id}
                    sx={{
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: 1,
                      mb: 1,
                    }}
                  >
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {category.name}
                          {!category.isActive && (
                            <Chip label="Inactive" size="small" color="default" />
                          )}
                          {category._count && (
                            <Chip
                              label={`${category._count.products} products`}
                              size="small"
                              color="primary"
                              variant="outlined"
                            />
                          )}
                        </Box>
                      }
                      secondary={category.description}
                    />
                    <ListItemSecondaryAction>
                      <IconButton
                        size="small"
                        onClick={() => handleToggleStatus(category)}
                        title={category.isActive ? 'Deactivate' : 'Activate'}
                      >
                        {category.isActive ? <ToggleOnIcon color="success" /> : <ToggleOffIcon />}
                      </IconButton>
                      <IconButton size="small" onClick={() => handleEdit(category)}>
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => {
                          setSelectedCategory(category);
                          setDeleteDialog(true);
                        }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))
              )}
            </List>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={deleteDialog}
        title="Delete Category"
        message={`Are you sure you want to delete "${selectedCategory?.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        severity="error"
        onConfirm={handleDelete}
        onCancel={() => {
          setDeleteDialog(false);
          setSelectedCategory(null);
        }}
      />
    </>
  );
};

export default CategoryManagement;
