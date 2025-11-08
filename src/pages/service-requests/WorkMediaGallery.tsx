import React, { useState } from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  IconButton,
  Tooltip,
  Menu,
  MenuItem,
  CircularProgress,
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import { formatDate } from '../../utils/helpers';

interface WorkMedia {
  id: string;
  fileUrl: string;
  uploadedAt: string;
}

interface WorkMediaGalleryProps {
  media: WorkMedia[];
}

const   WorkMediaGallery: React.FC<WorkMediaGalleryProps> = ({ media }) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedMediaId, setSelectedMediaId] = useState<string | null>(null);
  const [downloading, setDownloading] = useState<string | null>(null);

  const handleMenuOpen = (
    event: React.MouseEvent<HTMLButtonElement>,
    mediaId: string
  ) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
    setSelectedMediaId(mediaId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedMediaId(null);
  };

  const getImageUrl = (fileUrl: string) => {
    const baseUrl = import.meta.env.VITE_API_BASE_IMG_URL || '';
    return `${baseUrl}${fileUrl}`;
  };

  const handleDownloadImage = async (media: WorkMedia) => {
    try {
      setDownloading(media.id);

      const imageUrl = getImageUrl(media.fileUrl);
      const response = await fetch(imageUrl);

      if (!response.ok) {
        throw new Error('Failed to download image');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;

      const date = new Date(media.uploadedAt);
      const timestamp = date.toISOString().split('T')[0];
      const filename = `work-image-${timestamp}-${media.id.slice(0, 8)}.jpg`;

      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      handleMenuClose();
    } catch (error) {
      console.error('Error downloading image:', error);
      alert('Failed to download image. Please try again.');
    } finally {
      setDownloading(null);
    }
  };

  const handleDownloadAll = async () => {
    try {
      setDownloading('all');

      let htmlContent = `
        <html>
        <head>
          <title>Work Images</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
            h1 { color: #333; border-bottom: 3px solid #1976d2; padding-bottom: 10px; }
            .image-container { 
              margin: 20px 0; 
              page-break-inside: avoid;
              background: white;
              border: 1px solid #ddd;
              padding: 15px;
              border-radius: 8px;
              box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }
            img { 
              max-width: 100%; 
              height: auto; 
              border-radius: 4px;
              margin: 10px 0;
            }
            .date { 
              color: #666; 
              font-size: 12px;
              margin-top: 10px;
              border-top: 1px solid #eee;
              padding-top: 8px;
            }
          </style>
        </head>
        <body>
          <h1>Work Images Report</h1>
      `;

      for (const mediaItem of media) {
        const imageUrl = getImageUrl(mediaItem.fileUrl);
        const date = formatDate(mediaItem.uploadedAt);

        htmlContent += `
          <div class="image-container">
            <img src="${imageUrl}" alt="Work image" />
            <div class="date">📅 Uploaded: ${date}</div>
          </div>
        `;
      }

      htmlContent += `
        </body>
        </html>
      `;

      const blob = new Blob([htmlContent], { type: 'text/html' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `work-images-${new Date().toISOString().split('T')[0]}.html`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      handleMenuClose();
    } catch (error) {
      console.error('Error downloading all images:', error);
      alert('Failed to download images. Please try again.');
    } finally {
      setDownloading(null);
    }
  };

  const handleViewFullSize = (fileUrl: string) => {
    window.open(getImageUrl(fileUrl), '_blank');
  };

  if (!media || media.length === 0) {
    return null;
  }

  return (
    <Card sx={{ mt: 2, boxShadow: 2 }}>
      <CardContent>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            mb: 3,
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            📸 Work Images ({media.length})
          </Typography>
          <Tooltip title="Download all images as HTML report">
            <IconButton
              size="medium"
              onClick={handleDownloadAll}
              disabled={downloading === 'all'}
              sx={{
                bgcolor: 'primary.main',
                color: 'white',
                '&:hover': { 
                  bgcolor: 'primary.dark',
                  transform: 'scale(1.05)',
                },
                transition: 'all 0.2s',
              }}
            >
              {downloading === 'all' ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                <DownloadIcon />
              )}
            </IconButton>
          </Tooltip>
        </Box>

        <Grid container spacing={2}>
          {media.map((mediaItem) => (
            <Grid size={{ xs: 6, sm: 4, md: 3 }} key={mediaItem.id}>
              <Box
                sx={{
                  position: 'relative',
                  paddingTop: '100%',
                  borderRadius: 2,
                  overflow: 'hidden',
                  border: '2px solid',
                  borderColor: 'divider',
                  bgcolor: '#f5f5f5',
                  boxShadow: 1,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    boxShadow: 4,
                    borderColor: 'primary.main',
                    '& .action-overlay': {
                      opacity: 1,
                    },
                  },
                }}
              >
                {/* Image */}
                <Box
                  component="img"
                  src={getImageUrl(mediaItem.fileUrl)}
                  alt="Work image"
                  sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
                />

                {/* Action Buttons Overlay - Better Styling */}
                <Box
                  className="action-overlay"
                  sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    bgcolor: 'rgba(0, 0, 0, 0.4)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 1.5,
                    opacity: 0,
                    transition: 'opacity 0.3s ease',
                  }}
                >
                  {/* View Full Size Button */}
                  <Tooltip title="View full size" placement="top">
                    <IconButton
                      size="medium"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewFullSize(mediaItem.fileUrl);
                      }}
                      sx={{
                        bgcolor: 'white',
                        color: 'primary.main',
                        boxShadow: 2,
                        '&:hover': {
                          bgcolor: 'primary.main',
                          color: 'white',
                          transform: 'scale(1.1)',
                        },
                        transition: 'all 0.2s',
                      }}
                    >
                      <ZoomInIcon />
                    </IconButton>
                  </Tooltip>

                  {/* Download & More Options */}
                  <Tooltip title="Download options" placement="top">
                    <IconButton
                      size="medium"
                      onClick={(e) => handleMenuOpen(e, mediaItem.id)}
                      sx={{
                        bgcolor: 'white',
                        color: 'primary.main',
                        boxShadow: 2,
                        '&:hover': {
                          bgcolor: 'primary.main',
                          color: 'white',
                          transform: 'scale(1.1)',
                        },
                        transition: 'all 0.2s',
                      }}
                    >
                      {downloading === mediaItem.id ? (
                        <CircularProgress size={24} color="inherit" />
                      ) : (
                        <MoreVertIcon />
                      )}
                    </IconButton>
                  </Tooltip>
                </Box>

                {/* Upload Date Overlay - Bottom */}
                <Box
                  sx={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    bgcolor: 'rgba(0, 0, 0, 0.8)',
                    color: 'white',
                    p: 1,
                    backdropFilter: 'blur(4px)',
                  }}
                >
                  <Typography variant="caption" display="block" noWrap>
                    📅 {formatDate(mediaItem.uploadedAt)}
                  </Typography>
                </Box>
              </Box>
            </Grid>
          ))}
        </Grid>
      </CardContent>

      {/* Context Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <MenuItem
          onClick={() => {
            const selectedMedia = media.find((m) => m.id === selectedMediaId);
            if (selectedMedia) {
              handleDownloadImage(selectedMedia);
            }
          }}
          disabled={downloading === selectedMediaId}
        >
          <DownloadIcon fontSize="small" sx={{ mr: 1 }} />
          <Typography variant="body2">Download Image</Typography>
        </MenuItem>
        <MenuItem
          onClick={() => {
            const selectedMedia = media.find((m) => m.id === selectedMediaId);
            if (selectedMedia) {
              handleViewFullSize(selectedMedia.fileUrl);
            }
          }}
        >
          <ZoomInIcon fontSize="small" sx={{ mr: 1 }} />
          <Typography variant="body2">View Full Size</Typography>
        </MenuItem>
      </Menu>
    </Card>
  );
};

export default WorkMediaGallery;
