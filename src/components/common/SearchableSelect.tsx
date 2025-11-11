import React, { useState, useEffect } from "react";
import {
  Autocomplete,
  TextField,
  CircularProgress,
  Box,
  Typography,
  InputAdornment,
} from "@mui/material";
import LockIcon from "@mui/icons-material/Lock";
import { debounce } from "lodash";
import { axiosInstance } from "../../api/axios";

interface Option {
  id: string;
  name: string;
  [key: string]: any;
}

interface SearchableSelectProps {
  label: string;
  value: string | null;
  onChange: (value: string | null, option?: Option | null) => void;
  endpoint: string;
  placeholder?: string;
  disabled?: boolean;
  readOnly?: boolean;
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
  placeholder = "Search...",
  disabled = false,
  readOnly = false,
  error = false,
  helperText = "",
  filters = {},
  renderOption,
}) => {
  const [options, setOptions] = useState<Option[]>([]);
  const [loading, setLoading] = useState(false);
  const [inputValue, setInputValue] = useState("");
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
      console.error("Error fetching options:", error);
      setOptions([]);
    } finally {
      setLoading(false);
    }
  }, 300);

  // ✅ Load selected value when value prop changes
  useEffect(() => {
    const loadSelected = async () => {
      if (!value) {
        setSelectedOption(null);
        return;
      }

      // Skip if already loaded
      if (selectedOption?.id === value) {
        return;
      }

      try {
        // Check if it's in current options
        const existingOption = options.find((opt) => opt.id === value);
        if (existingOption) {
          setSelectedOption(existingOption);
          return;
        }

        // Fetch from API if not found
        const baseEndpoint = endpoint.replace("/search", "");
        const response = await axiosInstance.get(`${baseEndpoint}/${value}`);
        setSelectedOption(response.data);
      } catch (error) {
        console.error("Error loading selected value:", error);
      }
    };

    loadSelected();
  }, [value, endpoint]);

  // ✅ FIXED: Fetch options when user types (works in both normal and pre-filled mode)
  useEffect(() => {
    if (inputValue && !readOnly) {
      fetchOptions(inputValue);
    }
  }, [inputValue, readOnly]); // ✅ Removed !value condition

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

  // ✅ When readOnly, show only selected option
  const displayOptions = readOnly
    ? selectedOption
      ? [selectedOption]
      : []
    : options;
  return (
    <Autocomplete
      value={selectedOption}
      onChange={(_, newValue) => {
        if (!readOnly) {
          setSelectedOption(newValue);
          onChange(newValue?.id || null, newValue);
        }
      }}
      inputValue={inputValue}
      onInputChange={(_, newInputValue) => {
        if (!readOnly) {
          setInputValue(newInputValue);
        }
      }}
      options={displayOptions}
      filterOptions={(x) => x} // 👈 disables internal filtering
      getOptionLabel={(opt) => opt.name || opt.primaryPhone || ""}
      loading={loading}
      disabled={disabled}
      open={readOnly ? false : undefined}
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
            readOnly: readOnly,
            startAdornment: readOnly ? (
              <InputAdornment position="start">
                <LockIcon sx={{ color: "text.secondary", fontSize: 20 }} />
              </InputAdornment>
            ) : (
              params.InputProps.startAdornment
            ),
            endAdornment: (
              <>
                {loading ? <CircularProgress size={20} /> : null}
                {params.InputProps.endAdornment}
              </>
            ),
            sx: {
              "& .MuiInputBase-input": {
                color: readOnly ? "text.primary" : undefined,
                cursor: readOnly ? "default" : undefined,
                WebkitTextFillColor: readOnly
                  ? "rgba(0, 0, 0, 0.87)"
                  : undefined,
              },
              "& .MuiInputLabel-root": {
                color: readOnly ? "text.primary" : undefined,
              },
            },
          }}
        />
      )}
      noOptionsText={
        inputValue.length < 2 && !readOnly
          ? "Type at least 2 characters"
          : "No options found"
      }
    />
  );
};
