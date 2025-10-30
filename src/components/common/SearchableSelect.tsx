import React, { useState, useEffect } from 'react';
import {
  Autocomplete,
  TextField,
  CircularProgress,
  Box,
  Typography,
} from '@mui/material';
import { debounce } from 'lodash';
import { axiosInstance } from '../../api/axios';

interface Option {
  id: string;
  name: string;
  [key: string]: any;
}

interface SearchableSelectProps {
  label: string;
  value: string | null;
  onChange: (value: string | null) => void;
  endpoint: string;
  placeholder?: string;
  disabled?: boolean;
  error?: boolean;
  helperText?: string;
  filters?: Record<string, any>;
  renderOption?: (option: Option) => React.ReactNode;
}

export const SearchableSelect: React.FC<SearchableSelectProps> = ({
  label,
  value,
  onChange,
  endpoint,
  placeholder = 'Search...',
  disabled = false,
  error = false,
  helperText = '',
  filters = {},
  renderOption,
}) => {
  const [options, setOptions] = useState<Option[]>([]);
  const [loading, setLoading] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [selectedOption, setSelectedOption] = useState<Option | null>(null);

  // Fetch options when input changes
  const fetchOptions = debounce(async (query: string) => {
    if (!query || query.length < 2) {
      setOptions([]);
      return;
    }

    setLoading(true);
    try {
      const params = { query, ...filters, limit: 50 };
      const response = await axiosInstance.get(endpoint, { params });
      setOptions(response.data);
    } catch (error) {
      console.error('Error fetching options:', error);
      setOptions([]);
    } finally {
      setLoading(false);
    }
  }, 300);

  // Fetch initial selected value
  useEffect(() => {
    if (value && !selectedOption) {
      const loadSelected = async () => {
        try {
          // Extract endpoint base (remove /search)
          // ✅ FIXED: Use axiosInstance instead of api
          const response = await axiosInstance.get(`${endpoint}/${value}`);
          setSelectedOption(response.data);
        } catch (error) {
          console.error('Error loading selected value:', error);
        }
      };
      loadSelected();
    }
  }, [value, endpoint, selectedOption]);

  useEffect(() => {
    if (inputValue) {
      fetchOptions(inputValue);
    }
  }, [inputValue, JSON.stringify(filters)]); // Stringify filters to compare properly

  const defaultRenderOption = (option: Option) => (
    <Box>
      <Typography variant="body1">{option.name}</Typography>
      {option.region && (
        <Typography variant="caption" color="text.secondary">
          {option.region.name}
        </Typography>
      )}
    </Box>
  );

  return (
    <Autocomplete
      value={selectedOption}
      onChange={(_, newValue) => {
        setSelectedOption(newValue);
        onChange(newValue?.id || null);
      }}
      inputValue={inputValue}
      onInputChange={(_, newInputValue) => {
        setInputValue(newInputValue);
      }}
      options={options}
      getOptionLabel={(option) => option.name || ''}
      loading={loading}
      disabled={disabled}
      isOptionEqualToValue={(option, value) => option.id === value.id}
      renderOption={(props, option) => {
        const { key, ...otherProps } = props as any;
        return (
          <li key={option.id} {...otherProps}>
            {renderOption ? renderOption(option) : defaultRenderOption(option)}
          </li>
        );
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          placeholder={placeholder}
          error={error}
          helperText={helperText}
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <>
                {loading ? <CircularProgress size={20} /> : null}
                {params.InputProps.endAdornment}
              </>
            ),
          }}
        />
      )}
      noOptionsText={
        inputValue.length < 2
          ? 'Type at least 2 characters'
          : 'No options found'
      }
    />
  );
};
