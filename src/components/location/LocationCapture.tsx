import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Alert,
  CircularProgress,
  Stack,
  Chip,
} from '@mui/material';
import {
  MyLocation,
  Navigation,
  Edit,
  Check,
  Map,
} from '@mui/icons-material';

interface LocationData {
  latitude: number;
  longitude: number;
  accuracy?: number;
}

interface LocationCaptureProps {
  initialLocation?: LocationData | null;
  onLocationCapture: (location: LocationData) => void;
  disabled?: boolean;
}

const 
LocationCapture: React.FC<LocationCaptureProps> = ({
  initialLocation,
  onLocationCapture,
  disabled = false,
}) => {
  const [location, setLocation] = useState<LocationData | null>(
    initialLocation || null
  );
  console.log('initial location:', initialLocation , '--' , location)
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [manualMode, setManualMode] = useState(false);
  
  // Manual input states
  const [manualLat, setManualLat] = useState('');
  const [manualLng, setManualLng] = useState('');

  useEffect(() => {
    console.log('LocationCapture - initialLocation changed:', initialLocation);
    if (initialLocation) {
      setLocation(initialLocation);
    } else {
      setLocation(null);
    }
  }, [initialLocation]);
  // ✅ Capture current GPS location
  const captureLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      setManualMode(true);
      return;
    }

    setLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const capturedLocation = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
        };
        
        setLocation(capturedLocation);
        onLocationCapture(capturedLocation);
        setLoading(false);
        setError(null);
      },
      (err) => {
        setLoading(false);
        
        switch (err.code) {
          case err.PERMISSION_DENIED:
            setError('Location permission denied. Please enable location access.');
            break;
          case err.POSITION_UNAVAILABLE:
            setError('Location information unavailable. Try manual entry.');
            break;
          case err.TIMEOUT:
            setError('Location request timed out. Try again.');
            break;
          default:
            setError('An error occurred while getting location.');
        }
        
        setManualMode(true);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  // ✅ Save manual location
  const saveManualLocation = () => {
    const lat = parseFloat(manualLat);
    const lng = parseFloat(manualLng);

    if (isNaN(lat) || isNaN(lng)) {
      setError('Invalid coordinates. Please enter valid numbers.');
      return;
    }

    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      setError('Coordinates out of range. Latitude: -90 to 90, Longitude: -180 to 180');
      return;
    }

    const manualLocation = { latitude: lat, longitude: lng };
    setLocation(manualLocation);
    onLocationCapture(manualLocation);
    setManualMode(false);
    setError(null);
  };

  // ✅ Open in Google Maps
  const openInGoogleMaps = () => {
    if (!location) return;
    const url = `https://www.google.com/maps/dir/?api=1&destination=${location.latitude},${location.longitude}`;
    window.open(url, '_blank');
  };

  // ✅ Open in Apple Maps (iOS devices)
  const openInAppleMaps = () => {
    if (!location) return;
    const url = `https://maps.apple.com/?daddr=${location.latitude},${location.longitude}`;
    window.open(url, '_blank');
  };

  return (
    <Box>
      <Typography variant="subtitle2" fontWeight={600} gutterBottom>
        Customer Location
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Current Location Display */}
      {location && !manualMode && (
        <Box sx={{ mb: 2, p: 2, bgcolor: 'success.50', borderRadius: 1, border: '1px solid', borderColor: 'success.main' }}>
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
            <MyLocation color="success" fontSize="small" />
            <Typography variant="body2" fontWeight={600} color="success.main">
              Location Captured
            </Typography>
          </Stack>
          
          <Typography variant="body2" color="text.secondary">
            <strong>Latitude:</strong> {location.latitude.toFixed(6)}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            <strong>Longitude:</strong> {location.longitude.toFixed(6)}
          </Typography>
          
          {location.accuracy && (
            <Chip 
              label={`Accuracy: ±${Math.round(location.accuracy)}m`} 
              size="small" 
              sx={{ mt: 1 }} 
            />
          )}

          {/* Navigation Buttons */}
          <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
            <Button
              size="small"
              variant="outlined"
              startIcon={<Navigation />}
              onClick={openInGoogleMaps}
              fullWidth
            >
              Google Maps
            </Button>
            <Button
              size="small"
              variant="outlined"
              startIcon={<Map />}
              onClick={openInAppleMaps}
              fullWidth
            >
              Apple Maps
            </Button>
          </Stack>

          <Button
            size="small"
            startIcon={<Edit />}
            onClick={() => {
              setManualLat(location.latitude.toString());
              setManualLng(location.longitude.toString());
              setManualMode(true);
            }}
            sx={{ mt: 1 }}
          >
            Edit Location
          </Button>
        </Box>
      )}

      {/* Manual Entry Mode */}
      {manualMode ? (
        <Box>
          <Typography variant="caption" color="text.secondary" gutterBottom display="block">
            Enter coordinates manually or open Google Maps and copy location
          </Typography>
          
          <Stack direction="row" spacing={1} sx={{ mt: 1, mb: 2 }}>
            <TextField
              size="small"
              label="Latitude"
              value={manualLat}
              onChange={(e) => setManualLat(e.target.value)}
              placeholder="9.9312"
              type="number"
              inputProps={{ step: 'any' }}
              fullWidth
            />
            <TextField
              size="small"
              label="Longitude"
              value={manualLng}
              onChange={(e) => setManualLng(e.target.value)}
              placeholder="76.2673"
              type="number"
              inputProps={{ step: 'any' }}
              fullWidth
            />
          </Stack>

          <Stack direction="row" spacing={1}>
            <Button
              variant="contained"
              startIcon={<Check />}
              onClick={saveManualLocation}
              disabled={!manualLat || !manualLng}
              fullWidth
            >
              Save Location
            </Button>
            <Button
              variant="outlined"
              onClick={() => {
                setManualMode(false);
                setManualLat('');
                setManualLng('');
              }}
              fullWidth
            >
              Cancel
            </Button>
          </Stack>
        </Box>
      ) : (
        /* Capture Location Buttons */
        <Stack direction="row" spacing={1}>
          <Button
            variant="contained"
            startIcon={loading ? <CircularProgress size={16} /> : <MyLocation />}
            onClick={captureLocation}
            disabled={disabled || loading || !!location}
            fullWidth
          >
            {loading ? 'Getting Location...' : location ? 'Location Saved' : 'Capture Location'}
          </Button>
          
          {!location && (
            <Button
              variant="outlined"
              startIcon={<Edit />}
              onClick={() => setManualMode(true)}
              disabled={disabled}
            >
              Manual
            </Button>
          )}
        </Stack>
      )}

      <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
        💡 Tap "Capture Location" to automatically get customer's GPS coordinates
      </Typography>
    </Box>
  );
};

export default LocationCapture;
