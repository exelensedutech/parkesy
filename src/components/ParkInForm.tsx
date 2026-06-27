"use client";

import { useEffect, useRef, useState } from "react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import Avatar from "@mui/material/Avatar";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import Alert from "@mui/material/Alert";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Drawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import Divider from "@mui/material/Divider";
import CameraAltIcon from "@mui/icons-material/CameraAlt";
import DeleteIcon from "@mui/icons-material/Delete";
import PaymentsIcon from "@mui/icons-material/Payments";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import CardMembershipIcon from "@mui/icons-material/CardMembership";
import { alpha } from "@mui/material/styles";
import VehicleIcon from "./VehicleIcon";
import SheetHandle from "./SheetHandle";
import ParkConfirmationDialog, { ParkConfirmation } from "./ParkConfirmationDialog";
import { useAppStore } from "@/lib/store";
import { PaymentMode } from "@/lib/types";
import { VEHICLE_COLORS, CASH_COLOR, ONLINE_COLOR } from "@/lib/colors";
import { BOTTOM_SHEET_PAPER_SX } from "@/lib/sheetStyles";

export default function ParkInForm() {
  const { vehicleTypes, startSession, findMatchingMembers, uploadPhoto, vehicleNumberCaptureMode, collectAtCheckIn } =
    useAppStore();
  const isLast4Mode = vehicleNumberCaptureMode === "last4";
  const [vehicleTypeId, setVehicleTypeId] = useState(vehicleTypes[0].id);
  const [vehicleNumber, setVehicleNumber] = useState("");
  const [amountPaid, setAmountPaid] = useState("");
  const [paymentMode, setPaymentMode] = useState<PaymentMode>("cash");
  const [numberError, setNumberError] = useState("");
  const [confirmation, setConfirmation] = useState<ParkConfirmation | null>(null);
  const [photoUrl, setPhotoUrl] = useState<string | undefined>();
  const [photoFile, setPhotoFile] = useState<File | undefined>();
  const [previewOpen, setPreviewOpen] = useState(false);
  const [selectedMemberId, setSelectedMemberId] = useState<string | undefined>();
  const [noneSelected, setNoneSelected] = useState(false);
  const [memberPickerOpen, setMemberPickerOpen] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const selectedVehicleType = vehicleTypes.find((vt) => vt.id === vehicleTypeId)!;
  const isCycle = selectedVehicleType.name === "Cycle";
  const matchingMembers = !isCycle ? findMatchingMembers(vehicleTypeId, vehicleNumber) : [];
  const activeMember =
    matchingMembers.length === 1
      ? matchingMembers[0]
      : matchingMembers.length > 1
        ? matchingMembers.find((m) => m.id === selectedMemberId)
        : undefined;
  const isAmbiguous = matchingMembers.length > 1 && !activeMember && !noneSelected;

  // The set of possible matches changes whenever the typed number or vehicle
  // type changes — any previous explicit choice no longer applies.
  useEffect(() => {
    setSelectedMemberId(undefined);
    setNoneSelected(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vehicleNumber, vehicleTypeId]);

  const handlePhotoSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // Only one photo per vehicle — discard whatever was captured before.
    if (photoUrl) URL.revokeObjectURL(photoUrl);
    setPhotoUrl(URL.createObjectURL(file));
    setPhotoFile(file);
  };

  const handleDeletePhoto = () => {
    if (photoUrl) URL.revokeObjectURL(photoUrl);
    setPhotoUrl(undefined);
    setPhotoFile(undefined);
    setPreviewOpen(false);
  };

  const handleRetakePhoto = () => {
    setPreviewOpen(false);
    fileInputRef.current?.click();
  };

  const paidValue = parseFloat(amountPaid) || 0;

  const [parking, setParking] = useState(false);

  const handlePark = async () => {
    if (!isCycle && !vehicleNumber.trim()) {
      setNumberError("Vehicle number is required");
      return;
    }
    if (parking) return;

    const finalVehicleNumber = isCycle ? "" : vehicleNumber.trim().toUpperCase();
    setParking(true);
    try {
      const uploadedPhotoPath = photoFile ? await uploadPhoto(photoFile) : undefined;
      const tokenCode = await startSession(
        vehicleTypeId,
        finalVehicleNumber,
        paidValue,
        paidValue > 0 ? paymentMode : undefined,
        uploadedPhotoPath,
        activeMember?.id
      );
      setConfirmation({
        tokenCode,
        vehicleTypeName: selectedVehicleType.name,
        vehicleNumber: finalVehicleNumber,
        amountPaid: paidValue,
        isMember: Boolean(activeMember),
      });
      setVehicleNumber("");
      setAmountPaid("");
      setNumberError("");
      if (photoUrl) URL.revokeObjectURL(photoUrl);
      setPhotoUrl(undefined);
      setPhotoFile(undefined);
    } catch {
      setNumberError("Could not park the vehicle — please try again");
    } finally {
      setParking(false);
    }
  };

  return (
    <Box>
      <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
        Vehicle Details
      </Typography>
      <Card sx={{ mb: 2.5 }}>
        <CardContent>
          <Typography variant="caption" color="text.secondary">
            Vehicle Type
          </Typography>
          <Grid container spacing={1.5} sx={{ mt: 0.5, mb: 2.5 }}>
            {vehicleTypes.map((vt) => {
              const color = VEHICLE_COLORS[vt.name];
              const selected = vt.id === vehicleTypeId;
              return (
                <Grid size={4} key={vt.id}>
                  <Card
                    variant="outlined"
                    onClick={() => setVehicleTypeId(vt.id)}
                    sx={{
                      cursor: "pointer",
                      textAlign: "center",
                      py: 1.25,
                      bgcolor: selected ? alpha(color, 0.1) : "background.paper",
                      borderColor: selected ? color : "divider",
                      borderWidth: selected ? 2 : 1,
                    }}
                  >
                    <Avatar
                      sx={{
                        bgcolor: selected ? color : alpha(color, 0.15),
                        color: selected ? "white" : color,
                        width: 36,
                        height: 36,
                        mx: "auto",
                        mb: 0.5,
                      }}
                    >
                      <VehicleIcon name={vt.name} />
                    </Avatar>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: selected ? color : "text.primary" }}>
                      {vt.name}
                    </Typography>
                  </Card>
                </Grid>
              );
            })}
          </Grid>

          {!isCycle && (
            <TextField
              label={isLast4Mode ? "Last 4 digits" : "Vehicle number"}
              fullWidth
              value={vehicleNumber}
              onChange={(e) => {
                const next = isLast4Mode ? e.target.value.replace(/\D/g, "").slice(0, 4) : e.target.value;
                setVehicleNumber(next);
                setNumberError("");
              }}
              error={Boolean(numberError)}
              helperText={numberError || " "}
              slotProps={{
                htmlInput: isLast4Mode ? { inputMode: "numeric", pattern: "[0-9]*", maxLength: 4 } : undefined,
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => fileInputRef.current?.click()} edge="end">
                        <CameraAltIcon color={photoUrl ? "primary" : "action"} />
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
            />
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            style={{ display: "none" }}
            onChange={handlePhotoSelected}
          />

          {photoUrl && (
            <Stack direction="row" spacing={1.5} sx={{ alignItems: "center", mt: 1.5 }}>
              <Avatar
                src={photoUrl}
                variant="rounded"
                sx={{ width: 56, height: 56, cursor: "pointer" }}
                onClick={() => setPreviewOpen(true)}
              />
              <Typography variant="body2" color="text.secondary">
                Vehicle photo captured — tap to view
              </Typography>
            </Stack>
          )}

          {isAmbiguous && (
            <Alert
              icon={<CardMembershipIcon fontSize="inherit" />}
              severity="info"
              sx={{ mt: 1.5, cursor: "pointer" }}
              onClick={() => setMemberPickerOpen(true)}
            >
              {matchingMembers.length} {selectedVehicleType.name.toLowerCase()}s found with this number — tap to
              confirm which one
            </Alert>
          )}

          {activeMember && (
            <Alert
              icon={<CardMembershipIcon fontSize="inherit" />}
              severity="success"
              sx={{ mt: 1.5, cursor: matchingMembers.length > 1 ? "pointer" : undefined }}
              onClick={matchingMembers.length > 1 ? () => setMemberPickerOpen(true) : undefined}
            >
              Member{activeMember.customerName ? ` — ${activeMember.customerName}` : ""} ({activeMember.vehicleNumber}
              ) · valid till{" "}
              {new Date(activeMember.expiryDate).toLocaleDateString("en-IN", { day: "numeric", month: "short" })} ·
              Entry is free{matchingMembers.length > 1 ? " · tap to change" : ""}
            </Alert>
          )}

          {noneSelected && matchingMembers.length > 1 && (
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: "block", mt: 1, cursor: "pointer" }}
              onClick={() => setMemberPickerOpen(true)}
            >
              Not matched to a member · tap to check matches
            </Typography>
          )}
        </CardContent>
      </Card>

      {!activeMember && collectAtCheckIn && (
        <>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
            Payment
          </Typography>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <TextField
                label="Amount paid"
                type="number"
                fullWidth
                value={amountPaid}
                onChange={(e) => setAmountPaid(e.target.value)}
                slotProps={{ input: { startAdornment: <InputAdornment position="start">₹</InputAdornment> } }}
                sx={{ mb: paidValue > 0 ? 1 : 0 }}
              />

              {paidValue > 0 && (
                <>
                  <Typography variant="caption" color="text.secondary">
                    Payment mode
                  </Typography>
                  <Grid container spacing={1.5} sx={{ mt: 0.5 }}>
                    {(
                      [
                        { mode: "cash" as PaymentMode, label: "Cash", icon: <PaymentsIcon />, color: CASH_COLOR },
                        { mode: "online" as PaymentMode, label: "Online", icon: <CreditCardIcon />, color: ONLINE_COLOR },
                      ]
                    ).map((opt) => {
                      const selected = paymentMode === opt.mode;
                      return (
                        <Grid size={6} key={opt.mode}>
                          <Card
                            variant="outlined"
                            onClick={() => setPaymentMode(opt.mode)}
                            sx={{
                              cursor: "pointer",
                              textAlign: "center",
                              py: 1.25,
                              bgcolor: selected ? alpha(opt.color, 0.1) : "background.paper",
                              borderColor: selected ? opt.color : "divider",
                              borderWidth: selected ? 2 : 1,
                            }}
                          >
                            <Avatar
                              sx={{
                                bgcolor: selected ? opt.color : alpha(opt.color, 0.15),
                                color: selected ? "white" : opt.color,
                                width: 36,
                                height: 36,
                                mx: "auto",
                                mb: 0.5,
                              }}
                            >
                              {opt.icon}
                            </Avatar>
                            <Typography
                              variant="body2"
                              sx={{ fontWeight: 600, color: selected ? opt.color : "text.primary" }}
                            >
                              {opt.label}
                            </Typography>
                          </Card>
                        </Grid>
                      );
                    })}
                  </Grid>
                </>
              )}
            </CardContent>
          </Card>
        </>
      )}

      <Button
        variant="contained"
        size="large"
        fullWidth
        disabled={parking}
        onClick={handlePark}
        sx={{ borderRadius: 6, py: 1.3, fontWeight: 600, boxShadow: "0 6px 16px rgba(0,101,143,0.35)" }}
      >
        {parking ? "Issuing Ticket…" : "Park & Issue Ticket"}
      </Button>

      <ParkConfirmationDialog confirmation={confirmation} onClose={() => setConfirmation(null)} />

      <Drawer
        anchor="bottom"
        open={memberPickerOpen}
        onClose={() => setMemberPickerOpen(false)}
        slotProps={{ paper: { sx: BOTTOM_SHEET_PAPER_SX } }}
      >
        <Box sx={{ pt: 1.5, pb: 1 }}>
          <SheetHandle />
          <Typography variant="h6" sx={{ px: 3, mb: 1.5 }}>
            Which vehicle is this?
          </Typography>
          <List sx={{ py: 0 }}>
            {matchingMembers.map((m) => (
              <ListItemButton
                key={m.id}
                selected={m.id === selectedMemberId}
                onClick={() => {
                  setSelectedMemberId(m.id);
                  setNoneSelected(false);
                  setMemberPickerOpen(false);
                }}
              >
                <ListItemText primary={m.vehicleNumber} secondary={m.customerName || undefined} />
              </ListItemButton>
            ))}
          </List>
          <Divider />
          <ListItemButton
            onClick={() => {
              setSelectedMemberId(undefined);
              setNoneSelected(true);
              setMemberPickerOpen(false);
            }}
          >
            <ListItemText primary="None of these" secondary="Charge as a regular entry" />
          </ListItemButton>
        </Box>
      </Drawer>

      <Dialog open={previewOpen} onClose={() => setPreviewOpen(false)} maxWidth="xs" fullWidth>
        <DialogContent sx={{ p: 0 }}>
          {photoUrl && <Box component="img" src={photoUrl} alt="Vehicle" sx={{ width: "100%", display: "block" }} />}
        </DialogContent>
        <DialogActions sx={{ justifyContent: "space-between", px: 2, py: 1.5 }}>
          <Button color="error" startIcon={<DeleteIcon />} onClick={handleDeletePhoto}>
            Delete
          </Button>
          <Button startIcon={<CameraAltIcon />} onClick={handleRetakePhoto}>
            Retake
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
