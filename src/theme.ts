"use client";

import { createTheme } from "@mui/material/styles";

export const theme = createTheme({
  palette: {
    primary: {
      main: "#00658F",
    },
    secondary: {
      main: "#4F6354",
    },
    background: {
      default: "#F7F9FC",
    },
  },
  typography: {
    fontFamily: "var(--font-roboto), Roboto, Arial, sans-serif",
  },
  shape: {
    borderRadius: 16,
  },
  components: {
    MuiAppBar: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        root: { backgroundColor: "#00658F" },
      },
    },
    MuiBottomNavigation: {
      styleOverrides: {
        root: { height: 64 },
      },
    },
    MuiFab: {
      styleOverrides: {
        root: { boxShadow: "0 4px 8px rgba(0,0,0,0.25)" },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: { borderRadius: 16 },
      },
    },
  },
});
