"use client";

import { useState } from "react";
import Box from "@mui/material/Box";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import SearchIcon from "@mui/icons-material/Search";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Chip from "@mui/material/Chip";
import ParkInForm from "@/components/ParkInForm";
import ParkOutSheet from "@/components/ParkOutSheet";
import VehicleIcon from "@/components/VehicleIcon";
import { useAppStore } from "@/lib/store";
import { ParkingSession } from "@/lib/types";
import { durationHours, formatDuration } from "@/lib/calc";

export default function ParkPage() {
  const { sessions, vehicleTypes } = useAppStore();
  const [tab, setTab] = useState<"in" | "out">("in");
  const [search, setSearch] = useState("");
  const [outSession, setOutSession] = useState<ParkingSession | null>(null);

  const parked = sessions
    .filter((s) => s.status === "parked")
    .filter((s) => s.vehicleNumber.toLowerCase().includes(search.trim().toLowerCase()));

  return (
    <>
      <Tabs
        value={tab}
        onChange={(_, value) => setTab(value)}
        variant="fullWidth"
        sx={{ mb: 2, borderBottom: 1, borderColor: "divider" }}
      >
        <Tab label="In" value="in" />
        <Tab label="Out" value="out" />
      </Tabs>

      {tab === "in" && <ParkInForm />}

      {tab === "out" && (
        <Box>
          <TextField
            placeholder="Search by vehicle number"
            fullWidth
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            slotProps={{ input: { startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment> } }}
            sx={{ mb: 2 }}
          />

          <Stack spacing={1.5}>
            {parked.length === 0 && (
              <Typography variant="body2" color="text.secondary">
                No parked vehicles match your search.
              </Typography>
            )}
            {parked.map((session) => {
              const vehicleType = vehicleTypes.find((vt) => vt.id === session.vehicleTypeId)!;
              const parkedAt = new Date(session.entryTime).toLocaleString(undefined, {
                day: "numeric",
                month: "short",
                hour: "numeric",
                minute: "2-digit",
              });
              return (
                <Card key={session.id} onClick={() => setOutSession(session)} sx={{ cursor: "pointer" }}>
                  <CardContent>
                    <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "center" }}>
                      <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
                        <VehicleIcon name={vehicleType.name} />
                        <Box>
                          <Typography variant="subtitle1">{vehicleType.name}</Typography>
                          <Typography variant="body2" color="text.secondary">
                            Parked {parkedAt}
                            {session.vehicleNumber ? ` · ${session.vehicleNumber}` : ""}
                          </Typography>
                        </Box>
                      </Stack>
                      <Chip label={formatDuration(durationHours(session.entryTime))} size="small" />
                    </Stack>
                  </CardContent>
                </Card>
              );
            })}
          </Stack>
        </Box>
      )}

      <ParkOutSheet session={outSession} onClose={() => setOutSession(null)} />
    </>
  );
}
