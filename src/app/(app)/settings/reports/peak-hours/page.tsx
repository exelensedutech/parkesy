"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import dayjs, { Dayjs } from "dayjs";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import IconButton from "@mui/material/IconButton";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import DateRangeFields from "@/components/DateRangeFields";
import { useAppStore } from "@/lib/store";
import { isWithinRange } from "@/lib/calc";

function hourLabel(h: number): string {
  const period = h < 12 ? "AM" : "PM";
  let hour12 = h % 12;
  if (hour12 === 0) hour12 = 12;
  return `${hour12} ${period}`;
}

const WEEKDAY_ORDER = [1, 2, 3, 4, 5, 6, 0];
const WEEKDAY_LABELS: Record<number, string> = {
  0: "Sunday",
  1: "Monday",
  2: "Tuesday",
  3: "Wednesday",
  4: "Thursday",
  5: "Friday",
  6: "Saturday",
};

function BarRow({ label, count, max, color }: { label: string; count: number; max: number; color: string }) {
  return (
    <Stack direction="row" spacing={1.5} sx={{ alignItems: "center", mb: 1 }}>
      <Typography variant="caption" color="text.secondary" sx={{ width: 72, flexShrink: 0 }}>
        {label}
      </Typography>
      <Box sx={{ flex: 1, display: "flex", height: 10, borderRadius: 5, overflow: "hidden", bgcolor: "grey.100" }}>
        <Box sx={{ width: max > 0 ? `${(count / max) * 100}%` : 0, bgcolor: color }} />
      </Box>
      <Typography variant="caption" sx={{ width: 24, textAlign: "right", flexShrink: 0 }}>
        {count}
      </Typography>
    </Stack>
  );
}

export default function PeakHoursPage() {
  const router = useRouter();
  const { role, sessions } = useAppStore();
  const [from, setFrom] = useState<Dayjs>(dayjs().startOf("month"));
  const [to, setTo] = useState<Dayjs>(dayjs());

  if (role !== "owner") {
    return (
      <Typography variant="body1" sx={{ mt: 4 }} align="center" color="text.secondary">
        Reports are only visible to the Owner.
      </Typography>
    );
  }

  const start = from.startOf("day").toDate();
  const end = to.endOf("day").toDate();

  const entriesInRange = sessions.filter((s) => isWithinRange(s.entryTime, start, end));

  const hourCounts = new Array(24).fill(0);
  const weekdayCounts: Record<number, number> = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };
  entriesInRange.forEach((s) => {
    const d = new Date(s.entryTime);
    hourCounts[d.getHours()] += 1;
    weekdayCounts[d.getDay()] += 1;
  });

  const maxHourCount = Math.max(...hourCounts, 1);
  const maxWeekdayCount = Math.max(...Object.values(weekdayCounts), 1);

  return (
    <>
      <Stack direction="row" spacing={1} sx={{ alignItems: "center", mb: 2 }}>
        <IconButton onClick={() => router.push("/settings/reports")} edge="start">
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h6">Peak Hours</Typography>
      </Stack>

      <DateRangeFields from={from} to={to} onFromChange={setFrom} onToChange={setTo} />

      <Typography variant="subtitle1" sx={{ mb: 1 }}>
        By Day of Week
      </Typography>
      <Card sx={{ mb: 3 }}>
        <CardContent>
          {WEEKDAY_ORDER.map((day) => (
            <BarRow key={day} label={WEEKDAY_LABELS[day]} count={weekdayCounts[day]} max={maxWeekdayCount} color="#5E35B1" />
          ))}
        </CardContent>
      </Card>

      <Typography variant="subtitle1" sx={{ mb: 1 }}>
        By Hour of Day
      </Typography>
      <Card>
        <CardContent>
          {hourCounts.map((count, hour) => (
            <BarRow key={hour} label={hourLabel(hour)} count={count} max={maxHourCount} color="#5E35B1" />
          ))}
        </CardContent>
      </Card>
    </>
  );
}
