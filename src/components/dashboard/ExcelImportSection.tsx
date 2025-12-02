import React, { useState } from "react";
import {
  Box,
  Paper,
  Typography,
  Button,
  Alert,
  LinearProgress,
  Tabs,
  Tab,
  Chip,
  Stack,
} from "@mui/material";
import {
  CloudUpload as UploadIcon,
  CheckCircle as SuccessIcon,
  Error as ErrorIcon,
  InsertDriveFile as FileIcon,
} from "@mui/icons-material";
import { requestService } from "../../api/services/requestService";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`import-tabpanel-${index}`}
      aria-labelledby={`import-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

interface ImportState {
  uploading: boolean;
  success: boolean;
  error: string | null;
  summary: any;
  errors: string[];
  fileName: string;
}

const ExcelImportSection: React.FC = () => {
  const [currentTab, setCurrentTab] = useState(0);

  // Separate state for each import type
  const [installationState, setInstallationState] = useState<ImportState>({
    uploading: false,
    success: false,
    error: null,
    summary: null,
    errors: [],
    fileName: "",
  });

  const [productState, setProductState] = useState<ImportState>({
    uploading: false,
    success: false,
    error: null,
    summary: null,
    errors: [],
    fileName: "",
  });

  const [sparePartsState, setSparePartsState] = useState<ImportState>({
    uploading: false,
    success: false,
    error: null,
    summary: null,
    errors: [],
    fileName: "",
  });

  const [serviceRequestState, setServiceRequestState] = useState<ImportState>({
    uploading: false,
    success: false,
    error: null,
    summary: null,
    errors: [],
    fileName: "",
  });

  const [techniciansState, setTechniciansState] = useState<ImportState>({
    uploading: false,
    success: false,
    error: null,
    summary: null,
    errors: [],
    fileName: "",
  });

  const handleTabChange = (
    _event: React.SyntheticEvent, 
    newValue: number) => {
    setCurrentTab(newValue);
  };

  // Generic file upload handler
  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
    importType:
      | "installation"
      | "product"
      | "spareParts"
      | "technicians"
      | "serviceRequest",
    setState: React.Dispatch<React.SetStateAction<ImportState>>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Reset state
    setState({
      uploading: true,
      success: false,
      error: null,
      summary: null,
      errors: [],
      fileName: file.name,
    });

    try {
      const formData = new FormData();
      formData.append("file", file);

      let response;
      if (importType === "installation") {
        response = await requestService.importInstallationData(formData);
      } else if (importType === "product") {
        response = await requestService.importProductsData(formData);
      } else if (importType === "spareParts") {
        response = await requestService.importSparePartsData(formData);
      } else if (importType === "technicians") {
        response = await requestService.importTechniciansData(formData);
      } else if (importType === "serviceRequest") {
        response = await requestService.importServiceRequestsData(formData);
      }

      setState({
        uploading: false,
        success: true,
        error: null,
        summary: response?.summary,
        errors: response?.errors || [],
        fileName: file.name,
      });
    } catch (error: any) {
      setState({
        uploading: false,
        success: false,
        error: error.response?.data?.message || "Import failed",
        summary: null,
        errors: [],
        fileName: file.name,
      });
    }

    // Reset file input
    event.target.value = "";
  };

  // Render upload section for each type
  const renderUploadSection = (
    state: ImportState,
    setState: React.Dispatch<React.SetStateAction<ImportState>>,
    importType:
      | "installation"
      | "product"
      | "spareParts"
      | "technicians"
      | "serviceRequest",
    title: string,
    description: string,
    requiredColumns: string[]
  ) => (
    <Box>
      <Typography variant="h6" gutterBottom>
        {title}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        {description}
      </Typography>

      {/* Required Columns */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="caption" color="text.secondary">
          Required Excel Columns:
        </Typography>
        <Stack
          direction="row"
          spacing={1}
          sx={{ mt: 1, flexWrap: "wrap", gap: 1 }}
        >
          {requiredColumns.map((col) => (
            <Chip key={col} label={col} size="small" variant="outlined" />
          ))}
        </Stack>
      </Box>

      {/* Upload Button */}
      <Button
        variant="contained"
        component="label"
        startIcon={<UploadIcon />}
        disabled={state.uploading}
        fullWidth
        sx={{ mb: 2 }}
      >
        {state.uploading ? "Uploading..." : "Choose Excel File"}
        <input
          type="file"
          hidden
          accept=".xlsx,.xls"
          onChange={(e) => handleFileUpload(e, importType, setState)}
        />
      </Button>

      {/* File Name */}
      {state.fileName && (
        <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
          <FileIcon sx={{ mr: 1, color: "text.secondary" }} />
          <Typography variant="body2">{state.fileName}</Typography>
        </Box>
      )}

      {/* Progress */}
      {state.uploading && (
        <Box sx={{ mb: 2 }}>
          <LinearProgress />
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
            Processing file... This may take a few minutes.
          </Typography>
        </Box>
      )}

      {/* Success Message */}
      {state.success && state.summary && (
        <Alert severity="success" icon={<SuccessIcon />} sx={{ mb: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            Import completed successfully!
          </Typography>
          <Box sx={{ mt: 1 }}>
            {Object.entries(state.summary).map(([key, value]) => (
              <Typography key={key} variant="caption" display="block">
                {key.replace(/([A-Z])/g, " $1").trim()}:{" "}
                <strong>{value as string}</strong>
              </Typography>
            ))}
          </Box>
        </Alert>
      )}

      {/* Error Message */}
      {state.error && (
        <Alert severity="error" icon={<ErrorIcon />} sx={{ mb: 2 }}>
          <Typography variant="subtitle2">{state.error}</Typography>
        </Alert>
      )}

      {/* Import Errors */}
      {state.errors.length > 0 && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            Import completed with {state.errors.length} errors:
          </Typography>
          <Box sx={{ maxHeight: 200, overflowY: "auto", mt: 1 }}>
            {state.errors.slice(0, 10).map((err, idx) => (
              <Typography key={idx} variant="caption" display="block">
                • {err}
              </Typography>
            ))}
            {state.errors.length > 10 && (
              <Typography variant="caption" color="text.secondary">
                ... and {state.errors.length - 10} more errors
              </Typography>
            )}
          </Box>
        </Alert>
      )}
    </Box>
  );

  return (
    <Box sx={{ mt: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          📊 Excel Data Import
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Upload Excel files to import installation, products, spare parts, and
          technician data.
        </Typography>

        {/* Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
          <Tabs value={currentTab} onChange={handleTabChange}>
            <Tab label="Installation Data" />
            <Tab label="Products" />
            <Tab label="Spare Parts" />
            <Tab label="Services" />
            <Tab label="Technicians" />
          </Tabs>
        </Box>

        {/* Installation Tab */}
        <TabPanel value={currentTab} index={0}>
          {renderUploadSection(
            installationState,
            setInstallationState,
            "installation",
            "Import Installation Data",
            "Upload installation records including customer details, regions, technicians, and service history.",
            [
              "NAME",
              "PLACE",
              "PRIMARY PHONE NUMBER",
              "DISTRICT",
              "TALUK",
              "PRODUCT NAME",
              "TECHNICIAN",
              "INSTALLATION DATE",
            ]
          )}
        </TabPanel>

        {/* Products Tab */}
        <TabPanel value={currentTab} index={1}>
          {renderUploadSection(
            productState,
            setProductState,
            "product",
            "Import Products",
            "Upload product catalog with categories, pricing, warranty, and stock information.",
            ["CATEGORY", "MODEL", "PRICE INR", "WARRANTY", "STOCK QTY"]
          )}
        </TabPanel>

            <TabPanel value={currentTab} index={2}>
          {renderUploadSection(
            sparePartsState,
            setSparePartsState,
            "spareParts",
            "Import Spare Parts",
            "Upload spare parts catalog with pricing, warranty, and stock information.",
            ["SPARE NAME", "PRICE INR", "WARRANTY", "STOCK QTY"]
          )}
        </TabPanel>

        <TabPanel value={currentTab} index={3}>
          {renderUploadSection(
            serviceRequestState,
            setServiceRequestState,
            "serviceRequest",
            "Import Service Requests",
            "Upload historical service request data. Existing customers will be matched by phone number. New customers will be created automatically.",
            [
              "PHONE NUMBER",
              "NAME & ADRESS",
              "PLACE",
              "TECHNICIAN",
              "SERVICE BOOKING DATE",
              "CALL ATTAND DATE",
              "USED SPAIR",
              "WARRANTY IN/OUT",
            ]
          )}
        </TabPanel>

        <TabPanel value={currentTab} index={4}>
          {renderUploadSection(
            techniciansState,
            setTechniciansState,
            "technicians",
            "Import Freelance Technicians",
            "Upload external/freelance technicians with contact details, experience, and coverage areas. All imported technicians will be marked as external (isExternal = true).",
            [
              "full_name",
              "phone_number",
              "city",
              "Experience years",
              "Status",
              "remarks",
              "Area Covered",
            ]
          )}
        </TabPanel>
      </Paper>
    </Box>
  );
};

export default ExcelImportSection;
