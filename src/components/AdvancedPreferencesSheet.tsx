"use client";

import { useState } from "react";
import Drawer from "@mui/material/Drawer";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import TuneIcon from "@mui/icons-material/Tune";
import PaymentsIcon from "@mui/icons-material/Payments";
import TimerIcon from "@mui/icons-material/Timer";
import SheetHandle from "./SheetHandle";
import { SettingsRow, SettingsSwitchRow } from "./SettingsRow";
import EditVehicleNumberCaptureSheet from "./EditVehicleNumberCaptureSheet";
import EditLongStayThresholdSheet from "./EditLongStayThresholdSheet";
import { useAppStore } from "@/lib/store";
import { BOTTOM_SHEET_PAPER_SX } from "@/lib/sheetStyles";

const PRIMARY = "#00658F";

export default function AdvancedPreferencesSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { vehicleNumberCaptureMode, collectAtCheckIn, setCollectAtCheckIn, longStayThresholdHours } = useAppStore();
  const [editingCapture, setEditingCapture] = useState(false);
  const [editingThreshold, setEditingThreshold] = useState(false);

  return (
    <Drawer anchor="bottom" open={open} onClose={onClose} slotProps={{ paper: { sx: BOTTOM_SHEET_PAPER_SX } }}>
      <Box sx={{ p: 3, pb: 4 }}>
        <SheetHandle />
        <Typography variant="h6" sx={{ mb: 2.5 }}>
          Advanced Preferences
        </Typography>

        <Stack spacing={1.5}>
          <SettingsRow
            icon={<TuneIcon />}
            color={PRIMARY}
            title="Vehicle Number Capture"
            subtitle={vehicleNumberCaptureMode === "last4" ? "Last 4 digits only" : "Full vehicle number"}
            onClick={() => setEditingCapture(true)}
          />
          <SettingsSwitchRow
            icon={<PaymentsIcon />}
            color={PRIMARY}
            title="Payment at Check-In"
            subtitle={collectAtCheckIn ? "Amount field shown on Check-In" : "Amount collected only at Check-Out"}
            checked={collectAtCheckIn}
            onChange={setCollectAtCheckIn}
          />
          <SettingsRow
            icon={<TimerIcon />}
            color={PRIMARY}
            title="Long-Stay Alert Threshold"
            subtitle={`Flag vehicles parked beyond ${longStayThresholdHours}h`}
            onClick={() => setEditingThreshold(true)}
          />
        </Stack>
      </Box>

      <EditVehicleNumberCaptureSheet open={editingCapture} onClose={() => setEditingCapture(false)} />
      <EditLongStayThresholdSheet open={editingThreshold} onClose={() => setEditingThreshold(false)} />
    </Drawer>
  );
}
