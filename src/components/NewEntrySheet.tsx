"use client";

import { useState } from "react";
import Drawer from "@mui/material/Drawer";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import ToggleButton from "@mui/material/ToggleButton";
import Stack from "@mui/material/Stack";
import VehicleIcon from "./VehicleIcon";
import { useAppStore } from "@/lib/store";

export default function NewEntrySheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { vehicleTypes, startSession, role } = useAppStore();
  const [vehicleTypeId, setVehicleTypeId] = useState(vehicleTypes[0].id);
  const [vehicleNumber, setVehicleNumber] = useState("");

  const handleStart = () => {
    startSession(vehicleTypeId, vehicleNumber.trim() || undefined, role === "owner" ? "Owner" : "Employee");
    setVehicleNumber("");
    onClose();
  };

  return (
    <Drawer anchor="bottom" open={open} onClose={onClose} slotProps={{ paper: { sx: { borderTopLeftRadius: 20, borderTopRightRadius: 20 } } }}>
      <Box sx={{ p: 3, pb: 4 }}>
        <Typography variant="h6" gutterBottom>
          New Vehicle Entry
        </Typography>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          Vehicle type
        </Typography>
        <ToggleButtonGroup
          value={vehicleTypeId}
          exclusive
          onChange={(_, value) => value && setVehicleTypeId(value)}
          fullWidth
          sx={{ mb: 3 }}
        >
          {vehicleTypes.map((vt) => (
            <ToggleButton key={vt.id} value={vt.id}>
              <Stack spacing={0.5} sx={{ alignItems: "center", py: 0.5 }}>
                <VehicleIcon name={vt.name} />
                <Typography variant="caption">{vt.name}</Typography>
              </Stack>
            </ToggleButton>
          ))}
        </ToggleButtonGroup>

        <TextField
          label="Vehicle number (optional)"
          fullWidth
          value={vehicleNumber}
          onChange={(e) => setVehicleNumber(e.target.value)}
          sx={{ mb: 3 }}
        />

        <Button variant="contained" size="large" fullWidth onClick={handleStart}>
          Start Parking &amp; Issue Token
        </Button>
      </Box>
    </Drawer>
  );
}
