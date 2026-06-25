"use client";

import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Avatar from "@mui/material/Avatar";
import Stack from "@mui/material/Stack";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

export interface ParkExitConfirmation {
  tokenCode: string;
  vehicleTypeName: string;
  vehicleNumber: string;
  totalAmount: number;
  duration: string;
  isMember: boolean;
}

export default function ParkExitConfirmationDialog({
  confirmation,
  onClose,
}: {
  confirmation: ParkExitConfirmation | null;
  onClose: () => void;
}) {
  return (
    <Dialog open={!!confirmation} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogContent sx={{ textAlign: "center", pt: 4 }}>
        <Avatar sx={{ bgcolor: "success.light", color: "success.dark", width: 64, height: 64, mx: "auto", mb: 2 }}>
          <CheckCircleIcon sx={{ fontSize: 36 }} />
        </Avatar>
        <Typography variant="h6" gutterBottom>
          Vehicle Exited Successfully
        </Typography>
        {confirmation && (
          <Stack spacing={0.75} sx={{ mt: 2 }}>
            <Typography variant="h5" sx={{ fontWeight: 700, letterSpacing: 1 }}>
              {confirmation.tokenCode}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {confirmation.vehicleTypeName}
              {confirmation.vehicleNumber ? ` · ${confirmation.vehicleNumber}` : ""}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Parked for {confirmation.duration}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {confirmation.isMember ? "Member — no charge" : `₹${confirmation.totalAmount} total collected`}
            </Typography>
          </Stack>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button variant="contained" fullWidth size="large" onClick={onClose}>
          Done
        </Button>
      </DialogActions>
    </Dialog>
  );
}
