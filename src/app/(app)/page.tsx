"use client";

import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import { useAppStore } from "@/lib/store";
import { isSameDay } from "@/lib/calc";

export default function HomePage() {
  const { sessions, expenses } = useAppStore();
  const today = new Date();

  const currentlyParked = sessions.filter((s) => s.status === "parked").length;
  const parkedToday = sessions.filter((s) => isSameDay(s.entryTime, today)).length;

  const entryCollectedToday = sessions
    .filter((s) => isSameDay(s.entryTime, today))
    .reduce((sum, s) => sum + s.amountPaidAtEntry, 0);
  const exitCollectedToday = sessions
    .filter((s) => s.status === "completed" && s.exitTime && isSameDay(s.exitTime, today))
    .reduce((sum, s) => sum + (s.amountPaidAtExit ?? 0), 0);
  const collectedToday = entryCollectedToday + exitCollectedToday;

  const cashToday =
    sessions
      .filter((s) => isSameDay(s.entryTime, today) && s.paymentModeAtEntry === "cash")
      .reduce((sum, s) => sum + s.amountPaidAtEntry, 0) +
    sessions
      .filter((s) => s.status === "completed" && s.exitTime && isSameDay(s.exitTime, today) && s.paymentModeAtExit === "cash")
      .reduce((sum, s) => sum + (s.amountPaidAtExit ?? 0), 0);
  const onlineToday = collectedToday - cashToday;

  const expensesToday = expenses
    .filter((e) => isSameDay(e.expenseDate, today))
    .reduce((sum, e) => sum + e.amount, 0);

  const netToday = collectedToday - expensesToday;

  const metrics = [
    { label: "Currently Parked", value: currentlyParked },
    { label: "Vehicles Parked Today", value: parkedToday },
    { label: "Collected Today", value: `₹${collectedToday}` },
    { label: "Expenses Today", value: `₹${expensesToday}` },
    { label: "Cash Today", value: `₹${cashToday}` },
    { label: "Online Today", value: `₹${onlineToday}` },
  ];

  return (
    <>
      <Typography variant="h6" sx={{ mb: 0.5 }}>
        Today&apos;s Overview
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        {today.toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long" })}
      </Typography>

      <Grid container spacing={1.5} sx={{ mb: 1.5 }}>
        {metrics.map((m) => (
          <Grid size={6} key={m.label}>
            <Card>
              <CardContent>
                <Typography variant="caption" color="text.secondary">
                  {m.label}
                </Typography>
                <Typography variant="h5">{m.value}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Card sx={{ bgcolor: netToday >= 0 ? "success.light" : "error.light" }}>
        <CardContent>
          <Typography variant="caption">Net Today (Collected − Expenses)</Typography>
          <Typography variant="h4">₹{netToday}</Typography>
        </CardContent>
      </Card>
    </>
  );
}
