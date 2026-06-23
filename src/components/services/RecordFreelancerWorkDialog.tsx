import React, { useState, useEffect } from "react";
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
  FormControl,
  InputLabel,
  Select,
  SelectChangeEvent,
  Chip,
  Autocomplete,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import WarehouseIcon from "@mui/icons-material/Warehouse";
import StorefrontIcon from "@mui/icons-material/Storefront";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import type { Product, SparePart } from "../../types";

interface UsedItem {
  id?: string;
  type: "product" | "sparePart";
  quantityUsed: number;
  source: "warehouse" | "external";
  notes?: string;
  name?: string;
  price?: number;
  isExternal?: boolean;
  externalName?: string;
  externalPrice?: number;
  externalWarrantyMonths?: number;
}

interface RecordFreelancerWorkDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (data: {
    startTime: string;
    endTime: string;
    notes: string;
    usedItems: UsedItem[];
    mediaFiles: File[];
  }) => Promise<void>;
  allProducts: Product[];
  allSpareParts: SparePart[];
  loading?: boolean;
}

const RecordFreelancerWorkDialog: React.FC<RecordFreelancerWorkDialogProps> = ({
  open,
  onClose,
  onConfirm,
  allProducts,
  allSpareParts,
  loading = false,
}) => {
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [workNotes, setWorkNotes] = useState("");
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);

  // Used Products state
  const [usedItems, setUsedItems] = useState<UsedItem[]>([]);
  const [selectType, setSelectType] = useState<"product" | "sparePart">("product");
  const [selectedSource, setSelectedSource] = useState<"warehouse" | "external">("warehouse");
  const [selectedId, setSelectedId] = useState("");
  const [selectedQuantity, setSelectedQuantity] = useState<number>(1);
  const [selectedNotes, setSelectedNotes] = useState("");
  const [maxQuantity, setMaxQuantity] = useState<number>(0);

  // External item state
  const [externalName, setExternalName] = useState("");
  const [externalPrice, setExternalPrice] = useState<number | "">("");
  const [externalWarranty, setExternalWarranty] = useState<number | "">("");

  useEffect(() => {
    if (!open) {
      setStartTime("");
      setEndTime("");
      setWorkNotes("");
      setMediaFiles([]);
      setUsedItems([]);
      setSelectedId("");
      setExternalName("");
      setExternalPrice("");
      setExternalWarranty("");
    }
  }, [open]);

  useEffect(() => {
    if (selectedSource === "external") {
      setMaxQuantity(999); // No strict limit for external
    } else {
      if (!selectedId) {
        setMaxQuantity(0);
        return;
      }
      const list = selectType === "product" ? allProducts : allSpareParts;
      const item = list.find((i) => i.id === selectedId);
      setMaxQuantity(item?.stock || 0);
    }
  }, [selectedId, selectedSource, selectType, allProducts, allSpareParts]);

  const handleSourceChange = (event: SelectChangeEvent) => {
    setSelectedSource(event.target.value as "warehouse" | "external");
    setSelectedId("");
    setSelectedQuantity(1);
  };

  const handleAddItem = () => {
    if (selectedQuantity < 1) return;

    if (selectedSource === "warehouse") {
      if (!selectedId) return;
      if (selectedQuantity > maxQuantity) {
        alert(`Quantity exceeds available warehouse stock. Maximum available: ${maxQuantity}`);
        return;
      }

      const list = selectType === "product" ? allProducts : allSpareParts;
      const selectedItem = list.find((item) => item.id === selectedId);
      if (!selectedItem) return;

      const newItem: UsedItem = {
        id: selectedId,
        type: selectType,
        source: "warehouse",
        quantityUsed: selectedQuantity,
        notes: selectedNotes || undefined,
        name: selectedItem.name,
        price: Number(selectedItem.price),
      };
      setUsedItems([...usedItems, newItem]);
    } else {
      // External source
      if (!externalName.trim()) {
        alert("Please provide the external product name.");
        return;
      }
      const newItem: UsedItem = {
        type: "product", // Default to product for external
        source: "external",
        quantityUsed: selectedQuantity,
        notes: selectedNotes || undefined,
        name: externalName,
        price: externalPrice ? Number(externalPrice) : 0,
        isExternal: true,
        externalName,
        externalPrice: externalPrice ? Number(externalPrice) : 0,
        externalWarrantyMonths: externalWarranty ? Number(externalWarranty) : undefined,
      };
      setUsedItems([...usedItems, newItem]);
    }

    // Reset fields
    setSelectedId("");
    setSelectedQuantity(1);
    setSelectedNotes("");
    setExternalName("");
    setExternalPrice("");
    setExternalWarranty("");
  };

  const handleRemoveItem = (indexToRemove: number) => {
    setUsedItems(usedItems.filter((_, index) => index !== indexToRemove));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setMediaFiles((prev) => [...prev, ...Array.from(e.target.files!)]);
    }
  };

  const removeFile = (indexToRemove: number) => {
    setMediaFiles(mediaFiles.filter((_, index) => index !== indexToRemove));
  };

  const handleConfirm = async () => {
    if (!startTime || !endTime) {
      alert("Please enter start and end time.");
      return;
    }
    await onConfirm({
      startTime,
      endTime,
      notes: workNotes,
      usedItems,
      mediaFiles,
    });
  };

  const getAvailableItems = () => {
    const list = selectType === "product" ? allProducts : allSpareParts;
    return list.map((item) => ({ ...item, availableQty: item.stock }));
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Record Freelancer Work</DialogTitle>
      <DialogContent>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3, mt: 2 }}>
          {/* Times */}
          <Box sx={{ display: "flex", gap: 2 }}>
            <TextField
              label="Work Start Time"
              type="datetime-local"
              fullWidth
              InputLabelProps={{ shrink: true }}
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              disabled={loading}
              required
            />
            <TextField
              label="Work End Time"
              type="datetime-local"
              fullWidth
              InputLabelProps={{ shrink: true }}
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              disabled={loading}
              required
            />
          </Box>

          <TextField
            label="Work Summary / Notes"
            multiline
            rows={3}
            fullWidth
            value={workNotes}
            onChange={(e) => setWorkNotes(e.target.value)}
            disabled={loading}
          />

          {/* Media Upload */}
          <Box>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              Work Photos
            </Typography>
            <Button
              component="label"
              variant="outlined"
              startIcon={<CloudUploadIcon />}
              sx={{ mb: 2 }}
            >
              Select Images
              <input type="file" hidden multiple accept="image/*" onChange={handleFileChange} />
            </Button>
            {mediaFiles.length > 0 && (
              <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                {mediaFiles.map((file, i) => (
                  <Chip key={i} label={file.name} onDelete={() => removeFile(i)} />
                ))}
              </Box>
            )}
          </Box>

          {/* Used Products Section */}
          <Card variant="outlined">
            <CardContent>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                Add Used Products/Spare Parts
              </Typography>

              <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}>
                <FormControl fullWidth>
                  <InputLabel>Stock Source</InputLabel>
                  <Select
                    value={selectedSource}
                    label="Stock Source"
                    onChange={handleSourceChange}
                    disabled={loading}
                  >
                    <MenuItem value="warehouse">
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <WarehouseIcon fontSize="small" /> Warehouse Stock
                      </Box>
                    </MenuItem>
                    <MenuItem value="external">
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <StorefrontIcon fontSize="small" /> Bought Outside (External)
                      </Box>
                    </MenuItem>
                  </Select>
                </FormControl>

                {selectedSource === "warehouse" ? (
                  <>
                    <FormControl fullWidth>
                      <InputLabel>Item Type</InputLabel>
                      <Select
                        value={selectType}
                        label="Item Type"
                        onChange={(e) => {
                          setSelectType(e.target.value as any);
                          setSelectedId("");
                        }}
                        disabled={loading}
                      >
                        <MenuItem value="product">Product</MenuItem>
                        <MenuItem value="sparePart">Spare Part</MenuItem>
                      </Select>
                    </FormControl>

                    <Autocomplete
                      fullWidth
                      options={getAvailableItems()}
                      getOptionLabel={(option) => option.name}
                      getOptionDisabled={(option) => option.availableQty === 0}
                      value={getAvailableItems().find((item) => item.id === selectedId) || null}
                      onChange={(_, newValue) => setSelectedId(newValue?.id || "")}
                      disabled={loading}
                      renderInput={(params) => (
                        <TextField {...params} label="Select Item" placeholder="Type to search..." />
                      )}
                    />
                    {selectedId && (
                      <Alert severity="info">Maximum warehouse stock: {maxQuantity} units</Alert>
                    )}
                  </>
                ) : (
                  <>
                    <TextField
                      label="External Item Name *"
                      value={externalName}
                      onChange={(e) => setExternalName(e.target.value)}
                      fullWidth
                    />
                    <Box sx={{ display: "flex", gap: 2 }}>
                      <TextField
                        label="Price (Optional)"
                        type="number"
                        value={externalPrice}
                        onChange={(e) => setExternalPrice(Number(e.target.value))}
                        fullWidth
                      />
                      <TextField
                        label="Warranty in Months (Optional)"
                        type="number"
                        value={externalWarranty}
                        onChange={(e) => setExternalWarranty(Number(e.target.value))}
                        fullWidth
                      />
                    </Box>
                  </>
                )}

                <Box sx={{ display: "flex", gap: 2 }}>
                  <TextField
                    type="number"
                    label="Quantity Used *"
                    value={selectedQuantity}
                    onChange={(e) => setSelectedQuantity(Number(e.target.value))}
                    inputProps={{ min: 1 }}
                    fullWidth
                  />
                  <TextField
                    label="Notes (Optional)"
                    value={selectedNotes}
                    onChange={(e) => setSelectedNotes(e.target.value)}
                    fullWidth
                  />
                </Box>

                <Button
                  startIcon={<AddIcon />}
                  variant="outlined"
                  onClick={handleAddItem}
                  disabled={selectedSource === "warehouse" ? (!selectedId || selectedQuantity < 1) : (!externalName || selectedQuantity < 1)}
                >
                  Add Item
                </Button>
              </Box>

              {/* Used Items Summary */}
              {usedItems.length > 0 && (
                <TableContainer sx={{ mt: 3 }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ bgcolor: "grey.100" }}>
                        <TableCell>Item</TableCell>
                        <TableCell>Source</TableCell>
                        <TableCell align="right">Qty</TableCell>
                        <TableCell align="right">Total</TableCell>
                        <TableCell align="center">Action</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {usedItems.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell>{item.name}</TableCell>
                          <TableCell>
                            <Chip size="small" label={item.source === "warehouse" ? "Warehouse" : "External"} color={item.source === "warehouse" ? "primary" : "warning"} />
                          </TableCell>
                          <TableCell align="right">{item.quantityUsed}</TableCell>
                          <TableCell align="right">₹{((item.price || 0) * item.quantityUsed).toFixed(2)}</TableCell>
                          <TableCell align="center">
                            <IconButton size="small" color="error" onClick={() => handleRemoveItem(index)}>
                              <DeleteIcon />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </CardContent>
          </Card>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button onClick={handleConfirm} variant="contained" disabled={loading}>
          {loading ? "Saving..." : "Save Freelancer Work"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default RecordFreelancerWorkDialog;
