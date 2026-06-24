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
import QrCode2Icon from "@mui/icons-material/QrCode2";
import { useAppStore } from "@/lib/store";
import { ParkingSession, PaymentMode } from "@/lib/types";
import { calculateAmount, durationHours, formatDuration } from "@/lib/calc";

export default function ParkOutSheet({
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
  const totalAmount = calculateAmount(vehicleType, hours);
  const balanceDue = Math.max(totalAmount - session.amountPaidAtEntry, 0);

  const handleComplete = () => {
    completeSession(session.id, totalAmount, balanceDue, balanceDue > 0 ? paymentMode : undefined);
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
            In: {new Date(session.entryTime).toLocaleString()}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Parked for {formatDuration(hours)}
          </Typography>
        </Stack>

        <Divider sx={{ mb: 2 }} />

        <Stack direction="row" sx={{ justifyContent: "space-between", mb: 0.5 }}>
          <Typography variant="body2" color="text.secondary">
            Total cost
          </Typography>
          <Typography variant="body2">₹{totalAmount}</Typography>
        </Stack>
        <Stack direction="row" sx={{ justifyContent: "space-between", mb: 1.5 }}>
          <Typography variant="body2" color="text.secondary">
            Already paid at entry
          </Typography>
          <Typography variant="body2">₹{session.amountPaidAtEntry}</Typography>
        </Stack>

        <Typography variant="overline" color="text.secondary">
          Balance due
        </Typography>
        <Typography variant="h3" sx={{ mb: 3 }}>
          ₹{balanceDue}
        </Typography>

        {balanceDue > 0 && (
          <>
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
              <ToggleButton value="cash">Cash</ToggleButton>
              <ToggleButton value="online">Online</ToggleButton>
            </ToggleButtonGroup>
          </>
        )}

        <Button variant="contained" size="large" fullWidth onClick={handleComplete}>
          {balanceDue > 0 ? "Collect Balance & Mark Out" : "Mark Vehicle Out"}
        </Button>
      </Box>
    </Drawer>
  );
}
