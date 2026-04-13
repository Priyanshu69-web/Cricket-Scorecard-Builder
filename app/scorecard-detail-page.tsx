"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import ScoreTable from "@/components/ScoreTable";
import {
  applyScoringAction,
  currentPartnership,
  deleteMatch,
  economyRate,
  formatDate,
  getBatter,
  getCurrentInnings,
  getMatchResult,
  getRequiredRunRate,
  getTarget,
  getTeamById,
  loadMatch,
  runRate,
  saveMatch,
  scoreSummary,
  selectBowler,
  strikeRate,
  toOvers,
  undoLastBall,
} from "@/lib/cricket";
import { BallEvent, Match } from "@/types/cricket";

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

  useEffect(() => {
    const matchId = String(params.id || "");
    const stored = loadMatch(matchId);
    if (!stored) {
      router.push("/scorecard");
      return;
    }
    setMatch(stored);
  }, [params.id, router]);

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
    saveMatch(nextMatch);
  }

  function scoreRuns(runs: 0 | 1 | 2 | 3 | 4 | 6) {
    if (!match) {
      return;
    }
    updateMatch(applyScoringAction(match, { type: "runs", runs }));
  }

  function addExtra(extraType: "wd" | "nb" | "bye") {
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
    deleteMatch(match.id);
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
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.18),_transparent_26%),linear-gradient(180deg,_#0a1420_0%,_#111d2d_45%,_#09111a_100%)] pt-20">
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <Link href="/scorecard" className="mb-4 inline-flex items-center text-sm text-sky-100 hover:text-white">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to matches
            </Link>
            <h1 className="text-3xl font-semibold text-white">
              {match.teamA.name} vs {match.teamB.name}
            </h1>
            <p className="mt-2 text-slate-400">
              {match.format} • {formatDate(match.date)} • {match.venue || "Venue TBD"}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" onClick={copySummary} className="rounded-full border-white/15 text-slate-200 hover:bg-white/10">
              <Copy className="mr-2 h-4 w-4" />
              Share summary
            </Button>
            <Button variant="outline" onClick={undo} className="rounded-full border-amber-300/20 text-amber-100 hover:bg-amber-300/10">
              <RotateCcw className="mr-2 h-4 w-4" />
              Undo last ball
            </Button>
            <Button variant="outline" onClick={handleDelete} className="rounded-full border-rose-300/20 text-rose-200 hover:bg-rose-400/10">
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </Button>
          </div>
        </div>

        <div className="sticky top-18 z-30 mb-6 rounded-3xl border border-emerald-300/15 bg-slate-950/75 p-5 backdrop-blur-xl">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-emerald-200">Score</p>
              <p className="mt-2 text-4xl font-semibold text-white">
                {innings.totalRuns}/{innings.wickets}
              </p>
              <p className="mt-1 text-sm text-slate-400">{battingTeam.name}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Overs</p>
              <p className="mt-2 text-3xl font-semibold text-white">{toOvers(innings.legalBalls)}</p>
              <p className="mt-1 text-sm text-slate-400 capitalize">{match.status}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Run Rate</p>
              <p className="mt-2 text-3xl font-semibold text-white">{runRate(innings.totalRuns, innings.legalBalls)}</p>
              <p className="mt-1 text-sm text-slate-400">Partnership {partnership.runs} ({partnership.balls})</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Target</p>
              <p className="mt-2 text-3xl font-semibold text-white">{target || "-"}</p>
              <p className="mt-1 text-sm text-slate-400">{requiredRate === null ? "First innings" : `Req RR ${requiredRate === Infinity ? "∞" : requiredRate}`}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Result</p>
              <p className="mt-2 text-lg font-semibold text-white">{match.status === "completed" ? getMatchResult(match) : "Live match"}</p>
            </div>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <Card className="border-white/10 bg-white/5 backdrop-blur-xl">
                <CardHeader>
                  <CardTitle className="text-white">Batsmen</CardTitle>
                  <CardDescription className="text-slate-400">Current pair in the middle.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[striker, nonStriker].map((player, index) => (
                    <div key={player?.playerId || index} className="rounded-2xl border border-white/10 bg-slate-950/35 p-4">
                      <div className="mb-2 flex items-center justify-between">
                        <p className="font-semibold text-white">
                          {player?.name || "Waiting"}
                          {index === 0 ? " ★" : ""}
                        </p>
                        <span className="text-sm text-slate-400">{player?.isOut ? "out" : "not out"}</span>
                      </div>
                      <div className="grid grid-cols-4 gap-3 text-sm">
                        <div><p className="text-slate-500">Runs</p><p className="mt-1 text-white">{player?.runs || 0}</p></div>
                        <div><p className="text-slate-500">Balls</p><p className="mt-1 text-white">{player?.balls || 0}</p></div>
                        <div><p className="text-slate-500">4s / 6s</p><p className="mt-1 text-white">{player?.fours || 0}/{player?.sixes || 0}</p></div>
                        <div><p className="text-slate-500">SR</p><p className="mt-1 text-white">{strikeRate(player?.runs || 0, player?.balls || 0)}</p></div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="border-white/10 bg-white/5 backdrop-blur-xl">
                <CardHeader>
                  <CardTitle className="text-white">Current bowler</CardTitle>
                  <CardDescription className="text-slate-400">Change bowler at over breaks when needed.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="rounded-2xl border border-white/10 bg-slate-950/35 p-4">
                    <div className="mb-2 flex items-center justify-between">
                      <p className="font-semibold text-white">{bowler?.name || "Select bowler"}</p>
                      <Target className="h-4 w-4 text-sky-200" />
                    </div>
                    <div className="grid grid-cols-4 gap-3 text-sm">
                      <div><p className="text-slate-500">Overs</p><p className="mt-1 text-white">{toOvers(bowler?.balls || 0)}</p></div>
                      <div><p className="text-slate-500">Runs</p><p className="mt-1 text-white">{bowler?.runsConceded || 0}</p></div>
                      <div><p className="text-slate-500">Wickets</p><p className="mt-1 text-white">{bowler?.wickets || 0}</p></div>
                      <div><p className="text-slate-500">Econ</p><p className="mt-1 text-white">{economyRate(bowler?.runsConceded || 0, bowler?.balls || 0)}</p></div>
                    </div>
                  </div>
                  <div>
                    <label className="mb-2 block text-sm text-slate-400">Change bowler</label>
                    <select
                      value={innings.currentBowlerId || ""}
                      onChange={(e) => updateMatch(selectBowler(match, e.target.value))}
                      className="h-11 w-full rounded-xl border border-white/10 bg-slate-950/50 px-3 text-white"
                    >
                      {bowlingTeam.players.map((player) => (
                        <option key={player.id} value={player.id}>
                          {player.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="border-white/10 bg-white/5 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="text-white">Live scoring controls</CardTitle>
                <CardDescription className="text-slate-400">
                  Big thumb-friendly buttons for fast updates.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-4 gap-3">
                  {[0, 1, 2, 3, 4, 6].map((runs) => (
                    <Button
                      key={runs}
                      onClick={() => scoreRuns(runs as 0 | 1 | 2 | 3 | 4 | 6)}
                      className="h-16 rounded-2xl bg-sky-300 text-xl font-semibold text-slate-950 hover:bg-sky-200"
                    >
                      {runs}
                    </Button>
                  ))}
                  <Button onClick={wicket} className="h-16 rounded-2xl bg-rose-400 text-xl font-semibold text-white hover:bg-rose-300">
                    W
                  </Button>
                  <Button onClick={() => addExtra("wd")} className="h-16 rounded-2xl bg-amber-300 text-base font-semibold text-slate-950 hover:bg-amber-200">
                    WD
                  </Button>
                  <Button onClick={() => addExtra("nb")} className="h-16 rounded-2xl bg-amber-300 text-base font-semibold text-slate-950 hover:bg-amber-200">
                    NB
                  </Button>
                  <Button onClick={() => addExtra("bye")} className="h-16 rounded-2xl bg-emerald-300 text-base font-semibold text-slate-950 hover:bg-emerald-200">
                    BYE
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="border-white/10 bg-white/5 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="text-white">Ball-by-ball timeline</CardTitle>
                  <CardDescription className="text-slate-400">Color-coded overs and deliveries.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[...innings.overSummaries].reverse().map((over) => (
                  <div key={over.overNumber} className="rounded-2xl border border-white/10 bg-slate-950/35 p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <p className="font-medium text-white">Over {over.overNumber}</p>
                      <p className="text-sm text-slate-400">{over.runs} runs • {over.wickets} wicket(s)</p>
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
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <ScoreTable innings={innings} battingTeamName={battingTeam.name} bowlingTeamName={bowlingTeam.name} />

            {match.innings[1].timeline.length > 0 ? (
              <ScoreTable
                innings={match.innings[0]}
                battingTeamName={getTeamById(match, match.innings[0].battingTeamId).name}
                bowlingTeamName={getTeamById(match, match.innings[0].bowlingTeamId).name}
              />
            ) : null}

            <Card className="border-white/10 bg-white/5 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="text-white">Match summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="rounded-2xl border border-white/10 bg-slate-950/35 p-4 text-slate-200">
                  <p className="font-medium text-white">Toss</p>
                  <p className="mt-1">
                    {getTeamById(match, match.tossWinnerTeamId).name} won the toss and chose to {match.tossDecision}.
                  </p>
                </div>
                <div className="rounded-2xl border border-emerald-300/15 bg-emerald-300/10 p-4 text-emerald-50">
                  <div className="flex items-center gap-2 font-medium">
                    <Trophy className="h-4 w-4" />
                    Result
                  </div>
                  <p className="mt-2">{match.status === "completed" ? getMatchResult(match) : "Match still in progress."}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
