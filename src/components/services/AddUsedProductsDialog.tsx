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
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import WarehouseIcon from "@mui/icons-material/Warehouse";
import PersonIcon from "@mui/icons-material/Person";
import type { Product, SparePart, TechnicianStock } from "../../types";

interface UsedItem {
  id: string;
  type: "product" | "sparePart";
  quantityUsed: number;
  source: "warehouse" | "technician"; // 🆕 NEW
  notes?: string;
  name?: string;
  price?: number;
}

interface AddUsedProductsDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (usedItems: UsedItem[]) => Promise<void>;
  allProducts: Product[];
  allSpareParts: SparePart[];
  technicianStock: TechnicianStock[]; // 🆕 NEW: Technician's current stock
  loading?: boolean;
}

const AddUsedProductsDialog: React.FC<AddUsedProductsDialogProps> = ({
  open,
  onClose,
  onConfirm,
  allProducts,
  allSpareParts,
  technicianStock,
  loading = false,
}) => {
  const [usedItems, setUsedItems] = useState<UsedItem[]>([]);
  const [selectType, setSelectType] = useState<"product" | "sparePart">("product");
  const [selectedId, setSelectedId] = useState("");
  const [selectedSource, setSelectedSource] = useState<"warehouse" | "technician">("warehouse"); // 🆕 NEW
  const [selectedQuantity, setSelectedQuantity] = useState<number>(1);
  const [selectedNotes, setSelectedNotes] = useState("");
  const [maxQuantity, setMaxQuantity] = useState<number>(0); // 🆕 NEW

  // 🆕 NEW: Calculate max available quantity based on source
  useEffect(() => {
    if (!selectedId) {
      setMaxQuantity(0);
      return;
    }

    if (selectedSource === "warehouse") {
      const list = selectType === "product" ? allProducts : allSpareParts;
      const item = list.find((i) => i.id === selectedId);
      setMaxQuantity(item?.stock || 0);
    } else {
      // Technician stock
      const stockItem = technicianStock.find(
        (s) =>
          (selectType === "product" && s.productId === selectedId) ||
          (selectType === "sparePart" && s.sparePartId === selectedId)
      );
      setMaxQuantity(stockItem?.quantity || 0);
    }
  }, [selectedId, selectedSource, selectType, allProducts, allSpareParts, technicianStock]);

  const handleSelectTypeChange = (event: SelectChangeEvent) => {
    setSelectType(event.target.value as "product" | "sparePart");
    setSelectedId("");
    setSelectedQuantity(1);
  };

  const handleSourceChange = (event: SelectChangeEvent) => {
    setSelectedSource(event.target.value as "warehouse" | "technician");
    setSelectedQuantity(1);
  };

  const handleAddItem = () => {
    if (!selectedId || selectedQuantity < 1) return;

    // Check if already added from same source
    if (
      usedItems.some(
        (item) =>
          item.id === selectedId &&
          item.type === selectType &&
          item.source === selectedSource
      )
    ) {
      alert(
        `This ${
          selectType === "product" ? "product" : "spare part"
        } from ${selectedSource} is already added`
      );
      return;
    }

    // 🆕 Validate quantity doesn't exceed available stock
    if (selectedQuantity > maxQuantity) {
      alert(
        `Quantity exceeds available stock. Maximum available: ${maxQuantity}`
      );
      return;
    }

    const list = selectType === "product" ? allProducts : allSpareParts;
    const selectedItem = list.find((item) => item.id === selectedId);
    if (!selectedItem) return;

    const newItem: UsedItem = {
      id: selectedId,
      type: selectType,
      source: selectedSource, // 🆕 NEW
      quantityUsed: selectedQuantity,
      notes: selectedNotes || undefined,
      name: selectedItem.name,
      price: Number(selectedItem.price),
    };

    setUsedItems([...usedItems, newItem]);
    setSelectedId("");
    setSelectedQuantity(1);
    setSelectedNotes("");
  };

  const handleRemoveItem = (
    id: string,
    type: "product" | "sparePart",
    source: "warehouse" | "technician"
  ) => {
    setUsedItems(
      usedItems.filter(
        (item) => !(item.id === id && item.type === type && item.source === source)
      )
    );
  };

  const handleConfirm = async () => {
    if (usedItems.length === 0) {
      alert("Please add at least one item");
      return;
    }
    try {
      await onConfirm(
        usedItems.map((item) => ({
          id: item.id,
          type: item.type,
          source: item.source, // 🆕 Pass source to backend
          quantityUsed: item.quantityUsed,
          notes: item.notes,
        }))
      );
      setUsedItems([]);
      onClose();
    } catch (error) {
      console.error("Error confirming items:", error);
    }
  };

  const totalCost = usedItems.reduce(
    (sum, item) => sum + (item.price || 0) * item.quantityUsed,
    0
  );

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Add Used Products & Spare Parts</DialogTitle>
      <DialogContent>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3, mt: 2 }}>
          {/* Select Type */}
          <FormControl fullWidth>
            <InputLabel id="select-type-label">Item Type</InputLabel>
            <Select
              labelId="select-type-label"
              value={selectType}
              label="Item Type"
              onChange={handleSelectTypeChange}
              disabled={loading}
            >
              <MenuItem value="product">Product</MenuItem>
              <MenuItem value="sparePart">Spare Part</MenuItem>
            </Select>
          </FormControl>

          {/* 🆕 NEW: Source Selection */}
          <FormControl fullWidth>
            <InputLabel id="select-source-label">Stock Source</InputLabel>
            <Select
              labelId="select-source-label"
              value={selectedSource}
              label="Stock Source"
              onChange={handleSourceChange}
              disabled={loading}
            >
              <MenuItem value="warehouse">
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <WarehouseIcon fontSize="small" />
                  Warehouse Stock
                </Box>
              </MenuItem>
              <MenuItem value="technician">
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <PersonIcon fontSize="small" />
                  My Stock
                </Box>
              </MenuItem>
            </Select>
          </FormControl>

          {/* Item Selector */}
          <TextField
            select
            fullWidth
            label={`Select ${
              selectType === "product" ? "Product" : "Spare Part"
            } *`}
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
            disabled={loading}
          >
            <MenuItem value="">-- Choose --</MenuItem>
            {(selectType === "product" ? allProducts : allSpareParts)?.map(
              (item) => {
                // 🆕 Show available quantity from selected source
                let availableQty = 0;
                if (selectedSource === "warehouse") {
                  availableQty = item.stock;
                } else {
                  const stockItem = technicianStock?.find(
                    (s) =>
                      (selectType === "product" && s.productId === item.id) ||
                      (selectType === "sparePart" && s.sparePartId === item.id)
                  );
                  availableQty = stockItem?.quantity || 0;
                }

                return (
                  <MenuItem key={item.id} value={item.id} disabled={availableQty === 0}>
                    {item.name} (Available: {availableQty}, Price: ₹
                    {Number(item.price).toFixed(2)})
                  </MenuItem>
                );
              }
            )}
          </TextField>

          {/* 🆕 Show available quantity alert */}
          {selectedId && (
            <Alert severity="info">
              Maximum available from{" "}
              {selectedSource === "warehouse" ? "warehouse" : "your stock"}:{" "}
              <strong>{maxQuantity} units</strong>
            </Alert>
          )}

          {/* Quantity Input */}
          <TextField
            type="number"
            fullWidth
            label="Quantity Used *"
            value={selectedQuantity}
            onChange={(e) =>
              setSelectedQuantity(
                Math.min(maxQuantity, Math.max(1, Number(e.target.value)))
              )
            }
            inputProps={{ min: 1, max: maxQuantity }}
            disabled={loading || !selectedId}
            helperText={
              selectedId ? `Max available: ${maxQuantity}` : ""
            }
          />

          {/* Notes */}
          <TextField
            fullWidth
            multiline
            rows={2}
            label="Notes (Optional)"
            value={selectedNotes}
            onChange={(e) => setSelectedNotes(e.target.value)}
            placeholder="e.g., Installed filter, replaced valve..."
            disabled={loading}
          />

          {/* Add Button */}
          <Button
            startIcon={<AddIcon />}
            variant="contained"
            onClick={handleAddItem}
            disabled={
              !selectedId || selectedQuantity < 1 || selectedQuantity > maxQuantity || loading
            }
          >
            Add Item
          </Button>

          {/* Summary List */}
          {usedItems.length > 0 && (
            <Card>
              <CardContent>
                <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                  Items Added ({usedItems.length})
                </Typography>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ bgcolor: "grey.100" }}>
                        <TableCell>Type</TableCell>
                        <TableCell>Name</TableCell>
                        <TableCell>Source</TableCell>
                        <TableCell align="right">Qty</TableCell>
                        <TableCell align="right">Price</TableCell>
                        <TableCell align="right">Total</TableCell>
                        <TableCell align="center">Action</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {usedItems.map((item, index) => (
                        <TableRow key={`${item.type}-${item.id}-${item.source}-${index}`}>
                          <TableCell>
                            {item.type === "product" ? "Product" : "Spare Part"}
                          </TableCell>
                          <TableCell>{item.name}</TableCell>
                          <TableCell>
                            {/* 🆕 Show source as chip */}
                            <Chip
                              size="small"
                              icon={
                                item.source === "warehouse" ? (
                                  <WarehouseIcon />
                                ) : (
                                  <PersonIcon />
                                )
                              }
                              label={
                                item.source === "warehouse"
                                  ? "Warehouse"
                                  : "Tech Stock"
                              }
                              color={
                                item.source === "warehouse" ? "primary" : "secondary"
                              }
                            />
                          </TableCell>
                          <TableCell align="right">{item.quantityUsed}</TableCell>
                          <TableCell align="right">₹{item.price?.toFixed(2)}</TableCell>
                          <TableCell align="right">
                            ₹{((item.price || 0) * item.quantityUsed).toFixed(2)}
                          </TableCell>
                          <TableCell align="center">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() =>
                                handleRemoveItem(item.id, item.type, item.source)
                              }
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
                <Box sx={{ mt: 2, textAlign: "right" }}>
                  <Typography variant="subtitle1" fontWeight={600}>
                    Total Cost: ₹{totalCost.toFixed(2)}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          )}

          {/* Alert if no items */}
          {usedItems.length === 0 && (
            <Alert severity="info">
              No items added yet. Add at least one item to proceed.
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
          disabled={usedItems.length === 0 || loading}
        >
          {loading ? "Saving..." : "Confirm & Save"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddUsedProductsDialog;
