"use client";

import Grid from "@mui/material/Grid";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { Dayjs } from "dayjs";

export default function DateRangeFields({
  from,
  to,
  onFromChange,
  onToChange,
}: {
  from: Dayjs;
  to: Dayjs;
  onFromChange: (value: Dayjs) => void;
  onToChange: (value: Dayjs) => void;
}) {
  return (
    <Grid container spacing={1.5} sx={{ mb: 3 }}>
      <Grid size={6}>
        <DatePicker
          label="From"
          value={from}
          onChange={(value) => value && onFromChange(value)}
          slotProps={{ textField: { fullWidth: true } }}
        />
      </Grid>
      <Grid size={6}>
        <DatePicker
          label="To"
          value={to}
          onChange={(value) => value && onToChange(value)}
          slotProps={{ textField: { fullWidth: true } }}
        />
      </Grid>
    </Grid>
  );
}
