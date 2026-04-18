"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import MatchCenter from "@/components/MatchCenter";
import { Match } from "@/types/cricket";
import { fetchMatch, removeMatch, updateMatchRecord } from "@/lib/cricket-api";
import { getCurrentInnings, getMatchResult, runRate, scoreSummary } from "@/lib/cricket";

export default function ScorecardDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [match, setMatch] = useState<Match | null>(null);
  const [isFinalizing, setIsFinalizing] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      const matchId = String(params.id || "");
      const stored = await fetchMatch(matchId);
      if (!stored) {
        router.push("/scorecard");
        return;
      }
      setMatch(stored);
    }
    loadData();
  }, [params.id, router]);

  useEffect(() => {
    async function finalizeIfCompleted() {
      if (!match || match.status !== "completed" || isFinalizing) {
        return;
      }
      const storageKey = `cricket_match_finalized_${match.id}`;
      if (typeof window !== "undefined" && window.localStorage.getItem(storageKey) === "1") {
        return;
      }

      setIsFinalizing(true);
      try {
        const res = await fetch(`/api/matches/${match.id}/finalize`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ match, finalized: false }),
        });
        if (res.ok && typeof window !== "undefined") {
          window.localStorage.setItem(storageKey, "1");
        }
      } catch {
        // Finalize failures should not block scoring UI.
      } finally {
        setIsFinalizing(false);
      }
    }
    finalizeIfCompleted();
  }, [match, isFinalizing]);

  if (!match) {
    return null;
  }

  function handleMatchChange(nextMatch: Match) {
    setMatch(nextMatch);
    updateMatchRecord(nextMatch).catch(() => undefined);
  }

  async function handleShare() {
    if (!match) {
      return;
    }
    try {
      const response = await fetch(`/api/matches/${match.id}/share`, { method: "POST" });
      const data = await response.json();
      if (!response.ok || !data.shareToken) {
        throw new Error(data.error || "Failed to create share link");
      }
      const url = `${window.location.origin}/share/${data.shareToken}`;
      setShareUrl(url);
      await navigator.clipboard.writeText(url);
      toast.success("Public share link copied.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to share match");
    }
  }

  async function handleCopySummary() {
    if (!match) {
      return;
    }
    const innings = getCurrentInnings(match);
    const text = `${match.teamA.name} vs ${match.teamB.name}\n${scoreSummary(match)}\n${match.status === "completed" ? getMatchResult(match) : `Run Rate ${runRate(innings.totalRuns, innings.legalBalls)}`}`;
    await navigator.clipboard.writeText(text);
    toast.success("Match summary copied.");
  }

  function handleDelete() {
    if (!match) {
      return;
    }
    if (!window.confirm("Delete this match?")) {
      return;
    }
    removeMatch(match.id).catch(() => undefined);
    router.push("/scorecard");
  }

  return (
    <MatchCenter
      match={match}
      onMatchChange={handleMatchChange}
      onDelete={handleDelete}
      onShare={handleShare}
      onCopySummary={handleCopySummary}
      showControls
      shareUrl={shareUrl}
    />
  );
}
