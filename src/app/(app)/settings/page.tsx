"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import AssessmentIcon from "@mui/icons-material/Assessment";
import StoreIcon from "@mui/icons-material/Store";
import CardMembershipIcon from "@mui/icons-material/CardMembership";
import GroupIcon from "@mui/icons-material/Group";
import TuneIcon from "@mui/icons-material/Tune";
import EditBusinessDetailsSheet from "@/components/EditBusinessDetailsSheet";
import EditVehicleTypeSheet from "@/components/EditVehicleTypeSheet";
import AdvancedPreferencesSheet from "@/components/AdvancedPreferencesSheet";
import VehicleIcon from "@/components/VehicleIcon";
import { SettingsRow } from "@/components/SettingsRow";
import { useAppStore } from "@/lib/store";
import { VehicleType } from "@/lib/types";
import { VEHICLE_COLORS } from "@/lib/colors";

const PRIMARY = "#00658F";

export default function SettingsPage() {
  const { role, businessName, businessPhone, vehicleTypes, members, teamInvites } = useAppStore();
  const router = useRouter();
  const [editingDetails, setEditingDetails] = useState(false);
  const [editingVehicleType, setEditingVehicleType] = useState<VehicleType | null>(null);
  const [advancedOpen, setAdvancedOpen] = useState(false);

  const activeMemberCount = members.filter((m) => new Date(m.expiryDate).getTime() >= Date.now()).length;

  if (role !== "admin") {
    return (
      <Typography variant="body1" sx={{ mt: 4 }} align="center" color="text.secondary">
        Settings are only visible to the Admin.
      </Typography>
    );
  }

  return (
    <>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 2.5 }}>
        Settings
      </Typography>

      <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
        Business
      </Typography>
      <Stack spacing={1.5} sx={{ mb: 2.5 }}>
        <SettingsRow
          icon={<StoreIcon />}
          color={PRIMARY}
          title="Business Details"
          subtitle={businessPhone ? `${businessName} · ${businessPhone}` : businessName}
          onClick={() => setEditingDetails(true)}
        />
      </Stack>

      <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
        Vehicle Types
      </Typography>
      <Stack spacing={1.5} sx={{ mb: 2.5 }}>
        {vehicleTypes.map((vt) => {
          const sorted = [...vt.slabs].sort((a, b) => a.order - b.order);
          const [slab1, slab2] = sorted;
          const rateSummary =
            slab1 && slab2
              ? `₹${slab1.amount} first ${slab1.toHour}h, then ₹${slab2.amount}/${slab2.unitHours ?? 1}h`
              : "Tap to configure";
          return (
            <SettingsRow
              key={vt.id}
              icon={<VehicleIcon name={vt.name} />}
              color={VEHICLE_COLORS[vt.name]}
              title={vt.name}
              subtitle={`${vt.totalSlots} slots · ${rateSummary}`}
              onClick={() => setEditingVehicleType(vt)}
            />
          );
        })}
      </Stack>

      <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
        Memberships
      </Typography>
      <Stack spacing={1.5} sx={{ mb: 2.5 }}>
        <SettingsRow
          icon={<CardMembershipIcon />}
          color={PRIMARY}
          title="Members"
          subtitle={`${activeMemberCount} active membership${activeMemberCount === 1 ? "" : "s"}`}
          onClick={() => router.push("/settings/members")}
        />
      </Stack>

      <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
        Team
      </Typography>
      <Stack spacing={1.5} sx={{ mb: 2.5 }}>
        <SettingsRow
          icon={<GroupIcon />}
          color={PRIMARY}
          title="Team Members"
          subtitle={`${teamInvites.length} invited`}
          onClick={() => router.push("/settings/team")}
        />
      </Stack>

      <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
        Reports
      </Typography>
      <Stack spacing={1.5} sx={{ mb: 2.5 }}>
        <SettingsRow
          icon={<AssessmentIcon />}
          color={PRIMARY}
          title="Reports"
          subtitle="Financial and operational insights"
          onClick={() => router.push("/settings/reports")}
        />
      </Stack>

      <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
        More Settings
      </Typography>
      <Stack spacing={1.5}>
        <SettingsRow
          icon={<TuneIcon />}
          color={PRIMARY}
          title="Advanced Preferences"
          subtitle="Vehicle number capture, check-in payment & more"
          onClick={() => setAdvancedOpen(true)}
        />
      </Stack>

      <EditBusinessDetailsSheet open={editingDetails} onClose={() => setEditingDetails(false)} />
      <EditVehicleTypeSheet vehicleType={editingVehicleType} onClose={() => setEditingVehicleType(null)} />
      <AdvancedPreferencesSheet open={advancedOpen} onClose={() => setAdvancedOpen(false)} />
    </>
  );
}
