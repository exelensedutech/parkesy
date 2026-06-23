"use client";

import { useState } from "react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Fab from "@mui/material/Fab";
import Chip from "@mui/material/Chip";
import AddIcon from "@mui/icons-material/Add";
import AppShell from "@/components/AppShell";
import VehicleIcon from "@/components/VehicleIcon";
import NewEntrySheet from "@/components/NewEntrySheet";
import ExitSheet from "@/components/ExitSheet";
import { useAppStore } from "@/lib/store";
import { ParkingSession } from "@/lib/types";
import { durationHours, formatDuration } from "@/lib/calc";

export default function ParkingPage() {
  const { sessions, vehicleTypes } = useAppStore();
  const [newEntryOpen, setNewEntryOpen] = useState(false);
  const [exitSession, setExitSession] = useState<ParkingSession | null>(null);

  const active = sessions.filter((s) => s.status === "parked");

  return (
    <AppShell>
      <Typography variant="h6" sx={{ mb: 1 }}>
        Currently Parked ({active.length})
      </Typography>

      <Stack spacing={1.5} sx={{ mb: 2 }}>
        {active.length === 0 && (
          <Typography variant="body2" color="text.secondary">
            No vehicles parked right now. Tap + to add an entry.
          </Typography>
        )}
        {active.map((session) => {
          const vehicleType = vehicleTypes.find((vt) => vt.id === session.vehicleTypeId)!;
          return (
            <Card key={session.id} onClick={() => setExitSession(session)} sx={{ cursor: "pointer" }}>
              <CardContent>
                <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "center" }}>
                  <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
                    <VehicleIcon name={vehicleType.name} />
                    <Box>
                      <Typography variant="subtitle1">{session.tokenCode}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {vehicleType.name}
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

      <Fab
        color="primary"
        sx={{ position: "fixed", bottom: 88, right: 24 }}
        onClick={() => setNewEntryOpen(true)}
      >
        <AddIcon />
      </Fab>

      <NewEntrySheet open={newEntryOpen} onClose={() => setNewEntryOpen(false)} />
      <ExitSheet session={exitSession} onClose={() => setExitSession(null)} />
    </AppShell>
  );
}
