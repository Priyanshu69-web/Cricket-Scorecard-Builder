"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Box, Container, Stack, Typography } from "@mui/material";
import MatchForm from "@/components/MatchForm";

export default function CreateScorecardPage() {
  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f3f6fb", pt: 10 }}>
      <Container maxWidth="lg" sx={{ py: { xs: 2.5, md: 4 } }}>
        <Stack spacing={1.25} sx={{ mb: 2.5 }}>
          <Link href="/scorecard" className="inline-flex items-center text-sm text-slate-600 transition hover:text-slate-900">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to matches
          </Link>
          <Typography variant="h1" sx={{ fontSize: { xs: "1.45rem", md: "1.9rem" } }}>
            Set up a cricket match
          </Typography>
          <Typography variant="body2" sx={{ maxWidth: 760, color: "text.secondary" }}>
            Build a lean mobile-ready match shell, lock both XIs, and move straight into live scoring.
          </Typography>
        </Stack>
        <MatchForm />
      </Container>
    </Box>
  );
}
