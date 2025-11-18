import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Chip,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Divider,
  Alert,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { bomTemplatesService } from '../../../api/services/bomTemplatesService';
import { sparePartsService } from '../../../api/services/sparePartsService';
import type { BOMTemplate, Product, SparePart, AddBOMItemDto } from '../../../types';
// import LoadingSpinner from '../../../components/common/LoadingSpinner';

interface BOMTemplateDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: () => void;
  template?: BOMTemplate | null;
  products: Product[];
}

const BOMTemplateDialog: React.FC<BOMTemplateDialogProps> = ({
  open,
  onClose,
  onSave,
  template,
  products,
}) => {
  const [loading, setLoading] = useState(false);
  const [spareParts, setSpareParts] = useState<SparePart[]>([]);
  const [formData, setFormData] = useState({
    productId: '',
    name: '',
    description: '',
  });
  const [addItemMode, setAddItemMode] = useState(false);
  const [itemFormData, setItemFormData] = useState<AddBOMItemDto>({
    sparePartId: '',
    quantity: 1,
    isOptional: false,
    notes: '',
  });
  const [templateData, setTemplateData] = useState<BOMTemplate | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      fetchSpareParts();
      if (template) {
        setFormData({
          productId: template.productId,
          name: template.name,
          description: template.description || '',
        });
        setTemplateData(template);
      } else {
        setFormData({ productId: '', name: '', description: '' });
        setTemplateData(null);
      }
    }
  }, [open, template]);

  const fetchSpareParts = async () => {
    try {
      const data = await sparePartsService.getAll();
      setSpareParts(data);
    } catch (error) {
      console.error('Failed to fetch spare parts:', error);
    }
  };

  const handleCreateTemplate = async () => {
    if (!formData.productId || !formData.name) {
      setError('Product and template name are required');
      return;
    }

    setLoading(true);
    setError('');
    try {
      if (template) {
        await bomTemplatesService.update(template.id, formData);
      } else {
        const newTemplate = await bomTemplatesService.create(formData);
        setTemplateData(newTemplate);
      }
      if (!template) {
        // Fetch the newly created template
        const created = await bomTemplatesService.getAll();
        const latest = created.find(t => t.productId === formData.productId);
        if (latest) setTemplateData(latest);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save template');
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = async () => {
    if (!templateData || !itemFormData.sparePartId || itemFormData.quantity <= 0) {
      setError('Please select a spare part and enter quantity');
      return;
    }

    setLoading(true);
    setError('');
    try {
      await bomTemplatesService.addItem(templateData.id, itemFormData);
      const updated = await bomTemplatesService.getById(templateData.id);
      setTemplateData(updated);
      setItemFormData({
        sparePartId: '',
        quantity: 1,
        isOptional: false,
        notes: '',
      });
      setAddItemMode(false);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to add item');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveItem = async (itemId: string) => {
    if (!templateData) return;

    setLoading(true);
    try {
      await bomTemplatesService.removeItem(templateData.id, itemId);
      const updated = await bomTemplatesService.getById(templateData.id);
      setTemplateData(updated);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to remove item');
    } finally {
      setLoading(false);
    }
  };

  const handleFinish = () => {
    onSave();
    onClose();
  };

  const availableProducts = products.filter(p => {
    // If editing, allow current product
    if (template && p.id === template.productId) return true;
    // Otherwise, only show products without BOM templates
    return !p.bomTemplate;
  });

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {template ? 'Edit BOM Template' : 'Create BOM Template'}
      </DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {/* Step 1: Template Details */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" fontWeight={600} gutterBottom>
            Step 1: Template Details
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              select
              fullWidth
              label="Product *"
              value={formData.productId}
              onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
              disabled={!!template}
            >
              {availableProducts.map((product) => (
                <MenuItem key={product.id} value={product.id}>
                  {product.name} {product.category && `(${product.category.name})`}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              fullWidth
              label="Template Name *"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., PLANET GOLD Assembly"
            />

            <TextField
              fullWidth
              label="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              multiline
              rows={2}
            />

            <Button
              variant="contained"
              onClick={handleCreateTemplate}
              disabled={!formData.productId || !formData.name || loading}
            >
              {template ? 'Update Template' : 'Create Template'}
            </Button>
          </Box>
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* Step 2: Add Spare Parts */}
        {templateData && (
          <Box>
            <Typography variant="subtitle1" fontWeight={600} gutterBottom>
              Step 2: Add Spare Parts
            </Typography>

            {/* Current Items List */}
            {templateData.items && templateData.items.length > 0 && (
              <List sx={{ mb: 2 }}>
                {templateData.items.map((item) => (
                  <ListItem
                    key={item.id}
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
                          {item?.sparePart?.name}
                          <Chip label={`Qty: ${item.quantity}`} size="small" color="primary" />
                          {item.isOptional && (
                            <Chip label="Optional" size="small" variant="outlined" />
                          )}
                        </Box>
                      }
                      secondary={
                        <>
                          {item?.sparePart?.sku && `SKU: ${item?.sparePart?.sku} • `}
                          Stock: {item?.sparePart?.stock}
                          {item.notes && ` • ${item.notes}`}
                        </>
                      }
                    />
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleRemoveItem(item.id)}
                      disabled={loading}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </ListItem>
                ))}
              </List>
            )}

            {/* Add Item Form */}
            {!addItemMode ? (
              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={() => setAddItemMode(true)}
                fullWidth
              >
                Add Spare Part
              </Button>
            ) : (
              <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <TextField
                    select
                    fullWidth
                    label="Spare Part *"
                    value={itemFormData.sparePartId}
                    onChange={(e) =>
                      setItemFormData({ ...itemFormData, sparePartId: e.target.value })
                    }
                  >
                    {spareParts
                      .filter(sp => !templateData.items?.some(item => item.sparePartId === sp.id))
                      .map((sp) => (
                        <MenuItem key={sp.id} value={sp.id}>
                          {sp.name} {sp.group && `(${sp.group.name})`} - Stock: {sp.stock}
                        </MenuItem>
                      ))}
                  </TextField>

                  <TextField
                    fullWidth
                    label="Quantity *"
                    type="number"
                    value={itemFormData.quantity}
                    onChange={(e) =>
                      setItemFormData({ ...itemFormData, quantity: Number(e.target.value) })
                    }
                    inputProps={{ min: 1 }}
                  />

                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={itemFormData.isOptional}
                        onChange={(e) =>
                          setItemFormData({ ...itemFormData, isOptional: e.target.checked })
                        }
                      />
                    }
                    label="Optional (can be skipped during assembly)"
                  />

                  <TextField
                    fullWidth
                    label="Notes"
                    value={itemFormData.notes}
                    onChange={(e) =>
                      setItemFormData({ ...itemFormData, notes: e.target.value })
                    }
                  />

                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      variant="contained"
                      onClick={handleAddItem}
                      disabled={!itemFormData.sparePartId || itemFormData.quantity <= 0 || loading}
                    >
                      Add
                    </Button>
                    <Button
                      onClick={() => {
                        setAddItemMode(false);
                        setItemFormData({
                          sparePartId: '',
                          quantity: 1,
                          isOptional: false,
                          notes: '',
                        });
                      }}
                      disabled={loading}
                    >
                      Cancel
                    </Button>
                  </Box>
                </Box>
              </Box>
            )}
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={handleFinish}
          variant="contained"
          disabled={!templateData || loading}
        >
          Finish
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default BOMTemplateDialog;
