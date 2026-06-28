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
import Fab from "@mui/material/Fab";
import IconButton from "@mui/material/IconButton";
import AddIcon from "@mui/icons-material/Add";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import DeleteIcon from "@mui/icons-material/Delete";
import AddTeamMemberSheet from "@/components/AddTeamMemberSheet";
import { useAppStore } from "@/lib/store";

export default function TeamPage() {
  const router = useRouter();
  const { role, teamInvites, removeTeamInvite, t } = useAppStore();
  const [addOpen, setAddOpen] = useState(false);

  if (role !== "admin") {
    return (
      <Typography variant="body1" sx={{ mt: 4 }} align="center" color="text.secondary">
        {t("teamMembersOnlyAdmin")}
      </Typography>
    );
  }

  return (
    <>
      <Stack direction="row" spacing={1} sx={{ alignItems: "center", mb: 2 }}>
        <IconButton onClick={() => router.push("/settings")} edge="start">
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h6">{t("teamMembersRowTitle")}</Typography>
      </Stack>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
        {t("teamPageSubtitle")}
      </Typography>

      <Stack spacing={1.5}>
        {teamInvites.length === 0 && (
          <Typography variant="body2" color="text.secondary">
            {t("noTeamMembersYet")}
          </Typography>
        )}
        {teamInvites.map((invite) => (
          <Card key={invite.id}>
            <CardContent>
              <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "center" }}>
                <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
                  <Avatar sx={{ width: 36, height: 36 }}>{invite.name.charAt(0).toUpperCase()}</Avatar>
                  <Box>
                    <Typography variant="subtitle1">{invite.name}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {invite.phone} · PIN {invite.pin}
                    </Typography>
                  </Box>
                </Stack>
                <Stack direction="row" spacing={0.5} sx={{ alignItems: "center" }}>
                  <Chip
                    label={invite.role === "admin" ? t("admin") : t("employeeRole")}
                    size="small"
                    color={invite.role === "admin" ? "primary" : "default"}
                  />
                  <IconButton size="small" onClick={() => removeTeamInvite(invite.id)} aria-label="Remove invite">
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        ))}
      </Stack>

      <Fab color="primary" sx={{ position: "fixed", bottom: 88, right: 24 }} onClick={() => setAddOpen(true)}>
        <AddIcon />
      </Fab>

      <AddTeamMemberSheet open={addOpen} onClose={() => setAddOpen(false)} />
    </>
  );
}
