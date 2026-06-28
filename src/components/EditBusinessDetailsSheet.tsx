"use client";

import { useEffect, useState } from "react";
import Drawer from "@mui/material/Drawer";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import Divider from "@mui/material/Divider";
import SheetHandle from "./SheetHandle";
import { useAppStore } from "@/lib/store";
import { Address } from "@/lib/types";
import { BOTTOM_SHEET_PAPER_SX } from "@/lib/sheetStyles";

export default function EditBusinessDetailsSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { businessName, businessAddress, businessPhone, setBusinessDetails, t } = useAppStore();
  const [name, setName] = useState(businessName);
  const [address, setAddress] = useState<Address>(businessAddress);
  const [phone, setPhone] = useState(businessPhone);

  useEffect(() => {
    if (open) {
      setName(businessName);
      setAddress(businessAddress);
      setPhone(businessPhone);
    }
  }, [open, businessName, businessAddress, businessPhone]);

  const handleSave = () => {
    setBusinessDetails(name, address, phone);
    onClose();
  };

  return (
    <Drawer anchor="bottom" open={open} onClose={onClose} slotProps={{ paper: { sx: BOTTOM_SHEET_PAPER_SX } }}>
      <Box sx={{ p: 3, pb: 4 }}>
        <SheetHandle />
        <Typography variant="h6" sx={{ mb: 2.5 }}>
          {t("businessDetailsTitle")}
        </Typography>

        <TextField
          label={t("businessStandName")}
          fullWidth
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          sx={{ mb: 2 }}
        />
        <TextField
          label={t("phoneNumberLabel")}
          fullWidth
          value={phone}
          onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
          sx={{ mb: 2 }}
        />

        <Divider sx={{ mb: 2 }} />
        <Typography variant="subtitle2" sx={{ mb: 1.5 }}>
          {t("address")}
        </Typography>

        <TextField
          label={t("doorNoStreet")}
          fullWidth
          multiline
          minRows={2}
          value={address.doorStreet ?? ""}
          onChange={(e) => setAddress((prev) => ({ ...prev, doorStreet: e.target.value }))}
          sx={{ mb: 2 }}
        />
        <Grid container spacing={1.5} sx={{ mb: 2 }}>
          <Grid size={6}>
            <TextField
              label={t("city")}
              fullWidth
              value={address.city ?? ""}
              onChange={(e) => setAddress((prev) => ({ ...prev, city: e.target.value }))}
            />
          </Grid>
          <Grid size={6}>
            <TextField
              label={t("pincode")}
              fullWidth
              value={address.pincode ?? ""}
              onChange={(e) => setAddress((prev) => ({ ...prev, pincode: e.target.value.replace(/\D/g, "").slice(0, 6) }))}
            />
          </Grid>
        </Grid>
        <TextField
          label={t("state")}
          fullWidth
          value={address.state ?? ""}
          onChange={(e) => setAddress((prev) => ({ ...prev, state: e.target.value }))}
          sx={{ mb: 3 }}
        />

        <Button variant="contained" size="large" fullWidth onClick={handleSave}>
          {t("save")}
        </Button>
      </Box>
    </Drawer>
  );
}
