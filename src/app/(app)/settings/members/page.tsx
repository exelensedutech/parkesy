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
import VehicleIcon from "@/components/VehicleIcon";
import AddMemberSheet from "@/components/AddMemberSheet";
import RenewMemberSheet from "@/components/RenewMemberSheet";
import { useAppStore } from "@/lib/store";
import { Member } from "@/lib/types";
import { daysUntil } from "@/lib/calc";
import { VEHICLE_COLORS } from "@/lib/colors";
import { durationUnitKey } from "@/lib/membership";
import { TranslationKey } from "@/lib/i18n";

function statusFor(member: Member, t: (key: TranslationKey) => string) {
  const days = daysUntil(member.expiryDate);
  if (days < 0) return { label: t("expired"), color: "error" as const };
  if (days <= 7) return { label: `${t("expiresInDays")} ${days}d`, color: "warning" as const };
  return { label: t("active"), color: "success" as const };
}

export default function MembersPage() {
  const router = useRouter();
  const { role, members, vehicleTypes, t } = useAppStore();
  const [addOpen, setAddOpen] = useState(false);
  const [renewing, setRenewing] = useState<Member | null>(null);

  if (role !== "admin") {
    return (
      <Typography variant="body1" sx={{ mt: 4 }} align="center" color="text.secondary">
        {t("membersAdminOnly")}
      </Typography>
    );
  }

  const sorted = [...members].sort((a, b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime());

  return (
    <>
      <Stack direction="row" spacing={1} sx={{ alignItems: "center", mb: 2 }}>
        <IconButton onClick={() => router.push("/settings")} edge="start">
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h6">{t("membersRowTitle")}</Typography>
      </Stack>

      <Stack spacing={1.5}>
        {sorted.length === 0 && (
          <Typography variant="body2" color="text.secondary">
            {t("noMembersYet")}
          </Typography>
        )}
        {sorted.map((member) => {
          const vehicleType = vehicleTypes.find((vt) => vt.id === member.vehicleTypeId)!;
          const status = statusFor(member, t);
          return (
            <Card key={member.id} onClick={() => setRenewing(member)} sx={{ cursor: "pointer" }}>
              <CardContent>
                <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "center" }}>
                  <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
                    <Avatar sx={{ bgcolor: VEHICLE_COLORS[vehicleType.name], width: 36, height: 36 }}>
                      <VehicleIcon name={vehicleType.name} />
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle1">{member.vehicleNumber}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {member.customerName ? `${member.customerName} · ` : ""}₹{member.feeAmount} /{" "}
                        {member.durationMonths} {t(durationUnitKey(member.durationMonths))}
                      </Typography>
                    </Box>
                  </Stack>
                  <Chip label={status.label} size="small" color={status.color} />
                </Stack>
              </CardContent>
            </Card>
          );
        })}
      </Stack>

      <Fab color="primary" sx={{ position: "fixed", bottom: 88, right: 24 }} onClick={() => setAddOpen(true)}>
        <AddIcon />
      </Fab>

      <AddMemberSheet open={addOpen} onClose={() => setAddOpen(false)} />
      <RenewMemberSheet member={renewing} onClose={() => setRenewing(null)} />
    </>
  );
}
