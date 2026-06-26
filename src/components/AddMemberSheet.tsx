"use client";

import { useRef, useState } from "react";
import Drawer from "@mui/material/Drawer";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Avatar from "@mui/material/Avatar";
import FormControl from "@mui/material/FormControl";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import Divider from "@mui/material/Divider";
import Grid from "@mui/material/Grid";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import CameraAltIcon from "@mui/icons-material/CameraAlt";
import DeleteIcon from "@mui/icons-material/Delete";
import VehicleIcon from "./VehicleIcon";
import SheetHandle from "./SheetHandle";
import PaymentModeToggle from "./PaymentModeToggle";
import { useAppStore } from "@/lib/store";
import { Address, ID_PROOF_TYPES, IdProofType, PaymentMode } from "@/lib/types";
import { VEHICLE_COLORS } from "@/lib/colors";
import { MEMBERSHIP_DURATIONS, durationLabel, getMembershipPrice } from "@/lib/membership";
import { BOTTOM_SHEET_PAPER_SX } from "@/lib/sheetStyles";

function IconRow({ icon, color, label }: { icon: React.ReactNode; color: string; label: string }) {
  return (
    <Stack direction="row" spacing={1.25} sx={{ alignItems: "center" }}>
      <Avatar sx={{ bgcolor: color, width: 26, height: 26, "& .MuiSvgIcon-root": { fontSize: 16 } }}>
        {icon}
      </Avatar>
      <Typography variant="body2">{label}</Typography>
    </Stack>
  );
}

function usePhotoCapture() {
  const [photoUrl, setPhotoUrl] = useState<string | undefined>();
  const [previewOpen, setPreviewOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (photoUrl) URL.revokeObjectURL(photoUrl);
    setPhotoUrl(URL.createObjectURL(file));
  };
  const handleDelete = () => {
    if (photoUrl) URL.revokeObjectURL(photoUrl);
    setPhotoUrl(undefined);
    setPreviewOpen(false);
  };
  const handleRetake = () => {
    setPreviewOpen(false);
    fileInputRef.current?.click();
  };
  const reset = () => {
    if (photoUrl) URL.revokeObjectURL(photoUrl);
    setPhotoUrl(undefined);
  };

  return { photoUrl, previewOpen, setPreviewOpen, fileInputRef, handleSelected, handleDelete, handleRetake, reset };
}

type PhotoCapture = ReturnType<typeof usePhotoCapture>;

