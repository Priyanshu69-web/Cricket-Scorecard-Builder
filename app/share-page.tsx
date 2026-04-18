"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { Box, CircularProgress } from "@mui/material";
import MatchCenter from "@/components/MatchCenter";
import { Match } from "@/types/cricket";

export default function SharePage() {
  const params = useParams();
  const [match, setMatch] = useState<Match | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchSharedMatch() {
      try {
        const response = await fetch(`/api/share/${params.token}`);
        const data = await response.json();
        if (!response.ok || !data.match) {
          throw new Error(data.error || "Shared match not found");
        }
        setMatch(data.match);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Failed to load shared match");
      } finally {
        setIsLoading(false);
      }
    }

    if (params.token) {
      fetchSharedMatch();
    }
  }, [params.token]);

  if (isLoading) {
    return (
      <Box sx={{ minHeight: "100vh", display: "grid", placeItems: "center" }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!match) {
    return (
      <Box sx={{ minHeight: "100vh", display: "grid", placeItems: "center" }}>
        Shared scorecard not found.
      </Box>
    );
  }

  return (
    <MatchCenter
      match={match}
      showControls={false}
      backHref="/"
      backLabel="Back to home"
    />
  );
}
