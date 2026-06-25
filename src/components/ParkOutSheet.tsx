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
import Avatar from "@mui/material/Avatar";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import QrCode2Icon from "@mui/icons-material/QrCode2";
import CardMembershipIcon from "@mui/icons-material/CardMembership";
import Alert from "@mui/material/Alert";
import { useAppStore } from "@/lib/store";
import { ParkingSession, PaymentMode } from "@/lib/types";
import { calculateAmount, durationHours, formatDuration } from "@/lib/calc";
import { ParkExitConfirmation } from "./ParkExitConfirmationDialog";

export default function ParkOutSheet({
  session,
  onClose,
  onCompleted,
}: {
  session: ParkingSession | null;
  onClose: () => void;
  onCompleted: (confirmation: ParkExitConfirmation) => void;
}) {
  const { vehicleTypes, completeSession } = useAppStore();
  const [paymentMode, setPaymentMode] = useState<PaymentMode>("cash");
  const [hours, setHours] = useState(0);
  const [previewOpen, setPreviewOpen] = useState(false);

  useEffect(() => {
    if (!session) return;
    setHours(durationHours(session.entryTime));
    const interval = setInterval(() => setHours(durationHours(session.entryTime)), 15000);
    return () => clearInterval(interval);
  }, [session]);

  if (!session) return null;

  const vehicleType = vehicleTypes.find((vt) => vt.id === session.vehicleTypeId)!;
  const isMemberVisit = Boolean(session.memberId);
  const totalAmount = isMemberVisit ? 0 : calculateAmount(vehicleType, hours);
  const balanceDue = isMemberVisit ? 0 : Math.max(totalAmount - session.amountPaidAtEntry, 0);

  const handleComplete = () => {
    completeSession(session.id, totalAmount, balanceDue, balanceDue > 0 ? paymentMode : undefined);
    onCompleted({
      tokenCode: session.tokenCode,
      vehicleTypeName: vehicleType.name,
      vehicleNumber: session.vehicleNumber,
      totalAmount,
      duration: formatDuration(hours),
      isMember: isMemberVisit,
    });
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
        <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "center", mb: 2 }}>
          <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
            <QrCode2Icon color="primary" />
            <Typography variant="h6">{session.tokenCode}</Typography>
          </Stack>
          {session.vehiclePhotoUrl && (
            <Avatar
              src={session.vehiclePhotoUrl}
              variant="rounded"
              sx={{ width: 48, height: 48, cursor: "pointer" }}
              onClick={() => setPreviewOpen(true)}
            />
          )}
        </Stack>

        <Stack spacing={0.5} sx={{ mb: 2 }}>
          <Typography variant="body2" color="text.secondary">
            {vehicleType.name}
            {session.vehicleNumber ? ` · ${session.vehicleNumber}` : ""}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            In:{" "}
            {new Date(session.entryTime).toLocaleString("en-IN", {
              day: "numeric",
              month: "short",
              hour: "numeric",
              minute: "2-digit",
            })}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Parked for {formatDuration(hours)}
          </Typography>
        </Stack>

        <Divider sx={{ mb: 2 }} />

        {isMemberVisit ? (
          <Alert icon={<CardMembershipIcon fontSize="inherit" />} severity="success" sx={{ mb: 3 }}>
            Member visit — no charge
          </Alert>
        ) : (
          <>
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
          </>
        )}

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

      <Dialog open={previewOpen} onClose={() => setPreviewOpen(false)} maxWidth="xs" fullWidth>
        <DialogContent sx={{ p: 0 }}>
          {session.vehiclePhotoUrl && (
            <Box component="img" src={session.vehiclePhotoUrl} alt="Vehicle" sx={{ width: "100%", display: "block" }} />
          )}
        </DialogContent>
      </Dialog>
    </Drawer>
  );
}
