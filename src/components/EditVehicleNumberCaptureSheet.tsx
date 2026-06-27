"use client";

import { useEffect, useState } from "react";
import Drawer from "@mui/material/Drawer";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import Radio from "@mui/material/Radio";
import SheetHandle from "./SheetHandle";
import { useAppStore } from "@/lib/store";
import { VehicleNumberCaptureMode } from "@/lib/types";
import { BOTTOM_SHEET_PAPER_SX } from "@/lib/sheetStyles";

export default function EditVehicleNumberCaptureSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { vehicleNumberCaptureMode, setVehicleNumberCaptureMode } = useAppStore();
  const [mode, setMode] = useState<VehicleNumberCaptureMode>(vehicleNumberCaptureMode);

  useEffect(() => {
    if (open) setMode(vehicleNumberCaptureMode);
  }, [open, vehicleNumberCaptureMode]);

  const handleSave = () => {
    setVehicleNumberCaptureMode(mode);
    onClose();
  };

  return (
    <Drawer anchor="bottom" open={open} onClose={onClose} slotProps={{ paper: { sx: BOTTOM_SHEET_PAPER_SX } }}>
      <Box sx={{ p: 3, pb: 4 }}>
        <SheetHandle />
        <Typography variant="h6" sx={{ mb: 2.5 }}>
          Vehicle Number Capture
        </Typography>

        <RadioGroup value={mode} onChange={(e) => setMode(e.target.value as VehicleNumberCaptureMode)}>
          <FormControlLabel value="full" control={<Radio />} label="Full vehicle number" />
          <FormControlLabel value="last4" control={<Radio />} label="Last 4 digits only" />
        </RadioGroup>
        <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 1, mb: 3 }}>
          Controls the keyboard shown on the Check-In screen.
        </Typography>

        <Button variant="contained" size="large" fullWidth onClick={handleSave}>
          Save
        </Button>
      </Box>
    </Drawer>
  );
}
