import React, { useEffect, useState } from "react";
import {
    Box,
    Card,
    CardContent,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Tabs,
    Tab,
    Alert,
    IconButton,
    Chip,
    useTheme,
    useMediaQuery,
    Divider,
    Stack,
    Grid,
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import InventoryIcon from "@mui/icons-material/Inventory";
import HistoryIcon from "@mui/icons-material/History";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import EmptyState from "../../components/common/EmptyState";
import { technicianStockService } from "../../api/services/technicianStockService";
import { TechnicianStock } from "../../types";
import { formatDate } from "../../utils/helpers";

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => {
    return (
        <div role="tabpanel" hidden={value !== index}>
            {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
        </div>
    );
};

// 📱 Mobile Card Component for Products
const ProductCard: React.FC<{ item: TechnicianStock }> = ({ item }) => (
    <Card variant="outlined" sx={{ mb: 2 }}>
        <CardContent>
            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                <Typography variant="h6" fontWeight={600} sx={{ flex: 1 }}>
                    {item.product?.name || "N/A"}
                </Typography>
                <Chip label={`Qty: ${item.quantity}`} color="primary" size="small" />
            </Box>

            <Divider sx={{ my: 1.5 }} />

            <Stack spacing={1}>
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                    <Typography variant="body2" color="text.secondary">
                        Company:
                    </Typography>
                    <Typography variant="body2" fontWeight={500}>
                        {item.product?.company || "N/A"}
                    </Typography>
                </Box>

                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                    <Typography variant="body2" color="text.secondary">
                        SKU:
                    </Typography>
                    <Typography variant="body2" fontWeight={500}>
                        {item.product?.sku || "N/A"}
                    </Typography>
                </Box>

                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                    <Typography variant="body2" color="text.secondary">
                        Unit Price:
                    </Typography>
                    <Typography variant="body2" fontWeight={500}>
                        ₹{item.product?.price?.toFixed(2) || "0.00"}
                    </Typography>
                </Box>

                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                    <Typography variant="body2" color="text.secondary">
                        Total Value:
                    </Typography>
                    <Typography variant="body2" fontWeight={700} color="primary">
                        ₹{((item.product?.price || 0) * item.quantity).toFixed(2)}
                    </Typography>
                </Box>

                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                    <Typography variant="body2" color="text.secondary">
                        Last Updated:
                    </Typography>
                    <Typography variant="body2">
                        {formatDate(item.updatedAt)}
                    </Typography>
                </Box>
            </Stack>
        </CardContent>
    </Card>
);

// 📱 Mobile Card Component for Spare Parts
const SparePartCard: React.FC<{ item: TechnicianStock }> = ({ item }) => (
    <Card variant="outlined" sx={{ mb: 2 }}>
        <CardContent>
            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                <Typography variant="h6" fontWeight={600} sx={{ flex: 1 }}>
                    {item.sparePart?.name || "N/A"}
                </Typography>
                <Chip
                    label={`Qty: ${item.quantity}`}
                    color="secondary"
                    size="small"
                />
            </Box>

            <Divider sx={{ my: 1.5 }} />

            <Stack spacing={1}>
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                    <Typography variant="body2" color="text.secondary">
                        Company:
                    </Typography>
                    <Typography variant="body2" fontWeight={500}>
                        {item.sparePart?.company || "N/A"}
                    </Typography>
                </Box>

                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                    <Typography variant="body2" color="text.secondary">
                        SKU:
                    </Typography>
                    <Typography variant="body2" fontWeight={500}>
                        {item.sparePart?.sku || "N/A"}
                    </Typography>
                </Box>

                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                    <Typography variant="body2" color="text.secondary">
                        Group:
                    </Typography>
                    <Typography variant="body2" fontWeight={500}>
                        {item.sparePart?.group?.name || "N/A"}
                    </Typography>
                </Box>

                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                    <Typography variant="body2" color="text.secondary">
                        Unit Price:
                    </Typography>
                    <Typography variant="body2" fontWeight={500}>
                        ₹{item.sparePart?.price?.toFixed(2) || "0.00"}
                    </Typography>
                </Box>

                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                    <Typography variant="body2" color="text.secondary">
                        Total Value:
                    </Typography>
                    <Typography variant="body2" fontWeight={700} color="secondary">
                        ₹{((item.sparePart?.price || 0) * item.quantity).toFixed(2)}
                    </Typography>
                </Box>

                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                    <Typography variant="body2" color="text.secondary">
                        Last Updated:
                    </Typography>
                    <Typography variant="body2">
                        {formatDate(item.updatedAt)}
                    </Typography>
                </Box>
            </Stack>
        </CardContent>
    </Card>
);

const MyStocks: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [stockData, setStockData] = useState<TechnicianStock[]>([]);
    const [historyData, setHistoryData] = useState<any[]>([]); // ✅ NEW
    const [tabValue, setTabValue] = useState(0);

    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("md"));

    const fetchStockData = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await technicianStockService.getMyStock();
            setStockData(data);
        } catch (err: any) {
            console.error("Error fetching stock:", err);
            setError(err.response?.data?.message || "Failed to load stock data");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStockData();
        fetchHistoryData(); // ✅ NEW
    }, []);

    const fetchHistoryData = async () => {
        try {
            const data = await technicianStockService.getMyStockHistory();
            setHistoryData(data);
        } catch (err) {
            console.error("Error fetching history:", err);
        }
    };

    const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
        setTabValue(newValue);
    };

    // Filter stock by type
    const productStock = stockData.filter((item) => item.productId !== null);
    const sparePartStock = stockData.filter((item) => item.sparePartId !== null);

    // Calculate totals
    const totalProductValue = productStock.reduce(
        (sum, item) => sum + (item.product?.price || 0) * item.quantity,
        0
    );
    const totalSparePartValue = sparePartStock.reduce(
        (sum, item) => sum + (item.sparePart?.price || 0) * item.quantity,
        0
    );

    if (loading) {
        return <LoadingSpinner />;
    }

    return (
        <Box>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
                <Typography variant="h4" component="h1" fontWeight={600}>
                    My Stocks
                </Typography>
                <IconButton onClick={fetchStockData} color="primary">
                    <RefreshIcon />
                </IconButton>
            </Box>

            {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                    {error}
                </Alert>
            )}

            <Card>
                <CardContent>
                    <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
                        <Tabs
                            value={tabValue}
                            onChange={handleTabChange}
                            variant={isMobile ? "fullWidth" : "standard"}
                        >
                            <Tab
                                label={
                                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                        Products
                                        <Chip
                                            label={productStock.length}
                                            size="small"
                                            color="primary"
                                        />
                                    </Box>
                                }
                            />
                            <Tab
                                label={
                                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                        Spare Parts
                                        <Chip
                                            label={sparePartStock.length}
                                            size="small"
                                            color="secondary"
                                        />
                                    </Box>
                                }
                            />
                            <Tab
                                label={
                                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                        Transaction History
                                        <HistoryIcon fontSize="small" />
                                    </Box>
                                }
                            />
                        </Tabs>
                    </Box>

                    {/* Products Tab */}
                    <TabPanel value={tabValue} index={0}>
                        {productStock.length === 0 ? (
                            <EmptyState
                                icon={
                                    <InventoryIcon sx={{ fontSize: 80, color: "text.disabled" }} />
                                }
                                title="No Products in Stock"
                                description="You don't have any products assigned to you yet"
                            />
                        ) : (
                            <>
                                {/* 📱 Mobile View - Cards */}
                                {isMobile ? (
                                    <Box>
                                        {productStock.map((item) => (
                                            <ProductCard key={item.id} item={item} />
                                        ))}
                                    </Box>
                                ) : (
                                    /* 💻 Desktop View - Table */
                                    <TableContainer component={Paper} variant="outlined">
                                        <Table>
                                            <TableHead>
                                                <TableRow sx={{ bgcolor: "grey.100" }}>
                                                    <TableCell>
                                                        <strong>Product Name</strong>
                                                    </TableCell>
                                                    <TableCell>
                                                        <strong>Company</strong>
                                                    </TableCell>
                                                    <TableCell>
                                                        <strong>SKU</strong>
                                                    </TableCell>
                                                    <TableCell align="right">
                                                        <strong>Quantity</strong>
                                                    </TableCell>
                                                    <TableCell align="right">
                                                        <strong>Price</strong>
                                                    </TableCell>
                                                    <TableCell align="right">
                                                        <strong>Total Value</strong>
                                                    </TableCell>
                                                    <TableCell>
                                                        <strong>Last Updated</strong>
                                                    </TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {productStock.map((item) => (
                                                    <TableRow key={item.id} hover>
                                                        <TableCell>{item.product?.name || "N/A"}</TableCell>
                                                        <TableCell>
                                                            {item.product?.company || "N/A"}
                                                        </TableCell>
                                                        <TableCell>{item.product?.sku || "N/A"}</TableCell>
                                                        <TableCell align="right">
                                                            <Chip label={item.quantity} size="small" />
                                                        </TableCell>
                                                        <TableCell align="right">
                                                            ₹{item.product?.price?.toFixed(2) || "0.00"}
                                                        </TableCell>
                                                        <TableCell align="right">
                                                            <strong>
                                                                ₹
                                                                {(
                                                                    (item.product?.price || 0) * item.quantity
                                                                ).toFixed(2)}
                                                            </strong>
                                                        </TableCell>
                                                        <TableCell>{formatDate(item.updatedAt)}</TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                )}

                                <Box
                                    sx={{
                                        mt: 2,
                                        p: 2,
                                        bgcolor: "primary.light",
                                        borderRadius: 1,
                                    }}
                                >
                                    <Grid container spacing={2}>
                                        <Grid size={{ xs: 6 }}>
                                            <Typography variant="body2" color="text.secondary">
                                                Total Products
                                            </Typography>
                                            <Typography variant="h6" fontWeight={600}>
                                                {productStock.length}
                                            </Typography>
                                        </Grid>
                                        <Grid size={{ xs: 6 }}>
                                            <Typography variant="body2" color="text.secondary">
                                                Total Value
                                            </Typography>
                                            <Typography variant="h6" fontWeight={600}>
                                                ₹{totalProductValue.toFixed(2)}
                                            </Typography>
                                        </Grid>
                                    </Grid>
                                </Box>
                            </>
                        )}
                    </TabPanel>

                    {/* Spare Parts Tab */}
                    <TabPanel value={tabValue} index={1}>
                        {sparePartStock.length === 0 ? (
                            <EmptyState
                                icon={
                                    <InventoryIcon sx={{ fontSize: 80, color: "text.disabled" }} />
                                }
                                title="No Spare Parts in Stock"
                                description="You don't have any spare parts assigned to you yet"
                            />
                        ) : (
                            <>
                                {/* 📱 Mobile View - Cards */}
                                {isMobile ? (
                                    <Box>
                                        {sparePartStock.map((item) => (
                                            <SparePartCard key={item.id} item={item} />
                                        ))}
                                    </Box>
                                ) : (
                                    /* 💻 Desktop View - Table */
                                    <TableContainer component={Paper} variant="outlined">
                                        <Table>
                                            <TableHead>
                                                <TableRow sx={{ bgcolor: "grey.100" }}>
                                                    <TableCell>
                                                        <strong>Part Name</strong>
                                                    </TableCell>
                                                    <TableCell>
                                                        <strong>Company</strong>
                                                    </TableCell>
                                                    <TableCell>
                                                        <strong>SKU</strong>
                                                    </TableCell>
                                                    <TableCell>
                                                        <strong>Group</strong>
                                                    </TableCell>
                                                    <TableCell align="right">
                                                        <strong>Quantity</strong>
                                                    </TableCell>
                                                    <TableCell align="right">
                                                        <strong>Price</strong>
                                                    </TableCell>
                                                    <TableCell align="right">
                                                        <strong>Total Value</strong>
                                                    </TableCell>
                                                    <TableCell>
                                                        <strong>Last Updated</strong>
                                                    </TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {sparePartStock.map((item) => (
                                                    <TableRow key={item.id} hover>
                                                        <TableCell>
                                                            {item.sparePart?.name || "N/A"}
                                                        </TableCell>
                                                        <TableCell>
                                                            {item.sparePart?.company || "N/A"}
                                                        </TableCell>
                                                        <TableCell>
                                                            {item.sparePart?.sku || "N/A"}
                                                        </TableCell>
                                                        <TableCell>
                                                            {item.sparePart?.group?.name || "N/A"}
                                                        </TableCell>
                                                        <TableCell align="right">
                                                            <Chip label={item.quantity} size="small" />
                                                        </TableCell>
                                                        <TableCell align="right">
                                                            ₹{item.sparePart?.price?.toFixed(2) || "0.00"}
                                                        </TableCell>
                                                        <TableCell align="right">
                                                            <strong>
                                                                ₹
                                                                {(
                                                                    (item.sparePart?.price || 0) * item.quantity
                                                                ).toFixed(2)}
                                                            </strong>
                                                        </TableCell>
                                                        <TableCell>{formatDate(item.updatedAt)}</TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                )}

                                <Box
                                    sx={{
                                        mt: 2,
                                        p: 2,
                                        bgcolor: "secondary.light",
                                        borderRadius: 1,
                                    }}
                                >
                                    <Grid container spacing={2}>
                                        <Grid size={{ xs: 6 }}>
                                            <Typography variant="body2" color="text.secondary">
                                                Total Spare Parts
                                            </Typography>
                                            <Typography variant="h6" fontWeight={600}>
                                                {sparePartStock.length}
                                            </Typography>
                                        </Grid>
                                        <Grid size={{ xs: 6 }}>
                                            <Typography variant="body2" color="text.secondary">
                                                Total Value
                                            </Typography>
                                            <Typography variant="h6" fontWeight={600}>
                                                ₹{totalSparePartValue.toFixed(2)}
                                            </Typography>
                                        </Grid>
                                    </Grid>
                                </Box>
                            </>
                        )}
                    </TabPanel>

                    {/* History Tab */}
                    <TabPanel value={tabValue} index={2}>
                        {historyData.length === 0 ? (
                            <EmptyState
                                icon={<HistoryIcon sx={{ fontSize: 80, color: "text.disabled" }} />}
                                title="No History Found"
                                description="You don't have any stock transactions yet"
                            />
                        ) : (
                            <TableContainer component={Paper} variant="outlined">
                                <Table>
                                    <TableHead>
                                        <TableRow sx={{ bgcolor: "grey.100" }}>
                                            <TableCell>Date</TableCell>
                                            <TableCell>Item</TableCell>
                                            <TableCell>Type</TableCell>
                                            <TableCell align="right">Quantity</TableCell>
                                            <TableCell>Notes</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {historyData.map((tx) => (
                                            <TableRow key={tx.id} hover>
                                                <TableCell>{formatDate(tx.createdAt)}</TableCell>
                                                <TableCell>
                                                    <Typography variant="body2" fontWeight={600}>
                                                        {tx.product?.name || tx.sparePart?.name}
                                                    </Typography>
                                                    <Typography variant="caption" color="text.secondary">
                                                        {tx.product ? 'Product' : 'Spare Part'}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell>
                                                    <Chip 
                                                        label={tx.type} 
                                                        size="small"
                                                        color={
                                                            tx.type === 'ISSUE' ? 'success' :
                                                            tx.type === 'RETURN' ? 'warning' : 'error'
                                                        }
                                                        variant="outlined"
                                                    />
                                                </TableCell>
                                                <TableCell align="right">
                                                    <Typography 
                                                        variant="body2" 
                                                        fontWeight={700}
                                                        color={tx.quantity > 0 ? 'success.main' : 'error.main'}
                                                    >
                                                        {tx.quantity > 0 ? `+${tx.quantity}` : tx.quantity}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell>{tx.notes}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        )}
                    </TabPanel>
                </CardContent>
            </Card>
        </Box>
    );
};

export default MyStocks;
