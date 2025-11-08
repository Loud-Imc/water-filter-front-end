import React, { useState } from 'react';
import {
  Box,
  Card,
  TextField,
  Button,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';

interface ProductFiltersProps {
  onFilter: (filters: any) => void;
  companies?: string[];
}

const ProductFilters: React.FC<ProductFiltersProps> = ({ onFilter, companies = [] }) => {
  const [filters, setFilters] = useState({
    searchTerm: '',
    company: '',
    minPrice: '',
    maxPrice: '',
    minStock: '',
    maxStock: '',
    sortBy: 'name',
    sortOrder: 'asc',
    lowStockOnly: false,
  });

  const handleFilter = () => {
    onFilter({
      ...filters,
      minPrice: filters.minPrice ? Number(filters.minPrice) : undefined,
      maxPrice: filters.maxPrice ? Number(filters.maxPrice) : undefined,
      minStock: filters.minStock ? Number(filters.minStock) : undefined,
      maxStock: filters.maxStock ? Number(filters.maxStock) : undefined,
    });
  };

  const handleReset = () => {
    setFilters({
      searchTerm: '',
      company: '',
      minPrice: '',
      maxPrice: '',
      minStock: '',
      maxStock: '',
      sortBy: 'name',
      sortOrder: 'asc',
      lowStockOnly: false,
    });
  };

  return (
    <Card sx={{ p: 2, mb: 2 }}>
      <Stack spacing={2}>
        {/* Search */}
        <TextField
          fullWidth
          placeholder="Search by name or SKU..."
          value={filters.searchTerm}
          onChange={(e) => setFilters({ ...filters, searchTerm: e.target.value })}
          InputProps={{ startAdornment: <SearchIcon sx={{ mr: 1 }} /> }}
        />

        {/* Filters Grid */}
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 2 }}>
          {/* Company */}
          <FormControl fullWidth>
            <InputLabel>Company</InputLabel>
            <Select
              value={filters.company}
              onChange={(e) => setFilters({ ...filters, company: e.target.value })}
              label="Company"
            >
              <MenuItem value="">All</MenuItem>
              {companies.map((company) => (
                <MenuItem key={company} value={company}>
                  {company}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Price Range */}
          <TextField
            type="number"
            label="Min Price"
            value={filters.minPrice}
            onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
          />
          <TextField
            type="number"
            label="Max Price"
            value={filters.maxPrice}
            onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
          />

          {/* Stock Range */}
          <TextField
            type="number"
            label="Min Stock"
            value={filters.minStock}
            onChange={(e) => setFilters({ ...filters, minStock: e.target.value })}
          />
          <TextField
            type="number"
            label="Max Stock"
            value={filters.maxStock}
            onChange={(e) => setFilters({ ...filters, maxStock: e.target.value })}
          />

          {/* Sort */}
          <FormControl fullWidth>
            <InputLabel>Sort By</InputLabel>
            <Select
              value={filters.sortBy}
              onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
              label="Sort By"
            >
              <MenuItem value="name">Name</MenuItem>
              <MenuItem value="price">Price</MenuItem>
              <MenuItem value="stock">Stock</MenuItem>
            </Select>
          </FormControl>

          <FormControl fullWidth>
            <InputLabel>Order</InputLabel>
            <Select
              value={filters.sortOrder}
              onChange={(e) => setFilters({ ...filters, sortOrder: e.target.value })}
              label="Order"
            >
              <MenuItem value="asc">Ascending</MenuItem>
              <MenuItem value="desc">Descending</MenuItem>
            </Select>
          </FormControl>
        </Box>

        {/* Action Buttons */}
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="contained"
            startIcon={<FilterListIcon />}
            onClick={handleFilter}
          >
            Apply Filters
          </Button>
          <Button variant="outlined" onClick={handleReset}>
            Reset
          </Button>
        </Box>
      </Stack>
    </Card>
  );
};

export default ProductFilters;
