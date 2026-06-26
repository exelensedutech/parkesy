"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import dayjs, { Dayjs } from "dayjs";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Avatar from "@mui/material/Avatar";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import ToggleButton from "@mui/material/ToggleButton";
import Grid from "@mui/material/Grid";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import VehicleIcon from "@/components/VehicleIcon";
import { useAppStore } from "@/lib/store";
import { isWithinRange } from "@/lib/calc";
import { VEHICLE_COLORS } from "@/lib/colors";

type Period = "daily" | "weekly" | "monthly";

function ReportRow({
  label,
  value,
  emphasize,
  color,
}: {
  label: string;
  value: string;
  emphasize?: boolean;
  color?: string;
}) {
  return (
    <Stack direction="row" sx={{ justifyContent: "space-between", py: emphasize ? 1.25 : 0.75 }}>
      <Typography variant={emphasize ? "subtitle1" : "body2"} color={emphasize ? "text.primary" : "text.secondary"}>
        {label}
      </Typography>
      <Typography
        variant={emphasize ? "h6" : "body2"}
        sx={{ fontWeight: emphasize ? 700 : 500, color: color ?? "text.primary" }}
      >
        {value}
      </Typography>
    </Stack>
  );
}

export default function PeriodReportPage() {
  const router = useRouter();
  const { role, sessions, expenses, vehicleTypes, members, memberPayments } = useAppStore();
  const [period, setPeriod] = useState<Period>("daily");
  const [dailyDate, setDailyDate] = useState<Dayjs>(dayjs());
  const [weeklyFrom, setWeeklyFrom] = useState<Dayjs>(dayjs());
  const [weeklyTo, setWeeklyTo] = useState<Dayjs>(dayjs().add(6, "day"));
  const [monthlyAnchor, setMonthlyAnchor] = useState<Dayjs>(dayjs());
  const [dailyOpen, setDailyOpen] = useState(false);
  const [weeklyFromOpen, setWeeklyFromOpen] = useState(false);
  const [weeklyToOpen, setWeeklyToOpen] = useState(false);
  const [monthlyOpen, setMonthlyOpen] = useState(false);

  const weeklyMaxTo = weeklyFrom.add(6, "day");

  const handleWeeklyFromChange = (value: Dayjs) => {
    setWeeklyFrom(value);
    setWeeklyTo(value.add(6, "day"));
  };

  const handleWeeklyToChange = (value: Dayjs) => {
    if (value.isBefore(weeklyFrom, "day")) {
      setWeeklyTo(weeklyFrom);
    } else if (value.isAfter(weeklyMaxTo, "day")) {
      setWeeklyTo(weeklyMaxTo);
    } else {
      setWeeklyTo(value);
    }
  };

  if (role !== "admin") {
    return (
      <Typography variant="body1" sx={{ mt: 4 }} align="center" color="text.secondary">
        Reports are only visible to the Admin.
      </Typography>
    );
  }

  let start: Date;
  let end: Date;
  let rangeLabel: string;

  if (period === "daily") {
    start = dailyDate.startOf("day").toDate();
    end = dailyDate.endOf("day").toDate();
    rangeLabel = dailyDate.format("D MMM YYYY");
  } else if (period === "weekly") {
    start = weeklyFrom.startOf("day").toDate();
    end = weeklyTo.endOf("day").toDate();
    rangeLabel = `${weeklyFrom.format("D MMM")} – ${weeklyTo.format("D MMM YYYY")}`;
  } else {
    const monthStart = monthlyAnchor.startOf("month");
    const monthEnd = monthlyAnchor.endOf("month");
    start = monthStart.toDate();
    end = monthEnd.toDate();
    rangeLabel = monthlyAnchor.format("MMMM YYYY");
  }

  const entriesInRange = sessions.filter((s) => isWithinRange(s.entryTime, start, end));
  const exitsInRange = sessions.filter(
    (s) => s.status === "completed" && s.exitTime && isWithinRange(s.exitTime, start, end)
  );
  const expensesInRange = expenses.filter((e) => isWithinRange(e.expenseDate, start, end));
  const memberPaymentsInRange = memberPayments.filter((mp) => isWithinRange(mp.paidAt, start, end));

  const vehicleTypeStats = vehicleTypes.map((vt) => {
    const entered = entriesInRange.filter((s) => s.vehicleTypeId === vt.id);
    const exited = exitsInRange.filter((s) => s.vehicleTypeId === vt.id);
    const stillParked = entered.filter((s) => s.status === "parked").length;
    const memberParked = entered.filter((s) => s.memberId).length;
    const walkIn = entered.length - memberParked;
    const newMemberships = members.filter((m) => m.vehicleTypeId === vt.id && isWithinRange(m.startDate, start, end)).length;

    const walkInCollected =
      entered.reduce((sum, s) => sum + s.amountPaidAtEntry, 0) + exited.reduce((sum, s) => sum + (s.amountPaidAtExit ?? 0), 0);
    const membershipRevenue = memberPaymentsInRange
      .filter((mp) => members.find((m) => m.id === mp.memberId)?.vehicleTypeId === vt.id)
      .reduce((sum, mp) => sum + mp.amount, 0);
    const subtotal = walkInCollected + membershipRevenue;

    return {
      vehicleType: vt,
      entered: entered.length,
      walkIn,
      memberParked,
      exited: exited.length,
      stillParked,
      newMemberships,
      subtotal,
    };
  });

  const collected = vehicleTypeStats.reduce((sum, v) => sum + v.subtotal, 0);

  const cashCollected =
    entriesInRange.filter((s) => s.paymentModeAtEntry === "cash").reduce((sum, s) => sum + s.amountPaidAtEntry, 0) +
    exitsInRange.filter((s) => s.paymentModeAtExit === "cash").reduce((sum, s) => sum + (s.amountPaidAtExit ?? 0), 0) +
    memberPaymentsInRange.filter((mp) => mp.paymentMode === "cash").reduce((sum, mp) => sum + mp.amount, 0);
  const onlineCollected = collected - cashCollected;

  const spent = expensesInRange.reduce((sum, e) => sum + e.amount, 0);
  const net = collected - spent;

  const refundsInRange = exitsInRange
    .filter((s) => (s.amountPaidAtExit ?? 0) < 0)
    .reduce((sum, s) => sum + Math.abs(s.amountPaidAtExit ?? 0), 0);

  return (
    <>
      <Stack direction="row" spacing={1} sx={{ alignItems: "center", mb: 2 }}>
        <IconButton onClick={() => router.push("/settings/reports")} edge="start">
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h6">Period Report</Typography>
      </Stack>

      <ToggleButtonGroup
        value={period}
        exclusive
        onChange={(_, value: Period | null) => value && setPeriod(value)}
        fullWidth
        sx={{ mb: 2 }}
      >
        <ToggleButton value="daily">Daily</ToggleButton>
        <ToggleButton value="weekly">Weekly</ToggleButton>
        <ToggleButton value="monthly">Monthly</ToggleButton>
      </ToggleButtonGroup>

      {period === "daily" && (
        <DatePicker
          label="Date"
          value={dailyDate}
          onChange={(value) => value && setDailyDate(value)}
          open={dailyOpen}
          onOpen={() => setDailyOpen(true)}
          onClose={() => setDailyOpen(false)}
          slotProps={{
            textField: { fullWidth: true, onClick: () => setDailyOpen(true) },
            field: { readOnly: true },
          }}
          sx={{ mb: 1, width: "100%" }}
        />
      )}
      {period === "weekly" && (
        <Grid container spacing={1.5} sx={{ mb: 1 }}>
          <Grid size={6}>
            <DatePicker
              label="From"
              value={weeklyFrom}
              onChange={(value) => value && handleWeeklyFromChange(value)}
              open={weeklyFromOpen}
              onOpen={() => setWeeklyFromOpen(true)}
              onClose={() => setWeeklyFromOpen(false)}
              slotProps={{
                textField: { fullWidth: true, onClick: () => setWeeklyFromOpen(true) },
                field: { readOnly: true },
              }}
            />
          </Grid>
          <Grid size={6}>
            <DatePicker
              label="To"
              value={weeklyTo}
              onChange={(value) => value && handleWeeklyToChange(value)}
              minDate={weeklyFrom}
              maxDate={weeklyMaxTo}
              open={weeklyToOpen}
              onOpen={() => setWeeklyToOpen(true)}
              onClose={() => setWeeklyToOpen(false)}
              slotProps={{
                textField: { fullWidth: true, onClick: () => setWeeklyToOpen(true) },
                field: { readOnly: true },
              }}
            />
          </Grid>
        </Grid>
      )}
      {period === "monthly" && (
        <DatePicker
          label="Month"
          value={monthlyAnchor}
          onChange={(value) => value && setMonthlyAnchor(value)}
          views={["year", "month"]}
          openTo="month"
          open={monthlyOpen}
          onOpen={() => setMonthlyOpen(true)}
          onClose={() => setMonthlyOpen(false)}
          slotProps={{
            textField: { fullWidth: true, onClick: () => setMonthlyOpen(true) },
            field: { readOnly: true },
          }}
          sx={{ mb: 1, width: "100%" }}
        />
      )}
      <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 3 }}>
        Showing: {rangeLabel}
      </Typography>

      <Stack spacing={2} sx={{ mb: 2.5 }}>
        {vehicleTypeStats.map((v) => (
          <Card key={v.vehicleType.id}>
            <CardContent>
              <Stack direction="row" spacing={1.25} sx={{ alignItems: "center", mb: 1 }}>
                <Avatar sx={{ bgcolor: VEHICLE_COLORS[v.vehicleType.name], width: 36, height: 36 }}>
                  <VehicleIcon name={v.vehicleType.name} />
                </Avatar>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  {v.vehicleType.name}
                </Typography>
              </Stack>
              <ReportRow label="Entered" value={String(v.entered)} />
              <ReportRow label="Walk-in" value={String(v.walkIn)} />
              <ReportRow label="Member Parked" value={String(v.memberParked)} />
              <ReportRow label="Exited" value={String(v.exited)} />
              <ReportRow label="Still Parked" value={String(v.stillParked)} />
              <ReportRow label="New Membership Signups" value={String(v.newMemberships)} />
              <ReportRow label="Subtotal Collected" value={`₹${v.subtotal}`} emphasize />
            </CardContent>
          </Card>
        ))}
      </Stack>

      <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
        Overall
      </Typography>
      <Card sx={{ mb: 2.5 }}>
        <CardContent>
          <ReportRow label="Total Collected" value={`₹${collected}`} />
          <ReportRow label="Total Expenses" value={`₹${spent}`} />
          <ReportRow
            label="Net (Profit / Loss)"
            value={`₹${net}`}
            emphasize
            color={net >= 0 ? "success.main" : "error.main"}
          />
          {refundsInRange > 0 && (
            <>
              <Divider sx={{ my: 1.5 }} />
              <ReportRow label="Refunds Issued" value={`₹${refundsInRange}`} color="error.main" />
            </>
          )}
        </CardContent>
      </Card>

      <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
        Payment Mode
      </Typography>
      <Card>
        <CardContent>
          <ReportRow label="Cash Collected" value={`₹${cashCollected}`} />
          <ReportRow label="Online Collected" value={`₹${onlineCollected}`} />
        </CardContent>
      </Card>
    </>
  );
}
