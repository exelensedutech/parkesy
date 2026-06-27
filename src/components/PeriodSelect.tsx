"use client";

import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import { DashboardPeriod } from "@/lib/dashboardPeriod";

export default function PeriodSelect({
  value,
  onChange,
}: {
  value: DashboardPeriod;
  onChange: (value: DashboardPeriod) => void;
}) {
  return (
    <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "center", mb: 2 }}>
      <Typography variant="body2" color="text.secondary">
        Showing
      </Typography>
      <Select
        value={value}
        size="small"
        onChange={(e: SelectChangeEvent) => onChange(e.target.value as DashboardPeriod)}
        sx={{ minWidth: 180 }}
      >
        <MenuItem value="today">Today</MenuItem>
        <MenuItem value="week">Last 7 Days</MenuItem>
        <MenuItem value="month">This Month</MenuItem>
      </Select>
    </Stack>
  );
}
