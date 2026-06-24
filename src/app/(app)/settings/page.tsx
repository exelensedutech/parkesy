"use client";

import { useRouter } from "next/navigation";
import Typography from "@mui/material/Typography";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import AssessmentIcon from "@mui/icons-material/Assessment";
import { useAppStore } from "@/lib/store";

export default function SettingsPage() {
  const { role } = useAppStore();
  const router = useRouter();

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

      <List sx={{ bgcolor: "background.paper", borderRadius: 2 }}>
        <ListItemButton onClick={() => router.push("/settings/reports")}>
          <ListItemIcon>
            <AssessmentIcon />
          </ListItemIcon>
          <ListItemText primary="Reports & History" secondary="View collections, expenses and net for any past day" />
          <ChevronRightIcon color="action" />
        </ListItemButton>
      </List>
    </>
  );
}
