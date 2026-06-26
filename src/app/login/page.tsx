"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import InputAdornment from "@mui/material/InputAdornment";
import Link from "@mui/material/Link";
import Stack from "@mui/material/Stack";
import LocalParkingIcon from "@mui/icons-material/LocalParking";
import { useAppStore } from "@/lib/store";
import OtpInput from "@/components/OtpInput";

const EMPTY_6 = ["", "", "", "", "", ""];

export default function LoginPage() {
  const router = useRouter();
  const { authChecked, isAuthenticated, login } = useAppStore();

  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState<string[]>(EMPTY_6);
  const [loginError, setLoginError] = useState(false);
  const [loggingIn, setLoggingIn] = useState(false);

  useEffect(() => {
    if (authChecked && isAuthenticated) {
      router.replace("/");
    }
  }, [authChecked, isAuthenticated, router]);

  // If we were mid-login and the store finishes checking but still isn't
  // authenticated, the sign-in itself worked but loading the profile failed —
  // surface that instead of leaving the button disabled forever.
  useEffect(() => {
    if (loggingIn && authChecked && !isAuthenticated) {
      setLoggingIn(false);
      setLoginError(true);
    }
  }, [authChecked, isAuthenticated, loggingIn]);

  const phoneValid = /^\d{10}$/.test(phone);

  const handleLogin = async (code?: string) => {
    const value = code ?? password.join("");
    if (!phoneValid || value.length !== 6 || loggingIn) return;
    setLoggingIn(true);
    const ok = await login(phone, value);
    if (ok) {
      // Don't navigate here — the effect above redirects once the store has
      // actually finished loading the profile/business, avoiding a race where
      // we'd land on "/" before isAuthenticated reflects the new session.
      return;
    }
    setLoggingIn(false);
    setLoginError(true);
    setPassword(EMPTY_6);
  };

  if (!authChecked || isAuthenticated) {
    return null;
  }

  return (
    <Box sx={{ minHeight: "100vh", display: "flex", flexDirection: "column", bgcolor: "background.default" }}>
      <Box
        sx={{
          position: "relative",
          overflow: "hidden",
          height: { xs: 260, sm: 280 },
          flexShrink: 0,
          background: "linear-gradient(135deg, #00829B 0%, #00658F 55%, #013F5C 100%)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Box
          sx={{
            position: "absolute",
            top: -60,
            right: -40,
            width: 180,
            height: 180,
            borderRadius: "50%",
            bgcolor: "rgba(255,255,255,0.08)",
          }}
        />
        <Box
          sx={{
            position: "absolute",
            bottom: -50,
            left: -50,
            width: 160,
            height: 160,
            borderRadius: "50%",
            bgcolor: "rgba(255,255,255,0.06)",
          }}
        />
        <Box
          sx={{
            width: 72,
            height: 72,
            borderRadius: "24px",
            bgcolor: "rgba(255,255,255,0.16)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            mb: 1.5,
          }}
        >
          <LocalParkingIcon sx={{ color: "white", fontSize: 40 }} />
        </Box>
        <Typography variant="h5" sx={{ color: "white", fontWeight: 700, letterSpacing: 0.3 }}>
          Parkesy
        </Typography>
        <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.8)", mt: 0.5 }}>
          Parking entries, billing &amp; reports
        </Typography>
      </Box>

      <Box
        sx={{
          flex: 1,
          mt: -3,
          position: "relative",
          bgcolor: "background.paper",
          borderTopLeftRadius: 28,
          borderTopRightRadius: 28,
          boxShadow: "0 -8px 24px rgba(0,0,0,0.08)",
          px: 3,
          pt: 4,
          pb: 5,
          display: "flex",
          justifyContent: "center",
        }}
      >
        <Box sx={{ width: "100%", maxWidth: 360 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
            Welcome back
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Enter your mobile number and 6-digit password
          </Typography>

          <Stack spacing={3}>
            <TextField
              label="Mobile number"
              fullWidth
              autoFocus
              value={phone}
              onChange={(e) => {
                setPhone(e.target.value.replace(/\D/g, "").slice(0, 10));
                setLoginError(false);
              }}
              slotProps={{
                input: {
                  startAdornment: <InputAdornment position="start">+91</InputAdornment>,
                },
                htmlInput: { inputMode: "numeric", pattern: "[0-9]*" },
              }}
            />
            <OtpInput
              value={password}
              onChange={(v) => {
                setPassword(v);
                setLoginError(false);
              }}
              onComplete={(code) => handleLogin(code)}
              length={6}
            />
            {loginError && (
              <Typography variant="caption" color="error" align="center">
                Couldn&apos;t log you in — check your phone &amp; password and try again
              </Typography>
            )}

            <Button
              variant="contained"
              size="large"
              fullWidth
              disabled={!phoneValid || loggingIn}
              onClick={() => handleLogin()}
              sx={{ borderRadius: 6, py: 1.3, fontWeight: 600, boxShadow: "0 6px 16px rgba(0,101,143,0.35)" }}
            >
              Log In
            </Button>

            <Typography variant="body2" align="center">
              New here? <Link component="button" onClick={() => router.push("/signup")}>Sign up</Link>
            </Typography>
          </Stack>
        </Box>
      </Box>
    </Box>
  );
}
