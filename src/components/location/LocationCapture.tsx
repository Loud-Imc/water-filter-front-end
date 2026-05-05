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
  Divider,
} from '@mui/material';
import {
  MyLocation,
  Navigation,
  Edit,
  Check,
  Map,
  // Link as LinkIcon,
} from '@mui/icons-material';

interface LocationData {
  latitude: number;
  longitude: number;
  accuracy?: number;
}

interface LocationCaptureProps {
  initialLocation?: LocationData | null;
  onLocationCapture: (location: LocationData) => Promise<void>;
  disabled?: boolean;
}

const LocationCapture: React.FC<LocationCaptureProps> = ({
  initialLocation,
  onLocationCapture,
  disabled = false,
}) => {
  const [location, setLocation] = useState<LocationData | null>(
    initialLocation || null
  );
  console.log('initial location:', initialLocation, '--', location)
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [manualMode, setManualMode] = useState(false);

  // Manual input states
  const [manualLat, setManualLat] = useState('');
  const [manualLng, setManualLng] = useState('');
  const [mapsLink, setMapsLink] = useState('');
  const [parsingLink, setParsingLink] = useState(false);

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
      async (position) => {
        const capturedLocation = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
        };

        try {
          setLocation(capturedLocation);
          await onLocationCapture(capturedLocation);
          setError(null);
        } catch (err) {
          setError('Failed to save location to server');
        } finally {
          setLoading(false);
        }
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
  const saveManualLocation = async () => {
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

    setLoading(true);
    try {
      const manualLocation = { latitude: lat, longitude: lng };
      setLocation(manualLocation);
      await onLocationCapture(manualLocation);
      setManualMode(false);
      setError(null);
    } catch (err) {
      setError('Failed to save manual location');
    } finally {
      setLoading(false);
    }
  };

  // ✅ Parse Google Maps Link
  const handleParseLink = () => {
    if (!mapsLink) return;
    setParsingLink(true);
    setError(null);

    try {
      // Regex for extracting lat/lng from various Google Maps formats
      // 1. @12.3456,76.5432
      // 2. !3d12.3456!4d76.5432
      // 3. q=12.3456,76.5432

      let lat: string | null = null;
      let lng: string | null = null;

      // Try @lat,lng format
      const atMatch = mapsLink.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
      if (atMatch) {
        lat = atMatch[1];
        lng = atMatch[2];
      }
      // Try !3d!4d format
      else {
        const d3Match = mapsLink.match(/!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/);
        if (d3Match) {
          lat = d3Match[1];
          lng = d3Match[2];
        }
        // Try q=lat,lng format
        else {
          const qMatch = mapsLink.match(/q=(-?\d+\.\d+),(-?\d+\.\d+)/);
          if (qMatch) {
            lat = qMatch[1];
            lng = qMatch[2];
          }
        }
      }

      if (lat && lng) {
        setManualLat(lat);
        setManualLng(lng);
        setMapsLink('');
      } else {
        setError('Could not extract coordinates from this link. Please ensure it is a valid Google Maps location link.');
      }
    } catch (err) {
      setError('Error parsing link');
    } finally {
      setParsingLink(false);
    }
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
            Option 1: Paste Google Maps Link (System will extract coordinates)
          </Typography>

          <Stack direction="row" spacing={1} sx={{ mt: 1, mb: 2 }}>
            <TextField
              size="small"
              label="Google Maps Link"
              value={mapsLink}
              onChange={(e) => setMapsLink(e.target.value)}
              placeholder="https://www.google.com/maps/place/..."
              fullWidth
            />
            <Button
              variant="outlined"
              onClick={handleParseLink}
              disabled={!mapsLink || parsingLink}
              size="small"
              sx={{ whiteSpace: 'nowrap' }}
            >
              {parsingLink ? <CircularProgress size={20} /> : 'Extract'}
            </Button>
          </Stack>

          <Divider sx={{ my: 2 }}>
            <Typography variant="caption" color="text.disabled">OR</Typography>
          </Divider>

          <Typography variant="caption" color="text.secondary" gutterBottom display="block">
            Option 2: Enter coordinates manually
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
              disabled={loading}
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
              disabled={loading}
            />
          </Stack>

          <Stack direction="row" spacing={1}>
            <Button
              variant="contained"
              startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <Check />}
              onClick={saveManualLocation}
              disabled={!manualLat || !manualLng || loading}
              fullWidth
            >
              {loading ? 'Saving...' : 'Save Location'}
            </Button>
            <Button
              variant="outlined"
              onClick={() => {
                setManualMode(false);
                setManualLat('');
                setManualLng('');
                setMapsLink('');
              }}
              fullWidth
              disabled={loading}
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
            startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <MyLocation />}
            onClick={captureLocation}
            disabled={disabled || loading || !!location}
            fullWidth
          >
            {loading ? 'Saving Location...' : location ? 'Location Saved' : 'Capture Location'}
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