function PhotoPreviewDialog({ photo, label }: { photo: PhotoCapture; label: string }) {
  return (
    <Dialog open={photo.previewOpen} onClose={() => photo.setPreviewOpen(false)} maxWidth="xs" fullWidth>
      <DialogContent sx={{ p: 0 }}>
        {photo.photoUrl && <Box component="img" src={photo.photoUrl} alt={label} sx={{ width: "100%", display: "block" }} />}
      </DialogContent>
      <DialogActions sx={{ justifyContent: "space-between", px: 2, py: 1.5 }}>
        <Button color="error" startIcon={<DeleteIcon />} onClick={photo.handleDelete}>
          Delete
        </Button>
        <Button startIcon={<CameraAltIcon />} onClick={photo.handleRetake}>
          Retake
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default function AddMemberSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { vehicleTypes, addMember } = useAppStore();
  const [vehicleTypeId, setVehicleTypeId] = useState(vehicleTypes[0].id);
  const [vehicleNumber, setVehicleNumber] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerAddress, setCustomerAddress] = useState<Address>({});
  const [idProofType, setIdProofType] = useState<IdProofType>(ID_PROOF_TYPES[0]);
  const [idProofNumber, setIdProofNumber] = useState("");
  const [durationMonths, setDurationMonths] = useState(MEMBERSHIP_DURATIONS[0]);
  const [paymentMode, setPaymentMode] = useState<PaymentMode>("cash");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const vehiclePhoto = usePhotoCapture();
  const idPhoto = usePhotoCapture();

  const selectedVehicleType = vehicleTypes.find((vt) => vt.id === vehicleTypeId)!;
  const amount = getMembershipPrice(selectedVehicleType, durationMonths);

  const handleSave = async () => {
    if (!vehicleNumber.trim()) {
      setError("Vehicle number is required");
      return;
    }
    if (saving) return;
    setSaving(true);
    try {
      const hasAddress = Object.values(customerAddress).some((v) => v && v.trim());
      const hasIdProof = idProofNumber.trim() || idPhoto.photoUrl;
      await addMember({
        vehicleNumber: vehicleNumber.trim().toUpperCase(),
        vehicleTypeId,
        customerName: customerName.trim() || undefined,
        customerPhone: customerPhone.trim() || undefined,
        customerAddress: hasAddress ? customerAddress : undefined,
        idProof: hasIdProof
          ? { type: idProofType, number: idProofNumber.trim() || undefined, photoUrl: idPhoto.photoUrl }
          : undefined,
        vehiclePhotoUrl: vehiclePhoto.photoUrl,
        durationMonths,
        paymentMode,
      });
      setVehicleNumber("");
      setCustomerName("");
      setCustomerPhone("");
      setCustomerAddress({});
      setIdProofType(ID_PROOF_TYPES[0]);
      setIdProofNumber("");
      vehiclePhoto.reset();
      idPhoto.reset();
      setDurationMonths(MEMBERSHIP_DURATIONS[0]);
      setError("");
      onClose();
    } catch {
      setError("Could not add member — please try again");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Drawer anchor="bottom" open={open} onClose={onClose} slotProps={{ paper: { sx: BOTTOM_SHEET_PAPER_SX } }}>
      <Box sx={{ p: 3, pb: 4 }}>
        <SheetHandle />
        <Typography variant="h6" gutterBottom>
          Add Member
        </Typography>

        <Typography variant="caption" color="text.secondary">
          Vehicle Type
        </Typography>
        <FormControl fullWidth sx={{ mt: 0.5, mb: 2 }}>
          <Select
            value={vehicleTypeId}
            onChange={(e: SelectChangeEvent) => setVehicleTypeId(e.target.value)}
            renderValue={() => (
              <IconRow
                icon={<VehicleIcon name={selectedVehicleType.name} />}
                color={VEHICLE_COLORS[selectedVehicleType.name]}
                label={selectedVehicleType.name}
              />
            )}
          >
            {vehicleTypes.map((vt) => (
              <MenuItem key={vt.id} value={vt.id}>
                <IconRow icon={<VehicleIcon name={vt.name} />} color={VEHICLE_COLORS[vt.name]} label={vt.name} />
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <TextField
          label="Vehicle number"
          fullWidth
          value={vehicleNumber}
          onChange={(e) => {
            setVehicleNumber(e.target.value);
            setError("");
          }}
          error={Boolean(error)}
          helperText={error || " "}
          slotProps={{
            input: {
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => vehiclePhoto.fileInputRef.current?.click()} edge="end">
                    <CameraAltIcon color={vehiclePhoto.photoUrl ? "primary" : "action"} />
                  </IconButton>
                </InputAdornment>
              ),
            },
          }}
          sx={{ mb: vehiclePhoto.photoUrl ? 0 : 1 }}
        />
        <input
          ref={vehiclePhoto.fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          style={{ display: "none" }}
          onChange={vehiclePhoto.handleSelected}
        />
        {vehiclePhoto.photoUrl && (
          <Stack direction="row" spacing={1.5} sx={{ alignItems: "center", mt: 1, mb: 1 }}>
            <Avatar
              src={vehiclePhoto.photoUrl}
              variant="rounded"
              sx={{ width: 48, height: 48, cursor: "pointer" }}
              onClick={() => vehiclePhoto.setPreviewOpen(true)}
            />
            <Typography variant="body2" color="text.secondary">
              Vehicle photo captured — tap to view
            </Typography>
          </Stack>
        )}

        <Divider sx={{ mb: 2 }} />
        <Typography variant="subtitle2" sx={{ mb: 1.5 }}>
          Customer Details
        </Typography>

        <TextField
          label="Customer Name"
          fullWidth
          value={customerName}
          onChange={(e) => setCustomerName(e.target.value)}
          sx={{ mb: 2 }}
        />
        <TextField
          label="Phone"
          fullWidth
          value={customerPhone}
          onChange={(e) => setCustomerPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
          sx={{ mb: 2 }}
        />
        <TextField
          label="Door No & Street"
          fullWidth
          multiline
          minRows={2}
          value={customerAddress.doorStreet ?? ""}
          onChange={(e) => setCustomerAddress((prev) => ({ ...prev, doorStreet: e.target.value }))}
          sx={{ mb: 2 }}
        />
        <Grid container spacing={1.5} sx={{ mb: 2 }}>
          <Grid size={6}>
            <TextField
              label="City"
              fullWidth
              value={customerAddress.city ?? ""}
              onChange={(e) => setCustomerAddress((prev) => ({ ...prev, city: e.target.value }))}
            />
          </Grid>
          <Grid size={6}>
            <TextField
              label="Pincode"
              fullWidth
              value={customerAddress.pincode ?? ""}
              onChange={(e) =>
                setCustomerAddress((prev) => ({ ...prev, pincode: e.target.value.replace(/\D/g, "").slice(0, 6) }))
              }
            />
          </Grid>
        </Grid>
        <TextField
          label="State"
          fullWidth
          value={customerAddress.state ?? ""}
          onChange={(e) => setCustomerAddress((prev) => ({ ...prev, state: e.target.value }))}
          sx={{ mb: 2 }}
        />
        <Typography variant="caption" color="text.secondary">
          ID Proof Type
        </Typography>
        <FormControl fullWidth sx={{ mt: 0.5, mb: 2 }}>
          <Select value={idProofType} onChange={(e: SelectChangeEvent) => setIdProofType(e.target.value as IdProofType)}>
            {ID_PROOF_TYPES.map((t) => (
              <MenuItem key={t} value={t}>
                {t}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <TextField
          label="ID Number"
          fullWidth
          value={idProofNumber}
          onChange={(e) => setIdProofNumber(e.target.value)}
          slotProps={{
            input: {
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => idPhoto.fileInputRef.current?.click()} edge="end">
                    <CameraAltIcon color={idPhoto.photoUrl ? "primary" : "action"} />
                  </IconButton>
                </InputAdornment>
              ),
            },
          }}
          sx={{ mb: idPhoto.photoUrl ? 0 : 2 }}
        />
        <input
          ref={idPhoto.fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          style={{ display: "none" }}
          onChange={idPhoto.handleSelected}
        />
        {idPhoto.photoUrl && (
          <Stack direction="row" spacing={1.5} sx={{ alignItems: "center", mt: 1, mb: 2 }}>
            <Avatar
              src={idPhoto.photoUrl}
              variant="rounded"
              sx={{ width: 48, height: 48, cursor: "pointer" }}
              onClick={() => idPhoto.setPreviewOpen(true)}
            />
            <Typography variant="body2" color="text.secondary">
              ID photo captured — tap to view
            </Typography>
          </Stack>
        )}

        <Divider sx={{ mb: 2 }} />
        <Typography variant="subtitle2" sx={{ mb: 1.5 }}>
          Plan
        </Typography>

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

        <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "center", mb: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Amount to collect
          </Typography>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            ₹{amount}
          </Typography>
        </Stack>
        {amount === 0 && (
          <Typography variant="caption" color="error" sx={{ display: "block", mb: 2 }}>
            No price configured for this duration — set it in Settings → Membership Pricing.
          </Typography>
        )}

        <Typography variant="caption" color="text.secondary">
          Payment mode
        </Typography>
        <PaymentModeToggle value={paymentMode} onChange={setPaymentMode} sx={{ mt: 0.5, mb: 3 }} />

        <Button variant="contained" size="large" fullWidth disabled={saving} onClick={handleSave}>
          {saving ? "Adding…" : "Add Member & Collect Fee"}
        </Button>
      </Box>

      <PhotoPreviewDialog photo={vehiclePhoto} label="Vehicle photo" />
      <PhotoPreviewDialog photo={idPhoto} label="ID proof photo" />
    </Drawer>
  );
}
