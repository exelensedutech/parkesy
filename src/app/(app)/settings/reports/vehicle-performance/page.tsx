"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import dayjs, { Dayjs } from "dayjs";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Avatar from "@mui/material/Avatar";
import IconButton from "@mui/material/IconButton";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import DateRangeFields from "@/components/DateRangeFields";
import VehicleIcon from "@/components/VehicleIcon";
import { useAppStore } from "@/lib/store";
import { isWithinRange, formatDuration } from "@/lib/calc";
import { VEHICLE_COLORS } from "@/lib/colors";

export default function VehiclePerformancePage() {
  const router = useRouter();
  const { role, sessions, vehicleTypes } = useAppStore();
  const [from, setFrom] = useState<Dayjs>(dayjs().startOf("month"));
  const [to, setTo] = useState<Dayjs>(dayjs());

  if (role !== "admin") {
    return (
      <Typography variant="body1" sx={{ mt: 4 }} align="center" color="text.secondary">
        Reports are only visible to the Admin.
      </Typography>
    );
  }

  const start = from.startOf("day").toDate();
  const end = to.endOf("day").toDate();

  const stats = vehicleTypes.map((vt) => {
    const entriesInRange = sessions.filter((s) => s.vehicleTypeId === vt.id && isWithinRange(s.entryTime, start, end));
    const exitsInRange = sessions.filter(
      (s) => s.vehicleTypeId === vt.id && s.status === "completed" && s.exitTime && isWithinRange(s.exitTime, start, end)
    );

    const revenue =
      entriesInRange.reduce((sum, s) => sum + s.amountPaidAtEntry, 0) +
      exitsInRange.reduce((sum, s) => sum + (s.amountPaidAtExit ?? 0), 0);

    const completedDurations = exitsInRange
      .filter((s) => s.exitTime)
      .map((s) => (new Date(s.exitTime!).getTime() - new Date(s.entryTime).getTime()) / (1000 * 60 * 60));
    const avgDuration = completedDurations.length
      ? completedDurations.reduce((sum, h) => sum + h, 0) / completedDurations.length
      : 0;

    return { vehicleType: vt, visits: entriesInRange.length, revenue, avgDuration };
  });

  const maxRevenue = Math.max(...stats.map((s) => s.revenue), 1);

  return (
    <>
      <Stack direction="row" spacing={1} sx={{ alignItems: "center", mb: 2 }}>
        <IconButton onClick={() => router.push("/settings/reports")} edge="start">
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h6">Vehicle-Type Performance</Typography>
      </Stack>

      <DateRangeFields from={from} to={to} onFromChange={setFrom} onToChange={setTo} />

      <Stack spacing={1.5}>
        {stats.map(({ vehicleType, visits, revenue, avgDuration }) => {
          const color = VEHICLE_COLORS[vehicleType.name];
          return (
            <Card key={vehicleType.id}>
              <CardContent>
                <Stack direction="row" spacing={1.5} sx={{ alignItems: "center", mb: 1.5 }}>
                  <Avatar sx={{ bgcolor: color, width: 40, height: 40 }}>
                    <VehicleIcon name={vehicleType.name} />
                  </Avatar>
                  <Typography variant="subtitle1">{vehicleType.name}</Typography>
                </Stack>
                <Stack direction="row" sx={{ justifyContent: "space-between", mb: 1 }}>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Revenue
                    </Typography>
                    <Typography variant="h6">₹{revenue}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Visits
                    </Typography>
                    <Typography variant="h6">{visits}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Avg. Duration
                    </Typography>
                    <Typography variant="h6">{formatDuration(avgDuration)}</Typography>
                  </Box>
                </Stack>
                <Box sx={{ display: "flex", height: 6, borderRadius: 3, overflow: "hidden", bgcolor: "grey.100" }}>
                  <Box sx={{ width: `${(revenue / maxRevenue) * 100}%`, bgcolor: color }} />
                </Box>
              </CardContent>
            </Card>
          );
        })}
      </Stack>
    </>
  );
}
