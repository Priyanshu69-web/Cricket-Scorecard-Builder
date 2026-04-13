"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Copy,
  RotateCcw,
  Target,
  Trash2,
  Trophy,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import CollapsibleCard from "@/components/CollapsibleCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ScoreTable from "@/components/ScoreTable";
import {
  applyScoringAction,
  currentPartnership,
  economyRate,
  formatDate,
  getBatter,
  getCurrentInnings,
  getMatchResult,
  getRequiredRunRate,
  getTarget,
  getTeamById,
  runRate,
  scoreSummary,
  selectBowler,
  strikeRate,
  toOvers,
  undoLastBall,
} from "@/lib/cricket";
import { BallEvent, Match } from "@/types/cricket";
import { fetchMatch, removeMatch, updateMatchRecord } from "@/lib/cricket-api";

function ballTone(event: BallEvent) {
  if (event.wicket) return "bg-rose-400/20 text-rose-200 border-rose-300/20";
  if (event.extraType) return "bg-amber-300/20 text-amber-100 border-amber-300/20";
  if (event.runs === 0) return "bg-sky-300/15 text-sky-100 border-sky-300/15";
  return "bg-emerald-300/15 text-emerald-100 border-emerald-300/15";
}

export default function ScorecardDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [match, setMatch] = useState<Match | null>(null);
  const [activeTab, setActiveTab] = useState("scorecard");
  const [isFinalizing, setIsFinalizing] = useState(false);

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
        // Ignore finalize errors in UI flow.
      } finally {
        setIsFinalizing(false);
      }
    }
    finalizeIfCompleted();
  }, [match, isFinalizing]);

  const innings = useMemo(() => (match ? getCurrentInnings(match) : null), [match]);
  const battingTeam = match && innings ? getTeamById(match, innings.battingTeamId) : null;
  const bowlingTeam = match && innings ? getTeamById(match, innings.bowlingTeamId) : null;
  const striker = innings ? getBatter(innings, innings.strikerId) : null;
  const nonStriker = innings ? getBatter(innings, innings.nonStrikerId) : null;
  const bowler = innings?.bowling.find((item) => item.playerId === innings.currentBowlerId) || null;
  const target = match ? getTarget(match) : null;
  const requiredRate = match ? getRequiredRunRate(match) : null;
  const partnership = innings ? currentPartnership(innings) : { runs: 0, balls: 0 };

  if (!match || !innings || !battingTeam || !bowlingTeam) {
    return null;
  }

  function updateMatch(nextMatch: Match) {
    setMatch(nextMatch);
    updateMatchRecord(nextMatch).catch(() => undefined);
  }

  function scoreRuns(runs: 0 | 1 | 2 | 3 | 4 | 6) {
    if (!match) {
      return;
    }
    updateMatch(applyScoringAction(match, { type: "runs", runs }));
  }

  function addExtra(extraType: "wd" | "nb" | "bye" | "lb") {
    if (!match) {
      return;
    }
    updateMatch(applyScoringAction(match, { type: "extra", extraType, runs: 1 }));
  }

  function wicket() {
    if (!match) {
      return;
    }
    updateMatch(applyScoringAction(match, { type: "wicket", dismissal: "bowled" }));
  }

  function undo() {
    if (!match) {
      return;
    }
    const next = undoLastBall(match);
    updateMatch(next);
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

  function copySummary() {
    if (!match || !innings) {
      return;
    }
    const text = `${match.teamA.name} vs ${match.teamB.name}\n${scoreSummary(match)}\n${match.status === "completed" ? getMatchResult(match) : `Run Rate ${runRate(innings.totalRuns, innings.legalBalls)}`}`;
    navigator.clipboard.writeText(text);
    toast.success("Match summary copied.");
  }

  return (
    <div className="min-h-screen bg-slate-100 pt-20 dark:bg-slate-950">
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <Link href="/scorecard" className="mb-4 inline-flex items-center text-sm text-slate-600 hover:text-slate-900 dark:text-sky-100 dark:hover:text-white">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to matches
            </Link>
            <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">
              {match.teamA.name} vs {match.teamB.name}
            </h1>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              {match.format} • {formatDate(match.date)} • {match.venue || "Venue TBD"}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" onClick={copySummary} className="rounded-md">
              <Copy className="mr-2 h-4 w-4" />
              Share summary
            </Button>
            <Button variant="outline" onClick={undo} className="rounded-md">
              <RotateCcw className="mr-2 h-4 w-4" />
              Undo last ball
            </Button>
            <Button variant="outline" onClick={handleDelete} className="rounded-md">
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </Button>
          </div>
        </div>

        <div className="z-30 mb-4 rounded-md border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 lg:sticky lg:top-18">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-emerald-200">Score</p>
              <p className="mt-2 text-4xl font-semibold text-slate-900 dark:text-white">
                {innings.totalRuns}/{innings.wickets}
              </p>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{battingTeam.name}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Overs</p>
              <p className="mt-2 text-3xl font-semibold text-slate-900 dark:text-white">{toOvers(innings.legalBalls)}</p>
              <p className="mt-1 text-sm capitalize text-slate-600 dark:text-slate-400">{match.status}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Run Rate</p>
              <p className="mt-2 text-3xl font-semibold text-slate-900 dark:text-white">{runRate(innings.totalRuns, innings.legalBalls)}</p>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">Partnership {partnership.runs} ({partnership.balls})</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Target</p>
              <p className="mt-2 text-3xl font-semibold text-slate-900 dark:text-white">{target || "-"}</p>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{requiredRate === null ? "First innings" : `Req RR ${requiredRate === Infinity ? "∞" : requiredRate}`}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Result</p>
              <p className="mt-2 text-lg font-semibold text-slate-900 dark:text-white">{match.status === "completed" ? getMatchResult(match) : "Live match"}</p>
            </div>
          </div>
        </div>

        {match.status === "completed" ? (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 rounded-md border border-emerald-200 bg-gradient-to-r from-emerald-50 to-sky-50 p-3 dark:border-emerald-800 dark:from-emerald-950/40 dark:to-sky-950/30"
          >
            <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
              Match Result
            </p>
            <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">
              {getMatchResult(match)}
            </p>
            <motion.div
              className="mt-2 flex gap-1"
              initial="hidden"
              animate="visible"
              variants={{
                hidden: {},
                visible: { transition: { staggerChildren: 0.07 } },
              }}
            >
              {Array.from({ length: 16 }).map((_, index) => (
                <motion.span
                  key={index}
                  className="h-2 w-2 rounded-full bg-emerald-400"
                  variants={{
                    hidden: { y: 0, opacity: 0.3 },
                    visible: { y: [0, -6, 0], opacity: [0.3, 1, 0.3] },
                  }}
                  transition={{ duration: 0.9, repeat: Infinity, repeatDelay: 0.6 }}
                />
              ))}
            </motion.div>
          </motion.div>
        ) : null}

        <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <CollapsibleCard
                title="Batsmen"
                description="Current pair in the middle."
                className="border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"
              >
                <div className="space-y-2 text-xs sm:text-sm">
                  {[striker, nonStriker].map((player, index) => (
                    <div key={player?.playerId || index} className="rounded-md border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800">
                      <div className="mb-2 flex items-center justify-between">
                        <p className="font-semibold text-slate-900 dark:text-white">
                          {player?.name || "Waiting"}
                          {index === 0 ? " ★" : ""}
                        </p>
                        <span className="text-sm text-slate-500 dark:text-slate-400">{player?.isOut ? "out" : "not out"}</span>
                      </div>
                      <div className="grid grid-cols-4 gap-3 text-sm">
                        <div><p className="text-slate-500">Runs</p><p className="mt-1 text-slate-900 dark:text-white">{player?.runs || 0}</p></div>
                        <div><p className="text-slate-500">Balls</p><p className="mt-1 text-slate-900 dark:text-white">{player?.balls || 0}</p></div>
                        <div><p className="text-slate-500">4s / 6s</p><p className="mt-1 text-slate-900 dark:text-white">{player?.fours || 0}/{player?.sixes || 0}</p></div>
                        <div><p className="text-slate-500">SR</p><p className="mt-1 text-slate-900 dark:text-white">{strikeRate(player?.runs || 0, player?.balls || 0)}</p></div>
                      </div>
                    </div>
                  ))}
                </div>
              </CollapsibleCard>

              <CollapsibleCard
                title="Current bowler"
                description="Change bowler at over breaks when needed."
                className="border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"
              >
                <div className="space-y-3 text-xs sm:text-sm">
                  <div className="rounded-md border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800">
                    <div className="mb-2 flex items-center justify-between">
                      <p className="font-semibold text-slate-900 dark:text-white">{bowler?.name || "Select bowler"}</p>
                      <Target className="h-4 w-4 text-sky-200" />
                    </div>
                    <div className="grid grid-cols-4 gap-3 text-sm">
                      <div><p className="text-slate-500">Overs</p><p className="mt-1 text-slate-900 dark:text-white">{toOvers(bowler?.balls || 0)}</p></div>
                      <div><p className="text-slate-500">Runs</p><p className="mt-1 text-slate-900 dark:text-white">{bowler?.runsConceded || 0}</p></div>
                      <div><p className="text-slate-500">Wickets</p><p className="mt-1 text-slate-900 dark:text-white">{bowler?.wickets || 0}</p></div>
                      <div><p className="text-slate-500">Econ</p><p className="mt-1 text-slate-900 dark:text-white">{economyRate(bowler?.runsConceded || 0, bowler?.balls || 0)}</p></div>
                    </div>
                  </div>
                  <div>
                    <label className="mb-2 block text-sm text-slate-600 dark:text-slate-400">Change bowler</label>
                    <select
                      value={innings.currentBowlerId || ""}
                      onChange={(e) => updateMatch(selectBowler(match, e.target.value))}
                      className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                    >
                      {bowlingTeam.players.map((player) => (
                        <option key={player.id} value={player.id}>
                          {player.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </CollapsibleCard>
            </div>

            <CollapsibleCard
              title="Live scoring controls"
              description="Compact quick actions."
              defaultOpen={false}
              className="border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"
            >
                <div className="grid grid-cols-4 gap-2">
                  {[0, 1, 2, 3, 4, 6].map((runs) => (
                    <Button
                      key={runs}
                      onClick={() => scoreRuns(runs as 0 | 1 | 2 | 3 | 4 | 6)}
                      className="h-10 rounded-md bg-sky-300 text-xs font-semibold text-slate-950 hover:bg-sky-200 sm:h-14 sm:text-lg"
                    >
                      {runs}
                    </Button>
                  ))}
                  <Button onClick={wicket} className="h-10 rounded-md bg-rose-400 text-xs font-semibold text-white hover:bg-rose-300 sm:h-14 sm:text-lg">
                    W
                  </Button>
                  <Button onClick={() => addExtra("wd")} className="h-10 rounded-md bg-amber-300 text-xs font-semibold text-slate-950 hover:bg-amber-200 sm:h-14 sm:text-sm">
                    WD
                  </Button>
                  <Button onClick={() => addExtra("nb")} className="h-10 rounded-md bg-amber-300 text-xs font-semibold text-slate-950 hover:bg-amber-200 sm:h-14 sm:text-sm">
                    NB
                  </Button>
                  <Button onClick={() => addExtra("bye")} className="h-10 rounded-md bg-emerald-300 text-xs font-semibold text-slate-950 hover:bg-emerald-200 sm:h-14 sm:text-sm">
                    BYE
                  </Button>
                  <Button onClick={() => addExtra("lb")} className="h-10 rounded-md bg-emerald-300 text-xs font-semibold text-slate-950 hover:bg-emerald-200 sm:h-14 sm:text-sm">
                    LB
                  </Button>
                </div>
            </CollapsibleCard>

            <CollapsibleCard
              title="Ball-by-ball timeline"
              description="Color-coded overs and deliveries."
              defaultOpen={false}
              className="border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="space-y-3 text-xs sm:text-sm">
                {[...innings.overSummaries].reverse().map((over) => (
                  <div key={over.overNumber} className="rounded-md border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800">
                    <div className="mb-3 flex items-center justify-between">
                      <p className="font-medium text-slate-900 dark:text-white">Over {over.overNumber}</p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">{over.runs} runs • {over.wickets} wicket(s)</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {over.balls.map((ball) => (
                        <div
                          key={ball.id}
                          className={`rounded-xl border px-3 py-2 text-sm font-semibold ${ballTone(ball)}`}
                          title={ball.commentary}
                        >
                          {ball.label}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CollapsibleCard>
          </div>

          <div className="space-y-3">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList>
                <TabsTrigger value="scorecard">Scorecard</TabsTrigger>
                <TabsTrigger value="commentary">Commentary</TabsTrigger>
                <TabsTrigger value="player-stats">Player Stats</TabsTrigger>
              </TabsList>

              <TabsContent value="scorecard" className="space-y-3">
                <ScoreTable innings={innings} battingTeamName={battingTeam.name} bowlingTeamName={bowlingTeam.name} />
                {match.innings[1].timeline.length > 0 ? (
                  <ScoreTable
                    innings={match.innings[0]}
                    battingTeamName={getTeamById(match, match.innings[0].battingTeamId).name}
                    bowlingTeamName={getTeamById(match, match.innings[0].bowlingTeamId).name}
                  />
                ) : null}
              </TabsContent>

              <TabsContent value="commentary">
                <Card className="border-slate-200 bg-white">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base text-slate-900">Ball-by-ball commentary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    {[...innings.timeline].slice(-24).reverse().map((ball) => (
                      <div
                        key={ball.id}
                        className="flex items-center justify-between rounded-md border border-slate-200 px-3 py-2"
                      >
                        <span className="text-slate-700">{ball.commentary}</span>
                        <span className={`rounded px-2 py-0.5 text-xs font-semibold ${ballTone(ball)}`}>
                          {ball.over}.{ball.ballInOver ?? "-"} {ball.label}
                        </span>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="player-stats">
                <Card className="border-slate-200 bg-white">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base text-slate-900">Current player snapshot</CardTitle>
                  </CardHeader>
                  <CardContent className="grid gap-2 text-sm md:grid-cols-2">
                    {[striker, nonStriker, bowler].filter(Boolean).map((player, index) => (
                      <div key={index} className="rounded-md border border-slate-200 p-3">
                        <p className="font-medium text-slate-900">{player?.name}</p>
                        <p className="text-xs text-slate-500">
                          {"runs" in (player || {}) ? "Batter" : "Bowler"}
                        </p>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            <CollapsibleCard
              title="Match summary"
              className="border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="space-y-2 text-xs sm:text-sm">
                <div className="rounded-md border border-slate-200 bg-slate-50 p-3 text-slate-700">
                  <p className="font-medium text-slate-900">Toss</p>
                  <p className="mt-1">
                    {getTeamById(match, match.tossWinnerTeamId).name} won the toss and chose to {match.tossDecision}.
                  </p>
                </div>
                <div className="rounded-md border border-emerald-200 bg-emerald-50 p-3 text-slate-700">
                  <div className="flex items-center gap-2 font-medium text-slate-900">
                    <Trophy className="h-4 w-4" />
                    Result
                  </div>
                  <p className="mt-1">{match.status === "completed" ? getMatchResult(match) : "Match still in progress."}</p>
                </div>
              </div>
            </CollapsibleCard>
          </div>
        </div>
      </div>
    </div>
  );
}
