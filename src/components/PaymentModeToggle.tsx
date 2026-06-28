"use client";

import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import ToggleButton from "@mui/material/ToggleButton";
import { alpha } from "@mui/material/styles";
import { SxProps, Theme } from "@mui/material/styles";
import { PaymentMode } from "@/lib/types";
import { CASH_COLOR, ONLINE_COLOR } from "@/lib/colors";
import { useAppStore } from "@/lib/store";

export default function PaymentModeToggle({
  value,
  onChange,
  sx,
}: {
  value: PaymentMode;
  onChange: (mode: PaymentMode) => void;
  sx?: SxProps<Theme>;
}) {
  const { t } = useAppStore();
  return (
    <ToggleButtonGroup
      value={value}
      exclusive
      onChange={(_, v: PaymentMode | null) => v && onChange(v)}
      fullWidth
      sx={sx}
    >
      <ToggleButton
        value="cash"
        sx={{
          "&.Mui-selected": { bgcolor: alpha(CASH_COLOR, 0.12), color: CASH_COLOR, borderColor: CASH_COLOR },
          "&.Mui-selected:hover": { bgcolor: alpha(CASH_COLOR, 0.18) },
        }}
      >
        {t("cash")}
      </ToggleButton>
      <ToggleButton
        value="online"
        sx={{
          "&.Mui-selected": { bgcolor: alpha(ONLINE_COLOR, 0.12), color: ONLINE_COLOR, borderColor: ONLINE_COLOR },
          "&.Mui-selected:hover": { bgcolor: alpha(ONLINE_COLOR, 0.18) },
        }}
      >
        {t("online")}
      </ToggleButton>
    </ToggleButtonGroup>
  );
}
