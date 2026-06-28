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
import CardMembershipIcon from "@mui/icons-material/CardMembership";
import PersonIcon from "@mui/icons-material/Person";
import AllInclusiveIcon from "@mui/icons-material/AllInclusive";
import VehicleIcon from "./VehicleIcon";
import { VehicleType } from "@/lib/types";
import { VEHICLE_COLORS } from "@/lib/colors";
import { useAppStore } from "@/lib/store";
import { TranslationKey } from "@/lib/i18n";

export type DurationFilter = "any" | 2 | 6 | 12 | 24;
export type MemberFilter = "all" | "member" | "walkin";

function vehicleTypeKey(name: string): TranslationKey {
  return name === "Bike" ? "vehicleTypeBike" : name === "Cycle" ? "vehicleTypeCycle" : "vehicleTypeCar";
}

const ALL_COLOR = "#455A64";
const MEMBER_COLOR = "#2E7D32";
const WALKIN_COLOR = "#1565C0";

function IconRow({ icon, color, label }: { icon: React.ReactNode; color: string; label: string }) {
  return (
    <Stack direction="row" spacing={1.25} sx={{ alignItems: "center" }}>
      <Avatar sx={{ bgcolor: color, width: 26, height: 26, "& .MuiSvgIcon-root": { fontSize: 16 } }}>
        {icon}
      </Avatar>
      <Typography variant="body2">{label}</Typography>
    </Stack>
  );
}

export default function ParkOutFilterSheet({
  open,
  onClose,
  vehicleTypes,
  typeFilter,
  setTypeFilter,
  durationFilter,
  setDurationFilter,
  memberFilter,
  setMemberFilter,
  onReset,
}: {
  open: boolean;
  onClose: () => void;
  vehicleTypes: VehicleType[];
  typeFilter: string;
  setTypeFilter: (v: string) => void;
  durationFilter: DurationFilter;
  setDurationFilter: (v: DurationFilter) => void;
  memberFilter: MemberFilter;
  setMemberFilter: (v: MemberFilter) => void;
  onReset: () => void;
}) {
  const { t } = useAppStore();
  const selectedVehicleType = vehicleTypes.find((vt) => vt.id === typeFilter);

  const DURATION_OPTIONS: { value: DurationFilter; label: string }[] = [
    { value: "any", label: t("anyDuration") },
    { value: 2, label: `${t("parkedPrefix")} 2 ${t("hoursOrMoreSuffix")}` },
    { value: 6, label: `${t("parkedPrefix")} 6 ${t("hoursOrMoreSuffix")}` },
    { value: 12, label: `${t("parkedPrefix")} 12 ${t("hoursOrMoreSuffix")}` },
    { value: 24, label: `${t("parkedPrefix")} 24 ${t("hoursOrMoreSuffix")}` },
  ];

  const memberOptions: { value: MemberFilter; label: string; icon: React.ReactNode; color: string }[] = [
    { value: "all", label: t("allOption"), icon: <AllInclusiveIcon fontSize="small" />, color: ALL_COLOR },
    { value: "member", label: t("membersOption"), icon: <CardMembershipIcon fontSize="small" />, color: MEMBER_COLOR },
    { value: "walkin", label: t("walkInOption"), icon: <PersonIcon fontSize="small" />, color: WALKIN_COLOR },
  ];
  const selectedMemberOption = memberOptions.find((o) => o.value === memberFilter)!;

  return (
    <Drawer
      anchor="bottom"
      open={open}
      onClose={onClose}
      slotProps={{ paper: { sx: { height: "75dvh", borderTopLeftRadius: 20, borderTopRightRadius: 20 } } }}
    >
      <Box sx={{ p: 3, pb: 4, height: "100%", display: "flex", flexDirection: "column" }}>
        <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "center", mb: 3 }}>
          <Typography variant="h6">{t("filtersTitle")}</Typography>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Stack>

        <Box sx={{ flex: 1, overflowY: "auto" }}>
          <Typography variant="caption" color="text.secondary">
            {t("vehicleType")}
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
                    label={t(vehicleTypeKey(selectedVehicleType.name))}
                  />
                ) : (
                  <IconRow icon={<AllInclusiveIcon fontSize="small" />} color={ALL_COLOR} label={t("allOption")} />
                )
              }
            >
              <MenuItem value="all">
                <IconRow icon={<AllInclusiveIcon fontSize="small" />} color={ALL_COLOR} label={t("allOption")} />
              </MenuItem>
              {vehicleTypes.map((vt) => (
                <MenuItem key={vt.id} value={vt.id}>
                  <IconRow icon={<VehicleIcon name={vt.name} />} color={VEHICLE_COLORS[vt.name]} label={t(vehicleTypeKey(vt.name))} />
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Typography variant="caption" color="text.secondary">
            {t("durationLabel")}
          </Typography>
          <FormControl fullWidth sx={{ mt: 0.5, mb: 3 }}>
            <Select
              value={String(durationFilter)}
              onChange={(e: SelectChangeEvent) =>
                setDurationFilter((e.target.value === "any" ? "any" : Number(e.target.value)) as DurationFilter)
              }
            >
              {DURATION_OPTIONS.map((opt) => (
                <MenuItem key={opt.value} value={String(opt.value)}>
                  {opt.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Typography variant="caption" color="text.secondary">
            {t("memberTypeLabel")}
          </Typography>
          <FormControl fullWidth sx={{ mt: 0.5, mb: 3 }}>
            <Select
              value={memberFilter}
              onChange={(e: SelectChangeEvent) => setMemberFilter(e.target.value as MemberFilter)}
              renderValue={() => (
                <IconRow icon={selectedMemberOption.icon} color={selectedMemberOption.color} label={selectedMemberOption.label} />
              )}
            >
              {memberOptions.map((opt) => (
                <MenuItem key={opt.value} value={opt.value}>
                  <IconRow icon={opt.icon} color={opt.color} label={opt.label} />
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        <Stack direction="row" spacing={1.5} sx={{ mt: 2 }}>
          <Button variant="outlined" onClick={onReset} sx={{ flex: 1 }}>
            {t("resetBtn")}
          </Button>
          <Button variant="contained" onClick={onClose} sx={{ flex: 2 }}>
            {t("showResultsBtn")}
          </Button>
        </Stack>
      </Box>
    </Drawer>
  );
}
