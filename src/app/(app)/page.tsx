"use client";

import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import Avatar from "@mui/material/Avatar";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import CircularProgress from "@mui/material/CircularProgress";
import { alpha } from "@mui/material/styles";
import LocalParkingIcon from "@mui/icons-material/LocalParking";
import LoginIcon from "@mui/icons-material/Login";
import LogoutIcon from "@mui/icons-material/Logout";
import PaymentsIcon from "@mui/icons-material/Payments";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import LocalAtmIcon from "@mui/icons-material/LocalAtm";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import VehicleIcon from "@/components/VehicleIcon";
import { useAppStore } from "@/lib/store";
import { isSameDay, isSameMonth } from "@/lib/calc";
import { VEHICLE_COLORS } from "@/lib/colors";

const GREEN = "#2E7D32";
const ORANGE = "#E65100";

export default function HomePage() {
  const { sessions, expenses, businessName, vehicleTypes, memberPayments } = useAppStore();
  const today = new Date();

  const currentlyParked = sessions.filter((s) => s.status === "parked").length;
  const enteredToday = sessions.filter((s) => isSameDay(s.entryTime, today)).length;
  const exitedToday = sessions.filter(
    (s) => s.status === "completed" && s.exitTime && isSameDay(s.exitTime, today)
  ).length;

  const entryCollectedToday = sessions
    .filter((s) => isSameDay(s.entryTime, today))
    .reduce((sum, s) => sum + s.amountPaidAtEntry, 0);
  const exitCollectedToday = sessions
    .filter((s) => s.status === "completed" && s.exitTime && isSameDay(s.exitTime, today))
    .reduce((sum, s) => sum + (s.amountPaidAtExit ?? 0), 0);
  const memberRevenueToday = memberPayments
    .filter((mp) => isSameDay(mp.paidAt, today))
    .reduce((sum, mp) => sum + mp.amount, 0);
  const collectedToday = entryCollectedToday + exitCollectedToday + memberRevenueToday;

  const cashToday =
    sessions
      .filter((s) => isSameDay(s.entryTime, today) && s.paymentModeAtEntry === "cash")
      .reduce((sum, s) => sum + s.amountPaidAtEntry, 0) +
    sessions
      .filter((s) => s.status === "completed" && s.exitTime && isSameDay(s.exitTime, today) && s.paymentModeAtExit === "cash")
      .reduce((sum, s) => sum + (s.amountPaidAtExit ?? 0), 0) +
    memberPayments
      .filter((mp) => isSameDay(mp.paidAt, today) && mp.paymentMode === "cash")
      .reduce((sum, mp) => sum + mp.amount, 0);
  const onlineToday = collectedToday - cashToday;

  const expensesToday = expenses
    .filter((e) => isSameDay(e.expenseDate, today))
    .reduce((sum, e) => sum + e.amount, 0);

  const netToday = collectedToday - expensesToday;
  const netColor = netToday >= 0 ? GREEN : "#C62828";

  const entryCollectedMonth = sessions
    .filter((s) => isSameMonth(s.entryTime, today))
    .reduce((sum, s) => sum + s.amountPaidAtEntry, 0);
  const exitCollectedMonth = sessions
    .filter((s) => s.status === "completed" && s.exitTime && isSameMonth(s.exitTime, today))
    .reduce((sum, s) => sum + (s.amountPaidAtExit ?? 0), 0);
  const memberRevenueMonth = memberPayments
    .filter((mp) => isSameMonth(mp.paidAt, today))
    .reduce((sum, mp) => sum + mp.amount, 0);
  const collectedMonth = entryCollectedMonth + exitCollectedMonth + memberRevenueMonth;
  const expensesMonth = expenses
    .filter((e) => isSameMonth(e.expenseDate, today))
    .reduce((sum, e) => sum + e.amount, 0);
  const netMonth = collectedMonth - expensesMonth;
  const monthTotal = collectedMonth + expensesMonth || 1;
  const collectedSharePct = (collectedMonth / monthTotal) * 100;

  const trafficMetrics = [
    { label: "Entered Today", value: enteredToday, icon: <LoginIcon />, color: "#1565C0" },
    { label: "Exited Today", value: exitedToday, icon: <LogoutIcon />, color: "#AD1457" },
    { label: "Currently Parked", value: currentlyParked, icon: <LocalParkingIcon />, color: "#37474F" },
  ];

  const metrics = [
    { label: "Collected Today", value: `₹${collectedToday}`, icon: <PaymentsIcon />, color: GREEN },
    { label: "Expenses Today", value: `₹${expensesToday}`, icon: <ReceiptLongIcon />, color: ORANGE },
    { label: "Cash Today", value: `₹${cashToday}`, icon: <LocalAtmIcon />, color: "#00838F" },
    { label: "Online Today", value: `₹${onlineToday}`, icon: <CreditCardIcon />, color: "#5E35B1" },
  ];

  return (
    <>
      <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "flex-start", mb: 2.5 }}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          {businessName}
        </Typography>
        <Chip
          label={today.toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
          size="small"
          variant="outlined"
        />
      </Stack>

      <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
        Today&apos;s Traffic
      </Typography>
      <Grid container spacing={1.5} sx={{ mb: 2.5 }}>
        {trafficMetrics.map((m) => (
          <Grid size={4} key={m.label}>
            <Card sx={{ height: "100%" }}>
              <CardContent sx={{ textAlign: "center", px: 1 }}>
                <Avatar sx={{ bgcolor: m.color, width: 32, height: 32, mb: 1, mx: "auto" }}>{m.icon}</Avatar>
                <Typography variant="h5" sx={{ fontWeight: 700 }}>
                  {m.value}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {m.label}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
        Today&apos;s Collections
      </Typography>
      <Grid container spacing={1.5} sx={{ mb: 2 }}>
        {metrics.map((m) => (
          <Grid size={6} key={m.label}>
            <Card sx={{ height: "100%" }}>
              <CardContent>
                <Avatar sx={{ bgcolor: m.color, width: 36, height: 36, mb: 1 }}>{m.icon}</Avatar>
                <Typography variant="caption" color="text.secondary">
                  {m.label}
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 700 }}>
                  {m.value}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
        Profit &amp; Loss
      </Typography>
      <Card sx={{ mb: 2.5 }}>
        <CardContent>
          <Typography variant="overline" sx={{ fontWeight: 700, color: "text.secondary", letterSpacing: 1 }}>
            Today
          </Typography>
          <Stack
            direction="row"
            sx={{
              justifyContent: "space-between",
              alignItems: "center",
              p: 1,
              mt: 0.5,
              mb: 2,
              borderRadius: 2,
              bgcolor: alpha(netColor, 0.08),
            }}
          >
            <Stack direction="row" spacing={1.25} sx={{ alignItems: "center" }}>
              <Avatar sx={{ bgcolor: alpha(netColor, 0.15), color: netColor, width: 32, height: 32 }}>
                {netToday >= 0 ? <TrendingUpIcon fontSize="small" /> : <TrendingDownIcon fontSize="small" />}
              </Avatar>
              <Typography variant="body2" color="text.secondary">
                Net Profit
              </Typography>
            </Stack>
            <Typography variant="h6" sx={{ fontWeight: 700, color: netColor }}>
              ₹{netToday}
            </Typography>
          </Stack>

          <Divider sx={{ mb: 2 }} />

          <Typography variant="overline" sx={{ fontWeight: 700, color: "text.secondary", letterSpacing: 1 }}>
            This Month So Far
          </Typography>
          <Grid container spacing={1.5} sx={{ mb: 2, mt: 0.5 }}>
            <Grid size={4}>
              <Typography variant="caption" color="text.secondary">
                Collected
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 700, color: GREEN }}>
                ₹{collectedMonth}
              </Typography>
            </Grid>
            <Grid size={4}>
              <Typography variant="caption" color="text.secondary">
                Expenses
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 700, color: ORANGE }}>
                ₹{expensesMonth}
              </Typography>
            </Grid>
            <Grid size={4}>
              <Typography variant="caption" color="text.secondary">
                Net
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 700 }} color={netMonth >= 0 ? "success.main" : "error.main"}>
                ₹{netMonth}
              </Typography>
            </Grid>
          </Grid>

          <Box sx={{ display: "flex", height: 10, borderRadius: 5, overflow: "hidden", bgcolor: "grey.100" }}>
            <Box sx={{ width: `${collectedSharePct}%`, bgcolor: GREEN }} />
            <Box sx={{ width: `${100 - collectedSharePct}%`, bgcolor: ORANGE }} />
          </Box>
          <Stack direction="row" spacing={2.5} sx={{ mt: 1 }}>
            <Stack direction="row" spacing={0.75} sx={{ alignItems: "center" }}>
              <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: GREEN }} />
              <Typography variant="caption" color="text.secondary">
                Collected
              </Typography>
            </Stack>
            <Stack direction="row" spacing={0.75} sx={{ alignItems: "center" }}>
              <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: ORANGE }} />
              <Typography variant="caption" color="text.secondary">
                Expenses
              </Typography>
            </Stack>
          </Stack>
        </CardContent>
      </Card>

      <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
        Capacity
      </Typography>
      <Card>
        <CardContent>
          <Stack direction="row" sx={{ justifyContent: "space-around" }}>
            {vehicleTypes.map((vt) => {
              const parkedCount = sessions.filter((s) => s.status === "parked" && s.vehicleTypeId === vt.id).length;
              const pct = vt.totalSlots > 0 ? Math.min((parkedCount / vt.totalSlots) * 100, 100) : 0;
              const ringColor = pct >= 90 ? "#C62828" : pct >= 70 ? ORANGE : VEHICLE_COLORS[vt.name];
              return (
                <Stack key={vt.id} spacing={1} sx={{ alignItems: "center" }}>
                  <Box sx={{ position: "relative", display: "inline-flex" }}>
                    <CircularProgress
                      variant="determinate"
                      value={100}
                      size={64}
                      thickness={4}
                      sx={{ color: alpha(ringColor, 0.15), position: "absolute" }}
                    />
                    <CircularProgress
                      variant="determinate"
                      value={pct}
                      size={64}
                      thickness={4}
                      sx={{ color: ringColor }}
                    />
                    <Box
                      sx={{
                        position: "absolute",
                        inset: 0,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: ringColor,
                      }}
                    >
                      <VehicleIcon name={vt.name} />
                    </Box>
                  </Box>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {vt.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {parkedCount}/{vt.totalSlots}
                  </Typography>
                </Stack>
              );
            })}
          </Stack>
        </CardContent>
      </Card>
    </>
  );
}
