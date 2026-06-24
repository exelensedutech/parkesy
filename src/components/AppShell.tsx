"use client";

import { usePathname, useRouter } from "next/navigation";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import BottomNavigation from "@mui/material/BottomNavigation";
import BottomNavigationAction from "@mui/material/BottomNavigationAction";
import Paper from "@mui/material/Paper";
import IconButton from "@mui/material/IconButton";
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import HomeIcon from "@mui/icons-material/Home";
import LocalParkingIcon from "@mui/icons-material/LocalParking";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import SettingsIcon from "@mui/icons-material/Settings";
import LogoutIcon from "@mui/icons-material/Logout";
import Box from "@mui/material/Box";
import { useAppStore } from "@/lib/store";

const employeeTabs = [
  { label: "Home", href: "/", icon: <HomeIcon /> },
  { label: "Park", href: "/park", icon: <LocalParkingIcon /> },
  { label: "Expense", href: "/expenses", icon: <ReceiptLongIcon /> },
];

const ownerTabs = [...employeeTabs, { label: "Settings", href: "/settings", icon: <SettingsIcon /> }];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { role, userName, logout } = useAppStore();

  const tabs = role === "owner" ? ownerTabs : employeeTabs;
  const activeIndex = Math.max(tabs.findIndex((t) => t.href === pathname), 0);

  const handleLogout = () => {
    logout();
  };

  return (
    <Box sx={{ minHeight: "100vh", display: "flex", flexDirection: "column", bgcolor: "background.default" }}>
      <AppBar position="sticky">
        <Toolbar sx={{ justifyContent: "space-between" }}>
          <Typography variant="h6" noWrap>
            Parkesy
          </Typography>
          <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
            <Chip
              label={userName || "..."}
              size="small"
              sx={{ bgcolor: "rgba(255,255,255,0.15)", color: "white" }}
            />
            <IconButton color="inherit" onClick={handleLogout} aria-label="Logout">
              <LogoutIcon />
            </IconButton>
          </Stack>
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
