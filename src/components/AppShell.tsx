"use client";

import { usePathname, useRouter } from "next/navigation";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import BottomNavigation from "@mui/material/BottomNavigation";
import BottomNavigationAction from "@mui/material/BottomNavigationAction";
import Paper from "@mui/material/Paper";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import ToggleButton from "@mui/material/ToggleButton";
import LocalParkingIcon from "@mui/icons-material/LocalParking";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import AssessmentIcon from "@mui/icons-material/Assessment";
import Box from "@mui/material/Box";
import { useAppStore } from "@/lib/store";
import { Role } from "@/lib/types";

const employeeTabs = [
  { label: "Parking", href: "/", icon: <LocalParkingIcon /> },
  { label: "Expenses", href: "/expenses", icon: <ReceiptLongIcon /> },
];

const ownerTabs = [
  ...employeeTabs,
  { label: "Reports", href: "/reports", icon: <AssessmentIcon /> },
];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { role, setRole } = useAppStore();

  const tabs = role === "owner" ? ownerTabs : employeeTabs;
  const activeIndex = Math.max(tabs.findIndex((t) => t.href === pathname), 0);

  return (
    <Box sx={{ minHeight: "100vh", display: "flex", flexDirection: "column", bgcolor: "background.default" }}>
      <AppBar position="sticky">
        <Toolbar sx={{ justifyContent: "space-between" }}>
          <Typography variant="h6" noWrap>
            Parkesy
          </Typography>
          <ToggleButtonGroup
            size="small"
            value={role}
            exclusive
            onChange={(_, value: Role | null) => value && setRole(value)}
            sx={{ bgcolor: "rgba(255,255,255,0.15)", borderRadius: 2 }}
          >
            <ToggleButton value="employee" sx={{ color: "white", border: "none" }}>
              Employee
            </ToggleButton>
            <ToggleButton value="owner" sx={{ color: "white", border: "none" }}>
              Owner
            </ToggleButton>
          </ToggleButtonGroup>
        </Toolbar>
      </AppBar>

      <Box component="main" sx={{ flex: 1, pb: 9, px: 2, pt: 2, maxWidth: 480, width: "100%", mx: "auto" }}>
        {children}
      </Box>

      <Paper elevation={3} sx={{ position: "fixed", bottom: 0, left: 0, right: 0 }}>
        <BottomNavigation
          showLabels
          value={activeIndex}
          onChange={(_, newIndex) => router.push(tabs[newIndex].href)}
        >
          {tabs.map((tab) => (
            <BottomNavigationAction key={tab.href} label={tab.label} icon={tab.icon} />
          ))}
        </BottomNavigation>
      </Paper>
    </Box>
  );
}
