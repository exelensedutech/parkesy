"use client";

import { useRouter } from "next/navigation";
import Stack from "@mui/material/Stack";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import EventIcon from "@mui/icons-material/Event";
import BarChartIcon from "@mui/icons-material/BarChart";
import CategoryIcon from "@mui/icons-material/Category";
import BadgeIcon from "@mui/icons-material/Badge";
import CurrencyExchangeIcon from "@mui/icons-material/CurrencyExchange";
import AutorenewIcon from "@mui/icons-material/Autorenew";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import HourglassBottomIcon from "@mui/icons-material/HourglassBottom";
import { SettingsRow } from "@/components/SettingsRow";
import { useAppStore } from "@/lib/store";

const REPORTS = [
  {
    path: "/settings/reports/period",
    icon: <EventIcon />,
    color: "#00658F",
    title: "Period Report",
    subtitle: "Traffic and collections by vehicle type — daily, weekly or monthly",
  },
  {
    path: "/settings/reports/collection-summary",
    icon: <BarChartIcon />,
    color: "#2E7D32",
    title: "Collection Summary",
    subtitle: "Revenue trend and breakdown over a date range",
  },
  {
    path: "/settings/reports/vehicle-performance",
    icon: <CategoryIcon />,
    color: "#6A4C93",
    title: "Vehicle-Type Performance",
    subtitle: "Revenue, traffic and avg. duration per vehicle type",
  },
  {
    path: "/settings/reports/staff-collections",
    icon: <BadgeIcon />,
    color: "#EF6C00",
    title: "Staff Collections",
    subtitle: "Collections and expenses grouped by who logged them",
  },
  {
    path: "/settings/reports/refunds",
    icon: <CurrencyExchangeIcon />,
    color: "#C62828",
    title: "Refunds & Adjustments",
    subtitle: "Every checkout where money was refunded",
  },
  {
    path: "/settings/reports/membership-renewals",
    icon: <AutorenewIcon />,
    color: "#00838F",
    title: "Membership Renewals",
    subtitle: "Expiring soon, lapsed, and renewal revenue",
  },
  {
    path: "/settings/reports/peak-hours",
    icon: <AccessTimeIcon />,
    color: "#5E35B1",
    title: "Peak Hours",
    subtitle: "Busiest hours of day and days of week",
  },
  {
    path: "/settings/reports/long-stay",
    icon: <HourglassBottomIcon />,
    color: "#AD1457",
    title: "Long-Stay Alert",
    subtitle: "Vehicles parked beyond your configured threshold",
  },
];

export default function ReportsHubPage() {
  const router = useRouter();
  const { role } = useAppStore();

  if (role !== "owner") {
    return (
      <Typography variant="body1" sx={{ mt: 4 }} align="center" color="text.secondary">
        Reports are only visible to the Owner.
      </Typography>
    );
  }

  return (
    <>
      <Stack direction="row" spacing={1} sx={{ alignItems: "center", mb: 0.5 }}>
        <IconButton onClick={() => router.push("/settings")} edge="start">
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h6">Reports</Typography>
      </Stack>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5, ml: 6 }}>
        Financial and operational insights
      </Typography>

      <Stack spacing={1.5}>
        {REPORTS.map((r) => (
          <SettingsRow
            key={r.path}
            icon={r.icon}
            color={r.color}
            title={r.title}
            subtitle={r.subtitle}
            onClick={() => router.push(r.path)}
          />
        ))}
      </Stack>
    </>
  );
}
