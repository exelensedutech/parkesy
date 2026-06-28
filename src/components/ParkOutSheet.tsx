"use client";

import { useEffect, useState } from "react";
import Drawer from "@mui/material/Drawer";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import Stack from "@mui/material/Stack";
import Avatar from "@mui/material/Avatar";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import QrCode2Icon from "@mui/icons-material/QrCode2";
import CardMembershipIcon from "@mui/icons-material/CardMembership";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import EditIcon from "@mui/icons-material/Edit";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import Alert from "@mui/material/Alert";
import SheetHandle from "./SheetHandle";
import PaymentModeToggle from "./PaymentModeToggle";
import { useAppStore } from "@/lib/store";
import { ParkingSession, PaymentMode } from "@/lib/types";
import { calculateAmount, durationHours, formatDuration } from "@/lib/calc";
import { ParkExitConfirmation } from "./ParkExitConfirmationDialog";
import { BOTTOM_SHEET_PAPER_SX } from "@/lib/sheetStyles";

function vehicleTypeKey(name: string): "vehicleTypeBike" | "vehicleTypeCycle" | "vehicleTypeCar" {
  return name === "Bike" ? "vehicleTypeBike" : name === "Cycle" ? "vehicleTypeCycle" : "vehicleTypeCar";
}

export default function ParkOutSheet({
  session,
  onClose,
  onCompleted,
}: {
  session: ParkingSession | null;
  onClose: () => void;
  onCompleted: (confirmation: ParkExitConfirmation) => void;
}) {
  const { vehicleTypes, completeSession, updateSessionVehicleNumber, getSignedPhotoUrl, language, t } = useAppStore();
  const [paymentMode, setPaymentMode] = useState<PaymentMode>("cash");
  const [hours, setHours] = useState(0);
  const [completing, setCompleting] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [signedPhotoUrl, setSignedPhotoUrl] = useState<string | null>(null);
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);
  const [editingNumber, setEditingNumber] = useState(false);
  const [numberDraft, setNumberDraft] = useState("");
  const [displayNumber, setDisplayNumber] = useState("");

  useEffect(() => {
    if (!session) return;
    setHours(durationHours(session.entryTime));
    const interval = setInterval(() => setHours(durationHours(session.entryTime)), 15000);
    return () => clearInterval(interval);
  }, [session]);

  useEffect(() => {
    if (session) {
      setDisplayNumber(session.vehicleNumber);
      setEditingNumber(false);
    }
    // Only reset when a different session is opened, not on every store re-render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.id]);

  useEffect(() => {
    setSignedPhotoUrl(null);
    if (session?.vehiclePhotoUrl) {
      getSignedPhotoUrl(session.vehiclePhotoUrl).then(setSignedPhotoUrl);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.vehiclePhotoUrl]);

  if (!session) return null;

  const vehicleType = vehicleTypes.find((vt) => vt.id === session.vehicleTypeId)!;
  const isMemberVisit = Boolean(session.memberId);
  const totalAmount = isMemberVisit ? 0 : calculateAmount(vehicleType, hours);
  const balance = isMemberVisit ? 0 : totalAmount - session.amountPaidAtEntry;
  const isRefund = balance < 0;
  const settlementAmount = Math.abs(balance);

  const handleComplete = async () => {
    if (completing) return;
    setCompleting(true);
    // The estimate above (totalAmount/balance) is for instant on-screen display
    // only — the server recomputes the real total and balance at this exact
    // moment and that's what's actually written to the database.
    const updated = await completeSession(session.id, balance !== 0 ? paymentMode : undefined);
    setCompleting(false);
    if (!updated) return;
    const finalBalance = updated.amountPaidAtExit ?? 0;
    onCompleted({
      tokenCode: updated.tokenCode,
      vehicleTypeName: vehicleType.name,
      vehicleNumber: displayNumber,
      totalAmount: updated.totalAmount ?? 0,
      duration: formatDuration(hours),
      isMember: isMemberVisit,
      refundAmount: finalBalance < 0 ? Math.abs(finalBalance) : undefined,
    });
    onClose();
  };

  const handleEditClick = () => {
    setMenuAnchor(null);
    setNumberDraft(displayNumber);
    setEditingNumber(true);
  };

  const handleSaveNumber = () => {
    const trimmed = numberDraft.trim().toUpperCase();
    if (!trimmed) return;
    updateSessionVehicleNumber(session.id, trimmed);
    setDisplayNumber(trimmed);
    setEditingNumber(false);
  };

  return (
    <Drawer anchor="bottom" open={!!session} onClose={onClose} slotProps={{ paper: { sx: BOTTOM_SHEET_PAPER_SX } }}>
      <Box sx={{ p: 3, pb: 4 }}>
        <SheetHandle />
        <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "center", mb: 2 }}>
          <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
            <QrCode2Icon color="primary" />
            <Typography variant="h6">{session.tokenCode}</Typography>
          </Stack>
          <Stack direction="row" spacing={0.5} sx={{ alignItems: "center" }}>
            {signedPhotoUrl && (
              <Avatar
                src={signedPhotoUrl}
                variant="rounded"
                sx={{ width: 48, height: 48, cursor: "pointer" }}
                onClick={() => setPreviewOpen(true)}
              />
            )}
            <IconButton onClick={(e) => setMenuAnchor(e.currentTarget)} aria-label="More options">
              <MoreVertIcon />
            </IconButton>
            <Menu anchorEl={menuAnchor} open={!!menuAnchor} onClose={() => setMenuAnchor(null)}>
              <MenuItem onClick={handleEditClick}>
                <ListItemIcon>
                  <EditIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>{t("editVehicleNumber")}</ListItemText>
              </MenuItem>
            </Menu>
          </Stack>
        </Stack>

        <Stack spacing={0.5} sx={{ mb: 2 }}>
          {editingNumber ? (
            <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
              <TextField
                size="small"
                label={t("vehicleNumber")}
                fullWidth
                autoFocus
                value={numberDraft}
                onChange={(e) => setNumberDraft(e.target.value)}
              />
              <IconButton color="primary" onClick={handleSaveNumber} aria-label="Save">
                <CheckIcon />
              </IconButton>
              <IconButton onClick={() => setEditingNumber(false)} aria-label="Cancel">
                <CloseIcon />
              </IconButton>
            </Stack>
          ) : (
            <Typography variant="body2" color="text.secondary">
              {t(vehicleTypeKey(vehicleType.name))}
              {displayNumber ? ` · ${displayNumber}` : ""}
            </Typography>
          )}
          <Typography variant="body2" color="text.secondary">
            {t("inLabel")}:{" "}
            {new Date(session.entryTime).toLocaleString(language === "ta" ? "ta-IN" : "en-IN", {
              day: "numeric",
              month: "short",
              hour: "numeric",
              minute: "2-digit",
              timeZone: "Asia/Kolkata",
            })}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {t("parkedFor")} {formatDuration(hours)}
          </Typography>
        </Stack>

        <Divider sx={{ mb: 2 }} />

        {isMemberVisit ? (
          <Alert icon={<CardMembershipIcon fontSize="inherit" />} severity="success" sx={{ mb: 3 }}>
            {t("memberVisitNoCharge")}
          </Alert>
        ) : (
          <>
            <Stack direction="row" sx={{ justifyContent: "space-between", mb: 0.5 }}>
              <Typography variant="body2" color="text.secondary">
                {t("totalCost")}
              </Typography>
              <Typography variant="body2">₹{totalAmount}</Typography>
            </Stack>
            <Stack direction="row" sx={{ justifyContent: "space-between", mb: 1.5 }}>
              <Typography variant="body2" color="text.secondary">
                {t("alreadyPaidAtEntry")}
              </Typography>
              <Typography variant="body2">₹{session.amountPaidAtEntry}</Typography>
            </Stack>

            <Typography variant="overline" color={isRefund ? "error" : "text.secondary"}>
              {isRefund ? t("refundToCustomer") : t("balanceDue")}
            </Typography>
            <Typography variant="h3" sx={{ mb: 3 }} color={isRefund ? "error.main" : "text.primary"}>
              {isRefund ? "-" : ""}₹{settlementAmount}
            </Typography>
          </>
        )}

        {settlementAmount > 0 && (
          <>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              {isRefund ? t("refundVia") : t("paymentMode")}
            </Typography>
            <PaymentModeToggle value={paymentMode} onChange={setPaymentMode} sx={{ mb: 3 }} />
          </>
        )}

        <Button variant="contained" size="large" fullWidth disabled={completing} onClick={handleComplete}>
          {completing
            ? t("markingOut")
            : isRefund
              ? t("refundAndMarkOut")
              : settlementAmount > 0
                ? t("collectBalanceAndMarkOut")
                : t("markVehicleOut")}
        </Button>
      </Box>

      <Dialog open={previewOpen} onClose={() => setPreviewOpen(false)} maxWidth="xs" fullWidth>
        <DialogContent sx={{ p: 0 }}>
          {signedPhotoUrl && (
            <Box component="img" src={signedPhotoUrl} alt="Vehicle" sx={{ width: "100%", display: "block" }} />
          )}
        </DialogContent>
      </Dialog>
    </Drawer>
  );
}
