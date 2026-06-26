"use client";

import { useEffect, useState } from "react";
import Drawer from "@mui/material/Drawer";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import FormControl from "@mui/material/FormControl";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import { useAppStore } from "@/lib/store";
import { Member, PaymentMode } from "@/lib/types";
import { addMonths } from "@/lib/calc";
import { MEMBERSHIP_DURATIONS, durationLabel, getMembershipPrice } from "@/lib/membership";
import { BOTTOM_SHEET_PAPER_SX } from "@/lib/sheetStyles";
import SheetHandle from "./SheetHandle";
import PaymentModeToggle from "./PaymentModeToggle";

export default function RenewMemberSheet({ member, onClose }: { member: Member | null; onClose: () => void }) {
  const { vehicleTypes, renewMember } = useAppStore();
  const [durationMonths, setDurationMonths] = useState(MEMBERSHIP_DURATIONS[0]);
  const [paymentMode, setPaymentMode] = useState<PaymentMode>("cash");
  const [renewing, setRenewing] = useState(false);

  useEffect(() => {
    if (member) setDurationMonths(member.durationMonths);
  }, [member]);

  if (!member) return null;

  const vehicleType = vehicleTypes.find((vt) => vt.id === member.vehicleTypeId)!;
  const amount = getMembershipPrice(vehicleType, durationMonths);
  const base = new Date(Math.max(new Date(member.expiryDate).getTime(), Date.now())).toISOString();
  const newExpiry = addMonths(base, durationMonths);

  const handleRenew = async () => {
    if (renewing) return;
    setRenewing(true);
    try {
      await renewMember(member.id, durationMonths, paymentMode);
      onClose();
    } finally {
      setRenewing(false);
    }
  };

  return (
    <Drawer anchor="bottom" open={!!member} onClose={onClose} slotProps={{ paper: { sx: BOTTOM_SHEET_PAPER_SX } }}>
      <Box sx={{ p: 3, pb: 4 }}>
        <SheetHandle />
        <Typography variant="h6" gutterBottom>
          Renew Membership
        </Typography>
        <Stack spacing={0.5} sx={{ mb: 3 }}>
          <Typography variant="body2" color="text.secondary">
            {member.vehicleNumber}
            {member.customerName ? ` · ${member.customerName}` : ""}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            New expiry:{" "}
            {new Date(newExpiry).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
          </Typography>
        </Stack>

        <Typography variant="caption" color="text.secondary">
          Membership Duration
        </Typography>
        <FormControl fullWidth sx={{ mt: 0.5, mb: 2 }}>
          <Select value={durationMonths} onChange={(e: SelectChangeEvent<number>) => setDurationMonths(Number(e.target.value))}>
            {MEMBERSHIP_DURATIONS.map((d) => (
              <MenuItem key={d} value={d}>
                {durationLabel(d)}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Typography variant="overline" color="text.secondary">
          Renewal fee
        </Typography>
        <Typography variant="h4" sx={{ mb: 3, fontWeight: 700 }}>
          ₹{amount}
        </Typography>

        <Typography variant="caption" color="text.secondary">
          Payment mode
        </Typography>
        <PaymentModeToggle value={paymentMode} onChange={setPaymentMode} sx={{ mt: 0.5, mb: 3 }} />

        <Button variant="contained" size="large" fullWidth disabled={renewing} onClick={handleRenew}>
          {renewing ? "Renewing…" : "Collect & Renew"}
        </Button>
      </Box>
    </Drawer>
  );
}
