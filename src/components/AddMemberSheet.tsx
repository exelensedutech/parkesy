"use client";

import { useState } from "react";
import Drawer from "@mui/material/Drawer";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import Avatar from "@mui/material/Avatar";
import InputAdornment from "@mui/material/InputAdornment";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import ToggleButton from "@mui/material/ToggleButton";
import { alpha } from "@mui/material/styles";
import VehicleIcon from "./VehicleIcon";
import { useAppStore } from "@/lib/store";
import { PaymentMode } from "@/lib/types";
import { VEHICLE_COLORS, CASH_COLOR, ONLINE_COLOR } from "@/lib/colors";

export default function AddMemberSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { vehicleTypes, addMember } = useAppStore();
  const [vehicleTypeId, setVehicleTypeId] = useState(vehicleTypes[0].id);
  const [vehicleNumber, setVehicleNumber] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [monthlyFee, setMonthlyFee] = useState("");
  const [paymentMode, setPaymentMode] = useState<PaymentMode>("cash");
  const [error, setError] = useState("");

  const handleSave = () => {
    if (!vehicleNumber.trim()) {
      setError("Vehicle number is required");
      return;
    }
    const fee = parseFloat(monthlyFee);
    if (!fee || fee <= 0) {
      setError("Enter a valid monthly fee");
      return;
    }
    addMember(vehicleNumber.trim().toUpperCase(), vehicleTypeId, customerName.trim() || undefined, fee, paymentMode);
    setVehicleNumber("");
    setCustomerName("");
    setMonthlyFee("");
    setError("");
    onClose();
  };

  return (
    <Drawer anchor="bottom" open={open} onClose={onClose} slotProps={{ paper: { sx: { borderTopLeftRadius: 20, borderTopRightRadius: 20 } } }}>
      <Box sx={{ p: 3, pb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Add Member
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Monthly pass starts today and runs for one month.
        </Typography>

        <Typography variant="caption" color="text.secondary">
          Vehicle Type
        </Typography>
        <Grid container spacing={1.5} sx={{ mt: 0.5, mb: 2 }}>
          {vehicleTypes.map((vt) => {
            const color = VEHICLE_COLORS[vt.name];
            const selected = vt.id === vehicleTypeId;
            return (
              <Grid size={4} key={vt.id}>
                <Box
                  onClick={() => setVehicleTypeId(vt.id)}
                  sx={{
                    cursor: "pointer",
                    textAlign: "center",
                    py: 1,
                    borderRadius: 2,
                    border: 1,
                    borderColor: selected ? color : "divider",
                    borderWidth: selected ? 2 : 1,
                    bgcolor: selected ? alpha(color, 0.1) : "transparent",
                  }}
                >
                  <Avatar
                    sx={{
                      bgcolor: selected ? color : alpha(color, 0.15),
                      color: selected ? "white" : color,
                      width: 32,
                      height: 32,
                      mx: "auto",
                      mb: 0.5,
                    }}
                  >
                    <VehicleIcon name={vt.name} />
                  </Avatar>
                  <Typography variant="caption" sx={{ fontWeight: 600 }}>
                    {vt.name}
                  </Typography>
                </Box>
              </Grid>
            );
          })}
        </Grid>

        <TextField
          label="Vehicle number"
          fullWidth
          value={vehicleNumber}
          onChange={(e) => {
            setVehicleNumber(e.target.value);
            setError("");
          }}
          sx={{ mb: 2 }}
        />
        <TextField
          label="Customer name (optional)"
          fullWidth
          value={customerName}
          onChange={(e) => setCustomerName(e.target.value)}
          sx={{ mb: 2 }}
        />
        <TextField
          label="Monthly fee"
          type="number"
          fullWidth
          value={monthlyFee}
          onChange={(e) => {
            setMonthlyFee(e.target.value);
            setError("");
          }}
          slotProps={{ input: { startAdornment: <InputAdornment position="start">₹</InputAdornment> } }}
          sx={{ mb: 2 }}
        />

        <Typography variant="caption" color="text.secondary">
          Payment mode
        </Typography>
        <ToggleButtonGroup
          value={paymentMode}
          exclusive
          onChange={(_, value) => value && setPaymentMode(value)}
          fullWidth
          sx={{ mt: 0.5, mb: error ? 1 : 3 }}
        >
          <ToggleButton value="cash" sx={{ color: CASH_COLOR }}>
            Cash
          </ToggleButton>
          <ToggleButton value="online" sx={{ color: ONLINE_COLOR }}>
            Online
          </ToggleButton>
        </ToggleButtonGroup>

        {error && (
          <Typography variant="caption" color="error" sx={{ display: "block", mb: 2 }}>
            {error}
          </Typography>
        )}

        <Button variant="contained" size="large" fullWidth onClick={handleSave}>
          Add Member &amp; Collect Fee
        </Button>
      </Box>
    </Drawer>
  );
}
