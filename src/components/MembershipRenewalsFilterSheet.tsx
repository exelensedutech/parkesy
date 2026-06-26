"use client";

import Drawer from "@mui/material/Drawer";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import Avatar from "@mui/material/Avatar";
import FormControl from "@mui/material/FormControl";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import CloseIcon from "@mui/icons-material/Close";
import AllInclusiveIcon from "@mui/icons-material/AllInclusive";
import VehicleIcon from "./VehicleIcon";
import { VehicleType } from "@/lib/types";
import { VEHICLE_COLORS } from "@/lib/colors";

export type RenewalStatusFilter = "due" | "lapsed" | "all";

const STATUS_OPTIONS: { value: RenewalStatusFilter; label: string }[] = [
  { value: "due", label: "Due This Month" },
  { value: "lapsed", label: "Lapsed This Month" },
  { value: "all", label: "All Memberships" },
];

const ALL_COLOR = "#455A64";

function IconRow({ icon, color, label }: { icon: React.ReactNode; color: string; label: string }) {
  return (
    <Stack direction="row" spacing={1.25} sx={{ alignItems: "center" }}>
      <Avatar sx={{ bgcolor: color, width: 26, height: 26, "& .MuiSvgIcon-root": { fontSize: 16 } }}>{icon}</Avatar>
      <Typography variant="body2">{label}</Typography>
    </Stack>
  );
}

export default function MembershipRenewalsFilterSheet({
  open,
  onClose,
  vehicleTypes,
  typeFilter,
  setTypeFilter,
  statusFilter,
  setStatusFilter,
  onReset,
}: {
  open: boolean;
  onClose: () => void;
  vehicleTypes: VehicleType[];
  typeFilter: string;
  setTypeFilter: (v: string) => void;
  statusFilter: RenewalStatusFilter;
  setStatusFilter: (v: RenewalStatusFilter) => void;
  onReset: () => void;
}) {
  const selectedVehicleType = vehicleTypes.find((vt) => vt.id === typeFilter);

  return (
    <Drawer
      anchor="bottom"
      open={open}
      onClose={onClose}
      slotProps={{ paper: { sx: { height: "75dvh", borderTopLeftRadius: 20, borderTopRightRadius: 20 } } }}
    >
      <Box sx={{ p: 3, pb: 4, height: "100%", display: "flex", flexDirection: "column" }}>
        <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "center", mb: 3 }}>
          <Typography variant="h6">Filters</Typography>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Stack>

        <Box sx={{ flex: 1, overflowY: "auto" }}>
          <Typography variant="caption" color="text.secondary">
            Vehicle Type
          </Typography>
          <FormControl fullWidth sx={{ mt: 0.5, mb: 3 }}>
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

          <Typography variant="caption" color="text.secondary">
            Status
          </Typography>
          <FormControl fullWidth sx={{ mt: 0.5, mb: 3 }}>
            <Select value={statusFilter} onChange={(e: SelectChangeEvent) => setStatusFilter(e.target.value as RenewalStatusFilter)}>
              {STATUS_OPTIONS.map((opt) => (
                <MenuItem key={opt.value} value={opt.value}>
                  {opt.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        <Stack direction="row" spacing={1.5} sx={{ mt: 2 }}>
          <Button variant="outlined" onClick={onReset} sx={{ flex: 1 }}>
            Reset
          </Button>
          <Button variant="contained" onClick={onClose} sx={{ flex: 2 }}>
            Show Results
          </Button>
        </Stack>
      </Box>
    </Drawer>
  );
}
