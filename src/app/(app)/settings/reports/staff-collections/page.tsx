"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import dayjs, { Dayjs } from "dayjs";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Avatar from "@mui/material/Avatar";
import IconButton from "@mui/material/IconButton";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import DateRangeFields from "@/components/DateRangeFields";
import { useAppStore } from "@/lib/store";
import { isWithinRange } from "@/lib/calc";

export default function StaffCollectionsPage() {
  const router = useRouter();
  const { role, sessions, expenses, memberPayments } = useAppStore();
  const [from, setFrom] = useState<Dayjs>(dayjs().startOf("month"));
  const [to, setTo] = useState<Dayjs>(dayjs());

  if (role !== "admin") {
    return (
      <Typography variant="body1" sx={{ mt: 4 }} align="center" color="text.secondary">
        Reports are only visible to the Admin.
      </Typography>
    );
  }

  const start = from.startOf("day").toDate();
  const end = to.endOf("day").toDate();

  const names = new Set<string>();
  sessions.forEach((s) => {
    names.add(s.recordedBy);
    if (s.exitRecordedBy) names.add(s.exitRecordedBy);
  });
  memberPayments.forEach((mp) => names.add(mp.recordedBy));
  expenses.forEach((e) => names.add(e.recordedBy));

  const staffStats = Array.from(names)
    .map((name) => {
      const entries = sessions.filter((s) => s.recordedBy === name && isWithinRange(s.entryTime, start, end));
      const exits = sessions.filter(
        (s) =>
          s.status === "completed" &&
          s.exitTime &&
          (s.exitRecordedBy ?? s.recordedBy) === name &&
          isWithinRange(s.exitTime, start, end)
      );
      const memberPays = memberPayments.filter((mp) => mp.recordedBy === name && isWithinRange(mp.paidAt, start, end));
      const exps = expenses.filter((e) => e.recordedBy === name && isWithinRange(e.expenseDate, start, end));

      const entryCash = entries.filter((s) => s.paymentModeAtEntry === "cash").reduce((sum, s) => sum + s.amountPaidAtEntry, 0);
      const entryOnline = entries.filter((s) => s.paymentModeAtEntry === "online").reduce((sum, s) => sum + s.amountPaidAtEntry, 0);
      const exitCash = exits.filter((s) => s.paymentModeAtExit === "cash").reduce((sum, s) => sum + (s.amountPaidAtExit ?? 0), 0);
      const exitOnline = exits.filter((s) => s.paymentModeAtExit === "online").reduce((sum, s) => sum + (s.amountPaidAtExit ?? 0), 0);
      const memberCash = memberPays.filter((mp) => mp.paymentMode === "cash").reduce((sum, mp) => sum + mp.amount, 0);
      const memberOnline = memberPays.filter((mp) => mp.paymentMode === "online").reduce((sum, mp) => sum + mp.amount, 0);

      const cash = entryCash + exitCash + memberCash;
      const online = entryOnline + exitOnline + memberOnline;
      const collected = cash + online;
      const expensesTotal = exps.reduce((sum, e) => sum + e.amount, 0);
      const net = collected - expensesTotal;

      return { name, cash, online, collected, expenses: expensesTotal, net };
    })
    .filter((s) => s.collected !== 0 || s.expenses !== 0)
    .sort((a, b) => b.collected - a.collected);

  return (
    <>
      <Stack direction="row" spacing={1} sx={{ alignItems: "center", mb: 2 }}>
        <IconButton onClick={() => router.push("/settings/reports")} edge="start">
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h6">Staff Collections</Typography>
      </Stack>

      <DateRangeFields from={from} to={to} onFromChange={setFrom} onToChange={setTo} />

      <Stack spacing={1.5}>
        {staffStats.length === 0 && (
          <Typography variant="body2" color="text.secondary">
            No collections or expenses logged in this range.
          </Typography>
        )}
        {staffStats.map((s) => (
          <Card key={s.name}>
            <CardContent>
              <Stack direction="row" spacing={1.5} sx={{ alignItems: "center", mb: 1.5 }}>
                <Avatar sx={{ width: 40, height: 40 }}>{s.name.charAt(0).toUpperCase()}</Avatar>
                <Typography variant="subtitle1">{s.name}</Typography>
              </Stack>
              <Stack direction="row" sx={{ justifyContent: "space-between", mb: 1 }}>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Collected
                  </Typography>
                  <Typography variant="h6" color="success.main">
                    ₹{s.collected}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Expenses
                  </Typography>
                  <Typography variant="h6" color="error.main">
                    ₹{s.expenses}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Net
                  </Typography>
                  <Typography variant="h6">₹{s.net}</Typography>
                </Box>
              </Stack>
              <Stack direction="row" sx={{ justifyContent: "space-between" }}>
                <Typography variant="caption" color="text.secondary">
                  Cash: ₹{s.cash}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Online: ₹{s.online}
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        ))}
      </Stack>
    </>
  );
}
