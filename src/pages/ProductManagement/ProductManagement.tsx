import React, { useState } from 'react';
import { Box, Typography, Tabs, Tab } from '@mui/material';
import { usePermission } from '../../hooks/usePermission';
import { PERMISSIONS } from '../../constants/permissions';
import ProductsTab from './tabs/ProductsTab';
import SparePartsTab from './tabs/SparePartsTab';
import AssemblyTab from './tabs/AssemblyTab';
import SettingsTab from './tabs/SettingsTab';
import TechnicianStockTab from './tabs/TechnicianStockTab';
import { useLocation } from 'react-router-dom';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`product-tabpanel-${index}`}
      aria-labelledby={`product-tab-${index}`}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
};

const ProductManagement: React.FC = () => {
  const location = useLocation();
  const { hasPermission } = usePermission();

  const canViewProducts = hasPermission(PERMISSIONS.PRODUCTS_VIEW);
  const canViewSpareParts = hasPermission(PERMISSIONS.SPARE_PARTS_VIEW);
  const canViewAssembly = hasPermission(PERMISSIONS.ASSEMBLY_VIEW);
  const canViewStockHistory = hasPermission(PERMISSIONS.STOCK_VIEW); // ✅ NEW
  const canManageSettings = hasPermission(PERMISSIONS.PRODUCTS_UPDATE);

  // Build tabs dynamically to ensure correct indexing
  const tabs: { label: string; component: React.ReactNode }[] = [];
  if (canViewProducts) tabs.push({ label: 'Products', component: <ProductsTab /> });
  if (canViewSpareParts) tabs.push({ label: 'Spare Parts', component: <SparePartsTab /> });
  if (canViewAssembly) tabs.push({ label: 'Assembly', component: <AssemblyTab /> });
  if (canViewStockHistory) tabs.push({ label: 'Technician Stock', component: <TechnicianStockTab /> }); // ✅ NEW
  if (canManageSettings) tabs.push({ label: 'Settings', component: <SettingsTab /> });

  const searchParams = new URLSearchParams(location.search);
  const tabParam = searchParams.get('tab');

  const [activeTab, setActiveTab] = useState(() => {
    if (tabParam && tabs.length > 0) {
      const index = tabs.findIndex(t => t.label.toLowerCase() === tabParam.toLowerCase());
      return index >= 0 ? index : 0;
    }
    return 0;
  });

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  if (tabs.length === 0) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h6" color="error">
          You don't have permission to access Product Management
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" component="h1" fontWeight={700}>
          Product Management
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Manage products, spare parts, assembly templates, and technician inventory
        </Typography>
      </Box>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          aria-label="product management tabs"
          variant="scrollable"
          scrollButtons="auto"
        >
          {tabs.map((tab, i) => (
            <Tab key={i} label={tab.label} />
          ))}
        </Tabs>
      </Box>

      {/* Tab Panels */}
      {tabs.map((tab, i) => (
        <TabPanel key={i} value={activeTab} index={i}>
          {tab.component}
        </TabPanel>
      ))}
    </Box>
  );
};

export default ProductManagement;
