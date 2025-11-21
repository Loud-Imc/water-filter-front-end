import React, { useState } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  Chip,
  Stack,
  InputAdornment,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import PhoneIcon from "@mui/icons-material/Phone";

interface PhoneNumberInputProps {
  primaryPhone: string;
  additionalPhones: string[];
  onPrimaryPhoneChange: (phone: string) => void;
  onAdditionalPhonesChange: (phones: string[]) => void;
  disabled?: boolean;
  errors?: {
    primaryPhone?: string;
    additionalPhones?: string;
  };
}

const PhoneNumberInput: React.FC<PhoneNumberInputProps> = ({
  primaryPhone,
  additionalPhones,
  onPrimaryPhoneChange,
  onAdditionalPhonesChange,
  disabled = false,
  errors,
}) => {
  const [newPhone, setNewPhone] = useState("");
  const [error, setError] = useState("");

  const validatePhone = (phone: string): boolean => {
    const phoneRegex = /^[0-9]{10}$/;
    return phoneRegex.test(phone.replace(/\s/g, ""));
  };

  const handleAddPhone = () => {
    const trimmedPhone = newPhone.trim();

    if (!trimmedPhone) {
      setError("Phone number is required");
      return;
    }

    if (!validatePhone(trimmedPhone)) {
      setError("Phone number must be 10 digits");
      return;
    }

    if (
      primaryPhone === trimmedPhone ||
      additionalPhones.includes(trimmedPhone)
    ) {
      setError("This phone number already exists");
      return;
    }

    onAdditionalPhonesChange([...additionalPhones, trimmedPhone]);
    setNewPhone("");
    setError("");
  };

  const handleRemovePhone = (index: number) => {
    const updated = additionalPhones.filter((_, i) => i !== index);
    onAdditionalPhonesChange(updated);
  };

  // Helper text for primary phone
  const getPrimaryPhoneHelper = () => {
    if (errors?.primaryPhone) return errors.primaryPhone;
    if (primaryPhone.length > 0 && primaryPhone.length < 10) {
      return `${10 - primaryPhone.length} more digit${10 - primaryPhone.length > 1 ? 's' : ''} needed`;
    }
    return "Main contact number (10 digits)";
  };

  // Helper text for additional phone
  const getAdditionalPhoneHelper = () => {
    if (error) return error;
    if (newPhone.length > 0 && newPhone.length < 10) {
      return `${10 - newPhone.length} more digit${10 - newPhone.length > 1 ? 's' : ''} needed`;
    }
    return "Press Enter or click Add";
  };

  // Check if primary phone is incomplete (has input but less than 10 digits)
  const isPrimaryPhoneIncomplete = primaryPhone.length > 0 && primaryPhone.length < 10;
  
  // Check if additional phone is incomplete
  const isAdditionalPhoneIncomplete = newPhone.length > 0 && newPhone.length < 10;

  return (
    <Box>
      {/* Primary Phone */}
      <TextField
        fullWidth
        required
        label="Primary Phone Number"
        value={primaryPhone}
        onChange={(e) => {
          const value = e.target.value.replace(/[^0-9]/g, "");
          onPrimaryPhoneChange(value);
        }}
        disabled={disabled}
        error={!!errors?.primaryPhone || isPrimaryPhoneIncomplete}
        helperText={getPrimaryPhoneHelper()}
        placeholder="9876543210"
        inputProps={{ maxLength: 10 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <PhoneIcon sx={{ color: "text.secondary" }} />
            </InputAdornment>
          ),
        }}
        sx={{
          '& .MuiOutlinedInput-root': {
            '& fieldset': {
              borderColor: isPrimaryPhoneIncomplete ? 'error.main' : undefined,
            },
          },
          '& .MuiFormHelperText-root': {
            color: isPrimaryPhoneIncomplete ? 'error.main' : undefined,
          },
        }}
      />

      {/* Additional Phones Section */}
      <Box sx={{ mt: 3 }}>
        <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
          Additional Phone Numbers (Optional)
        </Typography>

        {/* Display existing additional phones */}
        {additionalPhones.length > 0 && (
          <Stack
            direction="row"
            spacing={1}
            flexWrap="wrap"
            sx={{ mb: 2, gap: 1 }}
          >
            {additionalPhones.map((phone, index) => (
              <Chip
                key={index}
                icon={<PhoneIcon />}
                label={phone}
                onDelete={() => handleRemovePhone(index)}
                deleteIcon={<DeleteIcon />}
                color="primary"
                variant="outlined"
                sx={{ fontSize: "0.875rem" }}
              />
            ))}
          </Stack>
        )}

        {/* Add new phone input */}
        <Box sx={{ display: "flex", gap: 1, alignItems: "flex-start" }}>
          <TextField
            fullWidth
            size="small"
            label="Add Another Number"
            value={newPhone}
            onChange={(e) => {
              const value = e.target.value.replace(/[^0-9]/g, "");
              setNewPhone(value);
              setError("");
            }}
            disabled={disabled}
            error={!!error || isAdditionalPhoneIncomplete}
            helperText={getAdditionalPhoneHelper()}
            placeholder="9876543211"
            inputProps={{ maxLength: 10 }}
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleAddPhone();
              }
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <PhoneIcon sx={{ color: "text.secondary", fontSize: 20 }} />
                </InputAdornment>
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                '& fieldset': {
                  borderColor: isAdditionalPhoneIncomplete ? 'error.main' : undefined,
                },
              },
              '& .MuiFormHelperText-root': {
                color: isAdditionalPhoneIncomplete ? 'error.main' : undefined,
              },
            }}
          />
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAddPhone}
            disabled={disabled || !newPhone.trim()}
            sx={{ minWidth: 100, height: 40 }}
          >
            Add
          </Button>
        </Box>

        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ mt: 1, display: "block" }}
        >
          💡 You can add multiple contact numbers for this customer
        </Typography>
      </Box>
    </Box>
  );
};

export default PhoneNumberInput;
