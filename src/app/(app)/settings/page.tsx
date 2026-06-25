"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Typography from "@mui/material/Typography";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import AssessmentIcon from "@mui/icons-material/Assessment";
import StoreIcon from "@mui/icons-material/Store";
import CardMembershipIcon from "@mui/icons-material/CardMembership";
import EditBusinessNameSheet from "@/components/EditBusinessNameSheet";
import EditSlotsSheet from "@/components/EditSlotsSheet";
import VehicleIcon from "@/components/VehicleIcon";
import { useAppStore } from "@/lib/store";
import { VehicleType } from "@/lib/types";

export default function SettingsPage() {
  const { role, businessName, vehicleTypes, members } = useAppStore();
  const router = useRouter();
  const [editingName, setEditingName] = useState(false);
  const [editingSlotsFor, setEditingSlotsFor] = useState<VehicleType | null>(null);

  const activeMemberCount = members.filter((m) => new Date(m.expiryDate).getTime() >= Date.now()).length;

  if (role !== "owner") {
    return (
      <Typography variant="body1" sx={{ mt: 4 }} align="center" color="text.secondary">
        Settings are only visible to the Owner.
      </Typography>
    );
  }

  return (
    <>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Settings
      </Typography>

      <Typography variant="caption" color="text.secondary">
        BUSINESS PROFILE
      </Typography>
      <List sx={{ bgcolor: "background.paper", borderRadius: 2, mb: 3, mt: 0.5 }}>
        <ListItemButton onClick={() => setEditingName(true)}>
          <ListItemIcon>
            <StoreIcon />
          </ListItemIcon>
          <ListItemText primary="Business Name" secondary={businessName} />
          <ChevronRightIcon color="action" />
        </ListItemButton>
      </List>

      <Typography variant="caption" color="text.secondary">
        PARKING CAPACITY
      </Typography>
      <List sx={{ bgcolor: "background.paper", borderRadius: 2, mb: 3, mt: 0.5 }}>
        {vehicleTypes.map((vt) => (
          <ListItemButton key={vt.id} onClick={() => setEditingSlotsFor(vt)}>
            <ListItemIcon>
              <VehicleIcon name={vt.name} />
            </ListItemIcon>
            <ListItemText primary={vt.name} secondary={`${vt.totalSlots} total slots`} />
            <ChevronRightIcon color="action" />
          </ListItemButton>
        ))}
      </List>

      <Typography variant="caption" color="text.secondary">
        MEMBERSHIPS
      </Typography>
      <List sx={{ bgcolor: "background.paper", borderRadius: 2, mb: 3, mt: 0.5 }}>
        <ListItemButton onClick={() => router.push("/settings/members")}>
          <ListItemIcon>
            <CardMembershipIcon />
          </ListItemIcon>
          <ListItemText primary="Members" secondary={`${activeMemberCount} active monthly pass${activeMemberCount === 1 ? "" : "es"}`} />
          <ChevronRightIcon color="action" />
        </ListItemButton>
      </List>

      <Typography variant="caption" color="text.secondary">
        REPORTS
      </Typography>
      <List sx={{ bgcolor: "background.paper", borderRadius: 2, mt: 0.5 }}>
        <ListItemButton onClick={() => router.push("/settings/reports")}>
          <ListItemIcon>
            <AssessmentIcon />
          </ListItemIcon>
          <ListItemText primary="Reports & History" secondary="View collections, expenses and net for any past day" />
          <ChevronRightIcon color="action" />
        </ListItemButton>
      </List>

      <EditBusinessNameSheet open={editingName} onClose={() => setEditingName(false)} />
      <EditSlotsSheet vehicleType={editingSlotsFor} onClose={() => setEditingSlotsFor(null)} />
    </>
  );
}
