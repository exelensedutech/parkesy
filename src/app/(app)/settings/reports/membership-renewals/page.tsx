"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Avatar from "@mui/material/Avatar";
import Chip from "@mui/material/Chip";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import IconButton from "@mui/material/IconButton";
import Badge from "@mui/material/Badge";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import VehicleIcon from "@/components/VehicleIcon";
import MembershipRenewalsFilterSheet, { RenewalStatusFilter } from "@/components/MembershipRenewalsFilterSheet";
import { useAppStore } from "@/lib/store";
import { daysUntil, isSameMonth } from "@/lib/calc";
import { VEHICLE_COLORS } from "@/lib/colors";

export default function MembershipRenewalsPage() {
  const router = useRouter();
  const { role, members, vehicleTypes } = useAppStore();
  const [search, setSearch] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState<RenewalStatusFilter>("due");

  if (role !== "admin") {
    return (
      <Typography variant="body1" sx={{ mt: 4 }} align="center" color="text.secondary">
        Reports are only visible to the Admin.
      </Typography>
    );
  }

  const filtersActive = typeFilter !== "all" || statusFilter !== "due";
  const resetFilters = () => {
    setTypeFilter("all");
    setStatusFilter("due");
  };

  const now = new Date();
  const filtered = members
    .filter((m) => {
      if (statusFilter === "all") return true;
      const sameMonth = isSameMonth(m.expiryDate, now);
      if (statusFilter === "due") return sameMonth;
      return sameMonth && daysUntil(m.expiryDate) < 0;
    })
    .filter((m) => typeFilter === "all" || m.vehicleTypeId === typeFilter)
    .filter((m) => m.vehicleNumber.toLowerCase().includes(search.trim().toLowerCase()))
    .sort((a, b) => daysUntil(a.expiryDate) - daysUntil(b.expiryDate));

  return (
    <>
      <Stack direction="row" spacing={1} sx={{ alignItems: "center", mb: 2 }}>
        <IconButton onClick={() => router.push("/settings/reports")} edge="start">
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h6">Membership Renewals</Typography>
      </Stack>

      <TextField
        placeholder="Search by vehicle number"
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

      <Stack spacing={1.5} sx={{ mb: 3 }}>
        {filtered.length === 0 && (
          <Typography variant="body2" color="text.secondary">
            No memberships match your search/filters.
          </Typography>
        )}
        {filtered.map((m) => {
          const vt = vehicleTypes.find((v) => v.id === m.vehicleTypeId);
          const days = daysUntil(m.expiryDate);
          const chipLabel = days < 0 ? `Expired ${Math.abs(days)}d ago` : days === 0 ? "Expires today" : `${days}d left`;
          const chipColor = days < 0 ? "error" : "warning";
          return (
            <Card key={m.id}>
              <CardContent>
                <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "center" }}>
                  <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
                    {vt && (
                      <Avatar sx={{ bgcolor: VEHICLE_COLORS[vt.name], width: 36, height: 36 }}>
                        <VehicleIcon name={vt.name} />
                      </Avatar>
                    )}
                    <Box>
                      <Typography variant="subtitle1">{m.vehicleNumber}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {m.customerName ?? "—"}
                      </Typography>
                    </Box>
                  </Stack>
                  <Chip label={chipLabel} size="small" color={chipColor} />
                </Stack>
              </CardContent>
            </Card>
          );
        })}
      </Stack>

      <MembershipRenewalsFilterSheet
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        vehicleTypes={vehicleTypes}
        typeFilter={typeFilter}
        setTypeFilter={setTypeFilter}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        onReset={resetFilters}
      />
    </>
  );
}
