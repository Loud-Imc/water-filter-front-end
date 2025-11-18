import React, { useState } from "react";
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
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import type { Product, SparePart } from "../../types";

interface UsedItem {
  id: string;
  type: "product" | "sparePart";
  quantityUsed: number;
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
  loading?: boolean;
}

const AddUsedProductsDialog: React.FC<AddUsedProductsDialogProps> = ({
  open,
  onClose,
  onConfirm,
  allProducts,
  allSpareParts,
  loading = false,
}) => {
  const [usedItems, setUsedItems] = useState<UsedItem[]>([]);
  const [selectType, setSelectType] = useState<"product" | "sparePart">(
    "product"
  );
  const [selectedId, setSelectedId] = useState("");
  const [selectedQuantity, setSelectedQuantity] = useState<number>(1);
  const [selectedNotes, setSelectedNotes] = useState("");

  const handleSelectTypeChange = (event: SelectChangeEvent) => {
    setSelectType(event.target.value as "product" | "sparePart");
    setSelectedId("");
  };

  const handleAddItem = () => {
    if (!selectedId || selectedQuantity < 1) return;

    if (
      usedItems.some(
        (item) => item.id === selectedId && item.type === selectType
      )
    ) {
      alert(
        `This ${
          selectType === "product" ? "product" : "spare part"
        } is already added`
      );
      return;
    }

    const list = selectType === "product" ? allProducts : allSpareParts;
    const selectedItem = list.find((item) => item.id === selectedId);
    if (!selectedItem) return;

    const newItem: UsedItem = {
      id: selectedId,
      type: selectType,
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

  const handleRemoveItem = (id: string, type: "product" | "sparePart") => {
    setUsedItems(
      usedItems.filter((item) => !(item.id === id && item.type === type))
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
              (item) => (
                <MenuItem key={item.id} value={item.id}>
                  {item.name} (Stock: {item.stock}, Price: ₹
                  {Number(item.price).toFixed(2)})
                </MenuItem>
              )
            )}
          </TextField>

          {/* Quantity Input */}
          <TextField
            type="number"
            fullWidth
            label="Quantity Used *"
            value={selectedQuantity}
            onChange={(e) =>
              setSelectedQuantity(Math.max(1, Number(e.target.value)))
            }
            inputProps={{ min: 1 }}
            disabled={loading}
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
            disabled={!selectedId || selectedQuantity < 1 || loading}
          >
            Add
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
                        <TableCell align="right">Qty</TableCell>
                        <TableCell align="right">Price</TableCell>
                        <TableCell align="right">Total</TableCell>
                        <TableCell align="center">Action</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {usedItems.map((item) => (
                        <TableRow key={`${item.type}-${item.id}`}>
                          <TableCell>
                            {item.type === "product" ? "Product" : "Spare Part"}
                          </TableCell>
                          <TableCell>{item.name}</TableCell>
                          <TableCell align="right">
                            {item.quantityUsed}
                          </TableCell>
                          <TableCell align="right">
                            ₹{item.price?.toFixed(2)}
                          </TableCell>
                          <TableCell align="right">
                            ₹
                            {((item.price || 0) * item.quantityUsed).toFixed(2)}
                          </TableCell>
                          <TableCell align="center">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() =>
                                handleRemoveItem(item.id, item.type)
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
