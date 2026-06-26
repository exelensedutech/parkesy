"use client";

import { useRouter } from "next/navigation";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Avatar from "@mui/material/Avatar";
import IconButton from "@mui/material/IconButton";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import VehicleIcon from "@/components/VehicleIcon";
import { useAppStore } from "@/lib/store";
import { durationHours, formatDuration } from "@/lib/calc";
import { VEHICLE_COLORS } from "@/lib/colors";

export default function LongStayPage() {
  const router = useRouter();
  const { role, sessions, vehicleTypes, longStayThresholdHours } = useAppStore();

  if (role !== "owner") {
    return (
      <Typography variant="body1" sx={{ mt: 4 }} align="center" color="text.secondary">
        Reports are only visible to the Owner.
      </Typography>
    );
  }

  const longStaySessions = sessions
    .filter((s) => s.status === "parked" && durationHours(s.entryTime) >= longStayThresholdHours)
    .sort((a, b) => durationHours(b.entryTime) - durationHours(a.entryTime));

  return (
    <>
      <Stack direction="row" spacing={1} sx={{ alignItems: "center", mb: 2 }}>
        <IconButton onClick={() => router.push("/settings/reports")} edge="start">
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h6">Long-Stay Alert</Typography>
      </Stack>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
        Vehicles still parked beyond {longStayThresholdHours}h. Change the threshold in Settings → Advanced
        Preferences.
      </Typography>

      <Stack spacing={1.5}>
        {longStaySessions.length === 0 && (
          <Typography variant="body2" color="text.secondary">
            No vehicles currently parked beyond the threshold.
          </Typography>
        )}
        {longStaySessions.map((s) => {
          const vt = vehicleTypes.find((v) => v.id === s.vehicleTypeId)!;
          return (
            <Card key={s.id}>
              <CardContent>
                <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "center" }}>
                  <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
                    <Avatar sx={{ bgcolor: VEHICLE_COLORS[vt.name], width: 40, height: 40 }}>
                      <VehicleIcon name={vt.name} />
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle1">
                        {vt.name}
                        {s.vehicleNumber ? ` · ${s.vehicleNumber}` : ""}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        In:{" "}
                        {new Date(s.entryTime).toLocaleString("en-IN", {
                          day: "numeric",
                          month: "short",
                          hour: "numeric",
                          minute: "2-digit",
                        })}{" "}
                        · {s.recordedBy}
                      </Typography>
                    </Box>
                  </Stack>
                  <Typography variant="subtitle1" color="error.main">
                    {formatDuration(durationHours(s.entryTime))}
                  </Typography>
                </Stack>
              </CardContent>
            </Card>
          );
        })}
      </Stack>
    </>
  );
}
