"use client";

import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Grid from "@mui/material/Grid";
import Divider from "@mui/material/Divider";
import AppShell from "@/components/AppShell";
import { useAppStore } from "@/lib/store";

function isToday(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  return d.toDateString() === now.toDateString();
}

export default function ReportsPage() {
  const { role, sessions, expenses, vehicleTypes } = useAppStore();

  if (role !== "owner") {
    return (
      <AppShell>
        <Typography variant="body1" sx={{ mt: 4 }} align="center" color="text.secondary">
          Reports are only visible to the Owner.
        </Typography>
      </AppShell>
    );
  }

  const completedToday = sessions.filter((s) => s.status === "completed" && isToday(s.exitTime!));
  const expensesToday = expenses.filter((e) => isToday(e.expenseDate));

  const collected = completedToday.reduce((sum, s) => sum + (s.amountCharged ?? 0), 0);
  const spent = expensesToday.reduce((sum, e) => sum + e.amount, 0);
  const net = collected - spent;

  const cashTotal = completedToday
    .filter((s) => s.paymentMode === "cash")
    .reduce((sum, s) => sum + (s.amountCharged ?? 0), 0);
  const gpayTotal = completedToday
    .filter((s) => s.paymentMode === "gpay")
    .reduce((sum, s) => sum + (s.amountCharged ?? 0), 0);

  return (
    <AppShell>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Today&apos;s Report
      </Typography>

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
              <Typography variant="h6">₹{cashTotal}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={6}>
          <Card>
            <CardContent>
              <Typography variant="caption" color="text.secondary">
                GPay collected
              </Typography>
              <Typography variant="h6">₹{gpayTotal}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Typography variant="subtitle1" sx={{ mb: 1 }}>
        Completed Transactions Today
      </Typography>
      <Stack spacing={1} sx={{ mb: 3 }}>
        {completedToday.length === 0 && (
          <Typography variant="body2" color="text.secondary">
            No completed transactions yet today.
          </Typography>
        )}
        {completedToday.map((s) => {
          const vt = vehicleTypes.find((v) => v.id === s.vehicleTypeId)!;
          return (
            <Card key={s.id}>
              <CardContent sx={{ py: 1.5 }}>
                <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "center" }}>
                  <Box>
                    <Typography variant="body2">
                      {s.tokenCode} · {vt.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {s.paymentMode?.toUpperCase()} · {s.recordedBy}
                    </Typography>
                  </Box>
                  <Typography variant="subtitle1">₹{s.amountCharged}</Typography>
                </Stack>
              </CardContent>
            </Card>
          );
        })}
      </Stack>

      <Divider sx={{ mb: 2 }} />

      <Typography variant="subtitle1" sx={{ mb: 1 }}>
        Expenses Today
      </Typography>
      <Stack spacing={1}>
        {expensesToday.length === 0 && (
          <Typography variant="body2" color="text.secondary">
            No expenses recorded today.
          </Typography>
        )}
        {expensesToday.map((e) => (
          <Card key={e.id}>
            <CardContent sx={{ py: 1.5 }}>
              <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "center" }}>
                <Typography variant="body2">{e.category}</Typography>
                <Typography variant="subtitle1">₹{e.amount}</Typography>
              </Stack>
            </CardContent>
          </Card>
        ))}
      </Stack>
    </AppShell>
  );
}
