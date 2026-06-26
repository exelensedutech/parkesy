"use client";

import { useRouter } from "next/navigation";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Avatar from "@mui/material/Avatar";
import Chip from "@mui/material/Chip";
import Grid from "@mui/material/Grid";
import IconButton from "@mui/material/IconButton";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import VehicleIcon from "@/components/VehicleIcon";
import { useAppStore } from "@/lib/store";
import { daysUntil, isSameMonth } from "@/lib/calc";
import { VEHICLE_COLORS } from "@/lib/colors";

export default function MembershipRenewalsPage() {
  const router = useRouter();
  const { role, members, vehicleTypes, memberPayments } = useAppStore();

  if (role !== "owner") {
    return (
      <Typography variant="body1" sx={{ mt: 4 }} align="center" color="text.secondary">
        Reports are only visible to the Owner.
      </Typography>
    );
  }

  const now = new Date();
  const expiringSoon = members
    .filter((m) => {
      const d = daysUntil(m.expiryDate);
      return d >= 0 && d <= 7;
    })
    .sort((a, b) => daysUntil(a.expiryDate) - daysUntil(b.expiryDate));

  const lapsed = members
    .filter((m) => daysUntil(m.expiryDate) < 0)
    .sort((a, b) => daysUntil(b.expiryDate) - daysUntil(a.expiryDate));

  const paymentsThisMonth = memberPayments.filter((mp) => isSameMonth(mp.paidAt, now));
  const signupRevenue = paymentsThisMonth.filter((mp) => mp.type === "signup").reduce((sum, mp) => sum + mp.amount, 0);
  const renewalRevenue = paymentsThisMonth.filter((mp) => mp.type === "renewal").reduce((sum, mp) => sum + mp.amount, 0);

  const renderMemberRow = (m: (typeof members)[number], chipLabel: string, chipColor: "warning" | "error") => {
    const vt = vehicleTypes.find((v) => v.id === m.vehicleTypeId);
    return (
      <Card key={m.id}>
        <CardContent sx={{ py: 1.5 }}>
          <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "center" }}>
            <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
              {vt && (
                <Avatar sx={{ bgcolor: VEHICLE_COLORS[vt.name], width: 36, height: 36 }}>
                  <VehicleIcon name={vt.name} />
                </Avatar>
              )}
              <Box>
                <Typography variant="body2">{m.vehicleNumber}</Typography>
                {m.customerName && (
                  <Typography variant="caption" color="text.secondary">
                    {m.customerName}
                  </Typography>
                )}
              </Box>
            </Stack>
            <Chip label={chipLabel} size="small" color={chipColor} />
          </Stack>
        </CardContent>
      </Card>
    );
  };

  return (
    <>
      <Stack direction="row" spacing={1} sx={{ alignItems: "center", mb: 2 }}>
        <IconButton onClick={() => router.push("/settings/reports")} edge="start">
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h6">Membership Renewals</Typography>
      </Stack>

      <Typography variant="subtitle1" sx={{ mb: 1 }}>
        Expiring in Next 7 Days
      </Typography>
      <Stack spacing={1} sx={{ mb: 3 }}>
        {expiringSoon.length === 0 && (
          <Typography variant="body2" color="text.secondary">
            No memberships expiring this week.
          </Typography>
        )}
        {expiringSoon.map((m) => renderMemberRow(m, `${daysUntil(m.expiryDate)}d left`, "warning"))}
      </Stack>

      <Typography variant="subtitle1" sx={{ mb: 1 }}>
        Lapsed Memberships
      </Typography>
      <Stack spacing={1} sx={{ mb: 3 }}>
        {lapsed.length === 0 && (
          <Typography variant="body2" color="text.secondary">
            No lapsed memberships.
          </Typography>
        )}
        {lapsed.map((m) => renderMemberRow(m, `Expired ${Math.abs(daysUntil(m.expiryDate))}d ago`, "error"))}
      </Stack>

      <Typography variant="subtitle1" sx={{ mb: 1 }}>
        This Month&apos;s Membership Revenue
      </Typography>
      <Grid container spacing={1.5}>
        <Grid size={6}>
          <Card>
            <CardContent>
              <Typography variant="caption" color="text.secondary">
                New Signups
              </Typography>
              <Typography variant="h5">₹{signupRevenue}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={6}>
          <Card>
            <CardContent>
              <Typography variant="caption" color="text.secondary">
                Renewals
              </Typography>
              <Typography variant="h5">₹{renewalRevenue}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </>
  );
}
