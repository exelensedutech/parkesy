"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import dayjs, { Dayjs } from "dayjs";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Grid from "@mui/material/Grid";
import IconButton from "@mui/material/IconButton";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import DateRangeFields from "@/components/DateRangeFields";
import { useAppStore } from "@/lib/store";
import { isSameDay } from "@/lib/calc";

interface DayStat {
  date: Date;
  collected: number;
  expenses: number;
  net: number;
  cash: number;
  online: number;
  walkIn: number;
  member: number;
}

export default function CollectionSummaryPage() {
  const router = useRouter();
  const { role, sessions, expenses, memberPayments } = useAppStore();
  const [from, setFrom] = useState<Dayjs>(dayjs().startOf("month"));
  const [to, setTo] = useState<Dayjs>(dayjs());

  if (role !== "owner") {
    return (
      <Typography variant="body1" sx={{ mt: 4 }} align="center" color="text.secondary">
        Reports are only visible to the Owner.
      </Typography>
    );
  }

  const days: Date[] = [];
  {
    let cursor = from.startOf("day");
    const end = to.startOf("day");
    while (!cursor.isAfter(end)) {
      days.push(cursor.toDate());
      cursor = cursor.add(1, "day");
    }
  }

  const dayStats: DayStat[] = days.map((date) => {
    const entriesOnDate = sessions.filter((s) => isSameDay(s.entryTime, date));
    const exitsOnDate = sessions.filter((s) => s.status === "completed" && s.exitTime && isSameDay(s.exitTime, date));
    const expensesOnDate = expenses.filter((e) => isSameDay(e.expenseDate, date));
    const memberPaymentsOnDate = memberPayments.filter((mp) => isSameDay(mp.paidAt, date));

    const entryCollected = entriesOnDate.reduce((sum, s) => sum + s.amountPaidAtEntry, 0);
    const exitCollected = exitsOnDate.reduce((sum, s) => sum + (s.amountPaidAtExit ?? 0), 0);
    const walkIn = entryCollected + exitCollected;
    const member = memberPaymentsOnDate.reduce((sum, mp) => sum + mp.amount, 0);
    const collected = walkIn + member;

    const cash =
      entriesOnDate.filter((s) => s.paymentModeAtEntry === "cash").reduce((sum, s) => sum + s.amountPaidAtEntry, 0) +
      exitsOnDate.filter((s) => s.paymentModeAtExit === "cash").reduce((sum, s) => sum + (s.amountPaidAtExit ?? 0), 0) +
      memberPaymentsOnDate.filter((mp) => mp.paymentMode === "cash").reduce((sum, mp) => sum + mp.amount, 0);
    const online = collected - cash;

    const expensesTotal = expensesOnDate.reduce((sum, e) => sum + e.amount, 0);
    const net = collected - expensesTotal;

    return { date, collected, expenses: expensesTotal, net, cash, online, walkIn, member };
  });

  const totals = dayStats.reduce(
    (acc, d) => ({
      collected: acc.collected + d.collected,
      expenses: acc.expenses + d.expenses,
      net: acc.net + d.net,
      cash: acc.cash + d.cash,
      online: acc.online + d.online,
      walkIn: acc.walkIn + d.walkIn,
      member: acc.member + d.member,
    }),
    { collected: 0, expenses: 0, net: 0, cash: 0, online: 0, walkIn: 0, member: 0 }
  );

  const maxCollected = Math.max(...dayStats.map((d) => d.collected), 1);

  return (
    <>
      <Stack direction="row" spacing={1} sx={{ alignItems: "center", mb: 2 }}>
        <IconButton onClick={() => router.push("/settings/reports")} edge="start">
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h6">Collection Summary</Typography>
      </Stack>

      <DateRangeFields from={from} to={to} onFromChange={setFrom} onToChange={setTo} />

      <Grid container spacing={1.5} sx={{ mb: 3 }}>
        <Grid size={6}>
          <Card>
            <CardContent>
              <Typography variant="caption" color="text.secondary">
                Collected
              </Typography>
              <Typography variant="h5">₹{totals.collected}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={6}>
          <Card>
            <CardContent>
              <Typography variant="caption" color="text.secondary">
                Expenses
              </Typography>
              <Typography variant="h5">₹{totals.expenses}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={12}>
          <Card sx={{ bgcolor: totals.net >= 0 ? "success.light" : "error.light" }}>
            <CardContent>
              <Typography variant="caption">Net (Profit / Loss)</Typography>
              <Typography variant="h4">₹{totals.net}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={6}>
          <Card>
            <CardContent>
              <Typography variant="caption" color="text.secondary">
                Cash collected
              </Typography>
              <Typography variant="h6">₹{totals.cash}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={6}>
          <Card>
            <CardContent>
              <Typography variant="caption" color="text.secondary">
                Online collected
              </Typography>
              <Typography variant="h6">₹{totals.online}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={6}>
          <Card>
            <CardContent>
              <Typography variant="caption" color="text.secondary">
                Walk-in revenue
              </Typography>
              <Typography variant="h6">₹{totals.walkIn}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={6}>
          <Card>
            <CardContent>
              <Typography variant="caption" color="text.secondary">
                Member revenue
              </Typography>
              <Typography variant="h6">₹{totals.member}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Typography variant="subtitle1" sx={{ mb: 1 }}>
        Day-by-Day
      </Typography>
      <Stack spacing={1}>
        {dayStats.length === 0 && (
          <Typography variant="body2" color="text.secondary">
            No days in this range.
          </Typography>
        )}
        {dayStats
          .slice()
          .reverse()
          .map((d) => (
            <Card key={d.date.toISOString()}>
              <CardContent sx={{ py: 1.5 }}>
                <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "center" }}>
                  <Typography variant="body2">
                    {d.date.toLocaleDateString("en-IN", { day: "numeric", month: "short", weekday: "short" })}
                  </Typography>
                  <Stack direction="row" spacing={2}>
                    <Typography variant="body2" color="success.main">
                      ₹{d.collected}
                    </Typography>
                    <Typography variant="body2" color="error.main">
                      ₹{d.expenses}
                    </Typography>
                    <Typography variant="subtitle2">₹{d.net}</Typography>
                  </Stack>
                </Stack>
                <Box sx={{ display: "flex", height: 6, borderRadius: 3, overflow: "hidden", bgcolor: "grey.100", mt: 1 }}>
                  <Box sx={{ width: `${(d.collected / maxCollected) * 100}%`, bgcolor: "success.main" }} />
                </Box>
              </CardContent>
            </Card>
          ))}
      </Stack>
    </>
  );
}
