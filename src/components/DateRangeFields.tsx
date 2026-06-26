"use client";

import { useState } from "react";
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
  const [fromOpen, setFromOpen] = useState(false);
  const [toOpen, setToOpen] = useState(false);

  return (
    <Grid container spacing={1.5} sx={{ mb: 3 }}>
      <Grid size={6}>
        <DatePicker
          label="From"
          value={from}
          onChange={(value) => value && onFromChange(value)}
          open={fromOpen}
          onOpen={() => setFromOpen(true)}
          onClose={() => setFromOpen(false)}
          slotProps={{
            textField: { fullWidth: true, onClick: () => setFromOpen(true) },
            field: { readOnly: true },
          }}
        />
      </Grid>
      <Grid size={6}>
        <DatePicker
          label="To"
          value={to}
          onChange={(value) => value && onToChange(value)}
          open={toOpen}
          onOpen={() => setToOpen(true)}
          onClose={() => setToOpen(false)}
          slotProps={{
            textField: { fullWidth: true, onClick: () => setToOpen(true) },
            field: { readOnly: true },
          }}
        />
      </Grid>
    </Grid>
  );
}
