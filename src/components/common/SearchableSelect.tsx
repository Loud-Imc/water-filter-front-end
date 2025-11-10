import React, { useState, useEffect } from "react";
import {
  Autocomplete,
  TextField,
  CircularProgress,
  Box,
  Typography,
  InputAdornment,
} from "@mui/material";
import LockIcon from "@mui/icons-material/Lock"; // ✅ Import lock icon
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
  readOnly?: boolean; // ✅ NEW: Add readOnly prop
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
  readOnly = false, // ✅ NEW: Default false
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

  // Fetch initial selected value
  useEffect(() => {
    if (value && !selectedOption) {
      const loadSelected = async () => {
        try {
          const existingOption = options.find((opt) => opt.id === value);
          if (existingOption) {
            setSelectedOption(existingOption);
            return;
          }

          const baseEndpoint = endpoint.replace("/search", "");
          const response = await axiosInstance.get(`${baseEndpoint}/${value}`);
          setSelectedOption(response.data);
        } catch (error) {
          console.error("Error loading selected value:", error);
        }
      };
      loadSelected();
    } else if (!value) {
      setSelectedOption(null);
    }
  }, [value, endpoint]);

  useEffect(() => {
    if (inputValue && !readOnly) {
      // ✅ Don't fetch if readOnly
      fetchOptions(inputValue);
    }
  }, [inputValue, JSON.stringify(filters), readOnly]);

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
        if (!readOnly) {
          // ✅ Prevent change if readOnly
          setSelectedOption(newValue);
          onChange(newValue?.id || null, newValue);
        }
      }}
      inputValue={inputValue}
      onInputChange={(_, newInputValue) => {
        if (!readOnly) {
          // ✅ Prevent input change if readOnly
          setInputValue(newInputValue);
        }
      }}
      options={readOnly ? [] : options} // ✅ No options dropdown if readOnly
      getOptionLabel={(option) => option.name || ""}
      loading={loading}
      disabled={disabled}
      readOnly={readOnly} // ✅ NEW: Pass readOnly to Autocomplete
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
            readOnly: readOnly, // ✅ Make input readOnly
            startAdornment: readOnly ? ( // ✅ Show lock icon if readOnly
              <InputAdornment position="start">
                <LockIcon sx={{ color: "text.secondary", fontSize: 20 }} />
              </InputAdornment>
            ) : undefined,
            endAdornment: (
              <>
                {loading ? <CircularProgress size={20} /> : null}
                {params.InputProps.endAdornment}
              </>
            ),
            sx: {
              // ✅ Override disabled/readOnly styling to keep text black
              "& .MuiInputBase-input": {
                color: readOnly ? "text.primary" : undefined,
                cursor: readOnly ? "default" : undefined,
                WebkitTextFillColor: readOnly
                  ? "rgba(0, 0, 0, 0.87)"
                  : undefined, // ✅ Force black text
              },
              // ✅ Keep label color normal
              "& .MuiInputLabel-root": {
                color: readOnly ? "text.primary" : undefined,
              },
            },
          }}
        />
      )}
      noOptionsText={
        inputValue.length < 2
          ? "Type at least 2 characters"
          : "No options found"
      }
    />
  );
};
