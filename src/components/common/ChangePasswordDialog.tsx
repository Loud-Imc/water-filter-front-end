import { useState } from "react";
import {
  Box,
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  InputAdornment,
} from "@mui/material";
import LockResetIcon from "@mui/icons-material/LockReset";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { useForm, Controller } from "react-hook-form";
import { axiosInstance } from "../../api/axios";
interface ChangePasswordDialogProps {
  open: boolean;
  onClose: () => void;
  userId: string | undefined;
}

const ChangePasswordDialog: React.FC<ChangePasswordDialogProps> = ({
  open,
  onClose,
  userId,
}) => {
  const {
    control,
    handleSubmit,
    reset,
    getValues,
    formState: { errors },
  } = useForm();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handlePasswordReset = async (data: any) => {
    try {
      setLoading(true);
      await axiosInstance.put(`/users/${userId}/reset-password`, {
        newPassword: data.newPassword,
      });
      alert("Password changed successfully!");
      reset();
      onClose();
    } catch (error: any) {
      alert(error.response?.data?.message || "Failed to change password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Change Password</DialogTitle>
      <DialogContent>
        <Box component="form" onSubmit={handleSubmit(handlePasswordReset)}>
          <Controller
            name="newPassword"
            control={control}
            defaultValue=""
            rules={{
              required: "Password is required",
              minLength: { value: 8, message: "Minimum 8 characters" },
            }}
            render={({ field }) => (
              <TextField
                {...field}
                label="New Password"
                type={showPassword ? "text" : "password"}
                fullWidth
                margin="normal"
                error={!!errors.newPassword}
                helperText={
                  typeof errors.newPassword?.message === "string"
                    ? errors.newPassword?.message
                    : ""
                }
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            )}
          />

          <Controller
            name="confirmPassword"
            control={control}
            defaultValue=""
            rules={{
              required: "Confirm your password",
              validate: (value) =>
                value === getValues("newPassword") || "Passwords do not match",
            }}
            render={({ field }) => (
              <TextField
                {...field}
                label="Confirm Password"
                type={showConfirmPassword ? "text" : "password"}
                fullWidth
                margin="normal"
                error={!!errors.confirmPassword}
                helperText={
                  typeof errors.newPassword?.message === "string"
                    ? errors.newPassword?.message
                    : ""
                }
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        edge="end"
                      >
                        {showConfirmPassword ? (
                          <VisibilityOff />
                        ) : (
                          <Visibility />
                        )}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            )}
          />

          <DialogActions>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={loading}
              startIcon={<LockResetIcon />}
            >
              {loading ? "Changing..." : "Change Password"}
            </Button>
            <Button
              onClick={() => {
                reset();
                onClose();
              }}
              variant="outlined"
            >
              Cancel
            </Button>
          </DialogActions>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default ChangePasswordDialog;
