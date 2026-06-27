"use client";

import { useEffect, useState } from "react";
import Drawer from "@mui/material/Drawer";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import Divider from "@mui/material/Divider";
import Avatar from "@mui/material/Avatar";
import Stack from "@mui/material/Stack";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import ToggleButton from "@mui/material/ToggleButton";
import LogoutIcon from "@mui/icons-material/Logout";
import SheetHandle from "./SheetHandle";
import { useAppStore } from "@/lib/store";
import { Address, Language } from "@/lib/types";
import { BOTTOM_SHEET_PAPER_SX } from "@/lib/sheetStyles";

export default function UserProfileSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { userName, userAddress, phone, role, language, setLanguage, updateUserProfile, logout } = useAppStore();
  const [name, setName] = useState(userName);
  const [address, setAddress] = useState<Address>(userAddress);

  useEffect(() => {
    if (open) {
      setName(userName);
      setAddress(userAddress);
    }
  }, [open, userName, userAddress]);

  const handleSave = () => {
    updateUserProfile(name.trim() || userName, address);
    onClose();
  };

  const handleLogout = () => {
    onClose();
    logout();
  };

  return (
    <Drawer anchor="bottom" open={open} onClose={onClose} slotProps={{ paper: { sx: BOTTOM_SHEET_PAPER_SX } }}>
      <Box sx={{ p: 3, pb: 4 }}>
        <SheetHandle />
        <Stack direction="row" spacing={1.5} sx={{ alignItems: "center", mb: 2.5 }}>
          <Avatar sx={{ width: 44, height: 44 }}>{(userName || "?").charAt(0).toUpperCase()}</Avatar>
          <Box>
            <Typography variant="h6">{userName || "Your Profile"}</Typography>
            <Typography variant="caption" color="text.secondary">
              {role === "admin" ? "Admin" : "Employee"} · {phone}
            </Typography>
          </Box>
        </Stack>

        <Typography variant="caption" color="text.secondary">
          Language
        </Typography>
        <ToggleButtonGroup
          value={language}
          exclusive
          fullWidth
          onChange={(_, value: Language | null) => value && setLanguage(value)}
          sx={{ mt: 0.5, mb: 2.5 }}
        >
          <ToggleButton value="en">English</ToggleButton>
          <ToggleButton value="ta">தமிழ்</ToggleButton>
        </ToggleButtonGroup>

        <TextField label="Name" fullWidth value={name} onChange={(e) => setName(e.target.value)} sx={{ mb: 2 }} />

        <Divider sx={{ mb: 2 }} />
        <Typography variant="subtitle2" sx={{ mb: 1.5 }}>
          Address
        </Typography>

        <TextField
          label="Door No & Street"
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
              label="City"
              fullWidth
              value={address.city ?? ""}
              onChange={(e) => setAddress((prev) => ({ ...prev, city: e.target.value }))}
            />
          </Grid>
          <Grid size={6}>
            <TextField
              label="Pincode"
              fullWidth
              value={address.pincode ?? ""}
              onChange={(e) => setAddress((prev) => ({ ...prev, pincode: e.target.value.replace(/\D/g, "").slice(0, 6) }))}
            />
          </Grid>
        </Grid>
        <TextField
          label="State"
          fullWidth
          value={address.state ?? ""}
          onChange={(e) => setAddress((prev) => ({ ...prev, state: e.target.value }))}
          sx={{ mb: 3 }}
        />

        <Button variant="contained" size="large" fullWidth onClick={handleSave} sx={{ mb: 1.5 }}>
          Save
        </Button>
        <Button variant="outlined" color="error" size="large" fullWidth startIcon={<LogoutIcon />} onClick={handleLogout}>
          Log Out
        </Button>
      </Box>
    </Drawer>
  );
}
