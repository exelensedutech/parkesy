"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import AppShell from "@/components/AppShell";
import { useAppStore } from "@/lib/store";

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const { authChecked, isAuthenticated } = useAppStore();
  const router = useRouter();

  useEffect(() => {
    if (!authChecked || isAuthenticated) return;
    router.replace("/signup");
  }, [authChecked, isAuthenticated, router]);

  if (!authChecked || !isAuthenticated) {
    return (
      <Box sx={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <CircularProgress />
      </Box>
    );
  }

  return <AppShell>{children}</AppShell>;
}
