"use client";

import { ReactNode } from "react";
import { CssBaseline, GlobalStyles } from "@mui/material";
import { ThemeProvider, createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#0b6bcb",
    },
    secondary: {
      main: "#ff6b35",
    },
    background: {
      default: "#f3f6fb",
      paper: "#ffffff",
    },
    success: {
      main: "#14804a",
    },
  },
  shape: {
    borderRadius: 12,
  },
  typography: {
    fontFamily: "var(--font-geist-sans), sans-serif",
    h1: { fontSize: "1.8rem", fontWeight: 700 },
    h2: { fontSize: "1.35rem", fontWeight: 700 },
    h3: { fontSize: "1.1rem", fontWeight: 700 },
    body1: { fontSize: "0.92rem" },
    body2: { fontSize: "0.82rem" },
    button: { textTransform: "none", fontWeight: 600 },
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          fontWeight: 600,
        },
      },
    },
    MuiButton: {
      defaultProps: {
        disableElevation: true,
      },
      styleOverrides: {
        root: {
          borderRadius: 10,
        },
      },
    },
  },
});

export default function MuiProvider({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <GlobalStyles
        styles={{
          body: { backgroundColor: "#f3f6fb" },
          a: { color: "inherit", textDecoration: "none" },
        }}
      />
      {children}
    </ThemeProvider>
  );
}
