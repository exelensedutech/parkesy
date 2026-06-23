"use client";

import { useEffect, useState } from "react";
import Drawer from "@mui/material/Drawer";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import ToggleButton from "@mui/material/ToggleButton";
import Divider from "@mui/material/Divider";
import Stack from "@mui/material/Stack";
import PaymentsIcon from "@mui/icons-material/Payments";
import QrCode2Icon from "@mui/icons-material/QrCode2";
import { useAppStore } from "@/lib/store";
import { ParkingSession, PaymentMode } from "@/lib/types";
import { calculateAmount, durationHours, formatDuration } from "@/lib/calc";

export default function ExitSheet({
  session,
  onClose,
}: {
  session: ParkingSession | null;
  onClose: () => void;
}) {
  const { vehicleTypes, completeSession } = useAppStore();
  const [paymentMode, setPaymentMode] = useState<PaymentMode>("cash");
  const [hours, setHours] = useState(0);

  useEffect(() => {
    if (!session) return;
    setHours(durationHours(session.entryTime));
    const interval = setInterval(() => setHours(durationHours(session.entryTime)), 15000);
    return () => clearInterval(interval);
  }, [session]);

  if (!session) return null;

  const vehicleType = vehicleTypes.find((vt) => vt.id === session.vehicleTypeId)!;
  const amount = calculateAmount(vehicleType, hours);

  const handleComplete = () => {
    completeSession(session.id, amount, paymentMode);
    onClose();
  };

  return (
    <Drawer
      anchor="bottom"
      open={!!session}
      onClose={onClose}
      slotProps={{ paper: { sx: { borderTopLeftRadius: 20, borderTopRightRadius: 20 } } }}
    >
      <Box sx={{ p: 3, pb: 4 }}>
        <Stack direction="row" spacing={1} sx={{ alignItems: "center", mb: 2 }}>
          <QrCode2Icon color="primary" />
          <Typography variant="h6">{session.tokenCode}</Typography>
        </Stack>

        <Stack spacing={0.5} sx={{ mb: 2 }}>
          <Typography variant="body2" color="text.secondary">
            {vehicleType.name}
            {session.vehicleNumber ? ` · ${session.vehicleNumber}` : ""}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Parked for {formatDuration(hours)}
          </Typography>
        </Stack>

        <Divider sx={{ mb: 2 }} />

        <Typography variant="overline" color="text.secondary">
          Amount due
        </Typography>
        <Typography variant="h3" sx={{ mb: 3 }}>
          ₹{amount}
        </Typography>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          Payment mode
        </Typography>
        <ToggleButtonGroup
          value={paymentMode}
          exclusive
          onChange={(_, value) => value && setPaymentMode(value)}
          fullWidth
          sx={{ mb: 3 }}
        >
          <ToggleButton value="cash">
            <Stack spacing={0.5} sx={{ alignItems: "center", py: 0.5 }}>
              <PaymentsIcon />
              <Typography variant="caption">Cash</Typography>
            </Stack>
          </ToggleButton>
          <ToggleButton value="gpay">
            <Stack spacing={0.5} sx={{ alignItems: "center", py: 0.5 }}>
              <QrCode2Icon />
              <Typography variant="caption">GPay</Typography>
            </Stack>
          </ToggleButton>
        </ToggleButtonGroup>

        <Button variant="contained" size="large" fullWidth onClick={handleComplete}>
          Collect &amp; Complete
        </Button>
      </Box>
    </Drawer>
  );
}
