"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import dayjs, { Dayjs } from "dayjs";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import IconButton from "@mui/material/IconButton";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import DateRangeFields from "@/components/DateRangeFields";
import { useAppStore } from "@/lib/store";
import { isWithinRange } from "@/lib/calc";

export default function RefundsPage() {
  const router = useRouter();
  const { role, sessions, vehicleTypes } = useAppStore();
  const [from, setFrom] = useState<Dayjs>(dayjs().startOf("month"));
  const [to, setTo] = useState<Dayjs>(dayjs());

  if (role !== "owner") {
    return (
      <Typography variant="body1" sx={{ mt: 4 }} align="center" color="text.secondary">
        Reports are only visible to the Owner.
      </Typography>
    );
  }

  const start = from.startOf("day").toDate();
  const end = to.endOf("day").toDate();

  const refunds = sessions
    .filter(
      (s) =>
        s.status === "completed" &&
        s.exitTime &&
        (s.amountPaidAtExit ?? 0) < 0 &&
        isWithinRange(s.exitTime, start, end)
    )
    .sort((a, b) => new Date(b.exitTime!).getTime() - new Date(a.exitTime!).getTime());

  const totalRefunded = refunds.reduce((sum, s) => sum + Math.abs(s.amountPaidAtExit ?? 0), 0);

  return (
    <>
      <Stack direction="row" spacing={1} sx={{ alignItems: "center", mb: 2 }}>
        <IconButton onClick={() => router.push("/settings/reports")} edge="start">
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h6">Refunds & Adjustments</Typography>
      </Stack>

      <DateRangeFields from={from} to={to} onFromChange={setFrom} onToChange={setTo} />

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="caption" color="text.secondary">
            Total refunded
          </Typography>
          <Typography variant="h4" color="error.main">
            ₹{totalRefunded}
          </Typography>
        </CardContent>
      </Card>

      <Typography variant="subtitle1" sx={{ mb: 1 }}>
        Refunds in this Range
      </Typography>
      <Stack spacing={1}>
        {refunds.length === 0 && (
          <Typography variant="body2" color="text.secondary">
            No refunds were issued in this range.
          </Typography>
        )}
        {refunds.map((s) => {
          const vt = vehicleTypes.find((v) => v.id === s.vehicleTypeId)!;
          return (
            <Card key={s.id}>
              <CardContent sx={{ py: 1.5 }}>
                <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "center" }}>
                  <Box>
                    <Typography variant="body2">
                      {s.tokenCode} · {vt.name}
                      {s.vehicleNumber ? ` · ${s.vehicleNumber}` : ""}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {new Date(s.exitTime!).toLocaleString("en-IN", {
                        day: "numeric",
                        month: "short",
                        hour: "numeric",
                        minute: "2-digit",
                      })}{" "}
                      · {(s.paymentModeAtExit ?? "—").toString().toUpperCase()} ·{" "}
                      {s.exitRecordedBy ?? s.recordedBy}
                    </Typography>
                  </Box>
                  <Typography variant="subtitle1" color="error.main">
                    -₹{Math.abs(s.amountPaidAtExit ?? 0)}
                  </Typography>
                </Stack>
              </CardContent>
            </Card>
          );
        })}
      </Stack>
    </>
  );
}
