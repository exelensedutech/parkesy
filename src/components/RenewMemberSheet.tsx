"use client";

import { useState } from "react";
import Drawer from "@mui/material/Drawer";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import ToggleButton from "@mui/material/ToggleButton";
import { useAppStore } from "@/lib/store";
import { Member, PaymentMode } from "@/lib/types";
import { addOneMonth } from "@/lib/calc";
import { CASH_COLOR, ONLINE_COLOR } from "@/lib/colors";

export default function RenewMemberSheet({ member, onClose }: { member: Member | null; onClose: () => void }) {
  const { renewMember } = useAppStore();
  const [paymentMode, setPaymentMode] = useState<PaymentMode>("cash");

  if (!member) return null;

  const base = new Date(Math.max(new Date(member.expiryDate).getTime(), Date.now())).toISOString();
  const newExpiry = addOneMonth(base);

  const handleRenew = () => {
    renewMember(member.id, paymentMode);
    onClose();
  };

  return (
    <Drawer
      anchor="bottom"
      open={!!member}
      onClose={onClose}
      slotProps={{ paper: { sx: { borderTopLeftRadius: 20, borderTopRightRadius: 20 } } }}
    >
      <Box sx={{ p: 3, pb: 4 }}>
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

        <Typography variant="overline" color="text.secondary">
          Renewal fee
        </Typography>
        <Typography variant="h4" sx={{ mb: 3, fontWeight: 700 }}>
          ₹{member.monthlyFee}
        </Typography>

        <Typography variant="caption" color="text.secondary">
          Payment mode
        </Typography>
        <ToggleButtonGroup
          value={paymentMode}
          exclusive
          onChange={(_, value) => value && setPaymentMode(value)}
          fullWidth
          sx={{ mt: 0.5, mb: 3 }}
        >
          <ToggleButton value="cash" sx={{ color: CASH_COLOR }}>
            Cash
          </ToggleButton>
          <ToggleButton value="online" sx={{ color: ONLINE_COLOR }}>
            Online
          </ToggleButton>
        </ToggleButtonGroup>

        <Button variant="contained" size="large" fullWidth onClick={handleRenew}>
          Collect &amp; Renew
        </Button>
      </Box>
    </Drawer>
  );
}
