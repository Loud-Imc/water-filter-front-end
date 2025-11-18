import React, { useState, useEffect } from "react";
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
} from "@mui/material";
import type {
  SparePart,
  SparePartGroup,
  CreateSparePartDto,
} from "../../../types";

interface SparePartDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: CreateSparePartDto) => Promise<void>;
  sparePart?: SparePart | null;
  groups: SparePartGroup[];
}

const SparePartDialog: React.FC<SparePartDialogProps> = ({
  open,
  onClose,
  onSave,
  sparePart,
  groups,
}) => {
  const [formData, setFormData] = useState<CreateSparePartDto>({
    name: "",
    description: "",
    sku: null,
    groupId: "",
    company: "",
    price: 0,
    stock: 0,
    hasWarranty: false,
    warrantyMonths: undefined,
    warrantyYears: undefined,
  });
  const [warrantyType, setWarrantyType] = useState<"months" | "years">(
    "months"
  );
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{
    name?: string;
    groupId?: string;
    price?: string;
    stock?: string;
  }>({});

  useEffect(() => {
    if (sparePart) {
      setFormData({
        name: sparePart.name,
        description: sparePart.description || "",
        sku: sparePart.sku || null,
        groupId: sparePart.groupId || "",
        company: sparePart.company || "",
        price: sparePart.price,
        stock: sparePart.stock,
        hasWarranty: sparePart.hasWarranty,
        warrantyMonths: sparePart.warrantyMonths,
        warrantyYears: sparePart.warrantyYears,
      });
      if (sparePart.warrantyYears) {
        setWarrantyType("years");
      }
    } else {
      setFormData({
        name: "",
        description: "",
        sku: null,
        groupId: "",
        company: "",
        price: 0,
        stock: 0,
        hasWarranty: false,
        warrantyMonths: undefined,
        warrantyYears: undefined,
      });
      setWarrantyType("months");
    }
    setErrors({});
  }, [sparePart, open]);

  const validateForm = () => {
    const newErrors: typeof errors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }
    if (!formData.groupId) {
      newErrors.groupId = "Group is required";
    }
    if (
      formData.price === undefined ||
      formData.price === null ||
      formData.price < 1
    ) {
      newErrors.price = "Price must be at least 1";
    }
    if (
      formData.stock === undefined ||
      formData.stock === null ||
      formData.stock < 1
    ) {
      newErrors.stock = "Stock must be at least 1";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const sparePartData = { ...formData };

      if (formData.hasWarranty) {
        if (warrantyType === "months") {
          sparePartData.warrantyMonths = formData.warrantyMonths;
          sparePartData.warrantyYears = undefined;
        } else {
          sparePartData.warrantyYears = formData.warrantyYears;
          sparePartData.warrantyMonths = undefined;
        }
      } else {
        sparePartData.warrantyMonths = undefined;
        sparePartData.warrantyYears = undefined;
      }

      await onSave(sparePartData);
      onClose();
    } catch (error) {
      console.error("Error saving spare part:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {sparePart ? "Edit Spare Part" : "Add New Spare Part"}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}>
          <TextField
            fullWidth
            label="Spare Part Name *"
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
            value={formData.sku || ""}
            onChange={(e) =>
              setFormData({ ...formData, sku: e.target.value || null })
            }
          />

          <TextField
            select
            fullWidth
            required
            label="Group *"
            value={formData.groupId}
            onChange={(e) => {
              setFormData({ ...formData, groupId: e.target.value });
              setErrors((prev) => ({ ...prev, groupId: undefined }));
            }}
            error={!!errors.groupId}
            helperText={errors.groupId}
          >
            <MenuItem value="">None</MenuItem>
            {groups
              .filter((g) => g.isActive)
              .map((group) => (
                <MenuItem key={group.id} value={group.id}>
                  {group.name}
                </MenuItem>
              ))}
          </TextField>

          <TextField
            fullWidth
            label="Company"
            value={formData.company}
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
            onChange={(e) => {
              setFormData({ ...formData, price: Number(e.target.value) });
              setErrors((prev) => ({ ...prev, price: undefined }));
            }}
            error={!!errors.price}
            helperText={errors.price}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">₹</InputAdornment>
              ),
            }}
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
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} variant="contained" disabled={loading}>
          {loading ? "Saving..." : sparePart ? "Update" : "Create"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SparePartDialog;
