"use client";

import { useEffect, useState } from "react";
import Drawer from "@mui/material/Drawer";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import { useAppStore } from "@/lib/store";

export default function EditBusinessNameSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { businessName, setBusinessName } = useAppStore();
  const [name, setName] = useState(businessName);

  useEffect(() => {
    if (open) setName(businessName);
  }, [open, businessName]);

  const handleSave = () => {
    setBusinessName(name);
    onClose();
  };

  return (
    <Drawer anchor="bottom" open={open} onClose={onClose} slotProps={{ paper: { sx: { borderTopLeftRadius: 20, borderTopRightRadius: 20 } } }}>
      <Box sx={{ p: 3, pb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Business Name
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Shown on the Home dashboard for both Owner and Employee.
        </Typography>

        <TextField
          label="Business / stand name"
          fullWidth
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          sx={{ mb: 3 }}
        />

        <Button variant="contained" size="large" fullWidth onClick={handleSave}>
          Save
        </Button>
      </Box>
    </Drawer>
  );
}
