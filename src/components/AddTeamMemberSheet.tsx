"use client";

import { useState } from "react";
import Drawer from "@mui/material/Drawer";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import FormControl from "@mui/material/FormControl";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import SheetHandle from "./SheetHandle";
import { useAppStore } from "@/lib/store";
import { Role } from "@/lib/types";
import { BOTTOM_SHEET_PAPER_SX } from "@/lib/sheetStyles";

export default function AddTeamMemberSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { phone: ownPhone, teamInvites, addTeamInvite } = useAppStore();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [pin, setPin] = useState("");
  const [accessLevel, setAccessLevel] = useState<Role>("employee");
  const [error, setError] = useState("");

  const handleSave = () => {
    if (!name.trim()) {
      setError("Name is required");
      return;
    }
    if (phone.length !== 10) {
      setError("Enter a valid 10-digit phone number");
      return;
    }
    if (phone === ownPhone || teamInvites.some((inv) => inv.phone === phone)) {
      setError("This phone number is already invited");
      return;
    }
    if (pin.length !== 4) {
      setError("PIN must be exactly 4 digits");
      return;
    }
    addTeamInvite(name.trim(), phone, pin, accessLevel);
    setName("");
    setPhone("");
    setPin("");
    setAccessLevel("employee");
    setError("");
    onClose();
  };

  return (
    <Drawer anchor="bottom" open={open} onClose={onClose} slotProps={{ paper: { sx: BOTTOM_SHEET_PAPER_SX } }}>
      <Box sx={{ p: 3, pb: 4 }}>
        <SheetHandle />
        <Typography variant="h6" sx={{ mb: 2.5 }}>
          Add Team Member
        </Typography>

        <TextField label="Name" fullWidth autoFocus value={name} onChange={(e) => setName(e.target.value)} sx={{ mb: 2 }} />
        <TextField
          label="Phone number"
          fullWidth
          value={phone}
          onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
          slotProps={{ htmlInput: { inputMode: "numeric", pattern: "[0-9]*" } }}
          sx={{ mb: 2 }}
        />
        <TextField
          label="Invite PIN (4 digits)"
          fullWidth
          value={pin}
          onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
          slotProps={{ htmlInput: { inputMode: "numeric", pattern: "[0-9]*" } }}
          helperText="Share this PIN with them — they'll enter it instead of an OTP when signing up."
          sx={{ mb: 2 }}
        />

        <Typography variant="caption" color="text.secondary">
          Access Level
        </Typography>
        <FormControl fullWidth sx={{ mt: 0.5, mb: 0.5 }}>
          <Select value={accessLevel} onChange={(e: SelectChangeEvent) => setAccessLevel(e.target.value as Role)}>
            <MenuItem value="employee">Employee</MenuItem>
            <MenuItem value="admin">Admin</MenuItem>
          </Select>
        </FormControl>
        <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 2 }}>
          {accessLevel === "admin"
            ? "Full access, including Settings and Reports."
            : "Can log parking and expenses. No access to Settings or Reports."}
        </Typography>

        {error && (
          <Typography variant="caption" color="error" sx={{ display: "block", mb: 2 }}>
            {error}
          </Typography>
        )}

        <Button variant="contained" size="large" fullWidth onClick={handleSave}>
          Send Invite
        </Button>
      </Box>
    </Drawer>
  );
}
