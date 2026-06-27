"use client";

import { useState } from "react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import Avatar from "@mui/material/Avatar";
import Divider from "@mui/material/Divider";
import CircularProgress from "@mui/material/CircularProgress";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import { alpha } from "@mui/material/styles";
import LocalParkingIcon from "@mui/icons-material/LocalParking";
import LoginIcon from "@mui/icons-material/Login";
import LogoutIcon from "@mui/icons-material/Logout";
import PaymentsIcon from "@mui/icons-material/Payments";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import LocalAtmIcon from "@mui/icons-material/LocalAtm";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import VehicleIcon from "@/components/VehicleIcon";
import { useAppStore } from "@/lib/store";
import { isWithinRange } from "@/lib/calc";
import { VEHICLE_COLORS } from "@/lib/colors";
import dayjs from "@/lib/dayjsConfig";

const GREEN = "#2E7D32";
const ORANGE = "#E65100";

type DashboardPeriod = "today" | "week" | "month";

const PERIOD_LABELS: Record<DashboardPeriod, string> = {
  today: "Today",
  week: "This Week",
  month: "This Month",
};

export default function HomePage() {
  const { sessions, expenses, vehicleTypes, memberPayments } = useAppStore();
  const [period, setPeriod] = useState<DashboardPeriod>("today");

  const now = dayjs.tz();
  const rangeStart =
    period === "today"
      ? now.startOf("day")
      : period === "week"
        ? now.subtract(6, "day").startOf("day")
        : now.startOf("month");
  const start = rangeStart.toDate();
  const end = now.toDate();

  const currentlyParked = sessions.filter((s) => s.status === "parked").length;
  const entered = sessions.filter((s) => isWithinRange(s.entryTime, start, end)).length;
  const exited = sessions.filter(
    (s) => s.status === "completed" && s.exitTime && isWithinRange(s.exitTime, start, end)
  ).length;

  const entryCollected = sessions
    .filter((s) => isWithinRange(s.entryTime, start, end))
    .reduce((sum, s) => sum + s.amountPaidAtEntry, 0);
  const exitCollected = sessions
    .filter((s) => s.status === "completed" && s.exitTime && isWithinRange(s.exitTime, start, end))
    .reduce((sum, s) => sum + (s.amountPaidAtExit ?? 0), 0);
  const memberRevenue = memberPayments
    .filter((mp) => isWithinRange(mp.paidAt, start, end))
    .reduce((sum, mp) => sum + mp.amount, 0);
  const collected = entryCollected + exitCollected + memberRevenue;

  const cash =
    sessions
      .filter((s) => isWithinRange(s.entryTime, start, end) && s.paymentModeAtEntry === "cash")
      .reduce((sum, s) => sum + s.amountPaidAtEntry, 0) +
    sessions
      .filter(
        (s) =>
          s.status === "completed" &&
          s.exitTime &&
          isWithinRange(s.exitTime, start, end) &&
          s.paymentModeAtExit === "cash"
      )
      .reduce((sum, s) => sum + (s.amountPaidAtExit ?? 0), 0) +
    memberPayments
      .filter((mp) => isWithinRange(mp.paidAt, start, end) && mp.paymentMode === "cash")
      .reduce((sum, mp) => sum + mp.amount, 0);
  const online = collected - cash;

  const expensesInRange = expenses
    .filter((e) => isWithinRange(e.expenseDate, start, end))
    .reduce((sum, e) => sum + e.amount, 0);

  const net = collected - expensesInRange;
  const netColor = net >= 0 ? GREEN : "#C62828";
  const total = collected + expensesInRange || 1;
  const sharePct = (collected / total) * 100;

  const trafficMetrics = [
    { label: "Entered", value: entered, icon: <LoginIcon />, color: "#1565C0" },
    { label: "Exited", value: exited, icon: <LogoutIcon />, color: "#AD1457" },
    { label: "Currently Parked", value: currentlyParked, icon: <LocalParkingIcon />, color: "#37474F" },
  ];

  const metrics = [
    { label: "Collected", value: `₹${collected}`, icon: <PaymentsIcon />, color: GREEN },
    { label: "Expenses", value: `₹${expensesInRange}`, icon: <ReceiptLongIcon />, color: ORANGE },
    { label: "Cash", value: `₹${cash}`, icon: <LocalAtmIcon />, color: "#00838F" },
    { label: "Online", value: `₹${online}`, icon: <CreditCardIcon />, color: "#5E35B1" },
  ];

  return (
    <>
      <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "center", mb: 2 }}>
        <Typography variant="body2" color="text.secondary">
          Showing
        </Typography>
        <Select
          value={period}
          size="small"
          onChange={(e: SelectChangeEvent) => setPeriod(e.target.value as DashboardPeriod)}
          sx={{ minWidth: 180 }}
        >
          <MenuItem value="today">Today</MenuItem>
          <MenuItem value="week">This Week (Last 7 days)</MenuItem>
          <MenuItem value="month">This Month</MenuItem>
        </Select>
      </Stack>

      <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
        {PERIOD_LABELS[period]}&apos;s Traffic
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
        {PERIOD_LABELS[period]}&apos;s Collections
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
            {PERIOD_LABELS[period]}
          </Typography>
          <Grid container spacing={1.5} sx={{ mb: 2, mt: 0.5 }}>
            <Grid size={4}>
              <Typography variant="caption" color="text.secondary">
                Collected
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 700, color: GREEN }}>
                ₹{collected}
              </Typography>
            </Grid>
            <Grid size={4}>
              <Typography variant="caption" color="text.secondary">
                Expenses
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 700, color: ORANGE }}>
                ₹{expensesInRange}
              </Typography>
            </Grid>
            <Grid size={4}>
              <Typography variant="caption" color="text.secondary">
                Net
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 700, color: netColor }}>
                ₹{net}
              </Typography>
            </Grid>
          </Grid>

          <Box sx={{ display: "flex", height: 10, borderRadius: 5, overflow: "hidden", bgcolor: "grey.100", mb: 1 }}>
            <Box sx={{ width: `${sharePct}%`, bgcolor: GREEN }} />
            <Box sx={{ width: `${100 - sharePct}%`, bgcolor: ORANGE }} />
          </Box>
          <Stack direction="row" spacing={2.5}>
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
