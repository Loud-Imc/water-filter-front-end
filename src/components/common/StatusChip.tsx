// components/common/StatusChip.tsx
import React from "react";
import { Chip } from "@mui/material";
import type { RequestStatus, RequestType } from "../../types";

interface StatusChipProps {
  status: RequestStatus;
  requestType?: RequestType; // ✅ NEW: Optional request type
  size?: "small" | "medium";
  postWorkReassignCount?: number;
}

const StatusChip: React.FC<StatusChipProps> = ({
  status,
  requestType,
  size = "small",
  postWorkReassignCount,
}) => {
  // ✅ Special handling for ENQUIRY type
  if (requestType === "ENQUIRY") {
    return (
      <Chip
        label="Enquiry"
        size={size}
        sx={{
          bgcolor: "gray",
          color: "white",
          fontWeight: 600,
          border: "1px solid",
          borderColor: "info.main",
        }}
      />
    );
  }

  // Regular status colors for other types
  const getStatusColor = () => {
    switch (status) {
      case "DRAFT":
        return { bg: "grey.200", color: "white", border: "grey.400" };
      case "PENDING_APPROVAL":
        return {
          bg: "warning.light",
          color: "white",
          border: "warning.main",
        };
      case "APPROVED":
        return { bg: "info.light", color: "white", border: "info.main" };
      case "ASSIGNED":
        return {
          bg: "primary.light",
          color: "white",
          border: "primary.main",
        };
      case "IN_PROGRESS":
        return {
          bg: "secondary.light",
          color: "white",
          border: "secondary.main",
        };
      case "WORK_COMPLETED":
        return {
          bg: "#039688ff",
          color: "white",
          border: "success.main",
        };
      case "COMPLETED":
        return { bg: "success.main", color: "white", border: "success.dark" };
      case "RE_ASSIGNED":
        return {
          bg: "warning.light",
          color: "black",
          border: "warning.main",
        };
      case "REJECTED":
        return { bg: "error.light", color: "white", border: "error.main" };
      default:
        return { bg: "grey.200", color: "white", border: "grey.400" };
    }
  };

  const colors = getStatusColor();
  const label = status
    .replace(/_/g, " ")
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  const displayLabel =
    postWorkReassignCount && postWorkReassignCount > 0
      ? `${label} (${postWorkReassignCount})`
      : label;

  return (
    <Chip
      label={displayLabel}
      size={size}
      sx={{
        bgcolor: colors.bg,
        color: colors.color,
        fontWeight: 600,
        border: "1px solid",
        borderColor: colors.border,
      }}
    />
  );
};

export default StatusChip;
