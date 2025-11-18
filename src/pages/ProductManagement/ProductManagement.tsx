import React, { useState } from 'react';
import { Box, Typography, Tabs, Tab } from '@mui/material';
import { usePermission } from '../../hooks/usePermission';
import { PERMISSIONS } from '../../constants/permissions';
import ProductsTab from './tabs/ProductsTab'; 
import SparePartsTab from './tabs/SparePartsTab';
import AssemblyTab from './tabs/AssemblyTab';
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

  // Build tabs based on permissions
  const tabs:any = [];
  if (canViewProducts) tabs.push({ label: 'Products', index: 0 });
  if (canViewSpareParts) tabs.push({ label: 'Spare Parts', index: canViewProducts ? 1 : 0 });
  if (canViewAssembly) {
    let assemblyIndex = 0;
    if (canViewProducts && canViewSpareParts) assemblyIndex = 2;
    else if (canViewProducts || canViewSpareParts) assemblyIndex = 1;
    tabs.push({ label: 'Assembly', index: assemblyIndex });
  }

  const tabLabelToIndex = (label: string, tabsArray: { label: string; index: number }[]) => {
    const found = tabsArray.find((t) => t.label.toLowerCase() === label.toLowerCase());
    return found ? found.index : 0;
  };

  const searchParams = new URLSearchParams(location.search);
  const tabParam = searchParams.get('tab');

  const [activeTab, setActiveTab] = useState(() => {
    if (tabParam && tabs.length > 0) {
      return tabLabelToIndex(tabParam, tabs);
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
          Manage products, spare parts, and assembly templates
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
          {canViewProducts && <Tab label="Products" />}
          {canViewSpareParts && <Tab label="Spare Parts" />}
          {canViewAssembly && <Tab label="Assembly" />}
        </Tabs>
      </Box>

      {/* Tab Panels */}
      {canViewProducts && (
        <TabPanel value={activeTab} index={0}>
          <ProductsTab />
        </TabPanel>
      )}

      {canViewSpareParts && (
        <TabPanel value={activeTab} index={canViewProducts ? 1 : 0}>
          <SparePartsTab />
        </TabPanel>
      )}

      {canViewAssembly && (
        <TabPanel
          value={activeTab}
          index={
            canViewProducts && canViewSpareParts
              ? 2
              : canViewProducts || canViewSpareParts
              ? 1
              : 0
          }
        >
          <AssemblyTab />
        </TabPanel>
      )}
    </Box>
  );
};

export default ProductManagement;
