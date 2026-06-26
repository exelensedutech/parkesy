"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import BottomNavigation from "@mui/material/BottomNavigation";
import BottomNavigationAction from "@mui/material/BottomNavigationAction";
import Paper from "@mui/material/Paper";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import HomeIcon from "@mui/icons-material/Home";
import LocalParkingIcon from "@mui/icons-material/LocalParking";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import SettingsIcon from "@mui/icons-material/Settings";
import PersonIcon from "@mui/icons-material/Person";
import Box from "@mui/material/Box";
import Avatar from "@mui/material/Avatar";
import UserProfileSheet from "./UserProfileSheet";
import { useAppStore } from "@/lib/store";

const employeeTabs = [
  { label: "Home", href: "/", icon: <HomeIcon /> },
  { label: "Park", href: "/park", icon: <LocalParkingIcon /> },
  { label: "Expense", href: "/expenses", icon: <ReceiptLongIcon /> },
];

const adminTabs = [...employeeTabs, { label: "Settings", href: "/settings", icon: <SettingsIcon /> }];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { role, businessName } = useAppStore();
  const [profileOpen, setProfileOpen] = useState(false);

  const tabs = role === "admin" ? adminTabs : employeeTabs;
  const activeIndex = Math.max(tabs.findIndex((t) => t.href === pathname), 0);

  return (
    <Box sx={{ minHeight: "100vh", display: "flex", flexDirection: "column", bgcolor: "background.default" }}>
      <AppBar
        position="sticky"
        elevation={0}
        sx={{ background: "linear-gradient(135deg, #00829B 0%, #00658F 55%, #013F5C 100%)" }}
      >
        <Toolbar sx={{ justifyContent: "space-between", minHeight: 76, py: 1.5 }}>
          <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
            <Avatar
              variant="rounded"
              sx={{
                width: 42,
                height: 42,
                bgcolor: "rgba(255,255,255,0.16)",
                backdropFilter: "blur(4px)",
                fontWeight: 700,
                fontSize: 18,
              }}
            >
              {(businessName || "?").charAt(0).toUpperCase()}
            </Avatar>
            <Typography variant="h5" noWrap sx={{ fontWeight: 700, letterSpacing: 0.3 }}>
              {businessName}
            </Typography>
          </Stack>
          <IconButton onClick={() => setProfileOpen(true)} aria-label="Your profile" sx={{ color: "white" }}>
            <PersonIcon sx={{ fontSize: 30 }} />
          </IconButton>
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

      <UserProfileSheet open={profileOpen} onClose={() => setProfileOpen(false)} />
    </Box>
  );
}
