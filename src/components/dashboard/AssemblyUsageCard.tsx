import React from "react";
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import PrecisionManufacturingIcon from "@mui/icons-material/PrecisionManufacturing";
import type { AssemblyUsage } from "../../types";

const AssemblyUsageCard: React.FC<{ data: AssemblyUsage }> = ({ data }) =>
    {
    console.log("data: ", data);
  return (
    <Card sx={{ height: "100%" }}>
      <CardContent>
        <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
          <PrecisionManufacturingIcon
            sx={{ mr: 1, fontSize: 22, color: "secondary.main" }}
          />
          <Typography variant="h6" fontWeight={600}>
            Assembly Analytics
          </Typography>
        </Box>
        <Typography variant="subtitle2" sx={{ mb: 1 }}>
          Assemblies Completed: <b>{data.totalAssemblies}</b>
        </Typography>
        <Typography variant="subtitle2" sx={{ mb: 1 }}>
          Total Assembly Cost: <b>₹{data.totalAssemblyCost}</b>
        </Typography>
        <Typography variant="subtitle2" sx={{ mb: 1 }}>
          Spare Parts Used in Assemblies: <b>{data.usedPartsCount}</b>
        </Typography>
        <Typography variant="body2" fontWeight={600} sx={{ mt: 2 }}>
          Most Assembled Products:
        </Typography>
        <List dense>
          {Object.entries(data.mostAssembledProducts).map(([name, count]) => (
            <ListItem key={name}>
              <ListItemText
                primary={`${name}`}
                secondary={`Assemblies: ${count}`}
              />
              <Chip label={count} color="success" size="small" sx={{ ml: 1 }} />
            </ListItem>
          ))}
        </List>
      </CardContent>
    </Card>
  );
}

export default AssemblyUsageCard;
