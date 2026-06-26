"use client";

import { useEffect, useState } from "react";
import Drawer from "@mui/material/Drawer";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import InputAdornment from "@mui/material/InputAdornment";
import SheetHandle from "./SheetHandle";
import { useAppStore } from "@/lib/store";
import { BOTTOM_SHEET_PAPER_SX } from "@/lib/sheetStyles";

export default function EditLongStayThresholdSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { longStayThresholdHours, setLongStayThresholdHours } = useAppStore();
  const [hours, setHours] = useState(String(longStayThresholdHours));

  useEffect(() => {
    if (open) setHours(String(longStayThresholdHours));
  }, [open, longStayThresholdHours]);

  const handleSave = () => {
    const parsed = parseFloat(hours);
    if (Number.isNaN(parsed) || parsed <= 0) return;
    setLongStayThresholdHours(parsed);
    onClose();
  };

  return (
    <Drawer anchor="bottom" open={open} onClose={onClose} slotProps={{ paper: { sx: BOTTOM_SHEET_PAPER_SX } }}>
      <Box sx={{ p: 3, pb: 4 }}>
        <SheetHandle />
        <Typography variant="h6" sx={{ mb: 2.5 }}>
          Long-Stay Alert Threshold
        </Typography>

        <TextField
          label="Flag vehicles parked beyond"
          type="number"
          fullWidth
          value={hours}
          onChange={(e) => setHours(e.target.value)}
          slotProps={{ input: { endAdornment: <InputAdornment position="end">hours</InputAdornment> } }}
          sx={{ mb: 3 }}
        />

        <Button variant="contained" size="large" fullWidth onClick={handleSave}>
          Save
        </Button>
      </Box>
    </Drawer>
  );
}
