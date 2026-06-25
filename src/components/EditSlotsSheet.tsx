"use client";

import { useEffect, useState } from "react";
import Drawer from "@mui/material/Drawer";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import { useAppStore } from "@/lib/store";
import { VehicleType } from "@/lib/types";

export default function EditSlotsSheet({
  vehicleType,
  onClose,
}: {
  vehicleType: VehicleType | null;
  onClose: () => void;
}) {
  const { updateVehicleTypeSlots } = useAppStore();
  const [slots, setSlots] = useState("");

  useEffect(() => {
    if (vehicleType) setSlots(String(vehicleType.totalSlots));
  }, [vehicleType]);

  if (!vehicleType) return null;

  const handleSave = () => {
    const value = parseInt(slots, 10);
    if (Number.isNaN(value) || value < 0) return;
    updateVehicleTypeSlots(vehicleType.id, value);
    onClose();
  };

  return (
    <Drawer
      anchor="bottom"
      open={!!vehicleType}
      onClose={onClose}
      slotProps={{ paper: { sx: { borderTopLeftRadius: 20, borderTopRightRadius: 20 } } }}
    >
      <Box sx={{ p: 3, pb: 4 }}>
        <Typography variant="h6" gutterBottom>
          {vehicleType.name} Slots
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Total {vehicleType.name.toLowerCase()} parking spots available at your stand.
        </Typography>

        <TextField
          label="Total slots"
          type="number"
          fullWidth
          autoFocus
          value={slots}
          onChange={(e) => setSlots(e.target.value)}
          sx={{ mb: 3 }}
        />

        <Button variant="contained" size="large" fullWidth onClick={handleSave}>
          Save
        </Button>
      </Box>
    </Drawer>
  );
}
