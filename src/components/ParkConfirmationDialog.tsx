"use client";

import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Avatar from "@mui/material/Avatar";
import Stack from "@mui/material/Stack";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import PrintIcon from "@mui/icons-material/Print";
import { useAppStore } from "@/lib/store";
import { PaymentMode } from "@/lib/types";
import { TranslationKey } from "@/lib/i18n";
import { printThermalTicket } from "@/lib/printTicket";

export interface ParkConfirmation {
  tokenCode: string;
  vehicleTypeName: string;
  vehicleNumber: string;
  amountPaid: number;
  paymentMode?: PaymentMode;
  isMember: boolean;
  entryTime: string; // ISO
}

function vehicleTypeKey(name: string): TranslationKey {
  return name === "Bike" ? "vehicleTypeBike" : name === "Cycle" ? "vehicleTypeCycle" : "vehicleTypeCar";
}

export default function ParkConfirmationDialog({
  confirmation,
  onClose,
}: {
  confirmation: ParkConfirmation | null;
  onClose: () => void;
}) {
  const { t, businessName, language, thermalPaperWidth } = useAppStore();

  const handlePrint = () => {
    if (!confirmation) return;
    printThermalTicket({
      businessName,
      tokenCode: confirmation.tokenCode,
      vehicleTypeName: confirmation.vehicleTypeName,
      vehicleNumber: confirmation.vehicleNumber,
      entryTime: confirmation.entryTime,
      amountPaid: confirmation.amountPaid,
      paymentMode: confirmation.paymentMode,
      isMember: confirmation.isMember,
      language,
      paperWidth: thermalPaperWidth,
    });
  };

  return (
    <Dialog open={!!confirmation} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogContent sx={{ textAlign: "center", pt: 4 }}>
        <Avatar sx={{ bgcolor: "success.light", color: "success.dark", width: 64, height: 64, mx: "auto", mb: 2 }}>
          <CheckCircleIcon sx={{ fontSize: 36 }} />
        </Avatar>
        <Typography variant="h6" gutterBottom>
          {t("vehicleParkedSuccessfully")}
        </Typography>
        {confirmation && (
          <Stack spacing={0.75} sx={{ mt: 2 }}>
            <Typography variant="h5" sx={{ fontWeight: 700, letterSpacing: 1 }}>
              {confirmation.tokenCode}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {t(vehicleTypeKey(confirmation.vehicleTypeName))}
              {confirmation.vehicleNumber ? ` · ${confirmation.vehicleNumber}` : ""}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {confirmation.isMember
                ? t("memberNoCharge")
                : `₹${confirmation.amountPaid} ${t("amountCollectedSuffix")}`}
            </Typography>
          </Stack>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3, flexDirection: "column", gap: 1 }}>
        <Button
          variant="outlined"
          fullWidth
          size="large"
          startIcon={<PrintIcon />}
          onClick={handlePrint}
        >
          {t("printTicket")}
        </Button>
        <Button variant="contained" fullWidth size="large" onClick={onClose}>
          {t("done")}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
