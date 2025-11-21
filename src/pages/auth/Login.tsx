import React, { useState, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Container,
  Alert,
  InputAdornment,
  IconButton,
  Divider,
  Stack,
} from "@mui/material";
import {
  Visibility,
  VisibilityOff,
  AdminPanelSettings,
  Engineering,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { login, clearError } from "../../app/slices/authSlice";
import { loginSchema } from "../../utils/validators";
import { type LoginCredentials } from "../../types";
import logoBigScreen from "../../assets/images/Leewa_logo_web.png";

const Login: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { loading, error, isAuthenticated } = useAppSelector(
    (state) => state.auth
  );
  const [showPassword, setShowPassword] = useState(false);

  // ✅ Check if in development mode
  const isDevelopment = process.env.NODE_ENV === "development";

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginCredentials>({
    resolver: yupResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard");
    }
    return () => {
      dispatch(clearError());
    };
  }, [isAuthenticated, navigate, dispatch]);

  const onSubmit = async (data: LoginCredentials) => {
    try {
      await dispatch(login(data)).unwrap();
      console.log("✅ Login successful, permissions loaded");
    } catch (error) {
      console.error("❌ Login failed:", error);
    }
  };

  // ✅ Quick login functions (dev only)
  const fillAdminCredentials = () => {
    setValue("email", "admin@leewaa.com");
    setValue("password", "Admin@123");
  };

  const fillTechnicianCredentials = () => {
    setValue("email", "technician@gmail.com");
    setValue("password", "Technician@123");
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        bgcolor: "#2876B3", // ✅ Use default app background
      }}
    >
      <Container maxWidth="sm">
        <Card
          sx={(theme) => ({
            borderRadius: 3,
            // Default MUI shadow + colored shadow using primary color
            boxShadow: `0 4px 20px 0 ${theme.palette.primary.main}25, 0 1.5px 8px 0 ${theme.palette.grey[400]}`, // primary at 15% opacity
            transition: "box-shadow 0.24s",
            "&:hover": {
              boxShadow: `0 6px 24px 0 ${theme.palette.primary.main}33, 0 1.5px 12px 0 ${theme.palette.grey[400]}`,
            },
          })}
        >
          <CardContent sx={{ p: 4 }}>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                mb: 3,
              }}
            >
              <Box sx={{ mb: 2 }}>
                <img
                  src={logoBigScreen}
                  alt="Water Filter Logo"
                  style={{ width: 160, height: 40 }}
                />
              </Box>
              <Typography
                variant="h4"
                fontWeight={600}
                gutterBottom
                color="primary"
                sx={{ lineHeight: 1.3 }} // ✅ Proper line height
              >
                Services
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ lineHeight: 1.6 }} // ✅ Proper line height
              >
                Sign in to your account
              </Typography>
            </Box>

            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}

            {/* ✅ Quick Login Buttons - Development Only */}
            {isDevelopment && (
              <Box sx={{ mb: 3 }}>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  gutterBottom
                  align="center"
                  sx={{ lineHeight: 1.6 }}
                >
                  Quick Login (Demo)
                </Typography>
                <Stack direction="row" spacing={2} sx={{ mt: 1 }}>
                  <Button
                    fullWidth
                    variant="outlined"
                    color="primary" // ✅ Use default primary color
                    startIcon={<AdminPanelSettings />}
                    onClick={fillAdminCredentials}
                    size="small"
                  >
                    Admin
                  </Button>
                  <Button
                    fullWidth
                    variant="outlined"
                    color="primary" // ✅ Use default primary color
                    startIcon={<Engineering />}
                    onClick={fillTechnicianCredentials}
                    size="small"
                  >
                    Technician
                  </Button>
                </Stack>
                <Divider sx={{ mt: 2, mb: 2 }}>or enter manually</Divider>
              </Box>
            )}

            <form onSubmit={handleSubmit(onSubmit)}>
              <Controller
                name="email"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Email"
                    type="email"
                    error={!!errors.email}
                    helperText={errors.email?.message}
                    margin="normal"
                    autoFocus
                    sx={{
                      "& .MuiInputBase-input": {
                        lineHeight: 1.5, // ✅ Proper line height
                      },
                    }}
                  />
                )}
              />

              <Controller
                name="password"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Password"
                    type={showPassword ? "text" : "password"}
                    error={!!errors.password}
                    helperText={errors.password?.message}
                    margin="normal"
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
                    sx={{
                      "& .MuiInputBase-input": {
                        lineHeight: 1.5, // ✅ Proper line height
                      },
                    }}
                  />
                )}
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                color="primary" // ✅ Use default primary color
                size="large"
                disabled={loading}
                sx={{
                  mt: 3,
                  mb: 2,
                  py: 1.5,
                  lineHeight: 1.75, // ✅ Proper line height for button text
                }}
              >
                {loading ? "Signing in..." : "Sign In"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};

export default Login;
