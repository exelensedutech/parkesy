"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Link from "@mui/material/Link";
import Stack from "@mui/material/Stack";
import Fade from "@mui/material/Fade";
import LocalParkingIcon from "@mui/icons-material/LocalParking";
import { useAppStore } from "@/lib/store";
import OtpInput from "@/components/OtpInput";

const RESEND_SECONDS = 30;
const EMPTY_4 = ["", "", "", ""];
const EMPTY_6 = ["", "", "", "", "", ""];

type Step = "password" | "otp" | "new-password";

export default function LoginPage() {
  const router = useRouter();
  const { authChecked, isAuthenticated, hasAccount, phone, login, resetPassword } = useAppStore();
  const [step, setStep] = useState<Step>("password");

  const [password, setPassword] = useState<string[]>(EMPTY_6);
  const [loginError, setLoginError] = useState(false);

  const [otp, setOtp] = useState<string[]>(EMPTY_4);
  const [resendIn, setResendIn] = useState(RESEND_SECONDS);

  const [newPassword, setNewPassword] = useState<string[]>(EMPTY_6);
  const [confirmPassword, setConfirmPassword] = useState<string[]>(EMPTY_6);
  const [newPasswordError, setNewPasswordError] = useState("");

  useEffect(() => {
    if (!authChecked) return;
    if (isAuthenticated) {
      router.replace("/");
      return;
    }
    if (!hasAccount) {
      router.replace("/signup");
    }
  }, [authChecked, isAuthenticated, hasAccount, router]);

  useEffect(() => {
    if (step !== "otp" || resendIn === 0) return;
    const timer = setTimeout(() => setResendIn((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [step, resendIn]);

  const handleLogin = (code?: string) => {
    const value = code ?? password.join("");
    if (value.length !== 6) return;
    if (login(value)) {
      router.replace("/");
    } else {
      setLoginError(true);
      setPassword(EMPTY_6);
    }
  };

  const goToForgotPassword = () => {
    setOtp(EMPTY_4);
    setResendIn(RESEND_SECONDS);
    setStep("otp");
  };

  const handleVerifyOtp = (code: string) => {
    if (code.length !== 4) return;
    // No backend yet — any 4-digit code is accepted as the verified OTP.
    setNewPassword(EMPTY_6);
    setConfirmPassword(EMPTY_6);
    setNewPasswordError("");
    setStep("new-password");
  };

  const handleSetNewPassword = () => {
    const p = newPassword.join("");
    const c = confirmPassword.join("");
    if (p.length !== 6 || c.length !== 6) {
      setNewPasswordError("Enter and confirm a 6-digit password");
      return;
    }
    if (p !== c) {
      setNewPasswordError("Passwords don't match — try again");
      setConfirmPassword(EMPTY_6);
      return;
    }
    resetPassword(p);
    setPassword(EMPTY_6);
    setLoginError(false);
    setStep("password");
  };

  if (!authChecked || isAuthenticated || !hasAccount) {
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
          <Fade in={step === "password"} unmountOnExit>
            <Box sx={{ display: step === "password" ? "block" : "none" }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                Welcome back
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Enter your 6-digit password
              </Typography>

              <Stack spacing={3}>
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
                    Incorrect password — try again
                  </Typography>
                )}

                <Button
                  variant="contained"
                  size="large"
                  fullWidth
                  onClick={() => handleLogin()}
                  sx={{ borderRadius: 6, py: 1.3, fontWeight: 600, boxShadow: "0 6px 16px rgba(0,101,143,0.35)" }}
                >
                  Log In
                </Button>

                <Typography variant="body2" align="center">
                  <Link component="button" onClick={goToForgotPassword}>
                    Forgot password?
                  </Link>
                </Typography>
              </Stack>
            </Box>
          </Fade>

          <Fade in={step === "otp"} unmountOnExit>
            <Box sx={{ display: step === "otp" ? "block" : "none" }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                Verify your number
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Code sent to +91 {phone}
              </Typography>

              <Stack spacing={3}>
                <OtpInput value={otp} onChange={setOtp} onComplete={handleVerifyOtp} length={4} />
                <Button
                  variant="contained"
                  size="large"
                  fullWidth
                  onClick={() => handleVerifyOtp(otp.join(""))}
                  sx={{ borderRadius: 6, py: 1.3, fontWeight: 600, boxShadow: "0 6px 16px rgba(0,101,143,0.35)" }}
                >
                  Verify
                </Button>
                <Typography variant="body2" align="center" color="text.secondary">
                  {resendIn > 0 ? (
                    `Resend OTP in ${resendIn}s`
                  ) : (
                    <Link component="button" onClick={() => setResendIn(RESEND_SECONDS)}>
                      Resend OTP
                    </Link>
                  )}
                </Typography>
                <Typography variant="body2" align="center">
                  <Link component="button" onClick={() => setStep("password")}>
                    Back to login
                  </Link>
                </Typography>
              </Stack>
            </Box>
          </Fade>

          <Fade in={step === "new-password"} unmountOnExit>
            <Box sx={{ display: step === "new-password" ? "block" : "none" }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                Set a new password
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Choose a new 6-digit password for your account.
              </Typography>

              <Stack spacing={3}>
                <Stack spacing={1}>
                  <Typography variant="caption" color="text.secondary" align="center">
                    New password
                  </Typography>
                  <OtpInput value={newPassword} onChange={setNewPassword} length={6} />
                </Stack>
                <Stack spacing={1}>
                  <Typography variant="caption" color="text.secondary" align="center">
                    Confirm password
                  </Typography>
                  <OtpInput
                    value={confirmPassword}
                    onChange={setConfirmPassword}
                    onComplete={() => handleSetNewPassword()}
                    length={6}
                  />
                </Stack>

                {newPasswordError && (
                  <Typography variant="caption" color="error" align="center">
                    {newPasswordError}
                  </Typography>
                )}

                <Button
                  variant="contained"
                  size="large"
                  fullWidth
                  onClick={handleSetNewPassword}
                  sx={{ borderRadius: 6, py: 1.3, fontWeight: 600, boxShadow: "0 6px 16px rgba(0,101,143,0.35)" }}
                >
                  Save &amp; Continue
                </Button>
              </Stack>
            </Box>
          </Fade>
        </Box>
      </Box>
    </Box>
  );
}
