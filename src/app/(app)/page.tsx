"use client";

import { useState } from "react";
import Box from "@mui/material/Box";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import ToggleButton from "@mui/material/ToggleButton";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import IconButton from "@mui/material/IconButton";
import Badge from "@mui/material/Badge";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import LoginIcon from "@mui/icons-material/Login";
import LogoutIcon from "@mui/icons-material/Logout";
import CardMembershipIcon from "@mui/icons-material/CardMembership";
import { alpha } from "@mui/material/styles";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Avatar from "@mui/material/Avatar";
import Chip from "@mui/material/Chip";
import ParkInForm from "@/components/ParkInForm";
import ParkOutSheet from "@/components/ParkOutSheet";
import ParkOutFilterSheet, { DurationFilter, MemberFilter } from "@/components/ParkOutFilterSheet";
import ParkExitConfirmationDialog, { ParkExitConfirmation } from "@/components/ParkExitConfirmationDialog";
import VehicleIcon from "@/components/VehicleIcon";
import { useAppStore } from "@/lib/store";
import { ParkingSession } from "@/lib/types";
import { TranslationKey } from "@/lib/i18n";
import { durationHours, formatDuration } from "@/lib/calc";
import { VEHICLE_COLORS } from "@/lib/colors";

function vehicleTypeKey(name: string): TranslationKey {
  return name === "Bike" ? "vehicleTypeBike" : name === "Cycle" ? "vehicleTypeCycle" : "vehicleTypeCar";
}

export default function ParkPage() {
  const { sessions, vehicleTypes, t, language } = useAppStore();
  const [tab, setTab] = useState<"in" | "out">("in");
  const [search, setSearch] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const [typeFilter, setTypeFilter] = useState("all");
  const [durationFilter, setDurationFilter] = useState<DurationFilter>("any");
  const [memberFilter, setMemberFilter] = useState<MemberFilter>("all");
  const [outSession, setOutSession] = useState<ParkingSession | null>(null);
  const [exitConfirmation, setExitConfirmation] = useState<ParkExitConfirmation | null>(null);

  const filtersActive = typeFilter !== "all" || durationFilter !== "any" || memberFilter !== "all";

  const resetFilters = () => {
    setTypeFilter("all");
    setDurationFilter("any");
    setMemberFilter("all");
  };

  const parked = sessions
    .filter((s) => s.status === "parked")
    .filter((s) => s.vehicleNumber.toLowerCase().includes(search.trim().toLowerCase()))
    .filter((s) => typeFilter === "all" || s.vehicleTypeId === typeFilter)
    .filter((s) => durationFilter === "any" || durationHours(s.entryTime) >= durationFilter)
    .filter((s) => memberFilter === "all" || (memberFilter === "member" ? Boolean(s.memberId) : !s.memberId))
    .sort((a, b) => durationHours(b.entryTime) - durationHours(a.entryTime));

  return (
    <>
      <ToggleButtonGroup
        value={tab}
        exclusive
        onChange={(_, value) => value && setTab(value)}
        fullWidth
        sx={{ mb: 2.5 }}
      >
        <ToggleButton
          value="in"
          sx={{
            "&.Mui-selected": {
              bgcolor: alpha("#1565C0", 0.12),
              color: "#1565C0",
              borderColor: "#1565C0",
            },
            "&.Mui-selected:hover": { bgcolor: alpha("#1565C0", 0.18) },
          }}
        >
          <LoginIcon sx={{ mr: 1 }} fontSize="small" />
          {t("checkInTab")}
        </ToggleButton>
        <ToggleButton
          value="out"
          sx={{
            "&.Mui-selected": {
              bgcolor: alpha("#AD1457", 0.12),
              color: "#AD1457",
              borderColor: "#AD1457",
            },
            "&.Mui-selected:hover": { bgcolor: alpha("#AD1457", 0.18) },
          }}
        >
          <LogoutIcon sx={{ mr: 1 }} fontSize="small" />
          {t("checkOutTab")}
        </ToggleButton>
      </ToggleButtonGroup>

      {tab === "in" && <ParkInForm />}

      {tab === "out" && (
        <Box>
          <TextField
            placeholder={t("searchByVehicleNumber")}
            fullWidth
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setFilterOpen(true)} edge="end" aria-label="Filters">
                      <Badge color="primary" variant="dot" invisible={!filtersActive}>
                        <FilterListIcon />
                      </Badge>
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
            sx={{ mb: 2 }}
          />

          <Stack spacing={1.5}>
            {parked.length === 0 && (
              <Typography variant="body2" color="text.secondary">
                {t("noParkedVehiclesMatch")}
              </Typography>
            )}
            {parked.map((session) => {
              const vehicleType = vehicleTypes.find((vt) => vt.id === session.vehicleTypeId)!;
              const color = VEHICLE_COLORS[vehicleType.name];
              const parkedAt = new Date(session.entryTime).toLocaleString(language === "ta" ? "ta-IN" : "en-IN", {
                day: "numeric",
                month: "short",
                hour: "numeric",
                minute: "2-digit",
                timeZone: "Asia/Kolkata",
              });
              return (
                <Card key={session.id} onClick={() => setOutSession(session)} sx={{ cursor: "pointer" }}>
                  <CardContent>
                    <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "center" }}>
                      <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
                        <Avatar sx={{ bgcolor: color, width: 36, height: 36 }}>
                          <VehicleIcon name={vehicleType.name} />
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle1">{t(vehicleTypeKey(vehicleType.name))}</Typography>
                          <Typography variant="body2" color="text.secondary">
                            {t("parkedAtPrefix")} {parkedAt}
                            {session.vehicleNumber ? ` · ${session.vehicleNumber}` : ""}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {t("checkedInByPrefix")}: {session.recordedBy}
                          </Typography>
                        </Box>
                      </Stack>
                      <Stack direction="row" spacing={0.75} sx={{ alignItems: "center" }}>
                        {session.memberId && (
                          <CardMembershipIcon fontSize="small" color="success" />
                        )}
                        <Chip label={formatDuration(durationHours(session.entryTime))} size="small" />
                      </Stack>
                    </Stack>
                  </CardContent>
                </Card>
              );
            })}
          </Stack>
        </Box>
      )}

      <ParkOutSheet
        session={outSession}
        onClose={() => setOutSession(null)}
        onCompleted={setExitConfirmation}
      />

      <ParkExitConfirmationDialog confirmation={exitConfirmation} onClose={() => setExitConfirmation(null)} />

      <ParkOutFilterSheet
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        vehicleTypes={vehicleTypes}
        typeFilter={typeFilter}
        setTypeFilter={setTypeFilter}
        durationFilter={durationFilter}
        setDurationFilter={setDurationFilter}
        memberFilter={memberFilter}
        setMemberFilter={setMemberFilter}
        onReset={resetFilters}
      />
    </>
  );
}
