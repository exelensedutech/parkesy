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
import Fade from "@mui/material/Fade";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import LocalParkingIcon from "@mui/icons-material/LocalParking";
import { useAppStore } from "@/lib/store";
import { supabase } from "@/lib/supabaseClient";
import OtpInput from "@/components/OtpInput";

const RESEND_SECONDS = 30;
const EMPTY_4 = ["", "", "", ""];
const EMPTY_6 = ["", "", "", "", "", ""];

type Step = "phone" | "otp" | "password";

export default function SignupPage() {
  const router = useRouter();
  const { authChecked, isAuthenticated, signup, t } = useAppStore();
  const [step, setStep] = useState<Step>("phone");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState<string[]>(EMPTY_4);
  const [otpError, setOtpError] = useState("");
  const [resendIn, setResendIn] = useState(RESEND_SECONDS);
  const [hasInvite, setHasInvite] = useState(false);
  const [checkingPhone, setCheckingPhone] = useState(false);

  const [password, setPassword] = useState<string[]>(EMPTY_6);
  const [confirmPassword, setConfirmPassword] = useState<string[]>(EMPTY_6);
  const [passwordError, setPasswordError] = useState("");
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    if (authChecked && isAuthenticated) {
      router.replace("/");
    }
  }, [authChecked, isAuthenticated, router]);

  useEffect(() => {
    if (step !== "otp" || resendIn === 0) return;
    const timer = setTimeout(() => setResendIn((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [step, resendIn]);

  const phoneValid = /^\d{10}$/.test(phone);
  const nameValid = name.trim().length > 0;

  const handleSendOtp = async () => {
    if (!phoneValid || !nameValid || checkingPhone) return;
    setCheckingPhone(true);
    const { data } = await supabase.rpc("has_pending_invite", { p_phone: phone });
    setCheckingPhone(false);
    setHasInvite(Boolean(data));
    setOtp(EMPTY_4);
    setOtpError("");
    setResendIn(RESEND_SECONDS);
    setStep("otp");
  };

  const handleVerifyOtp = async (code: string) => {
    if (code.length !== 4) return;
    if (hasInvite) {
      const { data: matchedRole } = await supabase.rpc("verify_invite_pin", { p_phone: phone, p_pin: code });
      if (!matchedRole) {
        setOtpError(t("incorrectPin"));
        setOtp(EMPTY_4);
        return;
      }
    }
    // Without an invite, any 4-digit code is accepted for now (no SMS OTP yet).
    setOtpError("");
    setPassword(EMPTY_6);
    setConfirmPassword(EMPTY_6);
    setPasswordError("");
    setStep("password");
  };

  const handleCreateAccount = async () => {
    const p = password.join("");
    const c = confirmPassword.join("");
    if (p.length !== 6 || c.length !== 6) {
      setPasswordError(t("enterConfirmPassword"));
      return;
    }
    if (p !== c) {
      setPasswordError(t("passwordsDontMatch"));
      setConfirmPassword(EMPTY_6);
      return;
    }
    const error = await signup(phone, p, name.trim());
    if (error) {
      setPasswordError(error);
      return;
    }
    setShowToast(true);
    setTimeout(() => router.replace("/login"), 1400);
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
          {t("createYourAccount")}
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
          <Fade in={step === "phone"} unmountOnExit>
            <Box sx={{ display: step === "phone" ? "block" : "none" }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                {t("signUpTitle")}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                {t("signupNamePhoneSubtitle")}
              </Typography>
              <Stack spacing={3}>
                <TextField
                  label={t("yourName")}
                  fullWidth
                  autoFocus
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
                <TextField
                  label={t("mobileNumber")}
                  fullWidth
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                  slotProps={{
                    input: {
                      startAdornment: <InputAdornment position="start">+91</InputAdornment>,
                    },
                    htmlInput: { inputMode: "numeric", pattern: "[0-9]*" },
                  }}
                  onKeyDown={(e) => e.key === "Enter" && handleSendOtp()}
                />
                <Button
                  variant="contained"
                  size="large"
                  fullWidth
                  disabled={!phoneValid || !nameValid || checkingPhone}
                  onClick={handleSendOtp}
                  sx={{ borderRadius: 6, py: 1.3, fontWeight: 600, boxShadow: "0 6px 16px rgba(0,101,143,0.35)" }}
                >
                  {t("sendOtp")}
                </Button>
                <Typography variant="body2" align="center">
                  {t("alreadyHaveAccount")} <Link component="button" onClick={() => router.push("/login")}>{t("logInLink")}</Link>
                </Typography>
              </Stack>
            </Box>
          </Fade>

          <Fade in={step === "otp"} unmountOnExit>
            <Box sx={{ display: step === "otp" ? "block" : "none" }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                {hasInvite ? t("enterInvitePin") : t("verifyYourNumber")}
              </Typography>
              <Stack direction="row" spacing={0.5} sx={{ alignItems: "baseline", mb: 3 }}>
                <Typography variant="body2" color="text.secondary">
                  {hasInvite ? t("adminSharedPin") : `${t("codeSentTo")} +91 ${phone}`}
                </Typography>
                <Link component="button" variant="body2" onClick={() => setStep("phone")}>
                  {t("changeLink")}
                </Link>
              </Stack>

              <Stack spacing={3}>
                <OtpInput value={otp} onChange={setOtp} onComplete={handleVerifyOtp} length={4} />
                {otpError && (
                  <Typography variant="caption" color="error" align="center">
                    {otpError}
                  </Typography>
                )}
                <Button
                  variant="contained"
                  size="large"
                  fullWidth
                  onClick={() => handleVerifyOtp(otp.join(""))}
                  sx={{ borderRadius: 6, py: 1.3, fontWeight: 600, boxShadow: "0 6px 16px rgba(0,101,143,0.35)" }}
                >
                  {t("verifyBtn")}
                </Button>
                {!hasInvite && (
                  <Typography variant="body2" align="center" color="text.secondary">
                    {resendIn > 0 ? (
                      `${t("resendOtpIn")} ${resendIn}s`
                    ) : (
                      <Link component="button" onClick={() => setResendIn(RESEND_SECONDS)}>
                        {t("resendOtpLink")}
                      </Link>
                    )}
                  </Typography>
                )}
              </Stack>
            </Box>
          </Fade>

          <Fade in={step === "password"} unmountOnExit>
            <Box sx={{ display: step === "password" ? "block" : "none" }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                {t("setPasswordTitle")}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                {t("setPasswordSubtitle")}
              </Typography>

              <Stack spacing={3}>
                <Stack spacing={1}>
                  <Typography variant="caption" color="text.secondary" align="center">
                    {t("passwordLabel")}
                  </Typography>
                  <OtpInput value={password} onChange={setPassword} length={6} />
                </Stack>
                <Stack spacing={1}>
                  <Typography variant="caption" color="text.secondary" align="center">
                    {t("confirmPasswordLabel")}
                  </Typography>
                  <OtpInput
                    value={confirmPassword}
                    onChange={setConfirmPassword}
                    onComplete={() => handleCreateAccount()}
                    length={6}
                  />
                </Stack>

                {passwordError && (
                  <Typography variant="caption" color="error" align="center">
                    {passwordError}
                  </Typography>
                )}

                <Button
                  variant="contained"
                  size="large"
                  fullWidth
                  onClick={handleCreateAccount}
                  sx={{ borderRadius: 6, py: 1.3, fontWeight: 600, boxShadow: "0 6px 16px rgba(0,101,143,0.35)" }}
                >
                  {t("createAccountBtn")}
                </Button>
              </Stack>
            </Box>
          </Fade>
        </Box>
      </Box>

      <Snackbar open={showToast} anchorOrigin={{ vertical: "bottom", horizontal: "center" }}>
        <Alert severity="success" variant="filled" sx={{ width: "100%" }}>
          {t("accountCreatedToast")}
        </Alert>
      </Snackbar>
    </Box>
  );
}
