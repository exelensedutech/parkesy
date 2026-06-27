"use client";

import { useEffect, useState } from "react";
import Drawer from "@mui/material/Drawer";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import Divider from "@mui/material/Divider";
import Stack from "@mui/material/Stack";
import InputAdornment from "@mui/material/InputAdornment";
import SheetHandle from "./SheetHandle";
import { useAppStore } from "@/lib/store";
import { RateSlab, VehicleType } from "@/lib/types";
import { MEMBERSHIP_DURATIONS, durationLabel, getMembershipPrice } from "@/lib/membership";
import { BOTTOM_SHEET_PAPER_SX } from "@/lib/sheetStyles";

export default function EditVehicleTypeSheet({
  vehicleType,
  onClose,
}: {
  vehicleType: VehicleType | null;
  onClose: () => void;
}) {
  const { updateVehicleTypeSlotsAndSlabs, updateVehicleTypeMembershipPricing } = useAppStore();
  const [slots, setSlots] = useState("");
  const [firstHours, setFirstHours] = useState("");
  const [firstAmount, setFirstAmount] = useState("");
  const [everyHours, setEveryHours] = useState("");
  const [everyAmount, setEveryAmount] = useState("");
  const [memberPrices, setMemberPrices] = useState<Record<number, string>>({});

  useEffect(() => {
    if (!vehicleType) return;
    setSlots(String(vehicleType.totalSlots));
    const sorted = [...vehicleType.slabs].sort((a, b) => a.order - b.order);
    const slab1 = sorted[0];
    const slab2 = sorted[1];
    setFirstHours(slab1 ? String(slab1.toHour ?? 1) : "1");
    setFirstAmount(slab1 ? String(slab1.amount) : "0");
    setEveryHours(slab2 ? String(slab2.unitHours ?? 1) : "1");
    setEveryAmount(slab2 ? String(slab2.amount) : "0");

    const nextMemberPrices: Record<number, string> = {};
    MEMBERSHIP_DURATIONS.forEach((d) => {
      nextMemberPrices[d] = String(getMembershipPrice(vehicleType, d));
    });
    setMemberPrices(nextMemberPrices);
    // Re-sync only when a different vehicle type is opened for editing, not
    // on every re-render that produces a new (but equivalent) object
    // reference for the same vehicle type — that would wipe out in-progress
    // edits the moment any unrelated store update happens.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vehicleType?.id]);

  if (!vehicleType) return null;

  const handleSave = () => {
    const slotsValue = parseInt(slots, 10);
    const n1 = parseFloat(firstHours);
    const p1 = parseFloat(firstAmount);
    const n2 = parseFloat(everyHours);
    const p2 = parseFloat(everyAmount);
    if ([slotsValue, n1, p1, n2, p2].some((v) => Number.isNaN(v) || v < 0)) return;

    const slabs: RateSlab[] = [
      { order: 1, fromHour: 0, toHour: n1, amount: p1, type: "flat" },
      { order: 2, fromHour: n1, toHour: null, amount: p2, type: "per_hour", unitHours: n2 },
    ];
    updateVehicleTypeSlotsAndSlabs(vehicleType.id, slotsValue, slabs);

    const pricing = MEMBERSHIP_DURATIONS.map((d) => ({
      durationMonths: d,
      price: parseFloat(memberPrices[d]) || 0,
    }));
    updateVehicleTypeMembershipPricing(vehicleType.id, pricing);

    onClose();
  };

  return (
    <Drawer
      anchor="bottom"
      open={!!vehicleType}
      onClose={onClose}
      slotProps={{ paper: { sx: BOTTOM_SHEET_PAPER_SX } }}
    >
      <Box sx={{ p: 3, pb: 4 }}>
        <SheetHandle />
        <Typography variant="h6" gutterBottom>
          {vehicleType.name} Setup
        </Typography>

        <Typography variant="subtitle2" sx={{ mb: 1.5 }}>
          Slots
        </Typography>
        <TextField
          label="Total slots"
          type="number"
          fullWidth
          value={slots}
          onChange={(e) => setSlots(e.target.value)}
          sx={{ mb: 3 }}
        />

        <Divider sx={{ mb: 2 }} />
        <Typography variant="subtitle2" sx={{ mb: 1.5 }}>
          Walk-in Pricing
        </Typography>

        <Grid container spacing={1.5} sx={{ mb: 2 }}>
          <Grid size={6}>
            <TextField
              label="First N hours"
              type="number"
              fullWidth
              value={firstHours}
              onChange={(e) => setFirstHours(e.target.value)}
            />
          </Grid>
          <Grid size={6}>
            <TextField
              label="Amount"
              type="number"
              fullWidth
              value={firstAmount}
              onChange={(e) => setFirstAmount(e.target.value)}
              slotProps={{ input: { startAdornment: <InputAdornment position="start">₹</InputAdornment> } }}
            />
          </Grid>
        </Grid>

        <Grid container spacing={1.5} sx={{ mb: 3 }}>
          <Grid size={6}>
            <TextField
              label="Then every N hours"
              type="number"
              fullWidth
              value={everyHours}
              onChange={(e) => setEveryHours(e.target.value)}
            />
          </Grid>
          <Grid size={6}>
            <TextField
              label="Amount"
              type="number"
              fullWidth
              value={everyAmount}
              onChange={(e) => setEveryAmount(e.target.value)}
              slotProps={{ input: { startAdornment: <InputAdornment position="start">₹</InputAdornment> } }}
            />
          </Grid>
        </Grid>

        <Divider sx={{ mb: 2 }} />
        <Typography variant="subtitle2" sx={{ mb: 1.5 }}>
          Member Pricing
        </Typography>
        <Stack spacing={2} sx={{ mb: 3 }}>
          {MEMBERSHIP_DURATIONS.map((d) => (
            <TextField
              key={d}
              label={durationLabel(d)}
              type="number"
              fullWidth
              value={memberPrices[d] ?? ""}
              onChange={(e) => setMemberPrices((prev) => ({ ...prev, [d]: e.target.value }))}
              slotProps={{ input: { startAdornment: <InputAdornment position="start">₹</InputAdornment> } }}
            />
          ))}
        </Stack>

        <Button variant="contained" size="large" fullWidth onClick={handleSave}>
          Save
        </Button>
      </Box>
    </Drawer>
  );
}
