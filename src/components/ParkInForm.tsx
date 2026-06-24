"use client";

import { useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import ToggleButton from "@mui/material/ToggleButton";
import Stack from "@mui/material/Stack";
import InputAdornment from "@mui/material/InputAdornment";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import VehicleIcon from "./VehicleIcon";
import { useAppStore } from "@/lib/store";
import { PaymentMode } from "@/lib/types";

export default function ParkInForm() {
  const { vehicleTypes, startSession } = useAppStore();
  const [vehicleTypeId, setVehicleTypeId] = useState(vehicleTypes[0].id);
  const [vehicleNumber, setVehicleNumber] = useState("");
  const [amountPaid, setAmountPaid] = useState("");
  const [paymentMode, setPaymentMode] = useState<PaymentMode>("cash");
  const [numberError, setNumberError] = useState("");
  const [amountError, setAmountError] = useState("");
  const [showToast, setShowToast] = useState(false);

  const selectedVehicleType = vehicleTypes.find((vt) => vt.id === vehicleTypeId)!;
  const isCycle = selectedVehicleType.name === "Cycle";

  const handlePark = () => {
    let hasError = false;
    if (!isCycle && !vehicleNumber.trim()) {
      setNumberError("Vehicle number is required");
      hasError = true;
    }
    if (amountPaid.trim() === "" || Number.isNaN(parseFloat(amountPaid)) || parseFloat(amountPaid) < 0) {
      setAmountError("Amount paid is required");
      hasError = true;
    }
    if (hasError) return;

    const paidValue = parseFloat(amountPaid);
    startSession(vehicleTypeId, isCycle ? "" : vehicleNumber.trim().toUpperCase(), paidValue, paymentMode);
    setVehicleNumber("");
    setAmountPaid("");
    setNumberError("");
    setAmountError("");
    setShowToast(true);
  };

  return (
    <Box>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
        Vehicle type
      </Typography>
      <ToggleButtonGroup
        value={vehicleTypeId}
        exclusive
        onChange={(_, value) => value && setVehicleTypeId(value)}
        fullWidth
        sx={{ mb: 3 }}
      >
        {vehicleTypes.map((vt) => (
          <ToggleButton key={vt.id} value={vt.id}>
            <Stack spacing={0.5} sx={{ alignItems: "center", py: 0.5 }}>
              <VehicleIcon name={vt.name} />
              <Typography variant="caption">{vt.name}</Typography>
            </Stack>
          </ToggleButton>
        ))}
      </ToggleButtonGroup>

      {!isCycle && (
        <TextField
          label="Vehicle number"
          fullWidth
          value={vehicleNumber}
          onChange={(e) => {
            setVehicleNumber(e.target.value);
            setNumberError("");
          }}
          error={Boolean(numberError)}
          helperText={numberError || " "}
          sx={{ mb: 1 }}
        />
      )}

      <TextField
        label="Amount paid"
        type="number"
        fullWidth
        value={amountPaid}
        onChange={(e) => {
          setAmountPaid(e.target.value);
          setAmountError("");
        }}
        error={Boolean(amountError)}
        helperText={amountError || " "}
        slotProps={{ input: { startAdornment: <InputAdornment position="start">₹</InputAdornment> } }}
        sx={{ mb: 1 }}
      />

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

      <Button variant="contained" size="large" fullWidth onClick={handlePark}>
        Park Vehicle &amp; Issue Token
      </Button>

      <Snackbar
        open={showToast}
        autoHideDuration={2500}
        onClose={() => setShowToast(false)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert severity="success" variant="filled" onClose={() => setShowToast(false)} sx={{ width: "100%" }}>
          Vehicle added successfully
        </Alert>
      </Snackbar>
    </Box>
  );
}
