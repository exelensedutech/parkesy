"use client";

import { useState } from "react";
import Drawer from "@mui/material/Drawer";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import TuneIcon from "@mui/icons-material/Tune";
import PaymentsIcon from "@mui/icons-material/Payments";
import TimerIcon from "@mui/icons-material/Timer";
import PrintIcon from "@mui/icons-material/Print";
import SheetHandle from "./SheetHandle";
import { SettingsRow, SettingsSwitchRow } from "./SettingsRow";
import EditVehicleNumberCaptureSheet from "./EditVehicleNumberCaptureSheet";
import EditLongStayThresholdSheet from "./EditLongStayThresholdSheet";
import EditThermalPaperWidthSheet from "./EditThermalPaperWidthSheet";
import { useAppStore } from "@/lib/store";
import { BOTTOM_SHEET_PAPER_SX } from "@/lib/sheetStyles";

const PRIMARY = "#00658F";

export default function AdvancedPreferencesSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { vehicleNumberCaptureMode, collectAtCheckIn, setCollectAtCheckIn, longStayThresholdHours, thermalPaperWidth, t } =
    useAppStore();
  const [editingCapture, setEditingCapture] = useState(false);
  const [editingThreshold, setEditingThreshold] = useState(false);
  const [editingPaperWidth, setEditingPaperWidth] = useState(false);

  return (
    <Drawer anchor="bottom" open={open} onClose={onClose} slotProps={{ paper: { sx: BOTTOM_SHEET_PAPER_SX } }}>
      <Box sx={{ p: 3, pb: 4 }}>
        <SheetHandle />
        <Typography variant="h6" sx={{ mb: 2.5 }}>
          {t("advancedPreferencesTitle")}
        </Typography>

        <Stack spacing={1.5}>
          <SettingsRow
            icon={<TuneIcon />}
            color={PRIMARY}
            title={t("vehicleNumberCaptureTitle")}
            subtitle={vehicleNumberCaptureMode === "last4" ? t("last4DigitsOnlyOption") : t("fullVehicleNumberOption")}
            onClick={() => setEditingCapture(true)}
          />
          <SettingsSwitchRow
            icon={<PaymentsIcon />}
            color={PRIMARY}
            title={t("paymentAtCheckInTitle")}
            subtitle={collectAtCheckIn ? t("amountFieldShownAtCheckIn") : t("amountCollectedAtCheckOutOnly")}
            checked={collectAtCheckIn}
            onChange={setCollectAtCheckIn}
          />
          <SettingsRow
            icon={<TimerIcon />}
            color={PRIMARY}
            title={t("longStayThresholdTitle")}
            subtitle={`${t("flagVehiclesParkedBeyond")} ${longStayThresholdHours}h`}
            onClick={() => setEditingThreshold(true)}
          />
          <SettingsRow
            icon={<PrintIcon />}
            color={PRIMARY}
            title={t("thermalPaperWidthTitle")}
            subtitle={thermalPaperWidth === "58mm" ? t("paperWidth58mm") : t("paperWidth80mm")}
            onClick={() => setEditingPaperWidth(true)}
          />
        </Stack>
      </Box>

      <EditVehicleNumberCaptureSheet open={editingCapture} onClose={() => setEditingCapture(false)} />
      <EditLongStayThresholdSheet open={editingThreshold} onClose={() => setEditingThreshold(false)} />
      <EditThermalPaperWidthSheet open={editingPaperWidth} onClose={() => setEditingPaperWidth(false)} />
    </Drawer>
  );
}
