"use client";

import { useEffect, useState } from "react";
import Drawer from "@mui/material/Drawer";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import Radio from "@mui/material/Radio";
import SheetHandle from "./SheetHandle";
import { useAppStore } from "@/lib/store";
import { ThermalPaperWidth } from "@/lib/types";
import { BOTTOM_SHEET_PAPER_SX } from "@/lib/sheetStyles";

export default function EditThermalPaperWidthSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { thermalPaperWidth, setThermalPaperWidth, t } = useAppStore();
  const [width, setWidth] = useState<ThermalPaperWidth>(thermalPaperWidth);

  useEffect(() => {
    if (open) setWidth(thermalPaperWidth);
  }, [open, thermalPaperWidth]);

  const handleSave = () => {
    setThermalPaperWidth(width);
    onClose();
  };

  return (
    <Drawer anchor="bottom" open={open} onClose={onClose} slotProps={{ paper: { sx: BOTTOM_SHEET_PAPER_SX } }}>
      <Box sx={{ p: 3, pb: 4 }}>
        <SheetHandle />
        <Typography variant="h6" sx={{ mb: 2.5 }}>
          {t("thermalPaperWidthTitle")}
        </Typography>

        <RadioGroup value={width} onChange={(e) => setWidth(e.target.value as ThermalPaperWidth)}>
          <FormControlLabel value="58mm" control={<Radio />} label={t("paperWidth58mm")} />
          <FormControlLabel value="80mm" control={<Radio />} label={t("paperWidth80mm")} />
        </RadioGroup>
        <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 1, mb: 3 }}>
          {t("thermalPaperWidthHelper")}
        </Typography>

        <Button variant="contained" size="large" fullWidth onClick={handleSave}>
          {t("save")}
        </Button>
      </Box>
    </Drawer>
  );
}
