"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Avatar from "@mui/material/Avatar";
import IconButton from "@mui/material/IconButton";
import FormControl from "@mui/material/FormControl";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AllInclusiveIcon from "@mui/icons-material/AllInclusive";
import VehicleIcon from "@/components/VehicleIcon";
import { useAppStore } from "@/lib/store";
import { durationHours, formatDuration } from "@/lib/calc";
import { VEHICLE_COLORS } from "@/lib/colors";

const ALL_COLOR = "#455A64";

function IconRow({ icon, color, label }: { icon: React.ReactNode; color: string; label: string }) {
  return (
    <Stack direction="row" spacing={1.25} sx={{ alignItems: "center" }}>
      <Avatar sx={{ bgcolor: color, width: 26, height: 26, "& .MuiSvgIcon-root": { fontSize: 16 } }}>{icon}</Avatar>
      <Typography variant="body2">{label}</Typography>
    </Stack>
  );
}

export default function LongStayPage() {
  const router = useRouter();
  const { role, sessions, vehicleTypes, longStayThresholdHours } = useAppStore();
  const [typeFilter, setTypeFilter] = useState("all");

  if (role !== "admin") {
    return (
      <Typography variant="body1" sx={{ mt: 4 }} align="center" color="text.secondary">
        Reports are only visible to the Admin.
      </Typography>
    );
  }

  const selectedVehicleType = vehicleTypes.find((vt) => vt.id === typeFilter);

  const longStaySessions = sessions
    .filter((s) => s.status === "parked" && durationHours(s.entryTime) >= longStayThresholdHours)
    .filter((s) => typeFilter === "all" || s.vehicleTypeId === typeFilter)
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

      <Typography variant="caption" color="text.secondary">
        Vehicle Type
      </Typography>
      <FormControl fullWidth sx={{ mt: 0.5, mb: 2.5 }}>
        <Select
          value={typeFilter}
          onChange={(e: SelectChangeEvent) => setTypeFilter(e.target.value)}
          renderValue={() =>
            selectedVehicleType ? (
              <IconRow
                icon={<VehicleIcon name={selectedVehicleType.name} />}
                color={VEHICLE_COLORS[selectedVehicleType.name]}
                label={selectedVehicleType.name}
              />
            ) : (
              <IconRow icon={<AllInclusiveIcon fontSize="small" />} color={ALL_COLOR} label="All" />
            )
          }
        >
          <MenuItem value="all">
            <IconRow icon={<AllInclusiveIcon fontSize="small" />} color={ALL_COLOR} label="All" />
          </MenuItem>
          {vehicleTypes.map((vt) => (
            <MenuItem key={vt.id} value={vt.id}>
              <IconRow icon={<VehicleIcon name={vt.name} />} color={VEHICLE_COLORS[vt.name]} label={vt.name} />
            </MenuItem>
          ))}
        </Select>
      </FormControl>

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
