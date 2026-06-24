"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Grid from "@mui/material/Grid";
import Divider from "@mui/material/Divider";
import TextField from "@mui/material/TextField";
import IconButton from "@mui/material/IconButton";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useAppStore } from "@/lib/store";
import { dateToInputValue, isSameDay } from "@/lib/calc";

export default function ReportsHistoryPage() {
  const router = useRouter();
  const { role, sessions, expenses, vehicleTypes } = useAppStore();
  const [dateValue, setDateValue] = useState(dateToInputValue(new Date()));

  if (role !== "owner") {
    return (
      <Typography variant="body1" sx={{ mt: 4 }} align="center" color="text.secondary">
        Reports are only visible to the Owner.
      </Typography>
    );
  }

  const selectedDate = new Date(`${dateValue}T00:00:00`);

  const entriesOnDate = sessions.filter((s) => isSameDay(s.entryTime, selectedDate));
  const exitsOnDate = sessions.filter((s) => s.status === "completed" && s.exitTime && isSameDay(s.exitTime, selectedDate));
  const expensesOnDate = expenses.filter((e) => isSameDay(e.expenseDate, selectedDate));

  const entryCollected = entriesOnDate.reduce((sum, s) => sum + s.amountPaidAtEntry, 0);
  const exitCollected = exitsOnDate.reduce((sum, s) => sum + (s.amountPaidAtExit ?? 0), 0);
  const collected = entryCollected + exitCollected;

  const cashCollected =
    entriesOnDate.filter((s) => s.paymentModeAtEntry === "cash").reduce((sum, s) => sum + s.amountPaidAtEntry, 0) +
    exitsOnDate.filter((s) => s.paymentModeAtExit === "cash").reduce((sum, s) => sum + (s.amountPaidAtExit ?? 0), 0);
  const onlineCollected = collected - cashCollected;

  const spent = expensesOnDate.reduce((sum, e) => sum + e.amount, 0);
  const net = collected - spent;

  return (
    <>
      <Stack direction="row" spacing={1} sx={{ alignItems: "center", mb: 2 }}>
        <IconButton onClick={() => router.push("/settings")} edge="start">
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h6">Reports & History</Typography>
      </Stack>

      <TextField
        label="Date"
        type="date"
        fullWidth
        value={dateValue}
        onChange={(e) => setDateValue(e.target.value)}
        slotProps={{ htmlInput: { style: { textAlign: "left" } }, inputLabel: { shrink: true } }}
        sx={{ mb: 3 }}
      />

      <Grid container spacing={1.5} sx={{ mb: 3 }}>
        <Grid size={6}>
          <Card>
            <CardContent>
              <Typography variant="caption" color="text.secondary">
                Collected
              </Typography>
              <Typography variant="h5">₹{collected}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={6}>
          <Card>
            <CardContent>
              <Typography variant="caption" color="text.secondary">
                Expenses
              </Typography>
              <Typography variant="h5">₹{spent}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={12}>
          <Card sx={{ bgcolor: net >= 0 ? "success.light" : "error.light" }}>
            <CardContent>
              <Typography variant="caption">Net (Profit / Loss)</Typography>
              <Typography variant="h4">₹{net}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={6}>
          <Card>
            <CardContent>
              <Typography variant="caption" color="text.secondary">
                Cash collected
              </Typography>
              <Typography variant="h6">₹{cashCollected}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={6}>
          <Card>
            <CardContent>
              <Typography variant="caption" color="text.secondary">
                Online collected
              </Typography>
              <Typography variant="h6">₹{onlineCollected}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Typography variant="subtitle1" sx={{ mb: 1 }}>
        Vehicles Exited This Day
      </Typography>
      <Stack spacing={1} sx={{ mb: 3 }}>
        {exitsOnDate.length === 0 && (
          <Typography variant="body2" color="text.secondary">
            No completed transactions on this day.
          </Typography>
        )}
        {exitsOnDate.map((s) => {
          const vt = vehicleTypes.find((v) => v.id === s.vehicleTypeId)!;
          return (
            <Card key={s.id}>
              <CardContent sx={{ py: 1.5 }}>
                <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "center" }}>
                  <Box>
                    <Typography variant="body2">
                      {s.tokenCode} · {vt.name} · {s.vehicleNumber}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {s.recordedBy}
                    </Typography>
                  </Box>
                  <Typography variant="subtitle1">₹{s.totalAmount}</Typography>
                </Stack>
              </CardContent>
            </Card>
          );
        })}
      </Stack>

      <Divider sx={{ mb: 2 }} />

      <Typography variant="subtitle1" sx={{ mb: 1 }}>
        Expenses This Day
      </Typography>
      <Stack spacing={1}>
        {expensesOnDate.length === 0 && (
          <Typography variant="body2" color="text.secondary">
            No expenses recorded on this day.
          </Typography>
        )}
        {expensesOnDate.map((e) => (
          <Card key={e.id}>
            <CardContent sx={{ py: 1.5 }}>
              <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "center" }}>
                <Typography variant="body2">{e.title}</Typography>
                <Typography variant="subtitle1">₹{e.amount}</Typography>
              </Stack>
            </CardContent>
          </Card>
        ))}
      </Stack>
    </>
  );
}
